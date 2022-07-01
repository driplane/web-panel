import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { shareReplay } from 'rxjs/operators';
import { loadProjects, switchProject } from '../project.actions';
import { activeProject, projects } from '../project.selectors';
@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.page.html',
  styleUrls: ['./sidemenu.page.scss'],
})
export class SidemenuPage implements OnInit {
  activeProject$ = this.store.pipe(
    select(activeProject),
    shareReplay(1),
  );

  projects$ = this.store.pipe(
    select(projects),
    shareReplay(1),
  );

  public selectedIndex = 0;
  public appPages = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: 'speedometer',
    },
    {
      title: 'Projects',
      url: '/projects',
      icon: 'paper-plane',
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: 'cog',
    },
  ];

  constructor(
    private router: Router,
    private store: Store
  ) {
  }

  ngOnInit() {
    this.store.dispatch(loadProjects());


    this.projects$.subscribe((projectList) => {
      this.store.dispatch(switchProject({activeProject: projectList[0]}));
    });

    this.activeProject$.subscribe((p) => {
      if (p) {
        this.router.navigate([`/projects/${p.id}`]);
      }
    });
  }

  compareWith(o1, o2) {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }

  switchProject(event) {
    this.store.dispatch(switchProject({activeProject: event.target.value}));
  }
}
