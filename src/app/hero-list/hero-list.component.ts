import { Component, OnDestroy, OnInit } from '@angular/core';
import { StoreService } from '../shared/store.service';
import { Store } from '../shared/store';
import { HeroListSlice } from './hero-list.slice';
import { HeroService } from '../shared/hero.service';

@Component({
    selector: 'app-hero-list',
    templateUrl: './hero-list.component.html',
    styleUrls: ['./hero-list.component.css']
})
export class HeroListComponent implements OnInit, OnDestroy {
    slice: HeroListSlice;
    store: Store;

    constructor(storeService: StoreService, private heroService: HeroService) {
        this.store = storeService.store;
    }

    ngOnInit() {
        this.slice = this.store.addSlice('heroList', new HeroListSlice(this.heroService));
        this.store.dispatch(this.slice.loadHeroes.create());
    }

    ngOnDestroy(): void {
        this.store.removeSlice(this.slice);
        this.slice.close();
    }
}
