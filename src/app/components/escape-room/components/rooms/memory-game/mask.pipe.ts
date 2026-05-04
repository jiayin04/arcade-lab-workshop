import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mask',
  standalone: true
})
// TODO: WORKSHOP (QUIZ) - Custom Pipes
// 1. We want to hide most characters of the string to make the game harder.
// 2. Implement the `transform` method below.
// 3. For example, if value is "component", return "c*******t".
export class MaskPipe implements PipeTransform {
  transform(value: string): string {
    if (!value || value.length <= 2) return value;
    
    return value; // Replace this with the masked value
  }
}
