import { Component, OnInit, Input, HostListener, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import {ElementRef, ViewChild} from '@angular/core';
import { NotationService } from '../services/notation.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { ChatService } from '../services/chat.service';
import { NotificationsService } from '../services/notifications.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { convert_timestamp_to_number } from '../helpers/dates';
import { SignupComponent } from '../signup/signup.component';
import {get_date_to_show} from '../helpers/dates';
import {date_in_seconds} from '../helpers/dates';
import { MatDialog } from '@angular/material/dialog';
import { NavbarService } from '../services/navbar.service';

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
    private cd: ChangeDetectorRef,
    private NotationService:NotationService,
    private Profile_Edition_Service:Profile_Edition_Service,
    private sanitizer:DomSanitizer,
    public dialog: MatDialog,
    private navbar: NavbarService,
  ) { 
    navbar.visibility_observer_font.subscribe(font=>{
      if(font){
        this.show_icon=true;
      }
    })
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
  @Input() visitor_id:number;
  @Input()  visitor_name:string;
  @Input() visitor_mode=true;

 
  skeleton_array=Array(5);
  pp_is_loaded=false;
  

  @Output() first_comment = new EventEmitter<any>();
  @Output() new_comment = new EventEmitter<any>();
  @Output() removed_comment = new EventEmitter<any>();
  
  @ViewChild('commentary') commentary:ElementRef;
  comment: FormControl;
  comment_container: FormGroup;
  profile_picture:SafeUrl;
  comments_list:any = [];
  display_comments=false;
  now_in_seconds:number;
  
  my_comments_list:any[]=[];
  display_my_comments=false;

  
  editable_comment:number;



  user_blocked=false;
  user_who_blocked:string;
  user_blocked_retrieved=false;

  comment_changed() {
    this.loading_edit=false;
    this.editable_comment = -1;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    console.log(window.innerWidth)
    if( window.innerWidth<850 ) {
      console.log("can sho ok")
      this.can_show_send_icon=true;
    }
    else{
      console.log("can show false")
      this.can_show_send_icon=false;
    }
  }

  show_icon=false;
  ngAfterViewInit() {

    console.log(window.innerWidth)
    if( window.innerWidth<850 ) {
      console.log("can sho ok")
      this.can_show_send_icon=true;
    }
    else{
      console.log("can sho false")
      this.can_show_send_icon=false;
    }
    this.skeleton_array = Array(5);
  }


  ngOnInit(): void {
    if(this.format=="serie"){
      this.chapter_number+=1;
    }
    console.log(this.type_of_account);
    this.comment = new FormControl('', [Validators.required, Validators.maxLength(1500) ]);
    this.comment_container = new FormGroup({
      comment: this.comment,
    });
    this.now_in_seconds= Math.trunc( new Date().getTime()/1000);

    console.log(this.authorid)
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

    this.Profile_Edition_Service.retrieve_my_profile_picture().subscribe(r=> {
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.profile_picture = SafeURL;
    });


    let my_comments_found=false;
    let other_comments_found=false;
    this.NotationService.get_my_commentaries(this.category,this.format,this.publication_id,this.chapter_number).subscribe(t=>{
        this.my_comments_list=t[0];
        if(this.my_comments_list.length>0){
            this.sort_comments(this.my_comments_list,'mine');
        }
        my_comments_found=true;
        send_all(this)
    })

    this.NotationService.get_commentaries(this.category,this.format,this.publication_id,this.chapter_number).subscribe(l=>{

      this.comments_list=l[0];
      console.log(this.comments_list);
      if(this.comments_list.length>0){
        this.sort_comments(this.comments_list,"other");  
      }
      other_comments_found=true;
      send_all(this)
    });
 
    function send_all(THIS){
      if(other_comments_found && my_comments_found){
        if(THIS.comments_list.length>0){
          THIS.first_comment.emit({comment:THIS.comments_list[0]})
        }
        else if(THIS.my_comments_list.length>0){
          THIS.first_comment.emit({comment:THIS.my_comments_list[0]})
        }
      }
      
    }

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
        this.first_comment.emit({comment:this.comments_list[0]})
      }
      else{
        this.display_my_comments=true;
      }
    }
            
  }



  /************************************************ COMMENTS MANAGMENT ********************************/
  /************************************************ COMMENTS MANAGMENT ********************************/
  /************************************************ COMMENTS MANAGMENT ********************************/

  SHIFT_CLICKED=false;
  can_show_send_icon=false;
  show_send_icon=false;
  check_message_for_phone(){
    if(this.can_show_send_icon){
      console.log(this.comment_container.valid && this.comment_container.value.comment && this.comment_container.value.comment!='' && this.comment_container.value.comment.replace(/\s/g, '').length>0)
      if(this.comment_container.valid && this.comment_container.value.comment && this.comment_container.value.comment!='' && this.comment_container.value.comment.replace(/\s/g, '').length>0){
        console.log(1)
        this.show_send_icon=true;
      }
      else{
        console.log(2)
        this.show_send_icon=false;
      }
      
    }
  }

  send_message_phone(){
    console.log("send phone")
    console.log(this.chapter_number)
    if(this.comment_container.valid && this.comment_container.value.comment && this.comment_container.value.comment!='' && this.comment_container.value.comment.replace(/\s/g, '').length>0){
    //event.preventDefault();

      this.NotationService.add_commentary(this.category,this.format,this.style,this.publication_id,this.chapter_number,this.comment_container.value.comment.replace(/\n\s*\n\s*\n/g, '\n\n')).subscribe(r=>{
        console.log(r[0])
        console.log(this.visitor_id)
        console.log(this.authorid)
        console.log(get_date_to_show(date_in_seconds(this.now_in_seconds,r[0].createdAt) ));
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
      this.show_send_icon=false;
    }
  }

  keyup(event) {
    if(event.key=="Shift"){
      this.SHIFT_CLICKED = false;
    }
  }
  keydown(event) {
    if(!this.can_show_send_icon){
      if(event.key=="Shift"){
        this.SHIFT_CLICKED = true;
      }
      else if(event.key=="Enter"){
        if( !this.SHIFT_CLICKED ){
  
          if(this.comment_container.valid && this.comment_container.value.comment && this.comment_container.value.comment!='' && this.comment_container.value.comment.replace(/\s/g, '').length>0){
            event.preventDefault();
  
            this.NotationService.add_commentary(this.category,this.format,this.style,this.publication_id,this.chapter_number,this.comment_container.value.comment.replace(/\n\s*\n\s*\n/g, '\n\n')).subscribe(r=>{
              console.log(r[0])
              console.log(get_date_to_show(date_in_seconds(this.now_in_seconds,r[0].createdAt) ));
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
    
  }

  loading_remove=false;
  loading_edit=false;
  remove_comment(i){
      if(this.loading_remove){
        return
      }
      this.loading_remove=true;
      this.NotationService.remove_commentary(this.my_comments_list[i].publication_category,this.my_comments_list[i].format,this.my_comments_list[i].style,this.my_comments_list[i].publication_id,this.my_comments_list[i].chapter_number,this.my_comments_list[i].id).subscribe(l=>{
        let index=-1;
        console.log(l[0]);
        for (let i=0;i<this.my_comments_list.length;i++){
          if(this.my_comments_list[i].id==l[0].id){
            index=i;
          }
          
        }
        if (index > -1) {
          this.my_comments_list.splice(index, 1);
        }
        this.loading_remove=false;
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
    if(this.loading_remove){
      return
    }
    this.loading_remove=true;
    this.NotationService.remove_commentary(this.comments_list[i].publication_category,this.comments_list[i].format,this.comments_list[i].style,this.comments_list[i].publication_id,this.comments_list[i].chapter_number,this.comments_list[i].id).subscribe(l=>{
      let index=-1;
      for (let i=0;i<this.comments_list.length;i++){
        if(this.comments_list[i].id==l[0].id){
          index=i;
        }
        
      }
      if (index > -1) {
        this.comments_list.splice(index, 1);
        //this.visitor_mode_list.splice(index,1);
      }
      this.loading_remove=false;
    })

    this.removed_comment.emit();
}

  edit_comment(i) {
    if(this.loading_remove || this.loading_edit){
      return
    }
    this.loading_edit=true;
    this.editable_comment = i;
  }

 
  
  load_pp(){
    this.pp_is_loaded=true;
    console.log("pp_is_laoded")
    this.cd.detectChanges;
  }
  



  
  signup(){
    const dialogRef = this.dialog.open(SignupComponent, {
      data:{for_group_creation:false},
      panelClass:"signupComponentClass"
    });
  }

}
