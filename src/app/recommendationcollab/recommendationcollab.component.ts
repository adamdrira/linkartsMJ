import { Component, OnInit, Input } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';

declare var Swiper: any
declare var $: any

@Component({
  selector: 'app-recommendationcollab',
  templateUrl: './recommendationcollab.component.html',
  styleUrls: ['./recommendationcollab.component.scss']
})
export class RecommendationcollabComponent implements OnInit {

  constructor(private rd: Renderer2) { }

  
  @ViewChildren('category') categories:QueryList<ElementRef>;
  @ViewChildren('swiperContainer') swiperContainers:QueryList<ElementRef>;
  @ViewChildren('itemContainer') itemContainers:QueryList<ElementRef>;
  @ViewChildren('item') items:QueryList<ElementRef>;
  @ViewChildren('activator') activators:QueryList<ElementRef>;
  @ViewChildren('details_to_show') details_to_show:QueryList<ElementRef>;
  @ViewChildren('description_to_hide') description_to_hide:QueryList<ElementRef>;

  
  @ViewChild('panel1') panel1:ElementRef;
  @ViewChild('panel2') panel2:ElementRef;
  @ViewChild('panel3') panel3:ElementRef;
  @ViewChild('panel4') panel4:ElementRef;

  status1:String;
  status2:String;
  status3:String;
  status4:String;
  cancelled: number = 0;
  i: number = 1000;
  category_index: number = 0;//0 pour Animations, 1 pour BD & Mangas, 2 pour Dessins, 3 pour Écrits


  ngAfterViewInit() {
    
    this.category_index=0;
    console.log(this.rd);
    
    this.activators.toArray().forEach( (item, index) => {
      item.nativeElement.addEventListener('mouseenter', e => {
        this.mouseEnter( (index) );
      })
    })

    this.itemContainers.toArray().forEach( (item, index) => {
      item.nativeElement.addEventListener('mouseleave', e => {
        this.close_all();
      })
    })

    this.swiperContainers.toArray().forEach( (item, index) => {
      this.rd.setStyle( item.nativeElement, "z-index", (this.i - index).toString() );
    })

    this.categories.toArray()[this.category_index].nativeElement.classList.add("selected");

  }

  open_category(i : number) {

    this.category_index=i;
    this.categories.toArray().forEach( (item, index) => {
      item.nativeElement.classList.remove("selected");
    })
    this.categories.toArray()[this.category_index].nativeElement.classList.add("selected");

    this.panel1.nativeElement.classList.add("d-none");
    this.panel2.nativeElement.classList.add("d-none");
    this.panel3.nativeElement.classList.add("d-none");
    this.panel4.nativeElement.classList.add("d-none");


    if(i==0) {
      this.panel1.nativeElement.classList.remove("d-none");
    }
    if(i==1) {
      this.panel2.nativeElement.classList.remove("d-none");
    }

    if(i==2) {
      this.panel3.nativeElement.classList.remove("d-none");
    }
    if(i==3) {
      this.panel4.nativeElement.classList.remove("d-none");
    }

  }

  
  mouseEnter(i : number){
    this.close_all_except(i);
    let v0 = this.cancelled;

    (async () => {
      await new Promise( resolve => setTimeout(resolve, 400) );
      if( v0 === this.cancelled ) {
        this.show_details(i);
      }
      else {
        return;
      }
    })();
  }

  close_all_except(n : number) {
    this.cancelled++;
    this.details_to_show.toArray().forEach( (item, index) => {
      if( (n+1) == index ) {
        this.close_details(index);
      }
    })
  }
  
  close_all() {
    this.cancelled++;
    this.details_to_show.toArray().forEach( (item, index) => {
        this.close_details(index);
    })
  }


  show_details(index) {
    this.rd.setStyle( this.description_to_hide.toArray()[index].nativeElement, "visibility", "hidden");
    this.rd.setStyle( this.description_to_hide.toArray()[index].nativeElement, "opacity", "0");
    this.rd.setStyle( this.details_to_show.toArray()[index].nativeElement, "visibility", "visible");
    this.rd.setStyle( this.details_to_show.toArray()[index].nativeElement, "opacity", "1");
  }


  close_details(index) {
    this.rd.setStyle( this.description_to_hide.toArray()[index].nativeElement, "visibility", "visible");
    this.rd.setStyle( this.description_to_hide.toArray()[index].nativeElement, "opacity", "1");
    this.rd.setStyle( this.details_to_show.toArray()[index].nativeElement, "opacity", "0");
    this.rd.setStyle( this.details_to_show.toArray()[index].nativeElement, "visibility", "hidden");
  }


  load_carousels() {

    var carouselAnimationsRightArrows = document.querySelectorAll(".carousel-animation .right-arrow-container");
    var carouselAnimationsLeftArrows = document.querySelectorAll(".carousel-animation .left-arrow-container");
    $(".carousel-animation .swiper-container").each(function (index) {
      
      new Swiper($(this), {
        slidesPerView: 1,
        spaceBetween: 10,
        // init: false,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        navigation: {
          nextEl: carouselAnimationsRightArrows[index],
          prevEl: carouselAnimationsLeftArrows[index],
        },
        breakpoints: {
          300: {
            slidesPerView: 1,
            spaceBetween: 30,
          },
          600: {
            slidesPerView: 2,
            spaceBetween: 30,
          },
          1000: {
            slidesPerView: 3,
            spaceBetween: 50,
          },
          1250: {
            slidesPerView: 4,
            spaceBetween: 60,
          },
          1500: {
            slidesPerView: 5,
            spaceBetween: 70,
          }
        }
      });
    });


    var carouselBdMangasRightArrows = document.querySelectorAll(".carousel-bd-mangas .right-arrow-container");
    var carouselBdMangasLeftArrows = document.querySelectorAll(".carousel-bd-mangas .left-arrow-container");
    $(".carousel-bd-mangas .swiper-container").each(function (index) {
      
      new Swiper($(this), {
        slidesPerView: 1,
        spaceBetween: 10,
        // init: false,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        navigation: {
          nextEl: carouselBdMangasRightArrows[index],
          prevEl: carouselBdMangasLeftArrows[index],
        },
        breakpoints: {
          300: {
            slidesPerView: 1,
            spaceBetween: 30,
          },
          600: {
            slidesPerView: 2,
            spaceBetween: 30,
          },
          1000: {
            slidesPerView: 3,
            spaceBetween: 50,
          },
          1250: {
            slidesPerView: 4,
            spaceBetween: 60,
          },
          1500: {
            slidesPerView: 5,
            spaceBetween: 70,
          }
        }
      });
    });



  }

  
  
  ngOnInit() {

    (async () => {
      await this.load_carousels();
      this.panel2.nativeElement.classList.add("d-none");
      this.panel3.nativeElement.classList.add("d-none");
      this.panel4.nativeElement.classList.add("d-none");
    })();

  }

}
