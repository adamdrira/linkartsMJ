import { Component, OnInit, Input, HostListener } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { Community_recommendation } from '../services/recommendations.service';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';

declare var $: any


@Component({
  selector: 'app-media-see-more-writings',
  templateUrl: './media-see-more-writings.component.html',
  styleUrls: ['./media-see-more-writings.component.scss']
})
export class MediaSeeMoreWritingsComponent implements OnInit {

  constructor(
    private rd: Renderer2,
    private Community_recommendation:Community_recommendation,
    private BdOneShotService:BdOneShotService,
    private BdSerieService:BdSerieService) { 

    this.cancelled = 0;
  }


  cancelled: number;
  artbooks_per_line: number;

  @Input() style:string;
  @Input() sorted_artpieces_illustrated_novel: any[];
  @Input() sorted_artpieces_roman: any[];
  @Input() sorted_artpieces_scenario: any[];
  @Input() sorted_artpieces_article: any[];


  new_sorted_artpieces: any[]=[];
  new_sorted_artpieces_added=false;

  


  @Input() now_in_seconds: number;
  
  
  ngOnInit() {
    if(this.style=="Article"){
      this.Community_recommendation.see_more_recommendations_bd("Article").subscribe(r=>{
        for (let i=0;i<Object.keys(r[0].list_to_send).length;i++){
              let check = JSON.stringify(this.sorted_artpieces_article).includes(JSON.stringify(r[0].list_to_send[i][0]));
              if (!check){
                this.new_sorted_artpieces.push(r[0].list_to_send[i][0]);
                if(i==Object.keys(r[0].list_to_send).length-1){
                  this.new_sorted_artpieces_added=true;
                }
              }
              if(check && i==Object.keys(r[0].list_to_send).length-1){
                this.new_sorted_artpieces_added=true;
              }
              
            }
      })
    }

    if(this.style=="Scénario"){
      this.Community_recommendation.see_more_recommendations_bd("Scenario").subscribe(r=>{
        for (let i=0;i<Object.keys(r[0].list_to_send).length;i++){
              let check = JSON.stringify(this.sorted_artpieces_scenario).includes(JSON.stringify(r[0].list_to_send[i][0]));
              if (!check){
                this.new_sorted_artpieces.push(r[0].list_to_send[i][0]);
                if(i==Object.keys(r[0].list_to_send).length-1){
                  this.new_sorted_artpieces_added=true;
                }
              }
              if(check && i==Object.keys(r[0].list_to_send).length-1){
                this.new_sorted_artpieces_added=true;
              }
              
            }
      })
    }

    if(this.style=="Roman"){
      this.Community_recommendation.see_more_recommendations_bd("Roman").subscribe(r=>{
        for (let i=0;i<Object.keys(r[0].list_to_send).length;i++){
              let check = JSON.stringify(this.sorted_artpieces_roman).includes(JSON.stringify(r[0].list_to_send[i][0]));
              if (!check){
                this.new_sorted_artpieces.push(r[0].list_to_send[i][0]);
                if(i==Object.keys(r[0].list_to_send).length-1){
                  this.new_sorted_artpieces_added=true;
                }
              }
              if(check && i==Object.keys(r[0].list_to_send).length-1){
                this.new_sorted_artpieces_added=true;
              }
              
            }
      })
    }

    if(this.style=="Roman illustré"){
      this.Community_recommendation.see_more_recommendations_bd("illustrated novel").subscribe(r=>{
        for (let i=0;i<Object.keys(r[0].list_to_send).length;i++){
              let check = JSON.stringify(this.sorted_artpieces_illustrated_novel).includes(JSON.stringify(r[0].list_to_send[i][0]));
              if (!check){
                this.new_sorted_artpieces.push(r[0].list_to_send[i][0]);
                if(i==Object.keys(r[0].list_to_send).length-1){
                  this.new_sorted_artpieces_added=true;
                }
              }
              if(check && i==Object.keys(r[0].list_to_send).length-1){
                this.new_sorted_artpieces_added=true;
              }
              
            }
      })
    }
   
    
  }
}
