import { Component, OnInit, Input, ChangeDetectorRef, HostListener, Output, EventEmitter, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Writing_Upload_Service } from '../services/writing.service';


declare var $:any;

@Component({
  selector: 'app-thumbnail-album-writing',
  templateUrl: './thumbnail-album-writing.component.html',
  styleUrls: ['./thumbnail-album-writing.component.scss']
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
    @Input() primary_description: string;
    @Input() writing_element: any;
    @Input() now_in_seconds: number;

    //swiper or album
    @Input() state: string;

    date_upload_to_show: string = "";
    thumbnail_picture:SafeUrl;


    selected: boolean = false;
    @Output() elementSelected = new EventEmitter<{id_key:number}>();
    @Output() elementRemoved = new EventEmitter<{id_key:number}>();
    action_in_progress:boolean = false;

    
    @ViewChild("thumbnailRecto", {static:false}) thumbnailRecto: ElementRef;
    @ViewChild("titleElement", {static:false}) titleElement: ElementRef;

    
    @HostListener('window:resize', ['$event'])
    onResize(event) {
      this.resize_writing();
    }


  
  ngOnInit(): void {


    this.user_id = this.writing_element.authorid;

    this.Writing_Upload_Service.retrieve_thumbnail_picture(this.writing_element.name_coverpage).subscribe(r=> {
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.thumbnail_picture = SafeURL;
    }); 

    this.Profile_Edition_Service.retrieve_profile_picture( this.user_id ).subscribe(r=> {
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.profile_picture = SafeURL;
    });


  }


  
  ngAfterViewInit() {
    this.date_upload_to_show = this.get_date_to_show( this.date_in_seconds() );
    this.cd.detectChanges();
    this.resize_writing();

    
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


  date_in_seconds(){
    var uploaded_date = this.writing_element.createdAt.substring(0,this.writing_element.createdAt.length - 5);
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



  //Drawings functions

  //Comic functions
  resize_writing() {
    
    if( this.state == 'album') {
      $('.component-container.album-writing.album').css({'width': this.get_writing_size() +'px'});
    }
  }

  get_comic_size() {
    return ( $('.container-writings').width()/this.writings_per_line() - 2 );
  }

  get_writing_size() {
    return $('.container-writings').width()/this.writings_per_line();
  }


  writings_per_line() {
    var width = window.innerWidth;

    if( width > 1600 ) {
      return 5;
    }
    else if( width > 1200 ) {
      return 5;
    }
    else if( width > 1000) {
      return 4;
    }
    else if( width > 600) {
      return 3;
    }
    else {
      return 2;
    }
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
