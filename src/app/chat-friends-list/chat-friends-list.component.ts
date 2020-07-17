
import { Component, OnInit, Input, Renderer2, ElementRef, ComponentFactoryResolver, ChangeDetectorRef, ViewContainerRef, ViewChild, HostListener, SimpleChanges, ViewChildren, QueryList, Query } from '@angular/core';
import { FormControl, Validators, FormGroup, FormsModule,ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { NavbarService } from '../services/navbar.service';
import { ChatService} from '../services/chat.service';
import { Profile_Edition_Service} from '../services/profile_edition.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscribing_service } from '../services/subscribing.service';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { MatDialog } from '@angular/material/dialog';

declare var $: any;


@Component({
  selector: 'app-chat-friends-list',
  templateUrl: './chat-friends-list.component.html',
  styleUrls: ['./chat-friends-list.component.scss']
})
export class ChatFriendsListComponent implements OnInit {

  constructor (
    private chatService:ChatService,
    private FormBuilder:FormBuilder,
    private sanitizer:DomSanitizer,
    public dialog: MatDialog,
    public navbar: NavbarService, 
    private Profile_Edition_Service:Profile_Edition_Service,
    private cd: ChangeDetectorRef,
    ){
      this.navbar.show();
  }

  @ViewChild('input') input:ElementRef;
  @ViewChild('fdselector') fdselector:ElementRef;

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload($event) { 
    this.chatService.close();
  }
  

  selectedRadio = 'Mes contacts';
  //current_user
  current_user:number=0;
  current_user_name:string;
  current_user_pseudo:string;
  profile_picture:SafeUrl;
  profile_picture_retrieved=false;

  //get friend or others
  get_friends=true;
  spam='false';
  section="Mes contacts";

  //chat_friends
  list_of_friends_profile_pictures:any[]=[];
  list_of_friends_pseudos:any[]=[];
  list_of_friends_names:any[]=[];
  list_of_friends_ids:any[]=[];
  list_of_friends_last_message:any[]=[];
  list_of_friends_retrieved=false;

  // for chat component
  friend_id: number;
  friend_pseudo: number;
  friend_name: string;
  friend_picture: SafeUrl;

  // for chat component when clicking "others"
  waiting_friend_id: number;
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

  // for chat component spam
  spam_id: number;
  spam_pseudo: number;
  spam_name: string;
  spam_picture: SafeUrl;

  //check presence
  user_present=true;

  //chat_section
  id_chat_section=1;
  
  ngOnInit() {

    this.createFormControlsAds();
    this.createFormAd();
    let THIS=this;
    $(window).on('blur', function(){
      THIS.user_present=false;
    });

    $(window).on('focus', function(){
      THIS.user_present=true;
      let index=THIS.list_of_friends_ids.indexOf(THIS.friend_id);
      if(THIS.list_of_friends_ids[index]){
        if(THIS.list_of_friends_last_message[index].id_chat_section==this.id_chat_section){
          THIS.list_of_friends_last_message[index].status="seen";
        }
      }
      
      
    });
   // this.initialize_selectors();

    this.Profile_Edition_Service.get_current_user().subscribe(l=>{
      this.current_user=l[0].id;
      this.current_user_pseudo=l[0].nickname;
      this.current_user_name=l[0].firstname + ' ' + l[0].lastname;
      this.Profile_Edition_Service.retrieve_profile_picture(  this.current_user ).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.profile_picture = SafeURL;
        this.profile_picture_retrieved=true;
        this.sort_friends_list();
        this.sort_spams_list();
      });
    })

    
 
    

    
  };

 
  
  sort_friends_list() {
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
                    console.log(this.list_of_friends_ids)
                    this.chatService.get_last_friends_message(this.list_of_friends_ids).subscribe(u=>{
                      this.list_of_friends_last_message=u[0].list_of_friends_messages;
                      console.log(this.list_of_friends_last_message);
                      this.chatService.get_my_real_friend(this.list_of_friends_ids).subscribe(v=>{
                        this.friend_id=v[0][0].id_receiver;
                        let ind = this.list_of_friends_ids.indexOf(this.friend_id);
                        this.id_chat_section=this.list_of_friends_last_message[ind].id_chat_section;
                        this.friend_name=this.list_of_friends_names[ind];
                        this.friend_pseudo=this.list_of_friends_pseudos[ind];
                        this.friend_picture=this.list_of_friends_profile_pictures[ind];
                        this.list_of_friends_last_message[ind].status="seen";
                        this.list_of_friends_retrieved=true;
                      });
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
                      this.chatService.get_my_real_friend(this.list_of_friends_ids).subscribe(v=>{
                        console.log(v);
                        this.friend_id=v[0][0].id_receiver;
                        let ind = this.list_of_friends_ids.indexOf(this.friend_id);
                        this.friend_name=this.list_of_friends_names[ind];
                        this.friend_pseudo=this.list_of_friends_pseudos[ind];
                        this.friend_picture=this.list_of_friends_profile_pictures[ind];
                        this.list_of_friends_last_message[ind].status="seen";
                        this.list_of_friends_retrieved=true;
                      })

                    });
                  }
                });
              });
          }
        }
      }
    })
  };


  sort_spams_list() {
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
                      this.list_of_spams_last_message=u[0].list_of_friends_messages;
                      this.spam_id= this.list_of_spams_ids[0];
                      this.spam_name=this.list_of_spams_names[0];
                      this.spam_pseudo=this.list_of_spams_pseudos[0];
                      this.spam_picture=this.list_of_spams_profile_pictures[0];
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
                      this.list_of_spams_last_message=u[0].list_of_friends_messages;
                      this.spam_id= this.list_of_spams_ids[0];
                      this.spam_name=this.list_of_spams_names[0];
                      this.spam_pseudo=this.list_of_spams_pseudos[0];
                      this.spam_picture=this.list_of_spams_profile_pictures[0];
                      this.list_of_spams_retrieved=true;
                    });
                  }
                });
              });
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
    let index=this.list_of_spams_ids.indexOf(event.spam_id);
    let name =  this.list_of_spams_names[index];
    let profile_picture =this.list_of_spams_profile_pictures[index]
    let pseudo = this.list_of_spams_pseudos[index];

    this.list_of_spams_ids.splice(index,1);
    this.list_of_spams_last_message.splice(index,1);
    this.list_of_spams_names.splice(index,1);
    this.list_of_spams_profile_pictures.splice(index,1);
    this.list_of_spams_pseudos.splice(index,1);
    
    this.list_of_friends_ids.splice(0,0,event.spam_id);
    this.list_of_friends_names.splice(0,0,name);
    this.list_of_friends_profile_pictures.splice(0,0,profile_picture);
    this.list_of_friends_pseudos.splice(0,0,pseudo);
    this.list_of_friends_last_message.splice(0,0,event.message);
    console.log(this.list_of_friends_last_message);

    this.friend_id=event.spam_id;
    this.friend_pseudo=pseudo;
    this.friend_name=name;
    this.friend_picture=profile_picture;

    this.waiting_friend_id=this.friend_id;
    this.waiting_friend_name=this.friend_name;
    this.waiting_friend_picture=this.friend_picture;
    this.waiting_friend_pseudo=this.friend_pseudo;
    

    this.get_friends=true;
    this.spam='false';

    this.selectedRadio="Mes contacts";
          this.formData.reset(
            this.createFormAd()
          ); // change radio
    console.log("radio changed")
    this.cd.detectChanges();
  }

  change_section(event){
    this.id_chat_section=event.id_chat_section;
  }

  new_sort_friends_list(event){
    console.log("getting message from chat")
    console.log(event);
    let index=this.list_of_friends_ids.indexOf(event.friend_id);
    console.log(index)
    if(index>=0){
      //fait partie de la liste des contacts
      console.log(event.message);
      this.list_of_friends_last_message[index]=event.message;
      this.cd.detectChanges();
      if(this.friend_id==event.friend_id && this.user_present && event.id_chat_section==event.message.id_chat_section){
        this.list_of_friends_last_message[index].status="seen";
        console.log("seen")
        this.cd.detectChanges();
      }
      else{
        this.list_of_friends_last_message[index].status="received";
        console.log("received");
        this.cd.detectChanges();
      }
      this.list_of_friends_ids.splice(0,0,this.list_of_friends_ids.splice(index,1)[0]);
      this.list_of_friends_last_message.splice(0,0,this.list_of_friends_last_message.splice(index,1)[0]);
      this.list_of_friends_names.splice(0,0,this.list_of_friends_names.splice(index,1)[0]);
      this.list_of_friends_profile_pictures.splice(0,0,this.list_of_friends_profile_pictures.splice(index,1)[0]);
      this.list_of_friends_pseudos.splice(0,0,this.list_of_friends_pseudos.splice(index,1)[0]);
      console.log(this.list_of_friends_last_message)
      this.cd.detectChanges();

    }
    else{
      console.log(event);
      let index2=this.list_of_spams_ids.indexOf(event.friend_id);
      this.chatService.check_if_is_related(event.friend_id).subscribe(r=>{
        if(r[0].value){
          if(event.friend_id==this.current_user){
            this.list_of_friends_ids.splice(0,0,event.friend_id);
              this.list_of_friends_last_message.splice(0,0,event.message);
              this.list_of_friends_last_message[0].status="received";
              this.list_of_friends_names.splice(0,0,this.current_user_name);
              this.list_of_friends_profile_pictures.splice(0,0,this.profile_picture);
              this.list_of_friends_pseudos.splice(0,0,this.current_user_pseudo);
              this.cd.detectChanges();
          }
          else{
            console.log("related but not firend")
            this.Profile_Edition_Service.retrieve_profile_data(event.friend_id).subscribe(s=>{
              console.log(s);
              let pseudo = s[0].nickname;
              let name =s[0].firstname + ' ' + s[0].lastname;
              this.Profile_Edition_Service.retrieve_profile_picture( event.friend_id).subscribe(t=> {
                console.log(t);
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                let picture = SafeURL;
                this.list_of_friends_ids.splice(0,0,event.friend_id);
                this.list_of_friends_last_message.splice(0,0,event.message);
                this.list_of_friends_last_message[0].status="received";
                this.list_of_friends_names.splice(0,0,name);
                this.list_of_friends_profile_pictures.splice(0,0,picture);
                this.list_of_friends_pseudos.splice(0,0,pseudo);
                this.cd.detectChanges();
              })
            });
          }
        }
        
        if(!r[0].value && index2>=0){
          console.log("spam but in list of spams");
          this.list_of_spams_last_message[index2]=event.message;
          this.list_of_spams_last_message[index2].status="received";
          this.list_of_spams_ids.splice(0,0,this.list_of_spams_ids.splice(index2,1)[0]);
          this.list_of_spams_last_message.splice(0,0,this.list_of_spams_last_message.splice(index2,1)[0]);
          this.list_of_spams_names.splice(0,0,this.list_of_spams_names.splice(index2,1)[0]);
          this.list_of_spams_profile_pictures.splice(0,0,this.list_of_spams_profile_pictures.splice(index2,1)[0]);
          this.list_of_spams_pseudos.splice(0,0,this.list_of_spams_pseudos.splice(index2,1)[0]);
          this.cd.detectChanges();
          //this.sort_spams_list();
        }
        if(!r[0].value && index2<0){
          if(this.get_friends){
            console.log("spam but not list of spams and in mes contacts");
            this.sort_spams_list();
          }
          else{
            console.log("spam but not list of spams and not in mes contacts");
            this.Profile_Edition_Service.retrieve_profile_data(event.friend_id).subscribe(s=>{
              let pseudo = s[0].nickname;
              let name =s[0].firstname + ' ' + s[0].lastname;
              this.Profile_Edition_Service.retrieve_profile_picture(  event.friend_id).subscribe(t=> {
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.list_of_spams_ids.splice(0,0,event.friend_id);
                this.list_of_spams_last_message.splice(0,0,event.message);
                this.list_of_spams_last_message[0].status="received";
                this.list_of_spams_names.splice(0,0,name);
                this.list_of_spams_profile_pictures.splice(0,0,SafeURL);
                this.list_of_spams_pseudos.splice(0,0,pseudo);
                console.log(this.list_of_spams_ids);
                this.cd.detectChanges();
              })
            });
          }
          
          
        }
      })
    }
  }




  


  //searchbar


  fd: FormGroup;
  formData: FormGroup;
  fdSearchbar: FormControl;
  active: boolean;
  
  createFormControlsAds() {
    this.fdSearchbar = new FormControl('');
   }

  createFormAd() {
    this.fd = new FormGroup({
      fdSearchbar: this.fdSearchbar,
    });
    this.formData = this.FormBuilder.group({
      IsActive: this.selectedRadio
    })
  }

  list_of_contacts_ids:any[]=[];
  list_of_contacts_names:any[]=[];
  list_of_contacts_pseudos:any[]=[];
  list_of_contacts_pictures:any[]=[];
  display_contacts:boolean=false;

  list_of_history_ids:any[]=[];
  list_of_history_names:any[]=[];
  list_of_history_pseudos:any[]=[];
  list_of_history_pictures:any[]=[];

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
  waiting_display_other_contacts:boolean=false;
  activateFocus() {
    console.log("active focus");
    this.input.nativeElement.focus();
    console.log(this.fd.value.fdSearchbar);
    if(this.fd.value.fdSearchbar==''){
      this.chatService.get_first_searching_propositions().subscribe(r=>{
        let compt=0;
        console.log("first propositions");
        console.log(r[0]);
        for(let i=0;i<r[0].list.length;i++){
          this.list_of_contacts_names[i]=r[0].list[i].firstname + ' ' + r[0].list[i].lastname;
          this.list_of_contacts_pseudos[i]=r[0].list[i].nickname;
          this.list_of_contacts_ids[i]=r[0].list[i].id;
          this.Profile_Edition_Service.retrieve_profile_picture(  r[0].list[i].id ).subscribe(t=> {
            let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_contacts_pictures[i] = SafeURL;
            compt ++;
            if(compt==r[0].list.length){
              this.display_contacts=true;
              console.log(this.list_of_contacts_names)
              console.log(this.list_of_contacts_pictures)
            }
  
          })
        }
      })
    }
   
  }
  delete_placeholder(){
    this.input.nativeElement.value='';
    this.fd.value.fdSearchbar='';
    this.waiting_display_other_contacts=false;
    this.display_contacts=false;
    
  }

  

  research_friends(event){
    console.log("research_friends");
    console.log(this.fd.value.fdSearchbar);
    if(this.fd.value.fdSearchbar==''){
      this.waiting_display_other_contacts=false;
      this.display_contacts=true;
    }
    else{
      this.waiting_display_other_contacts=true;
      this.list_of_history_names=[];
      this.list_of_history_pseudos=[];
      this.list_of_history_pictures=[];
      this.list_of_related_contacts_names=[];
      this.list_of_related_contacts_pseudos=[];
      this.list_of_related_contacts_pictures=[];
      this.list_of_other_contacts_names=[];
      this.list_of_other_contacts_pseudos=[];
      this.list_of_other_contacts_pictures=[];

      this.display_history=false;
      this.display_related=false;
      this.display_others=false;
      this.display_other_contacts=false;

      this.chatService.get_searching_propositions(this.fd.value.fdSearchbar).subscribe(r=>{
        if(r[0].history.length>0){
          let compt=0;
          for(let i=0;i<r[0].history.length;i++){
            this.list_of_history_names[i]=r[0].history[i].firstname + ' ' + r[0].history[i].lastname;
            this.list_of_history_pseudos[i]=r[0].history[i].nickname;
            this.list_of_history_ids[i]=r[0].history[i].id;
            this.Profile_Edition_Service.retrieve_profile_picture(  r[0].history[i].id ).subscribe(t=> {
              let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_history_pictures[i] = SafeURL;
              compt ++;
              if(compt==r[0].history.length){
                this.display_history=true;
                console.log('display_history');
                if(this.display_history && this.display_others && this.display_related){
                  this.display_other_contacts=true;
                }
              }

            })
          }
        }
        else{
          
          this.display_history=true;
          console.log('display_history');
          if(this.display_history && this.display_others && this.display_related){
            this.display_other_contacts=true;
          }
        }
        
        if(r[0].related_users.length>0){
          let compt1=0;
          for(let i=0;i<r[0].related_users.length;i++){
            this.list_of_related_contacts_names[i]=r[0].related_users[i].firstname + ' ' + r[0].related_users[i].lastname;
            this.list_of_related_contacts_pseudos[i]=r[0].related_users[i].nickname;
            this.list_of_related_contacts_ids[i]=r[0].related_users[i].id;
            this.Profile_Edition_Service.retrieve_profile_picture(  r[0].related_users[i].id ).subscribe(t=> {
              let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_related_contacts_pictures[i] = SafeURL;
              compt1++;
              if(compt1==r[0].related_users.length){
                this.display_related=true;
                console.log('display_related');
                if(this.display_history && this.display_others && this.display_related){
                  this.display_other_contacts=true;
                }
              }

            })
          }
        }
        else{
          this.display_related=true;
          console.log('display_related');
          if(this.display_history && this.display_others && this.display_related){
            this.display_other_contacts=true;
          }
        }

        if(r[0].other_users.length>0){
          let compt2=0;
          for(let i=0;i<r[0].other_users.length;i++){
            this.list_of_other_contacts_names[i]=r[0].other_users[i].firstname + ' ' + r[0].other_users[i].lastname;
            this.list_of_other_contacts_pseudos[i]=r[0].other_users[i].nickname;
            this.list_of_other_contacts_ids[i]=r[0].other_users[i].id;
            this.Profile_Edition_Service.retrieve_profile_picture(  r[0].other_users[i].id ).subscribe(t=> {
              let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_other_contacts_pictures[i] = SafeURL;
              compt2++;
              if(compt2==r[0].other_users.length){
                this.display_others=true;
                console.log('display_others');
                if(this.display_history && this.display_others && this.display_related){
                  this.display_other_contacts=true;
                }
              }
      
            })
          }
        }else{
          this.display_others=true;
          console.log('display_others');
          if(this.display_history && this.display_others && this.display_related){
            this.display_other_contacts=true;
          }
        }
        
      
        console.log(r);
      })
    }
  
    
  }

  open_chat(i){
    this.delete_placeholder();
    this.spam='false';
    this.list_of_friends_last_message[i].status='seen';
    this.id_chat_section=this.list_of_friends_last_message[i].id_chat_section;
    this.friend_id=this.list_of_friends_ids[i];
    this.friend_pseudo=this.list_of_friends_pseudos[i];
    this.friend_name=this.list_of_friends_names[i];
    this.friend_picture=this.list_of_friends_profile_pictures[i];
  }

  open_chat_spam(i){
    this.delete_placeholder();

    this.waiting_friend_id=this.friend_id;
    this.waiting_friend_name=this.friend_name;
    this.waiting_friend_picture=this.friend_picture;
    this.waiting_friend_pseudo=this.friend_pseudo;
    this.waiting_id_chat_section=this.id_chat_section;
    console.log("we open chat spam")
    this.spam='true';
    this.list_of_friends_last_message[i].status='seen';
    this.friend_id=this.list_of_spams_ids[i];
    this.friend_pseudo=this.list_of_spams_pseudos[i];
    this.friend_name=this.list_of_spams_names[i];
    this.friend_picture=this.list_of_spams_profile_pictures[i];
  }

  open_new_contact_chat(indice,i){
    console.log(i);
    console.log(indice); // 1 first propositions, 2 historic researches, 3 related, 4 others
    this.waiting_friend_id=this.friend_id;
    this.waiting_friend_name=this.friend_name;
    this.waiting_friend_picture=this.friend_picture;
    this.waiting_friend_pseudo=this.friend_pseudo;
    this.waiting_id_chat_section=this.id_chat_section;
    if(indice==1){
      this.chatService.check_if_is_related(this.list_of_contacts_ids[i]).subscribe(r=>{
        if(r[0].value){
          this.spam='false';
        }
        else{
          this.spam='true';
          this.selectedRadio="Autres";
          this.formData.reset(
            this.createFormAd()
          )
          this.get_friends=false;
          this.section="Autres";
        }

        this.id_chat_section=1;
        this.friend_id=this.list_of_contacts_ids[i];
        this.friend_pseudo=this.list_of_contacts_pseudos[i];
        this.friend_name=this.list_of_contacts_names[i];
        this.friend_picture=this.list_of_contacts_pictures[i];
      })
      
    }
    if(indice==2){
      this.chatService.check_if_is_related(this.list_of_history_ids[i]).subscribe(r=>{
        if(r[0].value){
          this.spam='false';
        }
        else{
          this.spam='true';
          this.selectedRadio="Autres";
          this.formData.reset(
            this.createFormAd()
          )
          this.get_friends=false;
          this.section="Autres";
        }
        this.id_chat_section=1;
        this.friend_id=this.list_of_history_ids[i];
        this.friend_pseudo=this.list_of_history_pseudos[i];
        this.friend_name=this.list_of_history_names[i];
        this.friend_picture=this.list_of_history_pictures[i];
      })
      
      
    }
    if(indice==3){
      this.chatService.check_if_is_related(this.list_of_related_contacts_ids[i]).subscribe(r=>{
        if(r[0].value){
          this.spam='false';
        }
        else{
          this.spam='true';
          this.selectedRadio="Autres";
          this.formData.reset(
            this.createFormAd()
          )
          this.get_friends=false;
          this.section="Autres";
        }
        this.id_chat_section=1;
        this.friend_id=this.list_of_related_contacts_ids[i];
        this.friend_pseudo=this.list_of_related_contacts_pseudos[i];
        this.friend_name=this.list_of_related_contacts_names[i];
        this.friend_picture=this.list_of_related_contacts_pictures[i];
      })
     
    }
    if(indice==4){
      this.chatService.check_if_is_related(this.list_of_other_contacts_ids[i]).subscribe(r=>{
        if(r[0].value){
          console.log("is related");
          this.spam='false';
        }
        else{
          this.spam='true';
          this.selectedRadio="Autres";
          this.formData.reset(
            this.createFormAd()
          )
          this.get_friends=false;
          this.section="Autres";
        }
        this.friend_id=this.list_of_other_contacts_ids[i];
        this.friend_pseudo=this.list_of_other_contacts_pseudos[i];
        this.friend_name=this.list_of_other_contacts_names[i];
        this.friend_picture=this.list_of_other_contacts_pictures[i];
      })
      
    }
    this.delete_placeholder();
    
    
  }


 
  radioChange(event){
    console.log(this.section)
    if(this.section!=event.value){
      if(event.value =='Autres'){
        console.log("Autres");
        if(this.list_of_spams_ids.length>0){
          console.log("ya un spam");
          this.section=event.value;
          this.waiting_friend_id=this.friend_id;
          this.waiting_friend_name=this.friend_name;
          this.waiting_friend_picture=this.friend_picture;
          this.waiting_friend_pseudo=this.friend_pseudo;
          this.waiting_id_chat_section=this.id_chat_section;

          this.friend_id=this.spam_id;
          this.friend_name=this.spam_name;
          this.friend_picture=this.spam_picture;
          this.friend_pseudo=this.spam_pseudo;
          this.id_chat_section=1;
          
          this.get_friends=false;
          this.spam='true';
        }
        else{
          this.selectedRadio="Mes contacts";
          this.formData.reset(
            this.createFormAd()
          )
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:"Vous n'avez aucun autre message"},
          });
        }
        
      }
      else{
          console.log(event.value);
          this.section=event.value;
          console.log("contacts");

          this.id_chat_section =this.waiting_id_chat_section;
          console.log(this.id_chat_section);
          this.friend_id=this.waiting_friend_id;
          this.friend_name=this.waiting_friend_name;
          this.friend_picture=this.waiting_friend_picture;
          this.friend_pseudo=this.waiting_friend_pseudo;
          this.get_friends=true;
          this.spam='false';
      }
      this.cd.detectChanges();
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


/*************************************Partie envoie de group_chat***********************************/
/*************************************Partie envoie de group_chat***********************************/
/*************************************Partie envoie de group_chat***********************************/
/*************************************Partie envoie de group_chat***********************************/
/*************************************Partie envoie de group_chat***********************************/
/*************************************Partie envoie de group_chat***********************************/
/*************************************Partie envoie de group_chat***********************************/
/*************************************Partie envoie de group_chat***********************************/

create_group_chat(){

}
  

    
}