import { Pipe, PipeTransform } from '@angular/core';
import { getName } from 'country-list';

@Pipe({
  name: 'valueFormat',
  standalone: true
})
export class ValueFormatPipe implements PipeTransform {

  transform(value: string, format: 'number' | 'filesize' = 'number', unknownLabel = '(unknown)'): string {
    if (!value) {
      return unknownLabel;
    }

    if (format == 'filesize') {
      const bytes = parseInt(value, 10);
      if (isNaN(bytes)) return value;

      const units = ['B', 'KB', 'MB', 'GB', 'TB'];
      let size = bytes;
      let unitIndex = 0;

      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }

      return `${size.toFixed(1)} ${units[unitIndex]}`;
    }

    if (format === 'number') {
      const num = parseFloat(value);
      if (isNaN(num)) return value;
      return num.toLocaleString();
    }

    return value;
  }

}
