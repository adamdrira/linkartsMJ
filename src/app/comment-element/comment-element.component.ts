import { Component, OnInit, Input, ChangeDetectorRef, SimpleChanges, ElementRef, ViewChild, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { NotationService } from '../services/notation.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { ChatService } from '../services/chat.service';
import { NotificationsService } from '../services/notifications.service';
import {get_date_to_show} from '../helpers/dates';
import {date_in_seconds} from '../helpers/dates';
import { trigger, transition, style, animate } from '@angular/animations';

declare var $:any;

export interface reponses {
  author_id:number;
  comment:string;
  likesnumber:number;
  date: string;
}



@Component({
  selector: 'app-comment-element',
  templateUrl: './comment-element.component.html',
  styleUrls: ['./comment-element.component.scss'],
  animations: [
    trigger(
      'leaveAnimation', [
        transition(':leave', [
          style({transform: 'translateY(0)', opacity: 1}),
          animate('200ms', style({transform: 'translateX(0px)', opacity: 0}))
        ])
      ],
    ),
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateY(0)', opacity: 0}),
          animate('200ms', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ]
    ),,
    trigger(
      'enterFromTop', [
        transition(':enter', [
          style({transform: 'translateY(-100%)', opacity: 0}),
          animate('400ms', style({transform: 'translateY(0px)', opacity: 1}))
        ])
      ]
    ),
    trigger(
      'enterFromLeft', [
        transition(':enter', [
          style({transform: 'translateX(-100%)', opacity: 0}),
          animate('200ms', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ]
    )
  ],
})
export class CommentElementComponent implements OnInit {

  constructor(
    private chatService:ChatService,
    private NotificationsService:NotificationsService,
    private sanitizer:DomSanitizer,
    private Profile_Edition_Service:Profile_Edition_Service,
    private cd:ChangeDetectorRef,
    private NotationService:NotationService
    
    ) { }


  @ViewChild('textareaREAD', {static:false}) textareaREAD:ElementRef;
  @ViewChildren('textareaRESPONSE') textareaRESPONSE:QueryList<ElementRef>;
  @ViewChild('textareaRESPONSEtoCOMMENT', {static:false}) textareaRESPONSEtoCOMMENT:ElementRef;

  @Output() changed: EventEmitter<any> = new EventEmitter();
  editable_response:number = -1;
  response_before_change:any;

  @Input() editable_comment:number;
  edit_comment:boolean = false;

  @Input() comment_id;
  @Input() comment_information:any;
  @Input() visitor_name:string;
  @Input() visitor_id:number;
  @Input() type_of_account:string;
  @Input() visitor_profile_picture:SafeUrl;
  @Input() title:string;
  @Input() now_in_seconds:any;
  date_upload_to_show:any;
  
  like_in_progress=false;
  answer_like_in_progress=false;
  //récupéré
  user_name:string;
  primary_description:string;
  profile_picture:SafeUrl;
  main_pp_is_loaded=false;
  pp_is_loaded=false;
  pseudo:string;
  authorid:number;
  //à récupérer
  main_comment_see_more:boolean = false;
  //récupéré
  id:number;
  comment:string;
  category:string;
  format:string;
  style:string;
  publication_id:number;
  chapter_number:number;
  number_of_likes:number=-1;

  liked:boolean=false;
  likes_checked=false;

  visitor_mode=true;

  
  responses_list:any[] = [];
  profile_picture_list:SafeUrl[] = [];
  profile_picture_list_loaded= [];
  visitor_mode_list:any[]=[];
  liked_list:any[]=[];

  pseudo_list:any[] = [];
  author_name_list:any[] = [];
  answers_retrieved=false;
  see_responses:boolean = false;


  ngOnChanges(changes: SimpleChanges) {
    if( changes.editable_comment && this.comment_id == this.editable_comment ) {
      this.set_editable();
    }
    else if( changes.editable_comment && this.comment_id != this.editable_comment ) {
      this.set_not_editable();
    }
  }
  

  ngOnInit(): void {
    this.date_upload_to_show = get_date_to_show(date_in_seconds(this.now_in_seconds,this.comment_information.createdAt) );
    this.comment=this.comment_information.commentary;
    this.category=this.comment_information.publication_category;
    this.id=this.comment_information.id;
    this.publication_id=this.comment_information.publication_id;
    this.format=this.comment_information.format;
    this.style=this.comment_information.style;
    this.chapter_number=this.comment_information.chapter_number;
    this.number_of_likes=this.comment_information.number_of_likes;
    this.likes_checked=true;

    
    this.NotationService.get_commentary_answers_by_id(this.comment_information.id).subscribe(info=>{
      if(info[0].length!=0){
        for(let i=0;i<info[0].length;i++){
          let info_comment =info[0][i];
          this.responses_list.push(
            {
              author_id :info[0][i].author_id_who_replies,
              id:info[0][i].id,
              comment:info[0][i].commentary,
              likesnumber:info[0][i].number_of_likes,
              see_more:false,
              date:get_date_to_show(date_in_seconds(this.now_in_seconds,info[0][i].createdAt))
            });
            this.Profile_Edition_Service.retrieve_profile_picture(info[0][i].author_id_who_replies ).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.profile_picture_list.push(SafeURL);
              this.Profile_Edition_Service.retrieve_profile_data(info[0][i].author_id_who_replies).subscribe(l=> {
                this.pseudo_list.push(l[0].nickname);
                this.author_name_list.push(l[0].firstname + ' ' + l[0].lastname);
                this.Profile_Edition_Service.get_current_user().subscribe(s=>{
                  if(info_comment.author_id_who_replies==s[0].id){
                    this.visitor_mode_list.push(false);
                  }
                  else{
                    this.visitor_mode_list.push(true);
                  };
                  let user = s[0]
                  this.NotationService.get_commentary_answers_likes_by_id(info_comment.id).subscribe(t=>{
                    if(t[0].length!=0){
                      for (let j=0;j<t[0].length;j++){
                        if(t[0][j].author_id_who_likes==user.id){
                          this.liked_list.push(true);
                        }
                        else{
                          this.liked_list.push(false);
                        }
                        if (i==info[0].length-1){
                          this.answers_retrieved=true;
                        }
                      }
                    }
                    else{
                      this.liked_list.push(false);
                    }
                    if (i==info[0].length-1){
                      this.answers_retrieved=true;
                    }
                  })
                })
                
              });
            });
          
        }
      };
      this.answers_retrieved=true;
    })

    //récupérer auteur id, etc.
    this.Profile_Edition_Service.retrieve_profile_picture( this.comment_information.author_id_who_comments ).subscribe(r=> {
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.profile_picture = SafeURL;  
    });

    this.Profile_Edition_Service.retrieve_profile_data( this.comment_information.author_id_who_comments).subscribe(r=> {
      this.user_name = r[0].firstname + ' ' + r[0].lastname;
      this.pseudo = r[0].nickname;
      this.authorid=r[0].id;
      this.primary_description=r[0].primary_description;
    });

    this.Profile_Edition_Service.get_current_user().subscribe(r=>{
      this.NotationService.get_commentary_likes_by_id(this.comment_information.id).subscribe(l=>{
        if(l[0].length!=0){
          for (let i=0;i<l[0].length;i++){
            if(l[0][i].author_id_who_likes==r[0].id){
              this.liked=true;
            }
            this.likes_checked=true;
          }
        }
        this.likes_checked=true;
      })
    })

  }

  see_more_response(i) {
    this.responses_list[i].see_more = true;
    this.cd.detectChanges();
  }

  see_more() {
    this.main_comment_see_more = true;
    this.cd.detectChanges();
  }

  
  remove_comment_answer(i){
    this.NotationService.remove_commentary_answer(this.category,this.format,this.style,this.publication_id,this.chapter_number,this.responses_list[i].id).subscribe(l=>{
      let index=-1;
      for (let i=0;i<this.responses_list.length;i++){
        if(this.responses_list[i].id==l[0].id){
          index=i;
        }
        if (index > -1) {
          this.responses_list.splice(index, 1);
        }
      }
      this.NotificationsService.remove_notification('comment_answer',this.category,this.format,this.publication_id,this.chapter_number,true,this.responses_list[i].id).subscribe(l=>{
        let message_to_send ={
          for_notifications:true,
          type:"comment_answer",
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
          is_comment_answer:true,
          comment_id:this.responses_list[i].id,
        }
        this.chatService.messages.next(message_to_send);
        this.cd.detectChanges();
      })
      
    })
  }


  add_or_remove_like(){
    console.log(this.comment)
    this.like_in_progress=true;
    if(this.liked){
      this.NotationService.remove_like_on_commentary(this.category,this.format,this.style,this.publication_id,this.chapter_number,this.id).subscribe(r=>{
        if(this.visitor_id!=this.authorid){
          this.NotificationsService.remove_notification('comment_like',this.category,this.format,this.publication_id,this.chapter_number,false,this.id).subscribe(l=>{
            let message_to_send ={
              for_notifications:true,
              type:"comment_like",
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
              comment_id:this.id,
            }
            this.chatService.messages.next(message_to_send);
            this.number_of_likes=this.number_of_likes-1;
            this.liked=false;
            this.like_in_progress=false;
            this.cd.detectChanges();
          })
        }
        else{
          this.number_of_likes=this.number_of_likes-1;
          this.liked=false;
          this.like_in_progress=false;
          this.cd.detectChanges();
        }
        
      })
    }
    else{
      this.NotationService.add_like_on_commentary(this.category,this.format,this.style,this.publication_id,this.chapter_number,this.id).subscribe(r=>{
        
          if(this.visitor_id!=this.authorid){
            this.NotificationsService.add_notification('comment_like',this.visitor_id,this.visitor_name,this.authorid,this.category,this.title,this.format,this.publication_id,this.chapter_number,this.comment,false,this.id).subscribe(l=>{
              let message_to_send ={
                for_notifications:true,
                type:"comment_like",
                id_user_name:this.visitor_name,
                id_user:this.visitor_id, 
                id_receiver:this.authorid,
                publication_category:this.category,
                publication_name:this.title,
                format:this.format,
                publication_id:this.publication_id,
                chapter_number:this.chapter_number,
                information:this.comment,
                status:"unchecked",
                is_comment_answer:false,
                comment_id:this.id,
              }
              this.chatService.messages.next(message_to_send);
              this.number_of_likes=this.number_of_likes+1;
              this.liked=true;
              this.like_in_progress=false;
              this.cd.detectChanges();
            })
          }
          else{
            this.number_of_likes=this.number_of_likes+1;
            this.liked=true;
            this.like_in_progress=false;
            this.cd.detectChanges();
          }
          
          
      })
    }
  }

  add_or_remove_answer_like(i){
    console.log(this.responses_list[i].comment)
    this.answer_like_in_progress=true;
    if(this.liked_list[i]){
      this.NotationService.remove_like_on_commentary_answer(this.responses_list[i].id).subscribe(r=>{
        if(this.visitor_id!=this.responses_list[i].id_user){
          this.NotificationsService.remove_notification('comment_like',this.category,this.format,this.publication_id,this.chapter_number,true,this.responses_list[i].id).subscribe(l=>{
            let message_to_send ={
              for_notifications:true,
              type:"comment_like",
              id_user_name:this.visitor_name,
              id_user:this.visitor_id, 
              id_receiver:this.responses_list[i].id_user,
              publication_category:this.category,
              publication_name:this.title,
              format:this.format,
              publication_id:this.publication_id,
              chapter_number:this.chapter_number,
              information:"remove",
              status:"unchecked",
              is_comment_answer:true,
              comment_id:this.responses_list[i].id,
            }
            this.chatService.messages.next(message_to_send);
            this.responses_list[i].likesnumber=this.responses_list[i].likesnumber-1;
            this.liked_list[i]=false;
            this.answer_like_in_progress=false;
            this.cd.detectChanges();
          })
        }
        else{
          this.responses_list[i].likesnumber=this.responses_list[i].likesnumber-1;
          this.liked_list[i]=false;
          this.answer_like_in_progress=false;
          this.cd.detectChanges();
        }
        
      })
    }
    else{
      this.NotationService.add_like_on_commentary_answer(this.responses_list[i].id).subscribe(r=>{
        if(this.visitor_id!=this.responses_list[i].id_user){
         
          this.NotificationsService.add_notification('comment_answer_like',this.visitor_id,this.visitor_name,this.responses_list[i].id_user,this.category,this.title,this.format,this.publication_id,this.chapter_number,this.responses_list[i].comment,true,this.responses_list[i].id).subscribe(l=>{
            let message_to_send ={
              for_notifications:true,
              type:"comment_answer_like",
              id_user_name:this.visitor_name,
              id_user:this.visitor_id, 
              id_receiver:this.responses_list[i].id_user,
              publication_category:this.category,
              publication_name:this.title,
              format:this.format,
              publication_id:this.publication_id,
              chapter_number:this.chapter_number,
              information:this.responses_list[i].comment,
              status:"unchecked",
              is_comment_answer:true,
              comment_id:this.responses_list[i].id,
            }
            this.chatService.messages.next(message_to_send);
            this.responses_list[i].likesnumber=this.responses_list[i].likesnumber+1;
            this.liked_list[i]=true;
            this.answer_like_in_progress=false;
            this.cd.detectChanges()
          })
        }
        else{
          this.responses_list[i].likesnumber=this.responses_list[i].likesnumber+1;
          this.liked_list[i]=true;
          this.answer_like_in_progress=false;
          this.cd.detectChanges()
        }
       
      })
    }

  }

  show_less_responses(){
    this.see_responses = false;
  }

  show_responses() {
    this.see_responses = true;
    this.cd.detectChanges();
  }

 

  set_editable() {
    this.see_more();
    this.edit_comment = true;
    this.cd.detectChanges();

    
    setTimeout(()=>{
      this.textareaREAD.nativeElement.focus();
      this.textareaREAD.nativeElement.setSelectionRange(this.textareaREAD.nativeElement.value.length,this.textareaREAD.nativeElement.value.length);
    },100);

    this.cd.detectChanges();
  }

  set_not_editable() {
    this.edit_comment = false;
    this.cd.detectChanges();
  }
  
 

  SHIFT_1_CLICKED=false;
  onKeydown(event) {
    //edit a commentary

    if(event.key=="Shift"){
      this.SHIFT_1_CLICKED = true;
    }
    if (event.key == "Enter" && !this.SHIFT_1_CLICKED && this.edit_comment) {
      if(this.textareaREAD.nativeElement.value && this.textareaREAD.nativeElement.value!='' && this.textareaREAD.nativeElement.value.replace(/\s/g, '').length>0){
        this.set_not_editable();

        this.changed.emit();
        this.NotationService.edit_commentary(this.textareaREAD.nativeElement.value.replace(/\n\s*\n\s*\n/g, '\n\n'),this.id)
            .subscribe(l=>{
              this.comment=l[0].commentary;
        });
      }
      
    }
  }
  onKeyup(event) {
    if(event.key=="Shift"){
      this.SHIFT_1_CLICKED = false;
    }
  }





  SHIFT_2_CLICKED=false;
   //edit a response
  onKeydownResponse(event, i: number) {
    
    if(event.key=="Shift"){
      this.SHIFT_2_CLICKED =true;
    }
    if(event.key=="Enter" && !this.SHIFT_2_CLICKED && this.editable_response == i){
      if(this.textareaRESPONSE.toArray()[i].nativeElement.value && this.textareaRESPONSE.toArray()[i].nativeElement.value!='' && this.textareaRESPONSE.toArray()[i].nativeElement.value.replace(/\s/g, '').length>0){
        this.set_not_editable_response();
        this.NotationService.edit_answer_on_commentary(this.textareaRESPONSE.toArray()[i].nativeElement.value.replace(/\n\s*\n\s*\n/g, '\n\n'),this.responses_list[i].id).subscribe(l=>{
              console.log(l[0].commentary);
              this.responses_list.splice(i, 1,
                {
                  author_id :l[0].author_id_who_replies,
                  id:l[0].id,
                  comment:l[0].commentary,
                  see_more:false,
                  likesnumber:l[0].number_of_likes,
                  date:this.responses_list[i].date,
                });
              this.cd.detectChanges();
        });
      }
    }
    
  }

  onKeyupResponse(event, i: number) {
    if(event.key=="Shift"){
      this.SHIFT_2_CLICKED = false;
    }
  }


  SHIFT_3_CLICKED=false;
//respond to a commentary
  onKeydownResponseToComment(event) {

    if(event.key=="Shift"){
      this.SHIFT_3_CLICKED =true;
    }
    else if(event.key=="Enter" && !this.SHIFT_3_CLICKED ){
        if(this.textareaRESPONSEtoCOMMENT.nativeElement.value && this.textareaRESPONSEtoCOMMENT.nativeElement.value!='' && this.textareaRESPONSEtoCOMMENT.nativeElement.value.replace(/\s/g, '').length>0){
          event.preventDefault();

        this.NotationService.add_answer_on_commentary(this.category,this.format,this.style,this.publication_id,this.chapter_number,this.textareaRESPONSEtoCOMMENT.nativeElement.value.replace(/\n\s*\n\s*\n/g, '\n\n'),this.id)
          .subscribe(l=>{
           
            if(this.visitor_id!=this.authorid){
              this.Profile_Edition_Service.retrieve_profile_picture(l[0].author_id_who_replies ).subscribe(r=> {
                let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.profile_picture_list.splice(0, 0,SafeURL);
                this.Profile_Edition_Service.retrieve_profile_data(l[0].author_id_who_replies).subscribe(s=> {
                  this.pseudo_list.splice(0, 0,s[0].nickname);
                  this.author_name_list.splice(0, 0,s[0].firstname + ' ' + s[0].lastname);
                  this.visitor_mode_list.splice(0,0,false)
                  this.liked_list.splice(0,0,false);
                  this.responses_list.splice(0, 0,
                    {
                      author_id :l[0].author_id_who_replies,
                      id:l[0].id,
                      comment:l[0].commentary,
                      see_more:false,
                      likesnumber:l[0].number_of_likes,
                      date:get_date_to_show(date_in_seconds(this.now_in_seconds,l[0].createdAt))
                    });

                  this.NotificationsService.add_notification('comment_answer',this.visitor_id,this.visitor_name,this.authorid,this.category,this.title,this.format,this.publication_id,this.chapter_number,this.comment,true,l[0].id).subscribe(l=>{
                    let message_to_send ={
                      for_notifications:true,
                      type:"comment_answer",
                      id_user_name:this.visitor_name,
                      id_user:this.visitor_id, 
                      id_receiver:this.authorid,
                      publication_category:this.category,
                      publication_name:this.title,
                      format:this.format,
                      publication_id:this.publication_id,
                      chapter_number:this.chapter_number,
                      information:this.comment,
                      status:"unchecked",
                      is_comment_answer:true,
                      comment_id:l[0].id,
                    }
                    this.chatService.messages.next(message_to_send);
                    this.textareaRESPONSEtoCOMMENT.nativeElement.value = "";
                    this.textareaRESPONSEtoCOMMENT.nativeElement.blur();
                    this.cd.detectChanges()
                  })
                });
              });
            }
            else{
              this.profile_picture_list.splice(0, 0,this.profile_picture);
                this.Profile_Edition_Service.retrieve_profile_data(this.authorid).subscribe(s=> {
                  this.pseudo_list.splice(0, 0,s[0].nickname);
                  this.author_name_list.splice(0, 0,s[0].firstname + ' ' + s[0].lastname);

                  this.liked_list.splice(0,0,false);

                  this.responses_list.splice(0, 0,
                    {
                      author_id :l[0].author_id_who_replies,
                      id:l[0].id,
                      comment:l[0].commentary,
                      see_more:false,
                      likesnumber:l[0].number_of_likes,
                      date:get_date_to_show(date_in_seconds(this.now_in_seconds,l[0].createdAt))
                    });
                    this.textareaRESPONSEtoCOMMENT.nativeElement.value = "";
                    this.textareaRESPONSEtoCOMMENT.nativeElement.blur();
                    this.cd.detectChanges();
                });
            }
              
          });
      }
    }
   
  }

  onKeyupResponseToComment(event) {
    if(event.key=="Shift"){
      this.SHIFT_3_CLICKED = false;
    }
  }
  ngAfterViewInit() {

  }

  edit_response(i:number) {
    
    if( this.editable_response == i ) {
      return;
    }
    else if( this.editable_response != -1 ) {
      this.textareaRESPONSE.toArray()[ this.editable_response ].nativeElement.value = this.response_before_change;
    }

    this.editable_response = i;
    this.response_before_change = this.textareaRESPONSE.toArray()[i].nativeElement.value;
    
    this.cd.detectChanges();
    setTimeout(()=>{
      this.textareaRESPONSE.toArray()[i].nativeElement.focus();
      this.textareaRESPONSE.toArray()[i].nativeElement.setSelectionRange(this.textareaRESPONSE.toArray()[i].nativeElement.value.length,this.textareaRESPONSE.toArray()[i].nativeElement.value.length);
    },100);

  }
 
  set_not_editable_response() {
    this.editable_response = -1;
    this.cd.detectChanges();
  }

  load_pp(){
    this.pp_is_loaded=true;
  }

  load_main_pp(){
    this.main_pp_is_loaded=true;
  }

  load_pp_list(i){
    this.profile_picture_list_loaded[i]=true;
  }
  

  open_account() {
    return "/account/"+this.pseudo+"/"+this.authorid;
  };

  open_response_account(i:number) {
    return "/account/"+this.pseudo_list[i]+"/"+this.responses_list[i].authorid;
  }

}
