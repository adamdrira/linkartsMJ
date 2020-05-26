
import { Component, OnInit, Input } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { NavbarService } from '../services/navbar.service';
import {MatMenuModule} from '@angular/material/menu';


declare var $: any
declare var Swiper: any

@Component({
  selector: 'app-linkcollab-offer',
  templateUrl: './linkcollab-offer.component.html',
  styleUrls: ['./linkcollab-offer.component.scss']
})
export class LinkcollabOfferComponent implements OnInit {

  constructor(private rd: Renderer2, public navbar: NavbarService) { 
    
    this.navbar.setActiveSection(1);
    this.navbar.show();
  }

  @ViewChildren('category') categories:QueryList<ElementRef>;
  

  status1:String;
  status2:String;
  category_index: number = 0;//0 pour description, 1 pour pieces-jointes.

  ngOnInit() {

  }


  
  open_category(i : number) {

    this.category_index=i;
    this.categories.toArray().forEach( (item, index) => {
      item.nativeElement.classList.remove("active");
    })
    this.categories.toArray()[this.category_index].nativeElement.classList.add("active");
   
  }




  
  ngAfterViewInit() {

    console.log(this.rd);

    this.open_category(0);

    var swiper = new Swiper('.swiper-container', {
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        renderBullet: function (index, className) {
          return '<span class="' + className + '">' + (index + 1) + '</span>';
        },
      },
    });
    

  }


}
