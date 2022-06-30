import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as dayjs from 'dayjs';
import { combineLatest, Subject } from 'rxjs';
import { combineAll, map, mapTo, switchMap, tap } from 'rxjs/operators';
import { DriplaneService } from '../driplane.service';
import { Project } from '../driplane.types';
import * as utc from 'dayjs/plugin/utc';
dayjs.extend(utc);


@Component({
  selector: 'app-project',
  templateUrl: './project.page.html',
  styleUrls: ['./project.page.scss'],
})
export class ProjectPage implements OnInit {
  selectedRange = 'day';
  selectedProject: Project;

  dateRange = new Subject<any>();
  project = new Subject<Project>();
  projectId: string;
  since: string;
  until: string;

  constructor(
    private driplane: DriplaneService,
    private route: ActivatedRoute
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
      day: [-1, -1],
      week: [-1, -7],
      month: [-1, -30],
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

  ngOnInit() {
    this.route.paramMap.pipe(
      map((paramMap) => paramMap.get('projectId')),
      switchMap(projectId => this.driplane.getProject(projectId))
    ).subscribe((project) => {
      this.project.next(project);
    });

    combineLatest([this.dateRange, this.project])
      .pipe(
        tap(([{ since, until }, project]) => {
          this.projectId = project.id;
          this.since = since;
          this.until = until;
        }),
        switchMap(([{ since, until }, project]) => this.driplane.getToplist(project, 'page_view', {
          since: '-4d',
          until: 'now',
          limit: 10
        }))
      )
      .subscribe((topList) => {
        console.log(topList);
      });

    this.updateRange('day');

    this.route.paramMap.pipe(
      map((paramMap) => paramMap.get('projectId')),
      switchMap(projectId => this.driplane.getProject(projectId))
    ).subscribe((project) => {
      this.project.next(project);
    });
  }
}
