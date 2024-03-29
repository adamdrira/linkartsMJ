import { Component, OnInit, Input, ViewChild, ElementRef, ChangeDetectorRef, Output, EventEmitter, SimpleChanges, Renderer2, HostListener, QueryList, ViewChildren } from '@angular/core';
import {Story_service} from '../services/story.service';
import {Profile_Edition_Service} from '../services/profile_edition.service';
import {Reports_service} from '../services/reports.service';
import {Subscribing_service} from '../services/subscribing.service';
import {PopupConfirmationComponent} from '../popup-confirmation/popup-confirmation.component';
import {PopupReportComponent} from '../popup-report/popup-report.component';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { trigger, transition, style, animate } from '@angular/animations';
import { NavbarService } from '../services/navbar.service';
import { merge, fromEvent } from 'rxjs';
import { first } from 'rxjs/operators';

declare var Swiper:any;
declare var $: any;

@Component({
  selector: 'app-story-view',
  templateUrl: './story-view.component.html',
  styleUrls: ['./story-view.component.scss'],
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
export class StoryViewComponent implements OnInit {


  constructor(
    public dialog: MatDialog,
    private Reports_service:Reports_service,
    private cd:ChangeDetectorRef,
    private Subscribing_service:Subscribing_service,
    private sanitizer:DomSanitizer,
    private Profile_Edition_Service:Profile_Edition_Service,
    private Story_service:Story_service,
    private navbar: NavbarService,
  ) {
    navbar.visibility_observer_font.subscribe(font=>{
      if(font){
        this.show_icon=true;
      }
    })
   }

  
   @ViewChildren("SwiperSlides", {read: ElementRef}) SwiperSlides:QueryList<ElementRef>;
  @ViewChild('swiperStory', {static: false}) swiperStory:ElementRef;
  @ViewChild('storyBarFill', {static: false}) storyBarFill:ElementRef;

  @Input('user_id') user_id; //author
  @Input('list_of_data') list_of_data; //list_of_data
  @Input('current_user') current_user;  //visitor
  @Input('index_debut') index_debut;
  @Input('is_start') is_start;
  
  //index_debut:number=3;
  
  @Output() show_next = new EventEmitter<any>();
  @Output() show_prev = new EventEmitter<any>();
  @Output() end_of_stories = new EventEmitter<Object>();
  

  swiper:any;
  pictures_links: any[];
  list_of_contents:any[]=[];
  list_of_contents_retrieved=false;
  list_of_data_sorted=false;
  paused:boolean = false;
  visitor_mode=true;
  author_name:string;
  pseudo:string;
  profile_picture: any;
  profile_picture_safe:any;
  number_of_views:number;
  index_of_story_to_show:number;
  test=false;
  page_closed=false;

  
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

 @Input('pause') set pause(pause: boolean) {
  if( pause ) {
    this.page_closed=true;
    this.paused=true;
    clearInterval(this.interval);
  }
}



show_icon=false;
ngOnInit() {
  let THIS=this;
    $(window).on('blur', function(){
      if(!THIS.paused){
        THIS.clickPause();
      }
      
    });

    $(window).on('focus', function(){
      if(THIS.paused && !THIS.page_closed){
        THIS.clickPause();
      }
    });

    if(this.current_user== this.user_id){
      this.visitor_mode=false;
    }
    
    let k=0;

    for (let i=0;i<this.list_of_data.length;i++){

      this.Story_service.retrieve_story(this.list_of_data[i].file_name,window.innerWidth).pipe( first()).subscribe(info=>{

        if(this.list_of_data[i].file_name.includes(".svg")){
          var reader = new FileReader()
          reader.readAsText(info);
          reader.onload = function(this) {
              let blob = new Blob([reader.result], {type: 'image/svg+xml'});
              let url = (window.URL) ? window.URL.createObjectURL(blob) : (window as any).webkitURL.createObjectURL(blob);
              THIS.list_of_contents[i]=url;
          }
        }
        else{
          let url = (window.URL) ? window.URL.createObjectURL(info) : (window as any).webkitURL.createObjectURL(info);
          THIS.list_of_contents[i]=url;
        }
        
        
        k++;
        if(k== this.list_of_data.length ){

          this.Story_service.get_list_of_viewers_for_story(this.list_of_data[this.index_debut].id).pipe( first()).subscribe(r=>{
            this.number_of_views=r[0].length;
          })
          this.cd.detectChanges();
          this.initialize_swiper();
          this.swiper.update();
          this.cd.detectChanges();

          this.swiper.slideTo( this.index_debut, false, r=>{
            this.timeLeft = 10;
            this.cd.detectChanges();
          }); // n'affiche pas le dernier si l'indexe est le dernier...
          
        }
      });

    }



    this.Profile_Edition_Service.retrieve_profile_picture( this.user_id ).pipe( first()).subscribe(r=> {
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.profile_picture = url;
      this.profile_picture_safe = SafeURL;
    });
    

    this.Profile_Edition_Service.retrieve_profile_data(this.user_id).pipe( first()).subscribe(r=> {
      this.pseudo = r[0].nickname;
      this.author_name = r[0].firstname;
    });

  }

  

  initialize_swiper() {
      this.swiper = new Swiper( this.swiperStory.nativeElement, {
        
        speed: 1,
        slidePerView:1,
        preloadImages: false,
        lazy: {
          loadOnTransitionStart: true,
          checkInView:true,
        },
        watchSlidesVisibility:true,
        grabCursor: false,
        simulateTouch: false,
        allowTouchMove: false,
        pagination: {
          el: '.swiper-pagination',
        },
        observer:true,

        
        
      });

  }

  next_slide() {
    this.cd.detectChanges();
    if(this.swiper){
      let id_story =this.list_of_data[this.swiper.activeIndex].id;
      if(this.list_of_data[this.swiper.activeIndex+1]){
        this.Story_service.get_list_of_viewers_for_story(this.list_of_data[this.swiper.activeIndex+1].id).pipe( first()).subscribe(r=>{
          this.number_of_views=r[0].length;
        })
      }
      this.Story_service.check_if_story_already_seen(id_story).pipe( first()).subscribe(r=>{
        if(r[0]){
          this.Story_service.add_view(this.user_id,id_story,false).pipe( first()).subscribe();
        }
        else{
          this.Story_service.add_view(this.user_id,id_story,true).pipe( first()).subscribe();
        }
          
      })
      
      if( this.swiper.slides.length == ( this.swiper.activeIndex + 1 ) ) {
        this.end_of_stories.emit({user_id:this.user_id});
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
    
  }

  previous_slide() {
    this.cd.detectChanges();
    if(this.swiper){
      if( this.swiper.activeIndex == 0 ) {
        this.show_prev.emit();
        return;
      }
      
      if( this.paused ) {
        this.paused = false;
        this.startTimer();
      }
      
      this.Story_service.get_list_of_viewers_for_story(this.list_of_data[this.swiper.activeIndex - 1].id).pipe( first()).subscribe(r=>{
        this.number_of_views=r[0].length;
      })
  
      this.swiper.slideTo( this.swiper.activeIndex - 1 );
      this.cd.detectChanges();
  
      this.timeLeft = 10;
    }
    
  }


  timeLeft: number = 10;
  interval:any;
  startTimer() {
    if(!this.show_list_of_viewers && !this.loading_list_of_viewers){
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
    
  }

  clickPause() {

    if(this.show_list_of_viewers) {
      this.close_list_of_viewers();
      return;
    }
    this.paused = !this.paused;
    
    if( this.paused ) {
      clearInterval(this.interval);
    }
    else {
      this.startTimer();
    }
  }


  display_images=[];
  display_pp=false;
  loaded_image(i){
      this.display_images[i]=true;
  }

  loaded_pp(){
    this.display_pp=true;
  }


   /********************************************* options  *************************************/
 /********************************************* options  *************************************/
 /********************************************* options  *************************************/

 delete_story(i){
  const dialogRef = this.dialog.open(PopupConfirmationComponent, {
    data: {showChoice:true, text:'Etes vous sûr de vouloir supprimer la story ?'},
    panelClass: "popupConfirmationClass",
  });

  dialogRef.afterClosed().pipe( first()).subscribe(result => {
    if(result){
      this.Story_service.delete_story(this.list_of_data[i].id).pipe( first()).subscribe(r=>{
        location.reload()
      })
    }
  })
}

show_list_of_viewers=false;
loading_list_of_viewers=false;
viewers_found=[];
list_of_viewers=[];
list_of_check_subscribtion=[];
list_of_profile_pictures:any[]=[];
list_of_pp_loaded=[];
get_list_of_viewers(i){
  clearInterval(this.interval);
  this.paused = true;
  this.loading_list_of_viewers = true;
  
  if(this.viewers_found[i]){
    this.show_list_of_viewers=true;
    this.loading_list_of_viewers=false;
    return;
  }
  this.number_of_pp_to_show[i]=10;
  this.list_of_viewers[i]=[];
  this.list_of_profile_pictures[i]=[];
  this.Story_service.get_list_of_viewers_for_story(this.list_of_data[i].id).pipe( first()).subscribe(r=>{
    if(r[0].length>0){
      let n =r[0].length;
      let compt=0;
      for (let j=0;j<n;j++){
        this.Profile_Edition_Service.retrieve_profile_data(r[0][j].id_user_who_looks).pipe( first()).subscribe(l=>{
          this.list_of_viewers[i][j]=l[0];
          check_all(this)
         
        })

        this.Profile_Edition_Service.retrieve_profile_picture( r[0][j].id_user_who_looks).pipe( first()).subscribe(t=> {
          let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
          const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
          this.list_of_profile_pictures[i][j] = url;
        });

        function check_all(THIS){
          compt++;
          if(n>10){
            let compt1 =0
            for(let k=0;k<10;k++){
              if(THIS.list_of_viewers[i][k]){
                compt1++;
              }
            }
            if(compt1==10){
              THIS.viewers_found[i]=true;
              THIS.show_list_of_viewers=true;
              THIS.loading_list_of_viewers=false;
              THIS.merge_lazy(i)
            }
          }
        
          if(compt==n && !THIS.viewers_found[i]){
            THIS.viewers_found[i]=true;
            THIS.show_list_of_viewers=true;
            THIS.loading_list_of_viewers=false;
            THIS.merge_lazy(i)
          }
        }
      }
    }
    else{
      this.show_list_of_viewers=true;
      this.loading_list_of_viewers=false;
      this.viewers_found[i]=false;
    }
  })
}

scroll:any;
  
merge_lazy(i){
  this.cd.detectChanges();
  if(this.SwiperSlides.toArray()[i]){
    this.scroll = merge(
      fromEvent(window, 'scroll'),
      fromEvent(this.SwiperSlides.toArray()[i].nativeElement, 'scroll')
    );
  }
}

loading_more=[];
number_of_pp_to_show=[];
onScroll(i){
  if(!this.loading_more[i] && this.number_of_pp_to_show[i]<this.list_of_viewers[i].length && this.SwiperSlides.toArray()[i].nativeElement.scrollTop + this.SwiperSlides.toArray()[i].nativeElement.offsetHeight >= this.SwiperSlides.toArray()[i].nativeElement.scrollHeight*0.7){
    this.loading_more[i]=true;
    let len = this.list_of_viewers[i].length - this.number_of_pp_to_show[i];
    let see_more=false;
    if(len>10){
      let compt =0
      for(let j=0;j<10;j++){
        if(this.list_of_viewers[i][ this.number_of_pp_to_show[i] +j]){
          compt++;
        }
      }
      if(compt==10){
        see_more=true;
      }
    }
    else{
      let compt =0
      for(let j=0;j<len;j++){
        if(this.list_of_viewers[i][ this.number_of_pp_to_show[i] +j]){
          compt++;
        }
      }
      if(compt==len){
        see_more=true;
      }
    }
  
    if(  see_more ){
      this.number_of_pp_to_show[i]+=10;
      this.loading_more[i]=false;
      this.cd.detectChanges();
    }
    else{
      let pause = setInterval(()=>{
        this.loading_more[i]=false;
        this.onScroll(i)
        clearInterval(pause)
      },1000)
    }

  }
}

load_list_of_pp(k){
  this.list_of_pp_loaded[k]=true;
}
close_list_of_viewers(){
  this.show_list_of_viewers=false;
  this.clickPause();
}

  report(i){
    this.Reports_service.check_if_content_reported('story',this.list_of_data[i].id,"unknown",0).pipe( first()).subscribe(r=>{
      if(r[0].nothing){
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Vous ne pouvez pas signaler deux fois la même publication'},
          panelClass: "popupConfirmationClass",
        });
      }
      else{
        const dialogRef = this.dialog.open(PopupReportComponent, {
          data: {from_account:false,id_receiver:this.user_id,publication_category:'story',publication_id:this.list_of_data[i].id,format:"unknown",chapter_number:0},
          panelClass:"popupReportClass"
        });
      }
    })
    
  }

  @Output() closePopup = new EventEmitter<any>();
  close_stories() {
    this.closePopup.emit();
  }
  open_account() {
    return "/account/"+this.pseudo;
  };


  get_viewer_link(i:number,k:number) {
    
    return "/account/"+ this.list_of_viewers[i][k].nickname ;
  }

  stop(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  };


}
