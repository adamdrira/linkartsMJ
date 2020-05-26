import { Component, OnInit, Renderer2, HostListener, ViewChild, ElementRef } from '@angular/core';

declare var $:any;
declare var Swiper:any;

@Component({
  selector: 'app-thumbnail-top-offer',
  templateUrl: './thumbnail-top-offer.component.html',
  styleUrls: ['./thumbnail-top-offer.component.scss']
})
export class ThumbnailTopOfferComponent implements OnInit {

  @HostListener('window:resize', ['$event'])
  onResize(event) {

    this.resize_drawing();
  }

  constructor(private rd: Renderer2) { 

  }


  swiper:any;
  cancelled = 0;
  //selectors
  @ViewChild('thumbnail') thumbnail:ElementRef;
  @ViewChild('swiper') swiperRef:ElementRef;
  @ViewChild('subSwiper') subSwiperRef:ElementRef;


  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    
    this.resize_drawing();

    this.swiper = new Swiper( this.swiperRef.nativeElement , {
      speed: 600,
      keyboard: {
        enabled: false,
      },
      simulateTouch: false
    });


    this.subSwiperRef = new Swiper( this.subSwiperRef.nativeElement , {
      speed: 600,
      scrollbar: {
        el: '.swiper-scrollbar',
        hide: false,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      keyboard: {
        enabled: false,
      },
      simulateTouch: true
    });


    this.swiperRef.nativeElement.addEventListener('mouseenter', e => {
      this.mouseEnterOffer();
    });

    this.swiperRef.nativeElement.addEventListener('mouseleave', e => {
      this.closeOffer();
    });

  }



  mouseEnterOffer() {
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


  closeOffer() {
    this.cancelled++;
    this.swiper.slideTo(0);
  }


  
  //Drawings functions

  resize_drawing() {

    var cwwithmargin = this.get_drawing_size()+60;

    this.rd.setStyle( this.thumbnail.nativeElement, "width", this.get_drawing_size() +'px');
    this.rd.setStyle( this.swiperRef.nativeElement, "height", ( this.get_drawing_size() / 2.3 ) +'px');

    /*$('.col-drawing').css({'width': this.get_drawing_size() +'px'});
    $('.col-drawing').css({'height': ( this.get_drawing_size() / 2.3 ) +'px'});
    $('.col-drawing .empty').css({'width':cwwithmargin+'px'});
    $('.col-drawing .empty').css({'height':cwwithmargin+'px'});*/
  }

  get_drawing_size() {
    return $('.container-offers').width()/this.drawings_per_line();
  }


  drawings_per_line() {
    var width = window.innerWidth;

    if( width > 1200) {
      return 3;
    }
    else if( width > 1000) {
      return 2;
    }
    else if( width > 600) {
      return 1;
    }
    else {
      return 1;
    }
  }

  



}
