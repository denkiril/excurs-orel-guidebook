import { Pipe, PipeTransform } from '@angular/core';
import { SightGeolocation } from '../models/sights.models';

@Pipe({
  name: 'geolocation',
})
export class GeolocationPipe implements PipeTransform {
  transform(value: SightGeolocation | undefined): string {
    const format = (str: string): string => str.substring(0, 9);

    return value ? `${format(value.lat)}, ${format(value.lng)}` : 'нет данных';
  }
}
