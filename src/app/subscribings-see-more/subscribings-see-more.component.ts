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

declare var $: any

@Component({
  selector: 'app-subscribings-see-more',
  templateUrl: './subscribings-see-more.component.html',
  styleUrls: ['./subscribings-see-more.component.scss']
})
export class SubscribingsSeeMoreComponent implements OnInit {

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

    ) { }

  subcategory: number = 0; 
  user_id:number=0;

  @Input() list_of_users:any[]=[];
  list_of_contents:any[]=[];
  list_of_contents_sorted:boolean=false;
  show_more:boolean=false;

  @Input() now_in_seconds:number;
  @Input()last_timestamp:string;

  ngOnInit() {
    this.see_more_contents();

  }


  
  sort_more_list_of_contents(list){
    if(list.length>1){
      for (let i=1; i<list.length; i++){
        let time = this.convert_timestamp_to_number(list[i].createdAt);
        for (let j=0; j<i;j++){
          if(time > this.convert_timestamp_to_number(list[j].createdAt)){
            list.splice(j, 0, list.splice(i, 1)[0]);
            
          }
          if(j==list.length -2 ){
            this.list_of_contents_sorted=true;
            this.last_timestamp=list[list.length-1].createdAt;
          }
        }
      }
    }
    else{
      this.list_of_contents_sorted=true;
      this.last_timestamp=list[0].createdAt;
    }

  }

  convert_timestamp_to_number(timestamp){
    var uploaded_date = timestamp.substring(0,timestamp.length- 5);
    uploaded_date=uploaded_date.replace("T",' ');
    uploaded_date=uploaded_date.replace("-",'/').replace("-",'/');
    let number = new Date(uploaded_date + ' GMT').getTime()/1000;
    return number;
  }




  see_more_contents(){
    this.Subscribing_service.see_more_contents(this.list_of_users,this.last_timestamp).subscribe(r=>{
      if(r[0].length>0){
        for (let j=0; j< r[0].length;j++){
          if(r[0][j].publication_category=="comics"){
            if(r[0][j].format=="one-shot"){
              this.BdOneShotService.retrieve_bd_by_id(r[0][j].publication_id).subscribe(info=>{
                if(info[0].status="public"){
                  this.list_of_contents.push(info[0]);
                  if(this.list_of_contents.length == r[0].length){
                    this.sort_more_list_of_contents( this.list_of_contents);
                  }
                }
              })
            }
            if(r[0][j].format=="serie"){
              this.BdSerieService.retrieve_bd_by_id(r[0][j].publication_id).subscribe(info=>{
                if(info[0].status="public"){
                  this.list_of_contents.push(info[0]);
                  if( this.list_of_contents.length == r[0].length){
                    this.sort_more_list_of_contents( this.list_of_contents);
                  }
                }
              })
            }
          }

          if(r[0][j].publication_category=="drawing"){
            if(r[0][j].format=="one-shot"){
              this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(r[0][j].publication_id).subscribe(info=>{
                if(info[0].status="public"){
                  this.list_of_contents.push(info[0]);
                  if( this.list_of_contents.length == r[0].length){
                    this.sort_more_list_of_contents( this.list_of_contents);
                  }
                }
              })
            }
            if(r[0][j].format=="artbook"){
              this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(r[0][j].publication_id).subscribe(info=>{
                if(info[0].status="public"){
                  this.list_of_contents.push(info[0]);
                  if( this.list_of_contents.length == r[0].length){
                    this.sort_more_list_of_contents( this.list_of_contents);
                  }
                }
              })
            }
          }

          if(r[0][j].publication_category=="writing"){
              this.Writing_Upload_Service.retrieve_writing_information_by_id(r[0][j].publication_id).subscribe(info=>{
                if(info[0].status="public"){
                  this.list_of_contents.push(info[0]);
                  if( this.list_of_contents.length == r[0].length){
                    this.sort_more_list_of_contents( this.list_of_contents);
                  }
                }
              })
          }

          
        }
      }
      else{
        this.list_of_contents_sorted=true;
      }
    });

  }

  see_more(){
    this.show_more=true;
  }

}
