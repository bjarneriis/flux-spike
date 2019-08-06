import { Injectable } from '@angular/core';
import { Hero } from './hero';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class HeroService {
    readonly heroes: Hero[] = [
        {id: 11, name: 'Mr. Nice'},
        {id: 12, name: 'Narco'},
        {id: 13, name: 'Bombasto'},
        {id: 14, name: 'Celeritas'},
        {id: 15, name: 'Magneta'},
        {id: 16, name: 'RubberMan'},
        {id: 17, name: 'Dynama'},
        {id: 18, name: 'Dr IQ'},
        {id: 19, name: 'Magma'},
        {id: 20, name: 'Tornado'}
    ];

    constructor() {
    }

    getById(id: number) {
        const hero = this.heroes.filter(x => x.id === id)[0];
        return of(hero).pipe(
            delay(300)
        );
    }

    getList(): Observable<Hero[]> {
        return of(this.heroes).pipe(
            delay(1800)
        );
    }
}

