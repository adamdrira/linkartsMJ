
import { Component, OnInit, HostListener, Input, Output, EventEmitter, SimpleChanges, ChangeDetectorRef, ElementRef, ViewChild, Renderer2, ViewChildren, QueryList } from '@angular/core';
import { FormControl, FormGroup} from '@angular/forms';
import { ChatService} from '../services/chat.service';
import { Profile_Edition_Service} from '../services/profile_edition.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscribing_service } from '../services/subscribing.service';
import { NavbarService } from '../services/navbar.service';
import {PopupConfirmationComponent} from '../popup-confirmation/popup-confirmation.component'
import { MatDialog } from '@angular/material/dialog';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { PopupFormComponent } from '../popup-form/popup-form.component';
import { PopupChatGroupMembersComponent } from '../popup-chat-group-members/popup-chat-group-members.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { PopupAdPicturesComponent } from '../popup-ad-pictures/popup-ad-pictures.component';
import { PopupChatSearchComponent } from '../popup-chat-search/popup-chat-search.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router } from '@angular/router';
import { ResizedEvent } from 'angular-resize-event';
import { merge, fromEvent } from 'rxjs'
import { PopupEditPictureComponent } from '../popup-edit-picture/popup-edit-picture.component';

declare var $: any;

var url = 'http://localhost:4600/routes/upload_attachments_for_chat/';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  animations: [
    trigger(
      'enterFromTopAnimation', [
        transition(':enter', [
          style({transform: 'translateY(-100%)', opacity: 0}),
          animate('400ms ease-in-out', style({transform: 'translateY(0px)', opacity: 1}))
        ])
      ],
    ),
    trigger(
      'enterFromLeftAnimation', [
        transition(':enter', [
          style({transform: 'translateX(-100%)', opacity: 0}),
          animate('400ms ease-in-out', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ],
    ),
    trigger(
      'enterFromRightAnimation', [
        transition(':enter', [
          style({transform: 'translateX(100%)', opacity: 0}),
          animate('400ms ease-in-out', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ],
    ),
    trigger(
      'enterFromBottomAnimation', [
        transition(':enter', [
          style({transform: 'translateY(100%)', opacity: 0}),
          animate('400ms ease-in-out', style({transform: 'translateY(0px)', opacity: 1}))
        ])
      ],
    ),
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({opacity: 0}),
          animate('400ms', style({opacity: 1}))
        ])
      ],
    ),
    //LEAVING ANIMATIONS
    trigger(
      'leaveAnimation', [
        transition(':leave', [
          style({transform: 'translateX(0%)', opacity: 1}),
          animate('200ms ease-in-out', style({transform: 'translateX(-30px)', opacity: 0}))
        ])
      ],
    )
  ],
})
export class ChatComponent implements OnInit  {

  constructor (
    private chatService:ChatService,
    private Subscribing_service:Subscribing_service,
    private sanitizer:DomSanitizer,
    private router: Router,
    private cd: ChangeDetectorRef,
    public dialog: MatDialog,
    private renderer: Renderer2,
    private navbar :NavbarService,
    private Profile_Edition_Service:Profile_Edition_Service
    ){
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      });

      this.uploader = new FileUploader({
        url:url,
        method: 'POST',
      });
      this.hasBaseDropZoneOver = false;
      this.hasAnotherDropZoneOver = false;
      
      //for chat-right
      this.reload_list_of_files_subject = new BehaviorSubject<boolean>(false);
      this.reload_list_of_files = this.reload_list_of_files_subject.asObservable();

      //message received
      navbar.connexion.subscribe(r=>{
        if(r!=this.connexion_status){
          this.connexion_status=r
         
          if(r){
            chatService.messages.subscribe(msg=>{
              this.chat_service_managment_function(msg);
              
            })
          }
        }
        
      })
  }

  scroll:any;
  connexion_status=false;
  //for chat-right
  private reload_list_of_files_subject: BehaviorSubject<boolean>;
  public reload_list_of_files: Observable<boolean>;

  //click lisner for emojis, and research chat
  @HostListener('document:click', ['$event.target'])
  clickout(btn) {
    if(this.show_emojis){
      if (!(this.emojis.nativeElement.contains(btn) || this.emoji_button.nativeElement.contains(btn))){
        this.renderer.setStyle(this.emojisSpinner.nativeElement, 'visibility', 'hidden');
        this.renderer.setStyle(this.emojis.nativeElement, 'visibility', 'hidden');
        this.show_emojis=false;
      }
    }
  }


 // temporary_id_message
 temporary_id=0;

  //uplaoder attachments
  uploader:FileUploader;
  hasBaseDropZoneOver:boolean;
  hasAnotherDropZoneOver:boolean;
  public fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }

  public fileOverAnother(e:any):void {
    this.hasAnotherDropZoneOver = e;
  }
  k=0;
  //interaction with fchat_friends
  @Output() new_sort_friends_list= new EventEmitter<object>();
  @Output() add_spam_to_contacts = new EventEmitter<object>();
  @Output() add_group_to_contacts = new EventEmitter<object>();
  @Output() change_section = new EventEmitter<object>();
  @Output() change_message_status = new EventEmitter<object>();
  @Output() add_a_friend_to_the_group = new EventEmitter<object>();
  @Output() display_exit = new EventEmitter<object>();
  @Output() blocking_managment = new EventEmitter<object>();
  
  
  
  @ViewChild('input') input:ElementRef;

  //chat_section
  @Input() id_chat_section: number;
  
  chat_section_to_open: string;
  section_where_is_writing:string;
  current_id_chat_section:number;
  
  //message_to_send
  message_group: FormGroup;
  message: FormControl;
  //spam
  @Input() spam: string;
  @Input() list_of_users_blocked:any;
  block_chat=false;
  who_blocked:string;
  //current_user
  @Input() current_user_id: number;
  @Input() current_user_pseudo: string;
  @Input() current_user_name: string;
  @Input() current_user_profile_picture: SafeUrl;
  //group of friends
  list_of_users_writing=[];
  list_of_users_names={};
  list_of_users_names_retrieved=false;
  list_of_users_profile_pictures={};
  list_of_messages_reactions={};
  //friend
  @Input() friend_id: number;
  @Input() chat_friend_id: number;
  
  current_friend_id:number=-1;
  current_friend_type:string='';
  @Input() friend_pseudo: string;
  @Input() friend_certification: any;
  
  @Input() friend_type: string;
  @Input() friend_name: string;
  @Input() friend_picture: SafeUrl;
  @Input() user_present: boolean;
  //friends
  @Input() list_of_friends_ids:any[];
  @Input() list_of_friends_types:any[];
  
  //if the other person has already sent a message
  response_exist=false;
  response_exist_retrieved=false;

  //messages
  message_one:any;
  change_number=0;
  list_of_messages:any[]=[];
  list_of_messages_date:any[]=[];
  display_messages=false;
  list_of_show_pp_left:any[]=[];
  index_of_show_pp_right=-1;
  compteur_pp=0;
  list_of_images_loaded=[];
  list_of_pp_loaded_classic=[];
  list_of_time:any[]=[]
  display_retry:any[]=[];
  display_writing=false;
 
  //attachments
  attachments_size:any[]=[];
  list_of_messages_pictures:any[]=[];
  list_of_messages_files:any[]=[];
  display_attachments=false;
  attachments:any[]=[];
  attachments_safe:any[]=[];
  attachments_for_sql:any[]=[];
  attachments_type:any[]=[];
  end_of_past_images=false;
  an_image_is_pasted=false;
  attachments_name:any[]=[];
  compt_at=0;

  //upload files
  @ViewChild('file_upload') file_upload:ElementRef;
  //validate enter to send message
 
  //show messages 
  compteur_image=0;
  compteur_loaded=0;
  put_messages_visible=false;
  can_load_images=false;
  @ViewChild('myScrollContainer') private myScrollContainer: ElementRef;

 
  /*******************************************ON CHANGES ************************** */
  /*******************************************ON CHANGES ************************** */
  /*******************************************ON CHANGES ************************** */
  /*******************************************ON CHANGES ************************** */
  /*******************************************ON CHANGES ************************** */

  compteur_user=0;
  ngOnChanges(changes: SimpleChanges) {
    if(changes.user_present ){
      if(this.user_present && this.spam=='false'){
        this.chatService.let_all_friend_messages_to_seen(this.friend_id,this.id_chat_section,(this.friend_type=='group')?true:false).subscribe(l=>{
          if(!(l[0].message)){
            let message_to_send ={
              id_user_name:this.current_user_pseudo,
              id_user:this.current_user_id,   
              id_receiver:this.friend_id, 
              message:"",
              is_from_server:false,
              status:'seen',
              id_chat_section:this.id_chat_section,
              attachment_name:"none",
              is_an_attachment:false,
              attachment_type:"none",
              is_a_group_chat:(this.friend_type=='group')?true:false,
              is_a_response:false,
            }
            this.chatService.messages.next(message_to_send);
          }
          
         });
         
         
          this.change_message_status.emit({id_chat_section:this.id_chat_section,status:"seen",friend_id:this.friend_id,friend_type:this.friend_type,spam:false,real_friend_id:this.current_user_id});


         
      }
      else{
        this.desactivateFocus();
      }
      return
    }
    if((this.friend_type!=this.current_friend_type)|| (this.friend_id!=this.current_friend_id)){
      if(this.show_research_results){
        this.show_research_results=false;
        this.searched_message = -1;
      }
      this.compteur_user++;
      if(this.friend_type=='user'){
          this.change_user();
      }
      else{
          this.change_group();
      }
      window.dispatchEvent(new Event('resize'));
      return;
    }
    if(changes.spam){
      if(this.spam=='false'){
        if(this.friend_type=='user'){
          this.change_user();
        }
        else{
            this.change_group();
        }
        
      }
    }
    
   
  }

  can_get_other_messages=false;
  show_spinner=false;
  
  change_user(){
    this.cancel_show_research_results();
    this.response_exist_retrieved = false;
    this.block_chat = false;
    this.uploader.setOptions({ url: url+`${this.friend_type}/${this.chat_friend_id}/`});
    this.list_of_users_names_retrieved=false;
    this.today_triggered=false;
    this.display_writing=false;
    this.function_done=false;
    this.trigger_no_more=false;
    this.can_get_other_messages=false;
    this.list_of_chat_sections_found=[];
    this.list_of_chat_sections_found_id=[];
    this.current_friend_id=this.friend_id;
    this.current_friend_type=this.friend_type;
    this.list_of_chat_sections_notifications=[];
    this.list_of_chat_sections_id=[1];
    this.compteur_chat_section=0;
    this.list_of_chat_sections=["Discussion principale"];
    this.number_of_sections_unseen=0;
    this.cd.detectChanges();
    this.get_messages(this.id_chat_section,false);
    this.change_number=0;
    if(this.user_present && this.spam=='false'){
      this.chatService.let_all_friend_messages_to_seen(this.friend_id,this.id_chat_section,false).subscribe(l=>{
        if(!(l[0].message)){
          let message_to_send ={
            id_user_name:this.current_user_pseudo,
            id_user:this.current_user_id,   
            id_receiver:this.friend_id, 
            message:"",
            is_from_server:false,
            status:'seen',
            id_chat_section:this.id_chat_section,
            attachment_name:"none",
            is_an_attachment:false,
            attachment_type:"none",
            is_a_group_chat:false,
            is_a_response:false,
          }
          this.chatService.messages.next(message_to_send);
        }
        
      });
      this.change_message_status.emit({id_chat_section:this.id_chat_section,status:"seen",friend_id:this.friend_id,friend_type:this.friend_type,spam:false});

        
    }
  }

  change_group(){
    this.response_exist_retrieved = false;
    this.block_chat = false;
    this.cancel_show_research_results();
    this.list_of_messages=[];
    this.uploader.setOptions({ url: url+`${this.friend_type}/${this.chat_friend_id}/`});
    this.function_done=false;
    this.trigger_no_more=false;
    this.list_of_users_names_retrieved=false;
    this.today_triggered=false;
    this.can_get_other_messages=false;
    this.display_writing=false;
    this.list_of_chat_sections_found=[];
    this.list_of_chat_sections_found_id=[];
    this.current_friend_id=this.friend_id;
    this.current_friend_type=this.friend_type;
    this.number_of_sections_unseen=0;
    this.list_of_chat_sections_notifications=[];
    this.list_of_chat_sections_id=[1];
    this.compteur_chat_section=0;
    this.list_of_chat_sections=["Discussion principale"];
    //this.top_pp_loaded=false;
    
    this.cd.detectChanges();
    this.get_messages(this.id_chat_section,true);
    this.change_number=0;
    this.chatService.get_group_chat_information(this.friend_id).subscribe(info=>{
      let compt_user=0;
      let list_of_receivers_ids=info[0].list_of_receivers_ids;
      for(let i=0;i<list_of_receivers_ids.length;i++){
        this.Profile_Edition_Service.retrieve_profile_picture(list_of_receivers_ids[i]).subscribe(p=>{
          let url = (window.URL) ? window.URL.createObjectURL(p) : (window as any).webkitURL.createObjectURL(p);
          const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
          this.list_of_users_profile_pictures[list_of_receivers_ids[i]]=url;
         
        })
        this.Profile_Edition_Service.retrieve_profile_data(list_of_receivers_ids[i]).subscribe(r=>{
          this.list_of_users_names[r[0].id]=r[0].firstname + ' ' + r[0].lastname;
          compt_user++;
          if(compt_user==list_of_receivers_ids.length){
            this.list_of_users_names_retrieved=true;
          }
          
        })
       
      }
    })
    
    if(this.user_present){
      this.chatService.let_all_friend_messages_to_seen(this.friend_id,this.id_chat_section,true).subscribe(l=>{
        if(!(l[0].message)){
          let message_to_send ={
            id_user_name:this.current_user_pseudo,
            id_user:this.current_user_id,   
            id_receiver:this.friend_id, 
            message:"",
            is_from_server:false,
            status:'seen',
            id_chat_section:this.id_chat_section,
            attachment_name:"none",
            is_an_attachment:false,
            attachment_type:"none",
            is_a_group_chat:true,
            is_a_response:false,
          }
          this.chatService.messages.next(message_to_send);
        }
        });

          this.change_message_status.emit({id_chat_section:this.id_chat_section,status:"seen",friend_id:this.friend_id,friend_type:'group',spam:false,real_friend_id:this.current_user_id});

    }
  }

  /*******************************************ON INIT ************************** */
  /*******************************************ON INIT ************************** */
  /*******************************************ON INIT ************************** */
  /*******************************************ON INIT ************************** */
  /*******************************************ON INIT ************************** */

  onScroll(event){
    if(this.myScrollContainer && this.myScrollContainer.nativeElement.scrollTop==0 && this.put_messages_visible && !this.show_research_results && !this.trigger_no_more){
      if(this.can_get_other_messages){
        this.compteur_get_messages++;
        this.can_get_other_messages=false;
        this.show_spinner=true;
        if(this.list_of_messages.length>0){
          this.chatService.get_other_messages(this.compteur_get_messages, this.friend_id,this.list_of_messages[this.list_of_messages.length-1].id,this.id_chat_section,this.list_of_messages_reactions,(this.friend_type=='group')?true:false).subscribe(r=>{
            if(r[0][0][0] && this.compteur_get_messages==r[1]){
              let num=this.list_of_messages.length;
              this.list_of_messages_reactions=r[0][1].list_of_messages_reactions;
              for(let i=0;i<r[0][0].length;i++){
                this.list_of_messages.push(r[0][0][i]);
                this.list_of_messages_date.push(this.date_of_message(r[0][0][i].createdAt,0));
                if(this.friend_type=='user'){
                  this.sort_pp(num-1+i);
                }
                this.get_picture_for_message(num-1+i);
                
              }
            
              this.calculate_dates_to_show()
              this.show_spinner=false;
              this.cd.detectChanges();
              let offset=this.message_children.toArray()[r[0][0].length].nativeElement.offsetTop;
              let height =this.message_children.toArray()[r[0][0].length].nativeElement.getBoundingClientRect().height;
              this.myScrollContainer.nativeElement.scrollTop=offset-height;
              this.can_get_other_messages=true;
              
            }
            else{
              this.show_spinner=false;
              this.can_get_other_messages=false;
              this.trigger_no_more=true;
            }
          })
        }
        else{
            this.show_spinner=false;
            this.can_get_other_messages=false;
            this.trigger_no_more=true;
        }
        
      }
    }
  }

  ngOnInit() {
    this.uploader.setOptions({ url: url+`${this.friend_type}/${this.chat_friend_id}/`});
    if(this.friend_type=='group'){
      this.chatService.get_group_chat_information(this.friend_id).subscribe(info=>{
        let compt_user=0;
        let list_of_receivers_ids=info[0].list_of_receivers_ids;
        for(let i=0;i<list_of_receivers_ids.length;i++){
          let data_retrieved=false;
          this.Profile_Edition_Service.retrieve_profile_data(list_of_receivers_ids[i]).subscribe(r=>{
            this.list_of_users_names[r[0].id]=r[0].firstname + ' ' + r[0].lastname;
            data_retrieved=true;
            check_all(this)
            
          })

          this.Profile_Edition_Service.retrieve_profile_picture(list_of_receivers_ids[i]).subscribe(p=>{
            let url = (window.URL) ? window.URL.createObjectURL(p) : (window as any).webkitURL.createObjectURL(p);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_users_profile_pictures[list_of_receivers_ids[i]]=url;
          
          })

          function check_all(THIS){
            if(data_retrieved){
              compt_user++;
              if(compt_user==list_of_receivers_ids.length){
                THIS.list_of_users_names_retrieved=true;
              }
            }
           
          }
        }
      })
    }
    
    this.createFormControlsAds();
    this.createFormAd();
    if(this.friend_type=='user'){
      this.get_messages(this.id_chat_section,false);
    }
    else{
      this.get_messages(this.id_chat_section,true);
    }
    
    
    this.current_id_chat_section=this.id_chat_section;
    this.current_friend_type=this.friend_type;
    this.current_friend_id=this.friend_id;
    let scroll_observer = setInterval(() => {

      if(!this.scroll){
        if(this.myScrollContainer){
          this.scroll = merge(
            fromEvent(window, 'scroll'),
            fromEvent(this.myScrollContainer.nativeElement, 'scroll')
          );
        }
      }
      else{
        clearInterval(scroll_observer)
      }
    }, 500);
      

    // retry managment
    /*setInterval(() => {
      if( this.friend_type=='user' && this.list_of_time.length>0){
        for(let i=0;i<this.list_of_time.length;i++){
          if(this.list_of_messages[i].status=='sent' && !this.display_retry[i]){
            let ending_time_of_view = Math.trunc(new Date().getTime()/1000)  - this.list_of_time[i];
            if(ending_time_of_view>25){
              this.display_retry[i]=true;
            }
          }
        }
      }
    }, 5000);*/
    
    
    //uploader_managment
    this.uploader.onAfterAddingFile = async (file) => {

      if(this.chat_friend_id==0){
        this.chatService.get_chat_friend(this.friend_id,(this.friend_type=='group')?true:false).subscribe(r=>{
          if(r[0]){
            this.chat_friend_id=r[0].id;
          }
        })
      }

      var re = /(?:\.([^.]+))?$/;
      let size = file._file.size/1024/1024;
      if(this.uploader.queue.length==6){
        this.uploader.queue.pop();
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Vous ne pouvez pas ajouter plus de 5 fichiers.'},          
          panelClass: "popupConfirmationClass",
        });
      }
      else if(Math.trunc(size)>20){
        this.uploader.queue.pop();
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:`Votre fichier est trop volumineux, choisissez un fichier de moins de 10Mo alors qu'il fait ${size}.`},
          panelClass: "popupConfirmationClass",
        });
      }
      else{
        let url = (window.URL) ? window.URL.createObjectURL(file._file) : (window as any).webkitURL.createObjectURL(file._file);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.attachments_size.push(size);
        this.attachments.push(url);
        this.attachments_safe.push(SafeURL);
        this.attachments_name.push(file._file.name);
        if( re.exec(file._file.name)[1].toLowerCase()=="jpeg" || re.exec(file._file.name)[1].toLowerCase()=="png" || re.exec(file._file.name)[1].toLowerCase()=="jpg" || re.exec(file._file.name)[1].toLowerCase()=="gif"){
          this.attachments_type.push('picture_attachment');
        }
        else{
          this.attachments_type.push('file_attachment');
        }
        this.display_attachments=true;
        if(this.can_show_send_icon){
          this.show_send_icon=true;
        }
        file.withCredentials = true; 
        
      }
    };

  

    this.uploader.onCompleteItem = (file) => {
      this.k++;
      if(this.k<this.uploader.queue.length){
        this.chatService.check_if_file_exists((this.friend_type=='user')?'user':'group',this.chat_friend_id,this.uploader.queue[this.k]._file.name,0).subscribe(r=>{
          let URL = url + `${this.friend_type}/${this.chat_friend_id}/` + r[0].value;
          this.uploader.setOptions({ url: URL});
          this.uploader.setOptions({ headers: [ {name:'attachment_name',value:`${r[0].value}`}]});
          this.uploader.queue[this.k].upload();
        })
      }
      
      var type='';
      var re = /(?:\.([^.]+))?$/;
      if( re.exec(file._file.name)[1]=="jpeg" || re.exec(file._file.name)[1].toLowerCase()=="png" || re.exec(file._file.name)[1]=="jpg"){
        type='picture_attachment'
      }
      else{
        type='file_attachment';
      }
      this.chatService.check_if_file_exists((this.friend_type=='user')?'user':'group',this.chat_friend_id,file._file.name,1).subscribe(r=>{
        let message ={
          id_user_name:this.current_user_pseudo,
          id_user:this.current_user_id,   
          id_receiver:this.friend_id,  
          message:null,
          attachment_name:r[0].value,
          list_of_users_who_saw:[this.current_user_id],
          attachment_type:type,
          is_an_attachment:true,
          is_from_server:false,
          id_chat_section:this.id_chat_section,
          size:file._file.size/1024/1024,
          is_a_response:this.respond_to_a_message,
          id_message_responding:(this.respond_to_a_message)?this.id_message_responding_to:null,
          message_responding_to:(this.respond_to_a_message)?this.message_responding_to:null,
          status:"sent",
          temporary_id:this.temporary_id,
          is_a_group_chat:(this.friend_type=='user')?false:true,
        };
        this.temporary_id+=1;
        this.chatService.messages.next(message);
      })
      if(this.k==this.uploader.queue.length){
        if(this.an_image_is_pasted && this.end_of_past_images){
          this.an_image_is_pasted=false;
          this.end_of_past_images=false;
        }
        this.attachments_safe=[];
        this.attachments_type=[];
        this.attachments_name=[];
        this.attachments_for_sql=[];
        this.attachments=[];
        this.compt_at=0;
        this.display_attachments=false;
        this.uploader.queue=[];  
        this.k=0;  
      }
      
    }
    
  };

  ngAfterViewInit(){
    if( window.innerWidth<850 ) {
      this.can_show_send_icon=true;
    }
    else{
      this.can_show_send_icon=false;
    }
  
  }

  
    /*******************************************get messages ************************** */
  /*******************************************get messages************************** */
  /*******************************************get messages************************** */
  /*******************************************get messages ************************** */
  /*******************************************get messages ************************** */
  compteur_selector=0;
  compteur_get_messages=0;
  get_messages(id_chat_section,bool){
    this.compteur_get_messages++;
    this.compteur_image=0;
    this.compteur_loaded=0;
    if(!bool){
      this.display_messages=false;
      this.put_messages_visible=false;
      this.index_of_show_pp_right=-1;
      this.list_of_show_pp_left=[];

      for(let i=0;i<this.list_of_users_blocked.length;i++){

        if(this.friend_id==this.list_of_users_blocked[i].id_user && this.current_user_id==this.list_of_users_blocked[i].id_user_blocked && this.friend_type=='user'){
          this.block_chat=true;
          this.who_blocked="user"
        }
        else if(this.current_user_id==this.list_of_users_blocked[i].id_user && this.friend_id==this.list_of_users_blocked[i].id_user_blocked && this.friend_type=='user'){
          this.block_chat=true;
          this.who_blocked="me"
        }

      }
    }
    
    this.list_of_messages_pictures=[];
    this.list_of_messages_files=[];
    this.list_of_messages_date=[];
    this.list_of_messages=[];
    this.list_of_time=[];
    this.compteur_pp=0;
    if(this.spam=='false' && this.user_present){
      this.chatService.let_all_friend_messages_to_seen(this.friend_id,id_chat_section,bool).subscribe(l=>{
        if(!(l[0].message)){
          let message_to_send ={
            id_user_name:this.current_user_pseudo,
            id_user:this.current_user_id,   
            id_receiver:this.friend_id, 
            message:"",
            is_from_server:false,
            status:'seen',
            id_chat_section:this.id_chat_section,
            attachment_name:"none",
            is_an_attachment:false,
            attachment_type:"none",
            is_a_group_chat:false,
            is_a_response:false,
          }
          this.chatService.messages.next(message_to_send);
        }
        
      })
    }
    this.get_chat_sections();
    this.chatService.get_first_messages(this.current_user_id,this.friend_id,id_chat_section,bool,this.compteur_get_messages).subscribe(r=>{
      if(bool){
        this.list_of_messages_reactions=r[0][1].list_of_messages_reactions;
      }
      if(r[1]==this.compteur_get_messages){
        if(r[0][0].length>0){
          this.list_of_messages=r[0][0];
          for(let i=0;i<r[0][0].length;i++){
            this.list_of_messages_date[i]=this.date_of_message(r[0][0][i].createdAt,0);
            if(this.list_of_messages[i].is_an_attachment){
              if(this.list_of_messages[i].attachment_type=='picture_message' && this.list_of_messages[i].status!="deleted"){
                this.chatService.get_picture_sent_by_msg(this.list_of_messages[i].attachment_name).subscribe(t=>{
                  let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                  if(r[1]==this.compteur_get_messages){
                    this.list_of_messages_pictures[i]=url;
                  }
                })
              }
              else if(this.list_of_messages[i].attachment_type=='picture_attachment' && this.list_of_messages[i].status!="deleted"){

               
                  var re = /(?:\.([^.]+))?$/;
                  if(re.exec(this.list_of_messages[i].attachment_name.toLowerCase())[1]=="svg"){
                    this.chatService.get_attachment_svg(this.list_of_messages[i].attachment_name,(this.friend_type=='user')?'user':'group',this.chat_friend_id).subscribe(t=>{
                      let THIS=this;
                      var reader = new FileReader()
                      reader.readAsText(t);
                      reader.onload = function(this) {
                        let blob = new Blob([reader.result], {type: 'image/svg+xml'});
                        let url = (window.URL) ? window.URL.createObjectURL(blob) : (window as any).webkitURL.createObjectURL(blob);
                        if(r[1]==THIS.compteur_get_messages){
                          THIS.list_of_messages_pictures[i]=url;
                        }
                      }
                    })
                    
                  }
                  else{
                    this.chatService.get_attachment(this.list_of_messages[i].attachment_name,(this.friend_type=='user')?'user':'group',this.chat_friend_id).subscribe(t=>{
                      let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                      if(r[1]==this.compteur_get_messages){
                        this.list_of_messages_pictures[i]=url;
                      }
                    })
                    
                  }
                 
                  
              }
              else if(this.list_of_messages[i].attachment_type=='file_attachment' && this.list_of_messages[i].status!="deleted"){
                this.chatService.get_attachment(this.list_of_messages[i].attachment_name,(this.friend_type=='user')?'user':'group',this.chat_friend_id).subscribe(t=>{
                  let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                  const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                  if(r[1]==this.compteur_get_messages){
                    this.list_of_messages_files[i]=SafeURL;
                     
                  }
                  
                })
              }
            }
            
            if(!bool && !r[0][0][i].is_from_server){
              if(i==0 && r[0][0][i].id_user==this.friend_id && this.current_user_id!=this.friend_id){
                this.list_of_show_pp_left[i]=true;
                this.compteur_pp+=1;
                
              }
              if(r[0][0][i].id_user==this.current_user_id && r[0][0][i].status=="seen" && this.index_of_show_pp_right<0){
                this.index_of_show_pp_right=i;
                this.compteur_pp+=1;
              }
              if(i>0){  
                if(r[0][0][i].id_user==this.friend_id && r[0][0][i].id_user!=r[0][0][i-1].id_user){
                  this.list_of_show_pp_left[i]=true;
                  this.compteur_pp+=1;
                }
              }
            }
            
            if(i==r[0][0].length-1){
              this.chatService.check_if_response_exist(this.friend_id,id_chat_section,bool).subscribe(l=>{
                if(l[0].value){
                  this.response_exist=true;
                  this.response_exist_retrieved=true;
                }
                else{
                    this.response_exist=false;
                    this.response_exist_retrieved=true;
                }
                this.calculate_dates_to_show();
                this.display_messages=true;
                this.cd.detectChanges();
                this.put_messages_visible=true;
                this.myScrollContainer.nativeElement.scrollTop= this.myScrollContainer.nativeElement.scrollHeight;
                this.cd.detectChanges();
                this.can_load_images=true;
                if(this.list_of_messages.length>0){
                  this.can_get_other_messages=true;
                }
              })
            }
          }
        }
        else{
          this.can_get_other_messages=false;
          this.response_exist=false;
          this.response_exist_retrieved=true;
          this.display_messages=true;
          this.put_messages_visible=true;
        }

      }
      
      
      
    })
  }


  /*************************************DISPLAY CHAT***********************************/
  /*************************************DISPLAY CHAT***********************************/
  /*************************************DISPLAY CHAT***********************************/
  /*************************************DISPLAY CHAT***********************************/
  compteur_loaded_research=0;
  function_done=false;
 
  loaded_image(i){
    if(i>=0){
      this.list_of_images_loaded[i]=true;
      this.cd.detectChanges();
    }
    if(i<0){
      this.list_of_pp_loaded_classic[Math.abs(i+1)]=true;
      this.cd.detectChanges()
    }
    if(this.list_of_messages.length<=50){
      if(i>=0 && i<=3){
        this.myScrollContainer.nativeElement.scrollTop= this.myScrollContainer.nativeElement.scrollHeight;
      }
    }
    if(this.show_research_results){
      this.compteur_loaded_research+=1;
      if(this.compteur_image_research!=0){
        if (this.compteur_loaded_research==this.compteur_image_research + this.compteur_pp){
          this.put_messages_visible=true;
          this.can_get_other_messages=true;
          this.function_done=true;
        }
      }
      else{
        if (this.compteur_loaded_research==this.compteur_pp){
          this.put_messages_visible=true;
          this.can_get_other_messages=true;
          this.function_done=true;
        }
      }
    }
    
    
  }

  users_pp_loaded={};
  load_users_pp(id){
    this.users_pp_loaded[id]=true;
  }

/*************************************Partie envoie de message***********************************/
/*************************************Partie envoie de message***********************************/
/*************************************Partie envoie de message***********************************/
/*************************************Partie envoie de message***********************************/

  createFormControlsAds() {
    this.message = new FormControl('');
  }

  createFormAd() {
    this.message_group = new FormGroup({
      message: this.message,
    });
  }

  activateFocus() {
    this.input.nativeElement.focus();
    let msg ={
      id_user:this.current_user_id,   
      id_receiver:this.friend_id,  
      message:"",
      is_an_attachment:false,
      is_from_server:true,
      id_chat_section:this.id_chat_section,
      chat_section_name:this.list_of_chat_sections[this.list_of_chat_sections_id.indexOf(this.id_chat_section)],
      is_a_response:this.respond_to_a_message,
      id_message_responding:(this.respond_to_a_message)?this.id_message_responding_to:null,
      message_responding_to:(this.respond_to_a_message)?this.message_responding_to:null,
      status:"writing",
      is_a_group_chat:(this.friend_type=='user')?false:true,
    } 
    if(this.spam!='true'){
      this.chatService.messages.next(msg);
    }
    
  }

  desactivateFocus(){
    if(this.input){
      this.input.nativeElement.blur();
      let msg ={
        id_user_name:this.current_user_pseudo,
        id_user:this.current_user_id,   
        id_receiver:this.friend_id,  
        message:this.message_group.value.message,
        is_an_attachment:false,
        is_from_server:true,
        id_chat_section:this.id_chat_section,
        chat_section_name:this.list_of_chat_sections[this.list_of_chat_sections_id.indexOf(this.id_chat_section)],
        is_a_response:this.respond_to_a_message,
        id_message_responding:(this.respond_to_a_message)?this.id_message_responding_to:null,
        message_responding_to:(this.respond_to_a_message)?this.message_responding_to:null,
        status:"not-writing",
        is_a_group_chat:(this.friend_type=='user')?false:true,
      } 
      this.chatService.messages.next(msg);
    }
  }
  

  send_message_phone(){
    if(this.check_if_message_valide() && this.put_messages_visible){
      this.send_message();
      this.show_send_icon=false;
    }
    else if(this.attachments.length>0 && this.put_messages_visible){
      this.compt_at=0;
      for(let i=0;i<this.attachments.length;i++){
        this.compt_at+=1;
        this.send_attachment_or_picture(i);
        if(i==0){
          this.input.nativeElement.blur();
        }
      }
      this.show_send_icon=false;
    }
  }

  onPaste(event: ClipboardEvent) {
    var re = /(?:\.([^.]+))?$/;
    if(this.can_show_send_icon){
      this.show_send_icon=true;
    }
    if(event.clipboardData.files[0]){
      let size = event.clipboardData.files[0].size/1024/1024;
      let blob = event.clipboardData.files[0];
      let name=event.clipboardData.files[0].name;
      if(this.attachments.length==5){
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Vous ne pouvez pas envoyer plus de 5 fichiers simultanément.'},
          panelClass: "popupConfirmationClass",
        });
        return
      }
      if(Math.trunc(size)>5){
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Le fichier est trop volumineux.'},
          panelClass: "popupConfirmationClass",
        });
        return
      }
      if( re.exec(name)[1].toLowerCase()=="jpeg" || re.exec(name)[1].toLowerCase()=="png" || re.exec(name)[1].toLowerCase()=="jpg" || re.exec(name)[1].toLowerCase()=="gif"){
        let url = (window.URL) ? window.URL.createObjectURL(blob) : (window as any).webkitURL.createObjectURL(blob);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.attachments.push(url);
        this.attachments_safe.push(SafeURL);
        this.attachments_for_sql.push(blob);
        var today = new Date();
        var ms = String(today.getMilliseconds()).padStart(2, '0');
        var ss = String(today.getSeconds()).padStart(2, '0');
        var mi = String(today.getMinutes()).padStart(2, '0');
        var hh = String(today.getHours()).padStart(2, '0');
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); 
        var yyyy = today.getFullYear();
        let Today = yyyy + mm + dd + hh+ mi + ss + ms;
        let file_name = this.current_user_id + '-' + Today + re.exec(blob.name)[0];
        this.attachments_name.push(file_name);
        this.attachments_size.push(size);
        this.attachments_type.push('picture_message');
       
        this.display_attachments=true;
      }
    }
  }

  check_message_for_phone(){
    if(this.can_show_send_icon){
      if(this.check_if_message_valide() && this.put_messages_visible){
        this.show_send_icon=true;
      }
      else if(this.attachments.length>0 && this.put_messages_visible){
        this.show_send_icon=true;
      }
      else{
        this.show_send_icon=false;
      }
      
    }
  }

  SHIFT_CLICKED = false;
  on_keydown(event){
    
    if(event.key=="Shift"){
      this.SHIFT_CLICKED=true;
    }

    if(!this.can_show_send_icon){
      
      if(event.key=="Enter"){
        if( !this.SHIFT_CLICKED ){
          if(this.check_if_message_valide() && this.put_messages_visible){
            this.send_message();
          }
          else if(this.attachments.length>0 && this.put_messages_visible){
            this.compt_at=0;
            for(let i=0;i<this.attachments.length;i++){
              this.compt_at+=1;
              this.send_attachment_or_picture(i);
              if(i==0){
                this.input.nativeElement.blur();
              }
            }
          }
          if (event.keyCode === 13) { 
            return false;
          }  
        }
      }
      
    }
    
  }

  on_keyup(event) {
    if(event.key=="Shift"){
      this.SHIFT_CLICKED=false;
    }
  }

  check_if_message_valide(){
    if(this.message_group.value.message!=''){
      if (this.message_group.value.message.replace(/\s/g, '').length>0 ) {
        return true;
      }
      else{
        return false;
      }
    }
    else{
      return false
    }
  }

  
  

  remove_attachment(i){
    this.attachments.splice(i,1);
    this.attachments_safe.splice(i,1);
    this.attachments_name.splice(i,1);
    this.uploader.queue.splice(i,1);
    this.attachments_for_sql.splice(i,1);
    this.attachments_type.splice(i,1);
    if(this.attachments.length==0){
      this.display_attachments=false;
      this.show_send_icon=false;
    }
  }

  
  send_message(){
    

    if( this.message_group.value.message.length > 1500 ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Ce message est trop long (> 1500 caractères).'},
        panelClass: "popupConfirmationClass",
      });
      return;
    }

    if(this.attachments.length>0){
      for(let i=0;i<this.attachments.length;i++){
        this.send_attachment_or_picture(i);
      }
    }

    this.message_one ={
      id_user_name:this.current_user_pseudo,
      id_user:this.current_user_id,   
      id_receiver:this.friend_id,  
      message:this.message_group.value.message,
      list_of_users_who_saw:[this.current_user_id],
      list_of_users_in_the_group:(this.list_of_messages[this.list_of_messages.length-1])?this.list_of_messages[this.list_of_messages.length-1].list_of_users_in_the_group:[],
      is_from_server:false,
      is_an_attachment:false,
      id_chat_section:this.id_chat_section,
      is_a_response:this.respond_to_a_message,
      id_message_responding:(this.respond_to_a_message)?this.id_message_responding_to:null,
      message_responding_to:(this.respond_to_a_message)?this.message_responding_to:null,
      status:"sent",
      temporary_id:this.temporary_id,
      is_a_group_chat:(this.friend_type=='user')?false:true,
    }
    this.temporary_id+=1;
    this.respond_to_a_message=false;
    this.list_of_messages.splice(0,0,(this.message_one));
    this.list_of_messages_files.splice(0,0,false);
    this.list_of_messages_date.splice(0,0,this.date_of_message("time",1));
    this.list_of_messages_pictures.splice(0,0,false);
    this.index_of_show_pp_right=this.index_of_show_pp_right+1;
    this.list_of_show_pp_left.splice(0,0,false);
    this.display_retry.splice(0,0,false);
    this.list_of_time.splice(0,0,Math.trunc(new Date().getTime()/1000));  
    this.chatService.messages.next(this.message_one);
    this.input.nativeElement.value='';
    this.message.reset();
    this.message_group.value.message='';
    this.cd.detectChanges();
    this.myScrollContainer.nativeElement.scrollTop= this.myScrollContainer.nativeElement.scrollHeight;

  }

  
  send_picture(i){
    this.an_image_is_pasted=true;
    var re = /(?:\.([^.]+))?$/;
    var num=0;
    for(let j=0;j<i;j++){
      if(this.attachments_type[j]=="picture_message"){
        num+=1;
      }
    }
    let file_name=this.attachments_name[i];
    let file=this.attachments_for_sql[num];
    let message ={
      id_user_name:this.current_user_pseudo,
      id_user:this.current_user_id,   
      id_receiver:this.friend_id,  
      message:null,
      attachment_name:file_name,
      attachment_type:"picture_message",
      list_of_users_who_saw:[this.current_user_id],
      list_of_users_in_the_group:(this.list_of_messages[this.list_of_messages.length-1])?this.list_of_messages[this.list_of_messages.length-1].list_of_users_in_the_group:[],
      is_an_attachment:true,
      is_from_server:false,
      id_chat_section:this.id_chat_section,
      is_a_response:this.respond_to_a_message,
      id_message_responding:(this.respond_to_a_message)?this.id_message_responding_to:null,
      message_responding_to:(this.respond_to_a_message)?this.message_responding_to:null,
      size:this.attachments_size[i],
      status:"sent",
      temporary_id:this.temporary_id,
      is_a_group_chat:(this.friend_type=='user')?false:true,
    };
    
    this.temporary_id+=1;
    this.chatService.chat_sending_images(file,file_name).subscribe(l=>{
      this.chatService.messages.next(message);
    })
    this.index_of_show_pp_right=this.index_of_show_pp_right+1;
    this.list_of_show_pp_left.splice(0,0,false);
    this.list_of_messages_files.splice(0,0,this.attachments[i]);
    this.list_of_messages_pictures.splice(0,0,this.attachments[i]);
    this.list_of_messages.splice(0,0,(message));
    this.list_of_messages_date.splice(0,0,this.date_of_message("time",1));
    if(i==this.attachments.length-1){
      this.end_of_past_images=true;
      this.an_image_is_pasted=false;
      if(this.end_of_past_images && this.k==this.uploader.queue.length){
        this.k=0;
        this.end_of_past_images=false;
        this.attachments_type=[];
        this.attachments_name=[];
        this.attachments_for_sql=[];
        this.attachments=[];
        this.attachments_safe=[];
        this.compt_at=0;
        this.display_attachments=false;
      }
    }
    this.cd.detectChanges();
    this.myScrollContainer.nativeElement.scrollTop= this.myScrollContainer.nativeElement.scrollHeight;
  }

 
  send_attachment_or_picture(i){
    this.respond_to_a_message=false;
    if(this.attachments_type[i]=="picture_message"){
      this.send_picture(i);
    }
    else if(this.attachments_type[i]=="picture_attachment"){
      if(this.compt_at==1){
        this.chatService.check_if_file_exists((this.friend_type=='user')?'user':'group',this.chat_friend_id,this.attachments_name[i],0).subscribe(r=>{
          var uo: FileUploaderOptions = {};
          uo.headers = [{name:'attachment_name',value:`${r[0].value}`} ];
          let URL = url + `${this.friend_type}/${this.chat_friend_id}/` + r[0].value;
          this.uploader.setOptions({ url: URL});
          this.uploader.setOptions( uo);
          this.uploader.queue[0].upload();
          let message ={
            id_user_name:this.current_user_pseudo,
            id_user:this.current_user_id,   
            id_receiver:this.friend_id,  
            message:null,
            attachment_name:r[0].value,
            attachment_type:"picture_attachment",
            id_chat_section:this.id_chat_section,
            is_a_response:this.respond_to_a_message,
            id_message_responding:(this.respond_to_a_message)?this.id_message_responding_to:null,
            message_responding_to:(this.respond_to_a_message)?this.message_responding_to:null,
            list_of_users_who_saw:[this.current_user_id],
            list_of_users_in_the_group:(this.list_of_messages[this.list_of_messages.length-1])?this.list_of_messages[this.list_of_messages.length-1].list_of_users_in_the_group:[],
            is_an_attachment:true,
            is_from_server:false,
            size:this.attachments_size[i],
            status:"sent",
            is_a_group_chat:(this.friend_type=='user')?false:true,
          };
          this.index_of_show_pp_right=this.index_of_show_pp_right+1;
          this.list_of_show_pp_left.splice(0,0,false);
          this.list_of_messages_files.splice(0,0,this.attachments[i]);
          this.list_of_messages_pictures.splice(0,0,this.attachments[i]);
          this.list_of_messages.splice(0,0,(message));
          this.list_of_messages_date.splice(0,0,this.date_of_message("time",1));
        })
      }
      else{
        this.chatService.check_if_file_exists((this.friend_type=='user')?'user':'group',this.chat_friend_id,this.attachments_name[i],0).subscribe(r=>{
          let message ={
            id_user_name:this.current_user_pseudo,
            id_user:this.current_user_id,   
            id_receiver:this.friend_id,  
            message:null,
            id_chat_section:this.id_chat_section,
            is_a_response:this.respond_to_a_message,
            id_message_responding:(this.respond_to_a_message)?this.id_message_responding_to:null,
            message_responding_to:(this.respond_to_a_message)?this.message_responding_to:null,
            attachment_name:r[0].value,
            attachment_type:"picture_attachment",
            list_of_users_who_saw:[this.current_user_id],
             list_of_users_in_the_group:(this.list_of_messages[this.list_of_messages.length-1])?this.list_of_messages[this.list_of_messages.length-1].list_of_users_in_the_group:[],
            is_an_attachment:true,
            is_from_server:false,
            size:this.attachments_size[i],
            status:"sent",
            is_a_group_chat:(this.friend_type=='user')?false:true,
          };
          this.index_of_show_pp_right=this.index_of_show_pp_right+1;
          this.list_of_show_pp_left.splice(0,0,false);
          this.list_of_messages_files.splice(0,0,this.attachments[i]);
          this.list_of_messages_pictures.splice(0,0,this.attachments[i]);
          this.list_of_messages.splice(0,0,(message));
        })
      }
      this.cd.detectChanges();
    }
    else if(this.attachments_type[i]=="file_attachment"){
      this.compt_at+=1;
      if(this.compt_at==1){
        this.chatService.check_if_file_exists((this.friend_type=='user')?'user':'group',this.chat_friend_id,this.attachments_name[i],0).subscribe(r=>{
           let URL = url + `${this.friend_type}/${this.chat_friend_id}/` + r[0].value;
           this.uploader.setOptions({ url: URL});
           this.uploader.setOptions({ headers: [ {name:'attachment_name',value:`${r[0].value}`}]});
           this.uploader.queue[0].upload();
           let message ={
            id_user_name:this.current_user_pseudo,
             id_user:this.current_user_id,   
             id_receiver:this.friend_id,  
             message:null,
             id_chat_section:this.id_chat_section,
             attachment_name:r[0].value,
             attachment_type:"file_attachment",
            is_a_response:this.respond_to_a_message,
            id_message_responding:(this.respond_to_a_message)?this.id_message_responding_to:null,
            message_responding_to:(this.respond_to_a_message)?this.message_responding_to:null,
             list_of_users_who_saw:[this.current_user_id],
              list_of_users_in_the_group:(this.list_of_messages[this.list_of_messages.length-1])?this.list_of_messages[this.list_of_messages.length-1].list_of_users_in_the_group:[],
             is_an_attachment:true,
             size:this.attachments_size[i],
             is_from_server:false,
             status:"sent",
             is_a_group_chat:(this.friend_type=='user')?false:true,
           };
           this.index_of_show_pp_right=this.index_of_show_pp_right+1;
           this.list_of_show_pp_left.splice(0,0,false);
           this.list_of_messages_files.splice(0,0,this.attachments[i]);
           this.list_of_messages_pictures.splice(0,0,this.attachments[i]);
           this.list_of_messages_date.splice(0,0,this.date_of_message("time",1));
           this.list_of_messages.splice(0,0,(message));
         })
      }
      else{
        this.chatService.check_if_file_exists((this.friend_type=='user')?'user':'group',this.chat_friend_id,this.attachments_name[i],0).subscribe(r=>{
           let message ={
            id_user_name:this.current_user_pseudo,
             id_user:this.current_user_id,   
             id_receiver:this.friend_id,  
             id_chat_section:this.id_chat_section,
             message:null,
             attachment_name:r[0].value,
             attachment_type:"file_attachment",
             list_of_users_who_saw:[this.current_user_id],
              list_of_users_in_the_group:(this.list_of_messages[this.list_of_messages.length-1])?this.list_of_messages[this.list_of_messages.length-1].list_of_users_in_the_group:[],
             is_an_attachment:true,
             is_from_server:false,
             size:this.attachments_size[i],
             is_a_response:false,
             status:"sent",
             is_a_group_chat:(this.friend_type=='user')?false:true,
           };
           this.index_of_show_pp_right=this.index_of_show_pp_right+1;
           this.list_of_show_pp_left.splice(0,0,false);
           this.list_of_messages_files.splice(0,0,this.attachments[i]);
           this.list_of_messages_pictures.splice(0,0,this.attachments[i]);
           this.list_of_messages.splice(0,0,(message));
         })
      }
      this.cd.detectChanges();
    }
    if(this.compt_at==this.attachments_type.length){
      this.compt_at=0;
    }
    this.display_attachments=false;
    this.cd.detectChanges();
    
  }

  retry(i){
    let message=this.list_of_messages[i];
  }

  onFileClick(event) {
    event.target.value = '';
  }

/*************************************Partie gestion des spams***********************************/
/*************************************Partie gestion des spams***********************************/
/*************************************Partie gestion des spams***********************************/
/*************************************Partie gestion des spams***********************************/
/*************************************Partie gestion des spams***********************************/
  add_to_contacts(){
    this.chatService.let_all_friend_messages_to_seen(this.friend_id,this.id_chat_section,false).subscribe(r=>{
      this.chatService.add_spam_to_contacts(this.friend_id).subscribe(l=>{
        let message_one ={
          id_user_name:this.current_user_pseudo,
          chat_id:l[0].id,
          id_user:this.current_user_id,   
          id_receiver:this.friend_id,  
          list_of_users_who_saw:[this.current_user_id],
           list_of_users_in_the_group:(this.list_of_messages[this.list_of_messages.length-1])?this.list_of_messages[this.list_of_messages.length-1].list_of_users_in_the_group:[],
          message:"New",
          is_from_server:true,
          status:"sent",
          id_chat_section:1,
          attachment_name:"none",
          attachment_type:"none",
          is_an_attachment:false,
          is_a_group_chat:(this.friend_type=='user')?false:true,
          is_a_response:false,
        };
        this.chatService.messages.next(message_one);
      })
    });
    
   
  }


  /*************************************Partie gestion des messages***********************************/
/*************************************Partie gestion des messages***********************************/
/*************************************Partie gestion des messages***********************************/
/*************************************Partie gestion des messages***********************************/
/*************************************Partie gestion des messages***********************************/

  edit(index:any) {
    if(index>=0){
      let attachment_name = this.list_of_messages[index].attachment_name;
      const dialogRef = this.dialog.open(PopupEditPictureComponent, {
        data: {
          modify_chat_after:true,
          attachment_name:attachment_name,
          type:(this.list_of_messages[index].attachment_type=="picture_attachment")?"attachment":"message",
          friend_type:(this.friend_type=='user')?'user':'group',
          chat_friend_id:this.chat_friend_id
        },
        panelClass: "popupEditPictureClass",
      }).afterClosed().subscribe(result => {
        if(result){
          this.send_image(result,attachment_name);
        }
       
      });
    }
    else{
      let picture_blob=this.attachments_safe[0];
      const dialogRef = this.dialog.open(PopupEditPictureComponent, {
        data: {
          modify_chat_before:true,
          picture_blob:picture_blob,
          friend_type:(this.friend_type=='user')?'user':'group',
          chat_friend_id:this.chat_friend_id
        },
        panelClass: "popupEditPictureClass",
      }).afterClosed().subscribe(result => {
        let attachment_name=this.attachments_name[0];
        console.log("send image before")
        if(result){
          this.send_image(result,attachment_name);
        }
      });
    }
    
  }
  
  send_image(blob: Blob,attachment_name) {
    
      console.log("after " + attachment_name)
      this.chatService.check_if_file_exists_svg((this.friend_type=='user')?'user':'group',this.chat_friend_id,attachment_name).subscribe(r=>{
        let name=r[0].value ;
        this.chatService.chat_upload_svg(blob,name,(this.friend_type=='user')?'user':'group',this.chat_friend_id).subscribe(l=>{
          this.chatService.messages.next(message);
        })
        let message ={
          id_user_name:this.current_user_pseudo,
          id_user:this.current_user_id,   
          id_receiver:this.friend_id,  
          message:null,
          id_chat_section:this.id_chat_section,
          attachment_name:name,
          attachment_type:"picture_attachment",
          list_of_users_who_saw:[this.current_user_id],
          list_of_users_in_the_group:(this.list_of_messages[this.list_of_messages.length-1])?this.list_of_messages[this.list_of_messages.length-1].list_of_users_in_the_group:[],
          is_an_attachment:true,
          is_from_server:false,
          size:blob.size/1024/1024,
          is_a_response:false,
          status:"sent",
          is_a_group_chat:(this.friend_type=='user')?false:true,
        };
        this.index_of_show_pp_right=this.index_of_show_pp_right+1;
        this.list_of_show_pp_left.splice(0,0,false);
        var reader = new FileReader()
        let THIS=this;
        reader.readAsText(blob);
        reader.onload = function(this) {
            let blob = new Blob([reader.result], {type: 'image/svg+xml'});
            let url = (window.URL) ? window.URL.createObjectURL(blob) : (window as any).webkitURL.createObjectURL(blob);
            THIS.list_of_messages_files.splice(0,0,url);
            THIS.list_of_messages_pictures.splice(0,0,url);
            THIS.list_of_messages.splice(0,0,message);
            THIS.list_of_messages_date.splice(0,0,THIS.date_of_message("time",1));
        }
        this.attachments_safe=[];
        this.attachments_type=[];
        this.attachments_name=[];
        this.attachments_for_sql=[];
        this.attachments=[];
        this.compt_at=0;
        this.display_attachments=false;
        this.uploader.queue=[];  
        
      })
    
    
    
  }

  delete_message(i){
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Etes-vous sûr de vouloir supprimer le message ?'},
      panelClass: "popupConfirmationClass",
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        let ok_to_delete=true;
        let index=-1;
        
        for(let j=0;j<4;j++){
          if(this.list_of_messages[i+j] && this.list_of_messages[i+j].id_user==this.current_user_id && ok_to_delete){
            index=i+j;
            ok_to_delete=false;
          }
        }
        let is_an_attachment=this.list_of_messages[index].is_an_attachment;
        let attachment_type=this.list_of_messages[index].attachment_type;
        this.list_of_messages[index].status="deleted";
       
        let message_to_delete=this.list_of_messages[index]
        if(index==0){
          this.change_message_status.emit({id_chat_section:this.id_chat_section,status:"delete",friend_id:this.friend_id,friend_type:this.friend_type,spam:(this.spam=='false')?false:true,id_message:message_to_delete.id});
        }
        this.chatService.delete_message(message_to_delete.id).subscribe(r=>{
          
          
         if(is_an_attachment && (attachment_type=='picture_attachment' || attachment_type=='file_attachment')){
          this.reload_list_of_files_subject.next(true)
         }
          let message={
            id_user_name:this.current_user_pseudo,
            id_user:this.current_user_id,   
            id_receiver:this.friend_id, 
            id_message:message_to_delete.id,
            message:"delete_message",
            is_an_attachment:false,
            is_from_server:true,
            id_chat_section:this.id_chat_section,
            chat_section_name:this.list_of_chat_sections[this.list_of_chat_sections_id.indexOf(this.id_chat_section)],
            is_a_response:this.respond_to_a_message,
            id_message_responding:(this.respond_to_a_message)?this.id_message_responding_to:null,
            message_responding_to:(this.respond_to_a_message)?this.message_responding_to:null,
            status:"delete_message",
            is_a_group_chat:(this.friend_type=='user')?false:true,
          }
          this.chatService.messages.next(message);
          this.cd.detectChanges();
        })
      }
    })
    
    
  }

  calculate_dates_to_show(){
    for(let i=1;i<this.list_of_messages.length;i++){
      
      let d1=this.get_time_of_date(this.list_of_messages[this.list_of_messages.length- i].createdAt);
      let d2=this.get_time_of_date(this.list_of_messages[this.list_of_messages.length-1- i].createdAt);
      if(d2!=d1){
        this.list_of_messages[this.list_of_messages.length-1- i].date_shown=true;     
      }
      
    }
  }
  get_time_of_date(timestamp){
    let date=new Date();
    if(typeof(timestamp)=='string'){
      date=new Date(timestamp)
    }
    let day=String(date.getDate()).padStart(2, '0')
    let month=String(date.getMonth() + 1).padStart(2, '0');
    let year = date.getFullYear();
    return day+'/'+month+'/'+year;
   
    
  }

  show_date_of_timestamp(index){
    
    let item =this.list_of_messages[index];
    let timestamp=item.createdAt;
    let date=new Date(timestamp)
    let day=String(date.getDate()).padStart(2, '0')
    let dat_today=new Date();
    let today=String(dat_today.getDate()).padStart(2, '0')
    let time=new Date(timestamp).getTime()/1000;
    let time_now= new Date().getTime()/1000;
    if(!(time>0)){
      return "Aujourd'hui"
    }
    if(time_now-time>604800){
      return this.date_of_message(timestamp,0)
    }
    else if(time_now-time>86400){
      let date=new Date(timestamp);
      let day=String(date).substring(0,3);
      if(day=="Mon"){
        return("Lundi");
      }
      if(day=='Tue'){
        return"Mardi";
      }
      if(day=='Wed'){
        return"Mercredi";
      }
      if(day=='Thu'){
        return"Jeudi";
      }
      if(day=="Fri"){
        return"Vendredi";
      }
      if(day=='Thu'){
        return"Samedi";
      }
      if(day=='Thu'){
        return"Dimanche";
      }
      else{
        return day
      } 
    }
    else if(day!=today){
      return ("Hier")
    }
    else if(day==today){
      this.today_triggered=true;
      return ("Aujourd'hui")
    }
   
  }

  date_of_message(timestamp,index){
    
    if(index==0){
      let today=new Date(timestamp);
      let hour =String(today.getHours()).padStart(2, '0');
      let min =String(today.getMinutes()).padStart(2, '0');
      let day=String(today.getDate()).padStart(2, '0')
      let month=String(today.getMonth() + 1).padStart(2, '0');
      let year = today.getFullYear();
      if(timestamp.substring(5,7)=='01'){
        month="Janvier"
      }
      if(timestamp.substring(5,7)=='02'){
        month="Février"
      }
      if(timestamp.substring(5,7)=='03'){
        month="Mars"
      }
      if(timestamp.substring(5,7)=='04'){
        month="Avril"
      }
      if(timestamp.substring(5,7)=='05'){
        month="Mai"
      }
      if(timestamp.substring(5,7)=='06'){
        month="Juin"
      }
      if(timestamp.substring(5,7)=='07'){
        month="Juillet"
      }
      if(timestamp.substring(5,7)=='08'){
        month="Aout"
      }
      if(timestamp.substring(5,7)=='09'){
        month="Septembre"
      }
      if(timestamp.substring(5,7)=='10'){
        month="Octobre"
      }
      if(timestamp.substring(5,7)=='11'){
        month="Novembre"
      }
      if(timestamp.substring(5,7)=='12'){
        month="Décembre"
      }
      let date=day + ' ' + month + ' ' + year + ' à ' + hour + ":" +min;
      return date
    }
    else{
      let today = new Date();
      let hour = String(today.getHours()).padStart(2, '0');
      let min = String(today.getMinutes()).padStart(2, '0');
      let day = parseInt(String(today.getDate()).padStart(2, '0')).toString();
      let month = String(today.getMonth() + 1).padStart(2, '0'); 
      let year = today.getFullYear();
      if(month=='01'){
        month="Janvier"
      }
      if(month=='02'){
        month="Février"
      }
      if(month=='03'){
        month="Mars"
      }
      if(month=='04'){
        month="Avril"
      }
      if(month=='05'){
        month="Mai"
      }
      if(month=='06'){
        month="Juin"
      }
      if(month=='07'){
        month="Juillet"
      }
      if(month=='08'){
        month="Aout"
      }
      if(month=='09'){
        month="Septembre"
      }
      if(month=='10'){
        month="Octobre"
      }
      if(month=='11'){
        month="Novembre"
      }
      if(month=='12'){
        month="Décembre"
      }
      let date=day + ' ' + month + ' ' + year + ' à ' + hour + ':' + min;
      return date
    }
    
  }

  respond_to_a_message=false;
  message_responding_to='';
  id_message_responding_to=-1;
  id_user_message_responding_to=-1;
  respond_to_message(i){
    if(this.list_of_messages[i].is_an_attachment){
      this.message_responding_to="pièce jointe : " + this.list_of_messages[i].attachment_name;
    }
    else if(this.list_of_messages[i].message){
      this.message_responding_to=this.list_of_messages[i].message;
    }
    this.id_user_message_responding_to=this.list_of_messages[i].id_user;
    this.id_message_responding_to=this.list_of_messages[i].id
    this.respond_to_a_message=true;
  }

  cancel_response(){
    this.respond_to_a_message=false;
    this.id_message_responding_to=-1;
  }

  searched_message:number=-1;
  @ViewChildren('message_children') message_children: QueryList<ElementRef>;
  show_response(i){
    let id=this.list_of_messages[i].id_message_responding;
    for(let j=0;j<this.list_of_messages.length;j++){
      if(this.list_of_messages[j].id==id){
        let offset=this.message_children.toArray()[this.list_of_messages.length-1-j].nativeElement.offsetTop;
        this.myScrollContainer.nativeElement.scrollTop=offset;
        
      }
    }
  }

    /*************************************Partie gestion des emojis***********************************/
/*************************************Partie gestion des emojis***********************************/
/*************************************Partie gestion des emojis***********************************/
/*************************************Partie gestion des emojis***********************************/
/*************************************Partie gestion des emojis***********************************/

selectedEmoji:any;
load_emoji=false;
show_emojis=false;
emojis_already_loaded=false;
emojis_button_clicked=false;
set = 'native';
native = true;
@ViewChild('emojis') emojis:ElementRef;
@ViewChild('emojisSpinner') emojisSpinner:ElementRef;
@ViewChild('emoji_button') emoji_button:ElementRef;



emojis_list=["+1","smiley","heart_eyes","joy","open_mouth","cry","-1","face_with_rolling_eyes","rage"]
emojis_size_list=[30,30,30,30,30,30,30,30,30];
list_show_reactions:any[]=[];
handleClick($event) {
  let data = this.message_group.get('message');
  if(data.value){
    data.patchValue(data.value + $event.emoji.native);
    
  }
  else{
    data.patchValue($event.emoji.native);
  }
  this.check_message_for_phone()
  this.cd.detectChanges();
}

open_emojis(){

  if( this.emojis_button_clicked == true ) {
    return;
  }

  this.emojis_button_clicked = true;
  if( !this.show_emojis ) {
    this.renderer.setStyle(this.emojisSpinner.nativeElement, 'visibility', 'visible');
  }
  else {
    this.renderer.setStyle(this.emojisSpinner.nativeElement, 'visibility', 'hidden');
  }

  this.load_emoji=true;
  
  if( !this.emojis_already_loaded ) {
    let THIS = this;
    setTimeout(function () {
      if( !THIS.show_emojis ) {
        THIS.show_emojis=true;
        THIS.cd.detectChanges();
        THIS.renderer.setStyle(THIS.emojis.nativeElement, 'visibility', 'visible');
      }
      else {
        THIS.renderer.setStyle(THIS.emojis.nativeElement, 'visibility', 'hidden');
        THIS.show_emojis=false;
        THIS.cd.detectChanges();
      }
      THIS.emojis_already_loaded = true;
      THIS.emojis_button_clicked = false;
    }, 2000);
  }
  else {
    if( !this.show_emojis ) {
      this.show_emojis=true;
      this.cd.detectChanges();
      this.renderer.setStyle(this.emojis.nativeElement, 'visibility', 'visible');
    }
    else {
      this.renderer.setStyle(this.emojis.nativeElement, 'visibility', 'hidden');
      this.show_emojis=false;
      this.cd.detectChanges();
    }
    this.emojis_button_clicked = false;
  }
}



reaction_click($event,i) {
  this.selectedEmoji = $event.emoji;
  if(this.friend_type=='group'){
    this.chatService.get_my_emojis_reactions_for_msg_group(this.list_of_messages[i].id_receiver,this.list_of_messages[i].id).subscribe(r=>{
      if(!r[0].message){
        if(r[0].emoji_reaction==$event.emoji.id){
          this.chatService.delete_emoji_reaction(r[0].id,"user",true).subscribe(l=>{
            let index= this.list_of_messages_reactions[this.list_of_messages[i].id].indexOf($event.emoji.id)
            this.list_of_messages_reactions[this.list_of_messages[i].id].splice(index,1)
          })
        }
        else{
          this.chatService.add_emoji_reaction(r[0].id,$event.emoji.id,"update",true).subscribe(l=>{
            let index= this.list_of_messages_reactions[this.list_of_messages[i].id].indexOf(r[0].emoji_reaction)
            this.list_of_messages_reactions[this.list_of_messages[i].id].splice(index,1,$event.emoji.id)
          })
        }
      }
      else{
        this.chatService.add_emoji_reaction(this.list_of_messages[i].id,$event.emoji.id,"create",true).subscribe(l=>{
          if(this.list_of_messages_reactions[this.list_of_messages[i].id]){
            this.list_of_messages_reactions[this.list_of_messages[i].id].push($event.emoji.id);
          }
          else{
            this.list_of_messages_reactions[this.list_of_messages[i].id]=[($event.emoji.id)];
          }
        })
      }
      let message={
        id_user_name:this.current_user_pseudo,
        id_user:this.current_user_id,   
        id_receiver:this.friend_id,  
        old_emoji:(!r[0].message)?r[0].emoji_reaction:null,
        new_emoji:$event.emoji.id,
        id_message:this.list_of_messages[i].id,
        message:"emoji",
        is_an_attachment:false,
        is_from_server:true,
        id_chat_section:this.id_chat_section,
        chat_section_name:this.list_of_chat_sections[this.list_of_chat_sections_id.indexOf(this.id_chat_section)],
        is_a_response:this.respond_to_a_message,
        id_message_responding:(this.respond_to_a_message)?this.id_message_responding_to:null,
        message_responding_to:(this.respond_to_a_message)?this.message_responding_to:null,
        status:"emoji",
        is_a_group_chat:true,
      }
      this.chatService.messages.next(message);
      this.cd.detectChanges();
    })

  }
  else{
    let message={
      id_user_name:this.current_user_pseudo,
      id_user:this.current_user_id,   
      id_receiver:this.friend_id, 
      type_of_user:"user",
      id_message:this.list_of_messages[i].id,
      old_emoji:null,
      new_emoji:null,
      message:"emoji",
      is_an_attachment:false,
      is_from_server:true,
      id_chat_section:this.id_chat_section,
      chat_section_name:this.list_of_chat_sections[this.list_of_chat_sections_id.indexOf(this.id_chat_section)],
      is_a_response:this.respond_to_a_message,
      id_message_responding:(this.respond_to_a_message)?this.id_message_responding_to:null,
      message_responding_to:(this.respond_to_a_message)?this.message_responding_to:null,
      status:"emoji",
      is_a_group_chat:false,
    }
    if(this.list_of_messages[i].id_user==this.current_user_id){
      if(this.list_of_messages[i].emoji_reaction_user==$event.emoji.id){
        this.chatService.delete_emoji_reaction(this.list_of_messages[i].id,"user",false).subscribe(r=>{
          this.list_of_messages[i].emoji_reaction_user=null;
        })
        message.old_emoji=$event.emoji.id;
        message.new_emoji=$event.emoji.id;
      }
      else{
        this.chatService.add_emoji_reaction(this.list_of_messages[i].id,$event.emoji.id,"user",false).subscribe(r=>{
          this.list_of_messages[i].emoji_reaction_user=$event.emoji.id;
        })
        message.old_emoji=this.list_of_messages[i].emoji_reaction_user;
        message.new_emoji=$event.emoji.id;
      }

    }
    else{
      if(this.list_of_messages[i].emoji_reaction_receiver==$event.emoji.id){
        this.chatService.delete_emoji_reaction(this.list_of_messages[i].id,"receiver",false).subscribe(r=>{
          this.list_of_messages[i].emoji_reaction_receiver=null;
        })
        message.old_emoji=$event.emoji.id;
        message.new_emoji=$event.emoji.id;
        message.type_of_user="receiver";
      }
      else{
        this.chatService.add_emoji_reaction(this.list_of_messages[i].id,$event.emoji.id,"receiver",false).subscribe(r=>{
          this.list_of_messages[i].emoji_reaction_receiver=$event.emoji.id;
        })
        message.old_emoji=this.list_of_messages[i].emoji_reaction_receiver;
        message.new_emoji=$event.emoji.id;
        message.type_of_user="receiver";
      }
    }
    this.chatService.messages.next(message);
    this.cd.detectChanges();
  }
  
 
}

index_of_children_reactions=0;
reactions_shown=false;
target_clicked:any;
show_reactions(i,event ){
  this.target_clicked=event.target
  this.list_show_reactions[i]=true;
  this.reactions_shown=true;
  this.index_of_children_reactions=i;
}


get_number_of_same_emoji(id_message,emoji){
  let num=0;
  for(let i=0;i<this.list_of_messages_reactions[id_message].length;i++){
    if(this.list_of_messages_reactions[id_message][i]==emoji){
      num+=1;
    }
  }
  return num;
}
/*************************************Partie gestion des chat_section***********************************/
/*************************************Partie gestion des chat_section***********************************/
/*************************************Partie gestion des chat_section***********************************/
/*************************************Partie gestion des chat_section***********************************/

top_pp_is_loaded(){
  this.top_pp_loaded=true;
}

list_of_chat_sections:any[]=["Discussion principale"];
list_of_chat_sections_id:any[]=[1];
list_of_chat_sections_notifications:any[]=[];
show_notification_message=false;
number_of_sections_unseen=0;
top_pp_loaded=false;
put_top_visible=false;
nothing_selected=true;
today_triggered=false;


changed_section(e:any) {
  this.function_done=false;
  this.nothing_selected=false;
  this.trigger_no_more=false;
  this.today_triggered=false;
  this.chat_section_to_open=e.value;

  if(e.value!=''){
    let index =this.list_of_chat_sections.indexOf(e.value)
    this.id_chat_section=this.list_of_chat_sections_id[index];
    this.change_section.emit({id_chat_section:this.id_chat_section});
    
    this.get_messages(this.id_chat_section,(this.friend_type=='user')?false:true);
    this.list_of_chat_sections_notifications[index]=false;
    let compt=0;
    for(let i=0;i<this.list_of_chat_sections_notifications.length;i++){
      if(this.list_of_chat_sections_notifications[i]){
        compt+=1;
      }
     
    }
    if(compt>0){
      this.show_notification_message=true;
      this.number_of_sections_unseen=compt;
    }
    else{
      this.show_notification_message=false;
      this.number_of_sections_unseen=0;
    }
    this.cd.detectChanges();
  }
  else{
    this.id_chat_section=1;
    this.change_section.emit({id_chat_section:this.id_chat_section});
    this.get_messages(this.id_chat_section,(this.friend_type=='user')?false:true);
    this.list_of_chat_sections_notifications[0]=false;
    let compt=0;
    for(let i=0;i<this.list_of_chat_sections_notifications.length;i++){
      if(this.list_of_chat_sections_notifications[i]){
        compt+=1;
      }
    }
    if(compt>0){
      this.show_notification_message=true;
      this.number_of_sections_unseen=compt;
    }
    else{
      this.show_notification_message=false;
      this.number_of_sections_unseen=0;
    }
    this.cd.detectChanges();
  }
  this.cancel_response();
  this.attachments_type=[];
  this.attachments_name=[];
  this.attachments_for_sql=[];
  this.attachments=[];
  this.attachments_safe=[];
  this.cd.detectChanges();

  this.right_container_is_opened = false;

}


activate_add_chat_section=false;
add_chat_section(){
  this.activate_add_chat_section=true;
}



adding_chat_section_name=false;
add_chat_section_name(e: any){
  
  if(this.adding_chat_section_name){
    return
  }
  this.adding_chat_section_name=true;
  let name= e;
  
  this.chatService.add_chat_section(name,this.friend_id,(this.friend_type=='user')?false:true).subscribe(r=>{
    if(r[0].is_ok){
      let message_one ={
        id_user_name:this.current_user_pseudo,
        id_user:this.current_user_id,   
        id_receiver:this.friend_id,  
        message:"new_section",
        list_of_users_who_saw:[this.current_user_id],
        user_name:this.current_user_name,
        group_name:this.friend_name,
        list_of_users_in_the_group:this.list_of_messages[this.list_of_messages.length-1].list_of_users_in_the_group?this.list_of_messages[this.list_of_messages.length-1].list_of_users_in_the_group:[],
        is_from_server:true,
        status:"sent",
        id_chat_section:r[0].id_chat_section,
        attachment_name:"none",
        attachment_type:"none",
        is_a_response:false,
        is_an_attachment:false,
        is_a_group_chat:true,
      };
      this.chatService.messages.next(message_one);
      this.list_of_chat_sections.push(name);
      let ind =this.list_of_chat_sections.length-1;
      let compt =0
      for(let i=1;i<this.list_of_chat_sections.length;i++){
        if(name <this.list_of_chat_sections[i] && compt==0){
          this.list_of_chat_sections.splice(i,0,this.list_of_chat_sections.splice(ind,1)[0]);
          compt+=1;
        }
      }
      let indice=this.list_of_chat_sections.indexOf(name);
      this.list_of_chat_sections_id.splice(indice,0,r[0].id_chat_section);
      this.list_of_chat_sections_notifications.splice(indice,0,false);
      this.activate_add_chat_section=false;
      this.adding_chat_section_name=true;

      this.cd.detectChanges();
    }
    else{
      if(r[0].cause=="already"){
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Cette discussion existe déjà.'},
          panelClass: "popupConfirmationClass",
        });
      }
      else{
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Vous ne pouvez pas crééer plus de 15 discussions.'},
          panelClass: "popupConfirmationClass",
        });
      }
      
    }
    this.adding_chat_section_name=false;
  })
}


cancel_add_section(){
  this.activate_add_chat_section=false;
}


deleting_chat_section=false;
delete_chat_section(){
  if(this.deleting_chat_section){
    return
  }
  
  if(this.id_chat_section==1){
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:false, text:'Vous ne pouvez pas supprimer la discussion principale'},
      panelClass: "popupConfirmationClass",
    });
  }
  else{
    
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Etes-vous sûr de vouloir supprimer la discussion ? Cette action entrainera la perte définitive des messages concernés.'},
      panelClass: "popupConfirmationClass",
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.deleting_chat_section=true;
        this.chatService.delete_chat_section(this.id_chat_section,this.friend_id,(this.friend_type=='user')?false:true).subscribe(r=>{
          if(r[0].is_ok){
            //location.reload();
            this.deleting_chat_section=false;
            this.router.navigateByUrl('/chat');
          }
          else{
            const dialogRef = this.dialog.open(PopupConfirmationComponent, {
              data: {showChoice:false, text:"Vous ne pouvez pas supprimer une discussion dont vous n'êtes pas le créateur."},
              panelClass: "popupConfirmationClass",
            });
            this.deleting_chat_section=false;
          }
        })
      }
    })
  }
}

compteur_chat_section=0;
get_chat_sections(){
  
  this.chatService.get_chat_sections(this.friend_id,(this.friend_type=='user')?false:true,this.compteur_get_messages).subscribe(m=>{
    let l=m[0];
    if(this.compteur_get_messages==m[1]){
      if(l[0][0]){
        let compt =0;
        for(let i=0;i<l[0].length;i++){
          this.list_of_chat_sections[i+1]=(l[0][i].chat_section_name);
          this.list_of_chat_sections_id[i+1]=(l[0][i].id_chat_section);
          if(this.id_chat_section==l[0][i].id_chat_section && compt==0){
            this.chat_section_to_open=l[0][i].chat_section_name;
            compt+=1;
          } 
        }

        if(compt==0){
          this.chat_section_to_open="Discussion principale";
        }
        let compt_sections=0;
        for(let j=0;j<this.list_of_chat_sections.length;j++){
          this.chatService.get_notifications_section(this.list_of_chat_sections_id[j],this.friend_id,(this.friend_type=='user')?false:true).subscribe(r=>{
            if(this.compteur_get_messages==m[1]){
              if(this.list_of_chat_sections_id[j]==1 ){
                if( this.chat_section_to_open!="Discussion principale"){
                  this.list_of_chat_sections_notifications[j]=r[0].value;
                }
              }
              else{
                this.list_of_chat_sections_notifications[j]=r[0].value;
              }
              
              compt_sections++;
              if(compt_sections==this.list_of_chat_sections.length){
                let compt_unseen=0;
                for(let k=0;k<this.list_of_chat_sections_notifications.length;k++){
                  if(this.list_of_chat_sections_notifications[k]){
                    compt_unseen+=1;
                  }
                  if(k==this.list_of_chat_sections_notifications.length-1){
                    if(compt_unseen>0){
                      this.show_notification_message=true;
                      this.number_of_sections_unseen=compt_unseen;
                    }
                    else{
                      this.show_notification_message=false;
                      this.number_of_sections_unseen=0;
                    }
                  }
                }
                if(this.compteur_chat_section>0){
                  this.activate_add_chat_section=false;
                  this.cd.detectChanges();
                }
                this.compteur_chat_section+=1;
              }
            }
            
          })
        }
          
        
      }
      else{
        this.chat_section_to_open="Discussion principale";
        this.cd.detectChanges();
        this.activate_add_chat_section=false;
        this.compteur_chat_section+=1;
      }
    }
    
  })
}

list_of_chat_sections_found:any[]=[];
list_of_chat_sections_found_id:any[]=[];


open_section_found(i){
  this.nothing_selected=false;
  this.trigger_no_more=false;
  this.chat_section_to_open=this.list_of_chat_sections_found[i];
  let index =this.list_of_chat_sections_id.indexOf(this.list_of_chat_sections_found_id[i])
  this.id_chat_section=this.list_of_chat_sections_found_id[i];
  this.change_section.emit({id_chat_section:this.id_chat_section});
  this.list_of_chat_sections_notifications[index]=false;
  let compt=0;
  for(let i=0;i<this.list_of_chat_sections_notifications.length;i++){
    if(this.list_of_chat_sections_notifications[i]){
      compt+=1;
    }
    if(i==this.list_of_chat_sections_notifications.length-1){
      if(compt>0){
        this.show_notification_message=true;
        this.number_of_sections_unseen=compt;
      }
      else{
        this.show_notification_message=false;
        this.number_of_sections_unseen=0;
      }
     
      this.cd.detectChanges();
      $('.chat-section').attr("placeholder",this.chat_section_to_open);
      this.get_messages(this.id_chat_section,(this.friend_type=='user')?false:true);
      
      
    }
  }
}

/*************************************Partie gestion de la recherche de messages***********************************/
/*************************************Partie gestion de la recherche de messages***********************************/
/*************************************Partie gestion de la recherche de messages***********************************/
/*************************************Partie gestion de la recherche de messages***********************************/
initiateSearch(){
  this.number_click_top=1;
  this.number_of_messages_found=0;
  this.list_of_messages_found_complete=[];
  this.index_of_messages_found=[];
  this.list_of_messages_found=[];
  this.list_of_messages_around=[];
}


number_click_top:number=1;
number_of_messages_found:number=0;
message_researched:string;
show_research_results=false;
list_of_messages_found_complete:any[]=[];
index_of_messages_found:any[]=[];
list_of_messages_found:any[]=[];
list_of_messages_around:any[]=[];
current_list_of_messages:any[];
current_list_of_show_pp_left:any[];
current_index_of_show_pp_right:number;
current_compteur_pp:number;
current_list_of_messages_date:any[];
current_list_of_messages_pictures:any[];
current_list_of_messages_files:any[];

on_keydown_research(s){
  this.current_list_of_messages=this.list_of_messages;
  this.current_list_of_show_pp_left=this.list_of_show_pp_left;
  this.current_index_of_show_pp_right=this.index_of_show_pp_right;
  this.current_compteur_pp=this.compteur_pp;
  this.current_list_of_messages_date=this.list_of_messages_date;
  this.current_list_of_messages_pictures=this.list_of_messages_pictures;
  this.current_list_of_messages_files=this.list_of_messages_files;
  
  this.chatService.get_messages_from_research( s,this.id_chat_section,this.friend_id,this.friend_type).subscribe(l=>{
    this.list_of_messages_found_complete=l[0];
    this.number_of_messages_found=l[0].length;
    this.message_researched= s;
    if(l[0].length>0){
      let second_compt=0;
      for(let i=0;i<l[0].length;i++){
        let match=false;
        for(let j=0;j<this.list_of_messages.length;j++){
          if(l[0][i].message==this.list_of_messages[j].message && l[0][i].createdAt==this.list_of_messages[j].createdAt ){
            this.list_of_messages_found.push(true);
            this.index_of_messages_found.push(j);
            match=true;
            second_compt+=1;
            if(second_compt==l[0].length){
              this.show_research_results=true;
              if(this.list_of_messages_found[0]){
                this.first_message_is_loaded();
              }
              else{
                this.first_message_isnt_loaded();
              }
            }
          }
          else if(j==this.list_of_messages.length-1 && !match){
              this.chatService.get_messages_around(l[0][i].id,this.id_chat_section,this.friend_id,this.friend_type).subscribe(r=>{
                this.list_of_messages_around[i]=r[0].list_of_messages_to_send;
                second_compt+=1;
                if(second_compt==l[0].length){
                  this.show_research_results=true;
                  if(this.list_of_messages_found[0]){
                    this.first_message_is_loaded();
                  }
                  else{
                    this.first_message_isnt_loaded();
                  }
                }
              })
          }
        }
      }
    }
    else{
      this.show_research_results=true;
    }
  })
}

first_message_is_loaded(){
  let ind= this.list_of_messages.length-1-this.index_of_messages_found[0];
  this.searched_message = ind;
  let offset=this.message_children.toArray()[ind].nativeElement.offsetTop;
  this.myScrollContainer.nativeElement.scrollTop=offset-100 ;
}

first_message_isnt_loaded(){
  this.list_of_messages_pictures=[];
  this.list_of_messages_files=[];
  this.compteur_image_research=0;
  this.compteur_loaded_research=0;
  this.list_of_show_pp_left=[];
  this.index_of_show_pp_right=-1;
  this.compteur_pp=0;
  this.put_messages_visible=false;
  this.show_less_results=true;
  this.list_of_messages_date=[];
  this.list_of_messages=this.list_of_messages_around[this.number_click_top-1];
  for(let i=0;i<this.list_of_messages.length;i++){
    this.list_of_messages_date.push(this.date_of_message(this.list_of_messages[i].createdAt,0));
    if(this.list_of_messages[i].is_an_attachment){
      this.compteur_image_research+=1;
      
      this.get_picture_for_message(i);
    }
    if(this.friend_type=='user'){
      this.sort_pp(i);
      if(this.compteur_pp==0 && this.compteur_image_research==0){
        this.put_messages_visible=true;
      }
    }
    else{
      if(this.compteur_image_research==0){
        this.put_messages_visible=true;
      }
    }
  }
  this.cd.detectChanges();
  for(let i=0;i<this.list_of_messages.length;i++){
    if(this.list_of_messages[i].id==this.list_of_messages_found_complete[this.number_click_top-1].id){
      let ind= this.list_of_messages.length-1-i;
      this.searched_message = ind;
      let offset=this.message_children.toArray()[ind].nativeElement.offsetTop;
      this.myScrollContainer.nativeElement.scrollTop=offset-100 ;
    }
  }
}


compteur_image_research=0;
//show_more_or_less=false;
show_less_results=false;
show_next_message_researched(){
  if(this.number_click_top<this.number_of_messages_found){
    this.number_click_top+=1;
    if(this.list_of_messages_found[this.number_click_top-1]){
      let ind= this.list_of_messages.length-1-this.index_of_messages_found[this.number_click_top-1];
      this.searched_message = ind;
      let offset=this.message_children.toArray()[ind].nativeElement.offsetTop;
      this.myScrollContainer.nativeElement.scrollTop=offset-100 ;
    }
    else{
      this.show_less_results=true;
      this.list_of_messages_pictures=[];
      this.list_of_messages_files=[];
      this.compteur_image_research=0;
      this.compteur_loaded_research=0;
      this.list_of_show_pp_left=[];
      this.index_of_show_pp_right=-1;
      this.compteur_pp=0;
      this.put_messages_visible=false;
      this.list_of_messages_date=[];
      this.list_of_messages=this.list_of_messages_around[this.number_click_top-1];
      for(let i=0;i<this.list_of_messages.length;i++){
        this.list_of_messages_date.push(this.date_of_message(this.list_of_messages[i].createdAt,0));
        if(this.list_of_messages[i].is_an_attachment){
          this.compteur_image_research+=1;
          this.get_picture_for_message(i);
        }
        if(this.friend_type=='user'){
          this.sort_pp(i);
          if(this.compteur_pp==0 && this.compteur_image_research==0){
            this.put_messages_visible=true;
          }
        }
        else{
          if(this.compteur_image_research==0){
            this.put_messages_visible=true;
          }
        }
      }
      this.cd.detectChanges();
      for(let i=0;i<this.list_of_messages.length;i++){
        if(this.list_of_messages[i].id==this.list_of_messages_found_complete[this.number_click_top-1].id){
          let ind= this.list_of_messages.length-1-i;
          this.searched_message = ind;
          let offset=this.message_children.toArray()[ind].nativeElement.offsetTop;
          this.myScrollContainer.nativeElement.scrollTop=offset-100;
        }
      }
    }
  }
}

show_precedent_message_researched(){
  if(this.number_click_top>1){
    this.number_click_top-=1;
    if(this.list_of_messages_found[this.number_click_top-1]){
      this.show_less_results=false;
      if(this.current_list_of_messages==this.list_of_messages){
        let ind= this.list_of_messages.length-1-this.index_of_messages_found[this.number_click_top-1];
        this.searched_message = ind;
        let offset=this.message_children.toArray()[ind].nativeElement.offsetTop;
        this.myScrollContainer.nativeElement.scrollTop=offset-100 ;
      }
      else{
        this.put_messages_visible=false;
        this.list_of_messages=this.current_list_of_messages;
        this.list_of_show_pp_left=this.current_list_of_show_pp_left;
        this.index_of_show_pp_right=this.current_index_of_show_pp_right;
        this.compteur_pp=this.current_compteur_pp;
        this.list_of_messages_date=this.current_list_of_messages_date;
        this.list_of_messages_pictures=this.current_list_of_messages_pictures;
        this.list_of_messages_files=this.current_list_of_messages_files;
        this.cd.detectChanges();
        let ind= this.list_of_messages.length-1-this.index_of_messages_found[this.number_click_top-1];
        this.searched_message = ind;
        let offset=this.message_children.toArray()[ind].nativeElement.offsetTop;
        this.myScrollContainer.nativeElement.scrollTop=offset-100 ;
      }
      
    }
    else{
      //this.show_more_or_less=true;
      this.list_of_messages_pictures=[];
      this.list_of_messages_files=[];
      this.compteur_image_research=0;
      this.compteur_loaded_research=0;
      this.list_of_show_pp_left=[];
      this.index_of_show_pp_right=-1;
      this.compteur_pp=0;
      this.put_messages_visible=false;
      this.list_of_messages_date=[];
      this.list_of_messages=this.list_of_messages_around[this.number_click_top-1];
      for(let i=0;i<this.list_of_messages.length;i++){
        this.list_of_messages_date.push(this.date_of_message(this.list_of_messages[i].createdAt,0));
        if(this.list_of_messages[i].is_an_attachment){
          this.compteur_image_research+=1;
          this.get_picture_for_message(i);
        }
        if(this.friend_type=='user'){
          this.sort_pp(i);
          if(this.compteur_pp==0 && this.compteur_image_research==0){
            this.put_messages_visible=true;
          }
        }
        else{
          if(this.compteur_image_research==0){
            this.put_messages_visible=true;
          }
        }
        
      }
      this.cd.detectChanges();
      for(let i=0;i<this.list_of_messages.length;i++){
        if(this.list_of_messages[i].id==this.list_of_messages_found_complete[this.number_click_top-1].id){
          let ind= this.list_of_messages.length-1-i;
          this.searched_message = ind;
          let offset=this.message_children.toArray()[ind].nativeElement.offsetTop;
          this.myScrollContainer.nativeElement.scrollTop=offset-100 ;
        }
      }
    }

  }
  
  
}

sort_pp(i){
  if(i==0 && this.list_of_messages[i].id_user==this.friend_id ){
    this.list_of_show_pp_left[i]=true;
    this.compteur_pp+=1;
    
  }
  if(this.list_of_messages[i].id_user==this.current_user_id && this.list_of_messages[i].status=="seen" && this.index_of_show_pp_right<0){
    this.index_of_show_pp_right=i;
    this.compteur_pp+=1;
  }
  if(i>0){  
    if(this.list_of_messages[i].id_user==this.friend_id && this.list_of_messages[i].id_user!=this.list_of_messages[i-1].id_user){
      this.list_of_show_pp_left[i]=true;
      this.compteur_pp+=1;
    }
  }
}

get_picture_for_message(i){
    if(this.list_of_messages[i].attachment_type=='picture_message'){
      this.chatService.get_picture_sent_by_msg(this.list_of_messages[i].attachment_name).subscribe(t=>{
        let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.list_of_messages_pictures[i]=url;
      })
    }
    else if(this.list_of_messages[i].attachment_type=='picture_attachment'){
      this.chatService.get_attachment(this.list_of_messages[i].attachment_name,(this.friend_type=='user')?'user':'group',this.chat_friend_id).subscribe(t=>{
        let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.list_of_messages_pictures[i]=url;
      })
    }
    else if(this.list_of_messages[i].attachment_type=='file_attachment'){
      this.chatService.get_attachment(this.list_of_messages[i].attachment_name,(this.friend_type=='user')?'user':'group',this.chat_friend_id).subscribe(t=>{
        let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.list_of_messages_files[i]=SafeURL;
        //this.loaded_image(i);
      })
    }
}
cancel_show_research_results() {

  this.search_popup_closed = true;
  this.show_research_results=false;
  this.searched_message = -1;
  this.get_messages(this.id_chat_section,(this.friend_type=='user')?false:true);
  this.cd.detectChanges();
}

show_spinner_for_more=false;
show_spinner_for_less=false;
trigger_no_more=false;

see_more_messages(){

    this.show_spinner_for_more=true;
    this.searched_message = -1;

    this.chatService.get_other_messages_more(this.friend_id,this.list_of_messages[this.list_of_messages.length-1].id,this.id_chat_section,this.friend_type).subscribe(r=>{
      if(r[0][0]){
        let num=this.list_of_messages.length;
        for(let i=0;i<r[0].length;i++){
          this.list_of_messages.push(r[0][i]);
          this.list_of_messages_date.push(this.date_of_message(r[0][i].createdAt,0));
          this.get_picture_for_message(num-1+i);
          if(this.friend_type=='user'){
            this.sort_pp(num-1+i);
          }
          if(i==r[0].length-1){
            
            this.cd.detectChanges();
            let offset=this.message_children.toArray()[r[0].length].nativeElement.offsetTop;
            let height =this.message_children.toArray()[r[0].length].nativeElement.getBoundingClientRect().height
            this.myScrollContainer.nativeElement.scrollTop=offset-height-100;

            for(let j=0;j<this.list_of_messages.length;j++){
              if(this.list_of_messages[j].id==this.list_of_messages_found_complete[this.number_click_top-1].id){
                let ind= this.list_of_messages.length-1-j;
                this.searched_message = ind;
              }
              if(j==this.list_of_messages.length-1){
                this.show_spinner_for_more=false;
              }
            }

          }
        }
      }
      else{
        this.show_spinner_for_more=false;
        this.trigger_no_more=true;
      }
    });
}

see_less_messages(){
  
  this.show_spinner_for_less=true;
  this.searched_message = -1;
  
  this.chatService.get_less_messages(this.friend_id,this.list_of_messages[0].id,this.list_of_messages[this.list_of_messages.length-1].id,this.id_chat_section,this.friend_type).subscribe(r=>{
    if(r[0]){
      this.searched_message = -1;
      this.put_messages_visible=false;
      let num =this.list_of_messages.length;
      this.list_of_messages=[];
      this.list_of_messages_pictures=[];
      this.list_of_messages_files=[];
      this.compteur_image_research=0;
      this.compteur_loaded_research=0;
      this.list_of_show_pp_left=[];
      this.index_of_show_pp_right=-1;
      this.compteur_pp=0;
      this.list_of_messages_date=[];
      for(let i=0;i<r[0].length;i++){
        this.list_of_messages.push(r[0][i]);
        this.list_of_messages_date.push(this.date_of_message(r[0][i].createdAt,0));
        if(this.list_of_messages[i].is_an_attachment){
          this.compteur_image_research+=1;
          this.get_picture_for_message(i);
        }
        if(this.friend_type=='user'){
          this.sort_pp(i);
          if(this.compteur_pp==0 && this.compteur_image_research==0){
            this.put_messages_visible=true;
          }
        }
        else{
          if(this.compteur_image_research==0){
            this.put_messages_visible=true;
          }
        }
        if(i==r[0].length-1){
          this.cd.detectChanges();
          let offset=this.message_children.toArray()[num].nativeElement.offsetTop;
          let height =this.message_children.toArray()[num].nativeElement.getBoundingClientRect().height
          this.myScrollContainer.nativeElement.scrollTop=offset-height-100;

          for(let j=0;j<this.list_of_messages.length;j++){
            if(this.list_of_messages[j].id==this.list_of_messages_found_complete[this.number_click_top-1].id){
              let ind= this.list_of_messages.length-1-j;
              this.searched_message = ind;
            }
            if(j==this.list_of_messages.length-1){
              this.show_spinner_for_less=false;
            }
          }

        }
      }
    }
    else{
      this.show_spinner_for_less=false;
      this.show_less_results=false;
    }
  });
}

/**************************************** */
/**************************************** */
/**FONCTIONS MOKHTAR */
/**************************************** */
/**************************************** */


show_icon=false;



/*********************************************  GROUP FUNCTIONS ******************************/
/*********************************************  GROUP FUNCTIONS ******************************/
/*********************************************  GROUP FUNCTIONS ******************************/
/*********************************************  GROUP FUNCTIONS ******************************/
/*********************************************  GROUP FUNCTIONS ******************************/
/*********************************************  GROUP FUNCTIONS ******************************/
/*********************************************  GROUP FUNCTIONS ******************************/


/*********************************************  OPTIONS TOP CONTAINER ******************************/
/*********************************************   OPTIONS TOP CONTAINER  ******************************/
/*********************************************   OPTIONS TOP CONTAINER  ******************************/

change_profile_picture() {
  const dialogRef = this.dialog.open(PopupFormComponent, {
    data: {type:"edit_chat_profile_picture",id_receiver:this.friend_id},
    panelClass: 'popupUploadPictureClass',
  })

}

add_a_friend() {
  this.add_a_friend_to_the_group.emit({friend_id:this.friend_id});
}


exit_group(){

  const dialogRef = this.dialog.open(PopupConfirmationComponent, {
    data: {showChoice:true, text:'Etes-vous sûr de vouloir quitter le groupe ?'},
    panelClass: "popupConfirmationClass",
  });

  dialogRef.afterClosed().subscribe(result => {
    if(result){
      this.chatService.exit_group(this.friend_id).subscribe(r=>{
        let message_one ={
          id_user_name:this.current_user_pseudo,
          id_user:this.current_user_id,   
          id_receiver:this.friend_id,  
          message:"Exit",
          user_name:this.current_user_name,
          is_from_server:true,
          is_a_response:false,
          list_of_users_who_saw:[this.current_user_id],
          list_of_users_in_the_group:r[0].list_of_receivers_ids,
          status:"sent",
          id_chat_section:1,
          attachment_name:"none",
          attachment_type:"none",
          is_an_attachment:false,
          is_a_group_chat:true,
        };
        this.chatService.messages.next(message_one);
        location.reload();
      })
    }
  })
}


displaying_members_of_the_group=false;

display_members_of_the_group(){

  if(this.displaying_members_of_the_group){
    return
  }
  this.displaying_members_of_the_group=true;
  this.chatService.get_group_chat_information(this.friend_id).subscribe(p=>{
    let list_of_ids=p[0].list_of_receivers_ids;
    let list_of_pseudos=[];
    let list_of_names=[];
    let list_of_pictures=[]
    let compt=0
    for(let i=0;i<list_of_ids.length;i++){
      let pp_retrieved=false;
      let data_retrieved=false;
      this.Profile_Edition_Service.retrieve_profile_data(list_of_ids[i]).subscribe(l=>{
        list_of_pseudos[i]=l[0].nickname;
        list_of_names[i]=l[0].firstname + ' ' + l[0].lastname;
        data_retrieved=true;
        check_all(this)
      })

      this.Profile_Edition_Service.retrieve_profile_picture(list_of_ids[i] ).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        list_of_pictures[i] = SafeURL;
        pp_retrieved=true;
        check_all(this)
      });

      function check_all(THIS){
        if(pp_retrieved && data_retrieved){
          compt++;
          if(compt==list_of_ids.length){
            const dialogRef = THIS.dialog.open(PopupChatGroupMembersComponent, {
              data: {is_for_emojis:false,list_of_ids:list_of_ids,list_of_pseudos:list_of_pseudos,list_of_names:list_of_names,list_of_pictures:list_of_pictures},
              panelClass:"popupChatGroupMembersClass"
            });
            THIS.displaying_members_of_the_group=false;
          }
        }
      }
    }
  })
  
}


emojis_loading:boolean=false;
see_emoji_reaction_by_user(id_message){

  if(this.emojis_loading){
    return
  }
  this.emojis_loading=true;
  this.chatService.get_reactions_by_user(id_message).subscribe(r=>{
    let list_of_ids=[];
    let list_of_emojis={};
    let list_of_pseudos=[];
    let list_of_names=[];
    let list_of_pictures=[]
    let compt=0
    if(r[0].length>0){
      for(let i=0;i<r[0].length;i++){
        list_of_ids[i]=r[0][i].id_user;
        list_of_emojis[r[0][i].id_user]=r[0][i].emoji_reaction;
        let data_retrieved=false;
        let pp_retrieved=false;
        this.Profile_Edition_Service.retrieve_profile_data(r[0][i].id_user).subscribe(l=>{
          list_of_pseudos[i]=l[0].nickname;
          list_of_names[i]=l[0].firstname + ' ' + l[0].lastname;
          data_retrieved=true;
          check_all(this)
        })
        this.Profile_Edition_Service.retrieve_profile_picture(r[0][i].id_user).subscribe(t=> {
          let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
          const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
          list_of_pictures[i] = SafeURL;
          pp_retrieved=true;
          check_all(this)
        });
  
        function check_all(THIS){
          if(pp_retrieved && data_retrieved){
            compt++;
            if(compt==r[0].length){
              const dialogRef = THIS.dialog.open(PopupChatGroupMembersComponent, {
                data: {is_for_emojis:true,list_of_emojis:list_of_emojis,list_of_ids:list_of_ids,list_of_pseudos:list_of_pseudos,list_of_names:list_of_names,list_of_pictures:list_of_pictures},
                panelClass:"popupChatGroupMembersClass"
              });
              THIS.emojis_loading=false;
            }
          }
        }
      }
    }
    else{
      this.emojis_loading=false;
    }
   
  })
  

}



/*********************************************  GROUP MESSAGES MANAGMENT ******************************/
/*********************************************  GROUP MESSAGES MANAGMENT ******************************/
/*********************************************  GROUP MESSAGES MANAGMENT  ******************************/


has_user_saw_something_else_after(id,index){
  if(index>0){
    let value =false;
    for(let i=0;i<index;i++){
      if( !this.list_of_messages[i].is_from_server && this.list_of_messages[i].list_of_users_who_saw.indexOf(id)>=0){
        value=true;
      }
    }
    return value;
  }
  else{
    return false
  }
  
}



/*********************************************  CHAT CONSTRUCTOR FUNCTION ******************************/
/*********************************************  CHAT CONSTRUCTOR FUNCTION ******************************/
/*********************************************  CHAT CONSTRUCTOR FUNCTION ******************************/
/*********************************************  CHAT CONSTRUCTOR FUNCTION ******************************/

chat_service_managment_function(msg){
  if(msg[0].for_notifications){
    this.navbar.add_notification_from_chat(msg);
  }
  else{
    //a person sends a message
    if(msg[0].id_user!="server" && !msg[0].is_from_server){
      if(msg[0].is_a_group_chat){
        //currently in the group talking to my friends
        if(msg[0].id_user==this.friend_id && msg[0].status!='seen' && this.friend_type=='group'){
          this.new_sort_friends_list.emit({friend_id:msg[0].id_user,message:msg[0],friend_type:'group'});
          let message=msg[0];

          //add message to list
          if(msg[0].attachment_type=="picture_message"){
              this.chatService.get_picture_sent_by_msg(msg[0].attachment_name).subscribe(r=>{
                let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.list_of_messages_pictures.splice(0,0,url);
                this.list_of_messages.splice(0,0,message);
                this.list_of_messages_files.splice(0,0,false)
                if(this.list_of_messages.length==1){
                  this.display_messages=true;
                }
              })
          }
          else if(msg[0].attachment_type=="picture_attachment" ){
            this.chatService.get_group_chat_as_friend(msg[0].id_user).subscribe(m=>{
              let chat_friend_id=m[0].id
              this.chatService.get_attachment(msg[0].attachment_name,'group',chat_friend_id).subscribe(r=>{
                let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.list_of_messages_pictures.splice(0,0,url)
                
                this.list_of_messages.splice(0,0,message);
                this.list_of_messages_files.splice(0,0,false)
                if(this.list_of_messages.length==1){
                  this.display_messages=true;
                }
              })
            })
            this.reload_list_of_files_subject.next(true)
          }
          else if(msg[0].attachment_type=="file_attachment" ){
            this.chatService.get_group_chat_as_friend(msg[0].id_user).subscribe(m=>{
              let chat_friend_id=m[0].id
              this.chatService.get_attachment(msg[0].attachment_name,'group',chat_friend_id).subscribe(r=>{
                let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.list_of_messages_files.splice(0,0,SafeURL)
                this.list_of_messages.splice(0,0,message);
                this.list_of_messages_pictures.splice(0,0,false);
                if(this.list_of_messages.length==1){
                  this.display_messages=true;
                }
              })
            })
            this.reload_list_of_files_subject.next(true)
          }
          else{
            this.list_of_messages.splice(0,0,message);
            this.list_of_messages_pictures.splice(0,0,false)
            this.list_of_messages_files.splice(0,0,false);
            if(this.list_of_messages.length==1){
              this.display_messages=true;
            }
          }
          message.id_user=msg[0].real_id_user;
          
          // tell the friend I read his message if I am present;
          if(this.user_present && msg[0].id_chat_section==this.id_chat_section){
            let message_to_send ={
              id_user_name:this.current_user_pseudo,
              id_user:this.current_user_id,   
              id_receiver:this.friend_id, 
              message:msg[0].message,
              is_from_server:false,
              status:'seen',
              id_chat_section:this.id_chat_section,
              attachment_name:"none",
              is_an_attachment:false,
              attachment_type:"none",
              is_a_group_chat:true,
              is_a_response:false,
            }
            //function to update status rows to 'seen'
            this.chatService.messages.next(message_to_send);
            this.chatService.let_all_friend_messages_to_seen(msg[0].id_user,this.id_chat_section,true).subscribe(l=>{ 

            })
            
          }
          else if( msg[0].id_chat_section!=this.id_chat_section){
          
            this.show_notification_message=true;
            this.number_of_sections_unseen+=1;
            let ind=this.list_of_chat_sections_id.indexOf(msg[0].id_chat_section);
            this.list_of_chat_sections_notifications[ind]=true;
            this.cd.detectChanges();
          }

            
        }
        // a message from your friend to tell you that he has seen the message
        else if(msg[0].id_receiver==this.friend_id && msg[0].status=='seen' && this.friend_type=='group'){
          for(let i=0;i<this.list_of_messages.length;i++){
            //on rajoute l'utilisateur qui a vu les messages dans la liste des utilisateur qui ont vu les messages
            if(this.list_of_messages[i].list_of_users_who_saw.indexOf(msg[0].id_user)<0 && this.list_of_messages[i].id_user!=msg[0].id_user && this.list_of_messages[i].id){
              this.list_of_messages[i].list_of_users_who_saw.push(msg[0].id_user);
              if(this.list_of_messages[i].list_of_users_who_saw.length== this.list_of_messages[i].list_of_users_in_the_group.length){
                this.list_of_messages[i].status=='seen';
              }
            }
          }
          this.change_message_status.emit({id_chat_section:msg[0].id_chat_section,status:"seen",friend_id:msg[0].id_receiver,friend_type:'group',spam:false,real_friend_id:msg[0].id_user});
          this.cd.detectChanges();
        }
        else if(msg[0].id_receiver!=this.friend_id && msg[0].status=="seen"){
          this.change_message_status.emit({id_chat_section:msg[0].id_chat_section,status:"seen",friend_id:msg[0].id_receiver,friend_type:'group',spam:false,real_friend_id:msg[0].id_user});
        }
        else{
          this.new_sort_friends_list.emit({friend_id:msg[0].id_user,message:msg[0],friend_type:'group'});
        }
      }
      else{
        //a person I am currently talking to
        if(msg[0].id_user==this.friend_id && msg[0].status!='seen'  && this.friend_type=='user'){
          //if it isnt a message to himmself
          if(msg[0].id_user!=msg[0].id_receiver && msg[0].id_chat_section==this.id_chat_section){
            this.new_sort_friends_list.emit({friend_id:msg[0].id_user,message:msg[0],friend_type:'user'});
            let message = msg[0];
            this.response_exist=true;
            //add message to list
            if(msg[0].attachment_type=="picture_message"){
              this.chatService.get_picture_sent_by_msg(msg[0].attachment_name).subscribe(r=>{
                let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.list_of_messages_pictures.splice(0,0,url)
                this.list_of_messages.splice(0,0,message);
                this.list_of_messages_files.splice(0,0,false)
                if(this.list_of_messages.length>1){
                  // on décale les photos de profiles selon le dernier message
                  if(this.list_of_messages[0].id_user==this.friend_id){
                    this.list_of_show_pp_left[0]=false;
                    this.index_of_show_pp_right+=1;
                    this.list_of_show_pp_left.splice(0,0,true);
                  }
                  else{
                    this.index_of_show_pp_right-=1;
                    this.list_of_show_pp_left.splice(0,0,true);
                  }
                }
                else if(this.list_of_messages.length==1){
                  this.list_of_show_pp_left.push(true);
                  this.display_messages=true;
                }
              })
            }
            else if(msg[0].attachment_type=="picture_attachment" ){
              this.chatService.get_chat_friend(msg[0].id_user,false).subscribe(m=>{
                let chat_friend_id=m[0].id
                this.chatService.get_attachment(msg[0].attachment_name,'user',chat_friend_id).subscribe(r=>{
                  let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
                  const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                  this.list_of_messages_pictures.splice(0,0,url)
                  this.list_of_messages.splice(0,0,message);
                  this.list_of_messages_files.splice(0,0,false)
                  if(this.list_of_messages.length>1){
                    // on décale les photos de profiles selon le dernier message
                    if(this.list_of_messages[0].id_user==this.friend_id){
                      this.list_of_show_pp_left[0]=false;
                      this.index_of_show_pp_right+=1;
                      this.list_of_show_pp_left.splice(0,0,true);
                    }
                    else{
                      this.index_of_show_pp_right-=1;
                      this.list_of_show_pp_left.splice(0,0,true);
                    }
                  }
                  else if(this.list_of_messages.length==1){
                    this.list_of_show_pp_left.push(true);
                    this.display_messages=true;
                  }
                })
              })
              this.reload_list_of_files_subject.next(true)
            }
            else if(msg[0].attachment_type=="file_attachment" ){
              
              this.chatService.get_chat_friend(msg[0].id_user,false).subscribe(m=>{
                let chat_friend_id=m[0].id
                this.chatService.get_attachment(msg[0].attachment_name,'false',chat_friend_id).subscribe(r=>{
                  let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
                  const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                  this.list_of_messages_files.splice(0,0,SafeURL)
                  this.list_of_messages.splice(0,0,message);
                  this.list_of_messages_pictures.splice(0,0,false);
                  if(this.list_of_messages.length>1){
                    // on décale les photos de profiles selon le dernier message
                    if(this.list_of_messages[0].id_user==this.friend_id){
                      this.list_of_show_pp_left[0]=false;
                      this.index_of_show_pp_right+=1;
                      this.list_of_show_pp_left.splice(0,0,true);
                    }
                    else{
                      this.index_of_show_pp_right-=1;
                      this.list_of_show_pp_left.splice(0,0,true);
                    }
                  }
                  else if(this.list_of_messages.length==1){
                    this.list_of_show_pp_left.push(true);
                    this.display_messages=true;
                  }
                })
              })
              this.reload_list_of_files_subject.next(true)
            }
            else{
              this.list_of_messages_files.splice(0,0,false)
              this.list_of_messages.splice(0,0,message);
              this.list_of_messages_pictures.splice(0,0,false);
              if(this.list_of_messages.length>1){
                // on décale les photos de profiles selon le dernier message
                if(this.list_of_messages[0].id_user==this.friend_id){
                  this.list_of_show_pp_left[0]=false;
                  this.index_of_show_pp_right+=1;
                  this.list_of_show_pp_left.splice(0,0,true);
                }
                else{
                  this.index_of_show_pp_right-=1;
                  this.list_of_show_pp_left.splice(0,0,true);
                }
              }
              else if(this.list_of_messages.length==1){
                this.list_of_show_pp_left.push(true);
                this.display_messages=true;
              }
            }

            // tell the friend I read his message if I am present;
            if(this.user_present && msg[0].id_chat_section==this.id_chat_section){
              message.status='seen';
              let message_to_send ={
                id_user_name:this.current_user_pseudo,
                id_user:this.current_user_id,   
                id_receiver:this.friend_id, 
                message:msg[0].message,
                is_from_server:false,
                status:'seen',
                id_chat_section:this.id_chat_section,
                attachment_name:"none",
                is_an_attachment:false,
                attachment_type:"none",
                is_a_group_chat:false,
                is_a_response:false,
              }
              //function to update status rows to 'seen'
                this.chatService.messages.next(message_to_send);
                this.chatService.let_all_friend_messages_to_seen(msg[0].id_user,this.id_chat_section,false).subscribe(l=>{ 
                })
              
            }

            
          }
          else if(msg[0].id_user!=msg[0].id_receiver && msg[0].id_chat_section!=this.id_chat_section){
            this.new_sort_friends_list.emit({friend_id:msg[0].id_user,message:msg[0],id_chat_section:this.id_chat_section,friend_type:'user'});
            this.show_notification_message=true;
            this.number_of_sections_unseen+=1;
            let ind=this.list_of_chat_sections_id.indexOf(msg[0].id_chat_section);
            this.list_of_chat_sections_notifications[ind]=true;
            this.cd.detectChanges();
          }
        }
        // a message from your friend to tell you that he has seen the message
        else if(msg[0].id_user==this.friend_id && msg[0].status=="seen"){
          let modif_done=false;
          let index=0;
          for(let i=0;i<this.list_of_messages.length;i++){
            if(this.list_of_messages[i].status=='received' && this.list_of_messages[i].id_user==this.current_user_id && this.list_of_messages[i].id){
                this.list_of_messages[i].status='seen';
                if(!modif_done){
                  index=i;
                  modif_done=true;
                }
            }
            if(i==this.list_of_messages.length-1){
              this.index_of_show_pp_right=index;
              
            }
          }
          this.change_message_status.emit({id_chat_section:msg[0].id_chat_section,status:"seen",friend_id:msg[0].id_user,friend_type:'user'});
          this.cd.detectChanges();
        }
        // not the friend I am talking to but seen
        else if(msg[0].id_user!=this.friend_id && msg[0].status=="seen"){
          this.change_message_status.emit({id_chat_section:msg[0].id_chat_section,status:"seen",friend_id:msg[0].id_user,friend_type:'user'});
        }
        // not the friend I am talking to and not seen
        else{
          this.new_sort_friends_list.emit({friend_id:msg[0].id_user,message:msg[0],friend_type:'user'});
        }
      }
      
    }
    else if(msg[0].server_message=="received_new"){
      if(msg[0].message.is_a_group_chat){
        if(!this.user_present){
          if(this.friend_type=='group' && this.friend_id==msg[0].id_receiver){
            this.change_group();
          }
        }
      }
      else{
        if(this.spam=='true'){
          this.add_spam_to_contacts.emit({spam_id:msg[0].message.id_receiver,message:msg[0].message});
          this.cd.detectChanges;
        }
        else{
          this.new_sort_friends_list.emit({friend_id:msg[0].message.id_receiver,message:msg[0].message,friend_type:'user'});
        }
      }
    }
    //a message from the server to tell that the message has been sent
    else if(msg[0].server_message=="received" ){
      console.log("received message")
      console.log(msg[0])
      //ajouter une fonction pour récupérer le message qui n'a pas été envoyé sur ce client
      if(this.user_present){
        if(msg[0].message.is_a_group_chat){
          if(msg[0].message.attachment_type=="picture_message" ||msg[0].message.attachment_type=="picture_attachment" ||msg[0].message.attachment_type=="file_attachment" ){
            // on ne peut pas envoyer plus de 5 images en même temps dans un message
            for(let i=0;i<((this.list_of_messages.length>=50)?50:this.list_of_messages.length);i++){
              if(this.list_of_messages[i].attachment_name==msg[0].message.attachment_name && !(this.list_of_messages[i].id)){
                this.list_of_messages[i].status="received";
                this.list_of_messages[i].id=msg[0].id_message;
                this.cd.detectChanges();
              }
            }
            if(msg[0].message.attachment_type=="picture_attachment" ||msg[0].message.attachment_type=="file_attachment" ){
              this.reload_list_of_files_subject.next(true)
            }
          }
          else{
            for(let i=0;i<((this.list_of_messages.length>=50)?50:this.list_of_messages.length);i++){
              if(this.list_of_messages[i].temporary_id==msg[0].message.temporary_id  && !(this.list_of_messages[i].id)){
                this.list_of_messages[i].status="received";
                this.list_of_messages[i].id=msg[0].id_message;
                this.cd.detectChanges();
              }
            }
          }
          
          this.new_sort_friends_list.emit({friend_id:this.friend_id,message:msg[0].message,friend_type:'group'});
          this.list_of_time.pop();
        }
        else{
          if(msg[0].message.id_user!=msg[0].message.id_receiver){
            if(msg[0].message.attachment_type=="picture_message" ||msg[0].message.attachment_type=="picture_attachment" ||msg[0].message.attachment_type=="file_attachment" ){
              // on ne peut pas envoyer plus de 5 images en même temps dans un message
              for(let i=0;i<((this.list_of_messages.length>=50)?50:this.list_of_messages.length);i++){
                if(this.list_of_messages[i].attachment_name==msg[0].message.attachment_name && !(this.list_of_messages[i].id)){
                  this.list_of_messages[i].status="received";
                  this.list_of_messages[i].id=msg[0].id_message;
                  this.cd.detectChanges();
                }
              }
              if(msg[0].message.attachment_type=="picture_attachment" ||msg[0].message.attachment_type=="file_attachment" ){
                this.reload_list_of_files_subject.next(true)
              }
            }
            else{
              let length=((this.list_of_messages.length>=50)?50:this.list_of_messages.length)
              for(let i=0;i<length;i++){
                if(this.list_of_messages[i].temporary_id==msg[0].message.temporary_id && !(this.list_of_messages[i].id)){
                  this.list_of_messages[i].status="received";
                  this.list_of_messages[i].id=msg[0].id_message;
                  this.cd.detectChanges();
                }
              }
            }
          }
          else{
            if(msg[0].message.attachment_type=="picture_message" ||msg[0].message.attachment_type=="picture_attachment" ||msg[0].message.attachment_type=="file_attachment" ){
              // on ne peut pas envoyer plus de 5 images en même temps dans un message
              for(let i=0;i<((this.list_of_messages.length>=50)?50:this.list_of_messages.length);i++){
                if(this.list_of_messages[i].attachment_name==msg[0].message.attachment_name && this.list_of_messages[i].status!="deleted"){
                  this.list_of_messages[i].status="seen";
                }
              }
              if(msg[0].message.attachment_type=="picture_attachment" ||msg[0].message.attachment_type=="file_attachment" ){
                this.reload_list_of_files_subject.next(true)
              }
            }
            else{
              for(let i=0;i<((this.list_of_messages.length>=50)?50:this.list_of_messages.length);i++){
                if(this.list_of_messages[i].message==msg[0].message.message && this.list_of_messages[i].status!="deleted"){
                  this.list_of_messages[i].status="seen";
                }
              }
            }
            this.chatService.let_all_friend_messages_to_seen(msg[0].message.id_user,this.id_chat_section,false).subscribe(l=>{ 
            })
          }
          this.new_sort_friends_list.emit({friend_id:msg[0].id_receiver,message:msg[0].message,friend_type:'user'});
          this.list_of_time.pop();
        }
      }
      else{
        if(msg[0].message.is_a_group_chat){
          this.new_sort_friends_list.emit({friend_id:msg[0].id_receiver,message:msg[0].message,friend_type:'group'});
          if(this.friend_type=='group' && this.friend_id==msg[0].id_receiver){
            this.change_group();
          }
          
        }
        else{
          this.new_sort_friends_list.emit({friend_id:msg[0].id_receiver,message:msg[0].message,friend_type:'user'});
          if(this.friend_type=='user' && this.friend_id==msg[0].id_receiver){
            this.change_user();
          }
        }
      }
      
      
    }
    else if(msg[0].message=="New"){
      if(msg[0].is_a_group_chat ){
        this.add_group_to_contacts.emit({friend_id:msg[0].id_receiver,message:msg[0]});
        this.cd.detectChanges;
      }
      else{
        if(this.spam=='true'){
          this.add_spam_to_contacts.emit({spam_id:msg[0].id_user,message:msg[0]});
          this.cd.detectChanges;
        }
        else{
          this.new_sort_friends_list.emit({friend_id:msg[0].id_user,message:msg[0],friend_type:'user'});
        }
      }
    }
    else if(msg[0].server_message=="received_new_friend_in_the_group"){
      if(this.user_present){
        this.list_of_messages.splice(0,0,msg[0].message);
        if(this.friend_type=='group' && this.friend_id==msg[0].id_receiver){
          for(let i=0;i<this.list_of_messages.length;i++){
            this.list_of_messages[i].list_of_users_in_the_group=msg[0].list_of_users_in_the_group;
          }
        }
      
      }
      else if(this.friend_type=='group' && this.friend_id==msg[0].id_receiver){
        this.change_group();
      }
    }
    else if(msg[0].message=="New_friend_in_the_group"){
      let index=-1;
      for(let i=0;i<this.list_of_friends_ids.length;i++){
        if(this.list_of_friends_ids[i]==msg[0].id_user && this.list_of_friends_types[i]=='group'){
          index=i;
        }
      }
      if(index>=0){
        if(this.friend_id==msg[0].id_user && this.friend_type=='group'){
          this.list_of_messages.splice(0,0,msg[0]);
        }
      }
      this.new_sort_friends_list.emit({friend_id:msg[0].id_user,message:msg[0],friend_type:'group',value:false});
      this.cd.detectChanges;
      
    }
    else if(msg[0].message=="Exit"){
      if(msg[0].is_a_group_chat){
        if(this.friend_id==msg[0].id_user && this.friend_type=='group'){
          this.list_of_messages.splice(0,0,msg[0]);
          for(let i=0;i<this.list_of_messages.length;i++){
            this.list_of_messages[i].list_of_users_in_the_group=msg[0].list_of_users_in_the_group;
          }
        }
        this.display_exit.emit({friend_id:msg[0].id_user,message:msg[0]});
        this.cd.detectChanges;
      }
    }
    else if(msg[0].server_message=="writing" ){
      if(!msg[0].group_chat_id && this.friend_id==msg[0].id_user_writing && this.friend_type=="user"){
        this.display_writing=true;
        this.section_where_is_writing=msg[0].message;
        this.cd.detectChanges();
      }
      else if(msg[0].group_chat_id && this.friend_id==msg[0].group_chat_id && this.current_user_id!=msg[0].id_user_writing && this.friend_type=="group"){
        this.display_writing=true;
        this.section_where_is_writing=msg[0].message;
        
        if(this.list_of_users_writing.indexOf(msg[0].id_user_writing)<0){
          this.list_of_users_writing.push(msg[0].id_user_writing)
        }
        this.cd.detectChanges();
      }
      
    }
    else if(msg[0].server_message=="not-writing" ){
      if(!msg[0].group_chat_id && this.friend_id==msg[0].id_user_writing && this.friend_type=="user"){
        this.display_writing=false;
        this.cd.detectChanges();
      }
      else if(msg[0].group_chat_id && this.friend_id==msg[0].group_chat_id && this.current_user_id!=msg[0].id_user_writing && this.friend_type=="group"){
        this.display_writing=false;
        let index=this.list_of_users_writing.indexOf(msg[0].id_user_writing);
        if(index>=0){
          this.list_of_users_writing.splice(index,1)
        }
        this.cd.detectChanges();
      }
    }
    else if(msg[0].server_message=="delete_message" ){
      let index_mesage=-1;
      if(!msg[0].group_chat_id && this.friend_id==msg[0].id_user_writing && this.id_chat_section==msg[0].message.id_chat_section && this.friend_type=="user"){
        for(let i=0;i<((this.list_of_messages.length>=50)?50:this.list_of_messages.length);i++){
          if(this.list_of_messages[i].id==msg[0].id_message){
            index_mesage=i;
            this.list_of_messages[i].status="deleted";
          }
        }
       
      }
      else if(msg[0].group_chat_id && this.friend_id==msg[0].group_chat_id && this.current_user_id!=msg[0].id_user_writing && this.id_chat_section==msg[0].message.id_chat_section && this.friend_type=="group"){
        for(let i=0;i<((this.list_of_messages.length>=50)?50:this.list_of_messages.length);i++){
          if(this.list_of_messages[i].id==msg[0].id_message){
            index_mesage=i;
            this.list_of_messages[i].status="deleted";
          }
        }
      }
      if(index_mesage==0){
        this.change_message_status.emit({id_chat_section:msg[0].message.id_chat_section,status:"delete",friend_id:this.friend_id,friend_type:this.friend_type,spam:(this.spam=='false')?false:true,id_message:msg[0].id_message});
      }
     
      this.cd.detectChanges
    }
    else if(msg[0].server_message=="block" ){
      if(this.friend_type=='user' && this.friend_id==msg[0].id_user_blocking){
        location.reload();
      }
      this.blocking_managment.emit({friend_id:msg[0].id_user_blocking})
    }
    else if(msg[0].server_message=="emoji" ){
      if(!msg[0].group_chat_id && this.friend_id==msg[0].real_id_user &&  msg[0].message.id_message>=this.list_of_messages[this.list_of_messages.length-1].id){
        for(let i=0;i<this.list_of_messages.length;i++){
          if(this.list_of_messages[i].id==msg[0].message.id_message){
            if(msg[0].message.type_of_user=='user'){
              if(msg[0].message.old_emoji==msg[0].message.new_emoji){
                this.list_of_messages[i].emoji_reaction_user=null;
              }
              else{
                this.list_of_messages[i].emoji_reaction_user=msg[0].message.new_emoji;
              }
            }
            else{
              {
                if(msg[0].message.old_emoji==msg[0].message.new_emoji){
                  this.list_of_messages[i].emoji_reaction_receiver=null;
                }
                else{
                  this.list_of_messages[i].emoji_reaction_receiver=msg[0].message.new_emoji;
                }
              }
            }
          }
        }
        this.cd.detectChanges();
      }
      else if(msg[0].group_chat_id && this.friend_id==msg[0].group_chat_id && msg[0].id_message>=this.list_of_messages[this.list_of_messages.length-1].id){
        if(msg[0].message.old_emoji){
          if(msg[0].message.old_emoji==msg[0].message.new_emoji){
              let index= this.list_of_messages_reactions[msg[0].id_message].indexOf(msg[0].message.old_emoji)
              this.list_of_messages_reactions[msg[0].id_message].splice(index,1)
          }
          else{
              let index= this.list_of_messages_reactions[msg[0].id_message].indexOf(msg[0].message.old_emoji)
              this.list_of_messages_reactions[msg[0].id_message].splice(index,1,msg[0].message.new_emoji)
              this.list_of_messages_reactions[msg[0].id_message].sort();
          }
        }
        else{
            if(this.list_of_messages_reactions[msg[0].id_message]){
              this.list_of_messages_reactions[msg[0].id_message].push(msg[0].message.new_emoji);
            }
            else{
              this.list_of_messages_reactions[msg[0].id_message]=[msg[0].message.new_emoji];
            }
            
            this.list_of_messages_reactions[this.list_of_messages[msg[0].id_message].id].sort();
        }
      }
    }
    
    
  }
}



/*************************************************** BLOCK AND OTHER OPTIONS  *******************/
/*************************************************** BLOCK AND OTHER OPTIONS  *******************/
/*************************************************** BLOCK AND OTHER OPTIONS  *******************/
/*************************************************** BLOCK AND OTHER OPTIONS  *******************/


removing_spam=false;
remove_spam(){
  if(this.removing_spam){
    return
  }
  if(this.friend_id>2){
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Etes-vous sûr de supprimer la conversation ?'},
      panelClass: "popupConfirmationClass",
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.removing_spam=true;
        this.chatService.remove_spam(this.friend_id).subscribe(m=>{
          if(m[0].nothing){
            const dialogRef = this.dialog.open(PopupConfirmationComponent, {
              data: {showChoice:false, text:"Il n'y a rien à supprimer..."},
              panelClass: "popupConfirmationClass",
            });
          }
          else{
            this.router.navigateByUrl('/chat');
          }
          
          this.removing_spam=false;
        })
        
      }
    })
  }
}



block_user(){
  if(!(this.friend_id<=3 && this.friend_type=="user")){
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Etes-vous sûr de vouloir bloquer cet utilisateur ?'},
      panelClass: "popupConfirmationClass",
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if(result){
          this.Subscribing_service.remove_all_subscribtions_both_sides(this.friend_id).subscribe(s=>{
            this.chatService.remove_friend(this.friend_id).subscribe(m=>{
              this.Profile_Edition_Service.block_user(this.friend_id,(m[0].deletion)?m[0].date:null).subscribe(r=>{
               
                let message_to_send ={
                  id_user_name:this.current_user_pseudo,
                  id_user:this.current_user_id,   
                  id_receiver:this.friend_id, 
                  message:"block",
                  is_from_server:true,
                  status:'block',
                  id_chat_section:this.id_chat_section,
                  attachment_name:"none",
                  is_an_attachment:false,
                  attachment_type:"none",
                  is_a_group_chat:false,
                  is_a_response:false,
                }
                this.chatService.messages.next(message_to_send);
                this.router.navigateByUrl('/chat');
              })
            })
          });
        
      }
    })
  }
 
}



unblock_user(){
  this.Profile_Edition_Service.unblock_user(this.friend_id).subscribe(r=>{
    if(r[0].date){
      this.chatService.add_chat_friend(this.friend_id,r[0].date).subscribe(r=>{
        this.router.navigateByUrl('/chat');
      })
    }
    else{
      this.router.navigateByUrl('/chat');
    }
    
  })
}


remove_contact(){
  if(!(this.friend_id<=3 && this.friend_type=="user")){
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Etes-vous sûr de vouloir retirer cet utilisateur de votre liste de contacts ? '},
      panelClass: "popupConfirmationClass",
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.chatService.remove_friend(this.friend_id).subscribe(r=>{
          this.router.navigateByUrl('/chat');
        })
      }
    })
  }
  
}
  /********************************************* SHOW IMAGES *****************************************/
  /********************************************* SHOW IMAGES *****************************************/
  /********************************************* SHOW IMAGES *****************************************/

  show_images(indice){
    let list =this.list_of_messages_pictures
    let new_list=[];
    let new_list_types=[];
    let new_indice;
    let len=list.length;
    for(let i=0;i<len;i++){
      if(list[i] && (this.list_of_messages[i].attachment_type=='picture_attachment' || this.list_of_messages[i].attachment_type=='picture_message')){
        if(i==indice){
          new_indice=new_list.length;
        }
        new_list.push(this.list_of_messages[i].attachment_name);
        new_list_types.push(this.list_of_messages[i].attachment_type);
      }
    }
    const dialogRef = this.dialog.open(PopupAdPicturesComponent, {
      data: {
        for_chat:true,
        list_of_pictures:new_list,
        list_of_types:new_list_types,
        index_of_picture:new_indice,
        friend_type:(this.friend_type=='user')?'user':'group',
        chat_friend_id:this.chat_friend_id
      },      
      panelClass:"popupDocumentClass",

    });
  }
  

  open_friend_link() {
    
    return "/account/" + this.friend_pseudo;
  }

  set_not_using_chat(){
    this.navbar.set_not_using_chat();
  }

  search_popup_closed:boolean = true;
  search_in_conv() {

    if( !this.search_popup_closed ) {
      return;
    }
    this.search_popup_closed = false;
    this.initiateSearch();

    const dialogRef = this.dialog.open(PopupChatSearchComponent, {
      data: {},
      panelClass: "popupChatSearchClass"
    }).afterClosed().subscribe(result => {

      if(result) {
        this.on_keydown_research(result);
        this.cd.detectChanges();
      }
      else {
        this.search_popup_closed = true;
        this.cd.detectChanges();
      }

    });
    
  }

  myMessageOpenedOptions:number = -1;
  myMessageOptionsClosed() {
    this.myMessageOpenedOptions = -1;
  }
  myMessageOptionsOpened(i:number) {
    this.myMessageOpenedOptions = i;
  }

  friendMessageOpenedOptions:number = -1;
  friendMessageOptionsClosed() {
    this.friendMessageOpenedOptions = -1;
  }
  friendMessageOptionsOpened(i:number) {
    this.friendMessageOpenedOptions = i;
  }

  get_list_of_view_names(i: number) {

    if( this.list_of_messages[this.list_of_messages.length- 1 - i].list_of_users_who_saw.length == this.list_of_messages[this.list_of_messages.length- 1 - i].list_of_users_in_the_group.length && this.list_of_messages.length-1==i ) {
      return "Vu par tous";
    }
    else {
      let return_something:boolean = false;
      let s = "Vu par :";
      for( let j=0; j < this.list_of_messages[this.list_of_messages.length- 1 - i].list_of_users_who_saw.length; j++ ) {
        if( this.list_of_messages[this.list_of_messages.length- 1 - i].list_of_users_who_saw[j]!=this.current_user_id && !this.has_user_saw_something_else_after(this.list_of_messages[this.list_of_messages.length- 1 - i].list_of_users_who_saw[j],this.list_of_messages.length- i-1) ) {
          s = s + "\n" + this.list_of_users_names[ this.list_of_messages[this.list_of_messages.length- 1 - i].list_of_users_who_saw[j] ];
          return_something = true;
        }
      }
      if( return_something ) {
        return s;
      }
      else {
        return null;
      }
    }
  }

  get_list_of_view_names_friend(i: number) {
    if( this.list_of_messages[this.list_of_messages.length- 1 - i].list_of_users_who_saw.length == this.list_of_messages[this.list_of_messages.length- 1 - i].list_of_users_in_the_group.length && this.list_of_messages.length-1==i ) {
      return "Vu par tous";
    }
    else {
      let return_something:boolean = false;
      let s = "Vu par :";
      for( let j=0; j < this.list_of_messages[this.list_of_messages.length- 1 - i].list_of_users_who_saw.length; j++ ) {

        if( this.list_of_messages[this.list_of_messages.length- 1 - i].list_of_users_who_saw[j]!=this.current_user_id && !this.has_user_saw_something_else_after(this.list_of_messages[this.list_of_messages.length- 1 - i].list_of_users_who_saw[j],this.list_of_messages.length- i-1) ) {
          s = s + "\n" + this.list_of_users_names[ this.list_of_messages[this.list_of_messages.length- 1 - i].list_of_users_who_saw[j] ];
          return_something = true;
        }

      }
      if( return_something ) {
        return s;
      }
      else {
        return null;
      }
    }
  }

  right_container_is_opened:boolean=false;
  change_right_container() {
    this.right_container_is_opened = !this.right_container_is_opened;

    this.cd.detectChanges();
    this.update_middle_container_height();
  }

  width:number;
    

  can_show_send_icon=false;
  show_send_icon=false;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.update_middle_container_height();
    if( window.innerWidth<850 ) {
      this.can_show_send_icon=true;
    }
    else{
      this.can_show_send_icon=false;
    }
  }

  

@ViewChild("middleContainer", {read: ElementRef, static:false}) middleContainer:ElementRef;
@ViewChild("bottomContainer", {read: ElementRef, static:false}) bottomContainer:ElementRef;
update_middle_container_height() {
  if( this.middleContainer.nativeElement && this.bottomContainer.nativeElement ) {
    this.renderer.setStyle(  this.bottomContainer.nativeElement, "width", this.middleContainer.nativeElement.offsetWidth +"px" );
    this.renderer.setStyle(  this.middleContainer.nativeElement, "height", "calc(100% - 65px - "+ this.bottomContainer.nativeElement.offsetHeight +"px" );
  }
}

onResized(event: ResizedEvent) {
  this.update_middle_container_height();
}

  
  @Output() arrowBack = new EventEmitter<any>();
  arrow_back() {
    this.arrowBack.emit();
  }
}

