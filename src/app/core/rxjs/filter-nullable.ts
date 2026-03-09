import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export function filterNullable<T>() {
  return (source$: Observable<T | null | undefined>) =>
    source$.pipe(
      filter((value): value is T => value !== null && value !== undefined),
    );
}
