import { Component, OnInit, Input, ViewChild, ElementRef, ChangeDetectorRef, Output, EventEmitter, SimpleChanges, Renderer2 } from '@angular/core';

import {Profile_Edition_Service} from '../services/profile_edition.service';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';

declare var Swiper:any;
declare var $: any;

@Component({
  selector: 'app-story-view',
  templateUrl: './story-view.component.html',
  styleUrls: ['./story-view.component.scss']
})
export class StoryViewComponent implements OnInit {

  constructor(
    private cd:ChangeDetectorRef,
    private rd:Renderer2,
    private sanitizer:DomSanitizer,
    private Profile_Edition_Service:Profile_Edition_Service,

  ) { }


  @ViewChild('swiperStory', {static: false}) swiperStory:ElementRef;
  @ViewChild('storyBarFill', {static: false}) storyBarFill:ElementRef;

  @Input('user_id') user_id;
  @Input('index_debut') index_debut;

  
  @Output() show_next = new EventEmitter<any>();
  @Output() show_prev = new EventEmitter<any>();

  swiper:any;
  pictures_links: any[];

  paused:boolean = false;
  
  author_name:string;
  profile_picture: SafeUrl;



  @Input('currently_readed') set currently_readed(currently_readed: boolean) {

    if( currently_readed ) {

      clearInterval(this.interval);
      this.startTimer();
      this.cd.detectChanges();

    }
    else if( !currently_readed ) {

      clearInterval(this.interval);
      this.timeLeft = 10;
      this.cd.detectChanges();
    }
 }



  ngOnInit(): void {

    this.pictures_links  = [
      "../../assets/img/08.jpg",
      "../../assets/img/05.jpg",
      "../../assets/img/06.jpg",
      "../../assets/img/05.jpg"
    ];


    this.Profile_Edition_Service.retrieve_profile_picture( this.user_id ).subscribe(r=> {
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.profile_picture = SafeURL;
    });
    

    this.Profile_Edition_Service.retrieve_profile_data(this.user_id).subscribe(r=> {
      this.author_name = r[0].firstname + ' ' + r[0].lastname;
    });



  }

  ngAfterViewInit() {
    this.initialize_swiper();

    this.swiper.slideTo( this.index_debut, false, false );
    
    this.timeLeft = 10;
    this.cd.detectChanges();
  }


  initialize_swiper() {
    this.swiper = new Swiper( this.swiperStory.nativeElement, {
      
      speed: 1,
      slidePerView:1,
      grabCursor: false,
      simulateTouch: false,
      pagination: {
        el: '.swiper-pagination',
      },
      observer: true,
    });

  }

  next_slide() {


    if( this.swiper.slides.length == ( this.swiper.activeIndex + 1 ) ) {
      this.show_next.emit();
      clearInterval(this.interval);
      this.timeLeft = 10;
      return;
    }
    
    if( this.paused ) {
      this.paused = false;
      this.startTimer();
    }

    this.swiper.slideTo( this.swiper.activeIndex + 1 );
    this.cd.detectChanges();

    this.timeLeft = 10;
  }

  previous_slide() {

    if( this.swiper.activeIndex == 0 ) {
      this.show_prev.emit();
      //clearInterval(this.interval);
      //this.timeLeft = 10;
      return;
    }
    
    if( this.paused ) {
      this.paused = false;
      this.startTimer();
    }
    
    this.swiper.slideTo( this.swiper.activeIndex - 1 );
    this.cd.detectChanges();

    this.timeLeft = 10;
  }


  timeLeft: number = 10;
  interval:any;
  startTimer() {
    
    clearInterval(this.interval);

    this.interval = setInterval(() => {

      if(this.timeLeft > 0) {
        this.timeLeft = this.timeLeft - 0.1;
      } else {
        this.next_slide();
        this.timeLeft = 10;
      }
    },100)
  }

  clickPause() {
    this.paused = !this.paused;
    
    if( this.paused ) {
      clearInterval(this.interval);
    }
    else {
      this.startTimer();
    }
  }


}
