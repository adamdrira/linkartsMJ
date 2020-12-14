import { Component, OnInit, HostListener, QueryList, ElementRef, Renderer2, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { Drawings_Onepage_Service} from '../services/drawings_one_shot.service';
import {Profile_Edition_Service} from '../services/profile_edition.service';

import {date_in_seconds} from '../helpers/dates';
import {get_date_to_show} from '../helpers/dates';
import {number_in_k_or_m} from '../helpers/fonctions_calculs';
import { trigger, transition, style, animate } from '@angular/animations';

declare var $:any;

@Component({
  selector: 'app-thumbnail-album-drawing',
  templateUrl: './thumbnail-album-drawing.component.html',
  styleUrls: ['./thumbnail-album-drawing.component.scss'],
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
export class ThumbnailAlbumDrawingComponent implements OnInit {

  constructor(
    private rd: Renderer2,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private Profile_Edition_Service:Profile_Edition_Service,
    private sanitizer:DomSanitizer
    ) {
  }

  cancelled: number;

  thumbnail_picture:SafeUrl;
  /*Inputs*/
  user_id: number;
  file_name: string;
  title: string;
  category: string;
  highlight: string;
  firsttag: string;
  secondtag: string;
  thirdtag: string;
  viewnumber: string;
  likesnumber: string;
  lovesnumber: string;
  thumbnail_color: string;
  pagesnumber: number;
  profile_picture: SafeUrl;  
  date_upload: string;
  date_upload_to_show: string;
  drawing_id: string;

  @Input() item:any;
  @Input() now_in_seconds: number;
  @Input() format: string;
  @Input() author_name:string;
  @Input() primary_description:string;
  @Input() pseudo: string;
 
  
  tagsSplit: string;
  showDrawingDetails:boolean = false;
  

  //swiper or album
  @Input() state: string;
  selected: boolean = false;
  @Output() elementSelected = new EventEmitter<{format: string, id_key:number}>();
  @Output() elementRemoved = new EventEmitter<{format: string, id_key:number}>();
  action_in_progress:boolean = false;


  @Output() pictureUploaded = new EventEmitter<string>();

  loaded_thumbnail = false;

  pp_is_loaded=false;
  pp_loaded(){
    this.pp_is_loaded=true;
  }

  ngOnInit(): void {

    this.user_id = this.item.authorid;
    this.file_name = this.item.name_coverpage;
    this.title = this.item.title;
    this.category = this.item.category;
    this.highlight = this.item.highlight;
    this.firsttag = this.item.firsttag;
    this.secondtag = this.item.secondtag;
    this.thirdtag = this.item.thirdtag;
    this.pagesnumber = this.item.pagesnumber;
    this.viewnumber = number_in_k_or_m(this.item.viewnumber);
    this.likesnumber = number_in_k_or_m(this.item.likesnumber);
    this.lovesnumber = number_in_k_or_m(this.item.lovesnumber);
    this.date_upload = this.item.createdAt;
    this.drawing_id = this.item.writing_id;
    this.thumbnail_color = this.item.thumbnail_color;


    this.Profile_Edition_Service.retrieve_profile_picture( this.user_id ).subscribe(r=> {
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.profile_picture = SafeURL;

      this.loaded_thumbnail = true;
    });


    if(this.format=="one-shot"){
      this.Drawings_Onepage_Service.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.thumbnail_picture = SafeURL;
        this.pictureUploaded.emit("done");
        
      this.loaded_thumbnail = true;
      });  
    };

    if(this.format=="artbook"){
      this.Drawings_Onepage_Service.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.thumbnail_picture = SafeURL;
        this.pictureUploaded.emit("done");
        
        this.loaded_thumbnail = true;
      });  
    };

    this.date_upload_to_show = get_date_to_show( date_in_seconds( this.now_in_seconds, this.date_upload ) );
  }



  @ViewChild("thumbnail", {static:true}) thumbnail: ElementRef;



  showDetails() {
    this.showDrawingDetails=true;
  }

  hideDetails() {
    this.showDrawingDetails=false;
  }


  
      
  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  
  async add_or_remove() {
    if( this.action_in_progress ) {
      return;
    }
    this.action_in_progress = true;
    this.selected = !this.selected;

    if( this.selected ) {
      this.elementSelected.emit( {format:this.format, id_key:this.item.drawing_id} );
    }
    else {
      this.elementRemoved.emit( {format:this.format, id_key:this.item.drawing_id} );
    }

    await this.delay( 400 );
    this.action_in_progress = false;

  }



}
