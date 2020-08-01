import { Component, OnInit, Input, ChangeDetectorRef, HostListener } from '@angular/core';
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
  
  constructor(private rd: Renderer2, 
    private authenticationService: AuthenticationService, 
    private route: ActivatedRoute, 
    public navbar: NavbarService, 
    private location: Location,
    private cd:ChangeDetectorRef,
    
    ) {

    
    this.navbar.setActiveSection(0);
    this.navbar.show();
    
  }

  @HostListener('window:resize', ['$event'])
    onResize(event) {
      this.cd.detectChanges();
      this.display_selector();
    }
  
  @ViewChildren('category') categories:QueryList<ElementRef>;
  
  category_index:number = -1;
  type_of_profile_retrieved=false;
  type_of_profile:string="visitor";





  initialize_heights() {
    console.log("initializing height")
    //if( !this.fullscreen_mode ) {
      $('#left-container').css("height", ( window.innerHeight - this.navbar.getHeight() ) + "px");
      $('#right-container').css("height", ( window.innerHeight - this.navbar.getHeight() ) + "px");
      this.cd.detectChanges();
    //}
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

    this.authenticationService.currentUserType.subscribe(r=>{
      if(r!=''){
        this.type_of_profile=r;
        this.type_of_profile_retrieved=true;
        this.initializeselector();
        this.display_selector();
        this.initialize_heights();
        this.open_category( this.route.snapshot.data['category'] );
        this.categories.toArray()[this.category_index].nativeElement.classList.add("opened");
      }
    })
    this.display_selector();
    
    console.log(this.little_screen);
  }

  little_screen=false;
  initializeselector(){
    let THIS=this;
    $(document).ready(function () {
      $('.f00select1').SumoSelect({});
    });
  
  
    $(".f00select0").change(function(){
      if($(this).val()=="1"){
        THIS.open_category(1);
      }
      if($(this).val()=="2"){
        THIS.open_category(2);
      }
      else{
        THIS.open_category(0);
      }
      THIS.cd.detectChanges();
    })
  }
  
  
  display_selector(){
    let width = $(".container-fluid").width();
    console.log(width);
    

    if( width <= 825) {
      this.little_screen=true;
    }
    else{
      this.little_screen=false;
    }
    
  }
  
}