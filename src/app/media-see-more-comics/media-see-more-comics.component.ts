import { Component, OnInit, Input, HostListener } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { Community_recommendation } from '../services/recommendations.service';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';

declare var $: any

@Component({
  selector: 'app-media-see-more-comics',
  templateUrl: './media-see-more-comics.component.html',
  styleUrls: ['./media-see-more-comics.component.scss']
})
export class MediaSeeMoreComicsComponent implements OnInit {

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
  @Input() sorted_artpieces_bd: any[];
  @Input() sorted_artpieces_manga: any[];
  @Input() sorted_artpieces_comics: any[];
  @Input() sorted_artpieces_webtoon: any[];


  new_sorted_artpieces: any[]=[];
  new_sorted_artpieces_added=false;

  


  @Input() now_in_seconds: number;
  
  
  ngOnInit() {
    if(this.style=="Manga"){
      this.Community_recommendation.see_more_recommendations_bd("Manga").subscribe(r=>{
        for (let i=0;i<Object.keys(r[0].list_to_send).length;i++){
              let check = JSON.stringify(this.sorted_artpieces_manga).includes(JSON.stringify(r[0].list_to_send[i][0]));
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

    if(this.style=="BD"){
      this.Community_recommendation.see_more_recommendations_bd("BD").subscribe(r=>{
        for (let i=0;i<Object.keys(r[0].list_to_send).length;i++){
              let check = JSON.stringify(this.sorted_artpieces_bd).includes(JSON.stringify(r[0].list_to_send[i][0]));
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

    if(this.style=="Webtoon"){
      this.Community_recommendation.see_more_recommendations_bd("Webtoon").subscribe(r=>{
        for (let i=0;i<Object.keys(r[0].list_to_send).length;i++){
              let check = JSON.stringify(this.sorted_artpieces_webtoon).includes(JSON.stringify(r[0].list_to_send[i][0]));
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

    if(this.style=="Comics"){
      this.Community_recommendation.see_more_recommendations_bd("Comics").subscribe(r=>{
        for (let i=0;i<Object.keys(r[0].list_to_send).length;i++){
              let check = JSON.stringify(this.sorted_artpieces_comics).includes(JSON.stringify(r[0].list_to_send[i][0]));
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
