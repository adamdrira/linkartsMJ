import { Component, OnInit, Input, HostListener } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { NavbarService } from '../services/navbar.service';
import {MatMenuModule} from '@angular/material/menu';
import { delay } from 'rxjs/operators';

declare var Swiper: any;
declare var $: any;




@Component({
  selector: 'app-artwork',
  templateUrl: './artwork.component.html',
  styleUrls: ['./artwork.component.scss']
})
export class ArtworkComponent implements OnInit {


  constructor(private rd: Renderer2, public navbar: NavbarService) { 
    
    this.navbar.setActiveSection(0);
    this.navbar.show();
  }


  @ViewChildren('category') categories:QueryList<ElementRef>;
  @ViewChild('leftContainer') leftContainer:ElementRef;

  //0 : description, 1 : comments
  category_index: number = 0;
  //Liked or/and loved contents
  liked: boolean;
  loved:boolean;


  ngOnInit() {


  }

  

  initialize_heights() {
    //if( !this.fullscreen_mode ) {
      $('#left-container').css("height", ( window.innerHeight - this.navbar.getHeight() ) + "px");
      $('#right-container').css("height", ( window.innerHeight - this.navbar.getHeight() ) + "px");

      $(".chapterSelector").SumoSelect({
        
      });

    //}
  }



  /******************************************************* */
  /******************* LEFT CONTROLLER ******************* */
  /******************************************************* */
  open_category(i : number) {
    this.category_index=i;
    this.categories.toArray().forEach( (item, index) => {
      item.nativeElement.classList.remove("opened");
    })
    this.categories.toArray()[this.category_index].nativeElement.classList.add("opened");

  }



  /******************************************************* */
  /******************* RIGHT CONTROLLER ****************** */
  /******************************************************* */
  click_like() {
    if(this.liked) {
      this.liked=false;
    }
    else {
      this.liked=true;
    }

  }

  click_love() {
    if(this.loved) {
      this.loved=false;
    }
    else {
      this.loved=true;
    }
  }


  scroll_to_comments() {
    document.getElementById("scrollToComments").scrollIntoView();
    this.open_category(1);
  }

  


  /******************************************************* */
  /******************** AFTER VIEW INIT ****************** */
  /******************************************************* */

  ngAfterViewInit() {
    
    var THIS = this;

    this.open_category(0);
    
    

  }



  ngAfterViewChecked() {
    this.initialize_heights();

  }




}



  

