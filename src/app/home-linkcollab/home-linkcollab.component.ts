import { Component, OnInit, Input, ChangeDetectorRef, HostListener } from '@angular/core';
import {ElementRef, Renderer2, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { NavbarService } from '../services/navbar.service';
import { Ads_service } from '../services/ads.service';
import { SearchbarService } from '../services/searchbar.service';

import {MatInputModule} from '@angular/material/input';


declare var Swiper: any
declare var $: any 

@Component({
  selector: 'app-home-linkcollab',
  templateUrl: './home-linkcollab.component.html',
  styleUrls: ['./home-linkcollab.component.scss']
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
  

  now_in_seconds:number;
  subcategory:number;
  remuneration:boolean=false;
  type_of_project:string="none";
  author:string="none";
  target:string="none";
  sorting:string="pertinence";
  list_of_ads:any[]=[];
  list_of_ads_received=false;
  /*********************************************************************** */
  /*********************************************************************** */
  /*On init */
  /*********************************************************************** */
  /*********************************************************************** */
  ngOnInit() {

    this.now_in_seconds= Math.trunc( new Date().getTime()/1000);
    this.get_sorted_ads(this);
    
    this.open_subcategory(0);

  }

  /*********************************************************************** */
  /*********************************************************************** */
  /*After view init */
  /*********************************************************************** */
  /*********************************************************************** */
  ngAfterViewInit() {
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
    if(i==1){
      this.remuneration=true;
      this.get_sorted_ads(this);
    }
    this.subcategory=i;
    this.initialize_selectors();
    return;
  }

  
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
      $(".SelectBox5").SumoSelect({
      });
    });
    $('.panel-controller .right-container').hide().delay(80).show('fast');

    $(".SelectBox1").change(function(){
       console.log($(this).val());
        if($(this).val()=="Tout"){
        THIS.type_of_project="none";
        }
        else{
          THIS.type_of_project=$(this).val();
        }
       
       THIS.get_sorted_ads(THIS);
    });
    $(".SelectBox2").change(function(){
      console.log($(this).val());
      if($(this).val()=="Tout"){
        THIS.author="none";
      }
      else{
        THIS.author=$(this).val();
      }
      THIS.get_sorted_ads(THIS);
    });
    $(".SelectBox3").change(function(){
      console.log($(this).val());
      if($(this).val()=="Tout"){
        THIS.target="none";
        }
        else{
          THIS.target=$(this).val();
        }
      THIS.get_sorted_ads(THIS);
    });
    $(".SelectBox4").change(function(){
      console.log($(this).val());
      if($(this).val()=="Tri par pertinence"){
        THIS.sorting="pertinence";
      }
      if($(this).val()=="Tri par le plus récent"){
        THIS.sorting="récent";
      }
      else{
        THIS.sorting="ancient";
      };
      THIS.get_sorted_ads(THIS);
    });

  }

  get_sorted_ads(THIS){
    THIS.list_of_ads_received=false;
    THIS.list_of_ads=[];
    THIS.Ads_service.get_sorted_ads(THIS.remuneration,THIS.type_of_project,THIS.author,THIS.target,THIS.sorting).subscribe(r=>{
      console.log(r);
      console.log(r[0]);
      if (r[0]!=null){
        for (let i=0;i<r[0].length;i++){
          THIS.list_of_ads[i]=r[0][i];
            if(i==r[0].length-1){
                THIS.list_of_ads_received=true;
            }
        }
      }
    })
  }


}
