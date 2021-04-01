import { Component, OnInit, ViewChild, ElementRef, Input, HostListener, Renderer2, EventEmitter, Output, SecurityContext, ChangeDetectorRef, ViewChildren, QueryList, SimpleChanges } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';
import {Profile_Edition_Service} from '../services/profile_edition.service';
import {NotationService} from '../services/notation.service';
import {get_date_to_show} from '../helpers/dates';
import {date_in_seconds} from '../helpers/dates';
import {number_in_k_or_m} from '../helpers/fonctions_calculs';
import {PopupArtworkComponent} from '../popup-artwork/popup-artwork.component';
import { NavbarService } from '../services/navbar.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { merge, fromEvent } from 'rxjs';
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
    private router:Router,
    public dialog: MatDialog,
    private NotationService:NotationService,
    private cd:ChangeDetectorRef,
    private navbar: NavbarService,

  ) { 
    navbar.visibility_observer_font.subscribe(font=>{
      if(font){
        this.show_icon=true;
      }
    })

  }


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resize_comic();
  }

  imageloaded=false;
  @Output() send_number_of_thumbnails = new EventEmitter<object>();
  @Output() send_loaded = new EventEmitter<boolean>();

  @ViewChild("thumbnailRecto", {static:false}) thumbnailRecto: ElementRef;
  @ViewChild("thumbnailVerso", {static:false}) thumbnailVerso: ElementRef;
  @ViewChildren("tags") tags: QueryList<ElementRef>;
  @ViewChild("thumbnail", {static:false}) thumbnail: ElementRef;
  @ViewChild("thumbnail1", {static:false}) thumbnail1: ElementRef;

  //animation
  swiper:any;
  cancelled = 0;
  
  /*Inputs*/
  @Input() item:any;
  @Input() format: string;
  @Input() now_in_seconds: number;
  @Input() width: number;
  @Input() myScrollContainer: any;

  //author
  pseudo:string;
  author_name:string;
  certified_account:boolean;
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

  show_icon=false;
  title_for_url:string;
  scroll:any;

  ngOnChanges(changes: SimpleChanges) {
    if(changes.myScrollContainer ){
      if(this.myScrollContainer){
        this.scroll = merge(
          fromEvent(window, 'scroll'),
          fromEvent(this.myScrollContainer, 'scroll')
        );
      }
    }
  }
  ngOnInit() {
    this.user_id = this.item.authorid
    this.file_name = this.item.name_coverpage
    this.title = this.item.title
    this.title_for_url=this.item.title.replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29')
    this.category = this.item.category
    this.highlight = this.item.highlight.slice(0,290);
    this.firsttag = this.item.firsttag
    this.secondtag = this.item.secondtag
    this.thirdtag = this.item.thirdtag
    this.pagesnumber = this.item.pagesnumber
    this.chaptersnumber = this.item.chaptersnumber
    this.date_upload = this.item.createdAt
    this.bd_id = this.item.bd_id

    if( this.thirdtag != null ) {
      this.cd.detectChanges();
      this.initialize_swiper();
    }
    

    this.Profile_Edition_Service.retrieve_profile_data(this.user_id).subscribe(r=> {
      this.author_name = r[0].firstname + ' ' + r[0].lastname;
      this.pseudo=r[0].nickname;
      this.certified_account=r[0].certified_account;
      this.primary_description=r[0].primary_description;
    });

    this.Profile_Edition_Service.retrieve_profile_picture( this.user_id ).subscribe(r=> {
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.profile_picture = url;
    });


    if(this.format=="one-shot"){
      this.BdOneShotService.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.thumbnail_picture = url;
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
        this.thumbnail_picture = url;
        
      });
      
      this.BdSerieService.retrieve_chapters_by_id(this.item.bd_id).subscribe(s => {
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
      for(let i=0;i<this.tags.toArray().length;i++){
        this.rd.setStyle( this.tags.toArray()[i].nativeElement, "background", "#044fa9" );
        this.rd.setStyle( this.tags.toArray()[i].nativeElement, "border", " 1px solid #044fa9" );
      }
  
    }
    else if( this.category == "Comics" ) {
      this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg,#1a844e,#77d05a)" );
      for(let i=0;i<this.tags.toArray().length;i++){
        this.rd.setStyle( this.tags.toArray()[i].nativeElement, "background", "#1a844e" );
        this.rd.setStyle( this.tags.toArray()[i].nativeElement, "border", " 1px solid #1a844e" );
      }
    }
    else if( this.category == "Manga" ) {
      this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg,#ee5842,#ed973c)" );
      for(let i=0;i<this.tags.toArray().length;i++){
        this.rd.setStyle( this.tags.toArray()[i].nativeElement, "background", "#ee5842" );
        this.rd.setStyle( this.tags.toArray()[i].nativeElement, "border", " 1px solid #ee5842" );
      }
    }
    else if( this.category == "Webtoon" ) {
      this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg,#8051a7,#d262a5)" );
      for(let i=0;i<this.tags.toArray().length;i++){
        this.rd.setStyle( this.tags.toArray()[i].nativeElement, "background", "#8051a7" );
        this.rd.setStyle( this.tags.toArray()[i].nativeElement, "border", " 1px solid #8051a7" );
      }
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
  @ViewChild('comic_container', { read: ElementRef }) comic_container:ElementRef;
  resize_comic() {

    if(this.width){
      this.rd.setStyle(this.comic_container.nativeElement, "width", this.get_comic_size1() + "px");
    }
    else if( $('.container-comics') ) {
      this.rd.setStyle(this.comic_container.nativeElement, "width", this.get_comic_size() + "px");
    }
  }

  get_comic_size() {
    return $('.container-comics').width()/this.comics_per_line();
  }

  get_comic_size1(){
    return this.width/this.comics_per_line1();
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


  comics_per_line1() {
    var n = Math.floor(this.width/250);
    if(this.width < 500 ) {
      this.send_number_of_thumbnails.emit({number:1});
      return 1;
    }
    else if(this.width>0){
      this.send_number_of_thumbnails.emit({number:n});
      return n;
    }

  }
  
 
  loaded(){
    this.imageloaded=true;
    this.send_loaded.emit(true);
    this.cd.detectChanges()
  }

  pp_is_loaded=false;
  pp_loaded(){
   
    this.pp_is_loaded=true;
    this.cd.detectChanges()
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
  

  open_popup(event){
    event.preventDefault(); 
    if (event.ctrlKey) {
      return this.router.navigate(["/artwork-comic/"+this.format+"/"+ this.title_for_url+"/"+this.bd_id]);
    }
    this.dialog.open(PopupArtworkComponent, {
      data: {
        format_input:this.format,
        id_input:this.bd_id,
        title_input:this.title,
        category:'comic',
      }, 
      panelClass:"popupArtworkClass",
    });

    return  this.router.url;
  }

}
