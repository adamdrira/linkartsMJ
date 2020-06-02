import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import {ElementRef, Renderer2, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { NavbarService } from '../services/navbar.service';
import { SearchbarService } from '../services/searchbar.service';

declare var Swiper: any
declare var $: any 

@Component({
  selector: 'app-home-linkcollab',
  templateUrl: './home-linkcollab.component.html',
  styleUrls: ['./home-linkcollab.component.scss']
})

export class HomeLinkcollabComponent implements OnInit {
  

  constructor(private rd: Renderer2, 
    public navbar: NavbarService,
    private cd: ChangeDetectorRef
    ) {

    this.navbar.setActiveSection(1);
    this.navbar.show();
  }


  subcategory:number;

  /*********************************************************************** */
  /*********************************************************************** */
  /*On init */
  /*********************************************************************** */
  /*********************************************************************** */
  ngOnInit() {
    this.open_subcategory(0);

  }

  /*********************************************************************** */
  /*********************************************************************** */
  /*After view init */
  /*********************************************************************** */
  /*********************************************************************** */
  ngAfterViewInit() {
    this.initialize_selectors();
    
  }


  open_subcategory(i) {
    if( this.subcategory==i ) {
      return;
    }
    this.subcategory=i;
    this.initialize_selectors();
    return;
  }

  
  initialize_selectors() {
  
    $(document).ready(function () {
      $(".SelectBox1").SumoSelect({
      });    
      $(".SelectBox2").SumoSelect({
      });    
      $(".SelectBox3").SumoSelect({
      });    
      $(".SelectBox4").SumoSelect({
      });
    });
    $('.panel-controller .right-container').hide().delay(80).show('fast');

  }


}
