import { Component, OnInit, Input, SimpleChange } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { SimpleChanges } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Community_recommendation } from '../services/recommendations.service';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';
import { Drawings_Onepage_Service } from '../services/drawings_one_shot.service';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { Writing_Upload_Service } from '../services/writing.service';

import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Subscribing_service } from '../services/subscribing.service';
import { ConstantsService } from '../services/constants.service';
import { Trending_service } from '../services/trending.service';



declare var $: any

@Component({
  selector: 'app-trendings',
  templateUrl: './trendings.component.html',
  styleUrls: ['./trendings.component.scss'],
  providers: [Trending_service]
})
export class TrendingsComponent implements OnInit {

  constructor(
    private rd: Renderer2,
    private _constants: ConstantsService,
    private Community_recommendation:Community_recommendation,
    private BdOneShotService:BdOneShotService,
    private BdSerieService:BdSerieService,
    private Profile_Edition_Service:Profile_Edition_Service,
    private Subscribing_service:Subscribing_service,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private Writing_Upload_Service:Writing_Upload_Service,
    private Trending_service:Trending_service

    ) { }

  subcategory: number = 0; 
  user_id:number=0;


  comics_trendings_sorted:any[]=[];
  list_of_comics_rankings:any[]=[];
  comics_trendings_length:number=0;
  comics_trendings_sorted_confirmation:boolean=false;

  drawings_trendings_sorted:any[]=[];
  drawings_trendings_length:number=0;
  drawings_trendings_sorted_confirmation:boolean=false;

  writings_trendings_sorted:any[]=[];
  writings_trendings_length:number=0;
  writings_trendings_sorted_confirmation:boolean=false;


  now_in_seconds:number;

  ngOnInit() {
    this.now_in_seconds= Math.trunc( new Date().getTime()/1000);
    this.Trending_service.send_rankings_and_get_trendings_comics().subscribe(info=>{
      console.log(info);
      if (info == 'get_comics_trendings'){
        this.Trending_service.get_comics_trendings().subscribe(information=>{
          console.log(information);
          this.load_comics_trendings(information);
        });
      }
      else{
        console.log(info);
        this.load_comics_trendings(info);
      }
     
    });
  }



  open_subcategory(i) {
    if( this.subcategory==i ) {
      return;
    }
    if(i==0){
      this.subcategory=i;
    }
    else if(i==1){
      this.Trending_service.get_drawings_trendings().subscribe(info=>{
        this.load_drawing_trendings(info);
        
      })
      this.subcategory=i;  
    }
    else if(i==2){
      this.Trending_service.get_writings_trendings().subscribe(info=>{
        this.load_writing_trendings(info);      
      })
      this.subcategory=i;
    }
    return;
  }

  
  convert_timestamp_to_number(timestamp){
    var uploaded_date = timestamp.substring(0,timestamp.length- 5);
    uploaded_date=uploaded_date.replace("T",' ');
    uploaded_date=uploaded_date.replace("-",'/').replace("-",'/');
    let number = new Date(uploaded_date + ' GMT').getTime()/1000;
    return number;
  }
 

 
  load_comics_trendings(info){
    let compteur=0;
    this.comics_trendings_length= Object.keys(info[0].comics_trendings.format).length;
    if(this.comics_trendings_length>0){
      for(let i=0; i < Object.keys(info[0].comics_trendings.format).length;i++){
        if(info[0].comics_trendings.format[i] =="one-shot"){
          this.BdOneShotService.retrieve_bd_by_id(info[0].comics_trendings.publication_id[i]).subscribe(r=>{
            if(r[0].status=="public"){
              this.comics_trendings_sorted[i]=r[0];
              compteur=compteur+1;
              if(compteur == this.comics_trendings_length ){
                this.delete_empty_elements(this.comics_trendings_sorted,"comics");
              }
            }
            else{
              compteur=compteur+1;
              if(compteur == this.comics_trendings_length ){
                this.delete_empty_elements(this.comics_trendings_sorted,"comics");
               
              }
            }
            
          })
        }
        if(info[0].comics_trendings.format[i] =="serie"){
          this.BdSerieService.retrieve_bd_by_id(info[0].comics_trendings.publication_id[i]).subscribe(r=>{
            if(r[0].status=="public"){
              this.comics_trendings_sorted[i]=r[0];
              compteur=compteur+1;
              if(compteur == this.comics_trendings_length ){
                this.delete_empty_elements(this.comics_trendings_sorted,"comics");
              }
            }
            else{
              compteur=compteur+1;
              if(compteur == this.comics_trendings_length){
                this.delete_empty_elements(this.comics_trendings_sorted,"comics");
              }
            }
          })
        }     
      };
    }
    else{
      console.log("no comics trendings")
    }
        
  }

  load_drawing_trendings(info){
    this.drawings_trendings_length= Object.keys(info[0].drawings_trendings.format).length;
        console.log(info[0]);
        let compteur=0;
        if(this.drawings_trendings_length>0){
          for(let i=0; i < Object.keys(info[0].drawings_trendings.format).length;i++){
            if(info[0].drawings_trendings.format[i] =="one-shot"){
              this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(info[0].drawings_trendings.publication_id[i]).subscribe(r=>{
                if(r[0].status=="public"){
                  this.drawings_trendings_sorted[i]=r[0];
                  compteur = compteur +1;
                  if(compteur == this.drawings_trendings_length){
                    this.delete_empty_elements(this.comics_trendings_sorted,"drawings");
                  }
                }
                else{
                  compteur=compteur+1;
                  if(compteur == this.drawings_trendings_length){
                    this.delete_empty_elements(this.comics_trendings_sorted,"drawings");
                  }
                }
              })
            }
            if(info[0].drawings_trendings.format[i] =="artbook"){
              this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(info[0].drawings_trendings.publication_id[i]).subscribe(r=>{
                if(r[0].status=="public"){
                  this.drawings_trendings_sorted[i]=r[0];
                  compteur = compteur +1;
                  if(compteur == this.drawings_trendings_length){
                    this.delete_empty_elements(this.comics_trendings_sorted,"drawings");
                  }
                }
                else{
                  compteur=compteur+1;
                  if(compteur == this.drawings_trendings_length){
                    this.delete_empty_elements(this.comics_trendings_sorted,"drawings");
                  }
                }
              })
            }
          }
        }
        else{
          console.log("no drawings trends")
        }
  }

  load_writing_trendings(info){
    this.writings_trendings_length= Object.keys(info[0].writings_trendings.format).length;
    console.log(info[0]);
    let compteur=0;
    if(this.writings_trendings_length>0){
      for(let i=0; i < Object.keys(info[0].writings_trendings.format).length;i++){
        this.Writing_Upload_Service.retrieve_writing_information_by_id(info[0].writings_trendings.publication_id[i]).subscribe(r=>{
          if(r[0].status=="public"){
            this.writings_trendings_sorted[i]=r[0];
            compteur = compteur +1;
            if(compteur == this.writings_trendings_length){
              this.delete_empty_elements(this.comics_trendings_sorted,"writings");
            }
          }
          else{
            compteur=compteur+1;
            if(compteur == this.writings_trendings_length ){
              this.delete_empty_elements(this.comics_trendings_sorted,"writings");
            }
          }
        }) 
      }
    }
    else{
      console.log("no writings trends")
    }
    
  }




  delete_empty_elements(list,type:string){
    let length1=list.length;
    if(list.length>0){
      for(let i=0;i<list.length;i++){
        if(!list[i]){
            list.pop(i);
        }
        if(i==length1-1){
          let length2=list.length
          for(let j=0;j<list.length;j++){
            if(j>14){
              list.pop(j)
            }
            if(j==length2-1){
              if(type=="comics"){
                this.comics_trendings_sorted_confirmation=true;
                console.log(this.comics_trendings_sorted);
              }
              if(type=="drawings"){
                this.drawings_trendings_sorted_confirmation=true;
                console.log(this.drawings_trendings_sorted);
              }
              if(type=="writings"){
                this.writings_trendings_sorted_confirmation=true;
                console.log(this.writings_trendings_sorted);
              }
              
            }
          }
          
        }
      }
    }
    else{
      return list
    }
  }


}

