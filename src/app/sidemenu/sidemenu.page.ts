import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DriplaneService } from '../driplane.service';
import { Project } from '../driplane.types';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.page.html',
  styleUrls: ['./sidemenu.page.scss'],
})
export class SidemenuPage implements OnInit {
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
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  public projects: Project[];

  constructor(private router: Router, private driplane: DriplaneService) {}

  ngOnInit() {
    this.driplane.getProjects().subscribe((projects) => {
      this.projects = projects;
      this.router.navigate([`/projects/${projects[0].id}`]);
    });
  }
}
