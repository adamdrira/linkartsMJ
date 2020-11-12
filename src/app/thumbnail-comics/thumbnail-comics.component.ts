import { Component, OnInit, ViewChild, ElementRef, Input, HostListener, Renderer2, EventEmitter, Output, SecurityContext, ChangeDetectorRef } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';
import {Profile_Edition_Service} from '../services/profile_edition.service';
import {NotationService} from '../services/notation.service';
import {get_date_to_show} from '../helpers/dates';
import {date_in_seconds} from '../helpers/dates';
import {number_in_k_or_m} from '../helpers/fonctions_calculs';


import { Router  } from '@angular/router';


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
    private NotationService:NotationService,
    private router:Router,
    private cd:ChangeDetectorRef,

  ) { }


  @HostListener('window:resize', ['$event'])
  onResize(event) {
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
  recent_chapter=false;
  recent_chapter_retrieved=false;
  date_upload: string;
  date_upload_to_show: string;
  

  marks_retrieved=false;


  ngOnInit() {
    //console.log(this.format)
    this.user_id = this.item.authorid
    this.file_name = this.item.name_coverpage
    this.title = this.item.title
    this.category = this.item.category
    this.highlight = this.item.highlight
    this.firsttag = this.item.firsttag
    this.secondtag = this.item.secondtag
    this.thirdtag = this.item.thirdtag
    this.pagesnumber = this.item.pagesnumber
    this.chaptersnumber = this.item.chaptersnumber
    this.date_upload = this.item.createdAt
    this.bd_id = this.item.bd_id
    //console.log(this.file_name)


    if( this.thirdtag != null ) {
      this.cd.detectChanges();
      this.initialize_swiper();
    }
    

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

      this.NotationService.get_content_marks("comic", 'one-shot', this.bd_id,0).subscribe(r=>{
        //marks
        this.viewnumber =  number_in_k_or_m(r[0].list_of_views.length);
        this.likesnumber = number_in_k_or_m(r[0].list_of_likes.length);
        this.lovesnumber = number_in_k_or_m(r[0].list_of_loves.length);
        this.marks_retrieved=true;
      })
    };

    if(this.format=="serie"){
      this.BdSerieService.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.thumbnail_picture = SafeURL;
        
      });
      
      this.BdSerieService.retrieve_chapters_by_id(this.item.bd_id).subscribe(s => {
        console.log(s[0]);
        let last_week=new Date();
        last_week.setDate(last_week.getDate() - 7);
        let num_last_week= Math.trunc( last_week.getTime()/1000);
        let timestamp=s[0][s[0].length-1].createdAt;
        let num_chapter= this.convert_timestamp_to_number(timestamp);
        if(num_chapter-num_last_week>0){
          this.recent_chapter=true;
        }
        this.recent_chapter_retrieved=true;
      })

      this.NotationService.get_content_marks("comic", 'serie', this.bd_id,0).subscribe(r=>{
        //marks
        this.viewnumber =  number_in_k_or_m(r[0].list_of_views.length);
        this.likesnumber = number_in_k_or_m(r[0].list_of_likes.length);
        this.lovesnumber = number_in_k_or_m(r[0].list_of_loves.length);
        this.marks_retrieved=true;
      })
    };

    
    
    this.Profile_Edition_Service.retrieve_profile_data(this.user_id).subscribe(r=> {
      this.author_name = r[0].firstname + ' ' + r[0].lastname;
      this.pseudo=r[0].nickname;
      this.primary_description=r[0].primary_description;
    });


    //this.date_upload_to_show = get_date_to_show( this.date_in_seconds() );
    this.date_upload_to_show = get_date_to_show( date_in_seconds( this.now_in_seconds, this.date_upload ) );
  }

  
  @ViewChild("swiperCategories") swiperCategories:ElementRef;
  initialize_swiper() {
    this.swiper = new Swiper( this.swiperCategories.nativeElement, {
      speed: 300,
      initialSlide:0,
      spaceBetween:100,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    })
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

    
    this.resize_comic();
    
  }

  
  //Comic functions

  resize_comic() {

    if( $('.container-comics') ) {
      //console.log("resize comics")
      //console.log(this.get_comic_size() +'px')
      $('.comic-container').css({'width': this.get_comic_size() +'px'});
    }
  }

  get_comic_size() {
    return $('.container-comics').width()/this.comics_per_line();
  }

  comics_per_line() {
    var width = $('.container-comics').width();
    var n = Math.floor(width/250);
    if( width < 500 ) {
      this.send_number_of_thumbnails.emit({number:1});
      return 1;
    }
    else if(width>0){
      this.send_number_of_thumbnails.emit({number:n});
      return n;
    }

  }

  
  imageloaded=false;
  loaded(){
    //console.log("thumb laoded")
    this.imageloaded=true;
    this.send_loaded.emit(true);
  }

  pp_is_loaded=false;
  pp_loaded(){
    this.pp_is_loaded=true;
  }
  
  
  get_artwork() {
    return "/artwork-comic/"+this.format+"/"+this.title+"/"+this.bd_id;
    //this.router.navigate([`/artwork-comic/${this.format}/${this.title}/${this.bd_id}`]);
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

  stop(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }


  convert_timestamp_to_number(timestamp){
    
    var uploaded_date = timestamp.substring(0,timestamp.length- 5);
    uploaded_date=uploaded_date.replace("T",' ');
    uploaded_date=uploaded_date.replace("-",'/').replace("-",'/');
    let number = new Date(uploaded_date + ' GMT').getTime()/1000;
    return number
  }
  


}
