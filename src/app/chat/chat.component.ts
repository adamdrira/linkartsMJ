
import { Component, OnInit, HostListener, Input, Output, EventEmitter, SimpleChanges, ChangeDetectorRef, ElementRef, ViewChild, Renderer2, ViewChildren, QueryList } from '@angular/core';
import { FormControl, Validators, FormGroup} from '@angular/forms';
import { ChatService} from '../services/chat.service';
import { Profile_Edition_Service} from '../services/profile_edition.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscribing_service } from '../services/subscribing.service';
import { WebSocketService } from '../services/websocket.service';
import {PopupConfirmationComponent} from '../popup-confirmation/popup-confirmation.component'
import { MatDialog } from '@angular/material/dialog';
import { FileUploader, FileItem } from 'ng2-file-upload';


declare var $: any;
const url = 'http://localhost:4600/routes/upload_attachments_for_chat';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit  {

  constructor (
    private elRef: ElementRef,
    private chatService:ChatService,
    private Subscribing_service:Subscribing_service,
    private sanitizer:DomSanitizer,
    private cd: ChangeDetectorRef,
    public dialog: MatDialog,
    private renderer: Renderer2,
    private WebSocketService:WebSocketService,
    private Profile_Edition_Service:Profile_Edition_Service
    ){
      //uploader
      this.uploader = new FileUploader({
        url:url,
      });
      this.hasBaseDropZoneOver = false;
      this.hasAnotherDropZoneOver = false;
      //message received
      chatService.messages.subscribe(msg=>{
        console.log(msg[0])
        //a person sends a message
        if(msg[0].id_user!="server" && !msg[0].is_from_server){
          console.log("it's not from server");
          //a person I am currently talking to
          if(msg[0].id_user==this.friend_id && msg[0].status!='seen'){
            console.log("user currently talking");
            //if it isnt a message to himmself
            if(msg[0].id_user!=msg[0].id_receiver && msg[0].id_chat_section==this.id_chat_section){
              console.log("not talking to myself");
              this.new_sort_friends_list.emit({friend_id:msg[0].id_user,message:msg[0]});
              if(this.list_of_messages.length>0){
                console.log("list not empty");
                // on décale les photos de profiles selon le dernier message
                if(this.list_of_messages[0].id_user==this.friend_id){
                  console.log("on règle les affaires de pp ici")
                  this.list_of_show_pp_left[0]=false;
                  this.index_of_show_pp_right+=1;
                  this.list_of_show_pp_left.splice(0,0,true);
                  console.log(this.list_of_show_pp_left);
                  console.log(this.index_of_show_pp_right);
                }
                else{
                  this.index_of_show_pp_right-=1;
                  this.list_of_show_pp_left.splice(0,0,true);
                  console.log(this.list_of_show_pp_left);
                  console.log(this.index_of_show_pp_right);
                }
                this.list_of_messages.splice(0,0,(msg[0]));
              }
              else{
                this.list_of_messages.push(msg[0]);
                this.list_of_show_pp_left.push(true);
                this.display_messages=true;
              }

              // tell the friend I read his message if I am present;
              console.log(this.user_present);
              console.log(this.list_of_show_pp_left);
              console.log(this.index_of_show_pp_right);
              if(this.user_present && msg[0].id_chat_section==this.id_chat_section){
                console.log("i am present")
                let message_to_send ={
                  id_user:this.current_user_id,   
                  id_receiver:this.friend_id, 
                  message:msg[0].message,
                  is_from_server:false,
                  status:'seen',
                  id_chat_section:this.id_chat_section,
                  attachment_name:"none",
                  is_an_attachment:false,
                  attachment_type:"none",
                }
                //function to update status rows to 'seen'
                  console.log("putting this message to seen")
                  this.chatService.messages.next(message_to_send);
                  this.chatService.let_all_friend_messages_to_seen(msg[0].id_user,this.id_chat_section).subscribe(l=>{ })
                
              }
              
            }
            else if(msg[0].id_user!=msg[0].id_receiver && msg[0].id_chat_section!=this.id_chat_section){
              this.new_sort_friends_list.emit({friend_id:msg[0].id_user,message:msg[0],id_chat_section:this.id_chat_section});
              this.show_notification_message=true;
              let ind=this.list_of_chat_sections_id.indexOf(msg[0].id_chat_section);
              this.list_of_chat_sections_notifications[ind]=true;
              this.cd.detectChanges();
            }
          }
          // one of my friends but not the one I am talking to
          else if(msg[0].id_user!=this.friend_id && this.list_of_friends_ids.indexOf(msg[0].id_user)>=0  && msg[0].status!='seen' ){
            console.log("not a friend I am talking to")
            this.new_sort_friends_list.emit({friend_id:msg[0].id_user,message:msg[0]});
          }
          //not one of my friends
          if(this.list_of_friends_ids.indexOf(msg[0].id_user)<0  && msg[0].status!='seen' ){
            console.log("not one of my friends");
            this.new_sort_friends_list.emit({friend_id:msg[0].id_user,message:msg[0]});
          }
          // a message from your friend to tell you that he has seen the message
          else if(msg[0].id_user==this.friend_id && msg[0].status=="seen"){
            console.log(" from my friend to tell seen")
            for(let i=0;i<this.list_of_messages.length;i++){
              if(this.list_of_messages[this.list_of_messages.length-1-i].status!='seen' && this.list_of_messages[this.list_of_messages.length-1-i].id_user==this.current_user_id){
                this.list_of_messages[this.list_of_messages.length-1-i].status='seen';
              }
              if(i==this.list_of_messages.length-1){
                this.index_of_show_pp_right=0;
              }
            }
          }
          
        }
        //a message from the server to tell that the message has been sent
        else if(msg[0].server_message=="received" ){
          console.log("it's from server and it's received");
          console.log(msg[0]);
          console.log(msg[0].message);
          console.log(this.list_of_messages);
          if(msg[0].message.id_user!=msg[0].message.id_receiver){
            this.list_of_messages[0].status="received";
            if(msg[0].message.attachment_type=="picture_message" ||msg[0].message.attachment_type=="picture_attachment" ||msg[0].message.attachment_type=="file_attachment" ){
              // on ne peut pas envoyer plus de 5 images en même temps dans un message
              for(let i=0;i<((this.list_of_messages.length>=6)?6:this.list_of_messages.length);i++){
                if(this.list_of_messages[i].attachment_name==msg[0].message.attachment_name){
                  this.list_of_messages[i].status="received";
                }
              }
            }
            else{
              for(let i=0;i<((this.list_of_messages.length>=6)?6:this.list_of_messages.length);i++){
                if(this.list_of_messages[i].message==msg[0].message.message){
                  this.list_of_messages[i].status="received";
                }
              }
            }
          }
          else{
            console.log("it's else and going seen")
            if(msg[0].message.attachment_type=="picture_message" ||msg[0].message.attachment_type=="picture_attachment" ||msg[0].message.attachment_type=="file_attachment" ){
              // on ne peut pas envoyer plus de 5 images en même temps dans un message
              for(let i=0;i<((this.list_of_messages.length>=6)?6:this.list_of_messages.length);i++){
                if(this.list_of_messages[i].attachment_name==msg[0].message.attachment_name){
                  this.list_of_messages[i].status="seen";
                }
              }
            }
            else{
              for(let i=0;i<((this.list_of_messages.length>=6)?6:this.list_of_messages.length);i++){
                if(this.list_of_messages[i].message==msg[0].message.message){
                  console.log("putting message on seen");
                  this.list_of_messages[i].status="seen";
                }
              }
            }
            console.log(this.list_of_messages);
            this.chatService.let_all_friend_messages_to_seen(msg[0].message.id_user,this.id_chat_section).subscribe(l=>{ })
          }
          this.new_sort_friends_list.emit({friend_id:this.friend_id,message:msg[0].message});
          this.list_of_time.pop();
        }
        else if(msg[0].message=="New"){
          console.log("new");
          this.list_of_messages.splice(0,0,msg[0]);
          console.log(this.list_of_messages);
          this.spam='false';
          this.cd.detectChanges;
          console.log(this.spam);
          this.chatService.let_all_friend_messages_to_seen(this.friend_id,this.id_chat_section).subscribe(l=>{
            console.log(l);
          });
          this.add_spam_to_contacts.emit({spam_id:this.friend_id,message:msg[0]});
        }
        else if(msg[0].server_message=="writing" ){
          this.display_writing=true;
          this.section_where_is_writing=msg[0].message;
          this.cd.detectChanges();
        }
        else if(msg[0].server_message=="not-writing" ){
          this.display_writing=false;
        }
        
        
       
      })
  }

  @HostListener('click', ['$event.target'])
  onClick(btn) {
    if(this.reactions_shown){
      console.log(this.emojis_reactions.toArray()[this.index_of_children_reactions].nativeElement);
      if (this.emojis_reactions.toArray()[this.index_of_children_reactions].nativeElement.contains(btn)){
        console.log("on est dans le div")
      } else{
        console.log('on est ailleurs');
        this.emojis_reactions.toArray()[this.index_of_children_reactions].nativeElement.classList.add("closed");
        this.reactions_shown=false;
      }
    }

    if(this.show_emojis){
      console.log("emoji shown");
      if (this.emojis.nativeElement.contains(btn) || this.emoji_button.nativeElement.contains(btn)){
        console.log("on est dans le div des emojis")
      } else{
        console.log('on est ailleurs');
        this.renderer.setStyle(this.emojis.nativeElement, 'visibility', 'hidden');
        this.show_emojis=false;
      }
    }

    if(this.show_container_research_chat){
      if (this.show_container_research.nativeElement.contains(btn) ){
        console.log("on est dans le div de la recherche")
      } else{
        console.log('on est ailleurs');
        this.show_container_research_chat=false;
        this.show_container_research_chat_results=false;
        this.list_of_chat_sections_found=[];
        this.list_of_chat_sections_found_id=[];
      }
    }



 }

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
  @Output() new_sort_friends_list = new EventEmitter<object>();
  @Output() add_spam_to_contacts = new EventEmitter<object>();
  @Output() change_section = new EventEmitter<object>();
  @ViewChild('input') input:ElementRef;

  //chat_section
  @Input() id_chat_section: number;
  chat_section_to_open: string;
  section_where_is_writing:string;
  current_id_chat_section:number;
  chat_section_name: FormControl;
  chat_section_name_added: FormControl;
  research_chat_section_message: FormControl;
  chat_section_group:FormGroup;
  research_messages:FormGroup;
  research_message: FormControl;
  //message_to_send
  message_group: FormGroup;
  message: FormControl;
  //spam
  @Input() spam: string;
  //current_user
  @Input() current_user_id: number;
  @Input() current_user_pseudo: string;
  @Input() current_user_name: string;
  @Input() current_user_profile_picture: SafeUrl;
  //friend
  @Input() friend_id: number;
  current_friend_id:number=-1;
  @Input() friend_pseudo: string;
  @Input() friend_name: string;
  @Input() friend_picture: SafeUrl;
  @Input() user_present: boolean;
  //friends
  @Input() list_of_friends_ids:any[];
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

  list_of_time:any[]=[]
  display_retry:any[]=[];
  display_writing=false;
 
  //attachments
  attachments_size:any[]=[];
  list_of_messages_pictures:any[]=[];
  list_of_messages_files:any[]=[];
  display_attachments=false;
  attachments:any[]=[];
  attachments_for_sql:any[]=[];
  attachments_type:any[]=[];
  end_of_past_images=false;
  an_image_is_pasted=false;
  attachments_name:any[]=[];
  compt_at=0;

  //upload files
  @ViewChild('file_upload') file_upload:ElementRef;
  //validate enter to send message
  number_of_shift:number=0;
 
  //show messages 
  compteur_image=0;
  compteur_loaded=0;
  put_messages_visible=false;
  @ViewChild('myScrollContainer') private myScrollContainer: ElementRef;

 
  ngOnChanges(changes: SimpleChanges) {
    console.log("something_changed");
    console.log(this.user_present)
    if(this.change_number>0){
      if(this.current_friend_id!=this.friend_id){
        console.log("getting messages");
        this.trigger_no_more=false;
        this.can_get_other_messages=false;
        this.list_of_chat_sections_found=[];
        this.list_of_chat_sections_found_id=[];
        this.no_result_container_research_chat=false;
        this.show_container_research_chat=false;
        this.show_container_research_chat_results=false;
        this.first_turn_loaded=false;
        this.current_friend_id=this.friend_id;
        this.list_of_chat_sections_notifications=[];
        this.list_of_chat_sections_id=[1];
        this.list_of_chat_sections=["Discussion principale"];
        this.cd.detectChanges();
        this.get_messages(this.id_chat_section);
        this.change_number=0;
      }

      if(this.user_present){
        console.log(this.id_chat_section);
        console.log("putting messages to seen")
        this.chatService.let_all_friend_messages_to_seen(this.friend_id,this.id_chat_section).subscribe(l=>{
          let message_to_send ={
            id_user:this.current_user_id,   
            id_receiver:this.friend_id, 
            message:"",
            is_from_server:false,
            status:'seen',
            id_chat_section:this.id_chat_section,
            attachment_name:"none",
            is_an_attachment:false,
            attachment_type:"none",
          }
          this.chatService.messages.next(message_to_send);
         });
      }
      else{
        this.input.nativeElement.blur();
        let msg ={
          id_user:this.current_user_id,   
          id_receiver:this.friend_id,  
          message:this.message_group.value.message,
          is_from_server:true,
          id_chat_section:this.id_chat_section,
          chat_section_name:this.list_of_chat_sections[this.list_of_chat_sections_id.indexOf(this.id_chat_section)],
          is_a_response:this.respond_to_a_message,
          id_message_responding:(this.respond_to_a_message)?this.id_message_responding_to:null,
          message_responding_to:(this.respond_to_a_message)?this.message_responding_to:null,
          status:"not-writing"
        } 
        this.chatService.messages.next(msg);
      }

    }
    this.change_number++;
  }

  can_get_other_messages=false;
  show_spinner=false;
  
  ngOnInit() {
    console.log(this.id_chat_section);
    this.createFormControlsAds();
    this.createFormAd();
    this.get_messages(this.id_chat_section);
    
    this.current_id_chat_section=this.id_chat_section;

    setInterval(() => {
      
      if(this.myScrollContainer.nativeElement.scrollTop==0 && this.put_messages_visible && !this.show_research_results && !this.trigger_no_more){
        if(this.can_get_other_messages){
          this.can_get_other_messages=false;
          this.show_spinner=true;
          console.log("on est au bout")
          this.chatService.get_other_messages(this.friend_id,this.list_of_messages[this.list_of_messages.length-1].id,this.id_chat_section).subscribe(r=>{
            if(r[0][0]){
              let num=this.list_of_messages.length;
              for(let i=0;i<r[0].length;i++){
                this.list_of_messages.push(r[0][i]);
                this.list_of_messages_date.push(this.date_of_message(r[0][i].createdAt,0));
                this.sort_pp(num-1+i);
                this.get_picture_for_message(num-1+i);
                if(i==r[0].length-1){
                  this.show_spinner=false;
                  this.cd.detectChanges();
                  let offset=this.message_children.toArray()[r[0].length].nativeElement.offsetTop;
                  let height =this.message_children.toArray()[r[0].length].nativeElement.getBoundingClientRect().height
                  this.myScrollContainer.nativeElement.scrollTop=offset-height;
                  this.can_get_other_messages=true;
                }
              }
            }
            else{
              this.show_spinner=false;
              this.can_get_other_messages=false;
              this.trigger_no_more=true;
              console.log("on cherche d'autres msg");
            }
          })
        }
        
      }
    }, 500);
    
    setInterval(() => {
      if(this.list_of_time.length>0){
        for(let i=0;i<this.list_of_time.length;i++){
          if(this.list_of_messages[i].status=='sent' && !this.display_retry[i]){
            let ending_time_of_view = Math.trunc(new Date().getTime()/1000)  - this.list_of_time[i];
            if(ending_time_of_view>25){
              this.display_retry[i]=true;
            }
          }
        }
      }
    }, 5000);
    
    this.uploader.onAfterAddingFile = async (file) => {

      var re = /(?:\.([^.]+))?$/;
      let size = file._file.size/1024/1024;
      console.log(file._file.name);
      console.log(this.uploader.queue)
        if(this.uploader.queue.length==6){
          this.uploader.queue.pop();
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:'Vous ne pouvez pas ajouter plus de 5 fichiers'},
          });
        }
        else if(Math.trunc(size)>10){
          this.uploader.queue.pop();
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:`Votre fichier est trop volumineux, choisissez un fichier de moins de 10Mo alors qu'il fait ${size}`},
          });
        }
        else{
          if( re.exec(file._file.name)[1]=="jpeg" || re.exec(file._file.name)[1]=="png" || re.exec(file._file.name)[1]=="jpg"){
            let url = (window.URL) ? window.URL.createObjectURL(file._file) : (window as any).webkitURL.createObjectURL(file._file);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.attachments.push(SafeURL);
            this.attachments_size.push(size);
            this.attachments_type.push('picture_attachment');
            this.attachments_name.push(file._file.name);
            this.display_attachments=true;
          }
          else{
            console.log("dans le else");
            this.attachments_size.push(size);
            let url = (window.URL) ? window.URL.createObjectURL(file._file) : (window as any).webkitURL.createObjectURL(file._file);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.attachments.push(SafeURL);
            this.attachments_type.push('file_attachment');
            this.attachments_name.push(file._file.name);
            this.display_attachments=true;
          }
          file.withCredentials = true; 
          
        }
        
    };

    this.uploader.onCompleteItem = (file) => {
      console.log(this.list_of_messages_files);
      console.log(this.list_of_messages);
      console.log(this.list_of_messages_pictures)
      this.k++;
      if(this.k<this.uploader.queue.length){
        this.chatService.check_if_file_exists(this.uploader.queue[this.k]._file.name,0).subscribe(r=>{
          this.uploader.setOptions({ headers: [ {name:'attachment_name',value:`${r[0].value}`}]});
          this.uploader.queue[this.k].upload();
        })
      }
      
      console.log("item complete ready to send");
      console.log(file);
      var type='';
      var re = /(?:\.([^.]+))?$/;
      if( re.exec(file._file.name)[1]=="jpeg" || re.exec(file._file.name)[1]=="png" || re.exec(file._file.name)[1]=="jpg"){
        type='picture_attachment'
      }
      else{
        type='file_attachment';
      }
      let url = (window.URL) ? window.URL.createObjectURL(file._file) : (window as any).webkitURL.createObjectURL(file._file);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      //this.list_of_messages_files.splice(0,0,SafeURL);
      this.chatService.check_if_file_exists(file._file.name,1).subscribe(r=>{
        let message ={
          id_user:this.current_user_id,   
          id_receiver:this.friend_id,  
          message:null,
          attachment_name:r[0].value,
          attachment_type:type,
          is_an_attachment:true,
          is_from_server:false,
          id_chat_section:this.id_chat_section,
          size:file._file.size/1024/1024,
          is_a_response:this.respond_to_a_message,
          id_message_responding:(this.respond_to_a_message)?this.id_message_responding_to:null,
          message_responding_to:(this.respond_to_a_message)?this.message_responding_to:null,
          status:"sent"
        };
        this.chatService.messages.next(message);
      })
    
     
      if(this.k==this.uploader.queue.length){
        if(this.an_image_is_pasted && this.end_of_past_images){
          this.an_image_is_pasted=false;
          this.end_of_past_images=false;
          this.attachments_type=[];
          this.attachments_name=[];
          this.attachments_for_sql=[];
          this.attachments=[];
        }
        if(!this.an_image_is_pasted){
          this.attachments_type=[];
          this.attachments_name=[];
          this.attachments_for_sql=[];
          this.attachments=[];
        }
        this.uploader.queue=[];  
        this.k=0;  
      }
      
    }
    
  };

  
  compteur_selector=0;
  get_messages(id_chat_section){
    
    this.compteur_image=0;
    this.compteur_loaded=0;
    this.display_messages=false;
    this.put_messages_visible=false;
    this.list_of_messages_pictures=[];
    this.list_of_messages_files=[];
    this.list_of_show_pp_left=[];
    this.list_of_messages_date=[];
    this.list_of_messages=[];
    this.list_of_time=[];
    this.index_of_show_pp_right=-1;
    this.compteur_pp=0;
    console.log("getting messages");
    if(this.spam=='false'){
      this.chatService.let_all_friend_messages_to_seen(this.friend_id,id_chat_section).subscribe(l=>{
        this.get_chat_sections();
      })
    }
    this.current_friend_id=this.friend_id;
    this.chatService.get_first_messages(this.current_user_id,this.friend_id,id_chat_section).subscribe(r=>{
      this.list_of_messages=r[0];
      console.log(this.list_of_messages)
      if(r[0].length>0){
        for(let i=0;i<r[0].length;i++){
          this.list_of_messages_date[i]=this.date_of_message(r[0][i].createdAt,0);
          if(this.list_of_messages[i].is_an_attachment){
            if(this.list_of_messages[i].attachment_type=='picture_message'){
              this.chatService.get_picture_sent_by_msg(this.list_of_messages[i].attachment_name).subscribe(t=>{
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.list_of_messages_pictures[i]=SafeURL;
                this.compteur_image+=1;
              })
            }
            else if(this.list_of_messages[i].attachment_type=='picture_attachment'){
              this.chatService.get_attachment(this.list_of_messages[i].attachment_name).subscribe(t=>{
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.list_of_messages_pictures[i]=SafeURL;
                this.compteur_image+=1;
              })
            }
            else if(this.list_of_messages[i].attachment_type=='file_attachment'){
              this.chatService.get_attachment(this.list_of_messages[i].attachment_name).subscribe(t=>{
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.list_of_messages_files[i]=SafeURL;
                
              })
            }
          }
          
          if(i==0 && r[0][i].id_user==this.friend_id && this.current_user_id!=this.friend_id){
            this.list_of_show_pp_left[i]=true;
            this.compteur_pp+=1;
            console.log("add pp left");
            
          }
          if(r[0][i].id_user==this.current_user_id && r[0][i].status=="seen" && this.index_of_show_pp_right<0){
            this.index_of_show_pp_right=i;
            this.compteur_pp+=1;
            console.log("add pp right");
          }
          if(i>0){  
            if(r[0][i].id_user==this.friend_id && r[0][i].id_user!=r[0][i-1].id_user){
              this.list_of_show_pp_left[i]=true;
              this.compteur_pp+=1;
              console.log("add pp left");
            }
          }
          if(i==r[0].length-1){
            this.chatService.check_if_response_exist(this.friend_id,id_chat_section).subscribe(l=>{
              if(l[0].value){
                this.response_exist=true;
              }
              else{
                  this.response_exist=false;
              }
              this.response_exist_retrieved=true;
              this.display_messages=true;
              if(this.compteur_pp==0 && this.compteur_image==0){
                this.cd.detectChanges();
                this.put_messages_visible=true;
                this.myScrollContainer.nativeElement.scrollTop= this.myScrollContainer.nativeElement.scrollHeight;
                if(this.list_of_messages.length>0){
                  this.can_get_other_messages=true;
                }
              };
              console.log("messages retrieved");
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
      
      
    })
  }


  compteur_loaded_research=0;
  first_turn_loaded=false;
  loaded_image(event){
    let function_done=false;
    setInterval(() => {
      if(!function_done){
        console.log("ssecurity compt");
        this.myScrollContainer.nativeElement.scrollTop= this.myScrollContainer.nativeElement.scrollHeight;
        //this.put_messages_visible=true;
        this.first_turn_loaded=true;
        if(this.list_of_messages.length>0){
          this.can_get_other_messages=true;
        }
        function_done=true;
      }
    }, 5000);
    if(!this.show_research_results && !this.first_turn_loaded){
      this.compteur_loaded+=1;
      if(this.compteur_image!=0){
        if (this.compteur_loaded==this.compteur_image + this.compteur_pp){
          this.myScrollContainer.nativeElement.scrollTop= this.myScrollContainer.nativeElement.scrollHeight;
          this.put_messages_visible=true;
          this.first_turn_loaded=true;
          function_done=true;
          this.can_get_other_messages=true;
          console.log("function_done");
        }
      }
      else {
        if (this.compteur_loaded==this.compteur_pp){
          this.myScrollContainer.nativeElement.scrollTop= this.myScrollContainer.nativeElement.scrollHeight;
          this.put_messages_visible=true;
          this.first_turn_loaded=true;
          function_done=true;
          this.can_get_other_messages=true;
          console.log("function_done");
        }
      }
    }
    else if(this.show_research_results){
      this.compteur_loaded_research+=1;
      if(this.compteur_image_research!=0){
        if (this.compteur_loaded_research==this.compteur_image_research + this.compteur_pp){
          console.log("c'est bon on affiche")
          this.put_messages_visible=true;
          this.can_get_other_messages=true;
          function_done=true;
        }
      }
      else{
        if (this.compteur_loaded_research==this.compteur_pp){
          console.log("c'est bon on affiche")
          this.put_messages_visible=true;
          this.can_get_other_messages=true;
          function_done=true;
        }
      }
    }
    
    
  }
/*************************************Partie envoie de message***********************************/
/*************************************Partie envoie de message***********************************/
/*************************************Partie envoie de message***********************************/
/*************************************Partie envoie de message***********************************/
/*************************************Partie envoie de message***********************************/
/*************************************Partie envoie de message***********************************/
/*************************************Partie envoie de message***********************************/
/*************************************Partie envoie de message***********************************/

  createFormControlsAds() {
    this.message = new FormControl('');
    this.chat_section_name = new FormControl('');
    this.chat_section_name_added= new FormControl('');
    this.research_chat_section_message= new FormControl('');
    this.research_message= new FormControl('');
  }

  createFormAd() {
    this.message_group = new FormGroup({
      message: this.message,
    });
    this.chat_section_group = new FormGroup({
      chat_section_name: this.chat_section_name,
      chat_section_name_added:this.chat_section_name_added,
      research_chat_section_message:this.research_chat_section_message,
    });
    this.research_messages = new FormGroup({
      research_message: this.research_message,
    });
  }

  activateFocus() {
    this.input.nativeElement.focus();
    let msg ={
      id_user:this.current_user_id,   
      id_receiver:this.friend_id,  
      message:this.message_group.value.message,
      is_from_server:true,
      id_chat_section:this.id_chat_section,
      chat_section_name:this.list_of_chat_sections[this.list_of_chat_sections_id.indexOf(this.id_chat_section)],
      is_a_response:this.respond_to_a_message,
      id_message_responding:(this.respond_to_a_message)?this.id_message_responding_to:null,
      message_responding_to:(this.respond_to_a_message)?this.message_responding_to:null,
      status:"writing"
    } 
    this.chatService.messages.next(msg);
  }

  desactivateFocus(){
    let msg ={
      id_user:this.current_user_id,   
      id_receiver:this.friend_id,  
      message:this.message_group.value.message,
      is_from_server:true,
      id_chat_section:this.id_chat_section,
      chat_section_name:"rien",
      is_a_response:this.respond_to_a_message,
      id_message_responding:(this.respond_to_a_message)?this.id_message_responding_to:null,
      message_responding_to:(this.respond_to_a_message)?this.message_responding_to:null,
      status:"not-writing"
    } 
    this.chatService.messages.next(msg);
  }

  
  on_keydown(event){
    console.log("message change");
    console.log(event.key);
    console.log(this.attachments_type);
    if(event.key=="Shift"){
      this.number_of_shift=1;
    }
    else if(event.key!="Enter"){
      this.number_of_shift=0;
    }
    else if(event.key=="Enter"){
      console.log(this.number_of_shift);
      if(this.number_of_shift==0){
        
        if(this.check_if_message_valide()){
          this.send_message();
        }
        else if(this.attachments.length>0){
          this.compt_at=0;
          for(let i=0;i<this.attachments.length;i++){
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
      this.number_of_shift=0;
    }

    
  }

  check_if_message_valide(){
    if(this.message_group.value.message!=''){
      console.log(this.message_group.value.message.replace(/\s/g, '').length);
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

  
  onPaste(event: ClipboardEvent) {
    console.log("we are pasting")
    var re = /(?:\.([^.]+))?$/;
    console.log(event);
    if(event.clipboardData.files[0]){
      let size = event.clipboardData.files[0].size/1024/1024;
      let blob = event.clipboardData.files[0];
      let name=event.clipboardData.files[0].name;
      if(this.attachments.length==5){
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Vous ne pouvez envoyer plus de 5 fichiers simultanément'},
        });
        return
      }
      if(Math.trunc(size)>5){
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Le fichier est trop volumineux'},
        });
        return
      }
      if( re.exec(name)[1]=="jpeg" || re.exec(name)[1]=="png" || re.exec(name)[1]=="jpg"){
        let url = (window.URL) ? window.URL.createObjectURL(blob) : (window as any).webkitURL.createObjectURL(blob);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.attachments.push(SafeURL);
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
        console.log("we are pushing picture message");
        this.attachments_type.push('picture_message');
        this.display_attachments=true;
      }
    }
  }

  remove_attachment(i){
    this.attachments.splice(i,1);
    this.attachments_name.splice(i,1);
    this.uploader.queue.splice(i,1);
    this.attachments_for_sql.splice(i,1);
    this.attachments_type.splice(i,1);
    if(this.attachments.length==0){
      this.display_attachments=false;
    }
  }

  
  //envoie de message
  send_message(){
    console.log("sending messages")
    if(this.attachments.length>0){
      for(let i=0;i<this.attachments.length;i++){
        this.send_attachment_or_picture(i);
      }
    }
    this.message_one ={
      id_user:this.current_user_id,   
      id_receiver:this.friend_id,  
      message:this.message_group.value.message,
      is_from_server:false,
      id_chat_section:this.id_chat_section,
      is_a_response:this.respond_to_a_message,
      id_message_responding:(this.respond_to_a_message)?this.id_message_responding_to:null,
      message_responding_to:(this.respond_to_a_message)?this.message_responding_to:null,
      status:"sent"
    }
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
    console.log("scroll")
  }

  
  send_picture(i){
    console.log("sending picture");
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
    console.log(file);
    console.log(file_name);
    let message ={
      id_user:this.current_user_id,   
      id_receiver:this.friend_id,  
      message:null,
      attachment_name:file_name,
      attachment_type:"picture_message",
      is_an_attachment:true,
      is_from_server:false,
      id_chat_section:this.id_chat_section,
      is_a_response:this.respond_to_a_message,
      id_message_responding:(this.respond_to_a_message)?this.id_message_responding_to:null,
      message_responding_to:(this.respond_to_a_message)?this.message_responding_to:null,
      size:this.attachments_size[i],
      status:"sent"
    };
    this.chatService.chat_sending_images(file,re.exec(file.name)[1],file_name).subscribe(l=>{
      console.log(l);
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
        this.display_attachments=false;
      }
    }
    this.cd.detectChanges();
    this.myScrollContainer.nativeElement.scrollTop= this.myScrollContainer.nativeElement.scrollHeight;
  }

 
  send_attachment_or_picture(i){
    this.respond_to_a_message=false;
    console.log("sending attachment or picture");
    console.log(this.attachments_type);
    if(this.attachments_type[i]=="picture_message"){
      console.log("picture_message")
      this.send_picture(i);
    }
    else if(this.attachments_type[i]=="picture_attachment"){
      this.compt_at+=1;
      if(this.compt_at==1){
        this.chatService.check_if_file_exists(this.attachments_name[i],0).subscribe(r=>{
          this.uploader.setOptions({ headers: [ {name:'attachment_name',value:`${r[0].value}`}]});
          this.uploader.queue[0].upload();
          let message ={
            id_user:this.current_user_id,   
            id_receiver:this.friend_id,  
            message:null,
            attachment_name:r[0].value,
            attachment_type:"picture_attachment",
            is_an_attachment:true,
            is_from_server:false,
            size:this.attachments_size[i],
            status:"sent"
          };
          this.index_of_show_pp_right=this.index_of_show_pp_right+1;
          this.list_of_show_pp_left.splice(0,0,false);
          this.list_of_messages_files.splice(0,0,this.attachments[i]);
          this.list_of_messages_pictures.splice(0,0,this.attachments[i]);
          this.list_of_messages.splice(0,0,(message));
          this.list_of_messages_date.splice(0,0,this.date_of_message("time",1));
          console.log(this.list_of_messages_pictures);
          console.log(this.attachments[i])
          console.log(this.attachments);
        })
      }
      else{
        this.chatService.check_if_file_exists(this.attachments_name[i],0).subscribe(r=>{
          let message ={
            id_user:this.current_user_id,   
            id_receiver:this.friend_id,  
            message:null,
            attachment_name:r[0].value,
            attachment_type:"picture_attachment",
            is_an_attachment:true,
            is_from_server:false,
            size:this.attachments_size[i],
            status:"sent"
          };
          this.index_of_show_pp_right=this.index_of_show_pp_right+1;
          this.list_of_show_pp_left.splice(0,0,false);
          this.list_of_messages_files.splice(0,0,this.attachments[i]);
          this.list_of_messages_pictures.splice(0,0,this.attachments[i]);
          this.list_of_messages.splice(0,0,(message));
        })
      }
      this.cd.detectChanges();
      this.myScrollContainer.nativeElement.scrollTop= this.myScrollContainer.nativeElement.scrollHeight;
    }
    else if(this.attachments_type[i]=="file_attachment"){
      this.compt_at+=1;
      if(this.compt_at==1){
        this.chatService.check_if_file_exists(this.attachments_name[i],0).subscribe(r=>{
          console.log("file upload")
           this.uploader.setOptions({ headers: [ {name:'attachment_name',value:`${r[0].value}`}]});
           this.uploader.queue[0].upload();
           let message ={
             id_user:this.current_user_id,   
             id_receiver:this.friend_id,  
             message:null,
             attachment_name:r[0].value,
             attachment_type:"file_attachment",
             is_an_attachment:true,
             size:this.attachments_size[i],
             is_from_server:false,
             status:"sent"
           };
           this.index_of_show_pp_right=this.index_of_show_pp_right+1;
           this.list_of_show_pp_left.splice(0,0,false);
           console.log(this.attachments[i])
           this.list_of_messages_files.splice(0,0,this.attachments[i]);
           this.list_of_messages_pictures.splice(0,0,this.attachments[i]);
           this.list_of_messages_date.splice(0,0,this.date_of_message("time",1));
           this.list_of_messages.splice(0,0,(message));
         })
      }
      else{
        this.chatService.check_if_file_exists(this.attachments_name[i],0).subscribe(r=>{
          console.log("no file uplaod");
           let message ={
             id_user:this.current_user_id,   
             id_receiver:this.friend_id,  
             message:null,
             attachment_name:r[0].value,
             attachment_type:"file_attachment",
             is_an_attachment:true,
             is_from_server:false,
             size:this.attachments_size[i],
             status:"sent"
           };
           this.index_of_show_pp_right=this.index_of_show_pp_right+1;
           this.list_of_show_pp_left.splice(0,0,false);
           this.list_of_messages_files.splice(0,0,this.attachments[i]);
           this.list_of_messages_pictures.splice(0,0,this.attachments[i]);
           this.list_of_messages.splice(0,0,(message));
         })
      }
      this.cd.detectChanges();
      this.myScrollContainer.nativeElement.scrollTop= this.myScrollContainer.nativeElement.scrollHeight;
    }
    this.display_attachments=false;
    
  }

  retry(i){
    let message=this.list_of_messages[i];
    console.log(message);
    this.chatService.messages.next(message);
  }

/*************************************Partie gestion des spams***********************************/
/*************************************Partie gestion des spams***********************************/
/*************************************Partie gestion des spams***********************************/
/*************************************Partie gestion des spams***********************************/
/*************************************Partie gestion des spams***********************************/
  add_to_contacts(){
    console.log("adding to contacts");
    this.chatService.add_spam_to_contacts(this.friend_id).subscribe(l=>{
      console.log(l);
      let message_one ={
        id_user:this.current_user_id,   
        id_receiver:this.friend_id,  
        message:"New",
        is_from_server:true,
        status:"sent",
        id_chat_section:this.id_chat_section,
        attachment_name:"none",
        attachment_type:"none",
        is_an_attachment:false,
      };
      this.chatService.messages.next(message_one);
    })
   
  }


  /*************************************Partie gestion des messages***********************************/
/*************************************Partie gestion des messages***********************************/
/*************************************Partie gestion des messages***********************************/
/*************************************Partie gestion des messages***********************************/
/*************************************Partie gestion des messages***********************************/

  delete_message(i){
    console.log(this.list_of_messages[i])
    console.log(this.list_of_messages[i].createdAt);
    this.chatService.delete_message(this.list_of_messages[i].id).subscribe(r=>{
      this.list_of_messages[i].status="deleted";
    })
    
  }

  date_of_message(timestamp,index){
    
    if(index==0){
      //console.log(new Date(timestamp))
      let today=new Date(timestamp);
      let hour =String(today.getHours()).padStart(2, '0');
      let min =String(today.getMinutes()).padStart(2, '0');
      let day=String(today.getDate()).padStart(2, '0')
      let month=String(today.getMonth() + 1).padStart(2, '0');
      let year = today.getFullYear();
      /* let day=parseInt(timestamp.substring(8,10)).toString();
      let year =timestamp.substring(0,4);
      let hour =timestamp.substring(11,16)
      let month='';*/
        
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
  respond_to_message(i){
    console.log(this.list_of_messages[i]);
    if(this.list_of_messages[i].is_an_attachment){
      this.message_responding_to="pièce jointe : " + this.list_of_messages[i].attachment_name;
    }
    else if(this.list_of_messages[i].message){
      this.message_responding_to=this.list_of_messages[i].message;
    }
    this.id_message_responding_to=this.list_of_messages[i].id
    this.respond_to_a_message=true;
  }

  cancel_response(){
    this.respond_to_a_message=false;
    this.id_message_responding_to=-1;
  }

  @ViewChildren('message_children') message_children: QueryList<ElementRef>;
  show_response(i){
    let id=this.list_of_messages[i].id_message_responding;
    console.log(this.list_of_messages[i].id_message_responding);
    for(let j=0;j<this.list_of_messages.length;j++){
      if(this.list_of_messages[j].id==id){
        console.log(this.list_of_messages[j]);
        console.log(this.message_children.toArray()[this.list_of_messages.length-1-j].nativeElement.offsetTop);
        let offset=this.message_children.toArray()[this.list_of_messages.length-1-j].nativeElement.offsetTop;
        let top=this.message_children.toArray()[this.list_of_messages.length-1-j].nativeElement.getBoundingClientRect().top;
        let height=this.message_children.toArray()[this.list_of_messages.length-1-j].nativeElement.getBoundingClientRect().height;
        console.log(this.message_children.toArray()[this.list_of_messages.length-1-j].nativeElement.getBoundingClientRect());
        console.log(this.myScrollContainer.nativeElement.scrollHeight+top);
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
set = 'native';
native = true;
@ViewChild('emojis') emojis:ElementRef;
@ViewChild('emoji_button') emoji_button:ElementRef;



emojis_list=["+1","smiley","heart_eyes","joy","open_mouth","cry","-1","face_with_rolling_eyes","rage"]
emojis_size_list=[30,30,30,30,30,30,30,30,30];
list_show_reactions:any[]=[];
@ViewChildren('emojis_reactions') emojis_reactions: QueryList<ElementRef>;
handleClick($event) {
  this.selectedEmoji = $event.emoji;
  let data = this.message_group.get('message');
  data.patchValue(data.value + $event.emoji.native);
  this.cd.detectChanges();
}

show_emojis=false;
open_emojis(){
  console.log("show emojis")
  this.show_emojis=true;
  this.renderer.setStyle(this.emojis.nativeElement, 'visibility', 'visible');
}



reaction_click($event,i) {
  this.emojis_reactions.toArray()[this.list_of_messages.length -1 -i].nativeElement.classList.add("closed");
  this.selectedEmoji = $event.emoji;
  console.log($event.emoji);
  if(this.list_of_messages[i].id_user==this.current_user_id){
    console.log("moi meme")
    if(this.list_of_messages[i].emoji_reaction_user==$event.emoji.id){
      this.chatService.delete_emoji_reaction(this.list_of_messages[i].id,"user").subscribe(r=>{
        console.log(r)
        this.list_of_messages[i].emoji_reaction_user=null;
      })
    }
    else{
      this.chatService.add_emoji_reaction(this.list_of_messages[i].id,$event.emoji.id,"user").subscribe(r=>{
        console.log(r)
        this.list_of_messages[i].emoji_reaction_user=$event.emoji.id;
      })
    }
  }
  else{
    console.log("friend");
    if(this.list_of_messages[i].emoji_reaction_receiver==$event.emoji.id){
      this.chatService.delete_emoji_reaction(this.list_of_messages[i].id,"receiver").subscribe(r=>{
        console.log(r)
        this.list_of_messages[i].emoji_reaction_receiver=null;
      })
    }
    else{
      this.chatService.add_emoji_reaction(this.list_of_messages[i].id,$event.emoji.id,"receiver").subscribe(r=>{
        console.log(r)
        this.list_of_messages[i].emoji_reaction_receiver=$event.emoji.id;
      })
    }
  }
 
}

index_of_children_reactions=0;
reactions_shown=false;
show_reactions(i,event:MouseEvent ){
  this.list_show_reactions[i]=true;
  this.reactions_shown=true;
  this.index_of_children_reactions=i;
  this.emojis_reactions.toArray()[i].nativeElement.classList.remove("closed");
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
top_pp_loaded=false;
put_top_visible=false;
top_sumo_loaded=false;
nothing_selected=true;
initialize_selectors(){
  let THIS=this;
  $(document).ready(function () {
    
    $('.chat-section').SumoSelect({
    });
    THIS.top_sumo_loaded=true;
  });
  THIS.cd.detectChanges();
  //THIS.chat_section_group.controls['chat_section_name'].setValue( "scénario" );
  
  $(".chat-section").change(function(){
    THIS.nothing_selected=false;
    THIS.trigger_no_more=false;
    THIS.chat_section_to_open=$(this).val();
    THIS.first_turn_loaded=false;
    console.log($(this).val() );
    if($(this).val()!=''){
      let index =THIS.list_of_chat_sections.indexOf($(this).val() )
      THIS.id_chat_section=THIS.list_of_chat_sections_id[index];
      THIS.change_section.emit({id_chat_section:THIS.id_chat_section});
      console.log("getting messages from selector other");
      THIS.get_messages(THIS.id_chat_section);
      THIS.list_of_chat_sections_notifications[index]=false;
      let compt=0;
      for(let i=0;i<THIS.list_of_chat_sections_notifications.length;i++){
        if(THIS.list_of_chat_sections_notifications[i]){
          compt+=1;
        }
        if(i==THIS.list_of_chat_sections_notifications.length-1){
          if(compt>0){
            THIS.show_notification_message=true;
          }
          else{
            THIS.show_notification_message=false;
          }
        }
      }
      THIS.cd.detectChanges();
    }
    else{
      console.log("getting messages from selector 0");
      THIS.id_chat_section=1;
      THIS.change_section.emit({id_chat_section:THIS.id_chat_section});
      THIS.get_messages(THIS.id_chat_section);
      THIS.list_of_chat_sections_notifications[0]=false;
      let compt=0;
      for(let i=0;i<THIS.list_of_chat_sections_notifications.length;i++){
        if(THIS.list_of_chat_sections_notifications[i]){
          compt+=1;
        }
        if(i==THIS.list_of_chat_sections_notifications.length-1){
          if(compt>0){
            THIS.show_notification_message=true;
          }
          else{
            THIS.show_notification_message=false;
          }
        }
      }
      THIS.cd.detectChanges();
    }
  })

  
  $('.chat-section').on('sumo:opening', function(e) {
    //console.log(e);
    console.log(THIS.list_of_chat_sections_notifications);
    console.log(THIS.list_of_chat_sections);
    console.log(THIS.list_of_chat_sections_id);
      $(this).closest('.SumoSelect').find('.optWrapper li.opt').each(function(idx, ele) {
       
        if(idx>0){
          if(THIS.list_of_chat_sections_notifications[idx-1]){
            $(this).empty().prepend('<label>'+THIS.list_of_chat_sections[idx-1]+'</label>');
            $(this).prepend('<img style="height:15px; margin: auto 5px auto auto;" '+
            'src="../../assets/img/bell_blue_black2.png">');
            $(this).find('label').css('display', 'inline');
          }
          else{
            $(this).empty().prepend('<label>'+THIS.list_of_chat_sections[idx-1]+'</label>');
            $(this).find('label').css('display', 'inline');
          }
        }
          
      })
  })
  console.log("selector initialized");
}


activate_add_chat_section=false;
add_chat_section(){
  console.log("add chat section")
  this.close_chat_section_research();
  this.activate_add_chat_section=true;
}

add_chat_section_name(){
  
  console.log(this.chat_section_group.value.chat_section_name_added);
  let name=this.chat_section_group.value.chat_section_name_added;
  
  this.chatService.add_chat_section(name,this.friend_id).subscribe(r=>{
    if(r[0].is_ok){
      this.list_of_chat_sections.push(name);
      let ind =this.list_of_chat_sections.length-1;
      let compt =0
      for(let i=1;i<this.list_of_chat_sections.length;i++){
        if(name <this.list_of_chat_sections[i] && compt==0){
          //this.list_of_chat_sections.splice(i,0,name)
          this.list_of_chat_sections.splice(i,0,this.list_of_chat_sections.splice(ind,1)[0]);
          compt+=1;
        }
      }
      console.log(this.list_of_chat_sections);
      let indice=this.list_of_chat_sections.indexOf(name);
      console.log(indice);
      console.log(r[0].id_chat_section);
      this.list_of_chat_sections_id.splice(indice,0,r[0].id_chat_section);
      this.list_of_chat_sections_notifications.splice(indice,0,false);
      this.activate_add_chat_section=false;
      this.cd.detectChanges();
      $('.chat-section')[0].sumo.reload();
    }
    else{
      if(r[0].cause=="already"){
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Cette conversation existe déjà'},
        });
      }
      else{
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Vous ne pouvez pas crééer plus de 15 conversations'},
        });
      }
      
    }
  })
  this.chat_section_name_added.reset();
}

cancel_add_section(){
  this.activate_add_chat_section=false;
}

delete_chat_section(){
  if(this.id_chat_section==1){
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:false, text:'Vous ne pouvez pas supprimer la discussion principale'},
    });
  }
  else{
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Etes-vous sûr de vouloir supprimer la discussion ainsi que tous les messages concernés ?'},
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.chatService.delete_chat_section(this.id_chat_section,this.friend_id).subscribe(r=>{
          if(r[0].is_ok){
            location.reload();
          }
          else{
            const dialogRef = this.dialog.open(PopupConfirmationComponent, {
              data: {showChoice:false, text:"Vous ne pouvez pas supprimer une discussion dont vous n'êtes pas le créateur"},
            });
          }
        })
      }
    })
  }
}

compteur_chat_section=0;
get_chat_sections(){
  this.chatService.get_chat_sections(this.friend_id).subscribe(l=>{
    console.log(l);
    if(l[0][0]){
      let compt =0;
      for(let i=0;i<l[0].length;i++){
        this.list_of_chat_sections[i+1]=(l[0][i].chat_section_name);
        this.list_of_chat_sections_id[i+1]=(l[0][i].id_chat_section);
        if(this.id_chat_section==l[0][i].id_chat_section && compt==0){
          console.log(l[0][i].chat_section_name)
          this.chat_section_to_open=l[0][i].chat_section_name;
          compt+=1;
        } 
        if(i==l[0].length-1){
          if(compt==0){
            this.chat_section_to_open="Discussion principale"
          }
          for(let j=0;j<this.list_of_chat_sections.length;j++){
            this.chatService.get_notifications_section(this.list_of_chat_sections_id[j],this.friend_id).subscribe(r=>{
              this.list_of_chat_sections_notifications[j]=r[0].value;
              if(j==this.list_of_chat_sections.length-1){
                this.cd.detectChanges();
                if(this.compteur_chat_section>0){
                  this.activate_research_chat_section=false;
                  this.activate_add_chat_section=false;
                  $('.chat-section')[0].sumo.reload();
                }
                else{
                  this.initialize_selectors();
                }
                this.compteur_chat_section+=1;
                
              }
            })
          }
          
        }
      }
    }
    else{
      console.log("dans le else"); 
      this.chat_section_to_open="Discussion principale";
      this.cd.detectChanges();
      if(this.compteur_chat_section>0){
        this.activate_research_chat_section=false;
        this.activate_add_chat_section=false;
        $('.chat-section')[0].sumo.reload();
      }
      else{
        this.initialize_selectors();
      }
      this.compteur_chat_section+=1;
    }
    
  })
}

activate_research_chat_section=false;
list_of_chat_sections_found:any[]=[];
list_of_chat_sections_found_id:any[]=[];
add_chat_section_research(){
  this.cancel_add_section();
  this.activate_research_chat_section=true;
}

close_chat_section_research(){
  this.research_chat_section_message.reset();
  this.activate_research_chat_section=false;
  this.list_of_chat_sections_found=[];
  this.list_of_chat_sections_found_id=[];
  this.no_result_container_research_chat=false;
  this.show_container_research_chat=false;
  this.show_container_research_chat_results=false;
}

@ViewChild('show_container_research') show_container_research:ElementRef;
no_result_container_research_chat=false;
show_container_research_chat=false;
show_container_research_chat_results=false;
on_keydown_research_chat_section(event){
  this.list_of_chat_sections_found=[];
  if(this.chat_section_group.value.research_chat_section_message!=''){
    this.show_container_research_chat=true;
    this.chatService.research_chat_sections(this.chat_section_group.value.research_chat_section_message,this.friend_id).subscribe(r=>{
      console.log(r);
      if(r[0][0]){
        for(let i=0;i<r[0].length;i++){
          this.list_of_chat_sections_found[i]=r[0][i].chat_section_name;
          this.list_of_chat_sections_found_id[i]=r[0][i].id_chat_section;
          if(i==r[0].length-1){
            this.show_container_research_chat_results=true;
            this.cd.detectChanges();
          }
        }
      }
      else{
        console.log("pas de résultats");
        this.show_container_research_chat_results=true;
        this.no_result_container_research_chat=true;
        console.log( this.no_result_container_research_chat)
        this.cd.detectChanges();
      }
    })
  }
  else{
    this.show_container_research_chat=false;
    this.show_container_research_chat_results=false;
    this.no_result_container_research_chat=false;
    this.list_of_chat_sections_found=[];
    this.list_of_chat_sections_found_id=[];
  }
}

open_section_found(i){
  console.log( this.list_of_chat_sections_found_id[i]);
  
  this.nothing_selected=false;
  this.trigger_no_more=false;
  this.chat_section_to_open=this.list_of_chat_sections_found[i];
  this.first_turn_loaded=false;
  let index =this.list_of_chat_sections_id.indexOf(this.list_of_chat_sections_found_id[i])
  this.id_chat_section=this.list_of_chat_sections_found_id[i];
  this.change_section.emit({id_chat_section:this.id_chat_section});
  this.get_messages(this.id_chat_section);
  this.list_of_chat_sections_notifications[index]=false;
  let compt=0;
  for(let i=0;i<this.list_of_chat_sections_notifications.length;i++){
    if(this.list_of_chat_sections_notifications[i]){
      compt+=1;
    }
    if(i==this.list_of_chat_sections_notifications.length-1){
      if(compt>0){
        this.show_notification_message=true;
      }
      else{
        this.show_notification_message=false;
      }
      this.close_chat_section_research();
    }
  }
}

/*************************************Partie gestion de la recherche de messages***********************************/
/*************************************Partie gestion de la recherche de messages***********************************/
/*************************************Partie gestion de la recherche de messages***********************************/
/*************************************Partie gestion de la recherche de messages***********************************/
show_pre_searchbar_top=true;
show_searchbar_top=false;
@ViewChild('research') research:ElementRef;
initiateSearch(){
  this.show_pre_searchbar_top=false;
  this.show_searchbar_top=true;
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
on_keydown_research(event){
  if(!this.show_research_results){
    this.current_list_of_messages=this.list_of_messages;
    this.current_list_of_show_pp_left=this.list_of_show_pp_left;
    this.current_index_of_show_pp_right=this.index_of_show_pp_right;
    this.current_compteur_pp=this.compteur_pp;
    this.current_list_of_messages_date=this.list_of_messages_date;
    this.current_list_of_messages_pictures=this.list_of_messages_pictures;
    this.current_list_of_messages_files=this.list_of_messages_files;
    console.log(event);
    if(event.key=="Enter"){
      console.log(this.research_messages.value.research_message);
      console.log(this.number_of_messages_found)
      this.chatService.get_messages_from_research(this.research_messages.value.research_message,this.id_chat_section,this.friend_id).subscribe(l=>{
        console.log(l[0]);
        this.list_of_messages_found_complete=l[0];
        this.number_of_messages_found=l[0].length;
        this.message_researched=this.research_messages.value.research_message;
        if(l[0].length>0){
          for(let i=0;i<l[0].length;i++){
            let match=false;
            for(let j=0;j<this.list_of_messages.length;j++){
              if(l[0][i].message==this.list_of_messages[j].message && l[0][i].createdAt==this.list_of_messages[j].createdAt ){
                this.list_of_messages_found.push(true);
                this.index_of_messages_found.push(j);
                match=true;
                if(i==l[0].length-1 && j==this.list_of_messages.length-1){
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
                  this.chatService.get_messages_around(l[0][i].id,this.id_chat_section,this.friend_id).subscribe(r=>{
                    this.list_of_messages_around[i]=r[0].list_of_messages_to_send;
                    console.log(r[0]);
                    if(i==l[0].length-1 && j==this.list_of_messages.length-1){
                      console.log( this.list_of_messages_found);
                      console.log(this.list_of_messages_around);
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
  }
  else{
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:false, text:'Vous devez mettre fin à votre recherche précedente'},
    });
  }
}

first_message_is_loaded(){
  let ind= this.list_of_messages.length-1-this.index_of_messages_found[0];
  this.renderer.setStyle(this.message_children.toArray()[ind].nativeElement, 'background-color', 'rgba(255, 255, 0, 0.5)');
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
      if(!(this.list_of_messages[i].attachment_type=='file_attachment')){
        this.compteur_image_research+=1;
      }
      this.get_picture_for_message(i);
    }
    this.sort_pp(i);
  }
  this.cd.detectChanges();
  for(let i=0;i<this.list_of_messages.length;i++){
    if(this.list_of_messages[i].id==this.list_of_messages_found_complete[this.number_click_top-1].id){
      let ind= this.list_of_messages.length-1-i;
      this.renderer.setStyle(this.message_children.toArray()[ind].nativeElement, 'background-color', 'rgba(255, 255, 0, 0.5)');
      let offset=this.message_children.toArray()[ind].nativeElement.offsetTop;
      this.myScrollContainer.nativeElement.scrollTop=offset-100 ;
    }
  }
}


compteur_image_research=0;
//show_more_or_less=false;
show_less_results=false;
show_next_message_researched(){
  
  console.log("initialisaiton");
  if(this.number_click_top<this.number_of_messages_found){
    this.number_click_top+=1;
    if(this.list_of_messages_found[this.number_click_top-1]){
      let ind= this.list_of_messages.length-1-this.index_of_messages_found[this.number_click_top-1];
      this.renderer.setStyle(this.message_children.toArray()[ind].nativeElement, 'background-color', 'rgba(255, 255, 0, 0.5)');
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
          if(!(this.list_of_messages[i].attachment_type=='file_attachment')){
            this.compteur_image_research+=1;
          }
          this.get_picture_for_message(i);
        }
        this.sort_pp(i);
      }
      this.cd.detectChanges();
      for(let i=0;i<this.list_of_messages.length;i++){
        if(this.list_of_messages[i].id==this.list_of_messages_found_complete[this.number_click_top-1].id){
          let ind= this.list_of_messages.length-1-i;
          this.renderer.setStyle(this.message_children.toArray()[ind].nativeElement, 'background-color', 'rgba(255, 255, 0, 0.5)');
          let offset=this.message_children.toArray()[ind].nativeElement.offsetTop;
          console.log(offset)
          this.myScrollContainer.nativeElement.scrollTop=offset-100;
        }
      }
    }
  }
}

show_precedent_message_researched(){
  console.log("initialisaiton");
  if(this.number_click_top>1){
    this.number_click_top-=1;
    if(this.list_of_messages_found[this.number_click_top-1]){
      this.show_less_results=false;
      if(this.current_list_of_messages==this.list_of_messages){
        let ind= this.list_of_messages.length-1-this.index_of_messages_found[this.number_click_top-1];
        this.renderer.setStyle(this.message_children.toArray()[ind].nativeElement, 'background-color', 'rgba(255, 255, 0, 0.5)');
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
        this.renderer.setStyle(this.message_children.toArray()[ind].nativeElement, 'background-color', 'rgba(255, 255, 0, 0.5)');
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
          if(!(this.list_of_messages[i].attachment_type=='file_attachment')){
            this.compteur_image_research+=1;
          }
          this.get_picture_for_message(i);
        }
        this.sort_pp(i);
      }
      this.cd.detectChanges();
      for(let i=0;i<this.list_of_messages.length;i++){
        console.log("in loop");
        if(this.list_of_messages[i].id==this.list_of_messages_found_complete[this.number_click_top-1].id){
          let ind= this.list_of_messages.length-1-i;
          this.renderer.setStyle(this.message_children.toArray()[ind].nativeElement, 'background-color', 'rgba(255, 255, 0, 0.5)');
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
        this.list_of_messages_pictures[i]=SafeURL;
      })
    }
    else if(this.list_of_messages[i].attachment_type=='picture_attachment'){
      this.chatService.get_attachment(this.list_of_messages[i].attachment_name).subscribe(t=>{
        let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.list_of_messages_pictures[i]=SafeURL;
      })
    }
    else if(this.list_of_messages[i].attachment_type=='file_attachment'){
      this.chatService.get_attachment(this.list_of_messages[i].attachment_name).subscribe(t=>{
        let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.list_of_messages_files[i]=SafeURL;
      })
    }
}
cancel_show_research_results(){
  this.research_message.reset();
  this.first_turn_loaded=false;
  this.show_research_results=false;
  this.message_children.toArray().forEach( (item, index) => {
    this.renderer.setStyle(item.nativeElement, 'background-color', 'white');
  });
  this.get_messages(this.id_chat_section);
  this.cd.detectChanges();
}

show_spinner_for_more=false;
show_spinner_for_less=false;
trigger_no_more=false;

see_more_messages(){

    this.show_spinner_for_more=true;
    this.message_children.toArray().forEach( (item, index) => {
      this.renderer.setStyle(item.nativeElement, 'background-color', 'white');
    });
    this.chatService.get_other_messages_more(this.friend_id,this.list_of_messages[this.list_of_messages.length-1].id,this.id_chat_section).subscribe(r=>{
      if(r[0][0]){
        let num=this.list_of_messages.length;
        for(let i=0;i<r[0].length;i++){
          this.list_of_messages.push(r[0][i]);
          this.list_of_messages_date.push(this.date_of_message(r[0][i].createdAt,0));
          this.sort_pp(num-1+i);
          this.get_picture_for_message(num-1+i);
          if(i==r[0].length-1){
            
            this.cd.detectChanges();
            let offset=this.message_children.toArray()[r[0].length].nativeElement.offsetTop;
            let height =this.message_children.toArray()[r[0].length].nativeElement.getBoundingClientRect().height
            this.myScrollContainer.nativeElement.scrollTop=offset-height-100;

            for(let j=0;j<this.list_of_messages.length;j++){
              if(this.list_of_messages[j].id==this.list_of_messages_found_complete[this.number_click_top-1].id){
                let ind= this.list_of_messages.length-1-j;
                this.renderer.setStyle(this.message_children.toArray()[ind].nativeElement, 'background-color', 'rgba(255, 255, 0, 0.5)');
              }
              if(j==this.list_of_messages.length-1){
                this.show_spinner_for_more=false;
              }
            }

          }
        }
      }
      else{
        console.log("no more");
        this.show_spinner_for_more=false;
        this.trigger_no_more=true;
      }
    });
}

see_less_messages(){
  
  
  this.chatService.get_less_messages(this.friend_id,this.list_of_messages[0].id,this.list_of_messages[this.list_of_messages.length-1].id,this.id_chat_section).subscribe(r=>{
    //console.log(r[0][0]);
    if(r[0]){
      this.message_children.toArray().forEach( (item, index) => {
        this.renderer.setStyle(item.nativeElement, 'background-color', 'white');
      });
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
          if(!(this.list_of_messages[i].attachment_type=='file_attachment')){
            this.compteur_image_research+=1;
          }
          this.get_picture_for_message(i);
        }
        this.sort_pp(i);
        if(i==r[0].length-1){
          this.cd.detectChanges();
          let offset=this.message_children.toArray()[num].nativeElement.offsetTop;
          let height =this.message_children.toArray()[num].nativeElement.getBoundingClientRect().height
          this.myScrollContainer.nativeElement.scrollTop=offset-height-100;

          for(let j=0;j<this.list_of_messages.length;j++){
            if(this.list_of_messages[j].id==this.list_of_messages_found_complete[this.number_click_top-1].id){
              let ind= this.list_of_messages.length-1-j;
              this.renderer.setStyle(this.message_children.toArray()[ind].nativeElement, 'background-color', 'rgba(255, 255, 0, 0.5)');
            }
          }

        }
      }
    }
    else{
      this.show_less_results=false;
    }
  });
}

endSearch(){
  this.research_message.reset();
  this.show_pre_searchbar_top=true;
  this.show_searchbar_top=false;
}



}