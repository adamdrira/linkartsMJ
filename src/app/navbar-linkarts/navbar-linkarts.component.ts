import { Component, OnInit, HostListener } from '@angular/core';
import {ElementRef,Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import {trigger, style, animate, transition} from '@angular/animations';
import { NavbarService } from '../services/navbar.service';


declare var $: any;


@Component({
  selector: 'app-navbar-linkarts',
  templateUrl: './navbar-linkarts.component.html',
  styleUrls: ['./navbar-linkarts.component.scss'],  
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({opacity: 0}),
          animate('400ms', style({opacity: 1}))
        ]),
        transition(':leave', [
          style({opacity: 1})
        ])
      ]
    )
  ]
})

export class NavbarLinkartsComponent implements OnInit {
  
  
  constructor(private rd: Renderer2, public navbar: NavbarService) {}

  

  @ViewChild('input') input:ElementRef;
  @ViewChild('navbarLogo') navbarLogo:ElementRef;
  
  @ViewChild('navbarSearchbar', { static:false } ) set swiperChild(element) {
    if(element) {
      $(document).ready(function () {
        $('.NavbarSelectBox').SumoSelect({});
      });
    }
  }



  scrolled=false;
  navbarBoxShadow = false;



  ngOnInit() {
    window.addEventListener('scroll', this.scroll, true);
    
    $(document).ready(function () {
      $('.NavbarSelectBox').SumoSelect({});
    });

  }


  ngAfterViewInit() {


    (async () => { 
          
      await this.delay(1);
      this.setHeight();
      this.define_margin_top();

    })();

  }

  
  activateFocus() {
    this.input.nativeElement.focus();
  }

  define_margin_top() {

    if( this.navbar.visible ) {
      
      if( $(".fixed-top").css("position") == "fixed" ) {
        $(".navbar-margin").css("height", $(".fixed-top").height() + "px" );
      }
      else {
        $(".navbar-margin").css("height", "10px" );
      }

    }
    
  }

  setHeight() {
    this.navbar.setHeight( $(".fixed-top").height() );
  }
  
  
  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }



  ngAfterViewContent() {
    this.setHeight();
    this.define_margin_top();
  }
  


  //Scrolling managements
  scroll = (): void => {

    var lastScrollTop = 100;
    var scroll = document.documentElement.scrollTop;
    
    if (scroll>lastScrollTop) {
      this.navbarBoxShadow = true;
    }
    
    else {
      this.navbarBoxShadow = false;
    }
    lastScrollTop = scroll;
  }
  



}