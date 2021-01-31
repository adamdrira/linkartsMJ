import { Component, OnInit, Input, HostListener, SimpleChanges, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { Renderer2} from '@angular/core';
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
  @Input() sorted_artpieces_bd: any[];
  @Input() sorted_artpieces_manga: any[];
  @Input() sorted_artpieces_comics: any[];
  @Input() sorted_artpieces_webtoon: any[];


  new_sorted_artpieces: any[]=[];
  new_sorted_artpieces_added=false;

  list_of_formats:any[]=[];

  @Input() now_in_seconds: number;

  //responsivity
  @Output() send_put_more_visible = new EventEmitter<boolean>();
  @Input() number_of_comics_to_show: number;
  @Input() width: number;
  number_of_thumbnails=0;
  number_retrieved=false;
  number_of_loaded=0;



  ngOnChanges(changes: SimpleChanges) { 
    this.cd.detectChanges()
  }
  
  ngOnInit() {
    console.log("init see more")
    if(this.style=="Manga"){
      this.Community_recommendation.see_more_recommendations_bd("Manga").subscribe(r=>{
        console.log(r[0].list_to_send)
        for (let i=0;i<Object.keys(r[0].list_to_send).length;i++){
            let format ="";
            if(r[0].list_to_send[i][0].chaptersnumber>=0){
              format="serie"; 
            }
            else{
              format="one-shot";
            }
            let check = JSON.stringify(this.sorted_artpieces_manga).includes(JSON.stringify(r[0].list_to_send[i][0]));
            if (!check && r[0].list_to_send[i][0].status=='public' ){
              this.new_sorted_artpieces.push(r[0].list_to_send[i][0]);
              this.list_of_formats.push(format);
              if(i==Object.keys(r[0].list_to_send).length-1){
                console.log(this.new_sorted_artpieces)
                console.log(this.list_of_formats);
                this.number_of_thumbnails=this.new_sorted_artpieces.length;
                this.new_sorted_artpieces_added=true;
                
              }
            }
            else if(i==Object.keys(r[0].list_to_send).length-1){
              console.log(this.new_sorted_artpieces)
              console.log(this.list_of_formats);
              this.number_of_thumbnails=this.new_sorted_artpieces.length;
              this.new_sorted_artpieces_added=true;
              
            }
              
        }
        console.log(this.new_sorted_artpieces_added)
      })
      
    }

    if(this.style=="BD"){
      this.Community_recommendation.see_more_recommendations_bd("BD").subscribe(r=>{
        for (let i=0;i<Object.keys(r[0].list_to_send).length;i++){
              let format ="";
              if(r[0].list_to_send[i][0].chaptersnumber>=0){
                format="serie"; 
              }
              else{
                format="one-shot";
              }
              let check = JSON.stringify(this.sorted_artpieces_bd).includes(JSON.stringify(r[0].list_to_send[i][0]));
              if (!check && r[0].list_to_send[i][0].status=='public' ){
                this.new_sorted_artpieces.push(r[0].list_to_send[i][0]);
                this.list_of_formats.push(format);
                if(i==Object.keys(r[0].list_to_send).length-1){
                  this.new_sorted_artpieces_added=true;
                  this.number_of_thumbnails=this.new_sorted_artpieces.length;
                }
              }
              else if(i==Object.keys(r[0].list_to_send).length-1){
                this.new_sorted_artpieces_added=true;
                this.number_of_thumbnails=this.new_sorted_artpieces.length;
              }
              
            }
      })
    }

    if(this.style=="Webtoon"){
      this.Community_recommendation.see_more_recommendations_bd("Webtoon").subscribe(r=>{
        for (let i=0;i<Object.keys(r[0].list_to_send).length;i++){
              let format ="";
              if(r[0].list_to_send[i][0].chaptersnumber>=0){
                format="serie"; 
              }
              else{
                format="one-shot";
              }
              let check = JSON.stringify(this.sorted_artpieces_webtoon).includes(JSON.stringify(r[0].list_to_send[i][0]));
              if (!check && r[0].list_to_send[i][0].status=='public' ){
                this.new_sorted_artpieces.push(r[0].list_to_send[i][0]);
                this.list_of_formats.push(format);
                if(i==Object.keys(r[0].list_to_send).length-1){
                  this.new_sorted_artpieces_added=true;
                  this.number_of_thumbnails=this.new_sorted_artpieces.length;
                }
              }
              else if(i==Object.keys(r[0].list_to_send).length-1){
                this.new_sorted_artpieces_added=true;
                this.number_of_thumbnails=this.new_sorted_artpieces.length;
              }
              
            }
      })
    }

    if(this.style=="Comics"){
      this.Community_recommendation.see_more_recommendations_bd("Comics").subscribe(r=>{
        for (let i=0;i<Object.keys(r[0].list_to_send).length;i++){
              let format ="";
              if(r[0].list_to_send[i][0].chaptersnumber>=0){
                format="serie"; 
              }
              else{
                format="one-shot";
              }
              let check = JSON.stringify(this.sorted_artpieces_comics).includes(JSON.stringify(r[0].list_to_send[i][0]));
              if (!check && r[0].list_to_send[i][0].status=='public' ){
                this.new_sorted_artpieces.push(r[0].list_to_send[i][0]);
                this.list_of_formats.push(format);
                if(i==Object.keys(r[0].list_to_send).length-1){
                  this.new_sorted_artpieces_added=true;
                  this.number_of_thumbnails=this.new_sorted_artpieces.length;
                }
              }
              else if(check && i==Object.keys(r[0].list_to_send).length-1){
                this.new_sorted_artpieces_added=true;
                this.number_of_thumbnails=this.new_sorted_artpieces.length;
              }
              
            }
            console.log(this.new_sorted_artpieces_added)
      })
    }
   
    
  }

  

 
  /*send_loaded(object){
    console.log("loaded")
    this.number_of_loaded++;
    console.log(this.number_of_thumbnails);
    if(this.number_of_loaded==this.number_of_thumbnails){
      console.log("updating_list")
      this.update_lists(this.number_of_comics_to_show);
    }
  }*/

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
  }

  


}
