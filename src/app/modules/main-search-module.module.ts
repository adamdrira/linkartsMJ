
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainSearchRoutingModule } from './main-search-routing';
import { MainSearchbarResultsComponent } from '../main-searchbar-results/main-searchbar-results.component';


import { CommonComponentsModule } from './common-components.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from '../helpers/jwt.interceptor';
import { ErrorInterceptor } from '../helpers/error.interceptor';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';




@NgModule({
  declarations: [
    MainSearchbarResultsComponent,
  ],
  imports: [
    CommonModule,
    MainSearchRoutingModule,
    CommonComponentsModule,
   
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {
      provide: MatDialogRef,
      useValue: {}
    },
    MatDatepickerModule,
  ]
})
export class MainSearchModuleModule { }
