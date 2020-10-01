import { Component, OnInit, ViewChild, ElementRef, Input, HostListener, Renderer2, EventEmitter, Output } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import {Profile_Edition_Service} from '../services/profile_edition.service';
import {Writing_Upload_Service} from '../services/writing.service';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';

import {get_date_to_show} from '../helpers/dates';
import {date_in_seconds} from '../helpers/dates';

import {number_in_k_or_m} from '../helpers/fonctions_calculs';

declare var Swiper: any;
declare var $:any;

@Component({
  selector: 'app-thumbnail-writing',
  templateUrl: './thumbnail-writing.component.html',
  styleUrls: ['./thumbnail-writing.component.scss']
})
export class ThumbnailWritingComponent implements OnInit {

  constructor(
    private Profile_Edition_Service:Profile_Edition_Service,
    private sanitizer :DomSanitizer,
    private Writing_Upload_Service:Writing_Upload_Service,
    private rd:Renderer2,

    ) { }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
  
      this.resize_writing();
    }

  swiper:any;
  @ViewChild("thumbnail", {static:false}) thumbnail: ElementRef;
  cancelled = 0;

  @ViewChild("thumbnailRecto", {static:false}) thumbnailRecto: ElementRef;
  @ViewChild("thumbnailVerso", {static:false}) thumbnailVerso: ElementRef;

  
  @Output() sendLoaded = new EventEmitter<boolean>();
  
  author_name:string;
  primary_description:string;
  pseudo:string;
  /*Inputs*/

  pdfSrc:SafeUrl;
  buffer:ArrayBuffer;

 
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
  thumbnail_police: string;
  profile_picture: SafeUrl;  
  date_upload: string;
  date_upload_to_show: string;
  writing_id: string;
  format:string;
  thumbnail_picture:SafeUrl;

  @Input() item:any;
  @Input() now_in_seconds: number;
 


 

  ngOnInit() {
    this.user_id = this.item.authorid;
    this.file_name = this.item.name_coverpage;
    this.title = this.item.title;
    this.category = this.item.category;
    this.highlight = this.item.highlight;
    this.firsttag = this.item.firsttag;
    this.secondtag = this.item.secondtag;
    this.thirdtag = this.item.thirdtag;
    this.viewnumber = number_in_k_or_m(this.item.viewnumber)
    this.likesnumber = number_in_k_or_m(this.item.likesnumber)
    this.lovesnumber = number_in_k_or_m(this.item.lovesnumber)
    this.date_upload = this.item.createdAt;
    this.writing_id = this.item.writing_id;
    this.thumbnail_color = this.item.thumbnail_color;
    this.thumbnail_police = this.item.thumbnail_police;
    this.format = this.item.format;
    this.Writing_Upload_Service.retrieve_thumbnail_picture(this.item.name_coverpage).subscribe(r=> {
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.thumbnail_picture = SafeURL;
    }); 

    this.Profile_Edition_Service.retrieve_profile_picture( this.user_id ).subscribe(r=> {
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.profile_picture = SafeURL;
    });
    

    this.Profile_Edition_Service.retrieve_profile_data(Number(this.user_id)).subscribe(r=> {
      this.author_name = r[0].firstname + ' ' + r[0].lastname;
      this.primary_description=r[0].primary_description;
      this.pseudo=r[0].nickname;
    });


    this.date_upload_to_show = get_date_to_show( date_in_seconds( this.now_in_seconds, this.date_upload ) );

  }

  

  ngAfterViewInit() {
    

    if( this.category == "Illustrated novel" ) {
      //this.rd.setStyle( this.thumbnailRecto.nativeElement, "background", "linear-gradient(-220deg,#ee5842,#ed973c)" );
      this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg,#ee5842,#ed973c)" );
    }
    else if( this.category == "Roman" ) {
      //this.rd.setStyle( this.thumbnailRecto.nativeElement, "background", "linear-gradient(-220deg,#1a844e,#77d05a)" );
      this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg,#1a844e,#77d05a)" );
    }
    else if( this.category == "Scenario" ) {

      //this.rd.setStyle( this.thumbnailRecto.nativeElement, "background", "linear-gradient(-220deg,#8051a7,#d262a5)" );
      this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg,#8051a7,#d262a5)" );
    }
    else if( this.category == "Article" ) {

      //this.rd.setStyle( this.thumbnailRecto.nativeElement, "background", "linear-gradient(-220deg,#044fa9,#25bfe6)" );
      this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg,#044fa9,#25bfe6)" );
    }

    else if( this.category == "Poetry" ) {

      //this.rd.setStyle( this.thumbnailRecto.nativeElement, "background", "linear-gradient(-220deg,#044fa9,#25bfe6)" );
      this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg, #fd3c59, #e6a483)" );
    }



    this.swiper = new Swiper( this.thumbnail.nativeElement, {
      effect: 'flip',
      speed: 500,
      keyboard: {
        enabled: false,
      },
      simulateTouch: false
    });

    this.thumbnail.nativeElement.addEventListener('mouseenter', e => {
      this.mouseEnterBook();
    });

    this.thumbnail.nativeElement.addEventListener('mouseleave', e => {
      this.closeBook();
    });

    
    this.resize_writing();
    
  }



  //Drawings functions

  resize_writing() {

    if( $('.container-writings') ) {
      $('.writing-container').css({'width': this.get_writing_size() +'px'});
    }

  }

  get_writing_size() {
    return $('.container-writings').width()/this.writings_per_line();
  }


  writings_per_line() {
    var width = $('.container-writings').width();

    var n = Math.floor(width/250);
    if( width < 500 ) {
      return 1;
    }
    else {
      return n;
    }

  }


  mouseEnterBook() {
    let v0 = this.cancelled;

    (async () => {
      await new Promise( resolve => setTimeout(resolve, 400) );
      if( v0 === this.cancelled && this.swiper.activeIndex == 0 ) {
        this.swiper.slideTo(1);
      }
      else {
        this.swiper.slideTo(0);
        return;
      }
    })();
  }


  closeBook() {
    this.cancelled++;
    this.swiper.slideTo(0);
  }


  imageloaded=false;
  loaded(){
    this.imageloaded=true;
    this.sendLoaded.emit(true);
  }
  
  pp_is_loaded=false;
  pp_loaded(){
    this.pp_is_loaded=true;
  }



}
