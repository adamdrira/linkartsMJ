import { Component, OnInit, Input, ViewChild, ElementRef, ChangeDetectorRef, Output, EventEmitter, SimpleChanges, Renderer2, HostListener } from '@angular/core';
import {Story_service} from '../services/story.service';
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
    private Story_service:Story_service,

  ) { }


  @ViewChild('swiperStory', {static: false}) swiperStory:ElementRef;
  @ViewChild('storyBarFill', {static: false}) storyBarFill:ElementRef;

  @Input('user_id') user_id; //author
  @Input('current_user') current_user;  //visitor
  @Input('index_debut') index_debut;
  //index_debut:number=3;
  
  @Output() show_next = new EventEmitter<any>();
  @Output() show_prev = new EventEmitter<any>();

  swiper:any;
  pictures_links: any[];
  list_of_data:any[]=[];
  list_of_contents:any[]=[];
  list_of_contents_retrieved=false;
  list_of_data_sorted=false;
  paused:boolean = false;
  visitor_mode=true;
  author_name:string;
  profile_picture: SafeUrl;

  index_of_story_to_show:number;
  test=false;

  
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
    if(this.current_user== this.user_id){
      this.visitor_mode=false;
    }
    
    this.Story_service.get_stories_by_user_id(this.user_id).subscribe(r=>{
      (async () => {
      this.list_of_data=r[0];
      let k=0;
      for (let i=0;i<this.list_of_data.length;i++){
        this.Story_service.retrieve_story(this.list_of_data[i].file_name).subscribe(info=>{
          let url = (window.URL) ? window.URL.createObjectURL(info) : (window as any).webkitURL.createObjectURL(info);
          const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
          this.list_of_contents[i]=SafeURL;
          k++;
          if(k==this.list_of_data.length){
            console.log(this.user_id)
            console.log(this.list_of_contents)
            console.log(this.index_debut);
            this.initialize_swiper();
            this.swiper.slideTo( this.index_debut, false, r=>{
              this.timeLeft = 10;
              this.cd.detectChanges();
            } ); // n'affiche pas le dernier si l'indexe est le dernier...
            
          }
        });

      }

    })();
    })



    this.Profile_Edition_Service.retrieve_profile_picture( this.user_id ).subscribe(r=> {
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.profile_picture = SafeURL;
    });
    

    this.Profile_Edition_Service.retrieve_profile_data(this.user_id).subscribe(r=> {
      this.author_name = r[0].firstname + ' ' + r[0].lastname;
    });



  }

  /*ngAfterViewInit() {
    this.initialize_swiper();
    console.log(this.index_debut);
    this.swiper.slideTo( 3, false, false );
    
    this.timeLeft = 10;
    this.cd.detectChanges();

    
  }*/


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
    let id_story =this.list_of_data[this.swiper.activeIndex].id;
    this.Story_service.check_if_story_already_seen(id_story).subscribe(r=>{
      if (r[0]==null){
        this.Story_service.add_view(this.user_id,id_story,true).subscribe();
      }
      else{
        this.Story_service.add_view(this.user_id,id_story,false).subscribe();
      }
    })
    
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

    let id_story =this.list_of_data[this.swiper.activeIndex-1].id;
    this.Story_service.check_if_story_already_seen(id_story).subscribe(r=>{
      if (r[0]==null){
        this.Story_service.add_view(this.user_id,id_story,true).subscribe();
      }
      else{
        this.Story_service.add_view(this.user_id,id_story,false).subscribe(s=>{
          console.log(r);
        });
      }
    })

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


  delete_story(i){
    this.Story_service.delete_story(this.list_of_data[i].id).subscribe(r=>{
      location.reload();
    })

  }
  





}
