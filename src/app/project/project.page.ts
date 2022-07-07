import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as dayjs from 'dayjs';
import { combineLatest, Subject } from 'rxjs';
import { combineAll, map, mapTo, switchMap, tap, shareReplay } from 'rxjs/operators';
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
  activeProject$ = this.store.pipe(
    select(activeProject),
    shareReplay(1),
  );

  selectedRange = 'day';
  selectedProject: Project;
  loading = true;
  waitingForEvents = false;

  dateRange = new Subject<any>();
  project = new Subject<Project>();
  projectId: string;
  since: string;
  until: string;

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
    // console.log(range);
    const diffMap = {
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
      message: 'Loading...'
    });

    loading.present();

    combineLatest([this.dateRange, this.activeProject$])
      .pipe(
        tap(([{ since, until }, project]) => {
          // console.log(since, until, project);
          this.projectId = project.id;
          this.since = since;
          this.until = until;
        }),
        switchMap(([{ since, until }, project]) => this.driplane.getToplist(project, 'page_view', {
          since: '-4d',
          until: 'now',
          limit: 10,
          tag: 'url'
        }))
      )
      .subscribe((topList) => {
        // console.log(topList);
        loading.dismiss();
      }, (error) => {
        if (error.status === 404) {
          this.waitingForEvents = true;
        }
        loading.dismiss();
      });

    this.updateRange('day');
  }
}
