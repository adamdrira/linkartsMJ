
import { Component, OnInit, HostListener, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormControl, Validators, FormGroup} from '@angular/forms';
import { ChatService} from '../services/chat.service';
import { NavbarService } from '../services/navbar.service';
import { Profile_Edition_Service} from '../services/profile_edition.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscribing_service } from '../services/subscribing.service';


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
    private Profile_Edition_Service:Profile_Edition_Service
    ){
      this.navbar.show();
      chatService.messages.subscribe(msg=>{
        console.log(msg[0])
        //a person sends a message
        if(msg[0].id_user!="server"){
          //a person I am currently talking to
          if(parseInt(msg[0].id_user)==this.friend_id && msg[0].status!='seen'){
            //if it is nt a message to himmself
            if(parseInt(msg[0].id_user)!=parseInt(msg[0].id_receiver)){
              this.new_sort_friends_list.emit({friend_id:msg[0].id_user,my_message:false});
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
            let message_to_send ={
              id_user:this.current_user_id,   
              id_receiver:this.friend_id, 
              message:msg[0].message,
              status:'seen',
            }
            this.chatService.messages.next(message_to_send);
            //function to update status rows to 'seen'
            this.chatService.let_all_friend_messages_to_seen(msg[0].id_user).subscribe(l=>{ })
          }
          // one of my friends but not the one I am talking to
          else if(msg[0].id_user!=this.friend_id && this.list_of_friends_ids.indexOf(parseInt(msg[0].id_user))>=0  && msg[0].status!='seen' ){
            this.new_sort_friends_list.emit({friend_id:msg[0].id_user,my_message:false});
          }
          //not one of my friends
          if(this.list_of_friends_ids.indexOf(msg[0].id_user)<0  && msg[0].status!='seen' ){
            this.new_sort_friends_list.emit({friend_id:msg[0].id_user,my_message:false});
          }
          // a message from your friend to tell you that yout friend has seen the message
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
        else if(msg[0].message=="received" ){
          if(msg[0].id_user!=msg[0].id_receiver){
            this.list_of_messages[0].status="received";
          }
          this.new_sort_friends_list.emit({friend_id:msg[0].id_user,my_message:false});
          this.list_of_time.pop();
        }
        
       
      })
  }

  //interaction with fchat_friends
  @Output() new_sort_friends_list = new EventEmitter<object>();
  //message_to_send
  message_group: FormGroup;
  message: FormControl;
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
  //if there is a problem
  //list_of_messages_to_send:any[]=[];


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
    if(this.change_number>0 && this.current_friend_id!=this.friend_id){
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

 


  get_messages(){
    this.list_of_show_pp_left=[];
    this.list_of_messages=[];
    this.list_of_time=[];
    this.index_of_show_pp_right=-1;
    this.chatService.let_all_friend_messages_to_seen(this.friend_id).subscribe(l=>{})
    this.current_friend_id=this.friend_id;
    this.chatService.get_first_messages(this.current_user_id,this.friend_id).subscribe(r=>{
      this.list_of_messages=r[0];
      console.log(r[0])
      for(let i=0;i<r[0].length;i++){
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
            this.display_messages=true;
          }
        
        
      }
      
    })
  }

 
  
  
  createFormControlsAds() {
    this.message = new FormControl('')}

  createFormAd() {
    this.message_group = new FormGroup({
      message: this.message,
    });
  }

  send_message(){
    this.message_one ={
      id_user:this.current_user_id,   
      id_receiver:this.friend_id,  
      message:this.message_group.value.message,
      status:"sent"
    }
    this.list_of_messages.splice(0,0,(this.message_one));
    this.index_of_show_pp_right=this.index_of_show_pp_right+1;
    this.list_of_show_pp_left.splice(0,0,false);
    this.display_retry.splice(0,0,false);
    this.list_of_time.splice(0,0,Math.trunc(new Date().getTime()/1000));  
    this.chatService.messages.next(this.message_one);
    
  }

  retry(message){
    let index=this.list_of_messages.indexOf(message);
    if(index>=0){
      this.chatService.messages.next(this.list_of_messages[index]);
    }
  }


  

    
}