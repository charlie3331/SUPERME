import { Routes } from '@angular/router';
import { AddBoxComponent } from './components/add-box/add-box.component';
import { NewReportComponent } from './components/new-report/new-report.component';
import { StockComponent } from './components/stock/stock.component';
import { SearchReportComponent } from './components/search-report/search-report.component';
import { InfoReportComponent } from './components/info-report/info-report.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
     { path: '', redirectTo: 'home', pathMatch: 'full' },
    {path:'addBox',component:AddBoxComponent},
    {path:'new-report',component:NewReportComponent},
    {path:'stock',component:StockComponent},
    {path:'search-report',component:SearchReportComponent},
    {path:'info-report',component:InfoReportComponent},
    {path:'home',component:HomeComponent}
];
