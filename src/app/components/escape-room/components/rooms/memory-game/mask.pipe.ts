import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mask',
  standalone: true
})
export class MaskPipe implements PipeTransform {
  transform(value: string): string {
    if (!value || value.length <= 2) return value;

    return value[0] + '*'.repeat(value.length - 2) + value[value.length - 1];

  }
}