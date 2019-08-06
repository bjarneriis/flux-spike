import { Hero } from '../shared/hero';
import { ActionCreator, Slice } from '../shared/store';
import { HeroService } from '../shared/hero.service';
import { map } from 'rxjs/operators';

export interface HeroListState {
    heroes: Hero[];
    heroesLoading: boolean;
}

export const initialState = <HeroListState>{
    heroes: [],
    heroesLoading: false
};

export class HeroListSlice extends Slice<HeroListState> {
    heroes$ = this.select(x => x.heroes);
    heroesLoading$ = this.select(x => x.heroesLoading);

    loadHeroes = new ActionCreator('LOAD_HEROES');
    loadHeroesCompleted = new ActionCreator<Hero[]>('LOAD_HEROES_COMPLETED');

    constructor(private _heroService: HeroService) {
        super();

        this.onAction(this.loadHeroes, {
                mutate: (state, action) => {
                    state.heroes = null;
                    state.heroesLoading = true;
                },
                effect: () => {
                    return this._heroService.getList().pipe(
                        map(x => this.loadHeroesCompleted.create(x))
                    );
                }
            });

        this.onAction(this.loadHeroesCompleted, {
                mutate: (state, action) => {
                    state.heroes = action.payload;
                    state.heroesLoading = false;
                }
            });
    }

    cloneState(state: HeroListState): HeroListState {
        return <HeroListState>{
            ...state
        };
    }

    defaultState(): HeroListState {
        return this.cloneState(initialState);
    }
}
