import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { Store, select } from '@ngrx/store';
import { endOfDay, endOfMinute, endOfToday, formatISO, startOfDay, startOfToday, subDays, subMinutes } from 'date-fns';
import { combineLatest, forkJoin, from, iif, of, timer } from 'rxjs';
import {
  catchError,
  concatAll,
  concatMap,
  distinctUntilChanged,
  filter,
  map, share,
  shareReplay,
  startWith,
  switchMap, switchMapTo, tap
} from 'rxjs/operators';
import { DriplaneService } from '../driplane.service';
import Logger from '../logger.service';
import { addFilter, clearFilter, loadProjectKeys } from '../state/project/project.actions';
import { activeFilters, activeProject, activeProjectKeys } from '../state/project/project.selectors';
const log = Logger('page:project');

type Range = 'live'|'today'|'day'|'week'|'month';
type EnvType = 'ua_br'|'ua_os';

const perfRanges = {
  ttfb: {
    improve: 800,
    poor: 1800,
  },
  fcp: {
    improve: 1800,
    poor: 3000,
  },
  fid: {
    improve: 100,
    poor: 300,
  },
  inp: {
    improve: 200,
    poor: 500,
  },
  cls: {
    improve: 0.1,
    poor: 0.25,
  },
  lcp: {
    improve: 2500,
    poor: 4000,
  },
}

@Component({
  selector: 'app-project',
  templateUrl: './project.page.html',
  styleUrls: ['./project.page.scss'],
})
export class ProjectPage implements OnInit {
  range = new FormControl<Range>('today');


  dateRange$ = this.range.valueChanges.pipe(
    switchMap((range) => iif(
      () => range === 'live',
      timer(0, 5000).pipe(
        switchMap(() => of(range))
      ),
      of(range)
    )),
    map((range) => {
      const now = new Date();
      const endOfYesterday = endOfDay(subDays(now, 1));

      const diffMap = {
        live: [endOfMinute(now), endOfMinute(subMinutes(now, -30))],
        today: [endOfToday(), startOfToday()],
        day: [endOfYesterday, startOfDay(subDays(now, 1))],
        week: [endOfYesterday, startOfDay(subDays(now, 7))],
        month: [endOfYesterday, startOfDay(subDays(now, 30))],
        previousMonth: [startOfDay(subDays(now, 31)), startOfDay(subDays(now, 60))],
      };
      const [untilDate, sinceDate] = diffMap[range];

      const until = formatISO(untilDate);
      const since = formatISO(sinceDate);

      return {
        until,
        since,
        range
      };
    }),
    shareReplay(),
  );

  activeProject$ = this.store.pipe(
    select(activeProject),
    filter((project) => !!project),
    distinctUntilChanged((prev, next) => prev.id === next.id),
    tap((project) => { log('activeProject', project); }),
  );

  activeProjectKey$ = this.store.pipe(
    select(activeProjectKeys),
    tap((keys) => { log('activeProjectKeys', keys); }),
    filter((keys) => keys.length > 0),
    map((keys) => keys[0].key)
  );

  filters$ = this.store.pipe(select(activeFilters));

  selection$ = combineLatest([this.dateRange$, this.activeProject$, this.filters$]).pipe(
    map(([{ since, until, range }, project, filters]) => ({
      since,
      until,
      range,
      project,
      filters: filters.reduce((acc, curr) => ({
        ...acc,
        [curr.key]: curr.value
      }), {})
    })),
  );

  topUrls$ = this.topList('url_path').pipe(
    shareReplay(),
  );
  topHosts$ = this.topList('url_host').pipe(
    shareReplay(),
  );

  envType = new FormControl<EnvType>('ua_br');

  topEnvType$ = this.envType.valueChanges.pipe(
    startWith('ua_br'),
    switchMap((envType) => this.topList(envType)),
    shareReplay(),
  )
  topBrowsers$ = this.topList('ua_br').pipe(
    shareReplay(),
  );

  topSources$ = this.topList('ref_host', { ref_ext: 1 }).pipe(
    map((result) => result.filter(({ label }) => !!label)),
    shareReplay(),
  );
  topSourcesUrls$ = this.topList('ref').pipe(
    map((result) => result.filter(({ label }) => !!label)),
    shareReplay(),
  );
  topDevices$ = this.topList('ua_dv_t').pipe(
    shareReplay(),
  );

  pageViews$ = this.selection$.pipe(
    switchMap(({ since, until, range, project, filters }) => this.driplane.getHistogram(project, 'page_view', {
      since,
      until,
      op: 'count',
      interval: ({
        live: 'minute',
        today: 'hour',
        day: 'hour',
        week: 'day',
        month: 'day'
      }[range]),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...filters
    })),
    map((items) => items.map(item => ({
      name: item.time,
      value: ~~item.result
    }))),
    shareReplay(),
  );

  private perf(vital: 'ttfb' | 'fcp' | 'fid' | 'inp' | 'cls' | 'lcp', op: 'average' | 'min' | 'max' | 'median') {
    return this.selection$.pipe(
      switchMap(({ since, until, range, project, filters }) => this.driplane.getEventResult<string>(project, 'page_view', op, vital, {
        since,
        until,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...filters
      })),
      map((result) => {
        const value = parseFloat(result);
        return {
          value,
          state: value < perfRanges.ttfb.improve ? 'good' : value > perfRanges.ttfb.poor ? 'poor' : 'improve'
        };
      }),
      shareReplay(),
    );
  }

  perfTTFBMin$ = this.perf('ttfb', 'min');
  perfTTFBMax$ = this.perf('ttfb', 'max');
  perfTTFBMed$ = this.perf('ttfb', 'median');

  perfTTFBAvg$ = this.perf('ttfb', 'average');
  perfFCPAvg$ = this.perf('fcp', 'average');
  perfFIDAvg$ = this.perf('fid', 'average');
  perfINPAvg$ = this.perf('inp', 'average');
  perfCLSAvg$ = this.perf('cls', 'average');
  perfLCPAvg$ = this.perf('lcp', 'average');

  totalPageCount$ = this.pageViews$.pipe(
    map((items) => items.reduce((acc, item) => acc + item.value, 0)),
    tap((result) => log('totalPageCount', result)),
  );

  users$ = this.selection$.pipe(
    tap((l) => log('users Call')),
    switchMap(({ since, until, range, project, filters }) => this.driplane.getUniqueTagCounts(project, 'page_view', 'cid', {
      since,
      until,
      interval: ({
        live: 'minute',
        today: 'hour',
        day: 'hour',
        week: 'day',
        month: 'day'
      }[range]),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...filters
    }).pipe(
      tap((result) => log('users', result)),
    )),
    map((items) => items.map(item => ({
      name: item.time,
      value: ~~item.result
    }))),
    shareReplay(),
  );

  totalUserCount$ = this.users$.pipe(
    map((items) => items.reduce((acc, item) => acc + item.value, 0)),
    tap((result) => log('totalUserCount', result)),
  );

  loading: HTMLIonLoadingElement;

  onboardingMode$ = this.selection$.pipe(
    switchMap(({ project }) => this.driplane
      .getTotalCounts<string>(project, 'page_view', {
        since: '-3M'
      }).pipe(
        catchError((error) => {
          log('No data', error);
          return of("0");
        })
      )),
    tap((result) => log('onboardingMode', result)),
    map((result) => ~~(result) === 0),
    distinctUntilChanged(),
    switchMap((onboarding) => iif(
      () => onboarding,
      this.activeProject$.pipe(
        tap((project) => {
          if (project) {
            this.store.dispatch(loadProjectKeys({ project }));
          }
        }),
        map(() => true)
      ), of(false))
    ),
    tap((result) => log('onboardingMode', result)),
    shareReplay(),
  );

  topList(tag: string, extraFilters = {}) {
    return this.selection$.pipe(
      switchMap(({ since, until, project, filters }) =>
        this.driplane.getToplist(project, 'page_view', {
          since,
          until,
          limit: 10,
          tag,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          ...filters,
          ...extraFilters
        })
      ),
      catchError((error) => {
        log(error);
        return of([]);
      }),
      map((list) => list.map(item => ({
        count: item.result,
        label: item[tag]
      }))),
    );
  }


  progress$ = this.selection$.pipe(
    tap((l) => this.loading.present() ),
    map(() => forkJoin([
        this.pageViews$,
        this.users$
      ])
    ),
    tap((values) => log('progress', values)),
    share()
  );

  constructor(
    private store: Store,
    private driplane: DriplaneService,
    private loadingCtrl: LoadingController
  ) {

  }

  async ngOnInit() {
    this.loading = await this.loadingCtrl.create({
      message: 'Loading...',
    });

    this.progress$.subscribe({
      next: () => {
        this.loading.dismiss();
      },
      error: (error) => {
        console.log(error);
        this.loading.dismiss('', 'error');
      }
    });

    this.range.setValue('today');
  }

  hasFilter(...keys: string[]) {
    return this.filters$.pipe(
      map((filters) => filters.some(filter => keys.includes(filter.key))),
      distinctUntilChanged(),
    );
  }

  addFilter(key: string, value: string, label?: string) {
    this.store.dispatch(addFilter({ filter: { key, value, label } }));
  }

  clearFilter(filterKey: string) {
    this.store.dispatch(clearFilter({ filterKey }));
  }
}
