import { Component, OnInit, Input,EventEmitter, Output, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Community_recommendation } from '../services/recommendations.service';

declare var $: any


@Component({
  selector: 'app-media-see-more-writings',
  templateUrl: './media-see-more-writings.component.html',
  styleUrls: ['./media-see-more-writings.component.scss']
})
export class MediaSeeMoreWritingsComponent implements OnInit {

  constructor(
    private cd: ChangeDetectorRef,
    private Community_recommendation:Community_recommendation,) { 

    this.cancelled = 0;
  }


  cancelled: number;
  artbooks_per_line: number;

  @Input() style:string;
  @Input() sorted_artpieces_illustrated_novel: any[];
  @Input() sorted_artpieces_roman: any[];
  @Input() sorted_artpieces_scenario: any[];
  @Input() sorted_artpieces_article: any[];
  @Input() sorted_artpieces_poetry: any[];

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
    console.log("init see more")
    console.log(this.style)
    if(this.style=="Article"){
      this.Community_recommendation.see_more_recommendations_writings("Article").subscribe(r=>{
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
      this.Community_recommendation.see_more_recommendations_writings("Scenario").subscribe(r=>{
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

    if(this.style=="Poésie"){
      this.Community_recommendation.see_more_recommendations_writings("Poetry").subscribe(r=>{
        for (let i=0;i<Object.keys(r[0].list_to_send).length;i++){
              let check = JSON.stringify(this.sorted_artpieces_poetry).includes(JSON.stringify(r[0].list_to_send[i][0]));
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
      this.Community_recommendation.see_more_recommendations_writings("Roman").subscribe(r=>{
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
      this.Community_recommendation.see_more_recommendations_writings("Illustrated novel").subscribe(r=>{
        console.log("réponse roman")
        console.log(r)
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
