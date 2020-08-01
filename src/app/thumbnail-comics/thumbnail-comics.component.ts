import { Component, OnInit, ViewChild, ElementRef, Input, HostListener, Renderer2, EventEmitter, Output, SecurityContext } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';
import {Profile_Edition_Service} from '../services/profile_edition.service';


declare var Swiper: any;
declare var $:any;

@Component({
  selector: 'app-thumbnail-comics',
  templateUrl: './thumbnail-comics.component.html',
  styleUrls: ['./thumbnail-comics.component.scss']
})


export class ThumbnailComicsComponent implements OnInit {

  constructor(
    private sanitizer:DomSanitizer,
    private BdOneShotService: BdOneShotService,
    private Profile_Edition_Service:Profile_Edition_Service,
    private BdSerieService: BdSerieService,
    private rd:Renderer2,
    

  ) { }


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resize_width();
    this.resize_comic();
  }


  @Output() send_number_of_thumbnails = new EventEmitter<object>();
  @Output() send_loaded = new EventEmitter<boolean>();

  @ViewChild("thumbnailRecto", {static:false}) thumbnailRecto: ElementRef;
  @ViewChild("thumbnailVerso", {static:false}) thumbnailVerso: ElementRef;
  @ViewChild("thumbnail", {static:false}) thumbnail: ElementRef;
  @ViewChild("thumbnail1", {static:false}) thumbnail1: ElementRef;

  //animation
  swiper:any;
  cancelled = 0;
  
  /*Inputs*/
  @Input() item:any;
  @Input() format: string;
  @Input() now_in_seconds: number;

  //author
  pseudo:string;
  author_name:string;
  profile_picture: SafeUrl;
  primary_description:string;
  user_id: number;

  //comic
  bd_id: string;
  file_name: string;
  title: string;
  category: string;
  highlight: string;
  firsttag: string;
  secondtag: string;
  thirdtag: string;
  pagesnumber: number;
  viewnumber: string;
  likesnumber: string;
  lovesnumber: string;
  thumbnail_picture:SafeUrl;
  chaptersnumber: number;
  date_upload: string;
  date_upload_to_show: string;
  




  ngOnInit() {
    this.user_id = this.item.authorid
    this.file_name = this.item.name_coverpage
    this.title = this.item.title
    this.category = this.item.category
    this.highlight = this.item.highlight
    this.firsttag = this.item.firsttag
    this.secondtag = this.item.secondtag
    this.thirdtag = this.item.thirdtag
    this.pagesnumber = this.item.pagesnumber
    this.viewnumber = this.item.viewnumber
    this.likesnumber = this.item.likesnumber
    this.lovesnumber = this.item.lovesnumber
    this.chaptersnumber = this.item.chaptersnumber
    this.date_upload = this.item.createdAt
    this.bd_id = this.item.bd_id
  


    this.Profile_Edition_Service.retrieve_profile_picture( this.user_id ).subscribe(r=> {
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.profile_picture = SafeURL;
    });


    if(this.format=="one-shot"){
      this.BdOneShotService.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.thumbnail_picture = SafeURL;
      });  
    };

    if(this.format=="serie"){
      this.BdSerieService.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.thumbnail_picture = SafeURL;
      });  
    };

    
    
    this.Profile_Edition_Service.retrieve_profile_data(this.user_id).subscribe(r=> {
      this.author_name = r[0].firstname + ' ' + r[0].lastname;
      this.pseudo=r[0].nickname;
      this.primary_description=r[0].primary_description;
    });
    this.date_upload_to_show = this.get_date_to_show( this.date_in_seconds() );
  }

  

  date_in_seconds(){

    var uploaded_date = this.date_upload.substring(0,this.date_upload.length - 5);
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



  ngAfterViewInit() {

    if( this.category == "BD" ) {
      this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg,#044fa9,#25bfe6)" );
    }
    else if( this.category == "Comics" ) {
      this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg,#1a844e,#77d05a)" );
    }
    else if( this.category == "Manga" ) {
      this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg,#ee5842,#ed973c)" );
    }
    else if( this.category == "Webtoon" ) {
      this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg,#8051a7,#d262a5)" );
    }



    this.swiper = new Swiper( this.thumbnail.nativeElement.children[0] , {
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

    
    this.resize_comic();
    
  }

  
  //Comic functions

  resize_comic() {

    if( $('.container-comics') ) {
      $('.comic-container').css({'width': this.get_comic_size() +'px'});
    }
  }

  get_comic_size() {
    return $('.container-comics').width()/this.comics_per_line();
  }

  comics_per_line() {
    var width = $('.container-comics').width();
    if( width >= 1510 ) {
      this.send_number_of_thumbnails.emit({number:5});
      return 5;
    }
    else if( width >= 1290 ) {
      this.send_number_of_thumbnails.emit({number:4});
      return 4;
    }
    else if( width >= 960) {
      this.send_number_of_thumbnails.emit({number:3});
      return 3;
    }
    else if( width >= 640) {
      this.send_number_of_thumbnails.emit({number:2});
      return 2;
    }
    else {
      this.send_number_of_thumbnails.emit({number:1});
      return 1;
    }
  }

  resize_width(){
    let width = $(".container-fluid").width();
    console.log(width);
    
    if( width <= 700) {
      $(".border-recto").css("box-shadow","none");
      $(".border-verso").css("box-shadow","none");
     }
    else{
      $(".border-recto").css("box-shadow","0 5px 15px rgba(0, 0, 0, 0.25);");
      $(".border-verso").css("box-shadow","0 5px 15px rgba(0, 0, 0, 0.25);");
    }
    
    if( width <= 750) {
      $(".element-book").css("width","240px");
      $(".element-book").css("height","360px");
     }
    else{
      $(".element-book").css("width","280px");
      $(".element-book").css("height","400px");
    }
    
  }

  
  imageloaded=false;
  loaded(){
    this.imageloaded=true;
    this.send_loaded.emit(true);
  }

  pp_is_loaded=false;
  pp_loaded(){
    this.pp_is_loaded=true;
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

  
  


}
