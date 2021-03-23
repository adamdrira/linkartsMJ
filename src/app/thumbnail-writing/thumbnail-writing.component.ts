import { Component, OnInit, ViewChild, ElementRef, Input, HostListener, Renderer2, EventEmitter, Output, ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import {Profile_Edition_Service} from '../services/profile_edition.service';
import {Writing_Upload_Service} from '../services/writing.service';
import {NotationService} from '../services/notation.service';
import {get_date_to_show} from '../helpers/dates';
import {date_in_seconds} from '../helpers/dates';
import {number_in_k_or_m} from '../helpers/fonctions_calculs';
import { NavbarService } from '../services/navbar.service';
import { PopupArtworkComponent } from '../popup-artwork/popup-artwork.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
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
    public dialog: MatDialog,
    private NotationService:NotationService,
    private router:Router,
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
  
      this.resize_writing();
    }

  swiper:any;
  @ViewChild("thumbnail", {static:false}) thumbnail: ElementRef;
  cancelled = 0;

  @ViewChild("thumbnailRecto", {static:false}) thumbnailRecto: ElementRef;
  @ViewChild("thumbnailVerso", {static:false}) thumbnailVerso: ElementRef;
  @ViewChild("tags") tags: ElementRef;
  
  @Output() send_number_of_thumbnails = new EventEmitter<object>();
  @Output() sendLoaded = new EventEmitter<boolean>();
  
  author_name:string;
  primary_description:string;
  pseudo:string;
  certified_account:boolean;
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
  total_pages:number;
  thumbnail_picture:SafeUrl;

  @Input() item:any;
  @Input() now_in_seconds: number;
  @Input() width: number;


  marks_retrieved=false;

  show_icon=false;
  ngOnInit() {
    this.user_id = this.item.authorid;
    this.file_name = this.item.name_coverpage;
    this.total_pages=this.item.total_pages;
    this.title = this.item.title;
    this.category = this.item.category;
    this.highlight = this.item.highlight.slice(0,290);
    this.firsttag = this.item.firsttag;
    this.secondtag = this.item.secondtag;
    this.thirdtag = this.item.thirdtag;
    this.date_upload = this.item.createdAt;
    this.writing_id = this.item.writing_id;
    

    

    if( this.thirdtag != null ) {
      this.cd.detectChanges();
      this.initialize_swiper();
    }
    

    this.NotationService.get_content_marks("writing", 'unknown', this.writing_id,0).subscribe(r=>{
      //marks
      this.viewnumber =  number_in_k_or_m(r[0].list_of_views.length);
      this.likesnumber = number_in_k_or_m(r[0].list_of_likes.length);
      this.lovesnumber = number_in_k_or_m(r[0].list_of_loves.length);
      this.marks_retrieved=true;
    }) 


    this.Writing_Upload_Service.retrieve_thumbnail_picture(this.item.name_coverpage).subscribe(r=> {
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.thumbnail_picture = url;
    }); 

    this.Profile_Edition_Service.retrieve_profile_picture( this.user_id ).subscribe(r=> {
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.profile_picture = url;
    });
    

    this.Profile_Edition_Service.retrieve_profile_data(Number(this.user_id)).subscribe(r=> {
      this.author_name = r[0].firstname + ' ' + r[0].lastname;
      this.primary_description=r[0].primary_description;
      this.pseudo=r[0].nickname;
      this.certified_account=r[0].certified_account;
    });


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
 

    if( this.category == "Illustrated novel" ) {
      //this.rd.setStyle( this.thumbnailRecto.nativeElement, "background", "linear-gradient(-220deg,#ee5842,#ed973c)" );
      this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg,#ee5842,#ed973c)" );
      this.rd.setStyle( this.tags.nativeElement, "background", "#ee5842" );
      this.rd.setStyle( this.tags.nativeElement, "border", " 1px solid #ee5842" );
    }
    else if( this.category == "Roman" ) {
      this.rd.setStyle( this.tags.nativeElement, "background", "#1a844e" );
      this.rd.setStyle( this.tags.nativeElement, "border", " 1px solid #1a844e" );
      this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg,#1a844e,#77d05a)" );
    }
    else if( this.category == "Scenario" ) {
      this.rd.setStyle( this.tags.nativeElement, "background", "#8051a7" );
      this.rd.setStyle( this.tags.nativeElement, "border", " 1px solid #8051a7" );
      this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg,#8051a7,#d262a5)" );
    }
    else if( this.category == "Article" ) {
      this.rd.setStyle( this.tags.nativeElement, "background", "#044fa9" );
      this.rd.setStyle( this.tags.nativeElement, "border", " 1px solid #044fa9" );
      this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg,#044fa9,#25bfe6)" );
    }

    else if( this.category == "Poetry" ) {
      this.rd.setStyle( this.tags.nativeElement, "background", "#fd3c59" );
      this.rd.setStyle( this.tags.nativeElement, "border", " 1px solid #fd3c59" );
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
  @ViewChild('writing_container', { read: ElementRef }) writing_container:ElementRef;
  resize_writing() {

    if(this.width){
      this.rd.setStyle(this.writing_container.nativeElement, "width", this.get_writing_size1() + "px");
    }
    else if( $('.container-writings') ) {
      this.rd.setStyle(this.writing_container.nativeElement, "width", this.get_writing_size() + "px");
    }

  }

  get_writing_size() {
    return $('.container-writings').width()/this.writings_per_line();
  }

  get_writing_size1(){
    return this.width/this.writings_per_line1();
  }

  writings_per_line() {
    var width = $('.container-writings').width();

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


  writings_per_line1() {
    var n = Math.floor(this.width/250);
    if( this.width < 500 ) {
      this.send_number_of_thumbnails.emit({number:1});
      return 1;
    }
    else if(this.width>0){
      this.send_number_of_thumbnails.emit({number:n});
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
    //console.log("loaded writing")
    this.imageloaded=true;
    this.sendLoaded.emit(true);
  }
  
  pp_is_loaded=false;
  pp_loaded(){
    this.pp_is_loaded=true;
  }


  stop(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }


  open_popup(event){
    event.preventDefault(); 
    if (event.ctrlKey) {
      return this.router.navigate(["/artwork-writing/"+this.title+"/"+this.writing_id]);
    }
    this.dialog.open(PopupArtworkComponent, {
      data: {
        id_input:this.writing_id,
        title_input:this.title,
        category:'writing',
      }, 
      panelClass:"popupArtworkClass",
    });
  }
}
