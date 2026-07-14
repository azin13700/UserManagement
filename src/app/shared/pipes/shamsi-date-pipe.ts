import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shamsiDate',
})
export class ShamsiDatePipe implements PipeTransform {

  transform(value: string | Date): string {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(value));
  }

}