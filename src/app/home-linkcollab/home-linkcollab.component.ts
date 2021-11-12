import { Component, OnInit, ChangeDetectorRef, HostListener, ViewChildren,ViewChild, QueryList } from '@angular/core';
import {ElementRef, Renderer2} from '@angular/core';
import { NavbarService } from '../services/navbar.service';
import { Ads_service } from '../services/ads.service';
import { MatDialog } from '@angular/material/dialog';
import { trigger, transition, style, animate } from '@angular/animations';
import { PopupLinkcollabFiltersComponent } from '../popup-linkcollab-filters/popup-linkcollab-filters.component';
import { FormBuilder, FormGroup,FormControl } from '@angular/forms';
import { ConstantsService } from '../services/constants.service';
import { Edtior_Projects } from '../services/editor_projects.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { NotationService } from '../services/notation.service';
import { Subscribing_service } from '../services/subscribing.service';
import {date_in_seconds} from '../helpers/dates';
import { merge, fromEvent } from 'rxjs';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { Meta, Title } from '@angular/platform-browser';
import { DeviceDetectorService } from 'ngx-device-detector';
import { PopupApplyComponent } from '../popup-apply/popup-apply.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { first } from 'rxjs/operators';
import { LoginComponent } from '../login/login.component';

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
    private Edtior_Projects:Edtior_Projects,
    private NotationService:NotationService,
    private Subscribing_service:Subscribing_service,
    private Profile_Edition_Service:Profile_Edition_Service,
    private router: Router,
    public dialog: MatDialog,
    private constants:ConstantsService,
    private fb: FormBuilder,
    private title: Title,
    private meta: Meta,
    private route: ActivatedRoute, 
    private location: Location,
    private ConstantsService:ConstantsService,
    
    ) {
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
    this.navbar.setActiveSection(1);
    this.navbar.show();

    route.data.pipe( first() ).subscribe(resp => {
      this.user=resp.user[0];
      
    })
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

  user:any;
  category_index:number = -1;

  category:string="none";
  type_of_project:string="none";
  author:string="none";
  target:string="none";
  sorting:string="récent";
  list_of_ads:any[]=[];
  list_of_ads_received=false;
  skeleton_array = Array(5);
  now_in_seconds=Math.trunc( new Date().getTime()/1000);

  ads_types = this.constants.ads_types;

  ads_remuneration_types =this.constants.price_types_remunerated;
  ads_services_types=  this.constants.price_types_services;
  ads_descriptions = this.constants.ads_descriptions;



  list_of_categories =["Tout"].concat(this.ConstantsService.list_of_categories);
  list_of_genres=this.ConstantsService.list_of_genres;
  list_of_times= ["Date de réception ASC","Date de réception DESC","Date de retour attendu ASC","Date de retour attendu DESC"];
  list_of_pertinences =["Tout","Nombre de visites du profil","Nombre d'abonnés","Nombre d'œuvres","Nombre de bandes dessinées","Nombre de dessins","Nombre d'écrits","Nombre d'annonces","Mentions vues","Mentions j'aime","Mentions j'adore"]
  list_of_formulas=["Tout","Express","Standard"];


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

    this.get_editors_images()
    this.f1 = this.fb.group({
      type_of_project: [this.type_of_project],
      author: [this.author],
      target: [this.target],
      type_of_service: [this.type_of_service],
      offer_or_demand: [this.offer_or_demand],
      type_of_remuneration: [this.type_of_remuneration],
      sorting: [this.sorting],
    })
    
    this.navbar.add_page_visited_to_history(`/linkcollab/home_depot`,this.device_info ).pipe( first() ).subscribe();
    this.device_info = this.deviceService.getDeviceInfo().browser + ' ' + this.deviceService.getDeviceInfo().deviceType + ' ' + this.deviceService.getDeviceInfo().os + ' ' + this.deviceService.getDeviceInfo().os_version;
    window.scroll(0,0);
    

    this.category_index = this.route.snapshot.data['category'];
    this.update_meta_data(this.category_index);


    window.scroll(0,0);
    this.open_category(this.category_index, false);
    this.update_meta_data(this.category_index);

    this.get_user_stats();

    this.ini_form();
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
    this.sorting="récent";

    if(i==1){
      this.navbar.add_page_visited_to_history(`/home/benev`,this.device_info ).pipe( first() ).subscribe();
      this.remuneration=false;
      this.service=false;
      this.get_sorted_ads();
      this.location.go('/linkcollab/voluntary-collaborations');
    }
    else if(i==2){
      this.navbar.add_page_visited_to_history(`/home/remuneration`,this.device_info ).pipe( first() ).subscribe();
      this.remuneration=true;
      this.service=false;
      this.get_sorted_ads();
      this.location.go('/linkcollab/remunerated-collaborations');
    }
    else{
      this.navbar.add_page_visited_to_history(`/linkcollab/depot`,this.device_info ).pipe( first() ).subscribe();
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
    this.cd.detectChanges();

    return;
  }


  update_meta_data(i : number) {
    if( i==0 ) {
      this.title.setTitle("LinkCollab – Recherche d'éditeurs et d'artistes");
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

    this.cd.detectChanges();

    if( this.swiper2 ) {
      this.swiper2.destroy();
    }
    
    if( this.swiperCategories2 ) {

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
        observeParents:'true',
        observeSlideChildren:'true',
        watchSlidesProgress:'true',
        
      })

    }
  }
  

  sectionChange2(e:any) {
    this.open_category(e.value, false);
  }


  change_select1(e:any) {
    this.navbar.add_page_visited_to_history(`/linkcollab/change_select1/${e.value}`,this.device_info ).pipe( first() ).subscribe();
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
    this.navbar.add_page_visited_to_history(`/linkcollab/change_select2/${e.value}`,this.device_info ).pipe( first() ).subscribe();
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
    this.navbar.add_page_visited_to_history(`/linkcollab/change_select3/${e.value}`,this.device_info ).pipe( first() ).subscribe();
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
    this.navbar.add_page_visited_to_history(`/linkcollab/change_select4/${e.value}`,this.device_info ).pipe( first() ).subscribe();
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
    this.navbar.add_page_visited_to_history(`/linkcollab/change_select5/${e.value}`,this.device_info ).pipe( first() ).subscribe();
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
    this.navbar.add_page_visited_to_history(`/linkcollab/change_select6/${e.value}`,this.device_info ).pipe( first() ).subscribe();
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
    this.navbar.add_page_visited_to_history(`/linkcollab/change_select7/${e.value}`,this.device_info ).pipe( first() ).subscribe();
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
      if( this.sorting == "récent" ) {
        return;
      }
      this.sorting="récent";
    }
    this.get_sorted_ads();
  }

  change_select8(e:any) {
    this.navbar.add_page_visited_to_history(`/linkcollab/change_select8/${e.value}`,this.device_info ).pipe( first() ).subscribe();
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
      if( this.sorting == "récent" ) {
        return;
      }
      this.sorting="récent";
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
    this.Ads_service.get_sorted_ads_linkcollab(this.type_of_project,this.author,this.target,this.remuneration,this.service,this.type_of_remuneration,this.type_of_service,this.offer_or_demand,this.sorting,this.offset_ads,this.compteur_ads).pipe( first() ).subscribe(r=>{
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

        
        filter0:this.list_of_categories,
        filter1:this.list_of_genres,
        filter2:this.list_of_pertinences,
        filter3:this.list_of_times,
        filter4:this.list_of_formulas,

      },
      panelClass: "popupFiltersComponentClass",
    }).afterClosed().pipe( first() ).subscribe(
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
      this.navbar.add_page_visited_to_history(`/linkcollab/change_select_section0/tout`,this.device_info ).pipe( first() ).subscribe();
      if( this.category == "none" ) {
        return;
      }
      this.category="none";
    }
    else{
      this.navbar.add_page_visited_to_history(`/linkcollab/change_select_section0/${e.value}`,this.device_info ).pipe( first() ).subscribe();
      if( this.category == e.value ) {
        return;
      }
      this.category= e.value;
    }
    this.cd.detectChanges();
    this.set_thumbnails_width();
  }



 
  open_website(i){
    if(this.list_of_editors[i].id>3000){
      return this.list_of_editors[i].page;
    }
    else{
      return this.list_of_editors[i].website;
    }
    
  }



  get_editors_images(){
    for(let i=0;i<this.list_of_editors.length;i++){
      this.Edtior_Projects.get_editor_pp(this.list_of_editors[i].pp_name).subscribe(r=>{
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        this.list_of_editors[i].pp=url;
      })

      this.Edtior_Projects.get_editor_cover(this.list_of_editors[i].cover_name).subscribe(r=>{
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        this.list_of_editors[i].cover=url;
      })
    }
  }
  public searchText:any;
  is_a_special_pp={"Kana":true,"les Éditions 100 bulles":true,"Les Avrils":true,"Éditions Soleil":true,"Les Éditions La croisée":true,"Drakoo":true};
  is_a_special_cover={"Kana":true,"les Éditions 100 bulles":true,"Les Avrils":true,"Éditions Soleil":true,"Les Éditions La croisée":true,"Drakoo":true}
  
  
  
  /******************************  ATTENTION PP ET COVER SUR VRAI SITE *************************/
  list_of_editors = [

    
    {
      title:"Éditions Tartamudo",
      nickname:"Tartamudo",
      categories:["BD","Mangas"],
      website:"https://tartamudobd.wordpress.com/",
      page:"https://www.linkarts.fr/account/Tartamudo",
      email:"lisez-moi@wanadoo.fr",
      pp_name:"pp-tartamundo.jpeg",
      cover_name:"cover-tartamundo.jpg",
      location:"Toulon, France",
      description:"Tartamudo est une maison d'édition BD indépendante depuis 1999.",
      phone:"+33 4 94 41 01 18",
      pp:null,
      cover:null,
      id:3769,
      associate:true,
      standard_delay:"4m",
      express_delay:"1m",
      standard_price:0,
      express_price:6,
    },
    {
      title:"Éditions Yume",
      nickname:"Yume",
      categories:["Mangas","BD","Livres"],
      website:"https://www.yume-edition.fr/",
      page:"https://www.linkarts.fr/account/Yume",
      email:"contact@yume-edition.fr",
      description:"YUME ÉDITION est un éditeur indépendant de mangas et de romans qui édite et anime",
      pp_name:"pp-yume.png",
      cover_name:"cover-yume.png",
      location:"Noisy-le-grand, France",
      id:5498,
      associate:true,
      standard_delay:"4m",
      express_delay:"1m",
      standard_price:0,
      express_price:6,
      pp:null,
      cover:null,
    },
    {
      title:"Éditions Swikie",
      nickname:"swikie",
      categories:["BD","Comics"],
      website:"https://www.swikie.com/",
      page:"https://www.linkarts.fr/account/swikie",
      email:"contact@swikie.com",
      description:"Maison d'édition française spécialisée dans la publication et la diffusion de BD et Comics.",
      pp_name:"pp-swikie.png",
      cover_name:"cover-swikie.png",
      location:"Paris, France",
      phone:"+33 9 70 75 52 23",
      id:5794,
      associate:true,
      standard_delay:"4m",
      express_delay:"1m",
      standard_price:0,
      express_price:6,
      pp:null,
      cover:null,
    },
    {
      title:"Mon autre France",
      nickname:"EMAF",
      categories:["BD","Comics","Mangas","Livres","Livres jeunesse"],
      website:"https://www.monautrefrance.com/",
      page:"https://www.linkarts.fr/account/EMAF",
      email:"contact@monautrefrance.com",
      description:"La maison d’édition Mon autre France est née en janvier 2020 à Saint-Pierre et Miquelon.",
      pp_name:"pp-emaf.png",
      cover_name:"cover-emaf.png",
      location:"Saint-pierre-et-miquelon, France",
      id:6005,
      associate:true,
      standard_delay:"1m",
      express_delay:"1m",
      standard_price:0,
      express_price:6,
      pp:null,
      cover:null,
    },
    {
      title:"Editions L'Oeuf",
      nickname:"L'Oeuf",
      categories:["BD"],
      website:"http://www.editions-loeuf.com/",
      page:"https://www.linkarts.fr/account/L'Oeuf",
      email:"editions.loeuf@gmail.com",
      description:"L’Œuf est une maison d’édition associative née en 1998 d’un collectif d’auteurs et autrices.",
      pp_name:"pp-oeuf.jpg",
      cover_name:"cover-oeuf.png",
      location:"Rennes, Bretagne, France",
      id:8712,
      associate:true,
      standard_delay:"4m",
      express_delay:"1m",
      standard_price:0,
      express_price:6,
      pp:null,
      cover:null,
    },

    {
      title:"Ewing Publication",
      nickname:"EwingPublication",
      categories:["Livres","Livres jeunesse","BD","Comics","Mangas"],
      website:"https://www.monautrefrance.com/",
      page:"https://www.linkarts.fr/account/EwingPublication",
      email:"publication@masonewingcorp.com",
      description:"Ewing Publication est une maison d’édition, filiale de la holding Mason Ewing Corporation basée aux États-Unis. Elle fut créée en septembre 2019 par Mason Ewing, élu premier styliste et producteur de cinéma malvoyant au monde !",
      pp_name:"pp-ewing.jpg",
      cover_name:"cover-ewing.jpg",
      location:"Clichy, France",
      id:6738,
      associate:true,
      standard_delay:"1s",
      express_delay:"1s",
      standard_price:5,
      express_price:10,
      pp:null,
      cover:null,
    },
    
    {
      title:"Éditions Glénat",
      categories:["BD","Comics","Mangas","Livres","Livres jeunesse"],
      website:"https://www.glenat.com/",
      email:"mcg@glenat.com",
      pp_name:"pp-glenat.png",
      cover_name:"cover-glenat.jpg",
      location:"Grenoble, France",
      phone:"04 76 88 75 75",
      mother:"Éditions Glénat",
      id:1,
      pp:null,
      cover:null,
    },
    {
      title:"Éditions Quatre Fleuves",
      categories:["Livres jeunesse"],
      website:"https://www.glenat.com/livres-jeunesse/collections/editions-quatre-fleuves",
      pp_name:"pp-Editions_Quatre_Fleuves.jpg",
      cover_name:"cover-quatre-fleuves.jpg",
      location:"Grenoble, France",
      mother:"Éditions Glénat",
      id:2,
      pp:null,
      cover:null,
    },
    {
      title:"Kazé",
      categories:["Mangas"],
      website:"http://www.kazemanga.fr/",
      email:"contact@vizeurope.com",
      pp_name:"pp-kaze.png",
      cover_name:"cover-kaze.jpg",
      location:"Paris, France",
      phone:"01 48 21 00 07",
      id:3,
      pp:null,
      cover:null,
    },
    {
      title:"Pika Édition",
      categories:["Mangas"],
      website:"https://www.pika.fr/",
      email:"mypika@pika.fr",
      pp_name:"pp-pika.png",
      cover_name:"cover-pika.jpg",
      location:"Vanves, France",
      phone:"01 41 10 23 90",
      id:4,
      pp:null,
      cover:null,
    },
    {
      title:"Éditions Delcourt",
      categories:["BD","Comics","Mangas","Livres jeunesse"],
      website:"https://www.editions-delcourt.fr/",
      email:"projets@editions-delcourt.fr",
      pp_name:"pp-delcourt.jpg",
      cover_name:"cover-delcourt.jpg",
      location:"Paris, France",
      phone:"01 56 03 92 20",
      mother:"Groupe Delcourt",
      id:5,
      pp:null,
      cover:null,
    },

    {
      title:"Éditions Soleil",
      categories:["BD","Comics","Mangas","Livres jeunesse"],
      website:"https://www.editions-soleil.fr/",
      email:"projets@editions-delcourt.fr",
      pp_name:"pp-soleil.png",
      cover_name:"cover-soleil.jpg",
      location:"Paris, France",
      phone:"01 56 03 92 20",
      mother:"Groupe Delcourt",
      id:6,
      pp:null,
      cover:null,
    },
    {
      title:"Soleil Manga",
      categories:["Mangas"],
      website:"https://www.editions-soleil.fr/",
      email:"accueil-paris@groupedelcourt.com",
      pp_name:"pp-soleil-manga.jpg",
      cover_name:"cover-soleil-manga.jpg",
      location:"Wasquehal, France",
      phone:"03 20 27 59 59",
      mother:"Groupe Delcourt",
      id:26,
      pp:null,
      cover:null,
    },
    {
      title:"Les Éditions La croisée",
      categories:["Livres"],
      website:"https://www.editions-lacroisee.fr/",
      email:"eheurtebize@editions-delcourt.fr",
      pp_name:"pp-la-croisee.png",
      cover_name:"cover-la-croisee.png",
      location:"Paris, France",
      phone:"01 43 38 83 81",
      mother:"Groupe Delcourt",
      id:7,
      pp:null,
      cover:null,
    },
    {
      title:"Les Éditions Marchialy",
      categories:["Livres"],
      website:"https://editions-marchialy.fr/",
      email:"contact@editions-marchialy.fr",
      pp_name:"pp-marchialy.png",
      cover_name:"cover-marchialy.jpg",
      location:"Paris, France",
      phone:"01 56 03 92 20",
      mother:"Groupe Delcourt",
      id:8,
      pp:null,
      cover:null,
    },
    {
      title:"Les Avrils",
      categories:["Livres"],
      website:"https://www.lesavrils.fr/",
      email:"projets@editions-delcourt.fr",
      pp_name:"pp-les-avrils.png",
      cover_name:"cover-les-avrils.jpg",
      location:"Paris, France",
      mother:"Groupe Delcourt",
      phone:"01 56 03 92 20",
      id:9,
      pp:null,
      cover:null,
    },
    {
      title:"Éditions Dargaud",
      categories:["BD"],
      website:"https://www.dargaud.com/",
      email:"contact@dargaud.fr",
      pp_name:"pp-dargaud.png",
      cover_name:"cover-dargaud.png",
      location:"Paris, France",
      phone:"01 53 26 32 32",
      id:10,
      pp:null,
      cover:null,
    },
    {
      title:"Casterman",
      categories:["BD","Livres jeunesse","Mangas"],
      website:"https://www.casterman.com/",
      email:"manuscritsbd@casterman.com",
      pp_name:"pp-casterman.jpg",
      cover_name:"cover-casterman.png",
      location:"Bruxelles, Belgique",
      phone:"04 66 74 59 84",
      id:11,
      pp:null,
      cover:null,
    },
    {
      title:"Editions Daniel Maghen",
      categories:["BD","Artbook","Livres jeunesse"],
      website:"https://www.danielmaghen-editions.com/",
      email:"vincentodin@gmail.com",
      pp_name:"pp-daniel-maghen.jpg",
      cover_name:"cover-daniel-maghen.png",
      location:"Paris, France",
      phone:"01 42 84 37 39",
      id:12,
      pp:null,
      cover:null,
    },
    {
      title:"Le Potager Moderne",
      categories:["BD"],
      website:"https://potagermoderne.fr/",
      email:"projet@potagermoderne.fr",
      pp_name:"pp-potager-moderne.png",
      cover_name:"cover-potager-moderne.png",
      location:"Maxéville, France",
      id:13,
      pp:null,
      cover:null,
    },
    {
      title:"Mama Éditions",
      categories:["Livres"],
      website:"https://www.mamaeditions.com/",
      email:"manuscrits@mamaeditions.com",
      pp_name:"pp-mama.jpg",
      cover_name:"cover-mama-edition.png",
      location:"Paris, France",
      phone:"01 77 32 54 36",
      id:14,
      pp:null,
      cover:null,
    },
    {
      title:"Hachette Comics",
      categories:["Comics"],
      website:"https://www.hachette.fr/editeur/hachette-comics",
      pp_name:"pp-hachette-comics.jpg",
      cover_name:"cover-hachette-comics.png",
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
      pp_name:"pp-akileos.png",
      cover_name:"cover-akileos.jpg",
      location:"Talence, France",
      phone:"06 49 23 97 07",
      id:17,
    },
    {
      title:"Éditions Mosquito",
      categories:["BD"],
      website:"http://www.editionsmosquito.com/",
      email:"mosquito.editions@wanadoo.fr",
      pp_name:"pp-mosquito.jpeg",
      cover_name:"cover-mosquito.png",
      location:"Saint-Egrève, France",
      phone:"06 49 23 97 07",
      id:18,
    },
    {
      title:"Delirium",
      categories:["BD"],
      website:"https://labeldelirium.com/contact/",
      email:"laurent@labeldelirium.com",
      pp_name:"pp-delirium.png",
      cover_name:"cover-delirium.png",
      location:"Nogent-sur-Marne, France",
      phone:"07 61 35 66 65",
      id:19,
    },
    {
      title:"les Éditions 100 bulles",
      categories:["BD","Artbook"],
      website:"http://100bulles.blogspot.com/",
      email:"100bulles@laposte.net",
      pp_name:"pp-100-bulles.png",
      cover_name:"cover-100-bulles.png",
      location:"Arles, France",
      id:20,
    },
    {
      title:"Des ronds dans l'O",
      categories:["BD","Livres jeuness","Artbook"],
      website:"https://www.desrondsdanslo.com/",
      email:"contact@desrondsdanslo.com",
      pp_name:"pp-ronds-dans-lo.jpg",
      cover_name:"cover-ronds-dans-lo.png",
      location:"Vincennes, France",
      phone:"01 48 76 10 27",
      id:21,
    },
    {
      title:"Éditions de la gouttière",
      categories:["BD","Livres jeuness"],
      website:"http://editionsdelagouttiere.com/",
      email:"manuscrits@editionsdelagouttiere.com",
      pp_name:"pp-la-gouttiere.png",
      cover_name:"cover-la-gouttiere.png",
      location:"Amiens, France",
      phone:"03 22 72 36 11",
      id:22,
    },
    {
      title:"Pow Pow",
      categories:["BD","Livres jeunesse"],
      email:"info@editionspowpow.com",
      website:"https://editionspowpow.com/",
      pp_name:"pp-pow-pow.jpg",
      cover_name:"cover-pow-pow.png",
      location:"Saint-Laurent, Québec, Canada",
      phone:"01 45 15 19 70",
      id:23,
    },
    {
      title:"Kana",
      categories:["Mangas"],
      website:"https://www.kana.fr/",
      pp_name:"pp-kana.png",
      cover_name:"cover-kana.jpg",
      location:"Paris, France",
      mother:"Dargaud",
      phone:"01 46 82 73 16",
      id:24,
    },
    {
      title:"Kurokawa",
      categories:["Mangas"],
      website:"https://www.kurokawa.fr/",
      pp_name:"pp-kurokawa.png",
      cover_name:"cover-kurokawa.png",
      location:"Paris, France",
      phone:" 06 60 64 03 11",
      id:25,
    },
    {
      title:"Bamboo Édition",
      categories:["BD"],
      website:"https://www.bamboo.fr/",
      email:"contact@bamboo.fr",
      pp_name:"pp-bamboo.png",
      cover_name:"cover-bamboo.jpg",
      location:"Charnay les Mâcon, France",
      phone:" 03 85 34 99 09",
      id:27,
    },
    {
      title:"Doki-Doki",
      categories:["Mangas"],
      website:"https://www.doki-doki.fr/",
      email:"contact@bamboo.fr",
      pp_name:"pp-doki-doki.jpg",
      cover_name:"cover-doki-doki.jpg",
      location:"Charnay les Mâcon, France",
      phone:" 03 85 34 99 09",
      id:28,
    },
    {
      title:"Drakoo",
      categories:["BD"],
      website:"https://www.drakoo.fr/",
      email:"contact@bamboo.fr",
      pp_name:"pp-drakoo.png",
      cover_name:"cover-drakoo.png",
      location:"Charnay les Mâcon, France",
      phone:" 03 85 34 99 09",
      id:29,
    },
    {
      title:"Grand Angle",
      categories:["BD"],
      website:"https://www.angle.fr/",
      email:"contact@bamboo.fr",
      pp_name:"pp-grand-angle.png",
      cover_name:"cover-grand-angle.png",
      location:"Charnay les Mâcon, France",
      phone:" 03 85 34 99 09",
      id:30,
    },
    {
      title:"Dupuis",
      categories:["BD"],
      website:"https://www.dupuis.com/",
      email:"infos.dupuis@gmail.com",
      pp_name:"pp-dupuis.png",
      cover_name:"cover-dupuis.jpg",
      location:"Paris, France",
      phone:"01 70 38 56 00",
      id:31,
    },
    {
      title:"Le Lombard",
      categories:["BD"],
      website:"https://www.lelombard.com/",
      pp_name:"pp-le-lombard.jpg",
      cover_name:"cover-lombard.jpg",
      location:"Bruxelles, Belgique",
      phone:"01 53 26 32 32",
      id:31,
    },
   
    
  ];


  

  myForms:any[]=[];
  form_ini=false;
  ini_form(){
    for(let i=0;i<this.list_of_editors.length;i++){
      this.myForms[i]=this.fb.group({
        checked: false
      })
    }
    this.form_ini=true;
  }

  list_of_editors_selected=[];
  show_editors=false;
  box_checked={};

  selectBox2(i){
    if(this.box_checked[i]){
      this.selectBox(false,i)
    }
    else{
      this.selectBox(true,i)
    }
  }

  selectBox(checked,i){
    if(!this.visitor_stats_retrieved){
      this.box_checked[i]=false;
      return
    }
    
    let index=this.last_emitted_projects.findIndex(item=>item.target_id==this.list_of_editors[i].id);
    if(index>=0){
      this.box_checked[i]=false;
      this.cd.detectChanges();
      let s=date_in_seconds(this.now_in_seconds,this.last_emitted_projects[index].createdAt);
      let time_left;
      if( Math.trunc(s/86400)<=1 ) {
        time_left= "1 mois";
      }
      else {
        time_left= 30-Math.trunc(s/86400) + " jours";
      }
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, 
          text:`Vous avez déjà soumis un projet auprès de cet éditeur, il y a moins de 30 jours. Vous pourrez à nouveau soumettre un projet dans ${time_left}.`},
          panelClass: "popupConfirmationClass",
      });
      dialogRef.afterClosed().pipe( first() ).subscribe(result => {
        this.box_checked[i]=false;
        this.myForms[i].controls['checked'].setValue(false);
        this.myForms[i].controls['checked'].updateValueAndValidity();
        this.cd.detectChanges();
      })
   
      
    }
    else if(checked){
      this.navbar.add_page_visited_to_history(`/linkcollab/select_editor/${i}/${this.list_of_editors[i].title}`,this.device_info ).pipe( first() ).subscribe();
      this.box_checked[i]=true;
      this.myForms[i].controls['checked'].setValue(true);
        this.myForms[i].controls['checked'].updateValueAndValidity();
      this.list_of_editors_selected.push(this.list_of_editors[i]);
      this.show_editors=true;
    }
    else{
      this.navbar.add_page_visited_to_history(`/linkcollab/unselect_editor/${i}/${this.list_of_editors[i].title}`,this.device_info ).pipe( first() ).subscribe();
      this.box_checked[i]=false;
      this.myForms[i].controls['checked'].setValue(false);
      this.myForms[i].controls['checked'].updateValueAndValidity();
      this.remove_editor(i)
    }
    
    this.cd.detectChanges();
  }

  remove_editor(i){
    this.box_checked[i]=false;
    let index=this.list_of_editors_selected.findIndex(item=>item.title==this.list_of_editors[i].title)
    this.list_of_editors_selected.splice(index,1)
    if(this.list_of_editors_selected.length==0){
      this.show_editors=false;
    }
    this.cd.detectChanges();
  }

  remove_editor_2(i){
    
    let index=this.list_of_editors.findIndex(item=>item.title==this.list_of_editors_selected[i].title)
    this.box_checked[index]=false;
    this.list_of_editors_selected.splice(i,1)
    if(this.list_of_editors_selected.length==0){
      this.show_editors=false;
    }
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

  visitor_likes:number;
  visitor_loves:number;
  visitor_views:number;
  visitor_number_of_visits:number;
  visitor_subscribers_number:number;
  visitor_number_of_comics:number;
  visitor_number_of_drawings:number;
  visitor_number_of_writings:number;
  visitor_number_of_ads:number;
  visitor_number_of_artpieces:number;
  last_emitted_projects:any[]=[];

  visitor_stats_retrieved=false;
  get_user_stats(){
    let compteur_visitor_stats=0;
    this.NotationService.get_user_public_stats(this.user.nickname).pipe( first() ).subscribe(r=>{
      this.visitor_likes=r[0].likes;
      this.visitor_loves=r[0].loves;
      this.visitor_views=r[0].views;
      compteur_visitor_stats++;
      check_visitor_stats(this);
    })

    this.Subscribing_service.get_all_subscribers_by_pseudo(this.user.nickname).pipe( first() ).subscribe(r=>{
      this.visitor_subscribers_number=r[0].length;
      compteur_visitor_stats++;
      check_visitor_stats(this);
    })
    this.navbar.get_number_of_account_viewers(this.user.id).pipe( first() ).subscribe(r=>{
      this.visitor_number_of_visits=r[0].views;
      compteur_visitor_stats++;
      check_visitor_stats(this);
    });

    this.Edtior_Projects.get_all_last_emitted_project(this.user.id).pipe( first() ).subscribe(r=>{
      if(r[0]){
        this.last_emitted_projects=r[0]
      }
      compteur_visitor_stats++;
      check_visitor_stats(this);
    });

    this.Profile_Edition_Service.retrieve_number_of_contents_by_pseudo(this.user.nickname).pipe( first() ).subscribe(r=>{
      this.visitor_number_of_comics=r[0].number_of_comics;
      this.visitor_number_of_drawings=r[0].number_of_drawings;
      this.visitor_number_of_writings=r[0].number_of_writings;
      this.visitor_number_of_ads=r[0].number_of_ads;
      this.visitor_number_of_artpieces=this.visitor_number_of_comics+ this.visitor_number_of_drawings +  this.visitor_number_of_writings;
      compteur_visitor_stats++;
      check_visitor_stats(this);
    })

    function check_visitor_stats(THIS){
      
      if(compteur_visitor_stats==5){
        THIS.visitor_stats_retrieved=true
      }
   
    }
  }


  submit_project(){

    if(this.list_of_editors_selected.length==0){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, 
          text:`Veuillez sélectionner au moins un éditeur.`},
          panelClass: "popupConfirmationClass",
      });
      return
    }
    if(this.user.status=='visitor'){
      const dialogRef = this.dialog.open(LoginComponent, {
        data: {usage:"login"},
        panelClass:"loginComponentClass"
      });
      return
    }
    
    let list_of_editors_ids=[];
    let editor_pictures={};
    let editor_nicknames={};
    let editor_names={};


    let standard_prices={};
    let standard_delays={};
    let express_prices={};
    let express_delays={};


      for(let i=0;i<this.list_of_editors_selected.length;i++){

        list_of_editors_ids.push(this.list_of_editors_selected[i].id);
        editor_pictures[this.list_of_editors_selected[i].id]=this.list_of_editors_selected[i].pp;
        editor_nicknames[this.list_of_editors_selected[i].id]=this.list_of_editors_selected[i].nickname;
        editor_names[this.list_of_editors_selected[i].id]=this.list_of_editors_selected[i].title;

        standard_prices[this.list_of_editors_selected[i].id]=this.list_of_editors_selected[i].standard_price;
        standard_delays[this.list_of_editors_selected[i].id]=this.list_of_editors_selected[i].standard_delay;
        express_delays[this.list_of_editors_selected[i].id]=this.list_of_editors_selected[i].express_delay;
        express_prices[this.list_of_editors_selected[i].id]=this.list_of_editors_selected[i].express_price;


        

      }

      // number of trendings,
      const dialogRef = this.dialog.open(PopupApplyComponent, {
        data: {
          multiple_submission:true,
          //editor
          list_of_editors_ids:list_of_editors_ids,
          editor_pictures:editor_pictures,
          editor_names:editor_names,
          editor_nicknames:editor_nicknames,
          standard_prices:standard_prices,
          standard_delays:standard_delays,
          express_prices:express_prices,
          express_delays:express_delays,
  
          //visitor
  
          visitor_id:this.user.id,
          visitor_certified:this.user.certified_account,
          visitor_name: this.user.firstname,
          visitor_nickname:this.user.nickname,
          visitor_description:this.user.primary_description,
          visitor_likes:this.visitor_likes,
          visitor_loves:this.visitor_loves,
          visitor_views:this.visitor_views,
          visitor_subscribers_number:this.visitor_subscribers_number,
          visitor_number_of_visits:this.visitor_number_of_visits,
          visitor_number_of_comics:this.visitor_number_of_comics,
          visitor_number_of_drawings:this.visitor_number_of_drawings,
          visitor_number_of_writings:this.visitor_number_of_writings,
          visitor_number_of_ads:this.visitor_number_of_ads,
          visitor_number_of_artpieces:this.visitor_number_of_artpieces,
        },
        panelClass: "popupLinkcollabApplyClass",
      })
      dialogRef.afterClosed().pipe( first() ).subscribe(result => {
        if(result){
          this.router.navigateByUrl('/account/' + this.user.nickname + "/projects" );
        }
        else{

          for(let i=0;i<this.myForms.length;i++) {
            this.myForms[i].controls['checked'].setValue(false);
            this.myForms[i].controls['checked'].updateValueAndValidity();
            this.cd.detectChanges();
          }

          this.visitor_stats_retrieved=false;
          this.list_of_editors_selected=[];
          this.show_editors=false;
          this.box_checked={};
          this.Edtior_Projects.get_all_last_emitted_project(this.user.id).pipe( first() ).subscribe(r=>{
            if(r[0]){
              this.last_emitted_projects=r[0];
            }

            this.visitor_stats_retrieved=true;
           
          });

          
        }
      })

  }


  filters_opened=false;
  open_filters_editor(){
    this.filters_opened=!this.filters_opened;
  }

  thumbnail_category_index=[]
  open_thumbnail_category(value,i){
    this.thumbnail_category_index[i]=value;
  }


  ngOnDestroy() {
    this.title.setTitle('LinkArts – Collaboration éditoriale');
    this.meta.updateTag({ name: 'description', content: "Bienvenue sur LinkArts, le site web dédié à la collaboration éditorale, pour les artistes et les éditeurs." });
  }



}
