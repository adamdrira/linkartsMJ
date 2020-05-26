import { Component, OnInit, Input, HostListener } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { Community_recommendation } from '../services/recommendations.service';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';

declare var $: any

@Component({
  selector: 'app-media-see-more-drawings',
  templateUrl: './media-see-more-drawings.component.html',
  styleUrls: ['./media-see-more-drawings.component.scss']
})
export class MediaSeeMoreDrawingsComponent implements OnInit {

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
  @Input() sorted_artpieces_traditional: any[];
  @Input() sorted_artpieces_digital: any[];


  new_sorted_artpieces: any[]=[];
  new_sorted_artpieces_added=false;

  @Input() now_in_seconds: number;
  
  
  ngOnInit() {
    if(this.style=="Traditionnel"){
      this.Community_recommendation.see_more_recommendations_drawings("Traditionnel").subscribe(r=>{
        for (let i=0;i<Object.keys(r[0].list_to_send).length;i++){
              let check = JSON.stringify(this.sorted_artpieces_traditional).includes(JSON.stringify(r[0].list_to_send[i][0]));
              if (!check){
                this.new_sorted_artpieces.push(r[0].list_to_send[i][0]);
                if(i==Object.keys(r[0].list_to_send).length-1){
                  this.new_sorted_artpieces_added=true;
                  console.log(this.new_sorted_artpieces);
                }
              }
              if(check && i==Object.keys(r[0].list_to_send).length-1){
                console.log(this.new_sorted_artpieces);
                this.new_sorted_artpieces_added=true;
              }
              
            }
      })
    }

    if(this.style=="Digital"){
      this.Community_recommendation.see_more_recommendations_bd("Digital").subscribe(r=>{
        for (let i=0;i<Object.keys(r[0].list_to_send).length;i++){
              let check = JSON.stringify(this.sorted_artpieces_digital).includes(JSON.stringify(r[0].list_to_send[i][0]));
              if (!check){
                this.new_sorted_artpieces.push(r[0].list_to_send[i][0]);
                if(i==Object.keys(r[0].list_to_send).length-1){
                  this.new_sorted_artpieces_added=true;
                  console.log(this.new_sorted_artpieces);
                }
              }
              if(check && i==Object.keys(r[0].list_to_send).length-1){
                console.log(this.new_sorted_artpieces);
                this.new_sorted_artpieces_added=true;
              }
              
            }
      })
    }

    
  }
}
