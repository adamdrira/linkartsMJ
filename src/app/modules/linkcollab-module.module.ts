
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LinkcolabRoutingModule } from './linkcollab-routing';
import { HomeLinkcollabComponent } from '../home-linkcollab/home-linkcollab.component';
import { PopupLinkcollabFiltersComponent } from '../popup-linkcollab-filters/popup-linkcollab-filters.component';


import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CommonComponentsModule } from './common-components.module';
import { AngularResizedEventModule } from 'angular-resize-event';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from '../helpers/jwt.interceptor';
import { ErrorInterceptor } from '../helpers/error.interceptor';




@NgModule({
  declarations: [
    HomeLinkcollabComponent,
    PopupLinkcollabFiltersComponent,
  ],
  imports: [
    CommonModule,
    LinkcolabRoutingModule,
    CommonComponentsModule,
    AngularResizedEventModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatSelectModule,
    MatDialogModule,
    MatSliderModule,
    MatInputModule,
    MatSlideToggleModule,
    MatRadioModule,
    MatListModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatTooltipModule,
   
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
export class LinkcollabModuleModule { }
