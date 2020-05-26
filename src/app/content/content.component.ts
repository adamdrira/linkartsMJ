import { Component, OnInit } from '@angular/core';
import {ElementRef, Renderer2, ViewChildren} from '@angular/core';
import { QueryList } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


declare var $: any 

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class ContentComponent implements OnInit {


  @ViewChildren('action') actions:QueryList<ElementRef>;
  @ViewChildren('section') sections:QueryList<ElementRef>;

  constructor(private rd: Renderer2, private route: ActivatedRoute) { }


  ngAfterViewInit() {
    console.log(this.rd); 


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




  }

  ngOnInit() {

    
    $(document).ready(function() {
      
      $(".owl-carousel").owlCarousel({
          loop: true,
          margin: 10,
          responsiveClass: true,
          nav: true,
          navText: ["",""],
          responsive: {
            500: {
              items: 2,
              nav: true
            },
            750: {
              items: 3,
              nav: false
            },
            1100: {
              items: 4,
              nav: true,
              loop: false,
              margin: 20
            },
            1400: {
              items: 5,
              nav: true,
              loop: false,
              margin: 20
            }
          }
        });
        
        $(".left-arrow-container").click(function() {
          $(".owl-carousel").trigger('prev.owl.carousel');
        });
        $(".right-arrow-container").click(function() {
          $(".owl-carousel").trigger('next.owl.carousel');
        });

    });



  }




  
}



  //link: any;
    /*
  this.route.params.subscribe(params => {
    this.link = "https://source.unsplash.com/" + params.id; // --> Name must match wanted parameter
  });*/
