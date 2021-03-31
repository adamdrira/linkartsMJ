

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtworksRoutingModule } from './artworks-routing';

import { PopupArtworkComponent } from '../popup-artwork/popup-artwork.component';
import { PopupCommentsComponent } from '../popup-comments/popup-comments.component';
import { PopupArtworkDataComponent } from '../popup-artwork-data/popup-artwork-data.component';
import { AdPageComponent } from '../ad-page/ad-page.component';
import { ArtworkComicComponent } from '../artwork-comic/artwork-comic.component';
import { ArtworkDrawingComponent } from '../artwork-drawing/artwork-drawing.component';
import { ArtworkWritingComponent } from '../artwork-writing/artwork-writing.component';
import { CommentsComponent } from '../comments/comments.component';
import { CommentElementComponent } from '../comment-element/comment-element.component';

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
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { FileUploadModule } from 'ng2-file-upload';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ToastrModule } from 'ngx-toastr';

import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AngularResizedEventModule } from 'angular-resize-event';
import { NgxMasonryModule } from 'ngx-masonry';


import { CommonComponentsModule } from '../modules/common-components.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from '../helpers/jwt.interceptor';
import { ErrorInterceptor } from '../helpers/error.interceptor';

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
  
  const shareProp = {
    facebook: {
      icon: ['fab', 'facebook-square']
    },
    pinterest: {
      icon: ['fab', 'pinterest-p']
    },
    twitter: {
      icon: ['fab', 'twitter-square']
    },
    whatsapp:{
      icon: ['fab', 'whatsapp']
    }
  };

  
@NgModule({
  declarations: [
    PopupArtworkComponent,
    ArtworkWritingComponent,
    ArtworkComicComponent,
    ArtworkDrawingComponent,
    CommentsComponent,
    CommentElementComponent,
    AdPageComponent,
    PopupArtworkDataComponent,
    PopupCommentsComponent
  ],
  imports: [
    CommonModule,
    CommonComponentsModule,
    ArtworksRoutingModule,
    AngularResizedEventModule,
    FormsModule,
    LazyLoadImageModule,
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
    PdfViewerModule,
    NgxMasonryModule,
    PickerModule,
    EmojiModule,
    FileUploadModule,
    ToastrModule.forRoot(),
    NgxChartsModule,
    ShareModule,
    ShareButtonModule,
    ShareButtonsModule.withConfig({ prop: shareProp }),
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
export class ArtworksModuleModule { 
    constructor(iconLibrary: FaIconLibrary) {
        iconLibrary.addIcons(...icons);
      }
}
