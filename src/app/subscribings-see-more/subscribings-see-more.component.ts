import { Component, OnInit, Input,  HostListener, Output, EventEmitter } from '@angular/core';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';
import { Drawings_Onepage_Service } from '../services/drawings_one_shot.service';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { Writing_Upload_Service } from '../services/writing.service';
import { Ads_service } from '../services/ads.service';
import { Subscribing_service } from '../services/subscribing.service';
import { trigger, transition, style, animate } from '@angular/animations';

import { first } from 'rxjs/operators';


@Component({
  selector: 'app-subscribings-see-more',
  templateUrl: './subscribings-see-more.component.html',
  styleUrls: ['./subscribings-see-more.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateY(0)', opacity: 0}),
          animate('500ms', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ]
    ),
  ],
})
export class SubscribingsSeeMoreComponent implements OnInit  {

  constructor(
    private Ads_service:Ads_service,
    private BdOneShotService:BdOneShotService,
    private BdSerieService:BdSerieService,
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
  can_show_more=false;

  @HostListener("window:scroll", ["$event"])
  onWindowScroll() {
    let pos = (document.documentElement.scrollTop || document.body.scrollTop) + document.documentElement.offsetHeight;
    let max = document.documentElement.scrollHeight;
    let sup=max*0.1;
    if(pos>= max - sup && this.can_show_more)   {
      this.show_more=true;
    }
  }


  
  ngOnInit() {
    this.see_more_contents();

  }

  
  @Output() manage_show_more = new EventEmitter<object>();
  function_manage_show_more(){
    this.manage_show_more.emit({done:"done"});
  }
  
  sort_more_list_of_contents(list){
    if(list.length>1){
      for (let i=1; i<list.length; i++){
        let time = this.convert_timestamp_to_number(list[i].createdAt);
        for (let j=0; j<i;j++){
          if(time > this.convert_timestamp_to_number(list[j].createdAt)  && time==this.convert_timestamp_to_number(list[i].createdAt)){
            list.splice(j, 0, list.splice(i, 1)[0]);
          }
        }
      }
      this.list_of_contents_sorted=true;
      this.last_timestamp=list[list.length-1].createdAt;
      this.can_show_more=true;
    }
    else {
     
      this.list_of_contents_sorted=true;
      this.can_show_more=false;
      this.function_manage_show_more()
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
    this.Subscribing_service.see_more_contents(this.list_of_users,this.last_timestamp).pipe( first()).subscribe(r=>{
      if(r[0].length>0){
        let compt=0;
        for (let j=0; j< r[0].length;j++){
          if(r[0][j].publication_category=="comic"){
            if(r[0][j].format=="one-shot"){
              this.BdOneShotService.retrieve_bd_by_id(r[0][j].publication_id).pipe( first()).subscribe(info=>{
                if(info[0] && info[0].status=="public"){
                  this.list_of_contents.push(info[0]);
                  compt++
                }
                else{
                  compt++
                }

                if(compt == r[0].length){
                  this.sort_more_list_of_contents( this.list_of_contents);
                }
              })
            }
            if(r[0][j].format=="serie"){
              this.BdSerieService.retrieve_bd_by_id(r[0][j].publication_id).pipe( first()).subscribe(info=>{
                if(info[0] && info[0].status=="public"){
                  this.list_of_contents.push(info[0]);
                  compt++
                }
                else{
                  compt++
                }

                if(compt == r[0].length){
                  this.sort_more_list_of_contents( this.list_of_contents);
                }
              })
            }
          }

          if(r[0][j].publication_category=="drawing"){
            if(r[0][j].format=="one-shot"){
              this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(r[0][j].publication_id).pipe( first()).subscribe(info=>{
                if(info[0] && info[0].status=="public"){
                  this.list_of_contents.push(info[0]);
                  compt++
                }
                else{
                  compt++
                }

                if(compt == r[0].length){
                  this.sort_more_list_of_contents( this.list_of_contents);
                }
              })
            }
            if(r[0][j].format=="artbook"){
              this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(r[0][j].publication_id).pipe( first()).subscribe(info=>{
                if(info[0] && info[0].status=="public"){
                  this.list_of_contents.push(info[0]);
                  compt++
                }
                else{
                  compt++
                }

                if(compt == r[0].length){
                  this.sort_more_list_of_contents( this.list_of_contents);
                }
              })
            }
          }

          if(r[0][j].publication_category=="writing"){
              this.Writing_Upload_Service.retrieve_writing_information_by_id(r[0][j].publication_id).pipe( first()).subscribe(info=>{
                if(info[0] && info[0].status=="public"){
                  this.list_of_contents.push(info[0]);
                  compt++
                }
                else{
                  compt++
                }

                if(compt == r[0].length){
                  this.sort_more_list_of_contents( this.list_of_contents);
                }
              })
          }

          if(r[0][j].publication_category=="ad"){
            this.Ads_service.retrieve_ad_by_id(r[0][j].publication_id).pipe( first()).subscribe(info=>{
              if(info[0] && info[0].status=="public"){
                this.list_of_contents.push(info[0]);
                compt++
              }
              else{
                compt++
              }
              if(compt== r[0].length){
                this.sort_more_list_of_contents( this.list_of_contents);
              }
            })
          }  

          
        }
      }
      else{
        this.list_of_contents_sorted=true;
        this.can_show_more=false;
        this.function_manage_show_more()
      }
    });

  }

  see_more(){
    this.show_more=true;
  }

}
