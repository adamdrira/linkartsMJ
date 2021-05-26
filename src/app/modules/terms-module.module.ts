
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TermsRoutingModule } from './terms-routing';
import { TermsComponent } from '../terms/terms.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { CommonComponentsModule } from '../modules/common-components.module';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from '../helpers/jwt.interceptor';
import { ErrorInterceptor } from '../helpers/error.interceptor';

@NgModule({
  declarations: [
    TermsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    TermsRoutingModule,
    CommonComponentsModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ]
})
export class TermsModuleModule { }
