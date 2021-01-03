import { Component, OnInit, Input, HostListener, Output, EventEmitter, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import { NotationService } from '../services/notation.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { ChatService } from '../services/chat.service';
import { NotificationsService } from '../services/notifications.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { convert_timestamp_to_number } from '../helpers/dates';
import { SignupComponent } from '../signup/signup.component';

import { MatDialog } from '@angular/material/dialog';

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
    private chatService:ChatService,
    private NotificationsService:NotificationsService,
    private router:Router,
    private cd: ChangeDetectorRef,
    private NotationService:NotationService,
    private Profile_Edition_Service:Profile_Edition_Service,
    private sanitizer:DomSanitizer,
    public dialog: MatDialog,
  ) { 

  }
  @Input() type_of_account:string;
  @Input() authorid:number;
  @Input() category:string;
  @Input() title:string;
  @Input() format:string;
  @Input() style:string;
  @Input() publication_id:number;
  @Input() chapter_number:number;
  @Input() commentariesnumber:number;
  @Input() number_of_comments_to_show:number;
  
  skeleton_array:any;
  pp_is_loaded=false;
  
  @Output() new_comment = new EventEmitter<any>();
  @Output() removed_comment = new EventEmitter<any>();
  
  @ViewChild('commentary') commentary:ElementRef;
  comment: FormControl;
  comment_container: FormGroup;
  profile_picture:SafeUrl;
  comments_list:any = [];
  display_comments=false;
  now_in_seconds:number;
  visitor_mode=true;
  visitor_mode_retrieved=false;
  my_comments_list:any[]=[];
  display_my_comments=false;

  
  editable_comment:number;

  visitor_id:number;
  visitor_name:string;

  user_blocked=false;
  user_who_blocked:string;
  user_blocked_retrieved=false;

  comment_changed() {
    this.editable_comment = -1;
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.number_of_comments_to_show){

      this.skeleton_array = Array(this.number_of_comments_to_show);
      this.cd.detectChanges();
    }
  }

  ngAfterViewInit() {
    this.skeleton_array = Array(this.number_of_comments_to_show);
  }
  ngOnInit(): void {

    console.log(this.type_of_account);
    this.comment = new FormControl('', [Validators.required, Validators.maxLength(1500) ]);
    this.comment_container = new FormGroup({
      comment: this.comment,
    });
    this.now_in_seconds= Math.trunc( new Date().getTime()/1000);
    this.Profile_Edition_Service.get_current_user().subscribe(r=>{
      this.visitor_id=r[0].id;
      this.visitor_name=r[0].nickname;
      if(r[0].id==this.authorid){
        this.visitor_mode=false;
      }
      this.visitor_mode_retrieved=true;
      this.Profile_Edition_Service.check_if_user_blocked(this.authorid).subscribe(r=>{
        console.log(r)
        if(r[0].nothing){
          this.user_blocked=false;
        }
        else{
          if(r[0].id_user==this.authorid){
            this.user_who_blocked="user";
          }
          else{
            this.user_who_blocked="me";
          }
          this.user_blocked=true;
        }
        this.user_blocked_retrieved=true;
      })

      this.Profile_Edition_Service.retrieve_profile_picture( r[0].id).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.profile_picture = SafeURL;
      });

      this.NotationService.get_my_commentaries(this.category,this.format,this.publication_id,this.chapter_number).subscribe(t=>{
          this.my_comments_list=t[0];
          if(this.my_comments_list.length>0){
              this.sort_comments(this.my_comments_list,'mine');
              
          }
      })

      this.NotationService.get_commentaries(this.category,this.format,this.publication_id,this.chapter_number).subscribe(l=>{

        this.comments_list=l[0];
        console.log(this.comments_list);
        if(this.comments_list.length>0){
         this.sort_comments(this.comments_list,"other");  
        }
      });
    })
   
    /*let THIS=this;
    $('textarea.textarea-add-comment').on('keydown', function(e){
      console.log($('textarea.textarea-add-comment').val());
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
    });*/

  }

  

    
  SHIFT_CLICKED=false;
  keyup(event) {
    if(event.key=="Shift"){
      this.SHIFT_CLICKED = false;
    }
  }
  keydown(event) {
    if(event.key=="Shift"){
      this.SHIFT_CLICKED = true;
    }
    else if(event.key=="Enter"){
      if( !this.SHIFT_CLICKED ){
        console.log(this.comment_container.value.comment)
        if(this.comment_container.valid && this.comment_container.value.comment && this.comment_container.value.comment!='' && this.comment_container.value.comment.replace(/\s/g, '').length>0){

          this.NotationService.add_commentary(this.category,this.format,this.style,this.publication_id,this.chapter_number,this.comment_container.value.comment.replace(/\n\s*\n\s*\n/g, '\n\n')).subscribe(r=>{
            console.log(r[0])
            if(this.visitor_id!=this.authorid){
              this.NotificationsService.add_notification('comment',this.visitor_id,this.visitor_name,this.authorid,this.category,this.title,this.format,this.publication_id,this.chapter_number,this.comment_container.value.comment,false,r[0].id).subscribe(l=>{
                console.log(l[0])
                let message_to_send ={
                  for_notifications:true,
                  type:"comment",
                  id_user_name:this.visitor_name,
                  id_user:this.visitor_id, 
                  id_receiver:this.authorid,
                  publication_category:this.category,
                  publication_name:this.title,
                  format:this.format,
                  publication_id:this.publication_id,
                  chapter_number:this.chapter_number,
                  information:this.comment_container.value.comment,
                  status:"unchecked",
                  is_comment_answer:false,
                  comment_id:r[0].id,
                }
                this.chatService.messages.next(message_to_send);
                this.my_comments_list.splice(0, 0, r[0]);
                this.display_my_comments=true;
                
                this.new_comment.emit();
                this.comment.reset();
                this.cd.detectChanges();
                //var totalHeight = $('textarea.textarea-add-comment').prop('scrollHeight') - parseInt($('textarea.textarea-add-comment').css('padding-top')) - parseInt($('textarea.textarea-add-comment').css('padding-bottom'));
                //$('textarea.textarea-add-comment').height(totalHeight + 10);
                })
                this.cd.detectChanges();
                console.log(this.my_comments_list)
            }
            else{
              this.my_comments_list.splice(0, 0, r[0]);
              this.new_comment.emit();
              this.display_my_comments=true;
              this.comment.reset();
              //var totalHeight = $('textarea.textarea-add-comment').prop('scrollHeight') - parseInt($('textarea.textarea-add-comment').css('padding-top')) - parseInt($('textarea.textarea-add-comment').css('padding-bottom'));
              //$('textarea.textarea-add-comment').height(totalHeight + 10);
              console.log(this.my_comments_list)
              this.cd.detectChanges();
            }
             
          });

        }
      }
    }
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
        if(this.visitor_id!=this.authorid){
          this.NotificationsService.remove_notification('comment',this.category,this.format,this.publication_id,this.chapter_number,false,l[0].id).subscribe(l=>{
            let message_to_send ={
              for_notifications:true,
              type:"comment",
              id_user_name:this.visitor_name,
              id_user:this.visitor_id, 
              id_receiver:this.authorid,
              publication_category:this.category,
              publication_name:this.title,
              format:this.format,
              publication_id:this.publication_id,
              chapter_number:this.chapter_number,
              information:"remove",
              status:"unchecked",
              is_comment_answer:false,
              comment_id:l[0].id,
  
            }
            this.chatService.messages.next(message_to_send);
            this.removed_comment.emit();
            this.cd.detectChanges();
          })
        }
        else{
          this.removed_comment.emit();
          this.cd.detectChanges();
        }
      })

      
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

  sort_comments(list,target){
    if(list.length>1){
      for (let i=1; i<list.length; i++){
        let time = convert_timestamp_to_number(list[i].createdAt);
        let number_of_likes= 60*60*list[i].number_of_likes; //un like fait gagner 1h
        if(list[i].author_id_who_comments==this.authorid){
          number_of_likes+=60*60*10000; // un commentarie du propriétaire vaut un commentaire à 10000 likes 
        }
        for (let j=0; j<i;j++){
          let second_number_of_likes=60*60*list[j].number_of_likes;
          if(list[j].author_id_who_comments==this.authorid){
            second_number_of_likes+=60*60*10000; // un commentarie du propriétaire vaut un commentaire à 10000 likes 
          }
          if( (time + number_of_likes) > (convert_timestamp_to_number(list[j].createdAt) + second_number_of_likes)){
            list.splice(j, 0, list.splice(i, 1)[0]);
          }
          if(j==list.length-2){
            if(target=="other"){
              this.display_comments=true;
            }
            else{
              this.display_my_comments=true;
            }
           
          }
        }
      }
    }
    else{
      if(target=="other"){
        this.display_comments=true;
      }
      else{
        this.display_my_comments=true;
      }
    }
            
  }
  
  load_pp(){
    this.pp_is_loaded=true;
    console.log("pp_is_laoded")
    this.cd.detectChanges;
  }
  



  
  signup(){
    const dialogRef = this.dialog.open(SignupComponent, {});
  }

}
