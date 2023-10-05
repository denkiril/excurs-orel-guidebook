import { BehaviorSubject, Observable } from 'rxjs';

export class SimpleStore<T> {
  private readonly stateSubject: BehaviorSubject<T>;
  readonly state$: Observable<T>;

  protected constructor(initialState: T) {
    this.stateSubject = new BehaviorSubject<T>(initialState);
    this.state$ = this.stateSubject.asObservable();
  }

  protected get state(): Readonly<T> {
    return this.stateSubject.getValue();
  }

  protected setState(state: T): void {
    this.stateSubject.next(state);
  }
}
