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
import { addFilter, clearFilter, loadProjectKeys, switchDashboardSuccess } from '../state/project/project.actions';
import { activeDashboard, activeFilters, activeProject, activeProjectKeys } from '../state/project/project.selectors';
import { CardData, Dashboard } from '../state/project/project.reducer';
import { LabelFormatPipe } from '../label-format.pipe';
const log = Logger('page:project');

type Range = 'live' | 'today' | '24h' | 'day' | 'week' | 'month';
type EnvType = 'ua_br' | 'ua_os';
type DevType = 'ua_dv' | 'ua_dv_t' | 'ua_dv_v';

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
        case '24h':
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
        case '24h':
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
        '24h': ['now', '-24h'],
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

  dashboard$ = this.activeProject$.pipe(
    switchMap(() => this.store.pipe(
      select(activeDashboard),
    )),
    shareReplay(),
  );

  selection$ = combineLatest([this.dateRange$, this.activeProject$, this.filters$, this.dashboard$]).pipe(
    map(([{ since, until, range }, project, filters, dashboard]) => ({
      since,
      until,
      range,
      project,
      dashboard,
      filters: filters.reduce((acc, curr) => ({
        ...acc,
        [curr.key]: curr.value
      }), {})
    })),
    shareReplay(),
  );

  onboardingMode$ = this.selection$.pipe(
    switchMap(({ project, dashboard }) => this.driplane
      .getTotalCounts<string>(project, dashboard.mainEvent, {
        since: '-3M'
      }).pipe(
        catchError((error) => {
          log('No data', error);
          return of({ result: "0" });
        })
      )),
    tap((result) => log('onboardingMode', result)),
    map(({ result }) => ~~(result) === 0),
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

  topList({ tag, event = 'page_view', filters: extraFilters = {}, limit = 10 }) {
    return this.notOnboardingMode$.pipe(
      filter((notOnboarding) => notOnboarding),
      switchMap(() => this.selection$),
      tap((l) => log('topList Call', tag)),
      switchMap(({ since, until, project, filters }) =>
        this.driplane.getEventResult(project, event, 'count', {
          since,
          until,
          limit,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          group_by: tag,
          order_by: 'result',
          order_by_dir: 'desc',
          ...filters,
          ...extraFilters
        })
      ),
      catchError((error) => {
        log(error);
        return of({ result: [] });
      }),
      map((res) => res.result),
      map((list) => list.map(item => ({
        count: item.result,
        label: item[tag]
      }))),
    );
  }

  isVisible(sourceData: Observable<{ count, label }[]>, tag: string, parent: string[]) {
    return combineLatest([this.onboardingMode$, this.filters$]).pipe(
      switchMap(([onboarding, filters]) => iif(
        () => onboarding || filters.some(filter => filter.key === tag) || (parent.length > 0 && !filters.some(filter => parent.includes(filter.key))),
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

  totalEventCount$ = this.selection$.pipe(
    switchMap(({ project, dashboard, since, until, filters }) => this.driplane.getEventResult<string>(project, dashboard.mainEvent, 'count', {
      since,
      until,
      ...filters
    })),
    map((response) => response.result),
    shareReplay(),
  );

  // PERFORMANCE
  private perf(vital: 'ttfb' | 'fcp' | 'fid' | 'inp' | 'cls' | 'lcp', op: 'average' | 'min' | 'max' | 'median') {
    return this.selection$.pipe(
      switchMap(({ since, until, project, filters }) => this.driplane.getEventResult<string>(project, 'page_perf', op, {
        since,
        until,
        tag: vital,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...filters
      })),
      map(({ result }) => {
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
    tap((l) => this.loading.present()),
    map(() => forkJoin([
      this.totalEventCount$,
    ])
    ),
    tap((values) => log('progress', values)),
    share()
  );

  constructor(
    private store: Store,
    private driplane: DriplaneService,
    private loadingCtrl: LoadingController,
  ) {

  }

  dashboardCards$ = this.dashboard$.pipe(
    map((dashboard) => dashboard?.cards || []),
    map((cards) => cards.map((card) => {
      const dataGroup = new FormControl<CardData>(card.data[0]);

      const dataGroup$ = dataGroup.valueChanges.pipe(
        startWith(card.data[0]),
        shareReplay(),
      );

      switch (card.style) {
        case 'chart': {
          const timedData$ = this.notOnboardingMode$.pipe(
            filter((notOnboarding) => notOnboarding),
            switchMap(() => combineLatest([this.selection$, dataGroup$])),
            switchMap(([{ since, until, range, project, filters }, card]) => this.driplane.getEventResult(project, card.event, card.op, {
              since,
              until,
              interval: ({
                live: 'minute',
                today: 'hour',
                '24h': 'hour',
                day: 'hour',
                week: 'day',
                month: 'day'
              }[range]),
              tag: card.tag ? card.tag : undefined,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              ...filters
            })),
            map(({ result }) => result.map(item => ({
              time: parseISO(item.time),
              value: ~~item.result
            }))),
            shareReplay(),
          );

          const total$ = this.notOnboardingMode$.pipe(
            filter((notOnboarding) => notOnboarding),
            switchMap(() => combineLatest([this.selection$, dataGroup$])),
            switchMap(([{ since, until, range, project, filters }, card]) => this.driplane.getEventResult<string>(project, card.event, card.op, {
              since,
              until,
              tag: card.tag ? card.tag : undefined,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              ...filters,
              ...(card.filters || {})
            })),
            map((response) => response.result),
            shareReplay(),
          );
          return {
            ...card,
            dataGroup,
            timedData$,
            total$,
            data$: of([]),
            dataFull$: of([]),
            visible$: this.notOnboardingMode$,
          };
        }
        case 'toplist': {

          const data$ = dataGroup$.pipe(
            switchMap((cardData) => this.topList({ event: cardData.event, filters: cardData.filters, tag: cardData.tag }))
          );

          const dataFull$ = dataGroup$.pipe(
            switchMap((cardData) => this.topList({ event: cardData.event, filters: cardData.filters, limit: 1000, tag: cardData.tag }))
          );

          const visible$ = dataGroup$.pipe(
            switchMap((cardData) => this.isVisible(data$, cardData.tag, (card.visible?.parent || [])))
          );

          return {
            ...card,
            dataGroup,
            timedData$: of([]),
            total$: of("0"),
            data$,
            dataFull$,
            visible$,
          };
        }
      }

      return {
        ...card,
        dataGroup: null,
        timedData$: of([]),
        total$: of("0"),
        data$: of([]),
        dataFull$: of([]),
        visible$: this.notOnboardingMode$,
      };
    })),
  );

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

  formatLabel(itemLabel: string, labelFormat: string, unknownLabel: string): string {
    return new LabelFormatPipe().transform(itemLabel, labelFormat, unknownLabel);
  }


  hasFilter(...keys: string[]) {
    return this.filters$.pipe(
      map((filters) => filters.some(filter => keys.includes(filter.key))),
      // tap((result) => log('hasFilter', keys, result)),
      distinctUntilChanged(),
      shareReplay(),
    );
  }

  addFilter(key: string, value: string, label?: string, labelFormat?: string, unknownLabel?: string) {
    const formattedValue = new LabelFormatPipe().transform(value, labelFormat, unknownLabel);

    this.store.dispatch(addFilter({ filter: { key, value, label, formattedValue } }));
  }

  clearFilter(filterKey: string) {
    this.store.dispatch(clearFilter({ filterKey }));
  }
}
