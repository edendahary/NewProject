import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AnalyzeComponent } from './analyze/analyze.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'analyze', component: AnalyzeComponent },
  { path: '', redirectTo: 'dashboard',pathMatch:'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
