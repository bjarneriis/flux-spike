import { QueueSubject } from './queue-subject';
import { BehaviorSubject, Observable } from 'rxjs';
import { Slice } from './slice';
import { Action } from './types';

export class Store {
    private _action$ = new QueueSubject<Action>();
    private _state$ = new BehaviorSubject({});
    private slices: StoreSlices = {};

    get action$(): Observable<Action> {
        return this._action$.asObservable();
    }

    get state$(): Observable<any> {
        return this._state$.asObservable();
    }

    constructor() {
        // Store gets the first subscription to action$ to ensure that state is updated as the first thing
        // every time a new action is received
        this._action$.subscribe(action => this.updateState(action));
    }

    addSlice<T extends Slice<any>>(name: string, slice: T): T {
        if (!slice) {
            throw new Error('slice is null');
        }

        if (this.getSlice(name) !== null) {
            throw new Error('slice already exists');
        }

        this.slices[name] = slice;
        slice.attachToStore(this, name);

        return slice;
    }

    dispatch(action: Action) {
        if (!action) {
            throw new Error('action is null');
        }

        this._action$.next(action);
    }

    getSlice<TSlice extends Slice<any>>(name: string): TSlice {
        return <TSlice>(this.slices[name] || null);
    }

    getSliceName(slice: Slice<any>) {
        for (const sliceName in this.slices) {
            if (this.slices[sliceName] === slice) {
                return sliceName;
            }
        }

        return null;
    }

    hasSlice(slice: Slice<any>): boolean {
        return this.getSliceName(slice) !== null;
    }

    removeSlice(slice: Slice<any>): void {
        if (!slice) {
            throw new Error('name is null');
        }

        const sliceName = this.getSliceName(slice);

        if (! sliceName) {
            return;
        }

        delete this.slices[sliceName];
        slice.detachFromStore();
    }

    private updateState(action: Action): void {
        console.log('*** action:', action);

        const currentState = this._state$.getValue();
        const reducedState = {};

        for (const sliceName in this.slices) {
            const slice = this.slices[sliceName];
            let sliceState = currentState[sliceName];

            if (!sliceState) {
                sliceState = slice.defaultState();
            }

            sliceState = slice.reduce(sliceState, action);
            reducedState[sliceName] = sliceState;
        }

        const hasChanges = this.detectChanges(currentState, reducedState);

        if (hasChanges) {
            console.log('*** state', reducedState);
            this._state$.next(reducedState);
        }
    }

    private detectChanges(objA: any, objB: any): boolean {
        if (objA === objB) {
            return false;
        }

        const objAProps = Object.getOwnPropertyNames(objA);
        const objBProps = Object.getOwnPropertyNames(objB);

        if (objAProps.length !== objBProps.length) {
            return true;
        }

        for (const prop of objAProps) {
            if (objBProps.indexOf(prop) === -1) {
                return true;
            }

            if (objB[prop] !== objA[prop]) {
                return true;
            }
        }

        return false;
    }
}

interface StoreSlices {
    [sliceName: string]: Slice<any>;
}
