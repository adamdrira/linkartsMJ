import { Component, OnInit, Input, ChangeDetectorRef, HostListener } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { NavbarService } from '../services/navbar.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {Profile_Edition_Service} from '../services/profile_edition.service';
import {BdOneShotService} from '../services/comics_one_shot.service';
import {BdSerieService} from '../services/comics_serie.service';
import {Drawings_Artbook_Service} from '../services/drawings_artbook.service';
import {Drawings_Onepage_Service} from '../services/drawings_one_shot.service';
import {Writing_Upload_Service} from '../services/writing.service';
import {Ads_service} from '../services/ads.service';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Route } from '@angular/compiler/src/core';
import { trigger, transition, style, animate } from '@angular/animations';


declare var Swiper: any;
declare var $: any;

@Component({
  selector: 'app-main-searchbar-results',
  templateUrl: './main-searchbar-results.component.html',
  styleUrls: ['./main-searchbar-results.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateY(0)', opacity: 0}),
          animate('400ms', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ]
    ),
  ],
})
export class MainSearchbarResultsComponent implements OnInit {

  constructor(
    private authenticationService: AuthenticationService, 
    private route: ActivatedRoute, 
    private location: Location,
    public navbar: NavbarService,
    private cd:ChangeDetectorRef,
    private sanitizer:DomSanitizer,
    private Ads_service:Ads_service,
    private Profile_Edition_Service:Profile_Edition_Service,
    public dialog: MatDialog,
    private BdOneShotService:BdOneShotService,
    private BdSerieService:BdSerieService,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private Writing_Upload_Service:Writing_Upload_Service,
    private router:Router,
  ) { 

    this.router.routeReuseStrategy.shouldReuseRoute = function() {
      return false;
    };
    this.navbar.setActiveSection(-1);
    this.navbar.show();
  }

  type_of_target="Cible";
  shinies=Array(5);
  shinies2=Array(8);
  type_of_profile_retrieved=false;
  research_string:string;
  category:string;
  type_of_profile:string;
  list_of_categories=["Utilisateurs","Annonces","Bandes dessinées","Dessins","Ecrits"];
  list_of_real_categories=["Account","Ad","Comic","Drawing","Writing"];


  first_filters_accounts=["Artistes","Artistes professionnels", "Artiste", "Artiste professionnel","Artiste professionnelle", "Maison d'édition",
  "Editeur","Editrice","Professionnels non artistes","Professionnel non artiste","Professionnelle non artiste","Passionné","Passionnée"];
  first_filters_ads=["B.D.","BD euro.","Comics","Manga","Webtoon","Dessin","Dessin dig.","Dessin trad.","Ecrit","Article","Poésie","Roman","Roman il."];
  first_filters_comics=["Comics", "BD", "Manga","Webtoon"];
  first_filters_drawings=["Traditionnel", "Digital"];
  first_filters_writings=["Article","Poésie", "Roman", "Roman illustré", "Scénario"];
  first_filters=[this.first_filters_accounts,this.first_filters_ads,this.first_filters_comics,this.first_filters_drawings,this.first_filters_writings];

  comics_tags=["Action","Aventure","Caricatural","Enfants","Epique","Esotérisme","Fanfiction","Fantaisie","Fantastique","Guerre","Héroïque","Histoire","Horreur","Humour","Josei","Journalisme","Kodomo","Nekketsu","Pantso shoto","Philosophie",
  "Policier","Religion","Romantique","Satirique","SF","Seinen","Shojo","Shonen","Sociologie","Sport","Thriller","Western","Yaoi","Yuri"];
  drawings_tags=["Abstrait","Animaux","Caricatural","Culture","Enfants","Fanart","Fanfiction","Fantaisie","Femme","Fresque","Guerre","Guerrier","Graffiti","Héroïque","Histoire","Homme","Horreur","Humour","Monstre","Paysage","Portrait",
  "Réaliste","Religion","Romantique","SF","Sociologie","Sport"];
  writings_tags=["Action","Aventure","Caricatural","Enfants","Epique","Epistolaire","Esotérisme","Fanfiction","Fantaisie","Guerre","Héroïque","Histoire","Horreur","Humour","Journalisme","Philosophie",
  "Policier","Réaliste","Religion","Romantique","Satirique","SF","Sociologie","Sport","Thriller","Western"];
  ads_targets=["Professionnel de l'édition","Professionnel non artiste","Artiste en tout genre","Auteur de bandes dessinées","Ecrivain","Dessinateur","Scénariste","Tout public"];


  accounts_favorites=["Bandes dessinées","Dessins", "Ecrits", "Annonces"];
  second_filters=[this.accounts_favorites,this.ads_targets,this.comics_tags,this.drawings_tags,this.writings_tags];


  skeleton_array = Array(5);
  
  swiper:any;

  now_in_seconds=Math.trunc( new Date().getTime()/1000);

  indice_title_selected=0;
  opened_section=0;
  first_filter_selected=-1;
  second_filter_selected=-1;
  selected_filter="Plus de filtres";

  list_of_artists:any[]=[];
  list_of_ads:any[]=[];
  list_of_comics:any[]=[];
  list_of_drawings:any[]=[];
  list_of_writings:any[]=[];

  current_page=1;
  number_of_results:number;
  number_of_pages:number;
  number_of_page_retrieved:boolean;
  display_results=false;
  display_no_results=false;
  display_no_propositions=false;
  error_page=false;
  compteur_research=0;
  compteur_propositions=0;
  show_propositions=false;
  loading_propositions=false;
  list_of_first_propositions:any[]=[];
  list_of_last_propositions:any[]=[];
  list_of_thumbnails:SafeUrl[]=[];
  pp_thumb_is_loaded:boolean[]=[];
  first_filter:string;
  second_filter:string;
  display_title=false;

  // recherche apr style et par genre 
  display_title_style_and_tags=false;
  category_to_show:string;
  ngOnInit(): void {
    
    this.opened_section = this.route.snapshot.data['section'];
    console.log( this.opened_section )
    console.log(parseInt(this.route.snapshot.paramMap.get('page')))
    //alert("Debut")
    if(this.opened_section<2){
      console.log(this.route.snapshot.paramMap.get('text'));
      this.current_page=parseInt(this.route.snapshot.paramMap.get('page'));
      this.research_string=this.route.snapshot.paramMap.get('text');
      this.category=this.route.snapshot.paramMap.get('category');
      //alert("debut 2")
      if(this.list_of_real_categories.indexOf(this.category)<0 && this.category!='All'){
        alert("pb 1")
        this.location.go('/');
        location.reload();
        return;
      }
      this.first_filter=(this.route.snapshot.paramMap.get('first_filter'))?this.route.snapshot.paramMap.get('first_filter'):"all";
      this.second_filter=(this.route.snapshot.paramMap.get('second_filter'))?this.route.snapshot.paramMap.get('second_filter'):"all";
      this.display_title=true;
      console.log( this.first_filter)
      console.log(this.second_filter)
      this.get_number_of_results_by_category();

    }
    else{
      for(let i=0;i<2;i++){
        this.list_of_categories.splice(0,1);
        this.list_of_real_categories.splice(0,1);
        this.first_filters.splice(0,1)
        this.second_filters.splice(0,1)
      }
      console.log( this.list_of_categories)
      console.log(this.list_of_real_categories)
      this.current_page=parseInt(this.route.snapshot.paramMap.get('page'));
      this.category=this.route.snapshot.paramMap.get('category');
      this.first_filter=this.route.snapshot.paramMap.get('first_filter');
      this.second_filter=this.route.snapshot.paramMap.get('second_filter');
      console.log(this.category)
      this.indice_title_selected=this.list_of_real_categories.indexOf(this.category);
      this.category_to_show = this.list_of_categories[this.indice_title_selected];
      console.log(this.indice_title_selected)
      console.log(this.category)
      console.log(this.first_filter)
      console.log(this.second_filter)
      console.log(  this.category_to_show)
      if(this.indice_title_selected<0){
        alert("pb 1");
        this.location.go('/');
        location.reload();
        return;
      }
      let index1=this.first_filters[this.indice_title_selected].indexOf(this.first_filter)
      console.log()
      if(index1<0){
        alert("pb 2");
        this.location.go('/');
        location.reload();
        return;
      }
      this.first_filter_selected=index1;
      let index2=this.second_filters[this.indice_title_selected].indexOf(this.second_filter);
      if(index1<0 &&  this.second_filter!="all"){
        alert("pb 3");
        this.location.go('/');
        location.reload();
        return;
      }
      this.second_filter_selected=index2;
      this.display_title_style_and_tags=true;
      this.display_results=true;
      this.show_tags=true;
     

      this.cd.detectChanges();
      this.initialize_swiper();
      
      this.manage_sections_sg();
      console.log( this.category)
      console.log( this.first_filter)
      console.log( this.second_filter)
    }
    
  }

  show_icon=false;
  ngAfterViewInit(){
    let THIS=this;
    $(window).ready(function () {
      THIS.show_icon=true;
    });
  }


  @ViewChild("swiperCategories") swiperCategories:ElementRef;
  initialize_swiper() {

    if( !this.swiper && this.swiperCategories ) {


      this.swiper = new Swiper( this.swiperCategories.nativeElement, {
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
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },

        observer:'true',
      })
    }

  }



  change_indice_title_selected(i){
    console.log("change indice title selected")

    if(this.indice_title_selected==i){
      return;
    }
    this.current_page=1;
    
    this.number_of_page_retrieved=false;
    this.indice_title_selected=i;
    this.first_filter_selected=-1;
    this.second_filter_selected=-1;
    this.category=this.list_of_real_categories[i];
   
    if(this.opened_section<2){
      this.first_filter="all";
      this.second_filter="all";
      this.opened_section=0;
      this.location.go(`/main-research/1/${this.research_string}/${this.category}/${this.first_filter}/${this.second_filter}`);
      this.sort_tags_and_styles(this.list_for_styles_and_tags,this.indice_title_selected);
      this.cd.detectChanges();
      this.initialize_swiper()
      this.swiper.update();
      this.cd.detectChanges();
      this.manage_sections();
    }
    else{
      console.log(this.display_title_style_and_tags)
      this.first_filter=this.first_filters[i][0];
      this.second_filter="all";
      this.first_filter_selected=0;
      console.log(this.first_filter)
      console.log(this.second_filter)
      this.location.go(`/main-research-style-and-tag/${this.current_page}/${this.category}/${this.first_filter}/${this.second_filter}`);
      this.cd.detectChanges();
      this.initialize_swiper()
      this.swiper.update();
      this.cd.detectChanges();
      this.manage_sections_sg();
    }
    
    
  }



  change_first_filter_selected(i){
    console.log("change first filter selected")
    this.number_of_page_retrieved=false;
    if(this.first_filter_selected==i){
      this.first_filter_selected=-1;
      this.first_filter="all";
      this.location.go(`/main-research/1/${this.research_string}/${this.category}/all/${this.second_filter}`);
      if(this.second_filter_selected<0){
        this.opened_section=0;
      }
      this.manage_sections();
    }
    else{
      this.first_filter_selected=i;
      this.opened_section=1;
      this.first_filter=this.first_filters[this.indice_title_selected][i];
      this.location.go(`/main-research/1/${this.research_string}/${this.category}/${this.first_filter}/${this.second_filter}`);
      this.manage_sections();
    }
    
  }

  switch_type_of_target(){
    if(this.type_of_target=="Cible"){
      this.type_of_target="Auteur"
    }
    else{
      this.type_of_target="Cible"
    }
    console.log(this.second_filter_selected)
    this.manage_sections();
    this.cd.detectChanges();
  }

  change_second_filter_selected(i){
    this.current_page=1;
    this.number_of_page_retrieved=false;
    if(this.second_filter_selected==i){
      this.second_filter_selected=-1;
      this.second_filter="all";
      this.location.go(`/main-research/1/${this.research_string}/${this.category}/${this.first_filter}/all`);
      if(this.first_filter_selected<0){
        this.opened_section=0;
      }
      this.manage_sections();
    }
    else{
      this.second_filter_selected=i;
      this.opened_section=1;
      this.second_filter=this.second_filters[this.indice_title_selected][i];
      this.location.go(`/main-research/1/${this.research_string}/${this.category}/${this.first_filter}/${this.second_filter}`);
      this.manage_sections();
    }
  }



  list_for_styles_and_tags:any;
  get_number_of_results_by_category(){
    console.log("get_number_of_results_by_category")
    this.navbar.get_number_of_results_for_categories(this.research_string).subscribe(r=>{
      console.log(r[0])
      if(r[0].result){
        this.list_for_styles_and_tags=r[0].result2;
        for(let i=0;i<r[0].result.length;i++){
          let indice=this.list_of_real_categories.indexOf(r[0].result[i].publication_category);
          if(i!=indice){
            this.list_of_real_categories.splice(i,0,this.list_of_real_categories.splice(indice,1)[0]);
            this.list_of_categories.splice(i,0,this.list_of_categories.splice(indice,1)[0]);
            this.first_filters.splice(i,0,this.first_filters.splice(indice,1)[0]);
            this.second_filters.splice(i,0,this.second_filters.splice(indice,1)[0]);
          }
          if(i==r[0].result.length-1){
            if(i!=this.list_of_real_categories.length-1){
              for(let j=i+1;j<this.list_of_real_categories.length;j++){
                this.list_of_categories.splice( this.list_of_categories.length-1,1);
                this.first_filters.splice(this.first_filters.length-1,1);
                this.second_filters.splice(this.second_filters.length-1,1);
                if(j==this.list_of_real_categories.length-1){
                  console.log(this.list_of_real_categories);
                  console.log(this.category)
                  if(this.category=="All"){
                    this.category=this.list_of_real_categories[0];
                    this.display_results=true;
                    this.sort_tags_and_styles(r[0].result2,0)

                    this.cd.detectChanges();
                    this.initialize_swiper();

                    this.manage_sections();
                  }
                  else{
                    if(this.list_of_real_categories.indexOf(this.category)>(this.list_of_categories.length-1)){
                      this.display_no_results=true;
                    }
  
                    else{
                      console.log("else ok")
                      this.indice_title_selected=this.list_of_real_categories.indexOf(this.category);
                      this.display_results=true;
                      this.sort_tags_and_styles(r[0].result2,this.indice_title_selected)
                      this.cd.detectChanges();
                      this.initialize_swiper();
                      
                      this.manage_sections();
                    }
                  }
                  
                  
                }
              }
            }
            else{
              console.log(this.list_of_real_categories);
              if(this.category=="All"){
                this.category=this.list_of_real_categories[0];
                this.display_results=true;
                this.sort_tags_and_styles(r[0].result2,0)
              }
              else{
                this.indice_title_selected=this.list_of_real_categories.indexOf(this.category);
                this.display_results=true;
                this.sort_tags_and_styles(r[0].result2,this.indice_title_selected)
              }
              
              
              
              this.cd.detectChanges();
              this.initialize_swiper();

              
              this.manage_sections();
            }
            
            
          }
          
        }
      }
      else{
        this.display_no_results=true;
      }
    })
  }
  
  show_tags=false;
  sort_tags_and_styles(result,index_category){
    console.log("sort tags")
    console.log(result)
    console.log(index_category)
    console.log(this.list_of_real_categories[index_category])
    console.log(this.first_filters[index_category])
    console.log(this.second_filters[index_category])
    
      let len=this.first_filters[index_category].length;
      for(let j=0;j<len;j++){
        let first_filter=this.first_filters[index_category][len-j-1]
        if(first_filter=="Poésie"){
          first_filter="Poetry"
        }
        if(first_filter=="Scénario"){
          first_filter="Scenario"
        }
        if(first_filter=="Roman illustré"){
          first_filter="Illustrated novel"
        }

        let index_first_filter =result.findIndex(x => x.style == first_filter && x.publication_category==this.list_of_real_categories[index_category]);
        if(index_first_filter<0){
          this.first_filters[index_category].splice(len-j-1,1);
        }
      }
  
      if(this.list_of_real_categories[index_category]!="Account"){
        let len2=this.second_filters[index_category].length;
      
        for(let j=0;j<len2;j++){
          let index_second_filter =result.findIndex(x => (x.firsttag == this.second_filters[index_category][len2-j-1] || x.secondtag == this.second_filters[index_category][len2-j-1] || x.thirdtag == this.second_filters[index_category][len2-j-1]) && x.publication_category==this.list_of_real_categories[index_category]);
          if(index_second_filter<0){
            this.second_filters[index_category].splice(len2-j-1,1);
          }
        }
      }
      
          
    
    
      
    
    this.show_tags=true;
  }
  
  manage_sections(){
    console.log("manage section")
    console.log(this.first_filter_selected)
    console.log(this.second_filter_selected)
    if(this.opened_section==1){
      console.log(this.first_filter)
      if(this.first_filter=="all"){
        this.first_filter_selected=-1;
      }
      else{
        let indice= this.first_filters[this.indice_title_selected].indexOf(this.first_filter)
        console.log(this.first_filters[this.indice_title_selected])
        if(indice<0){
          this.display_no_propositions=true;
          return
        }
        this.first_filter_selected=this.first_filters[this.indice_title_selected].indexOf(this.first_filter)
      }

      console.log(this.second_filter)
      if(this.second_filter=="all"){
        this.second_filter_selected=-1;
      }
      else{
        let indice= this.second_filters[this.indice_title_selected].indexOf(this.second_filter)
        console.log(this.second_filters[this.indice_title_selected])
        if(indice<0){
          this.display_no_propositions=true;
          return
        }
        this.second_filter_selected=this.second_filters[this.indice_title_selected].indexOf(this.second_filter)
      }

      if(this.first_filter=="all" && this.second_filter=="all"){
        console.log(0);
        this.get_number_of_pages();
      }
      if(this.first_filter!="all" && this.second_filter=="all"){
        console.log(1);
        console.log(this.first_filters[this.indice_title_selected][this.first_filter_selected])
        this.get_number_of_pages1();
      }
      if(this.first_filter=="all" && this.second_filter!="all"){
        console.log(2);
        console.log(this.second_filters[this.indice_title_selected][this.second_filter_selected])
        this.get_number_of_pages2();
      }
      if(this.first_filter!="all" && this.second_filter!="all"){
        console.log(3);
        console.log(this.first_filters[this.indice_title_selected][this.first_filter_selected]);
        console.log(this.second_filters[this.indice_title_selected][this.second_filter_selected]);
        this.get_number_of_pages3();
      }
      
    }
    else{
      this.get_number_of_pages();
    }
  }


  get_number_of_pages(){
    this.list_of_first_propositions=[];
    this.list_of_last_propositions=[];
    this.list_of_thumbnails=[];
    this.pp_thumb_is_loaded=[];
    this.compteur_research+=1;
    if(!this.number_of_page_retrieved){
      this.navbar.get_number_of_results_by_category(this.category,this.research_string,this.compteur_research).subscribe(r=>{
        console.log(r[0][0]);
        this.number_of_results=r[0][0][0].number_of_results;
        this.number_of_pages=Math.trunc(parseInt(r[0][0][0].number_of_results)/5)+1;
        console.log(this.number_of_pages);
        this.number_of_page_retrieved=true;
        if(this.current_page>this.number_of_pages){
          this.display_no_propositions=true;
          this.error_page=true;
          return
        }
        this.get_research_propositions(r[1],0);
      })
    }
    else{
      this.get_research_propositions(this.compteur_research,0);
    }
  }

  get_number_of_pages1(){
    this.list_of_first_propositions=[];
    this.list_of_last_propositions=[];
    this.list_of_thumbnails=[];
    this.pp_thumb_is_loaded=[];
    this.compteur_research+=1;
    if(!this.number_of_page_retrieved){
      this.navbar.get_number_of_results_by_category1(this.category,this.research_string,this.first_filter,this.compteur_research).subscribe(r=>{
        console.log(r[0][0]);
        this.number_of_results=r[0][0][0].number_of_results;
        this.number_of_pages=Math.trunc(parseInt(r[0][0][0].number_of_results)/5)+1;
        console.log(this.number_of_pages);
        this.number_of_page_retrieved=true;
        if(this.current_page>this.number_of_pages){
          this.display_no_propositions=true;
          this.error_page=true;
          return
        }
        this.get_research_propositions(r[1],1);
      })
    }
    else{
      this.get_research_propositions(this.compteur_research,1);
    }
  }

  get_number_of_pages2(){
    this.list_of_first_propositions=[];
    this.list_of_last_propositions=[];
    this.list_of_thumbnails=[];
    this.pp_thumb_is_loaded=[];
    this.compteur_research+=1;
    if(!this.number_of_page_retrieved){
      this.navbar.get_number_of_results_by_category2(this.category,this.research_string,this.second_filter,this.compteur_research,this.type_of_target).subscribe(r=>{
        console.log(r[0][0]);
        this.number_of_results=r[0][0][0].number_of_results;
        this.number_of_pages=Math.trunc(parseInt(r[0][0][0].number_of_results)/5)+1;
        console.log(this.number_of_pages);
        this.number_of_page_retrieved=true;
        if(this.current_page>this.number_of_pages){
          this.display_no_propositions=true;
          this.error_page=true;
          return
        }
        this.get_research_propositions(r[1],2);
      })
    }
    else{
      this.get_research_propositions(this.compteur_research,2);
    }
  }

  get_number_of_pages3(){
    this.list_of_first_propositions=[];
    this.list_of_last_propositions=[];
    this.list_of_thumbnails=[];
    this.pp_thumb_is_loaded=[];
    this.compteur_research+=1;
    if(!this.number_of_page_retrieved){
      this.navbar.get_number_of_results_by_category3(this.category,this.research_string,this.first_filter,this.second_filter,this.compteur_research,this.type_of_target).subscribe(r=>{
        console.log(r[0][0]);
        if(r[0][0][0].number_of_results==0){
          this.show_propositions=false;
          this.display_no_propositions=true;
        }
        else{
          this.display_no_propositions=false;
          this.number_of_results=r[0][0][0].number_of_results;
          this.number_of_pages=Math.trunc(parseInt(r[0][0][0].number_of_results)/5)+1;
          console.log(this.number_of_pages);
          this.number_of_page_retrieved=true;
          if(this.current_page>this.number_of_pages){
            this.display_no_propositions=true;
            this.error_page=true;
            return
          }
          this.get_research_propositions(r[1],3);
        }
        
      })
    }
    else{
      this.get_research_propositions(this.compteur_research,3);
    }
  }

  
  pp_thumb_load(i){
    this.pp_thumb_is_loaded[i]=true;
  }

  

  get_research_propositions(compteur,i){
    console.log(" get_research_propositions " + i)
    let offset = (this.current_page-1)*5;
    this.loading_propositions=true;
    this.display_no_propositions=false;
    this.show_propositions=false;
    if(i==0){
      this.navbar.get_propositions_after_research_navbar(this.category,this.research_string,5,offset,compteur).subscribe(r=>{
        if(r[0][0].length>0){
          if(r[1]==this.compteur_research){
            this.list_of_first_propositions=r[0][0];
            console.log( this.list_of_first_propositions );
            for(let i=0;i<this.list_of_first_propositions.length;i++){
              this.get_propositions(i,r[1]);
            }
          }
        }
        else{
          this.display_no_propositions=true;
          return
        }
        
      })
    }
    if(i==1){
      this.navbar.get_propositions_after_research_navbar1(this.category,this.first_filter,this.research_string,5,offset,compteur).subscribe(r=>{
        console.log(r[0])
        console.log(r[0][0].length)
        if(r[0][0].length>0){
          if(r[1]==this.compteur_research){
            this.list_of_first_propositions=r[0][0];
            for(let i=0;i<this.list_of_first_propositions.length;i++){
              this.get_propositions(i,r[1]);
            }
          }
        }
        else{
          this.display_no_propositions=true;
          return
        }
        
        
      })
    }
    if(i==2){
      this.navbar.get_propositions_after_research_navbar2(this.category,this.second_filter,this.research_string,5,offset,compteur,this.type_of_target).subscribe(r=>{
        if(r[0][0].length>0){
          if(r[1]==this.compteur_research){
            this.list_of_first_propositions=r[0][0];
            for(let i=0;i<this.list_of_first_propositions.length;i++){
              this.get_propositions(i,r[1]);
            }
          }
        }
        else{
          this.display_no_propositions=true;
          return
        }
        
      })
    }
    if(i==3){
      this.navbar.get_propositions_after_research_navbar3(this.category,this.first_filter,this.second_filter,this.research_string,5,offset,compteur,this.type_of_target).subscribe(r=>{
        if(r[0][0].length>0){
          if(r[1]==this.compteur_research){
            this.list_of_first_propositions=r[0][0];
            for(let i=0;i<this.list_of_first_propositions.length;i++){
              this.get_propositions(i,r[1]);
            }
          }
        }
        else{
          this.display_no_propositions=true;
          return
        }
        
      })
    }
   
  }

  

  get_propositions(i,compteur){
    this.compteur_propositions=0;
    console.log("get proposition " + i + ' /' + this.list_of_first_propositions.length)
    console.log(" compteur " + compteur + ' and compteur research ' + this.compteur_research)
    if(this.list_of_first_propositions[i].publication_category=="Account"){
      this.Profile_Edition_Service.retrieve_profile_picture(this.list_of_first_propositions[i].target_id).subscribe(t=> {
        let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        if(compteur==this.compteur_research){
          this.list_of_thumbnails[i] = SafeURL;
        }
      });
      this.Profile_Edition_Service.retrieve_profile_data(this.list_of_first_propositions[i].target_id).subscribe(profile=>{
        if(compteur==this.compteur_research){
          this.list_of_last_propositions[i]=profile[0];
          this.compteur_propositions++;
          console.log(this.compteur_propositions)
          console.log(this.list_of_first_propositions)
          if(this.compteur_propositions==this.list_of_first_propositions.length){
            this.propositions_done("account","")
          }
        }
        
      })
     
     
    }
    if(this.list_of_first_propositions[i].publication_category=="Ad"){
      this.Ads_service.retrieve_ad_by_id(this.list_of_first_propositions[i].target_id).subscribe(ad=>{
        if(compteur==this.compteur_research){
          this.list_of_last_propositions[i]=ad[0];
          this.compteur_propositions++;
          if(this.compteur_propositions==this.list_of_first_propositions.length){
            this.propositions_done("ad","");
          }
        }
      })
    }

    if(this.list_of_first_propositions[i].publication_category=="Comic"){
      if(this.list_of_first_propositions[i].format=="one-shot"){
        this.BdOneShotService.retrieve_bd_by_id(this.list_of_first_propositions[i].target_id).subscribe(comic=>{
          if(compteur==this.compteur_research){
            this.list_of_last_propositions[i]=comic[0];
            this.compteur_propositions++;
            if(this.compteur_propositions==this.list_of_first_propositions.length){
              this.propositions_done("comic","one-shot");
            }
          }
        })
      }
      if(this.list_of_first_propositions[i].format=="serie"){
        this.BdSerieService.retrieve_bd_by_id(this.list_of_first_propositions[i].target_id).subscribe(comic=>{
          if(compteur==this.compteur_research){
            this.list_of_last_propositions[i]=comic[0];
            this.compteur_propositions++;
            if(this.compteur_propositions==this.list_of_first_propositions.length){
              this.propositions_done("comic","serie")
            }
          }
        })
      }
    }

    if(this.list_of_first_propositions[i].publication_category=="Drawing"){
      if(this.list_of_first_propositions[i].format=="one-shot"){
        this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(this.list_of_first_propositions[i].target_id).subscribe(comic=>{
          if(compteur==this.compteur_research){
            this.list_of_last_propositions[i]=comic[0];
            this.compteur_propositions++;
            if(this.compteur_propositions==this.list_of_first_propositions.length){
              this.propositions_done("Drawing","one-shot")
            }
          }
          
        })
      }
      if(this.list_of_first_propositions[i].format=="artbook"){
        this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(this.list_of_first_propositions[i].target_id).subscribe(comic=>{
          if(compteur==this.compteur_research){
            this.list_of_last_propositions[i]=comic[0];
            this.compteur_propositions++;
            if(this.compteur_propositions==this.list_of_first_propositions.length){
              this.propositions_done("Drawing","artbook")
            }
          }
          
        })
      }
    }

    if(this.list_of_first_propositions[i].publication_category=="Writing"){
      this.Writing_Upload_Service.retrieve_writing_information_by_id(this.list_of_first_propositions[i].target_id).subscribe(comic=>{
        if(compteur==this.compteur_research){
          this.list_of_last_propositions[i]=comic[0];
          this.compteur_propositions++;
          if(this.compteur_propositions==this.list_of_first_propositions.length){
            this.propositions_done("Writing","")
          }
        }
       
      })
    }
  }

 
  propositions_done(category,format){
    console.log(category + ' ' + format)
    console.log(this.list_of_last_propositions);
    console.log(this.number_of_pages)
    this.show_propositions=true;
    this.loading_propositions=false;
    this.cd.detectChanges();
  }
    
  /****************************************** RECHERCHE PAR STYLE ET PAR GENRE ***************** */
  /****************************************** RECHERCHE PAR STYLE ET PAR GENRE ***************** */
  /****************************************** RECHERCHE PAR STYLE ET PAR GENRE ***************** */
  /****************************************** RECHERCHE PAR STYLE ET PAR GENRE ***************** */
  /****************************************** RECHERCHE PAR STYLE ET PAR GENRE ***************** */
  /****************************************** RECHERCHE PAR STYLE ET PAR GENRE ***************** */

  change_first_filter_selected_sg(i){
    this.current_page=1;
    this.number_of_page_retrieved=false;
    if(this.first_filter_selected==i){
      return
    }
    else{
      this.first_filter_selected=i;
      this.first_filter=this.first_filters[this.indice_title_selected][i];
      this.location.go(`/main-research-style-and-tag/1/${this.category}/${this.first_filter}/${this.second_filter}`);
      this.manage_sections_sg();
    }
    
  }

  change_second_filter_selected_sg(i){
    this.current_page=1;
    this.number_of_page_retrieved=false;
    if(this.second_filter_selected==i){
      this.second_filter_selected=-1;
      this.second_filter="all";
      this.location.go(`/main-research-style-and-tag/1/${this.category}/${this.first_filter}/all`);
    }
    else{
      this.second_filter_selected=i;
      this.second_filter=this.second_filters[this.indice_title_selected][i];
      this.location.go(`/main-research-style-and-tag/1/${this.category}/${this.first_filter}/${this.second_filter}`);
    }
    this.manage_sections_sg();
  }

  manage_sections_sg(){
    if(this.second_filter=="all"){
      this.get_number_of_pages_sg();
    }
    if(this.second_filter!="all"){
      console.log(2);
      this.get_number_of_pages_sg1();
    }
  }

  get_number_of_pages_sg(){
    console.log("get_number_of_pages_sg")
    this.list_of_first_propositions=[];
    this.list_of_last_propositions=[];
    this.list_of_thumbnails=[];
    this.pp_thumb_is_loaded=[];
    this.compteur_research+=1;
    if(!this.number_of_page_retrieved){
      this.navbar.get_number_of_results_by_category_sg(this.category,this.first_filter,this.compteur_research).subscribe(r=>{
        console.log(r[0][0]);
        if(r[0][0][0].number_of_results==0){
          this.show_propositions=false;
          this.display_no_propositions=true;
        }
        else{
          this.display_no_propositions=false;
          this.number_of_results=r[0][0][0].number_of_results;
          this.number_of_pages=Math.trunc(parseInt(r[0][0][0].number_of_results)/5)+1;
          console.log(this.number_of_pages);
          this.number_of_page_retrieved=true;
          if(this.current_page>this.number_of_pages){
            this.display_no_propositions=true;
            this.error_page=true;
            return
          }
          this.get_research_propositions_sg(r[1],0);
        }
        
      })
    }
    else{
      this.get_research_propositions_sg(this.compteur_research,0);
    }
  }


  get_number_of_pages_sg1(){
    this.list_of_first_propositions=[];
    this.list_of_last_propositions=[];
    this.list_of_thumbnails=[];
    this.pp_thumb_is_loaded=[];
    this.compteur_research+=1;
    if(!this.number_of_page_retrieved){
      this.navbar.get_number_of_results_by_category_sg1(this.category,this.first_filter,this.second_filter,this.compteur_research,this.type_of_target).subscribe(r=>{
        console.log(r[0][0]);
        if(r[0][0][0].number_of_results==0){
          this.show_propositions=false;
          this.display_no_propositions=true;
        }
        else{
          this.display_no_propositions=false;
          this.number_of_results=r[0][0][0].number_of_results;
          this.number_of_pages=Math.trunc(parseInt(r[0][0][0].number_of_results)/5)+1;
          console.log(this.number_of_pages);
          this.number_of_page_retrieved=true;
          if(this.current_page>this.number_of_pages){
            this.display_no_propositions=true;
            this.error_page=true;
            return
          }
          this.get_research_propositions_sg(r[1],1);
        }
        
      })
    }
    else{
      this.get_research_propositions_sg(this.compteur_research,1);
    }
  }


  get_research_propositions_sg(compteur,i){
    let offset = (this.current_page-1)*5;
    this.loading_propositions=true;
    this.display_no_propositions=false;
    this.show_propositions=false;
    if(i==0){
      this.navbar.get_propositions_after_research_navbar_sg(this.category,this.first_filter,5,offset,compteur).subscribe(r=>{
        if(r[0][0].length>0){
          if(compteur==this.compteur_research){
            this.list_of_first_propositions=r[0][0];
            for(let i=0;i<this.list_of_first_propositions.length;i++){
              this.get_propositions(i,r[1]);
            }
          }
        }
        else{
          this.display_no_propositions=true;
          return
        }
        
        
      })
    }
    if(i==1){
      this.navbar.get_propositions_after_research_navbar_sg1(this.category,this.first_filter,this.second_filter,5,offset,compteur,this.type_of_target).subscribe(r=>{
        if(r[0][0].length>0){
          if(compteur==this.compteur_research){
            this.list_of_first_propositions=r[0][0];
            for(let i=0;i<this.list_of_first_propositions.length;i++){
              this.get_propositions(i,r[1]);
            }
          }
        }
        else{
          this.display_no_propositions=true;
          return
        }

        
      })
    }
   
  }

  get_style_genre_link(filter1,filter2,title_selected) {
    if(filter1 != -1 && filter2 != -1 ) {
      return "/main-research-style-and-tag/1/"+this.list_of_real_categories[title_selected]+"/"+this.first_filters[title_selected][filter1]+"/"+this.second_filters[title_selected][filter2];
    }
    if(filter1 != -1 && filter2 == -1 ) {
      return "/main-research-style-and-tag/1/"+this.list_of_real_categories[title_selected]+"/"+this.first_filters[title_selected][filter1]+"/all";
    }
    return "/";
  }

  get_linkcollab(filter1,filter2,title_selected){
    return "/linkcollab"
  }

  @ViewChild('input') input:ElementRef;

  page_clicked(e:any) {
    if(e.keyCode === 13){
      e.preventDefault();

      if( (e.target.value >= 1) && (e.target.value <= this.number_of_pages) ) {
        this.current_page=e.target.value ;
        this.open_new_page()
        
      }
      else {
       this.input.nativeElement.value= this.current_page;
      }
    }
  }

  first_page() {
    this.current_page=1;
    this.open_new_page()
  }
  previous_page() {
    this.current_page--;
    this.open_new_page()
  }
  next_page() {
    this.current_page++;
    this.open_new_page()
   
  }
  last_page() {
    this.current_page=this.number_of_pages;
    this.open_new_page()
  }


  scroll(el: HTMLElement) {

    this.cd.detectChanges();
    var topOfElement = el.offsetTop - 150;
    window.scroll({top: topOfElement, behavior:"smooth"});
  }

 open_new_page(){
  
  if(this.opened_section<2){
    if(this.first_filter=="all" && this.second_filter=="all"){
      this.get_number_of_pages();
    }
    if(this.first_filter!="all" && this.second_filter=="all"){
      this.get_number_of_pages1();
    }
    if(this.first_filter=="all" && this.second_filter!="all"){
      this.get_number_of_pages2();
    }
    if(this.first_filter!="all" && this.second_filter!="all"){
      this.get_number_of_pages3();
    }
  }
  else{
    if(this.second_filter=="all"){
      this.get_number_of_pages_sg();
    }
    if(this.second_filter!="all"){
      console.log(2);
      this.get_number_of_pages_sg1();
    }
  }
  this.location.go(`/main-research-style-and-tag/${this.current_page}/${this.category}/${this.first_filter}/${this.second_filter}`);
 }


}
