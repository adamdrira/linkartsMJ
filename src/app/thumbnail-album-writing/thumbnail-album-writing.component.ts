import { Component, OnInit, Input,  Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Writing_Upload_Service } from '../services/writing.service';

import {number_in_k_or_m} from '../helpers/fonctions_calculs';
import { trigger, transition, style, animate } from '@angular/animations';
import { NavbarService } from '../services/navbar.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-thumbnail-album-writing',
  templateUrl: './thumbnail-album-writing.component.html',
  styleUrls: ['./thumbnail-album-writing.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateY(0)', opacity: 0}),
          animate('400ms', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ]
    ),
  ],
})
export class ThumbnailAlbumWritingComponent implements OnInit {

  constructor(
    private sanitizer:DomSanitizer,
    private Profile_Edition_Service:Profile_Edition_Service,
    private Writing_Upload_Service:Writing_Upload_Service,
    private navbar: NavbarService,

    
    ) { 
      navbar.visibility_observer_font.pipe( takeUntil(this.ngUnsubscribe) ).subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
    }

    /*Inputs*/
    user_id: number;
    profile_picture: SafeUrl;
    @Input() author_name: string;
    @Input() pseudo: string;
    @Input() primary_description: string;
    @Input() writing_element: any;
    @Input() now_in_seconds: number;

    //swiper or album
    @Input() state: string;

    date_upload_to_show: string = "";
    thumbnail_picture:SafeUrl;

    viewnumber:string;
    likesnumber:string;
    lovesnumber:string;

    selected: boolean = false;
    @Output() elementSelected = new EventEmitter<{id_key:number}>();
    @Output() elementRemoved = new EventEmitter<{id_key:number}>();
    action_in_progress:boolean = false;

    
    @ViewChild("thumbnailRecto", {static:false}) thumbnailRecto: ElementRef;
    @ViewChild("titleElement", {static:false}) titleElement: ElementRef;


    loaded_thumbnail = false;

  
    show_icon=false;
    ngOnInit() {
      console.log("pseudo thum")
      console.log(this.pseudo)
    this.viewnumber = number_in_k_or_m(this.writing_element.viewnumber)
    this.likesnumber = number_in_k_or_m(this.writing_element.likesnumber)
    this.lovesnumber = number_in_k_or_m(this.writing_element.lovesnumber)

    this.user_id = this.writing_element.authorid;

    this.Writing_Upload_Service.retrieve_thumbnail_picture(this.writing_element.name_coverpage).pipe( takeUntil(this.ngUnsubscribe) ).subscribe(r=> {
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.thumbnail_picture = SafeURL;
      this.loaded_thumbnail = true;
    }); 

    this.Profile_Edition_Service.retrieve_profile_picture( this.user_id ).pipe( takeUntil(this.ngUnsubscribe) ).subscribe(r=> {
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.profile_picture = SafeURL;
      this.loaded_thumbnail = true;
    });


  }


  
  

  async add_or_remove() {
    if( this.action_in_progress ) {
      return;
    }
    this.action_in_progress = true;
    this.selected = !this.selected;

    if( this.selected ) {
      this.elementSelected.emit( {id_key:this.writing_element.writing_id} );
    }
    else {
      this.elementRemoved.emit( {id_key:this.writing_element.writing_id} );
    }

    await this.delay( 400 );
    this.action_in_progress = false;

  }

      
  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
  

  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
