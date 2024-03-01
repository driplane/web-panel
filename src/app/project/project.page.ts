import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { Store, select } from '@ngrx/store';
import { parseISO } from 'date-fns';
import { Observable, combineLatest, forkJoin, iif, of, timer } from 'rxjs';
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
const log = Logger('page:project');

type Range = 'live'|'today'|'day'|'week'|'month';
type EnvType = 'ua_br'|'ua_os';
type DevType = 'ua_dv'|'ua_dv_t'|'ua_dv_v';

@Component({
  selector: 'app-project',
  templateUrl: './project.page.html',
  styleUrls: ['./project.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectPage implements OnInit {
  range = new FormControl<Range>('month');

  range$ = this.range.valueChanges.pipe(
    startWith(this.range.value),
    shareReplay(),
  );

  chartDateFormat$ = this.range$.pipe(
    map((range) => {
      switch (range) {
        case 'live':
        case 'today':
        case 'day':
          return 'HH:mm';
        case 'week':
        case 'month':
          return 'dd/MM';
      }
    }),
    shareReplay(),
  );

  chartTimeLabel$ = this.range$.pipe(
    map((range) => {
      switch (range) {
        case 'live':
        case 'today':
        case 'day':
          return 'Time';
        case 'week':
        case 'month':
          return 'Date';
      }
    }),
    shareReplay(),
  );

  dateRange$ = this.range$.pipe(
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
    shareReplay(),
  );

  activeProjectKey$ = this.store.pipe(
    select(activeProjectKeys),
    tap((keys) => { log('activeProjectKeys', keys); }),
    filter((keys) => keys.length > 0),
    map((keys) => keys[0].key),
    shareReplay(),
  );

  filters$ = this.store.pipe(
    select(activeFilters),
    shareReplay(),
  );

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
    shareReplay(),
  );

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

  notOnboardingMode$ = this.onboardingMode$.pipe(
    map((onboarding) => !onboarding),
    shareReplay(),
  );

  topList({ tag, filters: extraFilters = {}, limit = 10, unknownLabel = '(unknown)'}) {
    return this.notOnboardingMode$.pipe(
      filter((notOnboarding) => notOnboarding),
      switchMap(() => this.selection$),
      tap((l) => log('topList Call', tag)),
      switchMap(({ since, until, project, filters }) =>
        this.driplane.getToplist(project, 'page_view', {
          since,
          until,
          limit,
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
        label: item[tag] ? item[tag] : unknownLabel
      }))),
    );
  }

  isVisible(sourceData: Observable<{count, label}[]>, ...keys: string[]) {
    return combineLatest([this.onboardingMode$, this.filters$]).pipe(
      switchMap(([onboarding, filters]) => iif(
        () => onboarding || filters.some(filter => keys.includes(filter.key)),
        of(false),
        of(true)
      )),
      switchMap((visible) => iif(
        () => visible,
        sourceData.pipe(
          map((list) => list.length > 0)
        ),
        of(false)
      )),
    );
  }

  topUrls$ = this.topList({ tag: 'url_path' }).pipe(
    shareReplay(),
  );

  topUrlsVisible$ = this.isVisible(this.topUrls$, 'url_path').pipe(
    shareReplay(),
  );

  topUrlsFull$ = this.topList({ tag: 'url_path', limit: 100 }).pipe(
    shareReplay(),
  );

  topHosts$ = this.topList({ tag: 'url_host' }).pipe(
    shareReplay(),
  );

  topHostsVisible$ = this.isVisible(this.topHosts$, 'url_host').pipe(
    shareReplay(),
  );

  topHostsFull$ = this.topList({ tag: 'url_host', limit: 100 }).pipe(
    shareReplay(),
  );

  envType = new FormControl<EnvType>('ua_br');

  topEnvType$ = this.envType.valueChanges.pipe(
    startWith('ua_br'),
    switchMap((envType) => this.topList({ tag: envType })),
    shareReplay(),
  );

  topEnvTypeVisible$ = this.isVisible(this.topEnvType$, 'ua_br', 'ua_os').pipe(
    shareReplay(),
  );

  topBrowserVersions$ = this.topList({ tag: 'ua_br_v' }).pipe(
    shareReplay(),
  );

  topBrowserVersionsVisible$ = combineLatest([this.onboardingMode$, this.filters$]).pipe(
    switchMap(([onboarding, filters]) => iif(
      () => onboarding || filters.some(filter => filter.key === 'ua_br_'),
      of(false),
      of(filters.some(filter => filter.key === 'ua_br'))
    )),
    switchMap((visible) => iif(
      () => visible,
      this.topBrowserVersions$.pipe(
        map((list) => list.length > 0)
      ),
      of(false)
    )),
    shareReplay(),
  );

  topSources$ = this.topList({ tag: 'ref_host', filters: { ref_ext: 1 }, unknownLabel: '(direct)' }).pipe(
    shareReplay(),
  );
  topSourcesVisible$ = this.isVisible(this.topSources$, 'ref_host').pipe(
    shareReplay(),
  );

  topSourcesFull$ = this.topList({ tag: 'ref_host', filters: { ref_ext: 1 }, limit: 100, unknownLabel: '(direct)' }).pipe(
    shareReplay(),
  );

  topSourcesUrls$ = this.topList({ tag: 'ref', unknownLabel: '(none)' }).pipe(
    shareReplay(),
  );
  topSourcesUrlsVisible$ = this.isVisible(this.topSourcesUrls$, 'ref').pipe(
    shareReplay(),
  );

  topSourceUrlsFull$ = this.topList({ tag: 'ref', limit: 100, unknownLabel: '(none)' }).pipe(
    shareReplay(),
  );

  devType = new FormControl<DevType>('ua_dv_t');

  topDevType$ = this.devType.valueChanges.pipe(
    startWith('ua_dv_t'),
    switchMap((devType) => this.topList({ tag : devType })),
    shareReplay(),
  )

  topDevTypeVisible$ = this.isVisible(this.topDevType$, 'ua_dv_t', 'ua_dv', 'ua_dv_v').pipe(
    shareReplay(),
  );

  // PAGEVIEWS
  pageViews$ = this.notOnboardingMode$.pipe(
    filter((notOnboarding) => notOnboarding),
    switchMap(() => this.selection$),
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
  users$ = this.notOnboardingMode$.pipe(
    filter((notOnboarding) => notOnboarding),
    switchMap(() => this.selection$),
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

  totalUserCount$ = this.notOnboardingMode$.pipe(
    filter((notOnboarding) => notOnboarding),
    switchMap(() => this.selection$),
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
  }

  hasFilter(...keys: string[]) {
    return this.filters$.pipe(
      map((filters) => filters.some(filter => keys.includes(filter.key))),
      // tap((result) => log('hasFilter', keys, result)),
      distinctUntilChanged(),
      shareReplay(),
    );
  }

  addFilter(key: string, value: string, label?: string) {
    this.store.dispatch(addFilter({ filter: { key, value, label } }));
  }

  clearFilter(filterKey: string) {
    this.store.dispatch(clearFilter({ filterKey }));
  }
}
