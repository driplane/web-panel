import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { shareReplay } from 'rxjs/operators';
import { loadProjects } from '../project.actions';
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

  constructor(
    private router: Router,
    private store: Store
  ) {
  }

  ngOnInit() {
    this.store.dispatch(loadProjects());

    // let activeProjectSelected = false;

    // this.activeProject$.subscribe(() => {
    //   activeProjectSelected = true;
    // });

    // if(this.route.firstChild) {
    //   this.route.firstChild.params.subscribe((params) => {
    //     console.log(params);
    //   });
    // }

    // this.projects$.subscribe((projectList) => {
    //   if (!activeProjectSelected) {
    //     this.store.dispatch(switchProject({activeProject: projectList[0]}));
    //     this.router.navigate([`/projects/${projectList[0].id}`]);
    //   }
    // });

    // this.activeProject$.subscribe((p) => {
    //   if (p) {
    //     this.router.navigate([`/projects/${p.id}`]);
    //   }
    // });
  }

  compareWith(o1, o2) {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }

  switchProject(event) {
    this.router.navigate([`/projects/${event.target.value.id}`]);
    // this.store.dispatch(switchProject({activeProject: event.target.value}));
  }
}
