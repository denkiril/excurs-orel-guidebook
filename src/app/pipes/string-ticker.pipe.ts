import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stringTicker',
  pure: false,
})
export class StringTickerPipe implements PipeTransform {
  transform(str: string, count: number, ticker: number): string {
    return str.repeat((ticker % count) + 1);
  }
}
