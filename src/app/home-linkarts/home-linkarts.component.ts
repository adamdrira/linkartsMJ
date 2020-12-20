import { Component, OnInit, Input, ChangeDetectorRef, HostListener } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { AuthenticationService } from '../services/authentication.service';
import { NavbarService } from '../services/navbar.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';


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
    public dialog: MatDialog,
    private Profile_Edition_Service:Profile_Edition_Service,
    private cd:ChangeDetectorRef,
    private router: Router
    
    ) {

    
    this.navbar.setActiveSection(0);
    this.navbar.show();
    
  }

  @HostListener('window:resize', ['$event'])
    onResize(event) {
      this.cd.detectChanges();
      this.display_selector();
    }
    
  
  category_index:number = -1;
  type_of_profile_retrieved=false;
  type_of_profile:string="visitor";





  initialize_heights() {
    //if( !this.fullscreen_mode ) {
      $('#left-container').css("height", ( window.innerHeight - this.navbar.getHeight() ) + "px");
      $('#right-container').css("height", ( window.innerHeight - this.navbar.getHeight() ) + "px");
      this.cd.detectChanges();
    //}
  }

  
  open_category(i : number) {
    console.log("open cate")
    if( i==0 ) {
      this.category_index = 0;
      this.location.go('/recommendations')
      //return '/recommendations';
    }
    else if( i==1 ) {
      this.category_index = 1;
      this.location.go('/trendings')
      //return '/trendings';
    }
    else if( i==2 ) {
      this.category_index = 2;
      this.location.go('/subscribings')
      //return '/subscribings';
    }
    else if( i==3 ) {
      this.category_index = 3;
      this.location.go('/favorites')
      //return '/favorites';
    }
    this.cd.detectChanges()
  }


  get_category(i : number) {
    if( i==0 ) {
      return '/recommendations';
    }
    else if( i==1 ) {
      return '/trendings';
    }
    else if( i==2 ) {
      return '/subscribings';
    }
    else if( i==3 ) {
      return '/favorites';
    }
    
  }

  change_profile_number=0;
  ngOnInit() {

    this.authenticationService.currentUserType.subscribe(r=>{
      if(r!='' && this.change_profile_number<2){
        this.type_of_profile=r;
        this.type_of_profile_retrieved=true;
        this.change_profile_number++;
        this.initializeselector();
        this.display_selector();
        this.initialize_heights();
        this.category_index = this.route.snapshot.data['category'];
        if(this.category_index==4){
          //après le click du lien envoyé par mail pour confirmer inscription
          let id = parseInt(this.route.snapshot.paramMap.get('id'));
          let password = this.route.snapshot.paramMap.get('password');
          console.log(id)
          console.log(password)
          
          this.Profile_Edition_Service.check_password_for_registration(id,password).subscribe(r=>{
            console.log(r[0])
            this.category_index=0;
            if(r[0].user_found){
              this.location.go('/recommendations')
              const dialogRef = this.dialog.open(LoginComponent, {
                data: {usage:"registration"}
              });
            }
            else{
              this.location.go('/recommendations')
            }
          })
        }
      }
    })
    this.display_selector();
    
  }

  little_screen=false;
  initializeselector(){
    let THIS=this;
    /*$(document).ready(function () {
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
    })*/
  }
  
  
  display_selector(){
    let width = $(".container-fluid").width();
    

    if( width <= 825) {
      this.little_screen=true;
    }
    else{
      this.little_screen=false;
    }
    
  }
  
}