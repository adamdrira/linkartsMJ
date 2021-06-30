
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LinkcolabRoutingModule } from './linkcollab-routing';
import { HomeLinkcollabComponent } from '../home-linkcollab/home-linkcollab.component';
import { PopupLinkcollabFiltersComponent } from '../popup-linkcollab-filters/popup-linkcollab-filters.component';


import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule} from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { ApplyModule } from '../modules/apply-module.module';
import { CommonComponentsModule } from './common-components.module';
import { AngularResizedEventModule } from 'angular-resize-event';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from '../helpers/jwt.interceptor';
import { ErrorInterceptor } from '../helpers/error.interceptor';
import { LazyLoadImageModule, LAZYLOAD_IMAGE_HOOKS, ScrollHooks } from 'ng-lazyload-image';



@NgModule({
  declarations: [
    HomeLinkcollabComponent,
    PopupLinkcollabFiltersComponent,
  ],
  imports: [
    CommonModule,
    LinkcolabRoutingModule,
    CommonComponentsModule,
    ApplyModule,
    AngularResizedEventModule,
    MatAutocompleteModule,
    FormsModule,
    MatChipsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDialogModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatNativeDateModule,
    MatTooltipModule,
    LazyLoadImageModule,

  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {
      provide: MatDialogRef,
      useValue: {}
    },
    { provide: LAZYLOAD_IMAGE_HOOKS, useClass: ScrollHooks },
  ]
})
export class LinkcollabModuleModule { }
