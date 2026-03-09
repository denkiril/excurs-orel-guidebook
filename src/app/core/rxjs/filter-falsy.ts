import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export function filterFalsy<T>() {
  return (source$: Observable<T | null | undefined>) =>
    source$.pipe(filter((value): value is T => !!value));
}
