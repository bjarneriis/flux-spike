import { Observable } from 'rxjs';
import { Slice } from './slice';

export interface Action<TPayload = any> {
    typeId: string;
    payload: TPayload;
}

export class ActionCreator<TPayload = any> {
    constructor(public readonly typeId: string) {
    }

    create(payload?: TPayload): Action<TPayload> {
        return <Action<TPayload>>{
            typeId: this.typeId,
            payload: payload
        };
    }
}

export type EffectFn<TPayload> = (action: Action<TPayload>) => Observable<Action<any>>;
export type MutateFn<TState, TPayload> = (state: TState, action: Action<TPayload>) => void;

export interface ActionHandler<TState, TPayload = any> {
    effect?: EffectFn<TPayload>;
    mutate?: MutateFn<TState, TPayload>;
}
