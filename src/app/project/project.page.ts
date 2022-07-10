import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as dayjs from 'dayjs';
import { combineLatest, Subject } from 'rxjs';
import {
  combineAll,
  map,
  mapTo,
  switchMap,
  tap,
  shareReplay,
  mergeMap,
} from 'rxjs/operators';
import { DriplaneService } from '../driplane.service';
import { Project } from '../driplane.types';
import * as utc from 'dayjs/plugin/utc';
import { LoadingController } from '@ionic/angular';
import { select, Store } from '@ngrx/store';
import { activeProject } from '../project.selectors';

dayjs.extend(utc);

@Component({
  selector: 'app-project',
  templateUrl: './project.page.html',
  styleUrls: ['./project.page.scss'],
})
export class ProjectPage implements OnInit {
  selectedRange = 'day';
  selectedProject: Project;
  loading = true;
  waitingForEvents = false;

  dateRange = new Subject<{ since: string; until: string }>();
  project = new Subject<Project>();

  topUrls = [];
  topReferrers = [];
  topBrowsers = [];
  topPages = [];

  activeProject$ = this.store.pipe(select(activeProject), shareReplay(1));

  selection$ = combineLatest([this.dateRange, this.activeProject$]).pipe(
    map(([{ since, until }, project]) => ({
      since,
      until,
      project,
    }))
  );

  topUrls$ = this.selection$.pipe(
    switchMap(({ since, until, project }) =>
      this.driplane.getToplist(project, 'page_view', {
        since,
        until,
        limit: 10,
        tag: 'url',
      })
    )
  );

  pageViews$ = this.selection$.pipe(
    switchMap(({ since, until, project }) => this.driplane.getHistogram(project, 'page_view', {
      since,
      until,
      op: 'count',
      interval: this.selectedRange === 'day' ? 'hour' : 'day',
      timezone: 'UTC'
    })),
    map((items) => items.map(item => ({
      name: item.time,
      value: item.count
    })))
  );

  constructor(
    private store: Store,
    private driplane: DriplaneService,
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController
  ) {}

  segmentChanged(ev: any) {
    this.updateRange(ev.target.value);
  }

  projectChanged(ev: any) {
    const account = ev.target.value || undefined;
    this.project.next(account);
  }

  updateRange(range) {
    const diffMap = {
      today: [0, 0],
      day: [-1, -1],
      week: [-1, -7],
      month: [-1, -30],
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'previous-month': [-31, -60],
    };
    const [untilDiff, sinceDiff] = diffMap[range];

    const until = dayjs()
      .utc()
      .add(untilDiff, 'day')
      .endOf('day')
      .toISOString();
    const since = dayjs()
      .utc()
      .add(sinceDiff, 'day')
      .startOf('day')
      .toISOString();
    this.dateRange.next({
      until,
      since,
    });
  }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({
      message: 'Loading...',
    });

    // loading.present();

    this.updateRange('day');
  }
}
