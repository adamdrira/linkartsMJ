import { Component, OnInit, Input } from '@angular/core';
import {ElementRef, Renderer2, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';

declare var $: any 

@Component({
  selector: 'app-content-offer',
  templateUrl: './content-offer.component.html',
  styleUrls: ['./content-offer.component.scss']
})
export class ContentOfferComponent implements OnInit {

  
  @ViewChildren('offer') offers:QueryList<ElementRef>;
  @ViewChildren('action') actions:QueryList<ElementRef>;
  @ViewChildren('section') sections:QueryList<ElementRef>;

  

  constructor(private rd: Renderer2) {}

  
  ngAfterViewInit() {
    console.log(this.rd); 
    

    this.offers.forEach( (item, index) => {

      alert( item.nativeElement.id );

      this.actions.toArray().forEach( (item, index) => {
        item.nativeElement.addEventListener('click', e => {
  
          this.sections.toArray().forEach( (item, index) => {
            item.nativeElement.classList.add("d-none");
            this.actions.toArray()[index].nativeElement.classList.remove("active");
          });
          
          this.actions.toArray()[index].nativeElement.classList.add("active");
          this.sections.toArray()[index].nativeElement.classList.remove("d-none");
  
  
        });
      });

    })




  }


  ngOnInit() {

    
    $(document).ready(function() {
      
      $(".owl-carousel").each(function(index){
        
        var current = $(this);

        current.owlCarousel({
          loop: true,
          margin: 10,
          responsiveClass: true,
          nav: true,
          //navText: ["<img src='/assets/img/left.png'>","<img src='/assets/img/right.png'>"],
          navText: ["",""],
          items:1
        });

        /*
        $("section:nth-of-type("+ (index+1) +") > .row .content").on( 'click', function(event) {
          event.preventDefault();
          window.open("/content/test","_self");
        });*/
        
        $("section:nth-of-type("+ (index+1) +") > .left-arrow-container").click(function() {
          current.trigger('prev.owl.carousel');
        });
        $("section:nth-of-type("+ (index+1) +") > .right-arrow-container").click(function() {
          current.trigger('next.owl.carousel');
        });

      });
    });

    
  

  }
  
}
