import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { Store, select } from '@ngrx/store';
import { endOfDay, endOfMinute, endOfToday, formatISO, startOfDay, startOfToday, subDays, subMinutes } from 'date-fns';
import { combineLatest, from, iif, of, timer } from 'rxjs';
import {
  catchError,
  concatAll,
  distinctUntilChanged,
  map, share, shareReplay, switchMap, switchMapTo, tap
} from 'rxjs/operators';
import { DriplaneService } from '../driplane.service';
import { addFilter, clearFilter } from '../project.actions';
import { activeFilters, activeProject } from '../project.selectors';
import Logger from '../logger.service';
const log = Logger('page:project');

type Range = 'live'|'today'|'day'|'week'|'month';
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
    })
  );

  activeProject$ = this.store.pipe(select(activeProject), shareReplay(1));

  filters$ = this.store.pipe(select(activeFilters), shareReplay(1));

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

  topUrls$ = this.topList('url_path');
  topHosts$ = this.topList('url_host');
  topBrowsers$ = this.topList('ua_br');
  topSources$ = this.topList('ref_host', { ref_ext: 1 }).pipe(
    map((result) => result.filter(({ label }) => !!label))
  );
  topSourcesUrls$ = this.topList('ref').pipe(
    map((result) => result.filter(({ label }) => !!label))
  );
  topDevices$ = this.topList('ua_dv_t');

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
      value: item.count
    }))),
    shareReplay(1)
  );

  users$ = this.selection$.pipe(
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
      ...filters
    })),
    map((items) => items.map(item => ({
      name: item.time,
      value: item.count
    }))),
    shareReplay(1)
  );

  loading: HTMLIonLoadingElement;

  progress$ = this.selection$.pipe(
    tap((l) => this.loading.present() ),
    switchMapTo(from([
        this.pageViews$,
        this.users$
      ]).pipe(
        concatAll()
      )
    ),
    share()
  );

  constructor(
    private store: Store,
    private driplane: DriplaneService,
    private loadingCtrl: LoadingController
  ) {}

  topList(tag: string, extraFilters = {}) {
    return this.selection$.pipe(
      switchMap(({ since, until, project, filters }) =>
        this.driplane.getToplist(project, 'page_view', {
          since,
          until,
          limit: 10,
          tag,
          ...filters,
          ...extraFilters
        })
      ),
      catchError((error) => {
        log(error.status);
        return of([]);
      }),
      map((list) => list.map(item => ({
        count: item.count,
        label: item[tag]
      }))),
      shareReplay(1)
    );
  }

  hasFilter(key: string) {
    return this.filters$.pipe(
      map((filters) => filters.some(filter => filter.key === key)),
      distinctUntilChanged(),
    );
  }

  async ngOnInit() {
    this.loading = await this.loadingCtrl.create({
      message: 'Loading...',
    });

    this.progress$.subscribe(() => {
      this.loading.dismiss();
    }, (error) => {
      console.log(error);
      this.loading.dismiss('', 'error');
    });

    this.range.setValue('today');
  }

  addFilter(key: string, value: string, label?: string) {
    this.store.dispatch(addFilter({ filter: { key, value, label } }));
  }

  clearFilter(filterKey: string) {
    this.store.dispatch(clearFilter({ filterKey }));
  }
}
