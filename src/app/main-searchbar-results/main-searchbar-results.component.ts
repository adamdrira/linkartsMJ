import { Component, OnInit, Input, ChangeDetectorRef, HostListener } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { NavbarService } from '../services/navbar.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import {Profile_Edition_Service} from '../services/profile_edition.service';
import {BdOneShotService} from '../services/comics_one_shot.service';
import {BdSerieService} from '../services/comics_serie.service';
import {Drawings_Artbook_Service} from '../services/drawings_artbook.service';
import {Drawings_Onepage_Service} from '../services/drawings_one_shot.service';
import {Writing_Upload_Service} from '../services/writing.service';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

declare var $: any;

@Component({
  selector: 'app-main-searchbar-results',
  templateUrl: './main-searchbar-results.component.html',
  styleUrls: ['./main-searchbar-results.component.scss']
})
export class MainSearchbarResultsComponent implements OnInit {

  constructor(
    private authenticationService: AuthenticationService, 
    private route: ActivatedRoute, 
    private location: Location,
    public navbar: NavbarService,
    private cd:ChangeDetectorRef,
    private sanitizer:DomSanitizer,
    private Profile_Edition_Service:Profile_Edition_Service,
    public dialog: MatDialog,
    private BdOneShotService:BdOneShotService,
    private BdSerieService:BdSerieService,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private Writing_Upload_Service:Writing_Upload_Service,
  ) { 
    this.navbar.show();
  }

  type_of_profile_retrieved=false;
  research_string:string;
  category:string;
  type_of_profile:string;
  list_of_categories=["Artiste","Annonce","Bande Dessinée","Dessin","Ecrit"];
  list_of_real_categories=["Artist","Ad","Comic","Drawing","Writing"];
  first_filters_artists=["Auteur de B.D.", "Dessinateur", "Ecrivain"];
  first_filters_ads=["B.D.","BD euro.","Comics","Manga","Webtoon","Dessin","Dessin dig.","Dessin trad.","Ecrit","Article","Poésie","Roman","Roman il."];
  first_filters_comics=["Comics", "BD", "Manga","Webtoon"];
  first_filters_drawings=["Traditionnel", "Digital"];
  first_filters_writings=["Article","Poésie", "Roman", "Roman illustré", "Scénario"];
  first_filters=[this.first_filters_artists,this.first_filters_ads,this.first_filters_comics,this.first_filters_drawings,this.first_filters_writings];

  comics_tags=["Action","Aventure","Enfants","Epique","Esotérisme","Fanfiction","Fantaisie","Fantastique","Guerre","Héroïque","Histoire","Horreur","Humour","Josei","Journalisme","Kodomo","Nekketsu","Pantso shoto","Philosophie",
  "Policier","Religion","Romantique","Science-fiction","Seinen","Shojo","Shonen","Sociologie","Sport","Thriller","Western","Yaoi","Yuri"];
  drawings_tags=["Abstrait","Action","Aventure","Animaux","Enfants","Epique","Esotérisme","Fanart","Fantaisie","Fantastique","Femme","Fresque","Guerre","Graffiti","Héroïque","Histoire","Homme","Horreur","Humour","Journalisme","Monstre","Paysage","Portrait","Philosophie",
  "Policier","Réaliste","Religion","Romantique","Science-fiction","Sociologie","Sport","Western"];
  writings_tags=["Action","Aventure","Enfants","Epique","Esotérisme","Fanfiction","Fantaisie","Fantastique","Guerre","Héroïque","Histoire","Horreur","Humour","Journalisme","Philosophie",
  "Policier","Réaliste","Religion","Romantique","Science-fiction","Sociologie","Sport","Thriller","Western"];
  second_filters=[[],[],this.comics_tags,this.drawings_tags,this.writings_tags];



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
  number_of_pages:number;
  number_of_page_retrieved:boolean;
  display_results=false;
  display_no_results=false;
  display_no_propositions=false;
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
        //this.location.go('/');
        //location.reload();
        return;
      }
      this.first_filter=(this.route.snapshot.paramMap.get('first_filter'))?this.route.snapshot.paramMap.get('first_filter'):"all";
      this.second_filter=(this.route.snapshot.paramMap.get('second_filter'))?this.route.snapshot.paramMap.get('second_filter'):"all";
      this.authenticationService.currentUserType.subscribe(r=>{
        if(r!=''){
          this.type_of_profile=r;
          this.type_of_profile_retrieved=true;
          this.display_title=true;
          this.get_number_of_results_by_category();
        }
      })
    }
    else{
      this.current_page=parseInt(this.route.snapshot.paramMap.get('page'));
      this.category=this.route.snapshot.paramMap.get('category');
      this.first_filter=this.route.snapshot.paramMap.get('first_filter');
      this.second_filter=this.route.snapshot.paramMap.get('second_filter');
      this.indice_title_selected=this.list_of_real_categories.indexOf(this.category);
      this.category_to_show = this.list_of_categories[this.indice_title_selected];
      console.log(this.indice_title_selected)
      console.log(this.category)
      console.log(this.first_filter)
      console.log(this.second_filter)
      console.log(  this.category_to_show)
      let index1=this.first_filters[this.indice_title_selected].indexOf(this.first_filter)
      if(index1<0){
        alert("pb 2")
        //this.location.go('/');
        //location.reload();
        return;
      }
      this.first_filter_selected=index1;
      let index2=this.second_filters[this.indice_title_selected].indexOf(this.second_filter);
      if(index1<0 &&  this.second_filter!="all"){
        alert("pb 3")
        //this.location.go('/');
        //location.reload();
        return;
      }
      this.second_filter_selected=index2;
      this.display_title_style_and_tags=true;
      this.manage_sections_sg();
      console.log( this.category)
      console.log( this.first_filter)
      console.log( this.second_filter)
    }
    
  }

  change_indice_title_selected(i){
    
    if(this.indice_title_selected==i){
      return;
    }
    this.number_of_page_retrieved=false;
    this.indice_title_selected=i;
    this.first_filter_selected=-1;
    this.second_filter_selected=-1;
    this.first_filter="all";
    this.second_filter="all";
    this.category=this.list_of_real_categories[i];
    //this.location.go(`/main-research/${this.current_page}/${this.research_string}/${this.category}/${this.first_filter}/${this.second_filter}`);
    this.opened_section=0;
    this.manage_sections();
  }



  change_first_filter_selected(i){
    this.number_of_page_retrieved=false;
    if(this.first_filter_selected==i){
      this.first_filter_selected=-1;
      this.first_filter="all";
      //this.location.go(`/main-research/${this.current_page}/${this.research_string}/${this.category}/all/${this.second_filter}`);
      if(this.second_filter_selected<0){
        this.opened_section=0;
      }
      this.manage_sections();
    }
    else{
      this.first_filter_selected=i;
      this.opened_section=1;
      this.first_filter=this.first_filters[this.indice_title_selected][i];
      //this.location.go(`/main-research/${this.current_page}/${this.research_string}/${this.category}/${this.first_filter}/${this.second_filter}`);
      this.manage_sections();
    }
    
  }

  change_second_filter_selected(i){
    this.number_of_page_retrieved=false;
    if(this.second_filter_selected==i){
      this.second_filter_selected=-1;
      this.second_filter="all";
      //this.location.go(`/main-research/${this.current_page}/${this.research_string}/${this.category}/${this.first_filter}/all`);
      if(this.first_filter_selected<0){
        this.opened_section=0;
      }
      this.manage_sections();
    }
    else{
      this.second_filter_selected=i;
      this.opened_section=1;
      this.second_filter=this.second_filters[this.indice_title_selected][i];
      //this.location.go(`/main-research/${this.current_page}/${this.research_string}/${this.category}/${this.first_filter}/${this.second_filter}`);
      this.manage_sections();
    }
  }


  
  get_number_of_results_by_category(){
    this.navbar.get_number_of_results_for_categories(this.research_string).subscribe(r=>{
      console.log(r[0])
      if(r[0].length>0){
        for(let i=0;i<r[0].length;i++){
          let indice=this.list_of_real_categories.indexOf(r[0][i].publication_category);
          if(i!=indice){
            this.list_of_real_categories.splice(i,0,this.list_of_real_categories.splice(indice,1)[0]);
            this.list_of_categories.splice(i,0,this.list_of_categories.splice(indice,1)[0]);
            this.first_filters.splice(i,0,this.first_filters.splice(indice,1)[0]);
            this.second_filters.splice(i,0,this.second_filters.splice(indice,1)[0]);
          }
          if(i==r[0].length-1){
            if(i!=this.list_of_real_categories.length-1){
              for(let j=i+1;j<this.list_of_real_categories.length;j++){
                this.list_of_categories.splice( this.list_of_categories.length-1,1);
                this.first_filters.splice(this.first_filters.length-1,1);
                this.second_filters.splice(this.second_filters.length-1,1);
                if(j==this.list_of_real_categories.length-1){
                  console.log(this.list_of_real_categories);
                  if(this.category=="All"){
                    this.display_results=true;
                    this.category=this.list_of_real_categories[0];
                    this.manage_sections();
                  }
                  else{
                    if(this.list_of_real_categories.indexOf(this.category)>(this.list_of_categories.length-1)){
                      this.display_no_results=true;
                    }
  
                    else{
                      this.indice_title_selected=this.list_of_real_categories.indexOf(this.category);
                      this.display_results=true;
                      this.manage_sections();
                    }
                  }
                  
                  
                }
              }
            }
            else{
              console.log(this.list_of_real_categories);
              this.display_results=true;
              this.category=this.list_of_real_categories[0];
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

  
  manage_sections(){
    if(this.opened_section==1){
      console.log(this.first_filter)
      if(this.first_filter=="all"){
        this.first_filter_selected=-1;
      }
      else{
        let indice= this.first_filters[this.indice_title_selected].indexOf(this.first_filter)
        console.log(this.first_filters[this.indice_title_selected])
        if(indice<0){
          alert("pas ok")
          //this.location.go('/');
          //location.reload();
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
          alert("pas ok")
          //this.location.go('/');
          //location.reload();
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
        this.number_of_pages=Math.trunc(parseInt(r[0][0][0].number_of_results)/20)+1;
        console.log(this.number_of_pages);
        this.number_of_page_retrieved=true;
        if(this.current_page>this.number_of_pages){
          alert("pg12")
          //this.location.go('/');
          //location.reload();
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
        this.number_of_pages=Math.trunc(parseInt(r[0][0][0].number_of_results)/20)+1;
        console.log(this.number_of_pages);
        this.number_of_page_retrieved=true;
        if(this.current_page>this.number_of_pages){
          alert("pg 13")
          //this.location.go('/');
          //location.reload();
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
      this.navbar.get_number_of_results_by_category2(this.category,this.research_string,this.second_filter,this.compteur_research).subscribe(r=>{
        console.log(r[0][0]);
        this.number_of_pages=Math.trunc(parseInt(r[0][0][0].number_of_results)/20)+1;
        console.log(this.number_of_pages);
        this.number_of_page_retrieved=true;
        if(this.current_page>this.number_of_pages){
          alert("pg 14")
          //this.location.go('/');
          //location.reload();
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
      this.navbar.get_number_of_results_by_category3(this.category,this.research_string,this.first_filter,this.second_filter,this.compteur_research).subscribe(r=>{
        console.log(r[0][0]);
        if(r[0][0][0].number_of_results==0){
          this.show_propositions=false;
          this.display_no_propositions=true;
        }
        else{
          this.display_no_propositions=false;
          this.number_of_pages=Math.trunc(parseInt(r[0][0][0].number_of_results)/20)+1;
          console.log(this.number_of_pages);
          this.number_of_page_retrieved=true;
          if(this.current_page>this.number_of_pages){
            alert("pb pages")
            //this.location.go('/');
            //location.reload();
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
    let offset = (this.current_page-1)*20;
    this.loading_propositions=true;
    this.display_no_propositions=false;
    this.show_propositions=false;
    if(i==0){
      this.navbar.get_propositions_after_research_navbar(this.category,this.research_string,20,offset,compteur).subscribe(r=>{
        if(r[1]==this.compteur_research){
          this.list_of_first_propositions=r[0][0];
          for(let i=0;i<this.list_of_first_propositions.length;i++){
            this.get_propositions(i,r[1]);
          }
        }
      })
    }
    if(i==1){
      this.navbar.get_propositions_after_research_navbar1(this.category,this.first_filter,this.research_string,20,offset,compteur).subscribe(r=>{
        if(r[1]==this.compteur_research){
          this.list_of_first_propositions=r[0][0];
          for(let i=0;i<this.list_of_first_propositions.length;i++){
            this.get_propositions(i,r[1]);
          }
        }
        
      })
    }
    if(i==2){
      this.navbar.get_propositions_after_research_navbar2(this.category,this.second_filter,this.research_string,20,offset,compteur).subscribe(r=>{
        if(r[1]==this.compteur_research){
          this.list_of_first_propositions=r[0][0];
          for(let i=0;i<this.list_of_first_propositions.length;i++){
            this.get_propositions(i,r[1]);
          }
        }
      })
    }
    if(i==3){
      this.navbar.get_propositions_after_research_navbar3(this.category,this.first_filter,this.second_filter,this.research_string,20,offset,compteur).subscribe(r=>{
        if(r[1]==this.compteur_research){
          this.list_of_first_propositions=r[0][0];
          for(let i=0;i<this.list_of_first_propositions.length;i++){
            this.get_propositions(i,r[1]);
          }
        }
      })
    }
   
  }

  

  get_propositions(i,compteur){
    this.compteur_propositions=0;
    
    if(this.list_of_first_propositions[i].publication_category=="Artist"){
      console.log("artist");
      this.Profile_Edition_Service.retrieve_profile_data(this.list_of_first_propositions[i].target_id).subscribe(profile=>{
        if(compteur==this.compteur_research){
          this.list_of_last_propositions[i]=profile[0];
          this.Profile_Edition_Service.retrieve_profile_picture(profile[0].id ).subscribe(t=> {
            let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            if(compteur==this.compteur_research){
              this.list_of_thumbnails[i] = SafeURL;
              this.compteur_propositions++;
              console.log(this.compteur_propositions)
              console.log(this.list_of_first_propositions)
              if(this.compteur_propositions==this.list_of_first_propositions.length){
                console.log(this.list_of_last_propositions)
                this.show_propositions=true;
                this.loading_propositions=false;
              }
            }
           
          });
        }
        
      })
    }

    if(this.list_of_first_propositions[i].publication_category=="Comic"){
      console.log("comic");
      if(this.list_of_first_propositions[i].format=="one-shot"){
        this.BdOneShotService.retrieve_bd_by_id(this.list_of_first_propositions[i].target_id).subscribe(comic=>{
          if(compteur==this.compteur_research){
            this.list_of_last_propositions[i]=comic[0];
            this.compteur_propositions++;
            if(this.compteur_propositions==this.list_of_first_propositions.length){
              console.log(this.list_of_last_propositions);
              console.log(this.list_of_thumbnails);
              this.show_propositions=true;
              this.loading_propositions=false;
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
              console.log(this.list_of_last_propositions);
              console.log(this.list_of_thumbnails);
              this.show_propositions=true;
              this.loading_propositions=false;
            }
          }
        })
      }
    }

    if(this.list_of_first_propositions[i].publication_category=="Drawing"){
      console.log("drawing");
      if(this.list_of_first_propositions[i].format=="one-shot"){
        this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(this.list_of_first_propositions[i].target_id).subscribe(comic=>{
          if(compteur==this.compteur_research){
            this.list_of_last_propositions[i]=comic[0];
            this.compteur_propositions++;
            if(this.compteur_propositions==this.list_of_first_propositions.length){
              console.log(this.list_of_last_propositions);
              console.log(this.list_of_thumbnails);
              this.show_propositions=true;
              this.loading_propositions=false;
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
              console.log(this.list_of_last_propositions);
              console.log(this.list_of_thumbnails);
              this.show_propositions=true;
              this.loading_propositions=false;
            }
          }
          
        })
      }
    }

    if(this.list_of_first_propositions[i].publication_category=="Writing"){
      console.log("writing");
      this.Writing_Upload_Service.retrieve_writing_information_by_id(this.list_of_first_propositions[i].target_id).subscribe(comic=>{
        if(compteur==this.compteur_research){
          this.list_of_last_propositions[i]=comic[0];
          this.compteur_propositions++;
          if(this.compteur_propositions==this.list_of_first_propositions.length){
            console.log(this.list_of_last_propositions);
            this.show_propositions=true;
            this.loading_propositions=false;
          }
        }
       
      })
    }
  }

 
  send_number_of_thumbnails(event){
    //console.log(event);
  }
    
  /****************************************** RECHERCHE PAR STYLE ET PAR GENRE ***************** */
  /****************************************** RECHERCHE PAR STYLE ET PAR GENRE ***************** */
  /****************************************** RECHERCHE PAR STYLE ET PAR GENRE ***************** */
  /****************************************** RECHERCHE PAR STYLE ET PAR GENRE ***************** */
  /****************************************** RECHERCHE PAR STYLE ET PAR GENRE ***************** */
  /****************************************** RECHERCHE PAR STYLE ET PAR GENRE ***************** */

  change_first_filter_selected_sg(i){
    this.number_of_page_retrieved=false;
    if(this.first_filter_selected==i){
      return
    }
    else{
      this.first_filter_selected=i;
      this.first_filter=this.first_filters[this.indice_title_selected][i];
      //this.location.go(`/main-research-style-and-tag/${this.current_page}/${this.category}/${this.first_filter}/${this.second_filter}`);
      this.manage_sections_sg();
    }
    
  }

  change_second_filter_selected_sg(i){
    this.number_of_page_retrieved=false;
    if(this.second_filter_selected==i){
      this.second_filter_selected=-1;
      this.second_filter="all";
      //this.location.go(`/main-research-style-and-tag/${this.current_page}/${this.category}/${this.first_filter}/all`);
    }
    else{
      this.second_filter_selected=i;
      this.second_filter=this.second_filters[this.indice_title_selected][i];
      //this.location.go(`/main-research-style-and-tag/${this.current_page}/${this.category}/${this.first_filter}/${this.second_filter}`);
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
          this.number_of_pages=Math.trunc(parseInt(r[0][0][0].number_of_results)/20)+1;
          console.log(this.number_of_pages);
          this.number_of_page_retrieved=true;
          if(this.current_page>this.number_of_pages){
            alert("pb pages")
            //this.location.go('/');
            //location.reload();
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
      this.navbar.get_number_of_results_by_category_sg1(this.category,this.first_filter,this.second_filter,this.compteur_research).subscribe(r=>{
        console.log(r[0][0]);
        if(r[0][0][0].number_of_results==0){
          this.show_propositions=false;
          this.display_no_propositions=true;
        }
        else{
          this.display_no_propositions=false;
          this.number_of_pages=Math.trunc(parseInt(r[0][0][0].number_of_results)/20)+1;
          console.log(this.number_of_pages);
          this.number_of_page_retrieved=true;
          if(this.current_page>this.number_of_pages){
            alert("pb pages")
            //this.location.go('/');
            //location.reload();
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
    let offset = (this.current_page-1)*20;
    this.loading_propositions=true;
    this.display_no_propositions=false;
    this.show_propositions=false;
    if(i==0){
      this.navbar.get_propositions_after_research_navbar_sg(this.category,this.first_filter,20,offset,compteur).subscribe(r=>{
        this.list_of_first_propositions=r[0][0];
        for(let i=0;i<this.list_of_first_propositions.length;i++){
        this.get_propositions(i,r[1]);
        }
      })
    }
    if(i==1){
      this.navbar.get_propositions_after_research_navbar_sg1(this.category,this.first_filter,this.second_filter,20,offset,compteur).subscribe(r=>{
        this.list_of_first_propositions=r[0][0];
        for(let i=0;i<this.list_of_first_propositions.length;i++){
        this.get_propositions(i,r[1]);
        }
      })
    }
   
  }


}
