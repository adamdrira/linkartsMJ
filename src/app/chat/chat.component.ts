
import { Component, OnInit, HostListener, Input, Output, EventEmitter, SimpleChanges, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { FormControl, Validators, FormGroup} from '@angular/forms';
import { ChatService} from '../services/chat.service';
import { NavbarService } from '../services/navbar.service';
import { Profile_Edition_Service} from '../services/profile_edition.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscribing_service } from '../services/subscribing.service';
import { WebSocketService } from '../services/websocket.service';


declare var $: any;

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  constructor (
    private chatService:ChatService,
    private Subscribing_service:Subscribing_service,
    public navbar: NavbarService, 
    private sanitizer:DomSanitizer,
    private cd: ChangeDetectorRef,
    private WebSocketService:WebSocketService,
    private Profile_Edition_Service:Profile_Edition_Service
    ){
      this.navbar.show();
      chatService.messages.subscribe(msg=>{
        console.log(msg[0])
        //a person sends a message
        if(msg[0].id_user!="server" && msg[0].is_from_server!=true){
          console.log("it's not from server");
          //a person I am currently talking to
          if(msg[0].id_user==this.friend_id && msg[0].status!='seen'){
            console.log("user currently talking");
            //if it is nt a message to himmself
            if(msg[0].id_user!=msg[0].id_receiver){
              this.new_sort_friends_list.emit({friend_id:msg[0].id_user,message:msg[0]});
              if(this.list_of_messages.length>0){
                if(this.list_of_messages[0].id_user==this.friend_id){
                  this.list_of_show_pp_left[0]=false;
                  this.list_of_show_pp_left.splice(0,0,true);
                }
                this.list_of_messages.splice(0,0,(msg[0]));
              }
              else{
                this.list_of_messages.push(msg[0]);
                this.list_of_show_pp_left.push(true);
                this.display_messages=true;
              }
            }
            
            // tell the friend I read his message
            if(this.list_of_friends_ids.indexOf(this.friend_id)>=0){
              let message_to_send ={
                id_user:this.current_user_id,   
                id_receiver:this.friend_id, 
                message:msg[0].message,
                is_from_server:false,
                status:'seen',
                attachment_name:"none",
                is_an_attachment:false,
                attachment_type:"none",
              }
              this.chatService.messages.next(message_to_send);
              //function to update status rows to 'seen'
              this.chatService.let_all_friend_messages_to_seen(msg[0].id_user).subscribe(l=>{ })
            }
            
          }
          // one of my friends but not the one I am talking to
          else if(msg[0].id_user!=this.friend_id && this.list_of_friends_ids.indexOf(parseInt(msg[0].id_user))>=0  && msg[0].status!='seen' ){
            this.new_sort_friends_list.emit({friend_id:msg[0].id_user,message:msg[0]});
          }
          //not one of my friends
          if(this.list_of_friends_ids.indexOf(msg[0].id_user)<0  && msg[0].status!='seen' ){
            console.log("not one of my friends");
            this.new_sort_friends_list.emit({friend_id:msg[0].id_user,message:msg[0]});
          }
          // a message from your friend to tell you that he has seen the message
          else if(msg[0].id_user==this.friend_id && msg[0].status=="seen"){
            
            for(let i=0;i<this.list_of_messages.length;i++){
              if(this.list_of_messages[this.list_of_messages.length-1-i].status!='seen'){
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
          if(msg[0].id_user!=msg[0].id_receiver){
            this.list_of_messages[0].status="received";
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
          this.chatService.let_all_friend_messages_to_seen(this.friend_id).subscribe(l=>{
            console.log(l);
          });
          this.add_spam_to_contacts.emit({spam_id:this.friend_id,message:msg[0]});
        }
        
       
      })
  }

  //interaction with fchat_friends
  @Output() new_sort_friends_list = new EventEmitter<object>();
  @Output() add_spam_to_contacts = new EventEmitter<object>();
  

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
  current_friend_id:number=1;
  @Input() friend_pseudo: string;
  @Input() friend_name: string;
  @Input() friend_picture: SafeUrl;
  //friends
  @Input() list_of_friends_ids:any[];
  //if the other person has already sent a message
  response_exist=false;
  response_exist_retrieved=false;


  message_one:any;
  change_number=0;
  list_of_messages:any[]=[]
  display_messages=false;
  list_of_show_pp_left:any[]=[];
  index_of_show_pp_right=-1;

  list_of_time:any[]=[]
  display_retry:any[]=[];
 
  ngOnChanges(changes: SimpleChanges) {
    console.log("something_changed");
    console.log(this.current_friend_id);
    console.log(this.spam);
    console.log(this.change_number);
    console.log(this.friend_id);
    if(this.change_number>0 && this.current_friend_id!=this.friend_id){
      console.log("getting messages");
      this.get_messages();
      this.change_number=0;
    }
    this.change_number++;
    
    
  }
  
  ngOnInit() {
    console.log(this.friend_name)
    this.createFormControlsAds();
    this.createFormAd();
    this.get_messages();
    
    
      setInterval(() => {
        if(this.list_of_time.length>0){
          for(let i=0;i<this.list_of_time.length;i++){
            if(this.list_of_messages[i].status=='sent' && !this.display_retry[i]){
              let ending_time_of_view = Math.trunc(new Date().getTime()/1000)  - this.list_of_time[i];
              if(ending_time_of_view>5){
                this.display_retry[i]=true;
              }
            }
          }
        }
      }, 5000);
    
    
    
  };

 

  list_of_messages_pictures:any[]=[];
  get_messages(){
    this.list_of_show_pp_left=[];
    this.list_of_messages=[];
    this.list_of_time=[];
    this.index_of_show_pp_right=-1;
    if(this.spam=='false'){
      this.chatService.let_all_friend_messages_to_seen(this.friend_id).subscribe(l=>{})
    }
    this.current_friend_id=this.friend_id;
    this.chatService.get_first_messages(this.current_user_id,this.friend_id).subscribe(r=>{
      this.list_of_messages=r[0];
      console.log(this.list_of_messages)
      if(r[0].length>0){
        for(let i=0;i<r[0].length;i++){
          if(this.list_of_messages[i].is_an_attachment){
            if(this.list_of_messages[i].attachment_type='picture'){
              console.log(this.list_of_messages[i].attachment_name);
              //this.list_of_messages_pictures[i]=safeurl;
            }
          }
          
          if(i==0 && r[0][i].id_user==this.friend_id ){
            this.list_of_show_pp_left[i]=true;
            
          }
          if(r[0][i].id_user==this.current_user_id && r[0][i].status=="seen" && this.index_of_show_pp_right<0){
            this.index_of_show_pp_right=i;
          }
          if(i>0){  
            if(r[0][i].id_user==this.friend_id && r[0][i].id_user!=r[0][i-1].id_user){
              this.list_of_show_pp_left[i]=true;
            }
          }
          if(i==r[0].length-1){
            this.chatService.check_if_response_exist(this.friend_id).subscribe(l=>{
              if(l[0].value){
                this.response_exist=true;
              }
              else{
                  this.response_exist=false;
              }
              this.response_exist_retrieved=true;
              console.log(this.response_exist)
              this.display_messages=true;
            })
          }
        }
      }
      else{
        this.response_exist=false;
        this.response_exist_retrieved=true;
        this.display_messages=true;
      }
      
      
    })
  }

 
  //send message

  @ViewChild('input') input:ElementRef;
  
  activateFocus() {
    this.input.nativeElement.focus();
  }

  input_message(event){
   /* console.log("input_message");
    console.log(this.message_group.value.message);
    console.log(event);*/
  }

  number_of_shift=0;
  on_keydown(event){
    console.log("message change");
    console.log(event.key);
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
          for(let i=0;i<this.attachments.length;i++){
            this.send_picture(i);
          }
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

  display_attachments=false;
  attachments:any[]=[];
  attachments_for_sql:any[]=[];
  attachments_type:any[]=[];
  onPaste(event: ClipboardEvent) {
    var re = /(?:\.([^.]+))?$/;
    console.log(event);
    if(event.clipboardData.files[0]){
      let size = event.clipboardData.files[0].size/1024/1024;
      let blob = event.clipboardData.files[0];
      let name=event.clipboardData.files[0].name;
      console.log(blob);
      console.log(size)
      if( re.exec(name)[1]=="jpeg" || re.exec(name)[1]=="png" || re.exec(name)[1]=="jpg"){
        let url = (window.URL) ? window.URL.createObjectURL(blob) : (window as any).webkitURL.createObjectURL(blob);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.attachments.push(SafeURL);
        this.attachments_type.push('picture');
        this.attachments_for_sql.push(blob);
        this.display_attachments=true;
      }
    }
  }

  remove_attachment(i){
    this.attachments.splice(i,1);
    this.attachments_for_sql.splice(i,1);
    this.attachments_type.splice(i,1);
    if(this.attachments.length==0){
      this.display_attachments=false;
    }
  }

  
  createFormControlsAds() {
    this.message = new FormControl('')}

  createFormAd() {
    this.message_group = new FormGroup({
      message: this.message,
    });
  }

  send_message(){
    if(this.attachments.length>0){
      for(let i=0;i<this.attachments.length;i++){
        this.send_picture(i);
      }
    }
    this.message_one ={
      id_user:this.current_user_id,   
      id_receiver:this.friend_id,  
      message:this.message_group.value.message,
      is_from_server:false,
      status:"sent"
    }
    this.list_of_messages.splice(0,0,(this.message_one));
    this.index_of_show_pp_right=this.index_of_show_pp_right+1;
    this.list_of_show_pp_left.splice(0,0,false);
    this.display_retry.splice(0,0,false);
    this.list_of_time.splice(0,0,Math.trunc(new Date().getTime()/1000));  
    this.chatService.messages.next(this.message_one);
    console.log(this.message_one);
    this.input.nativeElement.value='';
    this.message_group.value.message='';
    this.display_attachments=false;
    let len=this.attachments.length;
    for(let i=0;i<len;i++){
      this.attachments.pop();
      if(i==len-1){
       console.log(this.attachments)
      }
    }
  }

  send_picture(i){
    var re = /(?:\.([^.]+))?$/;
    console.log("sending picture");
    console.log(this.attachments_for_sql[i]);
    let file=this.attachments_for_sql[i];
    
    var today = new Date();
    var ms = String(today.getMilliseconds()).padStart(2, '0');
    var ss = String(today.getSeconds()).padStart(2, '0');
    var mi = String(today.getMinutes()).padStart(2, '0');
    var hh = String(today.getHours()).padStart(2, '0');
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); 
    var yyyy = today.getFullYear();
    let Today = yyyy + mm + dd + hh+ mi + ss + ms;
    let file_name = this.current_user_id + '-' + Today + '.' + re.exec(file.name)[1];
    
    let message ={
      id_user:this.current_user_id,   
      id_receiver:this.friend_id,  
      message:null,
      attachment_name:file_name,
      attachment_type:"picture",
      is_an_attachment:true,
      is_from_server:false,
      status:"sent"
    };
    this.chatService.chat_sending_images(file,re.exec(file.name)[1],file_name).subscribe(l=>{
      console.log(l);
      this.chatService.messages.next(message)
    })
    this.index_of_show_pp_right=this.index_of_show_pp_right+1;
    this.list_of_show_pp_left.splice(0,0,false);
    this.list_of_messages_pictures.splice(0,0,this.attachments[i]);
    this.list_of_messages.splice(0,0,(message));
    
    if(i==this.attachments.length){
      this.attachments_type=[];
      this.attachments_for_sql=[];
      this.attachments=[];
      this.display_attachments=false;
    }
    
   
  }

  retry(message){
    let index=this.list_of_messages.indexOf(message);
    if(index>=0){
      this.chatService.messages.next(this.list_of_messages[index]);
    }
  }

  //spam

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
        attachment_name:"none",
        attachment_type:"none",
        is_an_attachment:false,
      };
      this.chatService.messages.next(message_one);
    })
   
  }


  

    
}