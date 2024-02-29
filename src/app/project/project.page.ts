import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { Store, select } from '@ngrx/store';
import { combineLatest, forkJoin, iif, of, timer } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map, share,
  shareReplay,
  startWith,
  switchMap,
  tap
} from 'rxjs/operators';
import { DriplaneService } from '../driplane.service';
import Logger from '../logger.service';
import { addFilter, clearFilter, loadProjectKeys } from '../state/project/project.actions';
import { activeFilters, activeProject, activeProjectKeys } from '../state/project/project.selectors';
import { parseISO } from 'date-fns';
const log = Logger('page:project');

type Range = 'live'|'today'|'day'|'week'|'month';
type EnvType = 'ua_br'|'ua_os';
type DevType = 'ua_dv'|'ua_dv_t'|'ua_dv_v';

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
      timer(0, 60000).pipe(
        switchMap(() => of(range))
      )
    )),
    map((range) => {
      const diffMap = {
        live: ['now', '-30m'],
        today: ['now', '-0d/d'],
        day: ['-0d/d', '-1d/d'],
        week: ['-0d/d', '-7d/d'],
        month: ['-0d/d', '-30d/d'],
        previousMonth: ['-30/d', '-60d/d'],
      };

      const [until, since] = diffMap[range];

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

  topList({ tag, filters: extraFilters = {}, unknownLabel = '(unknown)'}) {
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
      map((result) => result.map(({ label, count }) => ({
        label: !!label ? label : unknownLabel,
        count
      }))),
    );
  }

  topUrls$ = this.topList({ tag: 'url_path' }).pipe(
    shareReplay(),
  );
  topHosts$ = this.topList({ tag: 'url_path' }).pipe(
    shareReplay(),
  );

  envType = new FormControl<EnvType>('ua_br');

  topEnvType$ = this.envType.valueChanges.pipe(
    startWith('ua_br'),
    switchMap((envType) => this.topList({ tag: envType })),
    shareReplay(),
  );

  topBrowserVersions$ = this.topList({ tag: 'ua_br_v' }).pipe(
    shareReplay(),
  );

  topSources$ = this.topList({ tag: 'ref_host', filters: { ref_ext: 1 }, unknownLabel: '(direct)' }).pipe(
    shareReplay(),
  );
  topSourcesUrls$ = this.topList({ tag: 'ref', unknownLabel: '(none)' }).pipe(
    shareReplay(),
  );

  devType = new FormControl<DevType>('ua_dv_t');

  topDevType$ = this.devType.valueChanges.pipe(
    startWith('ua_dv_t'),
    switchMap((devType) => this.topList({ tag : devType })),
    shareReplay(),
  )

  // PAGEVIEWS
  pageViews$ = this.selection$.pipe(
    switchMap(({ since, until, range, project, filters }) => this.driplane.getTotalCounts(project, 'page_view', {
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
    })),
    shareReplay(),
  );

  pageViewResult$ = this.pageViews$.pipe(
    map(({result}) => result.map(item => ({
      time: parseISO(item.time),
      value: ~~item.result
    }))),
  )

  pageViewCount$ = this.pageViewResult$.pipe(
    map((items) => items.reduce((acc, item) => acc + item.value, 0)),
    tap((result) => log('pageViewCount', result)),
  );

  pageViewQuery$ = this.pageViews$.pipe(
    map(({query}) => query),
  );

  totalPageCount$ = this.pageViewResult$.pipe(
    map((items) => items.reduce((acc, item) => acc + item.value, 0)),
    tap((result) => log('totalPageCount', result)),
  );

  // VISITORS
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
    map(({ result }) => result.map(item => ({
      time: parseISO(item.time),
      value: ~~item.result
    }))),
    shareReplay(),
  );

  totalUserCount$ = this.selection$.pipe(
    switchMap(({ since, until, project, filters }) => this.driplane.getUniqueTagCounts<string>(project, 'page_view', 'cid', {
      since,
      until,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...filters
    })),
    map(({result}) => ~~result),
    tap((result) => log('totalUserCount', result)),
  );

  // PERFORMANCE
  private perf(vital: 'ttfb' | 'fcp' | 'fid' | 'inp' | 'cls' | 'lcp', op: 'average' | 'min' | 'max' | 'median') {
    return this.selection$.pipe(
      switchMap(({ since, until, project, filters }) => this.driplane.getEventResult<string>(project, 'page_view', op, vital, {
        since,
        until,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...filters
      })),
      map(({result}) => {
        let value = parseFloat(result);
        if (vital === 'cls') {
          value = value / 10000;
        }

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

        const { improve, poor } = perfRanges[vital];
        const poorRange = 10;
        const rate = poor / (100 - poorRange);
        return {
          value,
          state: value < improve ? 'good' : value > poor ? 'poor' : 'improve',
          percentages: {
            good: improve / rate,
            improve: 90 - (improve / rate),
            poor: 10,
            value: Math.min(value / rate, 100)
          }
        };
      }),
      tap((result) => log('perf', vital, op, result)),
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

  loading: HTMLIonLoadingElement;

  onboardingMode$ = this.selection$.pipe(
    switchMap(({ project }) => this.driplane
      .getTotalCounts<string>(project, 'page_view', {
        since: '-3M'
      }).pipe(
        catchError((error) => {
          log('No data', error);
          return of({result: "0" });
        })
      )),
    tap((result) => log('onboardingMode', result)),
    map(({result}) => ~~(result) === 0),
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
