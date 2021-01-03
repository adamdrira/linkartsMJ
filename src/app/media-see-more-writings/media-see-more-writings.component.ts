import { Component, OnInit, Input, HostListener, EventEmitter, Output, SimpleChanges, ChangeDetectorRef } from '@angular/core';
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
    private cd: ChangeDetectorRef,
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
  @Input() width: number;
  
  //responsivity
  @Output() send_put_more_visible = new EventEmitter<boolean>();
  @Input() number_of_writings_to_show: number;
  number_of_thumbnails=0;
  number_retrieved=false;
  number_of_loaded=0;
  
  

  ngOnChanges(changes: SimpleChanges) { 
    this.cd.detectChanges()
  }

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




 
  /*sendLoaded(object){
    console.log("loaded")
    this.number_of_loaded++;
    console.log(this.number_of_thumbnails);
    if(this.number_of_loaded==this.number_of_thumbnails){
      console.log("updating_list")
      this.update_lists(this.number_of_writings_to_show);
    }
  }


  update_lists(number){
    if( number== 1 ) {
      $(".thumbnail-component-container:nth-of-type(1), .thumbnail-component-container:nth-of-type(2), .thumbnail-component-container:nth-of-type(3), .thumbnail-component-container:nth-of-type(4), .thumbnail-component-container:nth-of-type(5), .thumbnail-component-container:nth-of-type(6)").css("display","block");
    }
    else if( number== 2) {
      $(".thumbnail-component-container:nth-of-type(1), .thumbnail-component-container:nth-of-type(2)").css("display","block");
      $(".thumbnail-component-container:nth-of-type(3), .thumbnail-component-container:nth-of-type(4), .thumbnail-component-container:nth-of-type(5), .thumbnail-component-container:nth-of-type(6)").css("display","none");
    }
    else if( number== 3) {
      $(".thumbnail-component-container:nth-of-type(1), .thumbnail-component-container:nth-of-type(2), .thumbnail-component-container:nth-of-type(3)").css("display","block");
      $(".thumbnail-component-container:nth-of-type(4), .thumbnail-component-container:nth-of-type(5), .thumbnail-component-container:nth-of-type(6)").css("display","none");
    }
    else if( number== 4 ) {
      $(".thumbnail-component-container:nth-of-type(1), .thumbnail-component-container:nth-of-type(2), .thumbnail-component-container:nth-of-type(3), .thumbnail-component-container:nth-of-type(4)").css("display","block");
      $(".thumbnail-component-container:nth-of-type(5), .thumbnail-component-container:nth-of-type(6)").css("display","none");
    }
    else if( number== 5) {
      $(".thumbnail-component-container:nth-of-type(1), .thumbnail-component-container:nth-of-type(2), .thumbnail-component-container:nth-of-type(3), .thumbnail-component-container:nth-of-type(4), .thumbnail-component-container:nth-of-type(5)").css("display","block");
      $(".thumbnail-component-container:nth-of-type(6)").css("display","none");
    }
    else if( number== 6) {
      $(".thumbnail-component-container:nth-of-type(1), .thumbnail-component-container:nth-of-type(2), .thumbnail-component-container:nth-of-type(3), .thumbnail-component-container:nth-of-type(4), .thumbnail-component-container:nth-of-type(5), .thumbnail-component-container:nth-of-type(6)").css("display","block");
    }
    this.send_put_more_visible.emit(true)
  }*/






}
