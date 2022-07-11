import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { select, Store } from '@ngrx/store';
import * as dayjs from 'dayjs';
import * as tz from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { combineLatest, from, iif, of, Subject, timer } from 'rxjs';
import {
  concatAll, map, share, shareReplay, switchMap, switchMapTo, tap
} from 'rxjs/operators';
import { DriplaneService } from '../driplane.service';
import { Project } from '../driplane.types';
import { activeProject } from '../project.selectors';

dayjs.extend(utc);
dayjs.extend(tz);

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
        switchMapTo(of(range))
      ),
      of(range)
    )),
    map((range) => {
      const diffMap = {
        live: [0, -30], // minutes
        today: [0, 0],
        day: [-1, -1],
        week: [-1, -7],
        month: [-1, -30],
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'previous-month': [-31, -60],
      };
      const [untilDiff, sinceDiff] = diffMap[range];

      const unit = range === 'live' ? 'minute' : 'day';

      const until = dayjs()
        // .utc()
        .add(untilDiff, unit)
        .endOf(unit)
        .toISOString();
      const since = dayjs()
        // .utc()
        .add(sinceDiff, unit)
        .startOf(unit)
        .toISOString();

      return {
        until,
        since,
        range
      };
    })
  );

  project$ = new Subject<Project>();
  activeProject$ = this.store.pipe(select(activeProject), shareReplay(1));

  selection$ = combineLatest([this.dateRange$, this.activeProject$]).pipe(
    map(([{ since, until, range }, project]) => ({
      since,
      until,
      range,
      project,
    })),
  );

  topUrls$ = this.topList('url');
  topHosts$ = this.topList('url_host');
  topBrowsers$ = this.topList('ua_br');
  topSources$ = this.topList('ref_host');
  topDevices$ = this.topList('ua_dv_t');

  pageViews$ = this.selection$.pipe(
    switchMap(({ since, until, range, project }) => this.driplane.getHistogram(project, 'page_view', {
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
      timezone: dayjs.tz.guess()
    })),
    map((items) => items.map(item => ({
      name: item.time,
      value: item.count
    }))),
    shareReplay(1)
  );

  users$ = this.selection$.pipe(
    switchMap(({ since, until, range, project }) => this.driplane.getUniqueTagCounts(project, 'page_view', 'cid', {
      since,
      until,
      interval: ({
        live: 'minute',
        today: 'hour',
        day: 'hour',
        week: 'day',
        month: 'day'
      }[range])
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

  topList(tag: string) {
    return this.selection$.pipe(
      switchMap(({ since, until, project }) =>
        this.driplane.getToplist(project, 'page_view', {
          since,
          until,
          limit: 10,
          tag
        })
      ),
      map((list) => list.map(item => ({
        count: item.count,
        label: item[tag]
      })))
    );
  }

  projectChanged(ev: any) {
    const project = ev.target.value || undefined;
    this.project$.next(project);
  }

  async ngOnInit() {
    this.loading = await this.loadingCtrl.create({
      message: 'Loading...',
    });

    this.progress$.subscribe(() => {
      this.loading.dismiss();
    });

    this.range.setValue('today');
  }
}
