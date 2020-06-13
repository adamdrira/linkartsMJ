
import { Component, OnInit, Input, Renderer2, ElementRef, ComponentFactoryResolver, ChangeDetectorRef, ViewContainerRef, ViewChild, HostListener, SimpleChanges, ViewChildren, QueryList, Query } from '@angular/core';
import { FormControl, Validators, FormGroup} from '@angular/forms';
import { NavbarService } from '../services/navbar.service';
import { ChatService} from '../services/chat.service';
import { Profile_Edition_Service} from '../services/profile_edition.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscribing_service } from '../services/subscribing.service';
import { ChatComponent } from '../chat/chat.component';

declare var $: any;

@Component({
  selector: 'app-chat-friends-list',
  templateUrl: './chat-friends-list.component.html',
  styleUrls: ['./chat-friends-list.component.scss']
})
export class ChatFriendsListComponent implements OnInit {

  constructor (
    private chatService:ChatService,
    private Subscribing_service:Subscribing_service,
    private sanitizer:DomSanitizer,
    public navbar: NavbarService, 
    private Profile_Edition_Service:Profile_Edition_Service,
    private rd: Renderer2, 
    private resolver: ComponentFactoryResolver, 
    private cd: ChangeDetectorRef,
    ){
      this.navbar.show();
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload($event) { 
    this.chatService.close();
  }
  

  //current_user
  current_user:number=0;
  current_user_name:string;
  current_user_pseudo:string;
  profile_picture:SafeUrl;

  //chat_friends
  list_of_friends_profile_pictures:any[]=[];
  list_of_friends_pseudos:any[]=[];
  list_of_friends_names:any[]=[];
  list_of_friends_ids:any[]=[];
  list_of_friends_last_message:any[]=[];
  list_of_friends_retrieved=false;
  list_of_friends_2_retrieved=false;

  // for chat component
  friend_id: number;
  friend_pseudo: number;
  friend_name: string;
  friend_picture: SafeUrl;

  //chat_spams
  list_of_spams_profile_pictures:any[]=[];
  list_of_spams_pseudos:any[]=[];
  list_of_spams_names:any[]=[];
  list_of_spams_ids:any[]=[];
  list_of_spams_last_message:any[]=[];
  list_of_spams_retrieved=false;

  // for chat component spam
  spam_id: number;
  spam_pseudo: number;
  spam_name: string;
  spam_picture: SafeUrl;
  
  ngOnInit() {
    
    this.Profile_Edition_Service.get_current_user().subscribe(l=>{
      this.current_user=l[0].id;
      this.current_user_pseudo=l[0].nickname;
      this.current_user_name=l[0].firstname + ' ' + l[0].lastname;
      this.Profile_Edition_Service.retrieve_profile_picture(  this.current_user ).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.profile_picture = SafeURL;
        this.sort_friends_list(true);
      });
    })

    this.sort_spams_list(true);
 
    

    
  };

 
  
  sort_friends_list(value) {
    console.log("emetteur sort friends list")
    this.chatService.get_list_of_users_I_talk_to().subscribe(r=>{
      if(r[0].length>0){
        let compt=0;
        console.log(r[0])
        for(let i=0;i<r[0].length;i++){
          if(r[0][i].id_user==this.current_user){
              this.list_of_friends_ids[i]=r[0][i].id_receiver;
              this.Profile_Edition_Service.retrieve_profile_data(r[0][i].id_receiver).subscribe(s=>{
                this.list_of_friends_pseudos[i]=s[0].nickname;
                this.list_of_friends_names[i]=s[0].firstname + ' ' + s[0].lastname;
                this.Profile_Edition_Service.retrieve_profile_picture(  r[0][i].id_receiver ).subscribe(t=> {
                  let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                  const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                  this.list_of_friends_profile_pictures[i] = SafeURL;
                  compt ++;
                  if(compt==r[0].length){
                    this.chatService.get_last_friends_message(this.list_of_friends_ids).subscribe(u=>{
                      this.list_of_friends_last_message=u[0].list_of_friends_messages;
                      if(value){
                        this.chatService.get_my_real_friend().subscribe(v=>{
                          this.friend_id=v[0][0].id_receiver;
                          let ind = this.list_of_friends_ids.indexOf(this.friend_id);
                          this.friend_name=this.list_of_friends_names[ind];
                          this.friend_pseudo=this.list_of_friends_pseudos[ind];
                          this.friend_picture=this.list_of_friends_profile_pictures[ind];
                          this.list_of_friends_2_retrieved=true;
                          this.list_of_friends_retrieved=true;
                        })
                      }else{
                        this.list_of_friends_2_retrieved=true;
                      }
                    });
                  }
                });
              });
          }
          else{
              this.list_of_friends_ids[i]=r[0][i].id_user;
              this.Profile_Edition_Service.retrieve_profile_data(r[0][i].id_user).subscribe(s=>{
                this.list_of_friends_pseudos[i]=s[0].nickname;
                this.list_of_friends_names[i]=s[0].firstname + ' ' + s[0].lastname;
                this.Profile_Edition_Service.retrieve_profile_picture(  r[0][i].id_user ).subscribe(t=> {
                  let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                  const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                  this.list_of_friends_profile_pictures[i] = SafeURL;
                  compt ++;
                  if(compt==r[0].length){
                    this.chatService.get_last_friends_message(this.list_of_friends_ids).subscribe(u=>{
                      this.list_of_friends_last_message=u[0].list_of_friends_messages;
                      if(value){
                        this.chatService.get_my_real_friend().subscribe(v=>{
                          console.log(v);
                          this.friend_id=v[0][0].id_receiver;
                          let ind = this.list_of_friends_ids.indexOf(this.friend_id);
                          this.friend_name=this.list_of_friends_names[ind];
                          this.friend_pseudo=this.list_of_friends_pseudos[ind];
                          this.friend_picture=this.list_of_friends_profile_pictures[ind];
                          this.list_of_friends_2_retrieved=true;
                          this.list_of_friends_retrieved=true;
                        })
                      }
                      else{
                        this.list_of_friends_2_retrieved=true;
                      }

                    });
                  }
                });
              });
          }
        }
      }
    })
  };


  sort_spams_list(value) {
    console.log("emetteur sort spams list")
    this.chatService.get_list_of_spams().subscribe(r=>{
      if(r[0].length>0){
        let compt=0;
        console.log(r[0])
        for(let i=0;i<r[0].length;i++){
          if(r[0][i].id_user==this.current_user){
              this.list_of_spams_ids[i]=r[0][i].id_receiver;
              this.Profile_Edition_Service.retrieve_profile_data(r[0][i].id_receiver).subscribe(s=>{
                this.list_of_spams_pseudos[i]=s[0].nickname;
                this.list_of_spams_names[i]=s[0].firstname + ' ' + s[0].lastname;
                this.Profile_Edition_Service.retrieve_profile_picture(  r[0][i].id_receiver ).subscribe(t=> {
                  let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                  const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                  this.list_of_spams_profile_pictures[i] = SafeURL;
                  compt ++;
                  if(compt==r[0].length){
                    this.chatService.get_last_friends_message(this.list_of_spams_ids).subscribe(u=>{
                      this.list_of_spams_last_message=u[0].list_of_spams_messages;
                      if(value){
                          this.spam_id= this.list_of_spams_ids[0];
                          this.spam_name=this.list_of_spams_names[0];
                          this.spam_pseudo=this.list_of_spams_pseudos[0];
                          this.spam_picture=this.list_of_spams_profile_pictures[0];
                          
                      }
                      this.list_of_spams_retrieved=true;
                    });
                  }
                });
              });
          }
          else{
              this.list_of_spams_ids[i]=r[0][i].id_user;
              this.Profile_Edition_Service.retrieve_profile_data(r[0][i].id_user).subscribe(s=>{
                this.list_of_spams_pseudos[i]=s[0].nickname;
                this.list_of_spams_names[i]=s[0].firstname + ' ' + s[0].lastname;
                this.Profile_Edition_Service.retrieve_profile_picture(  r[0][i].id_user ).subscribe(t=> {
                  let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                  const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                  this.list_of_spams_profile_pictures[i] = SafeURL;
                  compt ++;
                  if(compt==r[0].length){
                    this.chatService.get_last_friends_message(this.list_of_spams_ids).subscribe(u=>{
                      this.list_of_spams_last_message=u[0].list_of_spams_messages;
                      if(value){
                        this.spam_id= this.list_of_spams_ids[0];
                        this.spam_name=this.list_of_spams_names[0];
                        this.spam_pseudo=this.list_of_spams_pseudos[0];
                        this.spam_picture=this.list_of_spams_profile_pictures[0];
                      }
                      this.list_of_spams_retrieved=true;
                    });
                  }
                });
              });
          }
        }
      }
      else{
        console.log("aucun spam")
      }
    })
  };
  



  new_sort_friends_list(event){
    if(this.list_of_friends_ids.indexOf(event.friend_id)>=0){
      //trier au lieu de faire un novueau appel !
      console.log("friend")
      this.list_of_friends_ids=[];
      this.list_of_friends_last_message=[];
      this.list_of_friends_names=[];
      this.list_of_friends_profile_pictures=[];
      this.list_of_friends_pseudos=[];
      this.sort_friends_list(false);
    }
    else{
      console.log(event);
      this.chatService.check_if_is_related(event.friend_id).subscribe(r=>{
        if(r[0].value){
          //this.list_of_friends_2_retrieved=false;
          this.list_of_friends_last_message=[];
          this.list_of_friends_ids=[];
          this.list_of_friends_names=[];
          this.list_of_friends_profile_pictures=[];
          this.list_of_friends_pseudos=[];
          this.sort_friends_list(false);
        }
        else{
          this.list_of_spams_ids=[];
          this.list_of_spams_names=[];
          this.list_of_spams_profile_pictures=[];
          this.list_of_spams_pseudos=[];
          this.sort_spams_list(false);
        }
      })
    }
  }




  open_chat(i){
    this.list_of_friends_last_message[i].status='seen';
    this.friend_id=this.list_of_friends_ids[i];
    this.friend_pseudo=this.list_of_friends_pseudos[i];
    this.friend_name=this.list_of_friends_names[i];
    this.friend_picture=this.list_of_friends_profile_pictures[i];
  }





  

    
}