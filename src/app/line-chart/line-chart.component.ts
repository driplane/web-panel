import { Component, ElementRef, Input } from '@angular/core';
import * as Plot from "@observablehq/plot";

@Component({
  selector: 'app-line-chart',
  template: '',
  styleUrls: ['./line-chart.component.scss'],
})
export class LineChartComponent {
  constructor(private element: ElementRef) {}

  @Input()
  set data(data: { time: Date; value: number }[]) {
    if (!data) {
      return;
    }
    this.element.nativeElement.innerHTML = '';
    this.element.nativeElement.append(Plot.plot({
      grid: false,
      height: 150,
      y: {
        axis: null
      },
      x: {
        axis: null
      },
      marks: [
        Plot.areaY(data, {x: "time", y: "value", curve: "monotone-x", fillOpacity: 0.2}),
        Plot.lineY(data, {x: "time", y: "value", curve: "monotone-x"})
      ]
    }));

  }
}
