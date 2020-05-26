import { Component, OnInit, Input, HostListener, Output, EventEmitter } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { Community_recommendation } from '../services/recommendations.service';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';
import { NotationService } from '../services/notation.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';


declare var $: any;

export interface comment {
  comment_id: number;
}

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})



export class CommentsComponent implements OnInit {

  constructor(
    private BdOneShotService:BdOneShotService,
    private BdSerieService:BdSerieService,
    private router:Router,
    private NotationService:NotationService,
    private Profile_Edition_Service:Profile_Edition_Service,
    private sanitizer:DomSanitizer,
  ) { 

  }
  @Input() authorid:string;
  @Input() category:string;
  @Input() format:string;
  @Input() style:string;
  @Input() publication_id:number;
  @Input() chapter_number:number;

  
  @Output() new_comment = new EventEmitter<any>();
  @Output() removed_comment = new EventEmitter<any>();
  


  profile_picture:SafeUrl;
  comments_list:any = [];
  display_comments=false;
  now_in_seconds:number;
  visitor_mode=true;
  visitor_mode_retrieved=false;
  my_comments_list:any=[];
  display_my_comments=false;

  
  editable_comment:number;
  comment_changed() {
    this.editable_comment = -1;
  }

  ngOnInit(): void {

    

    this.now_in_seconds= Math.trunc( new Date().getTime()/1000);
    this.Profile_Edition_Service.get_current_user().subscribe(r=>{
      if(r[0].id==this.authorid){
        this.visitor_mode=false;
      }
      this.visitor_mode_retrieved=true;

      this.Profile_Edition_Service.retrieve_profile_picture( r[0].id).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.profile_picture = SafeURL;
      });

      this.NotationService.get_my_commentaries(this.category,this.format,this.style,this.publication_id,this.chapter_number).subscribe(t=>{
        (async () => {
          this.my_comments_list=t[0];
          if(this.my_comments_list.length>0){
              await this.sort_comments(this.my_comments_list);
              this.display_my_comments=true;
          }
        })();
      })

      this.NotationService.get_commentaries(this.category,this.format,this.style,this.publication_id,this.chapter_number).subscribe(l=>{

        (async () => {
        this.comments_list=l[0];
        if(this.comments_list.length>0){
          await this.sort_comments(this.comments_list);
          /*for(let j=0;j<l[0].length;j++){
            if(this.comments_list[j].author_id_who_comments==r[0].id){
              this.visitor_mode_list.push(false);
            }
            else{
              this.visitor_mode_list.push(true);
            }
            
          }*/
          this.display_comments=true;
          
        }
      })();
      });
    })
   
    let THIS=this;
    $('textarea.textarea-add-comment').on('keydown', function(e){
      
      if(e.which == 13) {
        e.preventDefault();
        
        if( $('textarea.textarea-add-comment').val() ) {

          //envoyer commentaire
          THIS.NotationService.add_commentary(THIS.category,THIS.format,THIS.style,THIS.publication_id,THIS.chapter_number,$('textarea.textarea-add-comment').val()).subscribe(r=>{
            THIS.display_comments=false;
            THIS.comments_list.splice(0, 0, r[0]);
            THIS.display_comments=true;
          });
          // alert( "sending : " + $('textarea.textarea-add-comment').val() );
          $('textarea.textarea-add-comment').val("");
          
          THIS.new_comment.emit();

        }
      }
    }).on('keydown', function(){
      $(this).height(1);
      var totalHeight = $(this).prop('scrollHeight') - parseInt($(this).css('padding-top')) - parseInt($(this).css('padding-bottom'));
      $(this).height(totalHeight + 10);
    });

  }

  remove_comment(i){
      this.NotationService.remove_commentary(this.my_comments_list[i].publication_category,this.my_comments_list[i].format,this.my_comments_list[i].style,this.my_comments_list[i].publication_id,this.my_comments_list[i].chapter_number,this.my_comments_list[i].id).subscribe(l=>{
        let index=-1;
        console.log(l[0]);
        for (let i=0;i<this.my_comments_list.length;i++){
          if(this.my_comments_list[i].id==l[0].id){
            index=i;
          }
          if (index > -1) {
            this.my_comments_list.splice(index, 1);
          }
        }
        
      })

      this.removed_comment.emit();
  }

  remove_other_comment(i){
    this.NotationService.remove_commentary(this.comments_list[i].publication_category,this.comments_list[i].format,this.comments_list[i].style,this.comments_list[i].publication_id,this.comments_list[i].chapter_number,this.comments_list[i].id).subscribe(l=>{
      let index=-1;
      for (let i=0;i<this.comments_list.length;i++){
        if(this.comments_list[i].id==l[0].id){
          index=i;
        }
        if (index > -1) {
          this.comments_list.splice(index, 1);
          //this.visitor_mode_list.splice(index,1);
        }
      }
      
    })

    this.removed_comment.emit();
}

  edit_comment(i) {
    this.editable_comment = i;
  }

  sort_comments(list){
    if(list.length>1){
      for (let i=1; i<list.length; i++){
        let time = this.convert_timestamp_to_number(list[i].createdAt);
        let number_of_likes= 60*60*list[i].number_of_likes; //un like fait gagner 1h
        for (let j=0; j<i;j++){
          if( (time + number_of_likes) > (this.convert_timestamp_to_number(list[j].createdAt) + 60*60*list[j].number_of_likes)){
            list.splice(j, 0, list.splice(i, 1)[0]);
          }
          if(j==list.length-2){
            return Promise.resolve(list);
          }
        }
      }
    }
            
  }

  
  convert_timestamp_to_number(timestamp){
    var uploaded_date = timestamp.substring(0,timestamp.length- 5);
    uploaded_date=uploaded_date.replace("T",' ');
    uploaded_date=uploaded_date.replace("-",'/').replace("-",'/');
    let number = new Date(uploaded_date + ' GMT').getTime()/1000;
    return number;
  }

  

}
