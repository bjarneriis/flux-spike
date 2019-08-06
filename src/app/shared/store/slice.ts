import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, skipWhile, switchMap, takeUntil } from 'rxjs/operators';
import { Store } from './store';
import { Action, ActionCreator, ActionHandler, EffectFn, MutateFn } from './types';

export abstract class Slice<TState> {
    private readonly _action$ = new Subject<Action>();
    private readonly reducers: ((state: TState, action: Action) => TState)[] = [];
    private readonly _state$: BehaviorSubject<TState>;
    private _store: Store = null;
    private storeAbandon: Subject<any>;

    protected constructor() {
        this._state$ = new BehaviorSubject<TState>(this.defaultState());
    }

    onAction<TPayload = any>(actionCreator: ActionCreator, handler: ActionHandler<TState, TPayload>)
    onAction<TPayload = any>(typeId: string, handler: ActionHandler<TState, TPayload>)
    onAction<TPayload = any>(typeIds: ActionCreator | string | string[], handler: ActionHandler<TState, TPayload>) {
        if (! typeIds) {
            throw new Error('Action type identification must be provided');
        }

        if (typeof typeIds === 'object') {
            typeIds = [(<ActionCreator>typeIds).typeId];
        } else if (typeof typeIds === 'string') {
            typeIds = [<string>typeIds];
        }

        if (typeIds.length === 0) {
            throw new Error('At least one action type identification must be provided');
        }

        if (!handler) {
            throw new Error('handler is null');
        }

        if (!handler.mutate && !handler.effect) {
            throw new Error('handler has neither mutate or effect');
        }

        if (handler.mutate) {
            this.addReducer<TPayload>(typeIds, handler.mutate);
        }

        if (handler.effect) {
            this.addEffect<TPayload>(typeIds, handler.effect);
        }
    }

    abstract cloneState(state: TState): TState;

    close() {
        this._action$.complete();
        this._state$.complete();
    }

    abstract defaultState(): TState;

    public reduce(state: TState, action: Action): TState {
        let reducedState = state;

        for (const reducer of this.reducers) {
            reducedState = reducer(reducedState, action);
        }

        return reducedState;
    }

    public select<TValue>(fn: (state: TState) => TValue): Observable<TValue> {
        return this._state$.pipe(
            map<TState, TValue>(fn),
            distinctUntilChanged()
        );
    }

    public selectOneFromArrayByKey<TValue, TKey>(
        arraySelectFn: (state: TState) => TValue[],
        arrayItemKeySelectFn: (item: TValue) => TKey,
        keySelectFn: (state: TState) => TKey): Observable<TValue> {

        const keySelector = this.select(keySelectFn);
        const arraySelector = this.select(arraySelectFn);

        return combineLatest(keySelector, arraySelector).pipe(
            map(([key, array]) => {
                if (!key || !array) {
                    return null;
                }

                const result = array.filter(item => arrayItemKeySelectFn(item) === key)[0];
                return result ? result : null;
            })
        );
    }

    private addReducer<TPayload = any>(typeIds: string[], mutate: MutateFn<TState, TPayload>): void {
        const reducer = (state: TState, action: Action) => {
            const match = typeIds.filter(x => x === action.typeId).length !== 0;

            if (!match) {
                return state;
            }

            const reducedState = this.cloneState(state);
            mutate(reducedState, action);
            return reducedState;
        };

        this.reducers.push(reducer);
    }

    private addEffect<TPayload>(typeIds: string[], effect: EffectFn<TPayload>): void {
        this._action$
            .pipe(
                filter(action => typeIds.filter(x => action.typeId === x).length !== 0),
                map(action => <Action<TPayload>>(action)),
                switchMap(action => effect(action))
            )
            .subscribe(x => {
                if (!this._store) {
                    return;
                }

                this._store.dispatch(x);
            });
    }

    public attachToStore(store: Store, name: string): void {
        if (this._store) {
            throw new Error('Already attached to a store');
        }

        if (!store.hasSlice(this)) {
            throw new Error('Slice has not been added to store. Use store.addSlice');
        }

        this._store = store;
        this.storeAbandon = new Subject();

        this._store.action$
            .pipe(
                takeUntil(this.storeAbandon)
            )
            .subscribe(x => this._action$.next(x));

        this._store.state$
            .pipe(
                takeUntil(this.storeAbandon),
                skipWhile(x => !x[name]),
                map(x => <TState>(x[name])),
                distinctUntilChanged()
            )
            .subscribe(x => this._state$.next(x));
    }

    public detachFromStore(): void {
        if (!this._store) {
            throw new Error('Not attached to a store');
        }

        if (this._store.hasSlice(this)) {
            throw new Error('Slice has not been removed from store. Use store.removeSlice');
        }

        this.storeAbandon.next();
        this.storeAbandon = null;
        this._store = null;
    }
}
