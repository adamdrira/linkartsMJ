import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LinkartsRoutingModule } from './linkarts-routing';

import { FavoritesComponent } from '../favorites/favorites.component';
import { HomeLinkartsComponent } from '../home-linkarts/home-linkarts.component';
import { MediaComicsComponent } from '../media-comics/media-comics.component';
import { MediaDrawingsComponent } from '../media-drawings/media-drawings.component';
import { MediaWritingsComponent } from '../media-writings/media-writings.component';
import { RecommendationsComponent } from '../recommendations/recommendations.component';
import { StoriesComponent } from '../stories/stories.component';
import { SubscribingsComponent } from '../subscribings/subscribings.component';
import { SubscribingsSeeMoreComponent } from '../subscribings-see-more/subscribings-see-more.component';
import { TrendingsComponent } from '../trendings/trendings.component';



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
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatExpansionModule } from '@angular/material/expansion';
import { ToastrModule } from 'ngx-toastr';

import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AngularResizedEventModule } from 'angular-resize-event';
import { NgxMasonryModule } from 'ngx-masonry';
import { ShareButtonsPopupModule } from 'ngx-sharebuttons/popup';
import { ShareModule } from 'ngx-sharebuttons';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faFacebookSquare } from '@fortawesome/free-brands-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faTwitterSquare } from '@fortawesome/free-brands-svg-icons';
import { faPinterest } from '@fortawesome/free-brands-svg-icons';
import { faPinterestP } from '@fortawesome/free-brands-svg-icons';
import { faInstagramSquare } from '@fortawesome/free-brands-svg-icons';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { faLink} from '@fortawesome/free-solid-svg-icons';
import { faCheck} from '@fortawesome/free-solid-svg-icons';
import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';
import { ShareButtonModule } from 'ngx-sharebuttons/button';
import { LazyLoadImageModule, LAZYLOAD_IMAGE_HOOKS, ScrollHooks  } from 'ng-lazyload-image'; 


import { CommonComponentsModule } from '../modules/common-components.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from '../helpers/jwt.interceptor';
import { ErrorInterceptor } from '../helpers/error.interceptor';

const icons = [
    faPinterest,
    faPinterestP,
    faTwitterSquare,
    faFacebookSquare,
    faCheck,
    faLinkedinIn,
    faLinkedin,
    faLink,
    faInstagramSquare,
    faWhatsapp,
  ];
  

@NgModule({
  declarations: [
    HomeLinkartsComponent,
    FavoritesComponent,
    StoriesComponent,
    RecommendationsComponent,
    TrendingsComponent,
    MediaComicsComponent,
    MediaDrawingsComponent,
    MediaWritingsComponent,
    SubscribingsComponent,
    SubscribingsSeeMoreComponent,
  ],
  imports: [
    CommonModule,
    CommonComponentsModule,
    LazyLoadImageModule,
    LinkartsRoutingModule,
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
    DragDropModule,
    MatRadioModule,
    MatExpansionModule,
    MatListModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatTooltipModule,
    NgxMasonryModule,
    ToastrModule.forRoot(),
    NgxChartsModule,
    ShareModule,
    ShareButtonModule,
    ShareButtonsPopupModule,
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
export class LinkartsModuleModule { constructor(iconLibrary: FaIconLibrary) {
    iconLibrary.addIcons(...icons);
  }}
