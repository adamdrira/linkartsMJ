import { Component, OnInit, Input, ChangeDetectorRef, HostListener, Output, EventEmitter, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';

import {number_in_k_or_m} from '../helpers/fonctions_calculs';
import { trigger, transition, style, animate } from '@angular/animations';

declare var $:any;


@Component({
  selector: 'app-thumbnail-album-comic',
  templateUrl: './thumbnail-album-comic.component.html',
  styleUrls: ['./thumbnail-album-comic.component.scss'],
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
export class ThumbnailAlbumComicComponent implements OnInit {


  /*Inputs*/
  user_id: number;
  profile_picture: SafeUrl;
  @Input() author_name: string;
  @Input() pseudo: string;
  @Input() primary_description: string;
  @Input() bd_element: any;
  @Input() format: string;
  @Input() now_in_seconds: number;

  //swiper or album
  @Input() state: string;

  thumbnail_picture:SafeUrl;
  date_upload_to_show: string = "";

  viewnumber:string;
  likesnumber:string;
  lovesnumber:string;

  selected: boolean = false;
  @Output() elementSelected = new EventEmitter<{format: string, id_key:number}>();
  @Output() elementRemoved = new EventEmitter<{format: string, id_key:number}>();
  action_in_progress:boolean = false;
  
  loaded_thumbnail = false;

  constructor(
    private cd:ChangeDetectorRef,
    private sanitizer:DomSanitizer,
    private BdOneShotService: BdOneShotService,
    private BdSerieService: BdSerieService,
    private Profile_Edition_Service:Profile_Edition_Service,
    private rd:Renderer2,
    
    
  ) { }

  
  @ViewChild("thumbnailRecto", {static:false}) thumbnailRecto: ElementRef;


  ngOnInit(): void {

    this.viewnumber = number_in_k_or_m(this.bd_element.viewnumber)
    this.likesnumber = number_in_k_or_m(this.bd_element.likesnumber)
    this.lovesnumber = number_in_k_or_m(this.bd_element.lovesnumber)

    this.user_id = this.bd_element.authorid;

    this.Profile_Edition_Service.retrieve_profile_picture( this.user_id ).subscribe(r=> {
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.profile_picture = SafeURL;

      this.loaded_thumbnail = true;
    });
    
    if(this.format=="one-shot"){
      this.BdOneShotService.retrieve_thumbnail_picture( this.bd_element.name_coverpage ).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.thumbnail_picture = SafeURL;

        this.loaded_thumbnail = true;
      });  
    };

    if(this.format=="serie"){
      this.BdSerieService.retrieve_thumbnail_picture( this.bd_element.name_coverpage ).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.thumbnail_picture = SafeURL;

        this.loaded_thumbnail = true;
      });  
    };

  }

  ngAfterViewInit() {
    this.date_upload_to_show = this.get_date_to_show( this.date_in_seconds() );
    this.cd.detectChanges();

    /*
    if( this.bd_element.category == "BD" ) {
      this.rd.setStyle( this.thumbnailRecto.nativeElement, "background", "linear-gradient(-220deg,#044fa9,#25bfe6)" );
    }
    else if( this.bd_element.category == "Comics" ) {
      this.rd.setStyle( this.thumbnailRecto.nativeElement, "background", "linear-gradient(-220deg,#1a844e,#77d05a)" );
    }
    else if( this.bd_element.category == "Manga" ) {

      this.rd.setStyle( this.thumbnailRecto.nativeElement, "background", "linear-gradient(-220deg,#ee5842,#ed973c)" );
    }
    else if( this.bd_element.category == "Webtoon" ) {

      this.rd.setStyle( this.thumbnailRecto.nativeElement, "background", "linear-gradient(-220deg,#8051a7,#d262a5)" );
    }*/


  }



  date_in_seconds(){
    var uploaded_date = this.bd_element.createdAt.substring(0,this.bd_element.createdAt.length - 5);
    uploaded_date = uploaded_date.replace("T",' ');
    uploaded_date = uploaded_date.replace("-",'/').replace("-",'/');
    const uploaded_date_in_second = new Date(uploaded_date + ' GMT').getTime()/1000;

   // alert( now_in_seconds - uploaded_date_in_second );
    return ( this.now_in_seconds - uploaded_date_in_second );
  }

  get_date_to_show(s: number) {

   
    if( s < 3600 ) {
      if( Math.trunc(s/60)==1 ) {
        return "Publié il y a 1 minute";
      }
      else {
        return "Publié il y a " + Math.trunc(s/60) + " minutes";
      }
    }
    else if( s < 86400 ) {
      if( Math.trunc(s/3600)==1 ) {
        return "Publié il y a 1 heure";
      }
      else {
        return "Publié il y a " + Math.trunc(s/3600) + " heures";
      }
    }
    else if( s < 604800 ) {
      if( Math.trunc(s/86400)==1 ) {
        return "Publié il y a 1 jour";
      }
      else {
        return "Publié il y a " + Math.trunc(s/86400) + " jours";
      }
    }
    else if ( s < 2419200 ) {
      if( Math.trunc(s/604800)==1 ) {
        return "Publié il y a 1 semaine";
      }
      else {
        return "Publié il y a " + Math.trunc(s/604800) + " semaines";
      }
    }
    else if ( s < 9676800 ) {
      if( Math.trunc(s/2419200)==1 ) {
        return "Publié il y a 1 mois";
      }
      else {
        return "Publié il y a " + Math.trunc(s/2419200) + " mois";
      }
    }
    else {
      if( Math.trunc(s/9676800)==1 ) {
        return "Publié il y a 1 an";
      }
      else {
        return "Publié il y a " + Math.trunc(s/9676800) + " ans";
      }
    }

  }


  async add_or_remove() {
    if( this.action_in_progress ) {
      return;
    }
    this.action_in_progress = true;
    this.selected = !this.selected;

    if( this.selected ) {
      this.elementSelected.emit( {format:this.format, id_key:this.bd_element.bd_id} );
    }
    else {
      this.elementRemoved.emit( {format:this.format, id_key:this.bd_element.bd_id} );
    }

    await this.delay( 400 );
    this.action_in_progress = false;

  }


      
  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }


}
