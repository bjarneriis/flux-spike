import { Injectable } from '@angular/core';
import { Store } from './store/';

@Injectable({
    providedIn: 'root'
})
export class StoreService {
    store: Store;

    constructor() {
        this.store = new Store();
    }
}
