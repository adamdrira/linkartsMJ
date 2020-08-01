import { Component, OnInit, Input, SimpleChange, ChangeDetectorRef, HostListener } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { SimpleChanges } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Community_recommendation } from '../services/recommendations.service';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';

import { ConstantsService } from '../services/constants.service';

declare var Swiper: any
declare var $: any


@Component({
  selector: 'app-recommendations',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.scss']
})



export class RecommendationsComponent implements OnInit {

  constructor(
    private rd: Renderer2,
    private cd:ChangeDetectorRef,
    private _constants: ConstantsService,
    private Community_recommendation:Community_recommendation,
    private BdOneShotService:BdOneShotService,
    private BdSerieService:BdSerieService
    ) { }

  
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.cd.detectChanges();
    this.display_selector();
  }
  
  index_bd=0;
  sorted_style_list_bd:any[]=["Manga","Webtoon","BD","Comics"];
  sorted_artpieces_manga:any[]=[];
  sorted_artpieces_manga_format:string[]=[];
  sorted_artpieces_comics:any[]=[];
  sorted_artpieces_comics_format:string[]=[];
  sorted_artpieces_webtoon:any[]=[];
  sorted_artpieces_webtoon_format:string[]=[];
  sorted_artpieces_bd:any[]=[];
  sorted_artpieces_bd_format:string[]=[];
  compteur_bd_is_loaded=0;
  compare_to_compteur_bd=0;
  bd_is_loaded:boolean=false;

  index_drawing=0;
  sorted_style_list_drawing:any[]=["Traditionnel","Digital"];
  sorted_artpieces_traditional:any[]=[];
  sorted_artpieces_traditional_format:string[]=[];
  sorted_artpieces_digital:any[]=[];
  sorted_artpieces_digital_format:string[]=[];
  compteur_drawing_is_loaded=0;
  compare_to_compteur_drawing=0;
  drawing_is_loaded:boolean=false;

  index_writing=0;
  sorted_style_list_writing:any[]=["Illustrated novel","Roman","Scenario","Article","Poetry"];
  sorted_artpieces_illustrated_novel:any[]=[];
  sorted_artpieces_roman:any[]=[];
  sorted_artpieces_scenario:any[]=[];
  sorted_artpieces_article:any[]=[];
  sorted_artpieces_poetry:any[]=[];
  compteur_writing_is_loaded=0;
  compare_to_compteur_writing=0;
  writing_is_loaded:boolean=false;
  
  now_in_seconds:number;
  subcategory: number = 0;
 // dropdowns = this._constants.filters;

  

  ngOnInit() {
    this.display_selector();
    this.initializeselector();
    this.now_in_seconds= Math.trunc( new Date().getTime()/1000);
    this.Community_recommendation.send_list_view_to_python().subscribe(r=>{
      console.log(r)
      if (r>=1){
        this.Community_recommendation.sorted_category_list().subscribe(information=>{
          console.log(information);
          this.index_bd= information[0].bd;
          this.index_drawing= information[0].drawing;
          this.index_writing= information[0].writing;
          if( this.index_bd == 0) {
            this.subcategory=0;
          } 
          if(this.index_drawing == 0){
            this.subcategory=1;
          } 
          else if(this.index_writing == 0) {
            this.subcategory=2;
          }
          this.Community_recommendation.sorted_favourite_type_list().subscribe(information=>{
            var i = 0;
            var j=0;
            var k=0;
            if(this.index_bd >=0){
              for (let item of information[0].bd[this.index_bd]){
                this.change_list_position(this.sorted_style_list_bd,this.sorted_style_list_bd.indexOf(item[0]),i);
                i++;
              };
            }
            if(this.index_drawing >=0){
              
              for (let item of information[0].drawing[this.index_drawing]){
                this.change_list_position(this.sorted_style_list_drawing,this.sorted_style_list_drawing.indexOf(item[0]),j);
                j++;
              };
            }
            if(this.index_writing>=0){
              for (let item of information[0].writing[this.index_writing]){
                this.change_list_position(this.sorted_style_list_writing,this.sorted_style_list_writing.indexOf(item[0]),k);
                k++;
              };
              for (let i=0; i< this.sorted_style_list_writing.length;i++) {
                if (this.sorted_style_list_writing[i] == "Scenario") {
                  this.sorted_style_list_writing[i] ="Scénario";
                }
                else if (this.sorted_style_list_writing[i]  == "Illustrated novel") {
                  this.sorted_style_list_writing[i] ="Roman illustré";
                }
                else if (this.sorted_style_list_writing[i]  == "Poetry") {
                  this.sorted_style_list_writing[i] ="Poésie";
                }
              }
            }
 
          });

        if(this.subcategory==0){
          this.load_bd_recommendations();
        }
        if(this.subcategory==1){
          this.load_drawing_recommendations();
        }
        if(this.subcategory==2){
          this.load_writing_recommendations();
        }
        });
      }
      else{
        this.Community_recommendation.delete_recommendations_artpieces().subscribe(l=>{
          this.load_bd_recommendations();
        })
      }
    })

  }

  
 




  change_list_position(list,from, to) {
    if (from!=to){;
      list.splice(to, 0, list.splice(from, 1)[0]);
    }
  }


  open_subcategory(i) {
    if( this.subcategory==i ) {
      return;
    }
    if(i==0){
      if(!this.bd_is_loaded){
       this.load_bd_recommendations();
      }     
      this.subcategory=i;
    }
    else if(i==1){
      if(!this.drawing_is_loaded ){
      
        this.load_drawing_recommendations()
      }
      this.subcategory=i;  
    }
    else if(i==2){
      if(!this.writing_is_loaded){
        this.load_writing_recommendations();
      }
      this.subcategory=i;
    }
    
    return;
  }
  


  /*initialize_selectors() {
    $(document).ready(function () {
      $('.SelectBox').SumoSelect({
        okCancelInMulti: true, 
        selectAll: true,
      });
    });
    $('.panel-controller .right-container').hide().delay(80).show('fast');
  }*/

  bd_os_is_loaded=false;
  bd_serie_is_load=false;

  load_bd_recommendations(){
    this.Community_recommendation.get_first_recommendation_bd_os_for_user(this.index_bd,this.index_drawing,this.index_writing)
          .subscribe(information=>{
            console.log(information);
            var list_bd_os = information[0].list_bd_os_to_send;
            this.compare_to_compteur_bd+=  list_bd_os.length;
            if(list_bd_os.length>0){
              for (let i=0; i<list_bd_os.length;i++){
                if(list_bd_os[i][0]){
                  if(list_bd_os[i][0].category =="Manga"){
                    if( this.sorted_artpieces_manga.length<5 && list_bd_os[i][0].status=='public'){
                      this.sorted_artpieces_manga.push(list_bd_os[i][0]);
                      this.sorted_artpieces_manga_format.push("one-shot");
                    }                 
                    if(i==list_bd_os.length-1){
                      this.bd_os_is_loaded=true;
                      if(this.bd_os_is_loaded && this.bd_serie_is_load){
                        this.bd_is_loaded=true;
                      }
                    }
                  }
                  if(list_bd_os[i][0].category =="Comics" ){
                    if( this.sorted_artpieces_comics.length<5 && list_bd_os[i][0].status=='public'){
                      this.sorted_artpieces_comics.push(list_bd_os[i][0]);
                      this.sorted_artpieces_comics_format.push("one-shot");
                    }
                    if(i==list_bd_os.length-1){
                      this.bd_os_is_loaded=true;
                      if(this.bd_os_is_loaded && this.bd_serie_is_load){
                        this.bd_is_loaded=true;
                      }
                    }
                  }
                  if(list_bd_os[i][0].category =="Webtoon" ){
                    if( this.sorted_artpieces_webtoon.length<5 && list_bd_os[i][0].status=='public'){
                      this.sorted_artpieces_webtoon.push(list_bd_os[i][0]);
                      this.sorted_artpieces_webtoon_format.push("one-shot");
                    }
                    if(i==list_bd_os.length-1){
                      this.bd_os_is_loaded=true;
                      if(this.bd_os_is_loaded && this.bd_serie_is_load){
                        console.log("bd_is_loaded");
                        this.bd_is_loaded=true;
                      }
                    }
                  }
                  if(list_bd_os[i][0].category =="BD" ){
                    if( this.sorted_artpieces_bd.length<5 && list_bd_os[i][0].status=='public'){
                      this.sorted_artpieces_bd.push(list_bd_os[i][0]);
                      this.sorted_artpieces_bd_format.push("one-shot");
                    }
                    if(i==list_bd_os.length-1){
                      this.bd_os_is_loaded=true;
                      if(this.bd_os_is_loaded && this.bd_serie_is_load){
                        this.bd_is_loaded=true;
                      }
                    }
                  }
                }
                else{
                  if(i==list_bd_os.length-1){
                    this.bd_os_is_loaded=true;
                    if(this.bd_os_is_loaded && this.bd_serie_is_load){
                      this.bd_is_loaded=true;
                    }
                  }
                }
                
              }
            }  
            else{
              this.bd_os_is_loaded=true;
              if(this.bd_os_is_loaded && this.bd_serie_is_load){
                this.bd_is_loaded=true;
              }
            }
          });

          this.Community_recommendation.get_first_recommendation_bd_serie_for_user(this.index_bd,this.index_drawing,this.index_writing)
          .subscribe(information=>{
            console.log(information)
            var list_bd_serie= information[0].list_bd_serie_to_send;
            this.compare_to_compteur_bd+= list_bd_serie.length;
            if(list_bd_serie.length>0){
              for (let i=0; i<list_bd_serie.length;i++){
                if (list_bd_serie[i].length>0){
                  if(list_bd_serie[i][0]){
                    if(list_bd_serie[i][0].category =="Comics"){
                      if( this.sorted_artpieces_comics.length<5 && list_bd_serie[i][0].status=='public'){
                        this.sorted_artpieces_comics.push(list_bd_serie[i][0]);
                        this.sorted_artpieces_comics_format.push("serie");
                      }
                      if(i==list_bd_serie.length-1){
                        this.bd_serie_is_load=true;
                        if(this.bd_os_is_loaded && this.bd_serie_is_load){
                          this.bd_is_loaded=true;
                        }
                      }
                      
                    }
                    if(list_bd_serie[i][0].category =="Manga"){
                      if( this.sorted_artpieces_manga.length<5 && list_bd_serie[i][0].status=='public'){
                        this.sorted_artpieces_manga.push(list_bd_serie[i][0]);
                        this.sorted_artpieces_manga_format.push("serie");
                      }
                      if(i==list_bd_serie.length-1){
                        this.bd_serie_is_load=true;
                        if(this.bd_os_is_loaded && this.bd_serie_is_load){
                          this.bd_is_loaded=true;
                        }
                      }
                    }
                    if(list_bd_serie[i][0].category =="Webtoon"){
                      if( this.sorted_artpieces_webtoon.length<5 && list_bd_serie[i][0].status=='public'){
                        this.sorted_artpieces_webtoon.push(list_bd_serie[i][0]);
                        this.sorted_artpieces_webtoon_format.push("serie");
                      }
                      if(i==list_bd_serie.length-1){
                        this.bd_serie_is_load=true;
                        if(this.bd_os_is_loaded && this.bd_serie_is_load){
                          this.bd_is_loaded=true;
                        }
                      }
                    }
                    if(list_bd_serie[i][0].category =="BD"){
                      if( this.sorted_artpieces_bd.length<5 && list_bd_serie[i][0].status=='public'){
                        this.sorted_artpieces_bd.push(list_bd_serie[i][0]);
                        this.sorted_artpieces_bd_format.push("serie");
                      }
                      if(i==list_bd_serie.length-1){
                        this.bd_serie_is_load=true;
                        if(this.bd_os_is_loaded && this.bd_serie_is_load){
                          this.bd_is_loaded=true;
                        }
                      }
                    }
                  }
                  else{
                    if(i==list_bd_serie.length-1){
                      this.bd_serie_is_load=true;
                      if(this.bd_os_is_loaded && this.bd_serie_is_load){
                        this.bd_is_loaded=true;
                      }
                    }
                  }
                  
                }

              }
            }
            else{
              this.bd_serie_is_load=true;
              if(this.bd_os_is_loaded && this.bd_serie_is_load){
                this.bd_is_loaded=true;
              }
            }
              
          });
  }
  drawing_artbook_is_loaded=false;
  drawing_onepage_is_loaded=false;
  load_drawing_recommendations(){
    this.Community_recommendation.get_first_recommendation_drawing_artbook_for_user(this.index_bd,this.index_drawing,this.index_writing)
          .subscribe(information=>{
            var list_artbook= information[0].list_artbook_to_send;
            console.log(list_artbook);
            console.log("on entre dans artbook")
            this.compare_to_compteur_drawing= this.compare_to_compteur_drawing + list_artbook.length;
            if(list_artbook.length>0){
              for (let i=0;i<list_artbook.length;i++){
                console.log(list_artbook[i].length);
                if (list_artbook[i].length>0){
                  if(list_artbook[i][0].category =="Traditionnel"){
                    if( this.sorted_artpieces_traditional.length<5 && list_artbook[i][0].status=='public'){
                      this.sorted_artpieces_traditional.push(list_artbook[i][0]);
                      this.sorted_artpieces_traditional_format.push("artbook");
                    }
                    if(i==list_artbook.length-1){
                      this.drawing_artbook_is_loaded=true;
                      console.log("on valide artbook")
                      if(this.drawing_artbook_is_loaded && this.drawing_onepage_is_loaded){
                        console.log(this.sorted_artpieces_traditional);
                        console.log("on valide tout dans artbook")
                        this.drawing_is_loaded=true;
                      }
                    }
                  }
                  if(list_artbook[i][0].category =="Digital"){
                    if( this.sorted_artpieces_digital.length<5 && list_artbook[i][0].status=='public'){
                      this.sorted_artpieces_digital.push(list_artbook[i][0]);
                      this.sorted_artpieces_digital_format.push("artbook");
                    }
                    if(i==list_artbook.length-1){
                      this.drawing_artbook_is_loaded=true;
                      console.log("on valise artbook")
                      if(this.drawing_artbook_is_loaded && this.drawing_onepage_is_loaded){
                        console.log(this.sorted_artpieces_traditional);
                        console.log("on valide tout dans artbook")
                        this.drawing_is_loaded=true;
                      }
                    }
                  }
                }
                else{
                  console.log("on est dans le else if")
                  if(i==list_artbook.length-1){
                    this.drawing_artbook_is_loaded=true;
                    console.log("on valide artbook")
                    if(this.drawing_artbook_is_loaded && this.drawing_onepage_is_loaded){
                      console.log(this.sorted_artpieces_traditional);
                      console.log("on valide tout dans artbook")
                      this.drawing_is_loaded=true;
                    }
                  }
                }
                
              }
            }
            else{
                this.drawing_artbook_is_loaded=true;
                console.log("on valise artbook")
                if(this.drawing_artbook_is_loaded && this.drawing_onepage_is_loaded){
                  console.log(this.sorted_artpieces_traditional);
                  console.log("on valide tout dans artbook")
                  this.drawing_is_loaded=true;
                }
            }
            
          });

          this.Community_recommendation.get_first_recommendation_drawing_os_for_user(this.index_bd,this.index_drawing,this.index_writing)
          .subscribe(information=>{
            var list_drawing_os= information[0].list_drawing_os_to_send;
            console.log(list_drawing_os);
            console.log("on entre dans onpage")
            this.compare_to_compteur_drawing= this.compare_to_compteur_drawing + list_drawing_os.length;
            if(list_drawing_os.length>0){
              for (let i=0;i<list_drawing_os.length;i++){
                console.log(list_drawing_os[i][0]);
                if (list_drawing_os[i].length>0){
                  if(list_drawing_os[i][0].category =="Traditionnel"){
                    if( this.sorted_artpieces_traditional.length<5 && list_drawing_os[i][0].status=='public'){
                      this.sorted_artpieces_traditional.push(list_drawing_os[i][0]);
                      this.sorted_artpieces_traditional_format.push("one-shot");
                    }
                    if(i==list_drawing_os.length-1){
                      this.drawing_onepage_is_loaded=true;
                      console.log("on valise onepage")
                      if(this.drawing_artbook_is_loaded && this.drawing_onepage_is_loaded){
                        console.log(this.sorted_artpieces_traditional);
                        console.log("on valide tout dans artbook")
                        this.drawing_is_loaded=true;
                      }
                    }
                  }
                  if(list_drawing_os[i][0].category =="Digital"){
                    if( this.sorted_artpieces_digital.length<5 && list_drawing_os[i][0].status=='public'){
                      this.sorted_artpieces_digital.push(list_drawing_os[i][0]);
                      this.sorted_artpieces_digital_format.push("one-shot");
                    }
                    if(i==list_drawing_os.length-1){
                      this.drawing_onepage_is_loaded=true;
                      console.log("on valise onepage")
                      if(this.drawing_artbook_is_loaded && this.drawing_onepage_is_loaded){
                        console.log(this.sorted_artpieces_traditional);
                        console.log("on valide tout dans artbook")
                        this.drawing_is_loaded=true;
                      }
                    }
                  }
                }
                else if(!list_drawing_os[i][0]){
                  if(i==list_drawing_os.length-1){
                    this.drawing_onepage_is_loaded=true;
                    console.log("on valise onepage")
                    if(this.drawing_artbook_is_loaded && this.drawing_onepage_is_loaded){
                      console.log(this.sorted_artpieces_traditional);
                      console.log("on valide tout dans artbook")
                      this.drawing_is_loaded=true;
                    }
                  }
                }
                
              }
            }
            else{
                this.drawing_onepage_is_loaded=true;
                console.log("on valise onepage")
                if(this.drawing_artbook_is_loaded && this.drawing_onepage_is_loaded){
                  console.log(this.sorted_artpieces_traditional);
                  console.log("on valide tout dans artbook")
                  this.drawing_is_loaded=true;
                }
            }
          });
  }

  load_writing_recommendations(){
    this.Community_recommendation.get_first_recommendation_writings_for_user(this.index_bd,this.index_drawing,this.index_writing)
          .subscribe(information=>{
            var list_writings_to_send= information[0].list_writings_to_send;
            this.compare_to_compteur_writing = this.compare_to_compteur_writing + list_writings_to_send.length;
            if(list_writings_to_send.length>0){
              for (let i=0;i<list_writings_to_send.length;i++){
                if (list_writings_to_send[0].length>0){
                  if(list_writings_to_send[0][0].category =="Illustrated novel"){
                    if( this.sorted_artpieces_illustrated_novel.length<5 && list_writings_to_send[i][0].status=='public'){
                      this.sorted_artpieces_illustrated_novel.push(list_writings_to_send[0][0]);
                    }
                    if(i==list_writings_to_send.length-1){
                      this.writing_is_loaded=true;
                    }
                  }
                  if(list_writings_to_send[0][0].category =="Roman"){
                    if( this.sorted_artpieces_roman.length<5 && list_writings_to_send[i][0].status=='public'){
                      this.sorted_artpieces_roman.push(list_writings_to_send[0][0]);
                    }
                    if(i==list_writings_to_send.length-1){
                      this.writing_is_loaded=true;
                    }
                  }
                  if(list_writings_to_send[0][0].category =="Scenario"){
                    if( this.sorted_artpieces_scenario.length<5 && list_writings_to_send[i][0].status=='public'){
                       this.sorted_artpieces_scenario.push(list_writings_to_send[0][0]);
                    }
                    if(i==list_writings_to_send.length-1){
                      this.writing_is_loaded=true;
                    }
                  }
                  if(list_writings_to_send[0][0].category =="Article"){
                    if( this.sorted_artpieces_article.length<5 && list_writings_to_send[i][0].status=='public'){
                       this.sorted_artpieces_article.push(list_writings_to_send[0][0]);
                    }
                    if(i==list_writings_to_send.length-1){
                      this.writing_is_loaded=true;
                    }
                  }
                  if(list_writings_to_send[0][0].category =="Poetry"){
                    if( this.sorted_artpieces_poetry.length<5 && list_writings_to_send[i][0].status=='public'){
                       this.sorted_artpieces_poetry.push(list_writings_to_send[0][0]);
                    }
                    if(i==list_writings_to_send.length-1){
                      this.writing_is_loaded=true;
                    }
                  }
                }
                else{
                  if(i==list_writings_to_send.length-1){
                    this.writing_is_loaded=true;
                  }
                }
              }
            }
            else{
                this.writing_is_loaded=true;
            }
            

            
          });
  }



  little_screen=false;
  initializeselector(){
    let THIS=this;
    $(document).ready(function () {
      $('.f00select1').SumoSelect({});
    });
  
  
    $(".f00select0").change(function(){
      if($(this).val()=="1"){
        THIS.open_subcategory(1);
      }
      if($(this).val()=="2"){
        THIS.open_subcategory(2);
      }
      else{
        THIS.open_subcategory(0);
      }
      THIS.cd.detectChanges();
    })
  }
  
  display_selector(){
    let width = $(".container-fluid").width();
    
    if( width <= 825) {
      this.little_screen=true;
    }
    else{
      this.little_screen=false;
    }
    
  }
  

}
