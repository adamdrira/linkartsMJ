import { Component, OnInit, HostListener, ChangeDetectorRef, Inject } from '@angular/core';
import {ElementRef, ViewChild} from '@angular/core';
import { NavbarService } from '../services/navbar.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ChatService } from '../services/chat.service';
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

declare var Swiper: any;
@Component({
  selector: 'app-popup-ad-pictures',
  templateUrl: './popup-ad-pictures.component.html',
  styleUrls: ['./popup-ad-pictures.component.scss']
})
export class PopupAdPicturesComponent implements OnInit {



  constructor(
    public navbar: NavbarService,
    private sanitizer:DomSanitizer,
    private ChatService:ChatService,
    private cd: ChangeDetectorRef,
    public dialogRef: MatDialogRef<PopupAdPicturesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) { 
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
  }


  //Swiper
  swiper: any;
  swiper2: any;
  recommendation_index:number;
  category_index: number = 0;
  list_of_pictures:any[]=[];

  @ViewChild( "swiperContainer" ) swiperContainer:ElementRef;

  @ViewChild( "swiperContainer2" ) swiperContainer2:ElementRef;


  /******************************************************* */
  /******************** ON INIT ****************** */
  /******************************************************* */
  show_icon=false;
  show_container=false;
  ngOnInit() {
    var re = /(?:\.([^.]+))?$/;
    if(!this.data.for_chat){
      this.show_container=true;
      this.list_of_pictures=this.data.list_of_pictures;
      this.cd.detectChanges();
  
      if( this.list_of_pictures.length >= 1 ) {
        this.initialize_swiper();
        this.initialize_swiper2();
      }
    }
    else if(this.data.list_of_pictures.length>0){
      let compt=0;
      for(let i=0;i<this.data.list_of_pictures.length;i++){
        if(this.data.list_of_types[i]=="picture_attachment"){
          this.ChatService.get_attachment_popup(this.data.list_of_pictures[i],this.data.friend_type,this.data.list_of_chat_friend_ids[i]).subscribe(r=>{
            if(re.exec(this.data.list_of_pictures[i])[1].toLowerCase()=="svg"){
              let THIS=this;
              var reader = new FileReader()
              reader.readAsText(r);
              reader.onload = function(this) {
                  let blob = new Blob([reader.result], {type: 'image/svg+xml'});
                  let url = (window.URL) ? window.URL.createObjectURL(blob) : (window as any).webkitURL.createObjectURL(blob);
                  const SafeURL = THIS.sanitizer.bypassSecurityTrustUrl(url);
                  THIS.list_of_pictures[i]=SafeURL;
                  compt++;
                  if(compt==THIS.data.list_of_pictures.length){
                    THIS.show_container=true;
                    THIS.cd.detectChanges();
                    THIS.initialize_swiper();
                    THIS.initialize_swiper2();
                  }
              }
            }
            else{
              let blob = new Blob([r], {type: 'image/png'});
              let url = (window.URL) ? window.URL.createObjectURL(blob) : (window as any).webkitURL.createObjectURL(blob);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_pictures[i]=SafeURL;
              compt++;
              if(compt==this.data.list_of_pictures.length){
                this.show_container=true;
                this.cd.detectChanges();
                this.initialize_swiper();
                this.initialize_swiper2();
              }
            }
          })
        }
        else{
          this.ChatService.get_picture_sent_by_msg(this.data.list_of_pictures[i]).subscribe(r=>{
            let blob = new Blob([r], {type: 'image/png'});
              let url = (window.URL) ? window.URL.createObjectURL(blob) : (window as any).webkitURL.createObjectURL(blob);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_pictures[i]=SafeURL;
              compt++;
              if(compt==this.data.list_of_pictures.length){
                this.show_container=true;
                this.cd.detectChanges();
                this.initialize_swiper();
                this.initialize_swiper2();
              }
          })
        }
        
      }
    }
   
  }

  /******************************************************* */
  /******************** AFTER VIEW INIT ****************** */
  /******************************************************* */

  

  


  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.close_dialog();
  }

  initialize_swiper() {

    if(!this.swiper) {
      this.swiper = new Swiper(this.swiperContainer.nativeElement, {
        speed: 500,
        spaceBetween: 100,
        grabCursor: false,

        initialSlide:this.data.index_of_picture,

        simulateTouch: true,
        allowTouchMove: true,

        pagination: {
          el: '.swiper-pagination',
        },
        navigation: {
          nextEl: '.swiper-button-next.s1',
          prevEl: '.swiper-button-prev.s1',
        },
        keyboard: {
          enabled: true,
        }
      });
    }

  }

  initialize_swiper2() {
    if(!this.swiper2) {
      this.swiper2 = new Swiper(this.swiperContainer2.nativeElement, {

        speed: 500,
        spaceBetween: 10,
        slidesPerView: 1,

        breakpoints: {
          260: {
            slidesPerView: 2,
            slidesPerGroup: 2,
            simulateTouch: false,
            allowTouchMove: false,
            noSwiping: true,
          },
          310: {
            slidesPerView: 3,
            slidesPerGroup: 3,
            simulateTouch: false,
            allowTouchMove: false,
            noSwiping: true,
          },
          360: {
            slidesPerView: 4,
            slidesPerGroup: 4,
            simulateTouch: false,
            allowTouchMove: false,
            noSwiping: true,
          },
          410: {
            slidesPerView: 5,
            slidesPerGroup: 5,
            simulateTouch: false,
            allowTouchMove: false,
            noSwiping: true,
          },
          460: {
            slidesPerView: 6,
            slidesPerGroup: 5,
            simulateTouch: false,
            allowTouchMove: false,
            noSwiping: true,
          },
          510: {
            slidesPerView: 7,
            slidesPerGroup: 5,
            simulateTouch: false,
            allowTouchMove: false,
            noSwiping: true,
          },
          560: {
            slidesPerView: 8,
            slidesPerGroup: 5,
            simulateTouch: false,
            allowTouchMove: false,
            noSwiping: true,
          },
          610: {
            slidesPerView: 9,
            slidesPerGroup: 5,
            simulateTouch: false,
            allowTouchMove: false,
            noSwiping: true,
          },
          660: {
            slidesPerView: 10,
            slidesPerGroup: 5,
            simulateTouch: false,
            allowTouchMove: false,
            noSwiping: true,
          }
        },
        grabCursor: false,

        initialSlide:this.data.index_of_picture,

        pagination: {
          el: '.swiper-pagination',
        },
        navigation: {
          nextEl: '.swiper-button-next.s2',
          prevEl: '.swiper-button-prev.s2',
        },
        keyboard: {
          enabled: true,
        }
      });
    }

  }

  set_slide(i:number) {

    if( this.swiper ) {
      this.swiper.slideTo(i);
    }
  }

  close_dialog(){
    this.dialogRef.close();
  }



}


