import { Component, OnInit, Input, ChangeDetectorRef, HostListener, Output, EventEmitter, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Writing_Upload_Service } from '../services/writing.service';

import {number_in_k_or_m} from '../helpers/fonctions_calculs';
import { trigger, transition, style, animate } from '@angular/animations';

declare var $:any;

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
    private cd:ChangeDetectorRef,
    private sanitizer:DomSanitizer,
    private Profile_Edition_Service:Profile_Edition_Service,
    private rd:Renderer2,
    private Writing_Upload_Service:Writing_Upload_Service,

    
    ) { 

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

  
  ngOnInit(): void {


    this.viewnumber = number_in_k_or_m(this.writing_element.viewnumber)
    this.likesnumber = number_in_k_or_m(this.writing_element.likesnumber)
    this.lovesnumber = number_in_k_or_m(this.writing_element.lovesnumber)

    this.user_id = this.writing_element.authorid;

    this.Writing_Upload_Service.retrieve_thumbnail_picture(this.writing_element.name_coverpage).subscribe(r=> {
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.thumbnail_picture = SafeURL;
      this.loaded_thumbnail = true;
    }); 

    this.Profile_Edition_Service.retrieve_profile_picture( this.user_id ).subscribe(r=> {
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.profile_picture = SafeURL;
      this.loaded_thumbnail = true;
    });


  }


  
  ngAfterViewInit() {
    
    /*
    if( this.writing_element.category == "Illustrated novel" ) {
      this.rd.setStyle( this.thumbnailRecto.nativeElement, "background", "linear-gradient(-220deg,#ee5842,#ed973c)" );
    }
    else if( this.writing_element.category == "Roman" ) {
      this.rd.setStyle( this.thumbnailRecto.nativeElement, "background", "linear-gradient(-220deg,#1a844e,#77d05a)" );
    }
    else if( this.writing_element.category == "Scenario" ) {

      this.rd.setStyle( this.thumbnailRecto.nativeElement, "background", "linear-gradient(-220deg,#8051a7,#d262a5)" );
    }
    else if( this.writing_element.category == "Article" ) {

      this.rd.setStyle( this.thumbnailRecto.nativeElement, "background", "linear-gradient(-220deg,#044fa9,#25bfe6)" );
    }*/


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
  


}
