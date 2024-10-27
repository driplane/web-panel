import { Pipe, PipeTransform } from '@angular/core';
import { getName } from 'country-list';

@Pipe({
  name: 'labelFormat',
  standalone: true
})
export class LabelFormatPipe implements PipeTransform {

  transform(value: string, format: string, unknownLabel = '(unknown)'): string {
    if (!value) {
      return unknownLabel;
    }

    if (format === 'country') {
      return getName(value);
    }

    return value;
  }

}
