import { Component, OnInit, ChangeDetectorRef, HostListener, ViewChild } from '@angular/core';
import {ElementRef, Renderer2} from '@angular/core';
import { NavbarService } from '../services/navbar.service';
import { Ads_service } from '../services/ads.service';
import { MatDialog } from '@angular/material/dialog';
import { trigger, transition, style, animate } from '@angular/animations';
import { PopupLinkcollabFiltersComponent } from '../popup-linkcollab-filters/popup-linkcollab-filters.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConstantsService } from '../services/constants.service';

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
        ])
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
    private cd: ChangeDetectorRef,
    private Ads_service:Ads_service,
    public dialog: MatDialog,
    private constants:ConstantsService,
    private fb: FormBuilder
    ) {
      navbar.visibility_observer_font.subscribe(font=>{
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




  category_index:number = -1;

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
  ngOnInit() {
    let THIS=this;
    window.scroll(0,0);
    this.open_category(0, true);

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
    
  ngAfterViewInit() {

    this.initialize_swiper();
    
    this.initialize_swiper2();
  }

  innerWidth: number;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
    if( this.homeLinkcollabSelect ) {
      this.homeLinkcollabSelect.close();
    }

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
    this.type_of_project="none";
    this.author="none";
    this.target="none";
    this.type_of_service='none';
    this.offer_or_demand='none';
    this.type_of_remuneration="none";
    this.sorting="pertinence";

    if(i==0){
      this.remuneration=false;
      this.service=false;
      this.get_sorted_ads();
    }
    else if(i==1){
      this.remuneration=true;
      this.service=false;
      this.get_sorted_ads();
    }
    else{
      this.remuneration=false;
      this.service=true;
      this.get_sorted_ads();
    }
    this.category_index=i;
    this.cd.detectChanges();
    window.dispatchEvent(new Event('resize'));
    return;
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
            spaceBetween: 20,
            simulateTouch: false,
            allowTouchMove: false,
          }
        },

        navigation: {
          nextEl: '.swiper-button-next.first',
          prevEl: '.swiper-button-prev.first',
        },
      })
    }
  }

  swiper2:any;
  @ViewChild("swiperCategories2") swiperCategories2:ElementRef;
  initialize_swiper2() {

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
    this.Ads_service.get_sorted_ads_linkcollab(this.type_of_project,this.author,this.target,this.remuneration,this.service,this.type_of_remuneration,this.type_of_service,this.offer_or_demand,this.sorting,this.offset_ads,this.compteur_ads).subscribe(r=>{
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


  open_more_filters() {
    const dialogRef = this.dialog.open(PopupLinkcollabFiltersComponent, {
      data: { 
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
    }).afterClosed().subscribe(
      result => {
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
      });
  }

}
