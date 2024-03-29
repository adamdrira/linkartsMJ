import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import {ElementRef, Renderer2, ViewChild} from '@angular/core';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { NavbarService } from '../services/navbar.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faFacebookSquare } from '@fortawesome/free-brands-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import { trigger, transition, style, animate } from '@angular/animations';

import { Meta, Title } from '@angular/platform-browser';
import { PopupContactComponent } from '../popup-contact/popup-contact.component';
import { PopupShareComponent } from '../popup-share/popup-share.component';
import { first } from 'rxjs/operators';

declare var Swiper: any;


@Component({
  selector: 'app-home',
  templateUrl: './home-linkarts.component.html',
  styleUrls: ['./home-linkarts.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateY(0)', opacity: 0}),
          animate('500ms', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ]
    ),
  ],
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
    private router: Router,
    private title: Title,
    private meta: Meta
    
    ) {

      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
    this.navbar.setActiveSection(0);
    this.navbar.show();
    
  }

  faLinkedin = faLinkedin;
  faFacebookSquare = faFacebookSquare;
  faInstagram = faInstagram;

  @ViewChild("homeLinkartsSelect") homeLinkartsSelect;

 

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if( this.homeLinkartsSelect ) {
      this.homeLinkartsSelect.close();
    }
    this.cd.detectChanges();
  };
    
  
  category_index:number = -1;
  category_index_mat_option:number=-1;
  type_of_profile_retrieved=false;
  type_of_profile:string="visitor";
  current_user:any;
  status=[];

  categories_to_load=[];

  change_profile_number=0;
  device_info='';
  ngOnInit() {
    
    this.title.setTitle('LinkArts – Collaboration éditoriale');
    this.meta.updateTag({ name: 'description', content: "Bienvenue sur LinkArts, le site web dédié à la collaboration éditorale, pour les artistes et les éditeurs." });



    this.device_info = this.deviceService.getDeviceInfo().browser + ' ' + this.deviceService.getDeviceInfo().deviceType + ' ' + this.deviceService.getDeviceInfo().os + ' ' + this.deviceService.getDeviceInfo().os_version;
    window.scroll(0,0);
    this.route.data.pipe( first()).subscribe(resp => {
      let r= resp.user;
      this.current_user=resp.user;
      if(r[0]){
        this.type_of_profile=r[0].status;
      }
      else{
        this.type_of_profile="visitor";
      }
        
      this.change_profile_number++;
      this.category_index = this.route.snapshot.data['category'];
      this.category_index_mat_option=this.category_index;

      this.update_meta_data(this.category_index);

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
        this.Profile_Edition_Service.check_password_for_registration(id,password).pipe( first()).subscribe(r=>{
          this.location.go('/home/recommendations')
          if(r[0].user_found){
            this.navbar.add_page_visited_to_history(`/home/recommendations`,this.device_info ).pipe( first()).subscribe();
            const dialogRef = this.dialog.open(LoginComponent, {
              data: {usage:"registration",temp_pass:r[0].pass,email:r[0].user_found.email},
              panelClass: "loginComponentClass",
            });
          }
          else{
            this.navbar.add_page_visited_to_history(`/home/recommendations`,this.device_info).pipe( first()).subscribe();
          }
        })
      }
      else if (this.category_index==5){
        const dialogRef = this.dialog.open(LoginComponent, {
          data: {usage:"login"},
           panelClass:"loginComponentClass"
        });
      }
      this.type_of_profile_retrieved=true;
      this.cd.detectChanges();
      this.initialize_swiper();
    })


    
    this.open_category(this.category_index);
  }


  loading_top_artist=false;

  get_to_artists(){
    this.loading_top_artist=true;
    let compt=0;
    this.navbar.get_top_artists("comic").pipe( first()).subscribe(r=>{
      this.top_artists_comic=r[0];
      compt++;
      if(compt==3){
        this.manage_top_artists()
      }
    })
    this.navbar.get_top_artists("drawing").pipe( first()).subscribe(r=>{
      this.top_artists_drawing=r[0];
      compt++;
      if(compt==3){
        this.manage_top_artists()
      }
    })
    this.navbar.get_top_artists("writing").pipe( first()).subscribe(r=>{
      this.top_artists_writing=r[0];
      compt++;
      if(compt==3){
        this.manage_top_artists()
      }
    })
  }

  skeleton_array = Array(5);
  skeleton:boolean=true;
  opened_category_artwork=0;
  open_category_artwork(number){
    this.opened_category_artwork=number;
    if(this.ready_to_load_top_artists){
      this.manage_top_artists();
    }
   
    
  }

  top_artists_retrieved=false;
  ready_to_load_top_artists=false;
  manage_top_artists(){
    if(this.opened_category_artwork==0){
      this.top_artists=this.top_artists_comic;
    }
    else if(this.opened_category_artwork==1){
      this.top_artists=this.top_artists_drawing;
    }
    else{
      this.top_artists=this.top_artists_writing;
    }
    this.top_artists_retrieved=true;
    this.cd.detectChanges()
  }
 
  show_icon=false;
  top_artists:any;
  top_artists_comic=[];
  top_artists_drawing=[];
  top_artists_writing=[];
  
  open_category(i : number) {

    if(this.category_index==i){
      return
    }

    this.allow_sub=false;
    this.category_index = i;
    this.category_index_mat_option=i;
    if( i==0 ) {
      if(this.categories_to_load[2]){
        this.allow_sub=true;
      }
      
      this.navbar.add_page_visited_to_history(`/home/recommendations`,this.device_info).pipe( first()).subscribe();
      this.location.go('/home/recommendations');
    }
    else if( i==1 ) {
      this.navbar.add_page_visited_to_history(`/home/trendings`,this.device_info).pipe( first()).subscribe();
      this.location.go('/home/trendings')
    }
    else if( i==2 ) {
      this.navbar.add_page_visited_to_history(`/subscribings`,this.device_info).pipe( first()).subscribe();
      this.location.go('/home/subscribings')
    }
    else if( i==3 ) {
      this.navbar.add_page_visited_to_history(`/favorites`,this.device_info).pipe( first()).subscribe();
      this.location.go('/home/favorites')
    }
    

    this.update_meta_data(i);

    this.status[i]=true;
    this.categories_to_load[i]=true;
    
    for(let j=0;j<4;j++){
      if(j!=i){
        this.status[j]=false;
      }
    }
    this.cd.detectChanges();
    window.dispatchEvent(new Event('resize'))
    window.scroll(0,0);
  }

 
  update_meta_data(i : number) {
    if( i==0 ) {
      this.title.setTitle('LinkArts - La plateforme de collaboration pour artistes et éditeurs');
      this.meta.updateTag({ name: 'description', content: "Bienvenue sur LinkArts, le site web dédié à la collaboration éditorale, pour les artistes et les éditeurs." });
    }
    else if( i==1 ) {
      this.title.setTitle('Lire nos BD, dessins et écrits en tendances - Linkarts');
      this.meta.updateTag({ name: 'description', content: "La liste des meilleures BD, dessins et écrits du jour ! Découvrez nos mangas, bandes dessinées, comics, webtoons, romans, nouvelles, dessins, pitchs et scénarios." })
    }
    else if( i==2 ) {
      this.title.setTitle("Fil d'actualité - Linkarts");
      this.meta.updateTag({ name: 'description', content: "Découvrez votre fil d'actualité !" })
    }
    else if( i==3 ) {
      this.title.setTitle('Découvrir notre top des artistes et auteurs - Linkarts');
      this.meta.updateTag({ name: 'description', content: "La liste des meilleurs artistes et auteurs du moment !" })
    }
  }

    

  get_category(i : number) {
    if( i==0 ) {
      return '/home/recommendations';
    }
    else if( i==1 ) {
      return '/home/trendings';
    }
    else if( i==2 ) {
      return '/home/subscribings';
    }
    else if( i==3 ) {
      return '/home/favorites';
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
            700: {
              slidesPerView: 3,
              slidesPerGroup: 3,
              spaceBetween: 25,
              simulateTouch: false,
              allowTouchMove: false,
            },
            800: {
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
  

  allow_sub=false;
  sectionChange2(e:any) {
    this.router.navigate([ this.get_category(e) ]);
  }

  open_popup_contact() {
    const dialogRef = this.dialog.open(PopupContactComponent, {
      data:{current_user:this.current_user},
      panelClass:"popupContactComponentClass"
    });
    this.navbar.add_page_visited_to_history(`/contact-us`,this.device_info ).pipe( first()).subscribe();
  }

  open_share() {
    const dialogRef = this.dialog.open(PopupShareComponent, {
      data:{type_of_profile:this.type_of_profile},
      panelClass:"popupShareClass"
    });
  }
  
  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event) {
    if ((document.body.clientHeight + window.scrollY + 200) >= document.body.scrollHeight) {
      this.navbar.hide_help();
    }
    else {
      this.navbar.show_help();
    }

   
    if( this.homeLinkartsSelect ) {
      this.homeLinkartsSelect.close();
    }

    if( this.category_index==0 ){
      let pos = (document.documentElement.scrollTop || document.body.scrollTop) + document.documentElement.offsetHeight;
      let max = document.documentElement.scrollHeight;
      let compare=(max*0.8 - 400 >=0)?(max*0.8 - 400):(max*0.8);
      if(pos>=1500 && !this.loading_top_artist){
        this.ready_to_load_top_artists=true;
        this.get_to_artists();
      }
      if(pos>= compare ){
        if(this.categories_to_load[0] && !this.categories_to_load[2] && this.type_of_profile_retrieved && this.type_of_profile=='account')   {
          this.categories_to_load[2]=true;
          this.allow_sub=true;
        }
      }
    }
    
  }

  ngOnDestroy(): void {

    this.navbar.show_help();
    
    this.title.setTitle('LinkArts – Collaboration éditoriale');
    this.meta.updateTag({ name: 'description', content: "Bienvenue sur LinkArts, le site web dédié à la collaboration éditorale, pour les artistes et les éditeurs." });
    
  }

  open_tuto(){
    this.navbar.add_page_visited_to_history(`/open_tuto`,'' ).pipe( first()).subscribe();
    const dialogRef = this.dialog.open(PopupShareComponent, {
      data:{type_of_profile:this.type_of_profile, tutorial:true,current_user:this.current_user},
      panelClass:"popupTutoClass"
    });

    dialogRef.afterClosed().pipe( first()).subscribe(result => {
      if(result){
        this.open_share()
      }
    })
  }

  
}