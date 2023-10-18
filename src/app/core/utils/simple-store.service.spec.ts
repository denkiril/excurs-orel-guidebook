import { SimpleStore } from './simple-store';

interface TestState {
  testNumber: number;
  testString: string;
}

const initialTestState: TestState = {
  testNumber: 0,
  testString: '',
};

class TestStore extends SimpleStore<TestState> {
  constructor(initialState: TestState) {
    super(initialState);
  }

  updateState(partialState: TestState): void {
    this.setState(partialState);
  }
}

describe('SimpleStore', () => {
  let store: TestStore;

  beforeEach(() => {
    store = new TestStore(initialTestState);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
    store.state$.subscribe((state: TestState) =>
      expect(state).toBe(initialTestState),
    );
  });

  it('should update state', () => {
    store.updateState({ testNumber: 1, testString: 'test' });

    store.state$.subscribe((state: TestState) =>
      expect(state).toEqual({ testNumber: 1, testString: 'test' }),
    );
  });
});
