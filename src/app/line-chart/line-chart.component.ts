import { Component, ElementRef, Input } from '@angular/core';
import * as Plot from "@observablehq/plot";
import { format } from 'date-fns';

@Component({
  selector: 'app-line-chart',
  template: '',
  styleUrls: ['./line-chart.component.scss'],
})
export class LineChartComponent {
  constructor(private element: ElementRef) {}

  @Input() dateFormat: string = 'dd/MM/yy HH:mm';
  @Input() valueLabel: string = 'Value';
  @Input() timeLabel: string = 'Time';
  @Input() valueFormat: string = 'number';

  @Input()
  set data(data: { time: Date; value: number }[]) {
    if (!data) {
      return;
    }

    this.element.nativeElement.innerHTML = '';
    const chart = Plot.plot({
      grid: false,
      height: 150,
      y: {
        axis: null,
        label: this.valueLabel,
      },
      x: {
        axis: null,
        label: this.timeLabel,
      },
      marks: [
        Plot.areaY(data, {x: "time", y: "value", curve: "monotone-x", fillOpacity: 0.2}),
        Plot.lineY(data, {x: "time", y: "value", curve: "monotone-x"}),
        Plot.tip(data, Plot.pointerX({
          x: "time",
          y: "value",
          fontSize: 14,
          format: {
            x: (d) => format(d, this.dateFormat),
            y: (d) => {
              console.log(d, this.valueFormat);
              if (this.valueFormat === 'filesize') {
                const bytes = parseInt(d.toString(), 10);
                if (isNaN(bytes)) return d.toString();

                const units = ['B', 'KB', 'MB', 'GB', 'TB'];
                let size = bytes;
                let unitIndex = 0;

                while (size >= 1024 && unitIndex < units.length - 1) {
                  size /= 1024;
                  unitIndex++;
                }

                console.log(size, units[unitIndex]);

                return `${size.toFixed(1)} ${units[unitIndex]}`;
              }
              return `${d}`;
            },
          }
        }))
      ]
    });

    // Make SVG full size
    chart.removeAttribute('width');
    chart.removeAttribute('height');

    this.element.nativeElement.append(chart);

  }
}
