import { Component, OnInit, Input, ChangeDetectorRef, HostListener } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { NavbarService } from '../services/navbar.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

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
  ) { 
    this.navbar.show();
  }

  type_of_profile_retrieved=false;
  research:string;
  type_of_profile:string="visitor";
  list_of_categories=["Artiste","Annonce","Bande Dessinée","Dessin","Ecrit"];
  more_filters_artists=["Auteur de B.D.", "Dessinateur", "Ecrivain"];
  more_filters_ads=["Bande dessinée","BD européenne","Comics","Manga","Webtoon","Dessin","Dessin digital","Dessin traditionnel","Ecrit","Article","Poésie","Roman","Roman illustré"]                                   
  more_filters_comics=["Comics", "BD", "Manga","Webtoon"];
  more_filters_drawings=["Traditionnel", "Digital"];
  more_filters_writings=["Article","Poésie", "Roman", "Roman illustré", "Scénario"];
  more_filters=[this.more_filters_artists,this.more_filters_ads,this.more_filters_comics,this.more_filters_drawings,this.more_filters_writings];
  indice_title_selected=0;

  ngOnInit(): void {
    console.log(this.route.snapshot.paramMap.get('text'));
    this.research=this.route.snapshot.paramMap.get('text')
    this.authenticationService.currentUserType.subscribe(r=>{
      if(r!=''){
        this.type_of_profile=r;
        this.type_of_profile_retrieved=true;
        this.initialize_heights();
      }
    })
  }

  change_indice_title_selected(i){

  }


  initialize_heights() {
    console.log("initializing height")
    //if( !this.fullscreen_mode ) {
      $('#left-container').css("height", ( window.innerHeight - this.navbar.getHeight() ) + "px");
      $('#right-container').css("height", ( window.innerHeight - this.navbar.getHeight() ) + "px");
      this.cd.detectChanges();
    //}
  }

}
