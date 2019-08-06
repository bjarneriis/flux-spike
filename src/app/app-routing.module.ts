import { NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { HeroListComponent } from './hero-list/hero-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StoreService } from './shared/store.service';

const routes: Routes = [
    {path: '', redirectTo: '/dashboard', pathMatch: 'full'},
    {path: 'dashboard', component: DashboardComponent},
    {path: 'heroes', component: HeroListComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {

    constructor(private router: Router, private storeService: StoreService) {
    }
}
