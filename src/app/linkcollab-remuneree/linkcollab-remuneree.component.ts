import { Component, OnInit, Input } from '@angular/core';
import {ElementRef, Renderer2, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { NavbarService } from '../services/navbar.service';
import { SearchbarService } from '../services/searchbar.service';

declare var Swiper: any
declare var $: any 

@Component({
  selector: 'app-linkcollab-remuneree',
  templateUrl: './linkcollab-remuneree.component.html',
  styleUrls: ['./linkcollab-remuneree.component.scss']
})
export class LinkcollabRemunereeComponent implements OnInit {

  constructor(private rd: Renderer2, public navbar: NavbarService, public searchbar: SearchbarService) {


    this.searchbar.setStatus(2);
    this.navbar.setActiveSection(1);
    this.navbar.show();
  }

  
  ngAfterViewInit() {
    console.log(this.rd); 
    


  }


  ngOnInit() {
    
  }
  
}
