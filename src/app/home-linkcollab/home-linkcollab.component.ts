import { Component, OnInit, Input, ChangeDetectorRef, HostListener, ViewChild } from '@angular/core';
import {ElementRef, Renderer2, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { NavbarService } from '../services/navbar.service';
import { Ads_service } from '../services/ads.service';
import { SearchbarService } from '../services/searchbar.service';

import {MatInputModule} from '@angular/material/input';
import { trigger, transition, style, animate } from '@angular/animations';

declare var Swiper: any
declare var $: any 

@Component({
  selector: 'app-home-linkcollab',
  templateUrl: './home-linkcollab.component.html',
  styleUrls: ['./home-linkcollab.component.scss'],
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

export class HomeLinkcollabComponent implements OnInit {
  

  constructor(private rd: Renderer2, 
    public navbar: NavbarService,
    private cd: ChangeDetectorRef,
    private Ads_service:Ads_service,
    ) {

    this.navbar.setActiveSection(1);
    this.navbar.show();
  }



  @HostListener('window:resize', ['$event'])
    onResize(event) {
      this.cd.detectChanges();
      this.initialize_heights();
  };




  subcategory:number;
  type_of_project:string="none";
  author:string="none";
  target:string="none";
  sorting:string="pertinence";
  list_of_ads:any[]=[];
  list_of_ads_received=false;
  skeleton_array = Array(5);
  now_in_seconds=Math.trunc( new Date().getTime()/1000);

  ads_types = ["Bandes dessinées","BD européennes","Comics","Manga","Webtoon","Dessins","Dessin digital",
  "Dessin traditionnel","Écrits","Article","Poésie","Roman","Roman illustré","Scénario"];

  ads_remuneration_types = ["Annuel","CDD","CDI","Journalier","Mensuel","Par mission","Réinitialiser"];
  ads_services_types = ["Produits","Services","Réinitialiser"];
  ads_descriptions = ["Professionnel de l'édition","Professionnel non artiste","Artiste en tout genre","Auteur de bandes dessinées","Ecrivain","Dessinateur","Scénariste"];
  
  ads_targets=["Professionnel de l'édition","Professionnel non artiste","Artiste en tout genre","Auteur de bandes dessinées","Ecrivain","Dessinateur","Scénariste","Tout public"];

  type_of_service='none';
  offer_or_demand='none'; // offre ou demande
  type_of_remuneration="none";
  service=false;
  remuneration=false;

  /*********************************************************************** */
  /*********************************************************************** */
  /*On init */
  /*********************************************************************** */
  /*********************************************************************** */
  ngOnInit() {

    this.open_subcategory(0);
  }

  /*********************************************************************** */
  /*********************************************************************** */
  /*After view init */
  /*********************************************************************** */
  /*********************************************************************** */
  show_icon=false;
  ngAfterViewInit() {

    let THIS=this;
    $(window).ready(function () {
      THIS.show_icon=true;
    });
    this.initialize_selectors();
    
  }

  
  ngAfterViewChecked() {
    this.initialize_heights();
  }

  initialize_heights() {
    //if( !this.fullscreen_mode ) {
      $('#left-container').css("height", ( window.innerHeight - this.navbar.getHeight() ) + "px");
      $('#right-container').css("height", ( window.innerHeight - this.navbar.getHeight() ) + "px");
      this.cd.detectChanges();
    //}
  }


  open_subcategory(i) {

    if( this.subcategory==i ) {
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
    this.subcategory=i;
    
    return;
  }

  sumo_ready=false;
  initialize_selectors() {

    let THIS=this;
  
    $(document).ready(function () {
      $(".SelectBox1").SumoSelect({
      });    
      $(".SelectBox2").SumoSelect({
      });    
      $(".SelectBox3").SumoSelect({
      });    
      $(".SelectBox4").SumoSelect({
      });
      $(".SelectBox4b").SumoSelect({
      });
      $(".SelectBox5").SumoSelect({
      });
      $(".SelectBox6").SumoSelect({
      });
      $(".SelectBox7").SumoSelect({
      });
      $(".SelectBox8").SumoSelect({
      });

      THIS.sumo_ready=true;
    });
    $('.panel-controller .right-container').hide().delay(80).show('fast');

    $(".SelectBox1").change(function(){
     
      console.log($(this).val());
      let type_of_project
      if($(this).val()=="Tout"){
        type_of_project="none";
      }
      else{
        type_of_project=$(this).val();
      }
      if(THIS.type_of_project==type_of_project){
        return
      }
      THIS.type_of_project=$(this).val();
      THIS.get_sorted_ads();
    });
  

    $(".SelectBox2").change(function(){
      console.log($(this).val());
      let author
      if($(this).val()=="Tout"){
        author="none";
      }
      else{
        author=$(this).val();
      }
      if(THIS.author==author){
        return
      }
      THIS.author=author;
      THIS.get_sorted_ads();
    });
    $(".SelectBox3").change(function(){
      console.log($(this).val());
      let target
      if($(this).val()=="Tout"){
        target="none";
      }
      else{
        target=$(this).val();
      }
      if(THIS.target==target){
        return
      }
      THIS.target=target;
      THIS.get_sorted_ads();
    });
    $(".SelectBox4").change(function(){
      console.log($(this).val());
      let sorting
      if($(this).val()=="Tri par pertinence"){
       sorting="pertinence";
      }
      else if($(this).val()=="Tri par le plus récent"){
        sorting="récent";
      }
      else if($(this).val()=="Tri par le plus ancient"){
        sorting="ancient";
      }
      else if($(this).val()=="Tri par montant croissant"){
        sorting="croissant";
      }
      else if($(this).val()=="Tri par montant décroissant"){
        sorting="décroissant";
      }

      if(sorting==THIS.sorting){
        return;
      }
      THIS.sorting=sorting;
      THIS.get_sorted_ads();
    });
    $(".SelectBox4b").change(function(){
      console.log($(this).val());
      let sorting
      if($(this).val()=="Tri par pertinence"){
       sorting="pertinence";
      }
      else if($(this).val()=="Tri par le plus récent"){
        sorting="récent";
      }
      else if($(this).val()=="Tri par le plus ancient"){
        sorting="ancient";
      }
      else if($(this).val()=="Tri par montant croissant"){
        sorting="croissant";
      }
      else if($(this).val()=="Tri par montant décroissant"){
        sorting="décroissant";
      }

      if(sorting==THIS.sorting){
        return;
      }
      THIS.sorting=sorting;
      THIS.get_sorted_ads();
    });
    $(".SelectBox6").change(function(){
     
      console.log($(this).val());
      let type_of_service
      if($(this).val()=="Tout"){
        type_of_service="none";
      }
      else{
        type_of_service=$(this).val();
      }
      if(type_of_service==THIS.type_of_service){
        return;
      }
      THIS.type_of_service=type_of_service;
      THIS.get_sorted_ads();
    });

    $(".SelectBox7").change(function(){
     
      console.log($(this).val());
      let type_of_remuneration
      if($(this).val()=="Tout"){
          type_of_remuneration="none";
      }
      else{
        type_of_remuneration=$(this).val();
      }
      if(type_of_remuneration==THIS.type_of_remuneration){
        return;
      }
      THIS.type_of_remuneration=type_of_remuneration;
      THIS.get_sorted_ads();
    });
    $(".SelectBox8").change(function(){
     
      console.log($(this).val());
      let offer_or_demand
      if($(this).val()=="Tout"){
        offer_or_demand="none";
      }
      else if($(this).val()=="Offres") {
        offer_or_demand="Offre";
      }
      else if($(this).val()=="Demandes") {
        offer_or_demand="Demande";
      }

      if(offer_or_demand==THIS.offer_or_demand){
        return;
      }
      THIS.offer_or_demand=offer_or_demand;
      THIS.get_sorted_ads();
    });

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
    console.log("get sorteds ads")
    this.offset_ads = (this.current_page-1)*5;
    this.compteur_ads++;
    this.loading_ads=true;
    this.number_of_pages=1;
    this.display_no_propositions=false;
    this.show_propositions=false;
    this.number_of_results=0;
    //this.number_of_ads_to_show=10;
    this.list_of_ads_received=false;
    this.list_of_ads=[];

    this.Ads_service.get_sorted_ads_linkcollab(this.type_of_project,this.author,this.target,this.remuneration,this.service,this.type_of_remuneration,this.type_of_service,this.offer_or_demand,this.sorting,this.offset_ads,this.compteur_ads).subscribe(r=>{
      console.log(r);
      console.log(r[0][0]);
      this.number_of_results=r[0][0].number_of_ads;
      console.log(this.number_of_results)
      this.number_of_pages=Math.trunc(parseInt(r[0][0].number_of_ads)/5)+1;
      console.log(this.number_of_pages)
      let results=r[0][0].results
      console.log(results)
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
      console.log(this.display_no_propositions)
      console.log(this.list_of_ads)
  
      
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




}
