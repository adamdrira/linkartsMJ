import { Component, OnInit, ChangeDetectorRef, HostListener, ViewChildren,ViewChild, QueryList } from '@angular/core';
import {ElementRef, Renderer2} from '@angular/core';
import { NavbarService } from '../services/navbar.service';
import { Ads_service } from '../services/ads.service';
import { MatDialog } from '@angular/material/dialog';
import { trigger, transition, style, animate } from '@angular/animations';
import { PopupLinkcollabFiltersComponent } from '../popup-linkcollab-filters/popup-linkcollab-filters.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConstantsService } from '../services/constants.service';
import { merge, fromEvent } from 'rxjs';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { Meta, Title } from '@angular/platform-browser';
import { DeviceDetectorService } from 'ngx-device-detector';
//import { PopupApplyComponent } from '../popup-apply/popup-apply.component';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

declare var Swiper: any

@Component({
  selector: 'app-home-linkcollab',
  templateUrl: './home-linkcollab.component.html',
  styleUrls: ['./home-linkcollab.component.scss'],
  animations: [
    trigger(
      'enterFromTopAnimation', [
        transition(':enter', [
          style({transform: 'translateY(-100%)', opacity: 0}),
          animate('400ms ease-in-out', style({transform: 'translateY(0px)', opacity: 1}))
        ]),
      ],
      
    ),
    trigger(
      'enterFromTop2Animation', [
        transition(':enter', [
          style({transform: 'translateY(-100%)', opacity: 0}),
          animate('400ms ease-in-out', style({transform: 'translateY(0px)', opacity: 1}))
        ]),
        transition(':leave', [
          style({transform: 'translateY(0px)', opacity: 0}),
          animate('400ms ease-in-out', style({transform: 'translateY(-100%)', opacity: 1}))
        ])
      ],
    ),
    trigger(
      'enterFromTop3Animation', [
        transition(':enter', [
          style({transform: 'translateY(-100%)', opacity: 0}),
          animate('400ms ease-in-out', style({transform: 'translateY(0px)', opacity: 1}))
        ]),
        transition(':leave', [
          style({transform: 'translateX(0px)', opacity: 0}),
          animate('600ms ease-in-out', style({transform: 'translateX(-100%)', opacity: 1}))
        ])
      ],
    ),
    trigger(
      'enterFromLeftAnimation', [
        transition(':enter', [
          style({transform: 'translateX(-100%)', opacity: 0}),
          animate('400ms ease-in-out', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ],
    ),
    trigger(
      'enterFromRightAnimation', [
        transition(':enter', [
          style({transform: 'translateX(100%)', opacity: 0}),
          animate('400ms ease-in-out', style({transform: 'translateX(0px)', opacity: 1}))
        ]),
      ],
    ),
    trigger(
      'enterFromBottomAnimation', [
        transition(':enter', [
          style({transform: 'translateY(100%)', opacity: 0}),
          animate('400ms ease-in-out', style({transform: 'translateY(0px)', opacity: 1}))
        ])
      ],
    ),
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({opacity: 0}),
          animate('400ms', style({opacity: 1}))
        ])
      ],
    ),
    //LEAVING ANIMATIONS
    trigger(
      'leaveAnimation', [
        transition(':leave', [
          style({transform: 'translateX(0%)', opacity: 1}),
          animate('200ms ease-in-out', style({transform: 'translateX(-30px)', opacity: 0}))
        ])
      ],
    )
  ],
})

export class HomeLinkcollabComponent implements OnInit {
  

  constructor(private rd: Renderer2, 
    public navbar: NavbarService,
    private deviceService: DeviceDetectorService,
    private cd: ChangeDetectorRef,
    private Ads_service:Ads_service,
    public dialog: MatDialog,
    private constants:ConstantsService,
    private fb: FormBuilder,
    private title: Title,
    private meta: Meta,
    private route: ActivatedRoute, 
    private location: Location,
    
    ) {
      navbar.visibility_observer_font.pipe( takeUntil(this.ngUnsubscribe) ).subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
    this.navbar.setActiveSection(1);
    this.navbar.show();
  }


  @ViewChild("homeLinkcollabSelect") homeLinkcollabSelect;
  @ViewChild("matSelect1") matSelect1;
  @ViewChild("matSelect2") matSelect2;
  @ViewChild("matSelect3") matSelect3;
  @ViewChild("matSelect4") matSelect4;
  @ViewChild("matSelect5") matSelect5;
  @ViewChild("matSelect6") matSelect6;
  @ViewChild("matSelect7") matSelect7;
  @ViewChild("matSelect8") matSelect8;

  @ViewChildren('thumbnails') thumbnails: QueryList<any>;


  category_index:number = -1;

  category:string="none";
  type_of_project:string="none";
  author:string="none";
  target:string="none";
  sorting:string="pertinence";
  list_of_ads:any[]=[];
  list_of_ads_received=false;
  skeleton_array = Array(5);
  now_in_seconds=Math.trunc( new Date().getTime()/1000);

  ads_types = this.constants.ads_types;

  ads_remuneration_types =this.constants.price_types_remunerated;
  ads_services_types=  this.constants.price_types_services;
  ads_descriptions = this.constants.ads_descriptions;




  ads_targets=this.constants.ads_targets;

  type_of_service='none';
  offer_or_demand='none'; // offre ou demande
  type_of_remuneration="none";
  service=false;
  remuneration=false;

  
  f1: FormGroup;
  /*********************************************************************** */
  /*********************************************************************** */
  /*On init */
  /*********************************************************************** */
  /*********************************************************************** */
  device_info='';
  ngOnInit() {


    this.navbar.add_page_visited_to_history(`/linkcollab/home_depot`,this.device_info ).pipe( takeUntil(this.ngUnsubscribe) ).subscribe();
    this.device_info = this.deviceService.getDeviceInfo().browser + ' ' + this.deviceService.getDeviceInfo().deviceType + ' ' + this.deviceService.getDeviceInfo().os + ' ' + this.deviceService.getDeviceInfo().os_version;
    window.scroll(0,0);
    

    this.category_index = this.route.snapshot.data['category'];
    this.update_meta_data(this.category_index);


    window.scroll(0,0);
    this.open_category(this.category_index, false);
    this.update_meta_data(this.category_index);

    this.f1 = this.fb.group({
      type_of_project: [this.type_of_project],
      author: [this.author],
      target: [this.target],
      type_of_service: [this.type_of_service],
      offer_or_demand: [this.offer_or_demand],
      type_of_remuneration: [this.type_of_remuneration],
      sorting: [this.sorting],
    })
  }

  /*********************************************************************** */
  /*********************************************************************** */
  /*After view init */
  /*********************************************************************** */
  /*********************************************************************** */
  show_icon=false;
  scrollobs:any;
  ngAfterViewInit() {

    this.scrollobs = merge(
      fromEvent(window, 'scroll'),
    );

    this.initialize_swiper();
    this.set_thumbnails_width();
  }

  innerWidth: number;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
    if( this.homeLinkcollabSelect ) {
      this.homeLinkcollabSelect.close();
    }

    if(window.innerWidth>850){
      this.filters_opened=false;
    }
    this.set_thumbnails_width();

  };
  @HostListener('window:scroll', ['$event'])
  onScroll(event) {
    if( this.homeLinkcollabSelect ) {
      this.homeLinkcollabSelect.close();
    }
    if( this.matSelect1 ) {
      this.matSelect1.close();
    }
    if( this.matSelect2 ) {
      this.matSelect2.close();
    }
    if( this.matSelect3 ) {
      this.matSelect3.close();
    }
    if( this.matSelect4 ) {
      this.matSelect4.close();
    }
    if( this.matSelect5 ) {
      this.matSelect5.close();
    }
    if( this.matSelect6 ) {
      this.matSelect6.close();
    }
    if( this.matSelect7 ) {
      this.matSelect7.close();
    }
    if( this.matSelect8 ) {
      this.matSelect8.close();
    }
  };

  open_category(i, check_no_same_change) {
    if( this.category_index==i && check_no_same_change ) {
      return;
    }
    
    this.current_page=1;
    this.number_of_pages=1;
    this.number_of_results=0;
    this.type_of_project="none";
    this.author="none";
    this.target="none";
    this.type_of_service='none';
    this.offer_or_demand='none';
    this.type_of_remuneration="none";
    this.sorting="pertinence";

    if(i==1){
      this.navbar.add_page_visited_to_history(`/home/benev`,this.device_info ).pipe( takeUntil(this.ngUnsubscribe) ).subscribe();
      this.remuneration=false;
      this.service=false;
      this.get_sorted_ads();
      this.location.go('/linkcollab/voluntary-collaborations');
    }
    else if(i==2){
      this.navbar.add_page_visited_to_history(`/home/remuneration`,this.device_info ).pipe( takeUntil(this.ngUnsubscribe) ).subscribe();
      this.remuneration=true;
      this.service=false;
      this.get_sorted_ads();
      this.location.go('/linkcollab/remunerated-collaborations');
    }
    else{
      this.navbar.add_page_visited_to_history(`/linkcollab/depot`,this.device_info ).pipe( takeUntil(this.ngUnsubscribe) ).subscribe();
      this.remuneration=false;
      this.service=false;
      this.get_sorted_ads();
      this.location.go('/linkcollab');
    }

    this.update_meta_data(i);

    this.category_index=i;
    this.cd.detectChanges();
    
    this.initialize_swiper2();

    window.dispatchEvent(new Event('resize'));
    return;
  }


  update_meta_data(i : number) {
    if( i==0 ) {
      this.title.setTitle('LinkCollab – Recherche de collaborateurs pour projets éditoriaux');
      this.meta.updateTag({ name: 'description', content: "Un espace collaboration pour soumettre votre projet auprès des éditeurs ou chercher le partenaire idéal. Recherchez un dessinateur, scénariste, illustrateur, ou auteur." });
    }
    if( i==1 ) {
      this.title.setTitle('Annonces de collaborations bénévoles - LinkCollab');
      this.meta.updateTag({ name: 'description', content: "Recherchez le collaborateur idéal pour vos projets éditoriaux !" });
    }
    else if( i==2 ) {
      this.title.setTitle('Annonces de collaborations rémunérées - LinkCollab');
      this.meta.updateTag({ name: 'description', content: "Recherchez le service artistique ou éditorial qui vous conviens le mieux !" });
    }
  }

  swiper: any;
  @ViewChild("swiperCategories") swiperCategories: ElementRef;
  initialize_swiper() {

    if (!this.swiper && this.swiperCategories) {
      this.swiper = new Swiper(this.swiperCategories.nativeElement, {
        speed: 300,
        initialSlide: 0,

        breakpoints: {
          300: {
            slidesPerView: 2,
            slidesPerGroup: 2,
            spaceBetween: 5,
            simulateTouch: true,
            allowTouchMove: true,
          },
          400: {
            slidesPerView: 2,
            slidesPerGroup: 2,
            spaceBetween: 5,
            simulateTouch: true,
            allowTouchMove: true,
          },
          500: {
            slidesPerView: 3,
            slidesPerGroup: 3,
            spaceBetween: 5,
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
  }

  swiper2:any;
  @ViewChild("swiperCategories2") swiperCategories2:ElementRef;
  initialize_swiper2() {

    if( this.swiper2 ) {
      this.swiper2.destroy();
      this.swiper2=void 0;
    }
    if( !this.swiper2 && this.swiperCategories2 ) {
      this.swiper2 = new Swiper( this.swiperCategories2.nativeElement, {
        speed: 300,
        initialSlide:0,

        slidesPerView: 'auto',

        breakpoints: {
          // when window width is >= 320px
          320: {
            slidesPerGroup: 2,
          },
          // when window width is >= 480px
          500: {
            slidesPerGroup: 3,
          },
          // when window width is >= 640px
          700: {
            slidesPerGroup: 4,
          },
          // when window width is >= 640px
          900: {
            slidesPerGroup: 5,
          }
        },

        navigation: {
          nextEl: '.swiper-button-next.second',
          prevEl: '.swiper-button-prev.second',
        },
        observer:'true',
      })
    }
  }
  

  sectionChange2(e:any) {
    this.open_category(e.value, false);
  }


  change_select1(e:any) {
    this.navbar.add_page_visited_to_history(`/linkcollab/change_select1/${e.value}`,this.device_info ).pipe( takeUntil(this.ngUnsubscribe) ).subscribe();
    if( e.value=="Tout" ){
      if( this.type_of_project == "none" ) {
        return;
      }
      this.type_of_project="none";
    }
    else{
     if( this.type_of_project == e.value ) {
        return;
      }
      this.type_of_project= e.value;
    }
    this.get_sorted_ads();
  }

  change_select2(e:any) {
    this.navbar.add_page_visited_to_history(`/linkcollab/change_select2/${e.value}`,this.device_info ).pipe( takeUntil(this.ngUnsubscribe) ).subscribe();
    if( e.value=="Tout" ){
      if( this.author == "none" ) {
        return;
      }
      this.author="none";
    }
    else{
      if( this.author == e.value ) {
        return;
      }
      this.author= e.value;
    }
    this.get_sorted_ads();
  }

  change_select3(e:any) {
    this.navbar.add_page_visited_to_history(`/linkcollab/change_select3/${e.value}`,this.device_info ).pipe( takeUntil(this.ngUnsubscribe) ).subscribe();
    if( e.value=="Tout" ){
      if( this.target == "none" ) {
        return;
      }
      this.target="none";
    }
    else{
      if( this.target == e.value ) {
        return;
      }
      this.target= e.value;
    }
    this.get_sorted_ads();
  }

  change_select4(e:any) {
    this.navbar.add_page_visited_to_history(`/linkcollab/change_select4/${e.value}`,this.device_info ).pipe( takeUntil(this.ngUnsubscribe) ).subscribe();
    if( e.value=="Tout" ){
      if( this.type_of_service == "none" ) {
        return;
      }
      this.type_of_service="none";
    }
    else{
      if( this.type_of_service == e.value ) {
        return;
      }
      this.type_of_service= e.value;
    }
    this.get_sorted_ads();
  }

  change_select5(e:any) {
    this.navbar.add_page_visited_to_history(`/linkcollab/change_select5/${e.value}`,this.device_info ).pipe( takeUntil(this.ngUnsubscribe) ).subscribe();
    if( e.value=="Tout" ){
      if( this.offer_or_demand == "none" ) {
        return;
      }
      this.offer_or_demand="none";
    }
    else{
      if( this.offer_or_demand == e.value ) {
        return;
      }
      this.offer_or_demand= e.value;
    }
    this.get_sorted_ads();
  }

  change_select6(e:any) {
    this.navbar.add_page_visited_to_history(`/linkcollab/change_select6/${e.value}`,this.device_info ).pipe( takeUntil(this.ngUnsubscribe) ).subscribe();
    if( e.value=="Tout" ){
      if( this.type_of_remuneration == "none" ) {
        return;
      }
      this.type_of_remuneration="none";
    }
    else{
      if( this.type_of_remuneration == e.value ) {
        return;
      }
      this.type_of_remuneration= e.value;
    }
    this.get_sorted_ads();
  }

  change_select7(e:any) {
    this.navbar.add_page_visited_to_history(`/linkcollab/change_select7/${e.value}`,this.device_info ).pipe( takeUntil(this.ngUnsubscribe) ).subscribe();
    if( e.value=="Tri par pertinence" ){
      if( this.sorting == "pertinence" ) {
        return;
      }
      this.sorting="pertinence";
    }
    else if( e.value=="Tri par le plus récent" ){
      if( this.sorting == "récent" ) {
        return;
      }
      this.sorting="récent";
    }
    else if( e.value=="Tri par le plus ancien" ){
      if( this.sorting == "ancient" ) {
        return;
      }
      this.sorting="ancient";
    }
    else if( e.value=="Tri par montant croissant" ){
      if( this.sorting == "croissant" ) {
        return;
      }
      this.sorting="croissant";
    }
    else if( e.value=="Tri par montant décroissant" ){
      if( this.sorting == "décroissant" ) {
        return;
      }
      this.sorting="décroissant";
    }
    else {
      if( this.sorting == "pertinence" ) {
        return;
      }
      this.sorting="pertinence";
    }
    this.get_sorted_ads();
  }

  change_select8(e:any) {
    this.navbar.add_page_visited_to_history(`/linkcollab/change_select8/${e.value}`,this.device_info ).pipe( takeUntil(this.ngUnsubscribe) ).subscribe();
    if( e.value=="Tri par pertinence" ){
      if( this.sorting == "pertinence" ) {
        return;
      }
      this.sorting="pertinence";
    }
    else if( e.value=="Tri par le plus récent" ){
      if( this.sorting == "récent" ) {
        return;
      }
      this.sorting="récent";
    }
    else if( e.value=="Tri par le plus ancien" ){
      if( this.sorting == "ancient" ) {
        return;
      }
      this.sorting="ancient";
    }
    else {
      if( this.sorting == "pertinence" ) {
        return;
      }
      this.sorting="pertinence";
    }
    this.get_sorted_ads();
  }
  

  skeleton:boolean=true;
  compteur_ads=0;
  loading_ads=false;
  show_propositions=false;
  offset_ads=0;
  display_no_propositions=false;
  number_of_pages:number=1;
  current_page=1;
  number_of_results=0;
  get_sorted_ads(){
    this.offset_ads = (this.current_page-1)*5;
    this.compteur_ads++;
    this.loading_ads=true;
    this.number_of_pages=1;
    this.display_no_propositions=false;
    this.show_propositions=false;
    this.number_of_results=0;
    this.list_of_ads_received=false;
    this.list_of_ads=[];
    this.Ads_service.get_sorted_ads_linkcollab(this.type_of_project,this.author,this.target,this.remuneration,this.service,this.type_of_remuneration,this.type_of_service,this.offer_or_demand,this.sorting,this.offset_ads,this.compteur_ads).pipe( takeUntil(this.ngUnsubscribe) ).subscribe(r=>{
      this.number_of_results=r[0][0].number_of_ads;
      if(parseInt(r[0][0].number_of_ads)%5==0){
        this.number_of_pages=Math.trunc(parseInt(r[0][0].number_of_ads)/5)
      }
      else{
        this.number_of_pages=Math.trunc(parseInt(r[0][0].number_of_ads)/5)+1;
      }
      let results=r[0][0].results;
      if(r[0]=this.compteur_ads){
        this.loading_ads=false;
        this.list_of_ads_received=true;
        if (this.number_of_results>0){
          for (let i=0;i<results.length;i++){
            this.list_of_ads[i]=results[i];
          }
          this.show_propositions=true;
        }
        else{
         
          this.display_no_propositions=true;
        }
      }
      
    })
  }


  @ViewChild('input') input:ElementRef;
  @ViewChild('EditorContainer') EditorContainer:ElementRef;

  page_clicked(e:any) {
    if(e.keyCode === 13){
      e.preventDefault();

      if( (e.target.value >= 1) && (e.target.value <= this.number_of_pages) ) {
        this.current_page=e.target.value ;
        this.get_sorted_ads()
        
      }
      else {
       this.input.nativeElement.value= this.current_page;
      }
    }
  }
  
  first_page() {
    this.current_page=1;
    this.get_sorted_ads()
  }
  previous_page() {
    this.current_page--;
    this.get_sorted_ads()
  }
  next_page() {
    this.current_page++;
    this.get_sorted_ads()
   
  }
  last_page() {
    this.current_page=this.number_of_pages;
    this.get_sorted_ads()
  }


  scroll(el: HTMLElement) {

    this.cd.detectChanges();
    var topOfElement = el.offsetTop - 150;
    window.scroll({top: topOfElement, behavior:"smooth"});
  }

    
  /*********************************** DEPOT DE PROJETS  ***********************************/
  /*********************************** DEPOT DE PROJETS  ***********************************/

  section0_categories = ["Tout","BD","Comics","Mangas","Livres","Livres jeunesse"];

  open_more_filters() {
    const dialogRef = this.dialog.open(PopupLinkcollabFiltersComponent, {
      data: { 
        linkcollab_page:true,
        category_index:this.category_index,
        type_of_project:this.type_of_project,
        author:this.author,
        target:this.target,
        type_of_service:this.type_of_service,
        offer_or_demand:this.offer_or_demand,
        type_of_remuneration:this.type_of_remuneration,
        sorting:this.sorting,
        service:this.service,
        remuneration:this.remuneration,
      },
      panelClass: "popupFiltersComponentClass",
    }).afterClosed().pipe( takeUntil(this.ngUnsubscribe) ).subscribe(
      result => {
        if(result){
          this.f1.controls['type_of_project'].setValue(result.type_of_project);
          this.f1.controls['author'].setValue(result.author);
          this.f1.controls['target'].setValue(result.target);
          this.f1.controls['type_of_service'].setValue(result.type_of_service);
          this.f1.controls['offer_or_demand'].setValue(result.offer_or_demand);
          this.f1.controls['type_of_remuneration'].setValue(result.type_of_remuneration);
          this.f1.controls['sorting'].setValue(result.sorting);
          
          this.change_select1({value: result.type_of_project});
          this.change_select2({value: result.author});
          this.change_select3({value: result.target});
          this.change_select4({value: result.type_of_service});
          this.change_select5({value: result.offer_or_demand});
          this.change_select6({value: result.type_of_remuneration});
          this.change_select7({value: result.sorting});
          this.change_select8({value: result.sorting});
        }
       
      });
  }



  change_select_section0(e:any) {
    if( e.value=="Tout" ){
      this.navbar.add_page_visited_to_history(`/linkcollab/change_select_section0/tout`,this.device_info ).pipe( takeUntil(this.ngUnsubscribe) ).subscribe();
      if( this.category == "none" ) {
        return;
      }
      this.category="none";
    }
    else{
      this.navbar.add_page_visited_to_history(`/linkcollab/change_select_section0/${e.value}`,this.device_info ).pipe( takeUntil(this.ngUnsubscribe) ).subscribe();
      if( this.category == e.value ) {
        return;
      }
      this.category= e.value;
    }
    this.cd.detectChanges();
    this.set_thumbnails_width();
  }



 
  open_website(i){
    if(this.list_of_editors[i].id==0){
      return this.list_of_editors[i].page;
    }
    else{
      return this.list_of_editors[i].website;
    }
    
  }

  public searchText:any;
  is_a_special_pp={"Kana":true,"les Éditions 100 bulles":true,"Les Avrils":true,"Éditions Soleil":true,"Les Éditions La croisée":true,"Drakoo":true};
  is_a_special_cover={"Kana":true,"les Éditions 100 bulles":true,"Les Avrils":true,"Éditions Soleil":true,"Les Éditions La croisée":true,"Drakoo":true}
  list_of_editors = [

    {
      title:"Éditions Tartamundo",
      categories:["BD","Mangas"],
      website:"https://tartamudobd.wordpress.com/",
      page:"https://www.linkarts.fr/account/Tartamudo",
      email:"lisez-moi@wanadoo.fr",
      pp:"../../assets/img/editors/pp-tartamundo.jpeg",
      cover:"../../assets/img/editors/cover-tartamundo.jpg",
      location:"Toulon, France",
      phone:"04 94 41 01 18",
      id:0,
    },
    
    {
      title:"Éditions Glénat",
      categories:["BD","Comics","Mangas","Livres","Livres jeunesse"],
      website:"https://www.glenat.com/",
      email:"mcg@glenat.com",
      pp:"../../assets/img/editors/pp-glenat.png",
      cover:"../../assets/img/editors/cover-glenat.jpg",
      location:"Grenoble, France",
      phone:"04 76 88 75 75",
      mother:"Éditions Glénat",
      id:1,
    },
    {
      title:"Éditions Quatre Fleuves",
      categories:["Livres jeunesse"],
      website:"https://www.glenat.com/livres-jeunesse/collections/editions-quatre-fleuves",
      pp:"../../assets/img/editors/pp-Editions_Quatre_Fleuves.jpg",
      cover:"../../assets/img/editors/cover-quatre-fleuves.jpg",
      location:"Grenoble, France",
      mother:"Éditions Glénat",
      id:2,
    },
    {
      title:"Kazé",
      categories:["Mangas"],
      website:"http://www.kazemanga.fr/",
      email:"contact@vizeurope.com",
      pp:"../../assets/img/editors/pp-kaze.png",
      cover:"../../assets/img/editors/cover-kaze.jpg",
      location:"Paris, France",
      phone:"01 48 21 00 07",
      id:3,
    },
    {
      title:"Pika Édition",
      categories:["Mangas"],
      website:"https://www.pika.fr/",
      email:"mypika@pika.fr",
      pp:"../../assets/img/editors/pp-pika.png",
      cover:"../../assets/img/editors/cover-pika.jpg",
      location:"Vanves, France",
      phone:"01 41 10 23 90",
      id:4,
    },
    {
      title:"Éditions Delcourt",
      categories:["BD","Comics","Mangas","Livres jeunesse"],
      website:"https://www.editions-delcourt.fr/",
      email:"projets@editions-delcourt.fr",
      pp:"../../assets/img/editors/pp-delcourt.jpg",
      cover:"../../assets/img/editors/cover-delcourt.jpg",
      location:"Paris, France",
      phone:"01 56 03 92 20",
      mother:"Groupe Delcourt",
      id:5,
    },

    {
      title:"Éditions Soleil",
      categories:["BD","Comics","Mangas","Livres jeunesse"],
      website:"https://www.editions-soleil.fr/",
      email:"projets@editions-delcourt.fr",
      pp:"../../assets/img/editors/pp-soleil.png",
      cover:"../../assets/img/editors/cover-soleil.jpg",
      location:"Paris, France",
      phone:"01 56 03 92 20",
      mother:"Groupe Delcourt",
      id:6,
    },
    {
      title:"Soleil Manga",
      categories:["Mangas"],
      website:"https://www.editions-soleil.fr/",
      email:"accueil-paris@groupedelcourt.com",
      pp:"../../assets/img/editors/pp-soleil-manga.jpg",
      cover:"../../assets/img/editors/cover-soleil-manga.jpg",
      location:"Wasquehal, France",
      phone:"03 20 27 59 59",
      mother:"Groupe Delcourt",
      id:26,
    },
    {
      title:"Les Éditions La croisée",
      categories:["Livres"],
      website:"https://www.editions-lacroisee.fr/",
      email:"eheurtebize@editions-delcourt.fr",
      pp:"../../assets/img/editors/pp-la-croisee.png",
      cover:"../../assets/img/editors/cover-la-croisee.png",
      location:"Paris, France",
      phone:"01 43 38 83 81",
      mother:"Groupe Delcourt",
      id:7,
    },
    {
      title:"Les Éditions Marchialy",
      categories:["Livres"],
      website:"https://editions-marchialy.fr/",
      email:"contact@editions-marchialy.fr",
      pp:"../../assets/img/editors/pp-marchialy.png",
      cover:"../../assets/img/editors/cover-marchialy.jpg",
      location:"Paris, France",
      phone:"01 56 03 92 20",
      mother:"Groupe Delcourt",
      id:8,
    },
    {
      title:"Les Avrils",
      categories:["Livres"],
      website:"https://www.lesavrils.fr/",
      email:"projets@editions-delcourt.fr",
      pp:"../../assets/img/editors/pp-les-avrils.png",
      cover:"../../assets/img/editors/cover-les-avrils.jpg",
      location:"Paris, France",
      mother:"Groupe Delcourt",
      phone:"01 56 03 92 20",
      id:9,
    },
    {
      title:"Éditions Dargaud",
      categories:["BD"],
      website:"https://www.dargaud.com/",
      email:"contact@dargaud.fr",
      pp:"../../assets/img/editors/pp-dargaud.png",
      cover:"../../assets/img/editors/cover-dargaud.png",
      location:"Paris, France",
      phone:"01 53 26 32 32",
      id:10,
    },
    {
      title:"Casterman",
      categories:["BD","Livres jeunesse","Mangas"],
      website:"https://www.casterman.com/",
      email:"manuscritsbd@casterman.com",
      pp:"../../assets/img/editors/pp-casterman.jpg",
      cover:"../../assets/img/editors/cover-casterman.png",
      location:"Bruxelles, Belgique",
      phone:"04 66 74 59 84",
      id:11,
    },
    {
      title:"Editions Daniel Maghen",
      categories:["BD","Artbook","Livres jeunesse"],
      website:"https://www.danielmaghen-editions.com/",
      email:"vincentodin@gmail.com",
      pp:"../../assets/img/editors/pp-daniel-maghen.jpg",
      cover:"../../assets/img/editors/cover-daniel-maghen.png",
      location:"Paris, France",
      phone:"01 42 84 37 39",
      id:12,
    },
    {
      title:"Le Potager Moderne",
      categories:["BD"],
      website:"https://potagermoderne.fr/",
      email:"projet@potagermoderne.fr",
      pp:"../../assets/img/editors/pp-potager-moderne.png",
      cover:"../../assets/img/editors/cover-potager-moderne.png",
      location:"Maxéville, France",
      id:13,
    },
    {
      title:"Mama Éditions",
      categories:["Livres"],
      website:"https://www.mamaeditions.com/",
      email:"manuscrits@mamaeditions.com",
      pp:"../../assets/img/editors/pp-mama.jpg",
      cover:"../../assets/img/editors/cover-mama-edition.png",
      location:"Paris, France",
      phone:"01 77 32 54 36",
      id:14,
    },
    {
      title:"Hachette Comics",
      categories:["Comics"],
      website:"https://www.hachette.fr/editeur/hachette-comics",
      pp:"../../assets/img/editors/pp-hachette-comics.jpg",
      cover:"../../assets/img/editors/cover-hachette-comics.png",
      location:"Vanves, France",
      mother:"Hachette",
      phone:"01 60 39 65 14",
      id:16,
    },
    {
      title:"Akileos",
      categories:["BD"],
      website:"http://www.akileos.com/",
      email:"info@akileos.com",
      pp:"../../assets/img/editors/pp-akileos.png",
      cover:"../../assets/img/editors/cover-akileos.jpg",
      location:"Talence, France",
      phone:"06 49 23 97 07",
      id:17,
    },
    {
      title:"Éditions Mosquito",
      categories:["BD"],
      website:"http://www.editionsmosquito.com/",
      email:"mosquito.editions@wanadoo.fr",
      pp:"../../assets/img/editors/pp-mosquito.jpeg",
      cover:"../../assets/img/editors/cover-mosquito.png",
      location:"Saint-Egrève, France",
      phone:"06 49 23 97 07",
      id:18,
    },
    {
      title:"Delirium",
      categories:["BD"],
      website:"https://labeldelirium.com/contact/",
      email:"laurent@labeldelirium.com",
      pp:"../../assets/img/editors/pp-delirium.png",
      cover:"../../assets/img/editors/cover-delirium.png",
      location:"Nogent-sur-Marne, France",
      phone:"07 61 35 66 65",
      id:19,
    },
    {
      title:"les Éditions 100 bulles",
      categories:["BD","Artbook"],
      website:"http://100bulles.blogspot.com/",
      email:"100bulles@laposte.net",
      pp:"../../assets/img/editors/pp-100-bulles.png",
      cover:"../../assets/img/editors/cover-100-bulles.png",
      location:"Arles, France",
      id:20,
    },
    {
      title:"Des ronds dans l'O",
      categories:["BD","Livres jeuness","Artbook"],
      website:"https://www.desrondsdanslo.com/",
      email:"contact@desrondsdanslo.com",
      pp:"../../assets/img/editors/pp-ronds-dans-lo.jpg",
      cover:"../../assets/img/editors/cover-ronds-dans-lo.png",
      location:"Vincennes, France",
      phone:"01 48 76 10 27",
      id:21,
    },
    {
      title:"Éditions de la gouttière",
      categories:["BD","Livres jeuness"],
      website:"http://editionsdelagouttiere.com/",
      email:"manuscrits@editionsdelagouttiere.com",
      pp:"../../assets/img/editors/pp-la-gouttiere.png",
      cover:"../../assets/img/editors/cover-la-gouttiere.png",
      location:"Amiens, France",
      phone:"03 22 72 36 11",
      id:22,
    },
    {
      title:"Pow Pow",
      categories:["BD","Livres jeunesse"],
      email:"info@editionspowpow.com",
      website:"https://editionspowpow.com/",
      pp:"../../assets/img/editors/pp-pow-pow.jpg",
      cover:"../../assets/img/editors/cover-pow-pow.png",
      location:"Saint-Laurent, Québec, Canada",
      phone:"01 45 15 19 70",
      id:23,
    },
    {
      title:"Kana",
      categories:["Mangas"],
      website:"https://www.kana.fr/",
      pp:"../../assets/img/editors/pp-kana.png",
      cover:"../../assets/img/editors/cover-kana.jpg",
      location:"Paris, France",
      mother:"Dargaud",
      phone:"01 46 82 73 16",
      id:24,
    },
    {
      title:"Kurokawa",
      categories:["Mangas"],
      website:"https://www.kurokawa.fr/",
      pp:"../../assets/img/editors/pp-kurokawa.png",
      cover:"../../assets/img/editors/cover-kurokawa.png",
      location:"Paris, France",
      phone:" 06 60 64 03 11",
      id:25,
    },
    {
      title:"Bamboo Édition",
      categories:["BD"],
      website:"https://www.bamboo.fr/",
      email:"contact@bamboo.fr",
      pp:"../../assets/img/editors/pp-bamboo.png",
      cover:"../../assets/img/editors/cover-bamboo.jpg",
      location:"Charnay les Mâcon, France",
      phone:" 03 85 34 99 09",
      id:27,
    },
    {
      title:"Doki-Doki",
      categories:["Mangas"],
      website:"https://www.doki-doki.fr/",
      email:"contact@bamboo.fr",
      pp:"../../assets/img/editors/pp-doki-doki.jpg",
      cover:"../../assets/img/editors/cover-doki-doki.jpg",
      location:"Charnay les Mâcon, France",
      phone:" 03 85 34 99 09",
      id:28,
    },
    {
      title:"Drakoo",
      categories:["BD"],
      website:"https://www.drakoo.fr/",
      email:"contact@bamboo.fr",
      pp:"../../assets/img/editors/pp-drakoo.png",
      cover:"../../assets/img/editors/cover-drakoo.png",
      location:"Charnay les Mâcon, France",
      phone:" 03 85 34 99 09",
      id:29,
    },
    {
      title:"Grand Angle",
      categories:["BD"],
      website:"https://www.angle.fr/",
      email:"contact@bamboo.fr",
      pp:"../../assets/img/editors/pp-grand-angle.png",
      cover:"../../assets/img/editors/cover-grand-angle.png",
      location:"Charnay les Mâcon, France",
      phone:" 03 85 34 99 09",
      id:30,
    },
    {
      title:"Dupuis",
      categories:["BD"],
      website:"https://www.dupuis.com/",
      email:"infos.dupuis@gmail.com",
      pp:"../../assets/img/editors/pp-dupuis.png",
      cover:"../../assets/img/editors/cover-dupuis.jpg",
      location:"Paris, France",
      phone:"01 70 38 56 00",
      id:31,
    },
    {
      title:"Le Lombard",
      categories:["BD"],
      website:"https://www.lelombard.com/",
      pp:"../../assets/img/editors/pp-le-lombard.jpg",
      cover:"../../assets/img/editors/cover-lombard.jpg",
      location:"Bruxelles, Belgique",
      phone:"01 53 26 32 32",
      id:31,
    },
   
    
  ];

  list_of_editors_selected=[];
  show_editors=false;
  indexes_selected={};
  box_checked={};
  selectBox(checked,i){
    if(checked){
      this.navbar.add_page_visited_to_history(`/linkcollab/select_editor/${i}/${this.list_of_editors[i].title}`,this.device_info ).pipe( takeUntil(this.ngUnsubscribe) ).subscribe();
      this.indexes_selected[i]=true;
      this.box_checked[i]=true;
       //this.list_of_editors_selected.splice(0,0,this.list_of_editors[i]); quand on aura des collaborateurs
      //this.show_editors=true;
    }
    else{
      this.navbar.add_page_visited_to_history(`/linkcollab/unselect_editor/${i}/${this.list_of_editors[i].title}`,this.device_info ).pipe( takeUntil(this.ngUnsubscribe) ).subscribe();
      this.box_checked[i]=false;
      this.remove_editor(i)
    }
    
    this.cd.detectChanges();
  }

  remove_editor(i){
    this.box_checked[i]=false;
    this.indexes_selected[i]=false;
    /*this.list_of_editors_selected.splice(i,1)  quand on aura des collaborateurs
    if(this.list_of_editors_selected.length==0){
      this.show_editors=false;
    }*/
    this.cd.detectChanges();
  }

  set_thumbnails_width(){
    if(this.EditorContainer && this.thumbnails){
      this.scrollobs = merge(
        fromEvent(window, 'scroll'),
      );
      this.cd.detectChanges()
      let with_to_set=this.EditorContainer.nativeElement.offsetWidth/4;
      
      
      if(this.EditorContainer.nativeElement.offsetWidth<650){
        with_to_set=(this.EditorContainer.nativeElement.offsetWidth<450)?this.EditorContainer.nativeElement.offsetWidth:450;
      }
      else if(this.EditorContainer.nativeElement.offsetWidth<950){
        with_to_set=this.EditorContainer.nativeElement.offsetWidth/2;
      }
      else if(this.EditorContainer.nativeElement.offsetWidth<1600){
        with_to_set=this.EditorContainer.nativeElement.offsetWidth/3;
      }
      
      for ( let i=0;i< this.thumbnails.toArray().length;i++ ) {
        this.rd.setStyle( this.thumbnails.toArray()[i].nativeElement, "width", with_to_set-10 +"px" );
        this.cd.detectChanges()
      }
    }
  
  }

  pictures_loaded={}
  load_pictures(name){
    this.pictures_loaded[name]=true;
  }

  submite_project(){
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:false, text:"Cette option n'est pas encore disponible ! Vous pouvez néanmoins soumettre vos projets directement depuis la page de profil de nos éditeurs partenaires."},
      panelClass: "popupConfirmationClass",
    });
    
    /*const dialogRef = this.dialog.open(PopupApplyComponent, {
      data: {},
      panelClass: "popupLinkcollabApplyClass",
    });*/

  }


  filters_opened=false;
  open_filters_editor(){
    this.filters_opened=!this.filters_opened;
  }


  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    this.title.setTitle('LinkArts – Collaboration éditoriale');
    this.meta.updateTag({ name: 'description', content: "Bienvenue sur LinkArts, le site web dédié à la collaboration éditorale, pour les artistes et les éditeurs." });
  }


}
