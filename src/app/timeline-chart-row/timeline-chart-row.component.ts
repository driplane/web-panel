import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-timeline-chart-row',
  templateUrl: './timeline-chart-row.component.html',
  styleUrls: ['./timeline-chart-row.component.scss'],
})
export class TimelineChartRowComponent implements OnInit {
  @Input() label = '';
  @Input() unit: 'number'|'filesize'|'percent' = 'number';

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public lineChartType: ChartType = 'line';

  lineChartData: number[] = [];
  // lineChartLabels: Label[] = [];
  // lineChartColors: Color[] = [
  //   { // grey
  //     backgroundColor: 'rgba(148,159,177,0.2)',
  //     borderColor: 'rgba(148,159,177,1)',
  //     pointBackgroundColor: 'rgba(148,159,177,1)',
  //     pointBorderColor: '#fff',
  //     pointHoverBackgroundColor: '#fff',
  //     pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  //   }
  // ];

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,

    maintainAspectRatio: false,
    // scales: {
    //   x: [{
    //     ticks: {
    //       display: false,
    //       min: 0
    //     }
    //   }],
    //   xAxes: [{
    //     ticks: {
    //       display: false
    //     }
    //   }]
    // },
    // legend: {
    //   display: false
    // },
    // tooltips: {
    //   callbacks: {
    //     title: () => '',
    //     label: (tooltipItem, data) => `${tooltipItem.xLabel}: ${tooltipItem.value}`,

    //   }
    // }
  };


  chartResults = [];

  totalNumber: number;

  yScaleMin: number;
  yScaleMax: number;

  constructor() { }

  @Input()
  set chartData(data: {name: string; value: number}[]) {
    if (!data) {
      return;
    }
    this.lineChartData = data.map(item => item.value);
    // this.lineChartLabels = data.map(item => item.name);

    this.chartResults = data.map(item => ({
      ...item,
      group: this.label
    }));

    this.totalNumber = data.reduce((acc, item) => item.value + acc, 0);
    if (this.unit === 'percent') {
      this.totalNumber = this.totalNumber / data.length;
      this.yScaleMax = 100;
    }
  };

  ngOnInit() {

  }

}
