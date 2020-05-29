import { Component, OnInit, Input } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { NavbarService } from '../services/navbar.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';


declare var Swiper: any
declare var $: any

@Component({
  selector: 'app-home',
  templateUrl: './home-linkarts.component.html',
  styleUrls: ['./home-linkarts.component.scss']
})
export class HomeLinkartsComponent implements OnInit {
  
  constructor(private rd: Renderer2, private authenticationService: AuthenticationService, private route: ActivatedRoute, public navbar: NavbarService, private location: Location) {

    this.navbar.setActiveSection(0);
    this.navbar.show();
  }
  
  @ViewChildren('category') categories:QueryList<ElementRef>;
  
  category_index:number = 0;

  ngAfterViewInit() {
    
    console.log(this.rd);
    this.open_category( this.route.snapshot.data['category'] );
    this.categories.toArray()[this.category_index].nativeElement.classList.add("opened");

  }

  
  open_category(i : number) {
    this.category_index=i;
    this.categories.toArray().forEach( (item, index) => {
      item.nativeElement.classList.remove("opened");
    })
    this.categories.toArray()[this.category_index].nativeElement.classList.add("opened");
    if( i==0 ) {
      this.location.go("/");
    }
    else if( i==1 ) {
      this.location.go("/classement");
    }
    else if( i==2 ) {
      this.location.go("/subscribings");
    }
    else if( i==3 ) {
      this.location.go("/decouverte");
    }
    

  }


  ngOnInit() {
  }

  
}
