
import { Component, OnInit, Input, Renderer2, ElementRef, ComponentFactoryResolver, ChangeDetectorRef, ViewContainerRef, ViewChild, HostListener, SimpleChanges, ViewChildren, QueryList, Query } from '@angular/core';
import { FormControl, Validators, FormGroup, FormsModule,ReactiveFormsModule, FormBuilder, ɵangular_packages_forms_forms_g } from '@angular/forms';
import { NavbarService } from '../services/navbar.service';
import { ChatService} from '../services/chat.service';
import { Profile_Edition_Service} from '../services/profile_edition.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { AuthenticationService } from '../services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import {get_date_to_show_chat} from '../helpers/dates';
import { trigger, transition, style, animate } from '@angular/animations';
import { pattern } from '../helpers/patterns';

declare var $: any;


@Component({
  selector: 'app-chat-friends-list',
  templateUrl: './chat-friends-list.component.html',
  styleUrls: ['./chat-friends-list.component.scss'],
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
export class ChatFriendsListComponent implements OnInit {

  constructor (
    private location: Location,
    private chatService:ChatService,
    private FormBuilder:FormBuilder,
    private sanitizer:DomSanitizer,
    public dialog: MatDialog,
    public navbar: NavbarService, 
    private Profile_Edition_Service:Profile_Edition_Service,
    private cd: ChangeDetectorRef,
    public route: ActivatedRoute, 
    private activatedRoute: ActivatedRoute,
    private AuthenticationService:AuthenticationService,
    ){
      this.navbar.set_using_chat();
      
      this.navbar.show();
      
  }

  @ViewChild('input') input:ElementRef;
  @ViewChild('fdselector') fdselector:ElementRef;

  
  //current_user
  current_user:number=0;
  current_user_name:string;
  current_user_pseudo:string;
  profile_picture:SafeUrl;
  profile_picture_retrieved=false;

  //get friend or others
  get_friends=true;
  get_spams=false;
  get_propositions=false;
  spam='false';

  //chat_friends and groups
  list_of_chat_friends_ids:number[]=[]; // id de la liste list_of_chat_friends
  number_of_friends_to_show:number;
  list_of_friends_types:any[]=[];
  list_of_friends_profile_pictures:any[]=[];
  list_of_pictures_by_ids_users={};
  list_of_pictures_by_ids_groups={};
  list_of_friends_pseudos:any[]=[];
  list_of_friends_names:any[]=[];
  list_of_friends_ids:any[]=[];
  list_of_friends_last_message:any[]=[];
  list_of_friends_retrieved=false;
  list_of_friends_date=[]
  list_of_friends_users_only=[];
  list_of_last_connection_dates=[];

  list_of_groups_retrieved=false;
  list_of_groups_ids=[];
  // for chat component
  chat_friend_id:number; // id de la list list_of_chat_friends
  friend_id: number;
  friend_type:string;
  friend_pseudo: number;
  friend_name: string;
  friend_picture: SafeUrl;
  // for chat component when clicking "others"
  waiting_friend_id: number;
  waiting_friend_type:string;
  waiting_chat_friend_id:number;
  waiting_friend_pseudo: number;
  waiting_friend_name: string;
  waiting_friend_picture: SafeUrl;
  waiting_id_chat_section:number;

  //chat_spams
  list_of_spams_profile_pictures:any[]=[];
  list_of_spams_pseudos:any[]=[];
  list_of_spams_names:any[]=[];
  list_of_spams_ids:any[]=[];
  list_of_spams_last_message:any[]=[];
  list_of_spams_retrieved=false;
  number_of_spams_to_show=15;
  number_of_unseen_messages:number;

  //list of groups propositions
  list_of_contacts_groups_pictures:any[]=[];
  list_of_contacts_groups_names:any[]=[];
  list_of_contacts_groups_ids:any[]=[];
  list_of_propositions_groups_pictures:any[]=[];
  list_of_propositions_groups_names:any[]=[];
  list_of_propositions_groups_ids:any[]=[];
  number_of_groups_to_show=10;
  display_propositions_groups=false;

  // for chat component spam
  spam_id: number;
  spam_pseudo: number;
  spam_name: string;
  spam_picture: SafeUrl;

  //to add a friend to a group
  selected_list_of_new_friends_ids=[];
  selected_list_of_new_friends_names=[];
  list_of_new_friends_ids=[];
  list_of_new_friends_names=[];
  list_of_new_friends_pseudos=[];
  list_of_new_friends_pictures=[];
  display_add_a_friend_to_a_group=false;
  id_group_where_friends_are_added:number;
  number_of_new_friends_to_show=5;
  connections_status_retrieved=false;
  //check presence
  user_present=false;

  //chat_section
  id_chat_section=1;
  
  //for connected logo
  list_of_friends_connected=[]
  
  //routing
  active_section=1;
  active_section_done=false;
  active_section_user_id:number;

  //blocked_users
  list_of_users_blocked=[];
  list_of_users_blocked_retrieved=false;



  @HostListener('window:focus', ['$event'])
  onFocus(event: any): void {
    console.log("change focus")
    this.user_present=true;
  }

  @HostListener('window:blur', ['$event'])
    onBlur(event: any): void {
    console.log("change blur")
    this.user_present=false;
  }

  @HostListener('document:click', ['$event.target'])
  clickout(btn) {
    if(!this.user_present){
      this.user_present=true;
      console.log("click change")
    }
   
  }

  @ViewChild('myScrollContainer') private myScrollContainer: ElementRef;

  ngOnInit() {
    
    this.active_section = this.route.snapshot.data['section'];
    if(this.active_section==2){
      let pseudo = this.activatedRoute.snapshot.paramMap.get('pseudo');
      this.active_section_user_id = parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
      if(!(this.active_section_user_id>0)){
        this.location.go('/chat')
        this.active_section=1;
      }
      else{
        console.log( this.active_section_user_id )
        this.Profile_Edition_Service.retrieve_profile_data(this.active_section_user_id).subscribe(r=>{
          if(!r[0] || r[0].nickname!=pseudo){
            this.location.go('/chat')
            this.active_section=1;
            //location.reload();
          }
        })
      }
      
    }
    if(this.active_section==3){
      let name= this.activatedRoute.snapshot.paramMap.get('name');
      this.active_section_user_id = parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
      if(!(this.active_section_user_id>0)){
        this.location.go('/chat')
        this.active_section=1;
        //location.reload();
      }
      else{
        console.log( this.active_section_user_id )
        this.chatService.get_group_chat_information(this.active_section_user_id).subscribe(r=>{
          if(!r[0] || r[0].name!=name){
            this.location.go('/chat')
            this.active_section=1;
          }
        })
        console.log(name);
        console.log(this.active_section_user_id)
      }
      
    }

    this.Profile_Edition_Service.get_list_of_users_blocked().subscribe(r=>{
      if(!r[0].nothing){
        this.list_of_users_blocked=r[0];
      }
      this.list_of_users_blocked_retrieved=true;
      console.log(r[0])
    })
    this.createFormControlsAds();
    this.createFormAd();
    

    /**********************************************SCROLL MANAGMENT ************************** */
    /**********************************************SCROLL MANAGMENT ************************** */
    /**********************************************SCROLL MANAGMENT ************************** */

    setInterval(() => {

      
        
      //scroll bar managment
      if((this.myScrollContainer.nativeElement.scrollTop + this.myScrollContainer.nativeElement.offsetHeight >= this.myScrollContainer.nativeElement.scrollHeight*0.8)){
        // après avoir cliqué sur "voir tous les résultats" dans la liste des propositions classique
        if(this.search_more_propositions && this.display_all_searching_proppositions){
          console.log("searching new propositions")
          this.get_all_searching_propositions();
        }
        //lorsqu'on défile la liste des utilisateurs classiques
        else if(this.list_of_friends_retrieved && this.get_friends && !this.get_propositions && this.number_of_friends_to_show<this.list_of_friends_ids.length){
          console.log("adding friends to show")
          this.number_of_friends_to_show+=10;
          this.cd.detectChanges();
        }
        else if(this.list_of_spams_retrieved && this.get_spams && !this.get_propositions && this.number_of_spams_to_show<this.list_of_spams_ids.length){
          console.log("adding friends to show")
          this.number_of_spams_to_show+=10;
          this.cd.detectChanges();
        }
        else if(this.opened_category_for_research==1 && this.get_propositions && this.loading_other_propositions && this.display_propositions_groups && this.number_of_groups_to_show<this.list_of_propositions_groups_ids.length){
          console.log("adding number_of_groups_to_show")
          this.number_of_groups_to_show+=10;
        }
        else if(this.display_add_a_friend_to_a_group &&  this.number_of_new_friends_to_show<this.list_of_new_friends_ids.length){
          console.log("adding display_add_a_friend_to_a_group")
          this.number_of_new_friends_to_show+=10;
        }
        else if((this.opened_category_for_research==0 || this.select_group_chat_contacts) && this.loading_other_propositions && this.display_other_contacts &&  this.number_of_new_friends_to_show<(this.list_of_related_contacts_names.length + this.list_of_other_contacts_names.length)){
          console.log("adding show more new")
          this.number_of_new_friends_to_show+=10;
        }
      }
    }, 500);

    setInterval(() => {
      if(this.list_of_friends_retrieved){
        this.get_connections_status();
      }
    }, 60000);
    


    this.Profile_Edition_Service.get_current_user().subscribe(l=>{
     
      this.current_user=l[0].id;
      this.current_user_pseudo=l[0].nickname;
      this.current_user_name=l[0].firstname + ' ' + l[0].lastname;
      
     
    })

    
    this.Profile_Edition_Service.retrieve_my_profile_picture().subscribe(r=> {
        
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.profile_picture = SafeURL;
      this.profile_picture_retrieved=true;
      
    });
    
    this.sort_friends_list();
    this.sort_spams_list();
    
  };

  
  show_icon=false;
  ngAfterViewInit(){
    let THIS=this;
    $(window).ready(function () {
      console.log("load")
      THIS.show_icon=true;
    });
    
    if( window.innerWidth>850 ) {
      this.chat_right_container_is_opened = true;
    }
    else {
      this.chat_right_container_is_opened = false;
    }
  }

 
  sort_friends_list() {
    console.log("sort")
    this.chatService.get_list_of_users_I_talk_to().subscribe(r=>{
      let current_user=r[0].current_user
      let friends = r[0].friends
      if(friends.length>0){
        let compt=0;
        let compt_pp=0;
        console.log(friends)
        for(let i=0;i<friends.length;i++){
          this.list_of_chat_friends_ids[i]=friends[i].id;
          let data_retrieved=false;
          let last_messages_retrieved=false;
          let real_friend_retrieved=false;
          if(friends[i].id_user==current_user){
              this.list_of_friends_types[i]='user';
              this.list_of_friends_users_only[i]=friends[i].id_receiver;
              this.list_of_friends_ids[i]=friends[i].id_receiver;
              
              this.list_of_friends_date[i]=new Date(friends[i].date).getTime()/1000;
              this.Profile_Edition_Service.retrieve_profile_data(friends[i].id_receiver).subscribe(s=>{
                this.list_of_friends_pseudos[i]=s[0].nickname;
                this.list_of_friends_names[i]=s[0].firstname + ' ' + s[0].lastname;
                data_retrieved=true;
                first_check(this)
              });

              this.Profile_Edition_Service.retrieve_profile_picture( friends[i].id_receiver ).subscribe(t=> {
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                //this.list_of_friends_profile_pictures[i] = SafeURL;
                this.list_of_pictures_by_ids_users[friends[i].id_receiver] = SafeURL;
                console.log( this.list_of_pictures_by_ids_users)
                compt_pp++
                if(compt_pp==friends.length){
                  this.sort_list_of_profile_pictures()
                }
              });

              
            
          }
          else{
              this.list_of_friends_types[i]='user';
              this.list_of_friends_ids[i]=friends[i].id_user;
              this.list_of_friends_users_only[i]=friends[i].id_user;
              this.list_of_friends_date[i]=new Date(friends[i].date).getTime()/1000;
              this.Profile_Edition_Service.retrieve_profile_data(friends[i].id_user).subscribe(s=>{
                this.list_of_friends_pseudos[i]=s[0].nickname;
                this.list_of_friends_names[i]=s[0].firstname + ' ' + s[0].lastname;
                data_retrieved=true;
                first_check(this)
              });

              this.Profile_Edition_Service.retrieve_profile_picture(  friends[i].id_user ).subscribe(t=> {
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                //this.list_of_friends_profile_pictures[i] = SafeURL;
                this.list_of_pictures_by_ids_users[friends[i].id_user] = SafeURL;
                console.log( this.list_of_pictures_by_ids_users)
                compt_pp++
                if(compt_pp==friends.length){
                  this.sort_list_of_profile_pictures()
                }
              });
          }

          function first_check(THIS){
            if(data_retrieved ){
              compt ++;
              if(compt==friends.length){
                console.log(THIS.list_of_friends_ids)
                THIS.chatService.get_last_friends_message(THIS.list_of_friends_ids).subscribe(u=>{
                  THIS.list_of_friends_last_message=u[0].list_of_friends_messages;
                  console.log(THIS.list_of_friends_last_message);
                  last_messages_retrieved=true;
                  last_check(THIS)
                });

                THIS.chatService.get_my_real_friend(THIS.list_of_friends_ids).subscribe(v=>{
                  console.log(v[0])
                  if(v[0].message){
                    console.log(v);
                    THIS.friend_id=v[0][0].id_receiver;
                  }
                  else{
                    THIS.friend_id=THIS.list_of_friends_ids[0];
                  }
                  real_friend_retrieved=true;
                  last_check(THIS)
                });


              }
            }
            
          }

          function last_check(THIS){
            if(last_messages_retrieved && real_friend_retrieved){
              let ind = THIS.list_of_friends_ids.indexOf(THIS.friend_id);
              THIS.chat_friend_id=THIS.list_of_chat_friends_ids[ind]
              THIS.id_chat_section=THIS.list_of_friends_last_message[ind].id_chat_section;
              THIS.friend_name=THIS.list_of_friends_names[ind];
              THIS.friend_pseudo=THIS.list_of_friends_pseudos[ind];
              
              console.log(THIS.list_of_friends_date)
              THIS.sort_friends_groups_chats_list();
              console.log("THIS.list_of_friends_users_only");
              console.log(THIS.list_of_friends_users_only)
            }
            
          }
        }
      }
      else{
        // cas inexistant car tous les utilisateurs recoivent un message de la part du site officiel
        console.log("régler le cas 0 ...")
      }
      
    })
  };

  
  sort_friends_groups_chats_list(){
    console.log("sort")
    let len =this.list_of_friends_ids.length;
    this.chatService.get_my_list_of_groups().subscribe(l=>{
      let list_of_names=[]
      console.log(l[0]);
      console.log(l[0].length);
      if(l[0].length>0){
        for(let k=0;k<l[0].length;k++){
          
          list_of_names.push(l[0][k].name)
          this.list_of_friends_names[len+k]=l[0][k].name;
          this.list_of_friends_pseudos[len+k]=l[0][k].name
          this.list_of_groups_ids[k]=l[0][k].id;
          if(k==l[0].length-1){
            console.log(this.list_of_groups_ids)
            // get_list_of_groups_I_am_in sans les spams
            this.chatService.get_list_of_groups_I_am_in( this.list_of_groups_ids).subscribe(r=>{
              console.log(r[0].friends)
              let compt=0;
              
              let list_of_ids=[]
              for(let i=0;i<r[0].friends.length;i++){
                console.log(r[0].friends[i])
                list_of_ids.push(r[0].friends[i].id_receiver);
                this.list_of_chat_friends_ids[len+i]=r[0].friends[i].id;
                this.list_of_friends_ids[len+i]=r[0].friends[i].id_receiver;
                this.list_of_friends_date[len+i]=new Date(r[0].friends[i].date).getTime()/1000;
                this.list_of_friends_types[len+i]='group';
                console.log(r[0].friends[i].chat_profile_pic_name);
                console.log(r[0].friends[i].profile_pic_origin)
                this.chatService.retrieve_chat_profile_picture(r[0].friends[i].chat_profile_pic_name,r[0].friends[i].profile_pic_origin).subscribe(t=> {
                  console.log(t);
                  let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                  const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                  //this.list_of_friends_profile_pictures[len+i]=SafeURL;
                  console.log(r[0].friends[i].id_receiver)
                  this.list_of_pictures_by_ids_groups[r[0].friends[i].id_receiver] = SafeURL;
                  console.log( this.list_of_pictures_by_ids_groups)
                  compt ++;
                  if(compt==r[0].friends.length){
                    this.sort_list_of_profile_pictures();
                  }
                });

                
              }
              console.log(this.list_of_friends_ids)
              console.log(list_of_names)
              console.log(list_of_ids)

              let last_friends_retrieved=false;
              let real_friend_retrieved=false;
              this.chatService.get_last_friends_groups_message(list_of_ids).subscribe(u=>{
                console.log(u[0])
                this.list_of_friends_last_message=this.list_of_friends_last_message.concat(u[0].list_of_friends_messages);
                console.log(this.list_of_friends_last_message);
                last_friends_retrieved=true;
                last_check(this)
              });

              this.chatService.get_my_last_real_friend(list_of_ids,this.friend_id).subscribe(v=>{
                console.log(v[0])
                console.log(v[0][0].message)
                if(!(v[0][0].nothing_found)){
                  this.friend_id=v[0][0].id_receiver;
                  this.friend_type=(v[0][0].is_a_group_chat)?'group':'user';
                }
                else{
                  //mettre message du site
                  this.friend_type='user';
                  this.friend_id=this.list_of_friends_ids[0];
                }
                real_friend_retrieved=true;
                last_check(this)
              });


              function last_check(THIS){
                if(last_friends_retrieved && real_friend_retrieved){
                  console.log(THIS.friend_id)
                  console.log(THIS.friend_type)
                  console.log(THIS.list_of_friends_ids)
                  console.log(THIS.list_of_friends_types)
                  console.log(THIS.list_of_chat_friends_ids)
                  let ind = 0;
                  for(let i=0;i<THIS.list_of_friends_ids.length;i++){
                    if(THIS.list_of_friends_ids[i]== THIS.friend_id && THIS.list_of_friends_types[i]==THIS.friend_type){
                      ind=i;
                    }
                  }
                  console.log(THIS.list_of_friends_last_message[ind].id_chat_section)
                  if(ind<THIS.list_of_friends_ids.length-1){
                    THIS.number_of_friends_to_show=ind+10;
                  }
                  else{
                    THIS.number_of_friends_to_show=ind;
                  }
                  THIS.id_chat_section=(THIS.list_of_friends_last_message[ind])?THIS.list_of_friends_last_message[ind].id_chat_section:1;
                  THIS.friend_type=(THIS.list_of_friends_last_message[ind].is_a_group_chat)?'group':'user';
                  THIS.friend_name=THIS.list_of_friends_names[ind];
                  THIS.friend_pseudo=THIS.list_of_friends_pseudos[ind];
                  //THIS.friend_picture=THIS.list_of_friends_profile_pictures[ind];
                  THIS.chat_friend_id=THIS.list_of_chat_friends_ids[ind];
                  console.log(THIS.id_chat_section);
                  console.log(THIS.friend_name);
                  console.log("start sorting sort_list_of_groups_and_friends")
                  THIS.sort_list_of_groups_and_friends();
                }
                
              }
            })
          }
        }
        
      }
      else{
        this.friend_type='user';
        this.can_sort_list_of_profile_pictures=true;
        if(this.list_of_pp_sorted){
          this.sort_list_of_profile_pictures()
        }
        this.get_connections_status();
        this.list_of_friends_retrieved=true;
        this.active_section_managment();
      }
      
      
      
    })
  }

  sort_list_of_groups_and_friends(){
    console.log("sort")
    let length=this.list_of_friends_ids.length
    for(let i=1;i<length;i++){
      for(let j=0;j<i;j++){
        if(i==1){
          console.log(this.list_of_friends_ids[1])
          console.log(this.list_of_friends_ids[0])
          console.log(this.list_of_friends_date[i])
          console.log(this.list_of_friends_date[j])
        }
        if(this.list_of_friends_date[i]>this.list_of_friends_date[j]){
          this.list_of_chat_friends_ids.splice(j,0,this.list_of_chat_friends_ids.splice(i,1)[0]);
          this.list_of_friends_last_message.splice(j,0,this.list_of_friends_last_message.splice(i,1)[0]);
          this.list_of_friends_date.splice(j,0,this.list_of_friends_date.splice(i,1)[0]);
          this.list_of_friends_ids.splice(j,0,this.list_of_friends_ids.splice(i,1)[0]);
          this.list_of_friends_types.splice(j,0,this.list_of_friends_types.splice(i,1)[0]);
          this.list_of_friends_names.splice(j,0,this.list_of_friends_names.splice(i,1)[0]);
          this.list_of_friends_pseudos.splice(j,0,this.list_of_friends_pseudos.splice(i,1)[0]);
          
          //this.list_of_friends_profile_pictures.splice(j,0,this.list_of_friends_profile_pictures.splice(i,1)[0]);
        }
      }
    }
    this.can_sort_list_of_profile_pictures=true;
    if(this.list_of_pp_sorted){
      this.sort_list_of_profile_pictures()
    }
    
    this.get_connections_status();
    this.list_of_friends_retrieved=true;
    this.active_section_managment();
  }

  list_of_pp_sorted=false;
  can_sort_list_of_profile_pictures=false;
  sort_list_of_profile_pictures(){
    if(this.can_sort_list_of_profile_pictures){
      console.log("sort_listpp")
      console.log( this.list_of_pictures_by_ids_users)
      console.log(this.list_of_pictures_by_ids_groups)
      let length=this.list_of_friends_ids.length;
      let ind = this.list_of_friends_ids.indexOf(this.friend_id);
      console.log(ind)
      for(let i=0;i<length;i++){
        if(this.list_of_friends_types[i]=='user'){
          this.list_of_friends_profile_pictures[i]=this.list_of_pictures_by_ids_users[this.list_of_friends_ids[i]]
        }
        else{
          this.list_of_friends_profile_pictures[i]=this.list_of_pictures_by_ids_groups[this.list_of_friends_ids[i]]
        }
       
      }
      console.log(this.list_of_friends_ids)
      console.log(this.list_of_friends_profile_pictures)
      this.friend_picture=this.list_of_friends_profile_pictures[ind];
     
    }
    else{
      this.list_of_pp_sorted=true;
    }
    
  }

  active_section_managment(){
    if(this.active_section==2 || this.active_section==3){
      this.waiting_friend_type=this.friend_type
      this.waiting_friend_id=this.friend_id;
      this.waiting_friend_name=this.friend_name;
      this.waiting_friend_picture=this.friend_picture;
      this.waiting_friend_pseudo=this.friend_pseudo;
      this.waiting_id_chat_section=this.id_chat_section;
      this.waiting_chat_friend_id=this.chat_friend_id;
      this.id_chat_section=1;
      (this.active_section==2)?this.friend_type='user':this.friend_type='group';
      this.friend_id=this.active_section_user_id;
      console.log(this.friend_type)
      this.chatService.get_chat_friend(this.active_section_user_id,(this.active_section==2)?false:true).subscribe(m=>{
        console.log(m[0])
        
        if(m[0].nothing){
          this.chat_friend_id=0;
        }
        else{
          this.chat_friend_id=m[0].id;
        }

        let data_retrieved=false;
        let related_retrieved=false;
        let pp_retrieved=false;
        if(this.active_section==2){
         
          this.Profile_Edition_Service.retrieve_profile_data(this.active_section_user_id).subscribe(s=>{
            if(s[0]){
              this.friend_pseudo=s[0].nickname;
              this.friend_name=s[0].firstname + ' ' + s[0].lastname;
              data_retrieved=true;
              last_check(this);
            }
          })

          
          this.Profile_Edition_Service.retrieve_profile_picture(this.active_section_user_id).subscribe(t=> {
            let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.friend_picture=SafeURL;
            pp_retrieved=true;
            last_check(this);
            console.log(this.friend_id)
            console.log(this.friend_pseudo)
            console.log(this.spam)
          })

          this.chatService.check_if_is_related(this.active_section_user_id).subscribe(r=>{
            if(!r[0].value){
              this.spam='true';

              this.set_category(1);
              this.createFormAd();

              this.get_friends=false;
              this.get_spams=true;
            }
            related_retrieved=true;
            last_check(this);
            
          })

          function last_check(THIS){
            if(related_retrieved && data_retrieved && pp_retrieved){
              THIS.active_section_done=true;
            }
          }
        }
        else{
          let pp_retrieved=false;
          let information_retrieved=false;
          this.chatService.retrieve_chat_profile_picture(m[0].chat_profile_pic_name,m[0].profile_pic_origin).subscribe(t=> {
            console.log(t);
            let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.friend_picture=SafeURL;
            pp_retrieved=true;
            last_check(this);
            
          })

          this.chatService.get_group_chat_information(this.active_section_user_id).subscribe(s=>{
            console.log(s[0])
            this.friend_pseudo=s[0].name;
            this.friend_name=s[0].name;
            information_retrieved=true;
            last_check(this);
            
          })

          function last_check(THIS){
            if(information_retrieved && pp_retrieved){
              console.log(THIS.friend_name);
              console.log(THIS.friend_pseudo);
              console.log(THIS.friend_id);
              THIS.active_section_done=true;
            }
          }
        }
      })
      
    }
    else{
      if(this.friend_type=='group'){
        this.location.go(`/chat/group/${this.friend_pseudo}/${this.friend_id}`);
      }
      else{
        this.location.go(`/chat/${this.friend_pseudo}/${this.friend_id}`);
      }
    }
  }
  /*****************************************GESTION DES SPAMS *********************************/
  /*****************************************GESTION DES SPAMS *********************************/
  /*****************************************GESTION DES SPAMS *********************************/
  /*****************************************GESTION DES SPAMS *********************************/

  sort_spams_list() {
    console.log("emetteur sort spams list")
    this.chatService.get_number_of_unseen_messages_spams().subscribe(m=>{
      console.log(m);
      console.log(m[0].number_of_unseen_messages)
      if(m[0].number_of_unseen_messages>=0){
        this.number_of_unseen_messages=m[0].number_of_unseen_messages;
      }
      console.log( this.number_of_unseen_messages)
      
    })
    this.chatService.get_list_of_spams().subscribe(r=>{
      if(r[0].length>0){
        let compt=0;
        console.log(r[0])
        for(let i=0;i<r[0].length;i++){
          let data_retrieved=false;
          let pp_retrieved=false;
          if(r[0][i].id_user==this.current_user){
              this.list_of_spams_ids[i]=r[0][i].id_receiver;
              this.Profile_Edition_Service.retrieve_profile_data(r[0][i].id_receiver).subscribe(s=>{
                this.list_of_spams_pseudos[i]=s[0].nickname;
                this.list_of_spams_names[i]=s[0].firstname + ' ' + s[0].lastname;
                data_retrieved=true;
                last_check(this)
              });

              this.list_of_spams_profile_pictures[i]=false;
              this.Profile_Edition_Service.retrieve_profile_picture(  r[0][i].id_receiver ).subscribe(t=> {
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.list_of_spams_profile_pictures[i] = SafeURL;
                pp_retrieved=true;
                last_check(this)
              });
          }
          else{
            this.list_of_spams_ids[i]=r[0][i].id_user;
            this.Profile_Edition_Service.retrieve_profile_data(r[0][i].id_user).subscribe(s=>{
              this.list_of_spams_pseudos[i]=s[0].nickname;
              this.list_of_spams_names[i]=s[0].firstname + ' ' + s[0].lastname;
              data_retrieved=true;
              last_check(this)
            });

            this.list_of_spams_profile_pictures[i]=false;
            this.Profile_Edition_Service.retrieve_profile_picture(  r[0][i].id_user ).subscribe(t=> {
              let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_spams_profile_pictures[i] = SafeURL;
              pp_retrieved=true;
              last_check(this)
            });
          }


          function last_check(THIS){
            if( data_retrieved && pp_retrieved){
              compt ++;
              if(compt==r[0].length){
                THIS.chatService.get_last_friends_message(THIS.list_of_spams_ids).subscribe(u=>{
                  console.log("get_last_spams_message")
                  console.log(u)
                  THIS.list_of_spams_last_message=u[0].list_of_friends_messages;
                  THIS.spam_id= THIS.list_of_spams_ids[0];
                  THIS.spam_name=THIS.list_of_spams_names[0];
                  THIS.spam_pseudo=THIS.list_of_spams_pseudos[0];
                  THIS.spam_picture=THIS.list_of_spams_profile_pictures[0];
                  THIS.list_of_spams_retrieved=true;
                  console.log(THIS.spam_id)
                });
              }
            }
            
          }
        }
      }
      else{
        this.list_of_spams_retrieved=true;
        console.log("aucun spam")
      }
    })
  };
  

  add_spam_to_contacts(event){
    // set sumo selector manu
    console.log("adding new user");
    console.log(event )
    let index=this.list_of_spams_ids.indexOf(event.spam_id);
    let chat_friend_id=event.message.chat_id;
    let name =  this.list_of_spams_names[index];
    let profile_picture =this.list_of_spams_profile_pictures[index]
    let pseudo = this.list_of_spams_pseudos[index];

    this.list_of_spams_ids.splice(index,1);
    this.list_of_spams_last_message.splice(index,1);
    this.list_of_spams_names.splice(index,1);
    this.list_of_spams_profile_pictures.splice(index,1);
    this.spam_pp_loaded.splice(index,1);
    this.list_of_spams_pseudos.splice(index,1);
    
    this.list_of_chat_friends_ids.splice(0,0,chat_friend_id);
    this.list_of_friends_types.splice(0,0,'user');
    this.list_of_friends_ids.splice(0,0,event.spam_id);
    this.list_of_friends_names.splice(0,0,name);
    this.list_of_friends_profile_pictures.splice(0,0,profile_picture);
    this.friend_pp_loaded.splice(0,0,false);
    this.list_of_friends_pseudos.splice(0,0,pseudo);
    this.list_of_friends_last_message.splice(0,0,event.message);

    if(this.list_of_spams_ids.length>0){
      this.spam_id=this.list_of_spams_ids[0];
      this.spam_pseudo=  this.list_of_spams_pseudos[0];
      this.spam_name=this.list_of_spams_names[0];
      this.spam_picture= this.list_of_spams_profile_pictures[0];
    }
    
    console.log(this.list_of_friends_last_message);

    console.log(this.friend_id)
    console.log(event.spam_id )
    console.log( this.spam)
    if(this.friend_id==event.spam_id  && this.spam=='true'){
      console.log("on est e ntrain de discuter avec le spam ou on est le spam")
      this.friend_type='user';
      this.friend_id=event.spam_id;
      this.friend_pseudo=pseudo;
      this.friend_name=name;
      this.friend_picture=profile_picture;
      this.chat_friend_id=chat_friend_id;

      this.waiting_friend_type='user';
      this.waiting_friend_id=this.friend_id;
      this.waiting_chat_friend_id=this.chat_friend_id;
      this.waiting_friend_name=this.friend_name;
      this.waiting_friend_picture=this.friend_picture;
      this.waiting_friend_pseudo=this.friend_pseudo;

      this.get_friends=true;
      this.get_spams=false;
      

      this.set_category(0);
      this.createFormAd();
      console.log("radio changed")
      this.spam='false';

    }
    
    this.cd.detectChanges();
  }

  change_section(event){
    this.id_chat_section=event.id_chat_section;
  }

    /*****************************************************emit managment ********************** */
/*****************************************************emit managment ********************** */
/*****************************************************emit managment ********************** */
/*****************************************************emit managment ********************** */
/*****************************************************emit managment ********************** */
/*****************************************************emit managment ********************** */

//utilisateur vous a bloqué

blocking_managment(event){
  console.log(event)
  console.log(this.list_of_friends_types)
  console.log(this.list_of_friends_ids)
  let index=-1;
  for(let i=0;i<this.list_of_friends_ids.length;i++){
    if(this.list_of_friends_ids[i]==event.friend_id && this.list_of_friends_types[i]=='user'){
      index=i;
    }
  }
  console.log(index)
  if(index>=0){
    this.list_of_friends_types.splice(index,1);
    this.list_of_friends_ids.splice(index,1);
    this.list_of_friends_last_message.splice(index,1);
    this.list_of_friends_names.splice(index,1);
    this.list_of_chat_friends_ids.splice(index,1);
    this.list_of_friends_profile_pictures.splice(index,1);
    this.friend_pp_loaded.splice(index,1);
    this.list_of_friends_pseudos.splice(index,1);
    this.cd.detectChanges()
  }
  else{
    let index=-1;
    for(let i=0;i<this.list_of_spams_ids.length;i++){
      if(this.list_of_spams_ids[i]==event.friend_id ){
        index=i;
      }
    }
    console.log(index)
    if(index>=0){
      this.list_of_spams_ids.splice(index,1);
      this.list_of_spams_last_message.splice(index,1);
      this.list_of_spams_names.splice(index,1);
      this.list_of_spams_profile_pictures.splice(index,1);
      this.spam_pp_loaded.splice(index,1);
      this.list_of_spams_pseudos.splice(index,1);
      this.cd.detectChanges()
    }
  }
  this.Profile_Edition_Service.retrieve_profile_data(event.friend_id).subscribe(r=>{
    let date=new Date();
    this.list_of_users_blocked.push({id_user:event.friend_id,id_user_blocked:this.current_user,date:date});
  })
}

//un utilisateur a quitté le groupe
display_exit(event){
  let index=-1;
  for(let i=0;i<this.list_of_friends_ids.length;i++){
    if(this.list_of_friends_ids[i]==event.friend_id && this.list_of_friends_types[i]=='group'){
      index=i;
    }
  }
  this.list_of_friends_types.splice(0,0,this.list_of_friends_types.splice(index,1)[0]);
  this.list_of_friends_ids.splice(0,0,this.list_of_friends_ids.splice(index,1)[0]);
  this.list_of_friends_last_message[index]=event.message;
  this.list_of_friends_last_message.splice(0,0,this.list_of_friends_last_message.splice(index,1)[0]);
  this.list_of_friends_names.splice(0,0,this.list_of_friends_names.splice(index,1)[0]);
  this.list_of_chat_friends_ids.splice(0,0,this.list_of_chat_friends_ids.splice(index,1)[0]);
  this.list_of_friends_profile_pictures.splice(0,0,this.list_of_friends_profile_pictures.splice(index,1)[0]);
  this.friend_pp_loaded.splice(0,0,this.friend_pp_loaded.splice(index,1)[0]);
  this.list_of_friends_pseudos.splice(0,0,this.list_of_friends_pseudos.splice(index,1)[0]);
  this.cd.detectChanges()
}

change_message_status(event){
  console.log(event);
  console.log(this.list_of_friends_ids);
  console.log(this.list_of_friends_names)
  console.log(this.list_of_friends_last_message)
  if(!event.spam){
    
    let index_friend=-1;
    for(let i=0;i<this.list_of_friends_ids.length;i++){
      if(this.list_of_friends_ids[i]==event.friend_id && this.list_of_friends_types[i]==event.friend_type){
        index_friend=i;
      }
    }
    console.log(index_friend)
    
    if(index_friend>=0){
      if(event.status=="delete" && this.list_of_friends_last_message[index_friend].id_chat_section==event.id_chat_section){
        this.list_of_friends_last_message[index_friend].status="deleted";
      } 
      if(event.status=="seen" &&  this.list_of_friends_last_message[index_friend].id_chat_section==event.id_chat_section){
        if(event.friend_type=='group'){
           if( (this.list_of_friends_last_message[index_friend].id_user==this.current_user && this.current_user!=event.real_friend_id)
             || this.list_of_friends_last_message[index_friend].id_user!=this.current_user ){
               console.log("putting messages group to seen")
              if( this.list_of_friends_last_message[index_friend].list_of_users_who_saw.indexOf(event.real_friend_id)<0){
                this.list_of_friends_last_message[index_friend].list_of_users_who_saw.push(event.real_friend_id);
              }
           }
        }
        else if((this.list_of_friends_last_message[index_friend].id_user==this.current_user && this.current_user!=event.real_friend_id)
        || this.list_of_friends_last_message[index_friend].id_user!=this.current_user){
          this.list_of_friends_last_message[index_friend].status="seen";
        }
        
        
      } 
      
      
    }
    else{
      console.log("error friend not retrieved")
    }
    
  }
  else{
    let index_spam=this.list_of_spams_ids.indexOf(event.friend_id);
    console.log(index_spam)
    
    if(index_spam>=0){
      if(event.status=="delete"){
        this.list_of_spams_last_message[index_spam].status="deleted";
      } 
      if(event.status=="seen"){
        this.list_of_spams_last_message[index_spam].status="seen";
      } 
      
    }
    else{
      console.log("error spam not retrieved")
    }
    
  }
  this.cd.detectChanges()
}

  new_sort_friends_list(event){
    if(this.list_of_pp_sorted){
      console.log("getting message from chat")
      console.log(event);
      console.log(this.list_of_friends_ids)
      console.log(this.list_of_friends_types)
      let index=-1;
      for(let i=0;i<this.list_of_friends_ids.length;i++){
        if(this.list_of_friends_ids[i]==event.friend_id && this.list_of_friends_types[i]==event.friend_type ){
          index=i;
        }
      }
      console.log(index)
      if(index>=0){
        console.log("a friend message")
        //fait partie de la liste des contacts
        console.log(event.message);
        this.list_of_friends_last_message[index]=event.message;
        this.cd.detectChanges();
        //put message to seen
        if(this.friend_id==event.friend_id && this.user_present && event.id_chat_section==event.message.id_chat_section && this.friend_type==event.friend_type){
          this.list_of_friends_last_message[index].status="seen";
          console.log("seen")
          this.cd.detectChanges();
        }
        //put message to received
        else{
          this.list_of_friends_last_message[index].status="received";
          console.log("received");
          this.cd.detectChanges();
        }
        this.list_of_friends_types.splice(0,0,this.list_of_friends_types.splice(index,1)[0]);
        this.list_of_friends_ids.splice(0,0,this.list_of_friends_ids.splice(index,1)[0]);
        this.list_of_friends_last_message.splice(0,0,this.list_of_friends_last_message.splice(index,1)[0]);
        this.list_of_friends_names.splice(0,0,this.list_of_friends_names.splice(index,1)[0]);
        this.list_of_chat_friends_ids.splice(0,0,this.list_of_chat_friends_ids.splice(index,1)[0]);
        this.list_of_friends_profile_pictures.splice(0,0,this.list_of_friends_profile_pictures.splice(index,1)[0]);
        this.friend_pp_loaded.splice(0,0,this.friend_pp_loaded.splice(index,1)[0]);
        this.list_of_friends_pseudos.splice(0,0,this.list_of_friends_pseudos.splice(index,1)[0]);
        console.log(this.list_of_friends_last_message)
        this.cd.detectChanges();
  
      }
      else{
        console.log("dans le else new sort")
        //à compléter
        console.log(event);
        if(event.friend_type=='group'){
          this.get_group_chat_name(event.friend_id,event.message,false);
        }
        else{
          let index2=this.list_of_spams_ids.indexOf(event.friend_id);
          this.chatService.check_if_is_related(event.friend_id).subscribe(r=>{
            if(r[0].value){
              if(event.friend_id==this.current_user){
                console.log("it s me")
                this.list_of_friends_types.splice(0,0,'user');
                this.list_of_friends_ids.splice(0,0,event.friend_id);
                  this.list_of_friends_last_message.splice(0,0,event.message);
                  this.list_of_friends_last_message[0].status="received";
                  this.list_of_friends_names.splice(0,0,this.current_user_name);
                  this.list_of_chat_friends_ids.splice(0,0,event.message.chat_id);
                  this.list_of_friends_profile_pictures.splice(0,0,this.profile_picture);
                  this.friend_pp_loaded.splice(0,0,false);
                  this.list_of_friends_pseudos.splice(0,0,this.current_user_pseudo);
                  this.cd.detectChanges();
              }
              else{
                console.log("related but not me")
                let name;
                let pseudo;
                let picture;
                let data_retrieved=false;
                let pp_retrieved=false;
                this.Profile_Edition_Service.retrieve_profile_data(event.friend_id).subscribe(s=>{
                  console.log(s);
                  pseudo = s[0].nickname;
                  name =s[0].firstname + ' ' + s[0].lastname;
                  data_retrieved=true;
                  check_all(this)
                });
  
                this.Profile_Edition_Service.retrieve_profile_picture( event.friend_id).subscribe(t=> {
                  console.log(t);
                  let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                  const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                  picture = SafeURL;
                  pp_retrieved=true;
                  check_all(this)
                
                })
  
                function check_all(THIS){
                  if(data_retrieved && pp_retrieved){
                    THIS.list_of_friends_types.splice(0,0,'user');
                    THIS.list_of_friends_ids.splice(0,0,event.friend_id);
                    THIS.list_of_friends_last_message.splice(0,0,event.message);
                    THIS.list_of_friends_last_message[0].status="received";
                    THIS.list_of_friends_names.splice(0,0,name);
                    THIS.list_of_chat_friends_ids.splice(0,0,event.message.chat_id);
                    THIS.list_of_friends_profile_pictures.splice(0,0,picture);
                    THIS.friend_pp_loaded.splice(0,0,false);
                    THIS.list_of_friends_pseudos.splice(0,0,pseudo);
                    THIS.cd.detectChanges();
                  }
                 
                }
              }
            }
            
            if(!r[0].value && index2>=0){
              if(this.get_friends){
                console.log("spam mais je ne suis pas dans la catégorie spam");
                this.sort_spams_list();
              }
              else if(this.list_of_spams_retrieved){
                console.log("spam but in list of spams");
                this.list_of_spams_last_message[index2]=event.message;
                this.list_of_spams_last_message[index2].status="received";
                this.list_of_spams_ids.splice(0,0,this.list_of_spams_ids.splice(index2,1)[0]);
                this.list_of_spams_last_message.splice(0,0,this.list_of_spams_last_message.splice(index2,1)[0]);
                this.list_of_spams_names.splice(0,0,this.list_of_spams_names.splice(index2,1)[0]);
                this.list_of_spams_profile_pictures.splice(0,0,this.list_of_spams_profile_pictures.splice(index2,1)[0]);
                this.spam_pp_loaded.splice(0,0,this.spam_pp_loaded.splice(index2,1)[0]);
                this.list_of_spams_pseudos.splice(0,0,this.list_of_spams_pseudos.splice(index2,1)[0]);
                this.cd.detectChanges();
              }
              
            }
            if(!r[0].value && index2<0){
              if(this.get_friends){
                console.log("spam mais je ne suis pas dans la catégorie spam");
                this.sort_spams_list();
              }
              else if(this.list_of_spams_retrieved){
                let pseudo;
                let picture;
                let name;
                let data_retrieved=false;
                let pp_retrieved=false;
  
                console.log("spam mais pas dans ma listde spams");
                this.Profile_Edition_Service.retrieve_profile_data(event.friend_id).subscribe(s=>{
                  pseudo = s[0].nickname;
                  name =s[0].firstname + ' ' + s[0].lastname;
                  data_retrieved=true;
                  check_all(this)
                });
  
                this.Profile_Edition_Service.retrieve_profile_picture(  event.friend_id).subscribe(t=> {
                  let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                  const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                  picture = SafeURL;
                  pp_retrieved=true;
                  check_all(this)
                  
                })
  
                function check_all(THIS){
                  if(data_retrieved && pp_retrieved){
                    THIS.list_of_spams_ids.splice(0,0,event.friend_id);
                    THIS.list_of_spams_last_message.splice(0,0,event.message);
                    THIS.list_of_spams_last_message[0].status="received";
                    THIS.list_of_spams_names.splice(0,0,name);
                    THIS.list_of_spams_profile_pictures.splice(0,0,picture);
                    THIS.spam_pp_loaded.splice(0,0,false);
                    THIS.list_of_spams_pseudos.splice(0,0,pseudo);
                    console.log(THIS.list_of_spams_ids);
                    THIS.cd.detectChanges();
                  }
                
                }
  
              }
              
              
            }
          })
        }
      }
    }
    
  }

  /**************************************************ADD FRIEND TO GROUP ************************* */
/**************************************************ADD FRIEND TO GROUP ************************* */
/**************************************************ADD FRIEND TO GROUP ************************* */
/**************************************************ADD FRIEND TO GROUP ************************* */
  


  
  add_a_friend_to_the_group(event){
    this.cancel_create_group_chat();
    this.set_category(0);
    this.display_other_contacts=false;
    this.selected_list_of_new_friends_ids=[];
    this.selected_list_of_new_friends_names=[];
    this.list_of_new_friends_ids=[];
    this.list_of_new_friends_names=[];
    this.list_of_new_friends_pseudos=[];
    this.list_of_new_friends_pictures=[];
    this.new_friends_loaded=[];
    this.id_group_where_friends_are_added=event.friend_id;
    this.display_all_searching_proppositions=false;
    this.display_all_searching_proppositions_button=false;
    this.get_first_propositions_for_add_friend();
  }

  cancel_add_friend_group(){
    console.log("cancel_add_friend_group");
    this.selected_list_of_new_friends_ids=[];
    this.selected_list_of_new_friends_names=[];
    this.list_of_new_friends_ids=[];
    this.list_of_new_friends_names=[];
    this.list_of_new_friends_pseudos=[];
    this.list_of_new_friends_pictures=[];
    this.new_friends_loaded=[]
    this.trigger_selected_list_invalid=false;
    this.display_add_a_friend_to_a_group=false;
    this.get_propositions=false;
    this.cd.detectChanges();
    this.delete_placeholder();
  }

  trigger_selected_list_invalid
  add_friend_done() {
    console.log("add friend done")
    //valider l'ajout d'ami au groupe
    if(this.selected_list_of_new_friends_names.length>0){
      this.chatService.add_new_friends_to_a_group(this.id_group_where_friends_are_added,this.selected_list_of_new_friends_ids).subscribe(r=>{
        console.log(r[0])
        if(r[0] && r[0].warning){
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:"Le groupe ne peut contenir plus de 10 utilisateurs."},
          });
          this.selected_list_of_new_friends_names=[];
          
          this.selected_list_of_new_friends_ids=[];
        }
        else if(r[0]){
          let group_name=r[0].name;
          if(r[0]){
            let message_one ={
              id_user_name:this.current_user_pseudo,
              id_user:this.current_user,   
              id_receiver:this.id_group_where_friends_are_added,  
              message:"New_friend_in_the_group",
              list_of_users_who_saw:[this.current_user],
              user_name:this.current_user_name,
              group_name:group_name,
              list_of_users_in_the_group:r[0].list_of_receivers_ids,
              list_of_names_added:this.selected_list_of_new_friends_names,
              is_from_server:true,
              status:"sent",
              id_chat_section:1,
              attachment_name:"none",
              attachment_type:"none",
              is_a_response:false,
              is_an_attachment:false,
              is_a_group_chat:true,
            };
            this.chatService.messages.next(message_one);
            this.cancel_add_friend_group();
          }
        }
        
       
      })
    }
    else{
      console.log("liste non valide");
      this.trigger_selected_list_invalid=true;
    }
  }
 
  
  activateFocus_add() {
    this.get_propositions=true;
    console.log("active focus add");
    this.input.nativeElement.focus();
    console.log(this.fd.value.fdSearchbar);
    if(this.fd.value.fdSearchbar=='' && !this.display_first_propositions){
     this.get_first_propositions_for_add_friend();
    }
  }
  
  get_first_propositions_for_add_friend(){
    this.number_of_new_friends_to_show=10;
    console.log("get_first_propositions_for_add_friend")
    this.display_other_contacts=false;
    this.list_of_new_friends_ids=[];
    this.list_of_new_friends_names=[];
    this.list_of_new_friends_pseudos=[];
    this.list_of_new_friends_pictures=[];
    this.new_friends_loaded=[];
    this.compteur_research++;
    this.chatService.get_chat_first_propositions_add_friend(this.id_group_where_friends_are_added,this.compteur_research).subscribe(r=>{
      console.log(r[0][0])
      let compt=0;
      if(r[0][0].list.length>0 && r[1]==this.compteur_research){
        for(let i=0;i<r[0][0].list.length;i++){
          this.list_of_new_friends_names[i]=r[0][0].list[i].firstname + ' ' + r[0][0].list[i].lastname;
          this.list_of_new_friends_pseudos[i]=r[0][0].list[i].nickname;
          this.list_of_new_friends_ids[i]=r[0][0].list[i].id;
          this.list_of_new_friends_pictures[i]=null;
          this.Profile_Edition_Service.retrieve_profile_picture(  r[0][0].list[i].id ).subscribe(t=> {
            let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            if(r[1]==this.compteur_research){
              this.list_of_new_friends_pictures[i] = SafeURL;
            
            }
  
          })
          compt ++;
          if(compt==r[0][0].list.length){
            console.log( this.list_of_new_friends_names)
            console.log(this.list_of_new_friends_ids)
            this.display_first_propositions=true;
            this.display_add_a_friend_to_a_group=true;
            this.get_propositions=true;
          }
        }
      }
      else{
        console.log("aucune contact")
        //ajouter message si aucun ami disponible
        this.display_first_propositions=true;
        this.display_add_a_friend_to_a_group=true;
        this.get_propositions=true;
      }
    })
  }

  research_friends_add(){
    console.log("research_friends_add")
    console.log(this.display_add_a_friend_to_a_group)
    this.display_first_propositions=false;
    this.number_of_new_friends_to_show=10;
    if(this.fd.value.fdSearchbar==''){
      console.log("research_friends_add + get_first_propositions_for_add_friend")
      this.display_other_contacts=false;
      this.get_first_propositions_for_add_friend();
    }
    else if(this.fd.value.fdSearchbar.replace(/\s/g, '').length>0){
      console.log(this.fd.value.fdSearchbar)
      this.list_of_new_friends_ids=[];
      this.list_of_new_friends_names=[];
      this.list_of_new_friends_pseudos=[];
      this.list_of_new_friends_pictures=[];
      this.new_friends_loaded=[];
      this.compteur_research++;
      this.chatService.get_chat_propositions_add_friend(this.id_group_where_friends_are_added,this.fd.value.fdSearchbar,this.compteur_research).subscribe(r=>{
        console.log(r[0][0])
        console.log(r[1])
        let compt=0;
        if(r[0][0].list.length>0 && r[1]==this.compteur_research){
          for(let i=0;i<r[0][0].list.length;i++){
            this.list_of_new_friends_names[i]=r[0][0].list[i].firstname + ' ' + r[0][0].list[i].lastname;
            this.list_of_new_friends_pseudos[i]=r[0][0].list[i].nickname;
            this.list_of_new_friends_ids[i]=r[0][0].list[i].id;
            this.list_of_new_friends_pictures[i]=null;
            this.Profile_Edition_Service.retrieve_profile_picture(  r[0][0].list[i].id ).subscribe(t=> {
              let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              if(r[1]==this.compteur_research){
                this.list_of_new_friends_pictures[i] = SafeURL;
                
              }
    
            })
            compt ++;
                if(compt==r[0][0].list.length){
                  console.log( this.list_of_new_friends_ids);
                  console.log( this.list_of_new_friends_pseudos);
                  console.log(this.list_of_new_friends_pictures)
                  this.display_other_contacts=true;
                }
          }
        }
        else{
          console.log("aucune contact")
          //ajouter message si aucun ami disponible
          this.display_other_contacts=true;
        }
      })
    }
    
  }


  check_if_is_in_selected_ids_add(id){
    let response=false;
    for(let i=0;i<this.selected_list_of_new_friends_ids.length;i++){
      if(this.selected_list_of_new_friends_ids[i]==id){
        response=true;
      }
    }
    return(response)
  }

  add_friend_to_group(i){
    console.log(this.list_of_new_friends_ids[i])
    this.selected_list_of_new_friends_names.push(this.list_of_new_friends_pseudos[i])
    this.selected_list_of_new_friends_ids.push(this.list_of_new_friends_ids[i])
    console.log(this.selected_list_of_new_friends_ids)
  }
  
  remove_friend_to_group(i){
    console.log(this.list_of_new_friends_ids[i])
    let index=this.selected_list_of_new_friends_ids.indexOf(this.list_of_new_friends_ids[i])
    this.selected_list_of_new_friends_ids.splice(index,1)
    this.selected_list_of_new_friends_names.splice(index,1)
    
    console.log(this.selected_list_of_new_friends_ids)
  }
/**************************************************SEARCHBAR ************************* */
/**************************************************SEARCHBAR ************************* */
/**************************************************SEARCHBAR ************************* */
/**************************************************SEARCHBAR ************************* */
/**************************************************SEARCHBAR ************************* */
/**************************************************SEARCHBAR ************************* */
/**************************************************SEARCHBAR ************************* */

  fd: FormGroup;
  formData: FormGroup;
  Groupchat: FormGroup;
  fdSearchbar: FormControl;
  Groupchatname: FormControl;
  active: boolean;
  opened_category_for_research=0;
  
  createFormControlsAds() {
    this.fdSearchbar = new FormControl('');
    this.Groupchatname= new FormControl('', 
      Validators.compose([
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30),
        Validators.pattern(pattern("text")),
      ]),
    );
  }


  createFormAd() {
    this.fd = new FormGroup({
      fdSearchbar: this.fdSearchbar,
    });
    this.Groupchat = new FormGroup({
      Groupchatname: this.Groupchatname,
    });
  }

 

  list_of_contacts_ids:any[]=[];
  list_of_contacts_names:any[]=[];
  list_of_contacts_pseudos:any[]=[];
  list_of_contacts_pictures:any[]=[];
  display_first_propositions:boolean=false;
  display_first_propositions_group:boolean=false;

 

  list_of_related_contacts_ids:any[]=[];
  list_of_related_contacts_names:any[]=[];
  list_of_related_contacts_pseudos:any[]=[];
  list_of_related_contacts_pictures:any[]=[];

  list_of_other_contacts_ids:any[]=[];
  list_of_other_contacts_names:any[]=[];
  list_of_other_contacts_pseudos:any[]=[];
  list_of_other_contacts_pictures:any[]=[];

  display_history:boolean=false;
  display_related:boolean=false;
  display_others:boolean=false;
  display_other_contacts:boolean=false;
  loading_other_propositions:boolean=false;

  open_category_for_research(i){
    if(this.opened_category_for_research==i){
      return
    }
    this.opened_category_for_research=i;
    if(i==1 && this.fd.value.fdSearchbar=='' && !this.display_first_propositions_group){
      console.log("here group")
      this.compteur_research++;
      this.get_first_history_propositions_group();
    }
    if(this.fd.value.fdSearchbar!=''){
      this.research_friends();
    }
  }

  compteur_first_propositions=0;
  activateFocus() {
    this.get_propositions=true;
    console.log("active focus");
    this.input.nativeElement.focus();
    console.log(this.fd.value.fdSearchbar);
    if(this.fd.value.fdSearchbar=='' && !this.display_first_propositions){
      this.get_first_history_propositions();
    }
  }

  delete_placeholder(){

    if( this.input ) {
      this.input.nativeElement.value='';
    }
    this.fd.value.fdSearchbar='';
    if(!this.select_group_chat_contacts && !this.display_add_a_friend_to_a_group){
      this.get_propositions=false;
      this.loading_other_propositions=false;
      this.display_first_propositions=false;
      this.display_other_contacts=false;
      this.opened_category_for_research=0;
    }
    else if(this.select_group_chat_contacts){
      this.loading_other_propositions=false;
      this.display_first_propositions=true;
    }
    else if(this.display_add_a_friend_to_a_group){
      this.get_first_propositions_for_add_friend();
    }
  }
 
  get_first_history_propositions_group(){
    
    this.list_of_contacts_groups_ids=[];
    this.list_of_contacts_groups_names=[];
    this.list_of_contacts_groups_pictures=[];
    this.chatService.get_chat_first_propositions_group(this.compteur_research).subscribe(m=>{
      let r=m[0];
      console.log(r[0].list)
      if(m[1]==this.compteur_research){
        let compt=0;
        if(r[0].list.length>0){
          for(let i=0;i<r[0].list.length;i++){
            this.list_of_contacts_groups_names[i]=r[0].list[i].name;
            this.list_of_contacts_groups_ids[i]=r[0].list[i].id;
            console.log("getting group chat")
            console.log()
            this.chatService.get_group_chat_as_friend(r[0].list[i].id).subscribe(l=>{
              console.log(l[0])
              if(m[1]==this.compteur_research){
                this.chatService.retrieve_chat_profile_picture(  l[0].chat_profile_pic_name, l[0].profile_pic_origin).subscribe(t=> {
                  let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                  const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                  if(m[1]==this.compteur_research){
                    this.list_of_contacts_groups_pictures[i] = SafeURL;
                  }
                 
                })
               
              }
              compt ++;
              if(compt==r[0].list.length){
                console.log(this.list_of_contacts_groups_names)
                this.display_first_propositions_group=true;
              }
            })
            
          }
        }
        else{
          this.display_first_propositions_group=true;
        }
      }
      
    })
  }


  get_first_history_propositions(){
    this.compteur_first_propositions++;
    this.list_of_contacts_ids=[];
    this.list_of_contacts_names=[];
    this.list_of_contacts_pseudos=[];
    this.list_of_contacts_pictures=[];
    this.chatService.get_chat_history(this.compteur_first_propositions).subscribe(m=>{
      let r=m[0]
      if(this.compteur_first_propositions==m[1]){
        console.log(r[0])
        let compt=0;
        if(r[0].list_of_history.length>0){
          for(let i=0;i<r[0].list_of_history.length;i++){
            this.list_of_contacts_names[i]=r[0].list_of_history[i].firstname + ' ' + r[0].list_of_history[i].lastname;
            console.log( this.list_of_contacts_names[i])
            this.list_of_contacts_pseudos[i]=r[0].list_of_history[i].nickname;
            this.list_of_contacts_ids[i]=r[0].list_of_history[i].id;
            this.Profile_Edition_Service.retrieve_profile_picture(  r[0].list_of_history[i].id ).subscribe(t=> {
              let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              if(this.compteur_first_propositions==m[1]){
                this.list_of_contacts_pictures[i] = SafeURL;
              }
              
             
    
            })
            compt ++;
            if(compt==r[0].list_of_history.length){
              this.get_first_propositions(0,this.compteur_first_propositions);
            }
          }
        }
        else{
          this.get_first_propositions(0,this.compteur_first_propositions);
          
        }
      }
      
      
    })
  }

  
  get_first_propositions(val,compteur){
   
    if(val==1){
      // pour la création de groupes
      this.list_of_contacts_ids=[];
      this.list_of_contacts_names=[];
      this.list_of_contacts_pseudos=[];
      this.list_of_contacts_pictures=[];
    }
    this.chatService.get_first_searching_propositions().subscribe(r=>{
      if(compteur==this.compteur_first_propositions){
        let compt=0;
        let length=this.list_of_contacts_ids.length;
        console.log("first propositions");
        console.log(r[0]);
        if(r[0].list.length>0){
          for(let i=0;i<r[0].list.length;i++){
            this.list_of_contacts_names[length+i]=r[0].list[i].firstname + ' ' + r[0].list[i].lastname;
            console.log( this.list_of_contacts_names[length+i])
            this.list_of_contacts_pseudos[length+i]=r[0].list[i].nickname;
            this.list_of_contacts_ids[length+i]=r[0].list[i].id;
            this.list_of_contacts_pictures[length+i] =null;
            this.Profile_Edition_Service.retrieve_profile_picture(  r[0].list[i].id ).subscribe(t=> {
              let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              if(compteur==this.compteur_first_propositions){
                this.list_of_contacts_pictures[length+i] = SafeURL;
                compt ++;
                if(compt==r[0].list.length){
                  if(val==0){
                    let end=this.list_of_contacts_ids.length;
                    for(let j=length;j<end;j++){
                      if(this.list_of_contacts_ids[end-j+length-1]){
                        let splice=false;
                        let indice=-1;
                        for(let k=0;k<length;k++){
                          if(this.list_of_contacts_ids[k]==this.list_of_contacts_ids[end-j+length-1]){
                            splice=true;
                            indice=end-j-1+length;
                          }
                          if(k==length-1){
                            if(splice){
                              this.list_of_contacts_ids.splice(indice,1);
                              this.list_of_contacts_names.splice(indice,1);
                              this.list_of_contacts_pseudos.splice(indice,1);
                              this.list_of_contacts_pictures.splice(indice,1);
                              this.contact_pp_loaded.splice(indice,1)
                            }
                          }
                        }
                      }
                    }
                  }
                  
                  this.display_first_propositions=true;
                  console.log(this.list_of_contacts_names)
                  console.log(this.list_of_contacts_pictures)
                }
              }
            })
          }
        }
        else{
          this.display_first_propositions=true;
        }
      }
     
      
    })
  }

  
  compteur_research=0;
  research_friends(){
    console.log("research friend")
    console.log(this.display_add_a_friend_to_a_group)
      this.compteur_research++;
      if(this.opened_category_for_research==1){
        this.number_of_groups_to_show=10;
        console.log(this.display_first_propositions);
        console.log(this.loading_other_propositions)
        console.log(this.list_of_contacts_groups_names)
        console.log(this.list_of_propositions_groups_names)
        console.log(this.display_first_propositions_group)
        if(this.fd.value.fdSearchbar==''){
          this.loading_other_propositions=false;
          if(!this.display_first_propositions_group){
            this.get_first_history_propositions_group();
          }
        }
        else if(this.fd.value.fdSearchbar.replace(/\s/g, '').length>0){
          this.loading_other_propositions=true;
          this.list_of_propositions_groups_pictures=[];
          this.list_of_propositions_groups_names=[];
          this.list_of_propositions_groups_ids=[];
          this.display_propositions_groups=false;
          this.chatService.get_searching_propositions_group(this.fd.value.fdSearchbar,this.compteur_research).subscribe(r=>{
            console.log(r);
            console.log(this.list_of_propositions_groups_names)
            if(r[1]==this.compteur_research){
              if(r[0][0].length>0){
                let compt=0;
                for(let i=0;i<r[0][0].length;i++){
                  this.list_of_propositions_groups_names[i]=r[0][0][i].name;
                  this.list_of_propositions_groups_ids[i]=r[0][0][i].id;
                  this.chatService.get_group_chat_as_friend(r[0][0][i].id).subscribe(l=>{
                    console.log(l[0])
                    this.chatService.retrieve_chat_profile_picture(  l[0].chat_profile_pic_name, l[0].profile_pic_origin).subscribe(t=> {
                      let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                      if(r[1]==this.compteur_research){
                        this.list_of_propositions_groups_pictures[i] = SafeURL;
                       
                      }
                      
                    })
                    compt ++;
                    if(compt==r[0][0].length){
                      console.log(this.list_of_propositions_groups_names)
                      this.display_propositions_groups=true;
                    }
                  })
                  
                }
              }
              else{
                this.display_propositions_groups=true;
              }
              this.cd.detectChanges();
            }
          })
        }
        
      }
      else{
        this.number_of_new_friends_to_show=5;
        this.display_all_searching_proppositions=false;
        this.limit_for_all_research=4;
        this.offset_for_all_research=0;
        this.list_of_all_contacts_ids=[];
        this.list_of_all_contacts_names=[];
        this.list_of_all_contacts_pseudos=[];
        this.list_of_all_contacts_pictures=[];
        this.display_all_searching_proppositions_button=false;
        console.log("research_friends");
        console.log(this.fd.value.fdSearchbar);
        if(this.fd.value.fdSearchbar==''){
          this.loading_other_propositions=false;
        }
        else if(this.fd.value.fdSearchbar.replace(/\s/g, '').length>0){
          this.loading_other_propositions=true;
          this.list_of_related_contacts_ids=[];
          this.list_of_related_contacts_names=[];
          this.list_of_related_contacts_pseudos=[];
          this.list_of_related_contacts_pictures=[];
          this.list_of_other_contacts_ids=[];
          this.list_of_other_contacts_names=[];
          this.list_of_other_contacts_pseudos=[];
          this.list_of_other_contacts_pictures=[];
    
          this.display_history=false;
          this.display_related=false;
          this.display_others=false;
          this.display_other_contacts=false;
          console.log(this.select_group_chat_contacts)
          this.chatService.get_searching_propositions(this.fd.value.fdSearchbar,this.compteur_research,this.select_group_chat_contacts).subscribe(r=>{
            console.log(r[0])
            if(r[1]==this.compteur_research){
              
              if(r[0][0].related_users.length>0){
                let compt1=0;
                for(let i=0;i<r[0][0].related_users.length;i++){
                  this.list_of_related_contacts_names[i]=r[0][0].related_users[i].firstname + ' ' + r[0][0].related_users[i].lastname;
                  this.list_of_related_contacts_pseudos[i]=r[0][0].related_users[i].nickname;
                  this.list_of_related_contacts_ids[i]=r[0][0].related_users[i].id;
                  this.list_of_related_contacts_pictures[i] = null;
                  this.Profile_Edition_Service.retrieve_profile_picture(  r[0][0].related_users[i].id ).subscribe(t=> {
                    let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                    const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                    if(r[1]==this.compteur_research){
                      this.list_of_related_contacts_pictures[i] = SafeURL;
                    }
                    
                   
      
                  })
                  compt1++;
                  if(compt1==r[0][0].related_users.length){
                    this.display_related=true;
                    console.log('display_related');
                    if(this.display_others && this.display_related){
                      this.display_other_contacts=true;
                      //this.display_all_searching_proppositions_button=true;
                    }
                  }
                }
              }
              else{
                this.display_related=true;
                console.log('display_related');
                if(this.display_others && this.display_related){
                  this.display_other_contacts=true;
                }
              }
      
              if(r[0][0].other_users.length>0){
                let compt2=0;
                for(let i=0;i<r[0][0].other_users.length;i++){
                  this.list_of_other_contacts_names[i]=r[0][0].other_users[i].firstname + ' ' + r[0][0].other_users[i].lastname;
                  this.list_of_other_contacts_pseudos[i]=r[0][0].other_users[i].nickname;
                  this.list_of_other_contacts_ids[i]=r[0][0].other_users[i].id;
                  this.list_of_other_contacts_pictures[i] = null;
                  this.Profile_Edition_Service.retrieve_profile_picture(  r[0][0].other_users[i].id ).subscribe(t=> {
                    let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                    const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                  
                    if(r[1]==this.compteur_research){
                      this.list_of_other_contacts_pictures[i] = SafeURL;
                    }
                    
                  })
                  compt2++;
                  if(compt2==r[0][0].other_users.length){
                    this.display_others=true;
                    
                    console.log('display_others');
                    if(this.display_others && this.display_related){
                      this.display_other_contacts=true;
                      //this.display_all_searching_proppositions_button=true;
                    }
                  }
            
                }
              }
              else{
                this.display_others=true;
                console.log('display_others');
                if(this.display_others && this.display_related){
                  this.display_other_contacts=true;
                }
              }
            }
            
            this.cd.detectChanges();
          })
        }
      }
   
   
  }

  
  display_all_searching_proppositions=false;
  display_all_searching_proppositions_button=false;
  search_more_propositions=false;
  list_of_all_contacts_ids=[];
  list_of_all_contacts_names=[];
  list_of_all_contacts_pseudos=[];
  list_of_all_contacts_pictures=[];
  limit_for_all_research=4;
  offset_for_all_research=0;
  get_all_searching_propositions(){
    //this.display_all_searching_proppositions=true;
    this.display_all_searching_proppositions_button=false;
   
    this.display_other_contacts=false;
    
    if(this.fd.value.fdSearchbar==''){
      this.display_all_searching_proppositions=false;
    }
    else{
      this.compteur_research++;
      this.loading_other_propositions=true;
      let len =this.list_of_all_contacts_ids.length;
      console.log(len);
      console.log(this.list_of_all_contacts_ids);
      console.log("offset_for_all_research")
      console.log(this.select_group_chat_contacts);
      console.log(this.offset_for_all_research)
      this.chatService.get_all_searching_propositions(this.fd.value.fdSearchbar,this.compteur_research,this.select_group_chat_contacts,this.limit_for_all_research,this.offset_for_all_research).subscribe(r=>{
        console.log(r[0][0]);
        if(r[1]==this.compteur_research){
          if(r[0][0].list.length>0){
            console.log('found result');
            let compt2=0;
            for(let i=0;i<r[0][0].list.length;i++){
              this.list_of_all_contacts_names[len+i]=r[0][0].list[i].firstname + ' ' + r[0][0].list[i].lastname;
              this.list_of_all_contacts_pseudos[len+i]=r[0][0].list[i].nickname;
              this.list_of_all_contacts_ids[len+i]=r[0][0].list[i].id;
              this.list_of_all_contacts_pictures[len+i]=null;
              this.Profile_Edition_Service.retrieve_profile_picture(  r[0][0].list[i].id ).subscribe(t=> {
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                if(r[1]==this.compteur_research){
                  this.list_of_all_contacts_pictures[len+i] = SafeURL;
                }
              
        
              })
              compt2++;
              if(compt2==r[0][0].list.length){
                console.log("compt2 done")
                this.display_all_searching_proppositions=true;
                this.offset_for_all_research+=4;
                if(!r[0][0].search_more){
                  this.search_more_propositions=false;
                  console.log(" display_all_searching_proppositions_button false")
                  //this.display_all_searching_proppositions_button=false;
                }
                else{
                  this.search_more_propositions=true;
                  //this.display_all_searching_proppositions_button=true;
                }
              }
            }
            
          }
          else{
            console.log("aucun résultat supplémentaire")
            this.search_more_propositions=false;
          }
  
        }
        
        
      })
    }
  }

  open_chat(i){
    this.delete_placeholder();
    this.spam='false';
    if(this.list_of_friends_last_message[i]){
      this.list_of_friends_last_message[i].status='seen';
    }
    this.id_chat_section=(this.list_of_friends_last_message[i])?this.list_of_friends_last_message[i].id_chat_section:1;
    this.friend_type=this.list_of_friends_types[i];
    console.log(this.friend_type)
    this.friend_id=this.list_of_friends_ids[i];
    this.friend_pseudo=this.list_of_friends_pseudos[i];
    this.chat_friend_id=this.list_of_chat_friends_ids[i];
    this.friend_name=this.list_of_friends_names[i];
    this.friend_picture=this.list_of_friends_profile_pictures[i];
    console.log(this.chat_friend_id);
    if(this.friend_type=='group'){
      this.location.go(`/chat/group/${this.friend_pseudo}/${this.friend_id}`);
    }
    else{
      this.location.go(`/chat/${this.friend_pseudo}/${this.friend_id}`);
    }
    this.cd.detectChanges();

    
    this.chat_right_container_is_opened = true;
  }

  open_chat_spam(i){
    this.delete_placeholder();

    /*this.waiting_friend_id=this.friend_id;
    this.waiting_chat_friend_id=this.chat_friend_id;
    this.waiting_friend_name=this.friend_name;
    this.waiting_friend_picture=this.friend_picture;
    this.waiting_friend_pseudo=this.friend_pseudo;
    this.waiting_id_chat_section=this.id_chat_section;*/
    console.log("we open chat spam")
    this.spam='true';
    console.log(this.list_of_friends_last_message[i]);
    if(this.list_of_friends_last_message[i]){
      this.list_of_friends_last_message[i].status='seen';
    }
    this.friend_type='user';
    this.friend_id=this.list_of_spams_ids[i];
    this.friend_pseudo=this.list_of_spams_pseudos[i];
    this.friend_name=this.list_of_spams_names[i];
    this.friend_picture=this.list_of_spams_profile_pictures[i];
    this.location.go(`/chat/${this.friend_pseudo}/${this.friend_id}`);
    this.cd.detectChanges();

    
    this.chat_right_container_is_opened = true;
  }

  display_opened=true;
  open_new_contact_chat(indice,i){
    if(this.select_group_chat_contacts){
      return;
    }
    console.log(i);
    console.log(indice); // 1 first propositions, 2 historic researches, 3 related, 4 others
    this.waiting_friend_type=this.friend_type
    this.waiting_friend_id=this.friend_id;
    this.waiting_friend_name=this.friend_name;
    this.waiting_friend_picture=this.friend_picture;
    this.waiting_friend_pseudo=this.friend_pseudo;
    this.waiting_id_chat_section=this.id_chat_section;
    this.waiting_chat_friend_id=this.chat_friend_id;
    this.id_chat_section=1;

    
    if(indice==1){
      this.chatService.check_if_is_related(this.list_of_contacts_ids[i]).subscribe(r=>{
        if(r[0].value){
          if(this.spam=='true'){
            this.spam='false';
            this.set_category(0);
            this.createFormAd();
            this.get_friends=true;
            this.get_spams=false;
          }
          
        }
        else if( this.spam=='false'){
          this.spam='true';
          this.set_category(1);
          this.createFormAd();
          this.get_friends=false;
          this.get_spams=true;
        }
        console.log("adding to search bar");
        console.log(this.list_of_contacts_ids[i])
       
        this.friend_type='user';
        console.log(this.friend_type)
        this.chatService.add_to_chat_searchbar_history(this.list_of_contacts_ids[i],this.friend_type).subscribe(r=>{
          console.log(r)
        })
        this.chat_friend_id=0;
        this.friend_id=this.list_of_contacts_ids[i];
        this.friend_pseudo=this.list_of_contacts_pseudos[i];
        this.friend_name=this.list_of_contacts_names[i];
        this.friend_picture=this.list_of_contacts_pictures[i];
      })
      
    }
    
    if(indice==3){
      this.chatService.check_if_is_related(this.list_of_related_contacts_ids[i]).subscribe(r=>{
        if(r[0].value){
          if(this.spam=='true'){
            this.spam='false';
            this.set_category(0);
            this.createFormAd();
            this.get_friends=true;
            this.get_spams=false;
          }
        }
        else{
          this.spam='true';
          this.set_category(1);
          this.createFormAd();
          this.get_friends=false;
          this.get_spams=true;
        }
        console.log("adding to search bar");
        console.log(this.list_of_related_contacts_ids[i])
        
        this.friend_type='user';
        console.log(this.friend_type)
        this.chatService.add_to_chat_searchbar_history(this.list_of_related_contacts_ids[i],this.friend_type).subscribe(r=>{
          console.log(r)
        })
        this.chat_friend_id=0;
        this.friend_id=this.list_of_related_contacts_ids[i];
        this.friend_pseudo=this.list_of_related_contacts_pseudos[i];
        this.friend_name=this.list_of_related_contacts_names[i];
        this.friend_picture=this.list_of_related_contacts_pictures[i];
      })
     
    }
    //other contacts propositions
    if(indice==4){
      this.chatService.check_if_is_related(this.list_of_other_contacts_ids[i]).subscribe(r=>{
        if(r[0].value){
          console.log("is related");
          if(this.spam=='true'){
            this.spam='false';
            this.set_category(0);
            this.createFormAd();
            this.get_friends=true;
            this.get_spams=false;
          }
        }
        else{
          this.spam='true';
          this.set_category(1);
          this.createFormAd();
          this.get_friends=false;
          this.get_spams=true;
        }
        console.log("adding to search bar");
        console.log(this.list_of_related_contacts_ids[i])
        
        this.friend_type='user';
        console.log(this.friend_type)
        this.chatService.add_to_chat_searchbar_history(this.list_of_other_contacts_ids[i],this.friend_type).subscribe(r=>{
          console.log(r)
        })
        this.chat_friend_id=0;
        this.friend_id=this.list_of_other_contacts_ids[i];
        this.friend_pseudo=this.list_of_other_contacts_pseudos[i];
        this.friend_name=this.list_of_other_contacts_names[i];
        this.friend_picture=this.list_of_other_contacts_pictures[i];
      })
      
    }
    // all users propositions
    if(indice==5){
      this.chatService.check_if_is_related(this.list_of_all_contacts_ids[i]).subscribe(r=>{
        if(r[0].value){
          console.log("is related");
          if(this.spam=='true'){
            this.spam='false';
            this.set_category(0);
            this.createFormAd();
            this.get_friends=true;
            this.get_spams=false;
          }
        }
        else{
          this.spam='true';
          this.set_category(1);
          this.createFormAd();
          this.get_friends=false;
          this.get_spams=true;
        }
        console.log("adding to search bar");
        console.log(this.list_of_all_contacts_ids[i])
        
        this.friend_type='user';
        console.log(this.friend_type)
        this.chatService.add_to_chat_searchbar_history(this.list_of_all_contacts_ids[i],this.friend_type).subscribe(r=>{
          console.log(r)
        })
        this.chat_friend_id=0;
        this.friend_id=this.list_of_all_contacts_ids[i];
        this.friend_pseudo=this.list_of_all_contacts_pseudos[i];
        this.friend_name=this.list_of_all_contacts_names[i];
        this.friend_picture=this.list_of_all_contacts_pictures[i];
      })
      
    }
    // first groups propositions
    if(indice==6){
      if(this.spam=='true'){
        this.spam='false';
        this.set_category(0);
        this.createFormAd();
        this.get_friends=true;
        this.get_spams=false;
      }
      console.log("adding to search bar");
      console.log(this.list_of_contacts_groups_ids[i])
      
      this.friend_type='group';
      console.log(this.friend_type)
      this.chatService.add_to_chat_searchbar_history(this.list_of_contacts_groups_ids[i],this.friend_type).subscribe(r=>{
        console.log(r)
      })
      this.chat_friend_id=0;
      this.friend_id=this.list_of_contacts_groups_ids[i];
      this.friend_pseudo=this.list_of_contacts_groups_names[i];
      this.friend_name=this.list_of_contacts_groups_names[i];
      this.friend_picture=this.list_of_contacts_groups_pictures[i];
      console.log(this.friend_name)
      
    }
    // other groups propositions
    if(indice==7){
      console.log(this.spam)
      if(this.spam=='true'){
        this.spam='false';
        this.set_category(0);
        this.createFormAd();
        this.get_friends=true;
        this.get_spams=false;
      }
      console.log("adding to search bar");
      console.log(this.list_of_propositions_groups_ids[i])
      
      this.friend_type='group';
      console.log(this.friend_type)
      this.chatService.add_to_chat_searchbar_history(this.list_of_propositions_groups_ids[i],this.friend_type).subscribe(r=>{
        console.log(r)
      })
      this.chat_friend_id=0;
      this.friend_id=this.list_of_propositions_groups_ids[i];
      this.friend_pseudo=this.list_of_propositions_groups_names[i];
      this.friend_name=this.list_of_propositions_groups_names[i];
      this.friend_picture=this.list_of_propositions_groups_pictures[i];
      console.log(this.friend_name)
      
    }
    console.log(this.friend_id)
    this.delete_placeholder();
    if(this.friend_type=='group'){
      this.location.go(`/chat/group/${this.friend_pseudo}/${this.friend_id}`);
    }
    else{
      this.location.go(`/chat/${this.friend_pseudo}/${this.friend_id}`);
    }
    this.cd.detectChanges();
    
  }


 
  radioChange(i){
    
    if(this.opened_category != i){
      this.delete_placeholder();
      if( i == 1){
        if(this.list_of_spams_ids.length>0){
          console.log("ya un spam");
          console.log(this.list_of_spams_ids);
          console.log(this.list_of_spams_names);
          
          this.waiting_friend_type=this.friend_type;
          this.waiting_friend_id=this.friend_id;
          this.waiting_friend_name=this.friend_name;
          this.waiting_friend_picture=this.friend_picture;
          this.waiting_friend_pseudo=this.friend_pseudo;
          this.waiting_id_chat_section=this.id_chat_section;
          this.waiting_chat_friend_id=this.chat_friend_id;

          this.friend_type='user';
          this.friend_id=this.spam_id;
          this.friend_name=this.spam_name;
          this.friend_picture=this.spam_picture;
          this.friend_pseudo=this.spam_pseudo;
          this.id_chat_section=1;
          this.chat_friend_id=0;
          
          this.get_friends=false;
          this.get_spams=true;
          this.spam='true';

          console.log(this.friend_type)
          console.log(this.friend_id)
        }
        else{
          this.set_category(0);
          this.createFormAd();
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:"Vous n'avez aucun autre message"},
          });
          return false;
        }
        
      }
      else {
          this.id_chat_section =this.waiting_id_chat_section;
          console.log(this.id_chat_section);
          this.friend_type=this.waiting_friend_type;
          this.friend_id=this.waiting_friend_id;
          this.chat_friend_id=this.waiting_chat_friend_id;
          this.waiting_chat_friend_id=this.chat_friend_id;
          this.friend_name=this.waiting_friend_name;
          this.friend_picture=this.waiting_friend_picture;
          this.friend_pseudo=this.waiting_friend_pseudo;
          this.get_friends=true;
          this.get_spams=false;
          this.spam='false';
      }
      this.delete_placeholder();
      this.cd.detectChanges();
      return true;
    }
  }

  imagesource:SafeUrl;
  display=false;


  onPaste(event: ClipboardEvent) {
    var re = /(?:\.([^.]+))?$/;
    let size = event.clipboardData.files[0].size/1024/1024;
    let blob = event.clipboardData.files[0];
    console.log(blob);

    if( (re.exec(blob.name)[1]=="jpeg" || re.exec(blob.name)[1]=="png" || re.exec(blob.name)[1]=="jpg") && Math.trunc(size)<5){
      console.log("c bon");
      let url = (window.URL) ? window.URL.createObjectURL(blob) : (window as any).webkitURL.createObjectURL(blob);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.imagesource= SafeURL;
      this.display=true;
      };
    
  }

  show_date_of_timestamp(item,i){
    let timestamp=item.createdAt;
    
    let date=new Date(timestamp)
    let day=String(date.getDate()).padStart(2, '0')
    let dat_today=new Date();
    let today=String(dat_today.getDate()).padStart(2, '0')
    let time=new Date(timestamp).getTime()/1000;
    let time_now= new Date().getTime()/1000;
    if(!item.createdAt ){
        let hour =String(dat_today.getHours()).padStart(2, '0');
        let min =String(dat_today.getMinutes()).padStart(2, '0');
        this.list_of_friends_last_message[i].date=hour+':'+min;
        return (hour+':'+min)
    }

    if(time_now-time>604800){
      let month=String(date.getMonth() + 1).padStart(2, '0');
      let year = date.getFullYear();
      return day+'/'+month+'/'+year;
    }
    else if(time_now-time>86400){
      let date=new Date(timestamp);
      let day=String(date).substring(0,3);
      if(day=="Mon"){
        return("Lun");
      }
      if(day=='Tue'){
        return"Mar";
      }
      if(day=='Wed'){
        return"Mer";
      }
      if(day=='Thu'){
        return"Jeu";
      }
      if(day=="Fri"){
        return"Ven";
      }
      if(day=='Sat'){
        return"Sam";
      }
      if(day=='Thu'){
        return"Dim";
      }
      else{
        return day
      } 
    }
    else if(day!=today){
      return ("Hier")
    }
    else if(day==today){
      let hour =String(date.getHours()).padStart(2, '0');
      let min =String(date.getMinutes()).padStart(2, '0');
      return (hour+':'+min)
    }
   
  }

/*************************************Partie création de group_chat***********************************/
/*************************************Partie création de group_chat***********************************/
/*************************************Partie création de group_chat***********************************/
/*************************************Partie création de group_chat***********************************/
/*************************************Partie création de group_chat***********************************/
/*************************************Partie création de group_chat***********************************/
/*************************************Partie création de group_chat***********************************/
/*************************************Partie création de group_chat***********************************/

select_group_chat_contacts=false;
create_group_chat(){
  this.Groupchat.reset();
  this.cancel_add_friend_group();
  this.list_of_selected_names=[];
  this.list_of_selected_ids=[];
  this.limit_for_all_research=4;
  this.offset_for_all_research=0;
  this.list_of_all_contacts_ids=[];
  this.list_of_all_contacts_names=[];
  this.list_of_all_contacts_pseudos=[];
  this.list_of_all_contacts_pictures=[];
  this.display_all_searching_proppositions=false;
  this.display_all_searching_proppositions_button=false;
  this.select_group_chat_contacts=true;
  this.get_propositions=true;
  this.get_first_propositions(1,0);
  
  this.opened_category = 2;
}

list_of_selected_names=[];
list_of_selected_ids=[];
add_contact_to_group(i,j){
  if(j==0){
    this.list_of_selected_names.push(this.list_of_contacts_names[i]);
    this.list_of_selected_ids.push(this.list_of_contacts_ids[i]);
  }
  if(j==2){
    this.list_of_selected_names.push(this.list_of_related_contacts_names[i]);
    this.list_of_selected_ids.push(this.list_of_related_contacts_ids[i]);
  }
  if(j==3){
    this.list_of_selected_names.push(this.list_of_other_contacts_names[i]);
    this.list_of_selected_ids.push(this.list_of_other_contacts_ids[i]);
  }
  if(j==4){
    this.list_of_selected_names.push(this.list_of_all_contacts_names[i]);
    this.list_of_selected_ids.push(this.list_of_all_contacts_ids[i]);
  }
  console.log(this.list_of_selected_names)
  console.log(this.list_of_selected_ids)
}

remove_contact_from_group(i,j){
  if(j==0){
    let ind=this.list_of_selected_names.indexOf(this.list_of_contacts_names[i]);
    this.list_of_selected_names.splice(ind,1);
    this.list_of_selected_ids.splice(ind,1);
  }
  if(j==2){
    let ind=this.list_of_selected_names.indexOf(this.list_of_related_contacts_names[i]);
    this.list_of_selected_names.splice(ind,1);
    this.list_of_selected_ids.splice(ind,1);
  }
  if(j==3){
    let ind=this.list_of_selected_names.indexOf(this.list_of_other_contacts_names[i]);
    this.list_of_selected_names.splice(ind,1);
    this.list_of_selected_ids.splice(ind,1);
  }
  if(j==4){
    let ind=this.list_of_selected_names.indexOf(this.list_of_all_contacts_names[i]);
    this.list_of_selected_names.splice(ind,1);
    this.list_of_selected_ids.splice(ind,1);
  }
  console.log(this.list_of_selected_names)
  console.log(this.list_of_selected_ids)
}

check_if_is_in_selected_ids(id){
  let response=false;
  if(!this.select_group_chat_contacts){
    return false;
  }
  for(let i=0;i<this.list_of_selected_ids.length;i++){
    if(this.list_of_selected_ids[i]==id){
      response=true;
    }
  }
  return(response)
}

cancel_create_group_chat(){
  this.list_of_selected_names=[];
  this.list_of_selected_ids=[];
  this.select_group_chat_contacts=false;
  this.get_propositions=false;
  this.Groupchat.reset();
  this.cd.detectChanges();
  this.delete_placeholder();
}

group_chat_creation_done(){
 console.log(this.list_of_selected_names)
 console.log(this.list_of_selected_ids)
 if(this.Groupchat.valid && this.list_of_selected_ids.length>0){
  console.log("valide")
  this.list_of_selected_ids.push(this.current_user)
  this.chatService.create_group_chat(this.list_of_selected_ids,this.Groupchat.value.Groupchatname).subscribe(r=>{
    this.select_group_chat_contacts=false;
    this.get_propositions=false;
    console.log(r[0]);
    let message_one ={
      id_user_name:this.current_user_pseudo,
      id_user:this.current_user,   
      id_receiver:r[0].id,  
      message:"New",
      list_of_users_who_saw:[this.current_user],
      is_from_server:true,
      status:"sent",
      is_a_response:false,
      id_chat_section:1,
      attachment_name:"none",
      attachment_type:"none",
      is_an_attachment:false,
      is_a_group_chat:true,
      group_name:r[0].name,
    };
    this.chatService.messages.next(message_one);
    this.Groupchat.reset();
    this.get_group_chat_name(r[0].id,message_one,true);
    this.cd.detectChanges();
  })
 }
 else{
  const dialogRef = this.dialog.open(PopupConfirmationComponent, {
    data: {showChoice:false, text:"Veuillez inclure au moins un membre"},
  });
 }
}

add_group_to_contacts(event){
  console.log("adding group to contacts")
  console.log(event);
  this.get_group_chat_name(event.friend_id,event.message,event.value)
}



get_group_chat_name(id,message,value){
  console.log("get_group_chat_name")
  console.log(id);
  console.log(message)
  let pseudo = message.group_name;
  let name =message.group_name;
  this.chatService.get_group_chat_as_friend(id).subscribe(s=>{
    console.log(s[0])
    
    this.chatService.retrieve_chat_profile_picture(s[0].chat_profile_pic_name,s[0].profile_pic_origin).subscribe(t=> {
      let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      let picture = SafeURL;
      this.list_of_chat_friends_ids.splice(0,0,s[0].id)
      this.list_of_friends_types.splice(0,0,'group');
      this.list_of_friends_ids.splice(0,0,id);
      this.list_of_friends_last_message.splice(0,0,message);
      this.list_of_friends_last_message[0].status="received";
      this.list_of_friends_names.splice(0,0,name);
      this.list_of_friends_profile_pictures.splice(0,0,picture);
      this.friend_pp_loaded.splice(0,0,false);
      this.list_of_friends_pseudos.splice(0,0,pseudo);
      if(value){
        this.chat_friend_id=s[0].id;
        this.friend_type='group';
        this.friend_id=id;
        this.friend_name=name;
        this.friend_pseudo=pseudo;
        this.friend_picture=picture;
      }
     
      console.log(this.list_of_friends_last_message);
      console.log(this.list_of_friends_types)
      console.log(this.list_of_friends_names)
      this.cd.detectChanges();
    })
    
  })
}




/************************************************************************************************** */
/************************************************************************************************** */
/**CONNECTION STATUS FUNCTIONS*/
/************************************************************************************************** */
/************************************************************************************************** */



get_connections_status(){
  //console.log("gtting connexion stats")
  this.chatService.get_users_connected_in_the_chat(this.list_of_friends_users_only).subscribe(r=>{
    let compt=0;
    if(this.list_of_groups_ids.length>0){
      for(let i=0;i<this.list_of_friends_types.length;i++){
      
        if(this.list_of_friends_types[i]=='user'){
          let id=this.list_of_friends_ids[i]
          let index=this.list_of_friends_users_only.indexOf(id);
          this.list_of_friends_connected[i]=r[0].list_of_users_connected[index];
          if(r[0].date_of_webSockets_last_connection[id]){
            let now=Math.trunc( new Date().getTime()/1000);
            let date=r[0].date_of_webSockets_last_connection[id];
            date = date.replace("T",' ');
            date = date.replace("-",'/').replace("-",'/');
            let deco_date=Math.trunc( new Date(date + ' GMT').getTime()/1000)
            this.list_of_last_connection_dates[i]=get_date_to_show_chat(now-deco_date);
          }
          compt++;
          if(compt==this.list_of_friends_types.length){
            this.connections_status_retrieved=true;
            this.cd.detectChanges()
          }
        }
        else{
          this.chatService.get_group_chat_information(this.list_of_friends_ids[i]).subscribe(l=>{
            let list=l[0].list_of_receivers_ids;
            let value=false;
            for(let j=0;j<list.length;j++){
              if(list[j]!=this.current_user){
                let index=this.list_of_friends_users_only.indexOf(list[j])
                if(r[0].list_of_users_connected[index]){
                  value=true;
                }
              }
            }
            this.list_of_friends_connected[i]=value;
            compt++;
            if(compt==this.list_of_friends_types.length){
              this.connections_status_retrieved=true;
              this.cd.detectChanges()
            }
          })
        }
      }
    }
    else{
      for(let i=0;i<this.list_of_friends_ids.length;i++){
          let id=this.list_of_friends_ids[i]
          let index=this.list_of_friends_users_only.indexOf(id);
          this.list_of_friends_connected[i]=r[0].list_of_users_connected[index];
          if(r[0].date_of_webSockets_last_connection[id]){
            let now=Math.trunc( new Date().getTime()/1000);
            let date=r[0].date_of_webSockets_last_connection[id];
            date = date.replace("T",' ');
            date = date.replace("-",'/').replace("-",'/');
            let deco_date=Math.trunc( new Date(date + ' GMT').getTime()/1000)
            this.list_of_last_connection_dates[i]=get_date_to_show_chat(now-deco_date);
          }
          compt++;
          if(compt==this.list_of_friends_ids.length){
            this.connections_status_retrieved=true;
            this.cd.detectChanges()
          }
        }
    }
  })
}


  
  /*************************************** LODING PP FUNCTIONS *******************************/
  /*************************************** LODING PP FUNCTIONS *******************************/
  /*************************************** LODING PP FUNCTIONS *******************************/
  my_pp_loaded=false;
  load_my_pp(){
    this.my_pp_loaded=true;
  }
      
  spam_pp_loaded=[]
  load_spam_pp(i){
    this.spam_pp_loaded[i]=true
  }

  friend_pp_loaded=[]
  load_friend_pp(i){
    this.friend_pp_loaded[i]=true
  }

  contact_pp_loaded=[]
  load_contact_pp(i){
    this.contact_pp_loaded[i]=true
  }

  contact_group_pp_loaded=[]
  load_contact_group_pp(i){
    this.contact_group_pp_loaded[i]=true
  }

  related_contact_pp_loaded=[]
  load_related_contact_pp(i){
    this.related_contact_pp_loaded[i]=true
  }

  related_other_pp_loaded=[]
  load_other_contact_pp(i){
    this.related_other_pp_loaded[i]=true
  }

  all_contacts_loaded=[]
  load_all_contacts_pp(i){
    this.all_contacts_loaded[i]=true
  }

  propositions_groups_loaded=[]
  load_propositions_groups_pp(i){
    this.propositions_groups_loaded[i]=true
  }

  new_friends_loaded=[]
  load_new_friends_pp(i){
    this.new_friends_loaded[i]=true
  }

  
  opened_category:number = 0;
  set_category(i: number) {
    if( this.opened_category == i ) {
      return;
    }
    else {
      let bool = this.radioChange(i);
      if(bool) {
        this.opened_category = i;
      }
    }
  }

  list_scrolled:boolean = false;
  scroll_on_list(e:any) {
    if (e.target.scrollTop == 0) {
      this.list_scrolled = false;
    }
    else {
      this.list_scrolled = true;
    }
    this.cd.detectChanges();
    return;
  }
 
  
  chat_right_container_is_opened:boolean;
  change_chat_right_container() {
    this.chat_right_container_is_opened = false;
    //this.chat_right_container_is_opened = !this.chat_right_container_is_opened;
  }

  

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if( window.innerWidth>850 ) {
      this.chat_right_container_is_opened = true;
    }
    /*else {
      this.chat_right_container_is_opened = false;
    }*/
  }

}