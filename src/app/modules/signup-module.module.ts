
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignupRoutingModule } from './signup-routing';
import { SignupComponent } from '../signup/signup.component';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule} from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSliderModule } from '@angular/material/slider';
import { CommonComponentsModule } from './common-components.module';
import { AngularResizedEventModule } from 'angular-resize-event';


/*import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { faInstagram} from '@fortawesome/free-brands-svg-icons';
import { faInstagramSquare} from '@fortawesome/free-brands-svg-icons';
import { faFacebook} from '@fortawesome/free-brands-svg-icons';
import { faFacebookSquare } from '@fortawesome/free-brands-svg-icons';
import { faFacebookF } from '@fortawesome/free-brands-svg-icons/faFacebookF';
import { faRedditAlien } from '@fortawesome/free-brands-svg-icons/faRedditAlien';
import { faTumblr } from '@fortawesome/free-brands-svg-icons/faTumblr';
import { faPinterestP } from '@fortawesome/free-brands-svg-icons/faPinterestP';

import { faLink } from '@fortawesome/free-solid-svg-icons/faLink';

const icons = [
  faFacebookF, faFacebook,faFacebookSquare,faInstagram, faInstagramSquare,faPinterestP, faRedditAlien, faTumblr, faLink
];
*/


import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from '../helpers/jwt.interceptor';
import { ErrorInterceptor } from '../helpers/error.interceptor';
import { LazyLoadImageModule, LAZYLOAD_IMAGE_HOOKS, ScrollHooks } from 'ng-lazyload-image';



@NgModule({
  declarations: [
    SignupComponent,
  ],
  imports: [
    CommonModule,
    SignupRoutingModule,
    CommonComponentsModule,
    AngularResizedEventModule,
    FormsModule,
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
    MatSlideToggleModule,
    MatSliderModule,
    MatDatepickerModule,
    LazyLoadImageModule,
    MatChipsModule,
    MatAutocompleteModule,
    //FontAwesomeModule,
    
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {
      provide: MatDialogRef,
      useValue: {}
    },
    MatDatepickerModule,
    { provide: LAZYLOAD_IMAGE_HOOKS, useClass: ScrollHooks },
  ]
})
export class SignupModuleModule { 
  /*constructor(iconLibrary: FaIconLibrary) {
    iconLibrary.addIcons(...icons);
  }*/
}
