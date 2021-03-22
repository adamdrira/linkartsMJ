import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import {ElementRef, Renderer2, ViewChild} from '@angular/core';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { NavbarService } from '../services/navbar.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';
import { SignupComponent } from '../signup/signup.component';
import { DeviceDetectorService } from 'ngx-device-detector';


declare var Swiper: any;

@Component({
  selector: 'app-home',
  templateUrl: './home-linkarts.component.html',
  styleUrls: ['./home-linkarts.component.scss']
})
export class HomeLinkartsComponent implements OnInit {
  
  constructor(private rd: Renderer2, 
    private route: ActivatedRoute, 
    public navbar: NavbarService, 
    private location: Location,
    public dialog: MatDialog,
    private deviceService: DeviceDetectorService,
    private Profile_Edition_Service:Profile_Edition_Service,
    private cd:ChangeDetectorRef,
    private router: Router
    
    ) {

      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
    this.navbar.setActiveSection(0);
    this.navbar.show();
    
  }

  @ViewChild("homeLinkartsSelect") homeLinkartsSelect;

  @HostListener('window:scroll', ['$event']) 
  function(event) {
    if( this.homeLinkartsSelect ) {
      this.homeLinkartsSelect.close();
    }
  };
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if( this.homeLinkartsSelect ) {
      this.homeLinkartsSelect.close();
    }
    this.cd.detectChanges();
  };
    
  
  category_index:number = -1;
  type_of_profile_retrieved=false;
  type_of_profile:string="visitor";

  status=[];

  categories_to_load=[];

  change_profile_number=0;
  device_info='';
  ngOnInit() {
    this.device_info = this.deviceService.getDeviceInfo().browser + ' ' + this.deviceService.getDeviceInfo().deviceType + ' ' + this.deviceService.getDeviceInfo().os + ' ' + this.deviceService.getDeviceInfo().os_version;
    window.scroll(0,0);
    this.Profile_Edition_Service.get_current_user().subscribe(r=>{
      
      if(r[0]){
        this.type_of_profile=r[0].status;
      }
      else{
        this.type_of_profile="visitor";
      }
        
      this.change_profile_number++;
      this.category_index = this.route.snapshot.data['category'];
      this.status[this.category_index]=true;
      this.categories_to_load[this.category_index]=true;
      this.cd.detectChanges()
      for(let j=0;j<4;j++){
        if(j!=this.category_index){
          this.status[j]=false;
        }
      }
      
      if(this.category_index==4){
        let id = parseInt(this.route.snapshot.paramMap.get('id'));
        let password = this.route.snapshot.paramMap.get('password');
        this.Profile_Edition_Service.check_password_for_registration(id,password).subscribe(r=>{
          this.category_index=0;
          if(r[0].user_found){
            this.navbar.add_page_visited_to_history(`/recommendations`,this.device_info ).subscribe();
            this.location.go('/recommendations')
            const dialogRef = this.dialog.open(LoginComponent, {
              data: {usage:"registration",temp_pass:r[0].pass,email:r[0].user_found.email},
              panelClass: "loginComponentClass",
            });
          }
          else{
            this.navbar.add_page_visited_to_history(`/recommendations`,this.device_info).subscribe();
            this.location.go('/recommendations')
          }
        })
      }
      else if (this.category_index==5){
        const dialogRef = this.dialog.open(LoginComponent, {
          data: {usage:"login"},
           panelClass:"loginComponentClass"
        });
      }
      else if (this.category_index==6){
        const dialogRef = this.dialog.open(SignupComponent, {
          data:{for_group_creation:false},
          panelClass:"signupComponentClass"
        });
      }
      this.type_of_profile_retrieved=true;
      this.cd.detectChanges();
      this.initialize_swiper();
    })

    
  }
 
  show_icon=false;
  
 
  open_category(i : number) {
    if( i==0 ) {
      this.category_index = 0;
      this.navbar.add_page_visited_to_history(`/recommendations`,this.device_info).subscribe();
      this.location.go('/recommendations');
    }
    else if( i==1 ) {
      this.category_index = 1;
      this.navbar.add_page_visited_to_history(`/trendings`,this.device_info).subscribe();
      this.location.go('/trendings')
    }
    else if( i==2 ) {
      this.category_index = 2;
      this.navbar.add_page_visited_to_history(`/subscribings`,this.device_info).subscribe();
      this.location.go('/subscribings')
    }
    else if( i==3 ) {
      this.category_index = 3;
      this.navbar.add_page_visited_to_history(`/favorites`,this.device_info).subscribe();
      this.location.go('/favorites')
    }
    this.status[i]=true;
    this.categories_to_load[i]=true;
    
    for(let j=0;j<4;j++){
      if(j!=i){
        this.status[j]=false;
      }
    }
    this.cd.detectChanges();
    window.dispatchEvent(new Event('resize'))
    
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

  swipe_to(i){
    this.swiper.slideTo(i,false,false);
  }

  swiper: any;
  @ViewChild("swiperCategories") swiperCategories: ElementRef;
  initialize_swiper() {

    if (!this.swiper && this.swiperCategories) {


      if (this.type_of_profile == 'account') {
        this.swiper = new Swiper(this.swiperCategories.nativeElement, {
          speed: 300,
          initialSlide: 0,

          breakpoints: {
            300: {
              slidesPerView: 2,
              slidesPerGroup: 2,
              spaceBetween: 10,
              simulateTouch: true,
              allowTouchMove: true,
            },
            400: {
              slidesPerView: 2,
              slidesPerGroup: 2,
              spaceBetween: 20,
              simulateTouch: true,
              allowTouchMove: true,
            },
            500: {
              slidesPerView: 3,
              slidesPerGroup: 3,
              spaceBetween: 20,
              simulateTouch: true,
              allowTouchMove: true,
            },
            600: {
              slidesPerView: 4,
              slidesPerGroup: 4,
              spaceBetween: 15,
              simulateTouch: false,
              allowTouchMove: false,
            }
          },

          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
        })
      }
      else {
        this.swiper = new Swiper(this.swiperCategories.nativeElement, {
          speed: 300,
          initialSlide: 0,

          breakpoints: {
            300: {
              slidesPerView: 2,
              slidesPerGroup: 2,
              spaceBetween: 10,
              simulateTouch: true,
              allowTouchMove: true,
            },
            400: {
              slidesPerView: 2,
              slidesPerGroup: 2,
              spaceBetween: 20,
              simulateTouch: true,
              allowTouchMove: true,
            },
            500: {
              slidesPerView: 3,
              slidesPerGroup: 3,
              spaceBetween: 20,
              simulateTouch: false,
              allowTouchMove: false,
            }
          },

          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
        })
      }

      this.cd.detectChanges();
      if(this.category_index<4){
        this.swipe_to(this.category_index)
      }
    }
  }
  

  sectionChange2(e:any) {
    this.router.navigate([ this.get_category(e) ]);
  }

  
}