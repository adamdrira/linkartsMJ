
import { Component, OnInit, HostListener, Input, Output, EventEmitter, SimpleChanges, ChangeDetectorRef, ElementRef, ViewChild, Renderer2, ViewChildren, QueryList } from '@angular/core';
import { FormControl, Validators, FormGroup} from '@angular/forms';
import { ChatService} from '../services/chat.service';
import { Profile_Edition_Service} from '../services/profile_edition.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscribing_service } from '../services/subscribing.service';
import { WebSocketService } from '../services/websocket.service';
import { NavbarService } from '../services/navbar.service';
import {PopupConfirmationComponent} from '../popup-confirmation/popup-confirmation.component'
import { MatDialog } from '@angular/material/dialog';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { NavbarLinkartsComponent } from '../navbar-linkarts/navbar-linkarts.component';
import { PopupFormComponent } from '../popup-form/popup-form.component';
import { PopupChatGroupMembersComponent } from '../popup-chat-group-members/popup-chat-group-members.component';

declare var $: any;
var url = 'http://localhost:4600/routes/upload_attachments_for_chat/';

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
    private navbar :NavbarService,
    private WebSocketService:WebSocketService,
    private Profile_Edition_Service:Profile_Edition_Service
    ){
      //navbar
      navbar.set_using_chat();
      //uploader
      this.uploader = new FileUploader({
        url:url,
      });
      this.hasBaseDropZoneOver = false;
      this.hasAnotherDropZoneOver = false;
      //message received
      chatService.messages.subscribe(msg=>{
        if(!msg[0].for_notifications){
          console.log(msg[0])
          console.log(this.list_of_messages)
          //a person sends a message
          if(msg[0].id_user!="server" && !msg[0].is_from_server){
            console.log("it's not from server");
            console.log(msg[0].status)
            if(msg[0].is_a_group_chat){
              console.log("is from a group");
              //currently in the group talking to my friends
              if(msg[0].id_user==this.friend_id && msg[0].status!='seen' && this.friend_type=='group'){
                console.log("user currently talking");
                this.new_sort_friends_list.emit({friend_id:msg[0].id_user,message:msg[0],friend_type:'group'});
                let message=msg[0];
                message.id_user=msg[0].real_id_user;
                
                // tell the friend I read his message if I am present;
                console.log(this.user_present);
                console.log(this.list_of_show_pp_left);
                console.log(this.index_of_show_pp_right);
                if(this.user_present && msg[0].id_chat_section==this.id_chat_section){
                  console.log("i am present")
                  let message_to_send ={
                    id_user_name:this.current_user_name,
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
                  console.log("putting this message to seen")
                  console.log("send seen after receiving message")
                  this.chatService.messages.next(message_to_send);
                  this.chatService.let_all_friend_messages_to_seen(msg[0].id_user,this.id_chat_section,true).subscribe(l=>{ })
                  
                }
                if(this.list_of_messages.length>0){
                  this.list_of_messages.splice(0,0,message);
                }
                else{
                  this.list_of_messages.push(message);
                  this.display_messages=true;
                }

                  
              }
              // a message from your friend to tell you that he has seen the message
              else if(msg[0].id_receiver==this.friend_id && msg[0].status=='seen' && this.friend_type=='group'){
                console.log(" from my friend to tell seen")
                for(let i=0;i<this.list_of_messages.length;i++){
                  //on rajoute l'utilisateur qui a vu les messages dans la liste des utilisateur qui ont vu les messages
                  if(this.list_of_messages[i].list_of_users_who_saw.indexOf(msg[0].id_user)<0 && this.list_of_messages[i].id_user!=msg[0].id_user && this.list_of_messages[i].id){
                    this.list_of_messages[i].list_of_users_who_saw.push(msg[0].id_user);
                    console.log(this.list_of_messages[i])
                    if(this.list_of_messages[i].list_of_users_who_saw.length== this.list_of_messages[i].list_of_users_in_the_group.length){
                      this.list_of_messages[i].status=='seen';
                    }
                  }
                }
                console.log("change message status 1")
                this.change_message_status.emit({id_chat_section:msg[0].id_chat_section,status:"seen",friend_id:msg[0].id_receiver,friend_type:'group',spam:false,real_friend_id:msg[0].id_user});
                this.cd.detectChanges();
              }
              else if(msg[0].id_receiver!=this.friend_id && msg[0].status=="seen"){
                console.log("in the else if seen")
                console.log("change message status 2")
                this.change_message_status.emit({id_chat_section:msg[0].id_chat_section,status:"seen",friend_id:msg[0].id_receiver,friend_type:'group',spam:false,real_friend_id:msg[0].id_user});
              }
              else{
                console.log(msg[0].status)
                console.log("in the else ");
                this.new_sort_friends_list.emit({friend_id:msg[0].id_user,message:msg[0],friend_type:'group'});
              }
              /***********suuite ******** */
            }
            else{
              console.log("is from a user ");
              //a person I am currently talking to
              if(msg[0].id_user==this.friend_id && msg[0].status!='seen'  && this.friend_type=='user'){
                console.log("user currently talking");
                //if it isnt a message to himmself
                if(msg[0].id_user!=msg[0].id_receiver && msg[0].id_chat_section==this.id_chat_section){
                  console.log("not talking to myself");
                  this.new_sort_friends_list.emit({friend_id:msg[0].id_user,message:msg[0],friend_type:'user'});
                  let message = msg[0];
    
                  // tell the friend I read his message if I am present;
                  console.log(this.user_present);
                  console.log(this.list_of_show_pp_left);
                  console.log(this.index_of_show_pp_right);
                  if(this.user_present && msg[0].id_chat_section==this.id_chat_section){
                    console.log("i am present");
                    message.status='seen';
                    let message_to_send ={
                      id_user_name:this.current_user_name,
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
                      console.log("putting this message to seen")
                      console.log("send seen after receiving message 2")
                      this.chatService.messages.next(message_to_send);
                      this.chatService.let_all_friend_messages_to_seen(msg[0].id_user,this.id_chat_section,false).subscribe(l=>{ })
                    
                  }

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
                    this.list_of_messages.splice(0,0,(message));
                  }
                  else{
                    this.list_of_messages.push(message);
                    this.list_of_show_pp_left.push(true);
                    this.display_messages=true;
                  }
                  
                }
                else if(msg[0].id_user!=msg[0].id_receiver && msg[0].id_chat_section!=this.id_chat_section){
                  this.new_sort_friends_list.emit({friend_id:msg[0].id_user,message:msg[0],id_chat_section:this.id_chat_section,friend_type:'user'});
                  this.show_notification_message=true;
                  let ind=this.list_of_chat_sections_id.indexOf(msg[0].id_chat_section);
                  this.list_of_chat_sections_notifications[ind]=true;
                  this.cd.detectChanges();
                }
              }
              // a message from your friend to tell you that he has seen the message
              else if(msg[0].id_user==this.friend_id && msg[0].status=="seen"){
                console.log(" from my friend to tell seen")
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
                    console.log(this.index_of_show_pp_right)
                    
                  }
                }
                this.change_message_status.emit({id_chat_section:msg[0].id_chat_section,status:"seen",friend_id:msg[0].id_user,friend_type:'user'});
                this.cd.detectChanges();
              }
              // not the friend I am talking to but seen
              else if(msg[0].id_user!=this.friend_id && msg[0].status=="seen"){
                console.log("in the else if seen")
                console.log("change message status 3")
                this.change_message_status.emit({id_chat_section:msg[0].id_chat_section,status:"seen",friend_id:msg[0].id_user,friend_type:'user'});
              }
              // not the friend I am talking to and not seen
              else{
                this.new_sort_friends_list.emit({friend_id:msg[0].id_user,message:msg[0],friend_type:'user'});
              }
            }
            
          }
          else if(msg[0].server_message=="received_new"){
            console.log("received new but not here")
            if(msg[0].message.is_a_group_chat){
              if(!this.user_present){
                console.log("group rec")
                if(this.friend_type=='group' && this.friend_id==msg[0].id_receiver){
                  this.change_group();
                }
              }
            }
            else{
              if(this.spam=='true'){
                console.log(msg[0].message.id_receiver)
                this.add_spam_to_contacts.emit({spam_id:msg[0].message.id_receiver,message:msg[0].message});
                this.cd.detectChanges;
                console.log("in spam with spam");
              }
              else{
                console.log("not in spam")
                this.new_sort_friends_list.emit({friend_id:msg[0].message.id_receiver,message:msg[0].message,friend_type:'user'});
              }
            }
          }
          //a message from the server to tell that the message has been sent
          else if(msg[0].server_message=="received" ){
            //ajouter une fonction pour récupérer le message qui n'a pas été envoyé sur ce client
            console.log("it's from server and it's received");
            console.log(this.user_present)
            console.log(this.friend_id)
            if(this.user_present){
              if(msg[0].message.is_a_group_chat){
                console.log(this.temporary_id);
                console.log(this.attachments);
                if(msg[0].message.attachment_type=="picture_message" ||msg[0].message.attachment_type=="picture_attachment" ||msg[0].message.attachment_type=="file_attachment" ){
                  // on ne peut pas envoyer plus de 5 images en même temps dans un message
                  for(let i=0;i<((this.list_of_messages.length>=50)?50:this.list_of_messages.length);i++){
                    if(this.list_of_messages[i].attachment_name==msg[0].message.attachment_name && !(this.list_of_messages[i].id)){
                      console.log(this.list_of_messages[i]);
                      this.list_of_messages[i].status="received";
                      this.list_of_messages[i].id=msg[0].id_message;
                      this.cd.detectChanges();
                    }
                  }
                }
                else{
                  for(let i=0;i<((this.list_of_messages.length>=50)?50:this.list_of_messages.length);i++){
                    if(this.list_of_messages[i].temporary_id==msg[0].message.temporary_id  && !(this.list_of_messages[i].id)){
                      this.list_of_messages[i].status="received";
                      this.list_of_messages[i].id=msg[0].id_message;
                      console.log(this.list_of_messages[i]);
                      this.cd.detectChanges();
                    }
                  }
                }
                
                this.new_sort_friends_list.emit({friend_id:this.friend_id,message:msg[0].message,friend_type:'group'});
                this.list_of_time.pop();
              }
              else{
                console.log("receiving a ttachment user")
                if(msg[0].message.id_user!=msg[0].message.id_receiver){
                  console.log(this.temporary_id);
                  console.log(msg[0]);
                  console.log(this.list_of_messages)
                  if(msg[0].message.attachment_type=="picture_message" ||msg[0].message.attachment_type=="picture_attachment" ||msg[0].message.attachment_type=="file_attachment" ){
                    // on ne peut pas envoyer plus de 5 images en même temps dans un message
                    for(let i=0;i<((this.list_of_messages.length>=50)?50:this.list_of_messages.length);i++){
                      if(this.list_of_messages[i].attachment_name==msg[0].message.attachment_name && !(this.list_of_messages[i].id)){
                        console.log(this.list_of_messages[i]);
                        this.list_of_messages[i].status="received";
                        this.list_of_messages[i].id=msg[0].id_message;
                        this.cd.detectChanges();
                      }
                    }
                  }
                  else{
                    let length=((this.list_of_messages.length>=50)?50:this.list_of_messages.length)
                    for(let i=0;i<length;i++){
                      if(this.list_of_messages[i].temporary_id==msg[0].message.temporary_id && !(this.list_of_messages[i].id)){
                        this.list_of_messages[i].status="received";
                        this.list_of_messages[i].id=msg[0].id_message;
                        console.log(this.list_of_messages[i])
                        
                        this.cd.detectChanges();
                      }
                    }
                  }
                }
                else{
                  console.log("it's else and going seen")
                  if(msg[0].message.attachment_type=="picture_message" ||msg[0].message.attachment_type=="picture_attachment" ||msg[0].message.attachment_type=="file_attachment" ){
                    // on ne peut pas envoyer plus de 5 images en même temps dans un message
                    for(let i=0;i<((this.list_of_messages.length>=50)?50:this.list_of_messages.length);i++){
                      if(this.list_of_messages[i].attachment_name==msg[0].message.attachment_name){
                        this.list_of_messages[i].status="seen";
                      }
                    }
                  }
                  else{
                    for(let i=0;i<((this.list_of_messages.length>=50)?50:this.list_of_messages.length);i++){
                      if(this.list_of_messages[i].message==msg[0].message.message){
                        console.log("putting message on seen");
                        this.list_of_messages[i].status="seen";
                      }
                    }
                  }
                  this.chatService.let_all_friend_messages_to_seen(msg[0].message.id_user,this.id_chat_section,false).subscribe(l=>{ })
                }
                this.new_sort_friends_list.emit({friend_id:msg[0].id_receiver,message:msg[0].message,friend_type:'user'});
                this.list_of_time.pop();
              }
            }
            else{
              
              console.log("user is not here");
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
            console.log("new");
            if(msg[0].is_a_group_chat){
              console.log("adding new group to contacts")
              this.add_group_to_contacts.emit({friend_id:msg[0].id_receiver,message:msg[0]});
              this.cd.detectChanges;
            }
            else{
              if(this.spam=='true'){
                this.add_spam_to_contacts.emit({spam_id:msg[0].id_user,message:msg[0]});
                this.cd.detectChanges;
                console.log("in spam with spam");
              }
              else{
                console.log("not in spam")
                this.new_sort_friends_list.emit({friend_id:msg[0].id_user,message:msg[0],friend_type:'user'});
              }
            }
          }
          else if(msg[0].server_message=="received_new_friend_in_the_group"){
            console.log("received_new_friend_in_the_group")
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
            console.log("New_friend_in_the_group");
            console.log("adding new group to contacts")
            let index=-1;
            for(let i=0;i<this.list_of_friends_ids.length;i++){
              if(this.list_of_friends_ids[i]==msg[0].id_user && this.list_of_friends_types[i]=='group'){
                index=i;
              }
            }
            if(index>0){
              console.log(index)
              if(this.friend_id==msg[0].id_user && this.friend_type=='group'){
                console.log('cur tak')
                this.list_of_messages.splice(0,0,msg[0]);
              }
            }
            this.new_sort_friends_list.emit({friend_id:msg[0].id_user,message:msg[0],friend_type:'group',value:false});
            this.cd.detectChanges;
            
          }
          else if(msg[0].message=="Exit"){
            console.log("Exit");
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
            console.log("writing message")
            console.log(msg[0].group_chat_id )
            console.log(msg[0].id_user_writing)
            if(!msg[0].group_chat_id && this.friend_id==msg[0].id_user_writing){
              this.display_writing=true;
              this.section_where_is_writing=msg[0].message;
              this.cd.detectChanges();
            }
            else if(msg[0].group_chat_id && this.friend_id==msg[0].group_chat_id && this.current_user_id!=msg[0].id_user_writing){
              this.display_writing=true;
              this.section_where_is_writing=msg[0].message;
              
              if(this.list_of_users_writing.indexOf(msg[0].id_user_writing)<0){
                this.list_of_users_writing.push(msg[0].id_user_writing)
              }
              console.log(this.list_of_users_writing)
              this.cd.detectChanges();
            }
            
          }
          else if(msg[0].server_message=="not-writing" ){
            console.log(" not-writing message")
            if(!msg[0].group_chat_id && this.friend_id==msg[0].id_user_writing){
              this.display_writing=false;
              this.cd.detectChanges();
            }
            else if(msg[0].group_chat_id && this.friend_id==msg[0].group_chat_id && this.current_user_id!=msg[0].id_user_writing){
              this.display_writing=false;
              let index=this.list_of_users_writing.indexOf(msg[0].id_user_writing);
              if(index>0){
                this.list_of_users_writing.splice(index,1)
              }
              console.log(this.list_of_users_writing)
              this.cd.detectChanges();
            }
          }
          else if(msg[0].server_message=="emoji" ){
            console.log(" emoji change message")
            console.log(msg[0])
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
                    console.log( this.list_of_messages_reactions[msg[0].id_message])
                }
                else{
                    let index= this.list_of_messages_reactions[msg[0].id_message].indexOf(msg[0].message.old_emoji)
                    this.list_of_messages_reactions[msg[0].id_message].splice(index,1,msg[0].message.new_emoji)
                    this.list_of_messages_reactions[msg[0].id_message].sort();
                    console.log( this.list_of_messages_reactions[msg[0].id_message]);
                }
              }
              else{
                  console.log(this.list_of_messages_reactions[msg[0].id_message])
                  if(this.list_of_messages_reactions[msg[0].id_message]){
                    this.list_of_messages_reactions[msg[0].id_message].push(msg[0].message.new_emoji);
                  }
                  else{
                    this.list_of_messages_reactions[msg[0].id_message]=[msg[0].message.new_emoji];
                  }
                  
                  this.list_of_messages_reactions[this.list_of_messages[msg[0].id_message].id].sort();
                  console.log( this.list_of_messages_reactions[msg[0].id_message]);
              }
            }
          }
          
          
        }
      })
  }

  //click lisner for emojis, and research chat
  @HostListener('document:click', ['$event.target'])
  clickout(btn) {
    if(this.reactions_shown){
      console.log(this.emojis_reactions.toArray()[this.index_of_children_reactions].nativeElement);
      if (!(this.emojis_reactions.toArray()[this.index_of_children_reactions].nativeElement.contains(btn)) && btn!=this.target_clicked){
        console.log('on est ailleurs');
        console.log(btn);
        this.emojis_reactions.toArray()[this.index_of_children_reactions].nativeElement.classList.add("closed");
        this.reactions_shown=false;
      }
    }

    if(this.show_emojis){
      console.log("emoji shown");
      if (!(this.emojis.nativeElement.contains(btn) || this.emoji_button.nativeElement.contains(btn))){
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

 
  /*******************************************ON CHANGES ************************** */
  /*******************************************ON CHANGES ************************** */
  /*******************************************ON CHANGES ************************** */
  /*******************************************ON CHANGES ************************** */
  /*******************************************ON CHANGES ************************** */
  ngOnChanges(changes: SimpleChanges) {
    console.log("change");
    if(changes.user_present ){
      if(this.user_present && this.spam=='false'){
        console.log(this.id_chat_section);
        console.log("user presence change")
        this.chatService.let_all_friend_messages_to_seen(this.friend_id,this.id_chat_section,(this.friend_type=='group')?true:false).subscribe(l=>{
          console.log(l[0])
          if(!(l[0].message)){
            let message_to_send ={
              id_user_name:this.current_user_name,
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
            console.log("send seen after change 1")
            this.chatService.messages.next(message_to_send);
          }
          
         });
          console.log("changing status to seen friend")
         
         
          this.change_message_status.emit({id_chat_section:this.id_chat_section,status:"seen",friend_id:this.friend_id,friend_type:this.friend_type,spam:false,real_friend_id:this.current_user_id});


         
      }
      else{
        this.desactivateFocus();
      }
      return
    }
    if((this.friend_type!=this.current_friend_type)|| (this.friend_id!=this.current_friend_id)){
      console.log("changement de friend");
      this.show_pre_searchbar_top=true;
      this.show_searchbar_top=false;
      if(this.show_research_results){
        this.research_message.reset();
        this.first_turn_loaded=false;
        this.show_research_results=false;
        
        this.message_children.toArray().forEach( (item, index) => {
          this.renderer.setStyle(item.nativeElement, 'background-color', 'white');
        });
      }
      if(this.friend_type=='user'){
          this.change_user();
      }
      else{
          this.change_group();
      }
      return;
    }
    if(changes.spam){
      console.log("changement de spam value")
      if(this.spam=='false'){
        console.log("value false")
        this.change_user();
      }
    }
    
   
  }

  can_get_other_messages=false;
  show_spinner=false;
  
  change_user(){
    console.log(this.chat_friend_id)
    this.uploader.setOptions({ url: url+`${this.friend_type}/${this.chat_friend_id}/`});
    console.log("getting messages");
    this.list_of_users_names_retrieved=false;
    this.today_triggered=false;
    this.display_writing=false;
    this.compteur_chat_section=0;
    this.top_sumo_loaded=false;
    this.function_done=false;
    this.trigger_no_more=false;
    this.can_get_other_messages=false;
    this.list_of_chat_sections_found=[];
    this.list_of_chat_sections_found_id=[];
    this.no_result_container_research_chat=false;
    this.show_container_research_chat=false;
    this.show_container_research_chat_results=false;
    this.first_turn_loaded=false;
    this.current_friend_id=this.friend_id;
    this.current_friend_type=this.friend_type;
    this.list_of_chat_sections_notifications=[];
    this.list_of_chat_sections_id=[1];
    this.list_of_chat_sections=["Discussion principale"];
    this.cd.detectChanges();
    this.get_messages(this.id_chat_section,false);
    this.change_number=0;
    console.log("cheking user present")
    console.log(this.user_present)
    console.log(this.spam);
    if(this.user_present && this.spam=='false'){
      console.log(this.id_chat_section);
      console.log("putting messages to seen")
      console.log(this.friend_id)
      this.chatService.let_all_friend_messages_to_seen(this.friend_id,this.id_chat_section,false).subscribe(l=>{
        console.log(l[0])
        if(!(l[0].message)){
          let message_to_send ={
            id_user_name:this.current_user_name,
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
          console.log("send seen after change 2")
          this.chatService.messages.next(message_to_send);
        }
        
      });
      
      console.log("change message status 5")
      this.change_message_status.emit({id_chat_section:this.id_chat_section,status:"seen",friend_id:this.friend_id,friend_type:this.friend_type,spam:false});

        
    }
  }

  change_group(){
    this.list_of_messages=[];
    console.log(this.chat_friend_id)
    console.log("getting messages group");
    this.uploader.setOptions({ url: url+`${this.friend_type}/${this.chat_friend_id}/`});
    this.function_done=false;
    this.trigger_no_more=false;
    this.list_of_users_names_retrieved=false;
    this.today_triggered=false;
    this.can_get_other_messages=false;
    this.top_sumo_loaded=false;
    this.compteur_chat_section=0;
    this.display_writing=false;
    this.list_of_chat_sections_found=[];
    this.list_of_chat_sections_found_id=[];
    this.no_result_container_research_chat=false;
    this.show_container_research_chat=false;
    this.show_container_research_chat_results=false;
    this.first_turn_loaded=false;
    this.current_friend_id=this.friend_id;
    this.current_friend_type=this.friend_type;
    this.list_of_chat_sections_notifications=[];
    this.list_of_chat_sections_id=[1];
    this.list_of_chat_sections=["Discussion principale"];
    this.cd.detectChanges();
    this.get_messages(this.id_chat_section,true);
    this.change_number=0;
    this.chatService.get_group_chat_information(this.friend_id).subscribe(info=>{
      let compt_user=0;
      let list_of_receivers_ids=info[0].list_of_receivers_ids;
      for(let i=0;i<list_of_receivers_ids.length;i++){
        this.Profile_Edition_Service.retrieve_profile_data(list_of_receivers_ids[i]).subscribe(r=>{
          this.list_of_users_names[r[0].id]=r[0].firstname + ' ' + r[0].lastname;
          this.Profile_Edition_Service.retrieve_profile_picture(list_of_receivers_ids[i]).subscribe(p=>{
            let url = (window.URL) ? window.URL.createObjectURL(p) : (window as any).webkitURL.createObjectURL(p);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_users_profile_pictures[list_of_receivers_ids[i]]=SafeURL;
            compt_user++;
            if(compt_user==list_of_receivers_ids.length){
              console.log("list_of_users_names")
                console.log(this.list_of_users_names)
                console.log(this.list_of_users_profile_pictures)
              this.list_of_users_names_retrieved=true;
            }
          })
          
        })
      }
    })
    
    if(this.user_present){
      console.log(this.id_chat_section);
      console.log("putting messages to seen")
      this.chatService.let_all_friend_messages_to_seen(this.friend_id,this.id_chat_section,true).subscribe(l=>{
        console.log(l[0])
        if(!(l[0].message)){
          let message_to_send ={
            id_user_name:this.current_user_name,
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
          console.log("send seen after change 3")
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

  ngOnInit() {
    this.uploader.setOptions({ url: url+`${this.friend_type}/${this.chat_friend_id}/`});
    console.log(this.id_chat_section);
    if(this.friend_type=='group'){
      this.chatService.get_group_chat_information(this.friend_id).subscribe(info=>{
        let compt_user=0;
        let list_of_receivers_ids=info[0].list_of_receivers_ids;
        for(let i=0;i<list_of_receivers_ids.length;i++){
          this.Profile_Edition_Service.retrieve_profile_data(list_of_receivers_ids[i]).subscribe(r=>{
            this.list_of_users_names[r[0].id]=r[0].firstname + ' ' + r[0].lastname;
            this.Profile_Edition_Service.retrieve_profile_picture(list_of_receivers_ids[i]).subscribe(p=>{
              let url = (window.URL) ? window.URL.createObjectURL(p) : (window as any).webkitURL.createObjectURL(p);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_users_profile_pictures[list_of_receivers_ids[i]]=SafeURL;
              compt_user++;
              if(compt_user==list_of_receivers_ids.length){
                console.log("list_of_users_names")
                  console.log(this.list_of_users_names)
                  console.log(this.list_of_users_profile_pictures)
                this.list_of_users_names_retrieved=true;
              }
            })
            
          })
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
    console.log(this.friend_type)
      setInterval(() => {
        
        //scroll bar managment
        if(this.myScrollContainer.nativeElement.scrollTop==0 && this.put_messages_visible && !this.show_research_results && !this.trigger_no_more){
          if(this.can_get_other_messages){
            this.compteur_get_messages++;
            this.can_get_other_messages=false;
            this.show_spinner=true;
            console.log("on est au bout")
            this.chatService.get_other_messages(this.compteur_get_messages, this.friend_id,this.list_of_messages[this.list_of_messages.length-1].id,this.id_chat_section,this.list_of_messages_reactions,(this.friend_type=='group')?true:false).subscribe(r=>{
              console.log(r[0][0]);
              console.log(r[0][1].list_of_messages_reactions)
              console.log(r[1])
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
                  if(i==r[0][0].length-1){
                    this.calculate_dates_to_show()
                    this.show_spinner=false;
                    this.cd.detectChanges();
                    let offset=this.message_children.toArray()[r[0][0].length].nativeElement.offsetTop;
                    let height =this.message_children.toArray()[r[0][0].length].nativeElement.getBoundingClientRect().height
                    this.myScrollContainer.nativeElement.scrollTop=offset-height;
                    console.log("scroll dans interval")
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
      

      // retry managment
      setInterval(() => {
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
      }, 5000);
    
    
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
        console.log(this.attachments_name)
    };

    this.uploader.onCompleteItem = (file) => {
      this.k++;
      console.log(file._file)
      if(this.k<this.uploader.queue.length){
        console.log("checking complete 1")
        this.chatService.check_if_file_exists((this.friend_type=='user')?'user':'group',this.chat_friend_id,this.uploader.queue[this.k]._file.name,0).subscribe(r=>{
          this.uploader.setOptions({ headers: [ {name:'attachment_name',value:`${r[0].value}`}]});
          this.uploader.queue[this.k].upload();
        })
      }
      
      var type='';
      var re = /(?:\.([^.]+))?$/;
      if( re.exec(file._file.name)[1]=="jpeg" || re.exec(file._file.name)[1]=="png" || re.exec(file._file.name)[1]=="jpg"){
        type='picture_attachment'
      }
      else{
        type='file_attachment';
      }
      console.log("checking complete 2")
      this.chatService.check_if_file_exists((this.friend_type=='user')?'user':'group',this.chat_friend_id,file._file.name,1).subscribe(r=>{
        let message ={
          id_user_name:this.current_user_name,
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
        console.log(message);
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
          this.compt_at=0;
          this.display_attachments=false;
        }
        else{
          this.attachments_type=[];
          this.attachments_name=[];
          this.attachments_for_sql=[];
          this.attachments=[];
          this.compt_at=0;
          this.display_attachments=false;
        }
        this.uploader.queue=[];  
        this.k=0;  
      }
      
    }
    
  };

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
    console.log(this.compteur_image)
    this.compteur_loaded=0;
    if(!bool){
      this.display_messages=false;
      this.put_messages_visible=false;
      this.index_of_show_pp_right=-1;
      this.list_of_show_pp_left=[];
    }
    
    this.list_of_messages_pictures=[];
    this.list_of_messages_files=[];
    this.list_of_messages_date=[];
    this.list_of_messages=[];
    this.list_of_time=[];
    this.compteur_pp=0;
    console.log("getting messages");
    console.log(this.user_present);
    if(this.spam=='false' && this.user_present){
      this.chatService.let_all_friend_messages_to_seen(this.friend_id,id_chat_section,bool).subscribe(l=>{
        console.log(l);
        if(!(l[0].message)){
          let message_to_send ={
            id_user_name:this.current_user_name,
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
          console.log("message after let all friend messages to seen")
          this.chatService.messages.next(message_to_send);
        }
        
      })
    }
    this.get_chat_sections();
    console.log(this.friend_id)
    console.log(this.current_user_id)
    this.chatService.get_first_messages(this.current_user_id,this.friend_id,id_chat_section,bool,this.compteur_get_messages).subscribe(r=>{
      if(bool){
        this.list_of_messages_reactions=r[0][1].list_of_messages_reactions;
        console.log(r[0][1]);
        console.log( this.list_of_messages_reactions)
      }
      console.log(this.list_of_messages)
      console.log([this.list_of_messages.length-1])
      if(r[1]==this.compteur_get_messages){
        if(r[0][0].length>0){
          this.list_of_messages=r[0][0];
          for(let i=0;i<r[0][0].length;i++){
            this.list_of_messages_date[i]=this.date_of_message(r[0][0][i].createdAt,0);
            if(this.list_of_messages[i].is_an_attachment){
              console.log("here is an attachment ")
              if(this.list_of_messages[i].attachment_type=='picture_message'){
                this.compteur_image+=1;
                this.chatService.get_picture_sent_by_msg(this.list_of_messages[i].attachment_name).subscribe(t=>{
                  let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                  const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                  if(r[1]==this.compteur_get_messages){
                    this.list_of_messages_pictures[i]=SafeURL;
                  }
                 
                })
              }
              else if(this.list_of_messages[i].attachment_type=='picture_attachment'){
                this.compteur_image+=1;
                console.log("friend type " + this.friend_type)
                console.log(" compteur" + this.compteur_get_messages)
                this.chatService.get_attachment(this.list_of_messages[i].attachment_name,(this.friend_type=='user')?'user':'group',this.chat_friend_id).subscribe(t=>{
                  let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                  const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                  console.log(r[1] + "compteur")
                  if(r[1]==this.compteur_get_messages){
                    console.log(this.list_of_messages_pictures)
                    this.list_of_messages_pictures[i]=SafeURL;
                  }
                  
                })
              }
              else if(this.list_of_messages[i].attachment_type=='file_attachment'){
                this.compteur_image+=1;
                this.chatService.get_attachment(this.list_of_messages[i].attachment_name,(this.friend_type=='user')?'user':'group',this.chat_friend_id).subscribe(t=>{
                  let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                  const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                  if(r[1]==this.compteur_get_messages){
                    this.list_of_messages_files[i]=SafeURL;
                    this.loaded_image();
                    
                  }
                  
                })
              }
            }
            
            if(!bool && !r[0][0][i].is_from_server){
              if(i==0 && r[0][0][i].id_user==this.friend_id && this.current_user_id!=this.friend_id){
                this.list_of_show_pp_left[i]=true;
                this.compteur_pp+=1;
                console.log("add pp left");
                
              }
              if(r[0][0][i].id_user==this.current_user_id && r[0][0][i].status=="seen" && this.index_of_show_pp_right<0){
                this.index_of_show_pp_right=i;
                this.compteur_pp+=1;
                console.log("add pp right");
              }
              if(i>0){  
                if(r[0][0][i].id_user==this.friend_id && r[0][0][i].id_user!=r[0][0][i-1].id_user){
                  this.list_of_show_pp_left[i]=true;
                  this.compteur_pp+=1;
                  console.log("add pp left");
                }
              }
            }
            
            if(i==r[0][0].length-1){
              this.chatService.check_if_response_exist(this.friend_id,id_chat_section,bool).subscribe(l=>{
                if(l[0].value){
                  this.response_exist=true;
                }
                else{
                    this.response_exist=false;
                }
                this.calculate_dates_to_show();
                this.response_exist_retrieved=true;
                this.display_messages=true;
                if(this.compteur_pp==0 && this.compteur_image==0){
                  this.cd.detectChanges();
                  this.put_messages_visible=true;
                  console.log("scroll dans get messages")
                  this.myScrollContainer.nativeElement.scrollTop= this.myScrollContainer.nativeElement.scrollHeight;
                  if(this.list_of_messages.length>0){
                    this.can_get_other_messages=true;
                  }
                };
                console.log(this.list_of_messages)
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

      }
      
      
      
    })
  }


  /*************************************DISPLAY CHAT***********************************/
  /*************************************DISPLAY CHAT***********************************/
  /*************************************DISPLAY CHAT***********************************/
  /*************************************DISPLAY CHAT***********************************/
  compteur_loaded_research=0;
  first_turn_loaded=false;
  function_done=false;
  loaded_image(){
    if(!this.show_research_results && !this.first_turn_loaded){
      this.compteur_loaded+=1;
      if(this.compteur_image!=0){
        if (this.compteur_loaded==this.compteur_image + this.compteur_pp){
          
          this.myScrollContainer.nativeElement.scrollTop= this.myScrollContainer.nativeElement.scrollHeight;
          this.put_messages_visible=true;
          this.first_turn_loaded=true;
          this.function_done=true;
          
          this.can_get_other_messages=true;
          console.log("function_done");
        }
      }
      else {
        if (this.compteur_loaded==this.compteur_pp){
         
          this.myScrollContainer.nativeElement.scrollTop= this.myScrollContainer.nativeElement.scrollHeight;
          this.put_messages_visible=true;
          this.first_turn_loaded=true;
          this.function_done=true;
          this.can_get_other_messages=true;
          console.log("function_done");
        }
      }
    }
    else if(this.show_research_results){
      this.compteur_loaded_research+=1;
      console.log( this.compteur_loaded_research)

      if(this.compteur_image_research!=0){
        console.log("over")
        console.log(this.compteur_image_research + this.compteur_pp)
        if (this.compteur_loaded_research==this.compteur_image_research + this.compteur_pp){
          console.log("c'est bon on affiche")
          this.put_messages_visible=true;
          this.can_get_other_messages=true;
          this.function_done=true;
        }
      }
      else{
        console.log("over")
        console.log(this.compteur_pp)
        if (this.compteur_loaded_research==this.compteur_pp){
          console.log("c'est bon on affiche")
          this.put_messages_visible=true;
          this.can_get_other_messages=true;
          this.function_done=true;
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
    console.log("sending writing")
    if(this.spam=='true'){
      console.log("changing status to seen spam")
      this.chatService.let_all_friend_messages_to_seen(this.friend_id,this.id_chat_section,false).subscribe(l=>{
        console.log(l[0])
        if(!(l[0].message)){
          let message_to_send ={
            id_user_name:this.current_user_name,
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
          console.log("send seen after activating focus")
         
          if(this.list_of_messages[0].id_user!=this.current_user_id){
            console.log("change message status 7")
            this.change_message_status.emit({id_chat_section:this.id_chat_section,status:"seen",friend_id:this.friend_id,friend_type:this.friend_type,spam:true});
          }
          this.chatService.messages.next(message_to_send);
        }
        
      });
     
    }
    else{
      this.chatService.messages.next(msg);
    }
    
  }

  desactivateFocus(){
    if(this.input){
      this.input.nativeElement.blur();
      let msg ={
        id_user_name:this.current_user_name,
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
      console.log("sending noooot writing")
      this.chatService.messages.next(msg);
    }
  }
  
  on_keydown(event){
    if(event.key=="Shift"){
      this.number_of_shift=1;
    }
    else if(event.key!="Enter"){
      this.number_of_shift=0;
    }
    else if(event.key=="Enter"){
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


    
    this.resize_input_height();
    
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

    if( this.message_group.value.message.length > 1500 ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Ce message est trop long (> 1500 caractères), il n\'a pas été envoyé'},
      });
      return;
    }

    this.message_one ={
      id_user_name:this.current_user_name,
      id_user:this.current_user_id,   
      id_receiver:this.friend_id,  
      message:this.message_group.value.message,
      list_of_users_who_saw:[this.current_user_id],
      list_of_users_in_the_group:this.list_of_messages[this.list_of_messages.length-1].list_of_users_in_the_group,
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
    console.log("scroll dans send message");
    this.myScrollContainer.nativeElement.scrollTop= this.myScrollContainer.nativeElement.scrollHeight;
    console.log(this.message_one);

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
    let message ={
      id_user_name:this.current_user_name,
      id_user:this.current_user_id,   
      id_receiver:this.friend_id,  
      message:null,
      attachment_name:file_name,
      attachment_type:"picture_message",
      list_of_users_who_saw:[this.current_user_id],
      list_of_users_in_the_group:this.list_of_messages[this.list_of_messages.length-1].list_of_users_in_the_group,
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
        this.compt_at=0;
        this.display_attachments=false;
      }
    }
    this.cd.detectChanges();
    console.log("scroll dans send picture")
    this.myScrollContainer.nativeElement.scrollTop= this.myScrollContainer.nativeElement.scrollHeight;
  }

 
  send_attachment_or_picture(i){
    this.respond_to_a_message=false;
    console.log("sending attachment or picture");
    if(this.attachments_type[i]=="picture_message"){
      console.log("picture_message")
      this.send_picture(i);
    }
    else if(this.attachments_type[i]=="picture_attachment"){
      this.compt_at+=1;
      if(this.compt_at==1){
        console.log("checking 1")
        console.log(this.attachments_name[i])
        console.log(url)
        this.chatService.check_if_file_exists((this.friend_type=='user')?'user':'group',this.chat_friend_id,this.attachments_name[i],0).subscribe(r=>{
          console.log(r[0]);
          this.uploader.setOptions({ headers: [ {name:'attachment_name',value:`${r[0].value}`}]});
          this.uploader.queue[0].upload();
          let message ={
            id_user:this.current_user_id,   
            id_receiver:this.friend_id,  
            message:null,
            attachment_name:r[0].value,
            attachment_type:"picture_attachment",
            list_of_users_who_saw:[this.current_user_id],
            list_of_users_in_the_group:this.list_of_messages[this.list_of_messages.length-1].list_of_users_in_the_group,
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
          this.list_of_messages_date.splice(0,0,this.date_of_message("time",1));
        })
      }
      else{
        console.log("checking 2")
        this.chatService.check_if_file_exists((this.friend_type=='user')?'user':'group',this.chat_friend_id,this.attachments_name[i],0).subscribe(r=>{
          let message ={
            id_user:this.current_user_id,   
            id_receiver:this.friend_id,  
            message:null,
            attachment_name:r[0].value,
            attachment_type:"picture_attachment",
            list_of_users_who_saw:[this.current_user_id],
            list_of_users_in_the_group:this.list_of_messages[this.list_of_messages.length-1].list_of_users_in_the_group,
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
      console.log("scroll dans send attachment pic")
      this.myScrollContainer.nativeElement.scrollTop= this.myScrollContainer.nativeElement.scrollHeight;
    }
    else if(this.attachments_type[i]=="file_attachment"){
      this.compt_at+=1;
      if(this.compt_at==1){
        console.log(" checkin first file attachment")
        this.chatService.check_if_file_exists((this.friend_type=='user')?'user':'group',this.chat_friend_id,this.attachments_name[i],0).subscribe(r=>{
          console.log("file upload")
           this.uploader.setOptions({ headers: [ {name:'attachment_name',value:`${r[0].value}`}]});
           console.log( this.uploader.queue[0])
           this.uploader.queue[0].upload();
           let message ={
             id_user:this.current_user_id,   
             id_receiver:this.friend_id,  
             message:null,
             attachment_name:r[0].value,
             attachment_type:"file_attachment",
             list_of_users_who_saw:[this.current_user_id],
             list_of_users_in_the_group:this.list_of_messages[this.list_of_messages.length-1].list_of_users_in_the_group,
             is_an_attachment:true,
             size:this.attachments_size[i],
             is_a_response:false,
             is_from_server:false,
             status:"sent",
             is_a_group_chat:(this.friend_type=='user')?false:true,
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
        console.log("checking 6")
        this.chatService.check_if_file_exists((this.friend_type=='user')?'user':'group',this.chat_friend_id,this.attachments_name[i],0).subscribe(r=>{
          console.log("not a file to uplaod");
          console.log(i);
           let message ={
             id_user:this.current_user_id,   
             id_receiver:this.friend_id,  
             message:null,
             attachment_name:r[0].value,
             attachment_type:"file_attachment",
             list_of_users_who_saw:[this.current_user_id],
             list_of_users_in_the_group:this.list_of_messages[this.list_of_messages.length-1].list_of_users_in_the_group,
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
      console.log("scroll dans send attachment file")
      this.myScrollContainer.nativeElement.scrollTop= this.myScrollContainer.nativeElement.scrollHeight;
    }
    this.compt_at=0;
    this.display_attachments=false;
    this.cd.detectChanges();
    
  }

  retry(i){
    let message=this.list_of_messages[i];
    console.log(message);
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
    console.log("adding to contacts");
    this.chatService.let_all_friend_messages_to_seen(this.friend_id,this.id_chat_section,false).subscribe(r=>{
      console.log(r);
      this.chatService.add_spam_to_contacts(this.friend_id).subscribe(l=>{
        console.log(l);
        let message_one ={
          id_user_name:this.current_user_name,
          chat_id:l[0].id,
          id_user:this.current_user_id,   
          id_receiver:this.friend_id,  
          list_of_users_who_saw:[this.current_user_id],
          list_of_users_in_the_group:this.list_of_messages[this.list_of_messages.length-1].list_of_users_in_the_group,
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

  delete_message(i){
    console.log(this.list_of_messages[i])
    console.log(this.list_of_messages[i].createdAt);
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Etes-vous sûr de vouloir supprimer le message ?'},
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.chatService.delete_message(this.list_of_messages[i].id).subscribe(r=>{
          this.list_of_messages[i].status="deleted";
          if(i==0){
            this.change_message_status.emit({id_chat_section:this.id_chat_section,status:"delete",friend_id:this.friend_id,friend_type:this.friend_type,spam:(this.spam=='false')?false:true});
          }
         
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
  if( !this.show_emojis ) {
    this.show_emojis=true;
    this.renderer.setStyle(this.emojis.nativeElement, 'visibility', 'visible');
  }
  else {
    this.renderer.setStyle(this.emojis.nativeElement, 'visibility', 'hidden');
    this.show_emojis=false;
  }
}



reaction_click($event,i) {
  this.emojis_reactions.toArray()[this.list_of_messages.length -1 -i].nativeElement.classList.add("closed");
  this.selectedEmoji = $event.emoji;
  console.log($event.emoji);
  if(this.friend_type=='group'){
    this.chatService.get_my_emojis_reactions_for_msg_group(this.list_of_messages[i].id_receiver,this.list_of_messages[i].id).subscribe(r=>{
      console.log(r[0]);
      if(!r[0].message){
        if(r[0].emoji_reaction==$event.emoji.id){
          this.chatService.delete_emoji_reaction(r[0].id,"user",true).subscribe(l=>{
            console.log(r)
            let index= this.list_of_messages_reactions[this.list_of_messages[i].id].indexOf($event.emoji.id)
            this.list_of_messages_reactions[this.list_of_messages[i].id].splice(index,1)
            console.log( this.list_of_messages_reactions[this.list_of_messages[i].id])
          })
        }
        else{
          this.chatService.add_emoji_reaction(r[0].id,$event.emoji.id,"update",true).subscribe(l=>{
            console.log(r)
            let index= this.list_of_messages_reactions[this.list_of_messages[i].id].indexOf(r[0].emoji_reaction)
            this.list_of_messages_reactions[this.list_of_messages[i].id].splice(index,1,$event.emoji.id)
            console.log( this.list_of_messages_reactions[this.list_of_messages[i].id]);
          })
        }
      }
      else{
        console.log(this.list_of_messages[i].id)
        this.chatService.add_emoji_reaction(this.list_of_messages[i].id,$event.emoji.id,"create",true).subscribe(l=>{
          console.log(r)
          console.log(this.list_of_messages_reactions[this.list_of_messages[i].id])
          if(this.list_of_messages_reactions[this.list_of_messages[i].id]){
            this.list_of_messages_reactions[this.list_of_messages[i].id].push($event.emoji.id);
          }
          else{
            this.list_of_messages_reactions[this.list_of_messages[i].id]=[($event.emoji.id)];
          }
        })
      }
      let message={
        id_user_name:this.current_user_name,
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
      id_user_name:this.current_user_name,
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
      console.log("moi meme")
      if(this.list_of_messages[i].emoji_reaction_user==$event.emoji.id){
        this.chatService.delete_emoji_reaction(this.list_of_messages[i].id,"user",false).subscribe(r=>{
          console.log(r)
          this.list_of_messages[i].emoji_reaction_user=null;
        })
        message.old_emoji=$event.emoji.id;
        message.new_emoji=$event.emoji.id;
      }
      else{
        this.chatService.add_emoji_reaction(this.list_of_messages[i].id,$event.emoji.id,"user",false).subscribe(r=>{
          console.log(r)
          this.list_of_messages[i].emoji_reaction_user=$event.emoji.id;
        })
        message.old_emoji=this.list_of_messages[i].emoji_reaction_user;
        message.new_emoji=$event.emoji.id;
      }

    }
    else{
      console.log("friend");
      if(this.list_of_messages[i].emoji_reaction_receiver==$event.emoji.id){
        this.chatService.delete_emoji_reaction(this.list_of_messages[i].id,"receiver",false).subscribe(r=>{
          console.log(r)
          this.list_of_messages[i].emoji_reaction_receiver=null;
        })
        message.old_emoji=$event.emoji.id;
        message.new_emoji=$event.emoji.id;
        message.type_of_user="receiver";
      }
      else{
        this.chatService.add_emoji_reaction(this.list_of_messages[i].id,$event.emoji.id,"receiver",false).subscribe(r=>{
          console.log(r)
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
  console.log(i);
  console.log(this.emojis_reactions.toArray())
  console.log(this.emojis_reactions.toArray().length)
  this.target_clicked=event.target
  this.list_show_reactions[i]=true;
  this.reactions_shown=true;
  this.index_of_children_reactions=i;
  this.emojis_reactions.toArray()[i].nativeElement.classList.remove("closed");
  console.log("adding reaction shown")
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
top_pp_loaded=false;
put_top_visible=false;
top_sumo_loaded=false;
nothing_selected=true;
today_triggered=false;
initialize_selectors(){
  console.log("ini selector")
  let THIS=this;
  $(document).ready(function () {
    
    $('.chat-section').SumoSelect({
    });
    console.log("sumooooooooooooooooooooo")
    THIS.top_sumo_loaded=true;
  });
  THIS.cd.detectChanges();
  
  $(".chat-section").change(function(){
    console.log("change ini")
    THIS.function_done=false;
    THIS.nothing_selected=false;
    THIS.trigger_no_more=false;
    THIS.today_triggered=false;
    THIS.chat_section_to_open=$(this).val();
    THIS.first_turn_loaded=false;
    console.log($(this).val() );
    if($(this).val()!=''){
      let index =THIS.list_of_chat_sections.indexOf($(this).val() )
      THIS.id_chat_section=THIS.list_of_chat_sections_id[index];
      THIS.change_section.emit({id_chat_section:THIS.id_chat_section});
      console.log("getting messages from selector other");
      THIS.get_messages(THIS.id_chat_section,(THIS.friend_type=='user')?false:true);
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
      THIS.get_messages(THIS.id_chat_section,(THIS.friend_type=='user')?false:true);
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

    
    THIS.cancel_response();
    THIS.attachments_type=[];
    THIS.attachments_name=[];
    THIS.attachments_for_sql=[];
    THIS.attachments=[];
    THIS.cd.detectChanges();

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
  
  this.chatService.add_chat_section(name,this.friend_id,(this.friend_type=='user')?false:true).subscribe(r=>{
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
        this.chatService.delete_chat_section(this.id_chat_section,this.friend_id,(this.friend_type=='user')?false:true).subscribe(r=>{
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
  
  console.log("getting chat sections")
  console.log(this.friend_id);
  console.log((this.friend_type=='user')?false:true)
  this.chatService.get_chat_sections(this.friend_id,(this.friend_type=='user')?false:true).subscribe(l=>{
    console.log(l);
    if(l[0][0]){
      let compt =0;
      for(let i=0;i<l[0].length;i++){
        this.list_of_chat_sections[i+1]=(l[0][i].chat_section_name);
        this.list_of_chat_sections_id[i+1]=(l[0][i].id_chat_section);
        if(this.id_chat_section==l[0][i].id_chat_section && compt==0){
          console.log(l[0][i].chat_section_name)
          this.chat_section_to_open=l[0][i].chat_section_name;
          console.log(this.chat_section_to_open)
          compt+=1;
        } 
        if(i==l[0].length-1){
          if(compt==0){
            this.chat_section_to_open="Discussion principale"
            console.log( this.chat_section_to_open)
          }
          for(let j=0;j<this.list_of_chat_sections.length;j++){
            this.chatService.get_notifications_section(this.list_of_chat_sections_id[j],this.friend_id,(this.friend_type=='user')?false:true).subscribe(r=>{
              this.list_of_chat_sections_notifications[j]=r[0].value;
              if(j==this.list_of_chat_sections.length-1){
                console.log(this.compteur_chat_section)
                if(this.compteur_chat_section>0){
                  this.activate_research_chat_section=false;
                  this.activate_add_chat_section=false;
                  console.log(this.chat_section_to_open)
                  this.cd.detectChanges();
                  $('.chat-section')[0].sumo.reload({placeholder: this.chat_section_to_open});
                  this.cd.detectChanges();
                }
                else{
                  console.log("ini select")
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
      this.activate_research_chat_section=false;
      this.activate_add_chat_section=false;
      if(this.compteur_chat_section>0 && $('.chat-section')[0].sumo){
        $('.chat-section')[0].sumo.reload();
      }
      else{
        console.log("initi selector")
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
  this.cd.detectChanges();
}

@ViewChild('show_container_research') show_container_research:ElementRef;
no_result_container_research_chat=false;
show_container_research_chat=false;
show_container_research_chat_results=false;
on_keydown_research_chat_section(event){
  this.list_of_chat_sections_found=[];
  if(this.chat_section_group.value.research_chat_section_message!=''){
    this.show_container_research_chat=true;
    this.chatService.research_chat_sections(this.chat_section_group.value.research_chat_section_message,this.friend_id,(this.friend_type=='user')?false:true).subscribe(r=>{
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
  console.log("open s")
  console.log( this.list_of_chat_sections_found_id[i]);
  
  this.nothing_selected=false;
  this.trigger_no_more=false;
  this.chat_section_to_open=this.list_of_chat_sections_found[i];
  console.log(this.chat_section_to_open)
  this.first_turn_loaded=false;
  let index =this.list_of_chat_sections_id.indexOf(this.list_of_chat_sections_found_id[i])
  this.id_chat_section=this.list_of_chat_sections_found_id[i];
  console.log(this.id_chat_section)
  this.change_section.emit({id_chat_section:this.id_chat_section});
  this.close_chat_section_research();
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
     
      this.cd.detectChanges();
      this.chat_section_name.reset();
      $('.chat-section').attr("placeholder",this.chat_section_to_open);
      this.get_messages(this.id_chat_section,(this.friend_type=='user')?false:true);
      
      
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
      this.chatService.get_messages_from_research(this.research_messages.value.research_message,this.id_chat_section,this.friend_id,this.friend_type).subscribe(l=>{
        console.log(l[0]);
        this.list_of_messages_found_complete=l[0];
        this.number_of_messages_found=l[0].length;
        this.message_researched=this.research_messages.value.research_message;
        if(l[0].length>0){
          let second_compt=0;
          for(let i=0;i<l[0].length;i++){
            let match=false;
            for(let j=0;j<this.list_of_messages.length;j++){
              if(l[0][i].message==this.list_of_messages[j].message && l[0][i].createdAt==this.list_of_messages[j].createdAt ){
                console.log("first if")
                this.list_of_messages_found.push(true);
                this.index_of_messages_found.push(j);
                match=true;
                second_compt+=1;
                if(second_compt==l[0].length && j==this.list_of_messages.length-1){
                  this.show_research_results=true;
                  if(this.list_of_messages_found[0]){
                    console.log("first_message_is_loaded")
                    this.first_message_is_loaded();
                  }
                  else{
                    console.log("first_message_isnt_loaded")
                    this.first_message_isnt_loaded();
                  }
                }
              }
              else if(j==this.list_of_messages.length-1 && !match){
                console.log("else if")
                  this.chatService.get_messages_around(l[0][i].id,this.id_chat_section,this.friend_id,this.friend_type).subscribe(r=>{
                    this.list_of_messages_around[i]=r[0].list_of_messages_to_send;
                    console.log(r[0]);
                    second_compt+=1;
                    if(second_compt==l[0].length && j==this.list_of_messages.length-1){
                      console.log( this.list_of_messages_found);
                      console.log(this.list_of_messages_around);
                      this.show_research_results=true;
                      if(this.list_of_messages_found[0]){
                        console.log("first_message_is_loaded")
                        this.first_message_is_loaded();
                      }
                      else{
                        console.log("first_message_isnt_loaded")
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
  
  console.log("show_next_message_researched");
  console.log(this.number_click_top);
  console.log(this.number_of_messages_found)
  if(this.number_click_top<this.number_of_messages_found){
    this.number_click_top+=1;
    console.log(this.list_of_messages_found)
    console.log(this.list_of_messages_found[this.number_click_top-1])
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
      console.log(this.list_of_messages)
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
      this.chatService.get_attachment(this.list_of_messages[i].attachment_name,(this.friend_type=='user')?'user':'group',this.chat_friend_id).subscribe(t=>{
        let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.list_of_messages_pictures[i]=SafeURL;
      })
    }
    else if(this.list_of_messages[i].attachment_type=='file_attachment'){
      this.chatService.get_attachment(this.list_of_messages[i].attachment_name,(this.friend_type=='user')?'user':'group',this.chat_friend_id).subscribe(t=>{
        let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.list_of_messages_files[i]=SafeURL;
        this.loaded_image();
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
  this.get_messages(this.id_chat_section,(this.friend_type=='user')?false:true);
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
  
  
  this.chatService.get_less_messages(this.friend_id,this.list_of_messages[0].id,this.list_of_messages[this.list_of_messages.length-1].id,this.id_chat_section,this.friend_type).subscribe(r=>{
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



/**************************************** */
/**************************************** */
/**FONCTIONS MOKHTAR */
/**************************************** */
/**************************************** */
resize_input_height() {
  
  this.input.nativeElement.style.height = "0px";
  this.input.nativeElement.style.height = this.input.nativeElement.scrollHeight + 'px';

}


initialize_heights() {
  //if( !this.fullscreen_mode ) {
    $('#messages-container').css("height", ( $('.middle-container').height() - $('#messages-bottom-container').height() ) + "px");
  //}
}

/******************************************************* */
/******************** AFTER VIEW CHECKED *************** */
/******************************************************* */
ngAfterViewChecked() {
  this.initialize_heights();
}





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
  })

  //fonction pour prévenir  que la photo de profiel a été modifiéé
}

add_a_friend() {
  console.log("adding a friend send emit")
  this.add_a_friend_to_the_group.emit({friend_id:this.friend_id});
  // envoyer un message pour prévenir de l'ajout d'un nouvel utilisateur
}


exit_group(){

  const dialogRef = this.dialog.open(PopupConfirmationComponent, {
    data: {showChoice:true, text:'Etes-vous sûr de vouloir quitter le groupe ?'},
  });

  dialogRef.afterClosed().subscribe(result => {
    if(result){
      this.chatService.exit_group(this.friend_id).subscribe(r=>{
        let message_one ={
          id_user_name:this.current_user_name,
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
        console.log("sending exit")
        this.chatService.messages.next(message_one);
        location.reload();
      })
    }
  })
}


display_members_of_the_group(){
  console.log(this.friend_id);
  this.chatService.get_group_chat_information(this.friend_id).subscribe(p=>{
    let list_of_ids=p[0].list_of_receivers_ids;
    let list_of_pseudos=[];
    let list_of_names=[];
    let list_of_pictures=[]
    let compt=0
    for(let i=0;i<list_of_ids.length;i++){
      this.Profile_Edition_Service.retrieve_profile_data(list_of_ids[i]).subscribe(l=>{
        list_of_pseudos[i]=l[0].nickname;
        list_of_names[i]=l[0].firstname + ' ' + l[0].lastname;
        this.Profile_Edition_Service.retrieve_profile_picture(list_of_ids[i] ).subscribe(r=> {
          let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
          const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
          list_of_pictures[i] = SafeURL;
          compt++;
          if(compt==list_of_ids.length){
            console.log(list_of_ids);
            console.log(list_of_names);
            const dialogRef = this.dialog.open(PopupChatGroupMembersComponent, {
              data: {is_for_emojis:false,list_of_ids:list_of_ids,list_of_pseudos:list_of_pseudos,list_of_names:list_of_names,list_of_pictures:list_of_pictures},
            });
          }
        });
      })
    }
  })
  
}

see_emoji_reaction_by_user(id_message){
  this.chatService.get_reactions_by_user(id_message).subscribe(r=>{
    console.log(r[0]);
    let list_of_ids=[];
    let list_of_emojis={};
    let list_of_pseudos=[];
    let list_of_names=[];
    let list_of_pictures=[]
    let compt=0
    for(let i=0;i<r[0].length;i++){
      list_of_ids[i]=r[0][i].id_user;
      list_of_emojis[r[0][i].id_user]=r[0][i].emoji_reaction;
      this.Profile_Edition_Service.retrieve_profile_data(r[0][i].id_user).subscribe(l=>{
        list_of_pseudos[i]=l[0].nickname;
        list_of_names[i]=l[0].firstname + ' ' + l[0].lastname;
        this.Profile_Edition_Service.retrieve_profile_picture(r[0][i].id_user).subscribe(t=> {
          let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
          const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
          list_of_pictures[i] = SafeURL;
          compt++;
          if(compt==r[0].length){
            console.log(list_of_ids);
            console.log(list_of_names);
            const dialogRef = this.dialog.open(PopupChatGroupMembersComponent, {
              data: {is_for_emojis:true,list_of_emojis:list_of_emojis,list_of_ids:list_of_ids,list_of_pseudos:list_of_pseudos,list_of_names:list_of_names,list_of_pictures:list_of_pictures},
            });
          }
        });
      })
    }
  })
  

}



/*********************************************  MESSAGES MANAGMENT ******************************/
/*********************************************  MESSAGES MANAGMENT ******************************/
/*********************************************  MESSAGES MANAGMENT  ******************************/


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
}

