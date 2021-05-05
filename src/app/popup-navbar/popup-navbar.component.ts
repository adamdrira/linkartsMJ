import { Component, OnInit, ElementRef, ChangeDetectorRef, HostListener, ViewChild, Inject } from '@angular/core';
import { merge, fromEvent } from 'rxjs';
import { MatDialog,MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChatService } from '../services/chat.service';
import {get_date_to_show_chat} from '../helpers/dates';
import {get_date_to_show_navbar} from '../helpers/dates';
import {NotificationsService} from '../services/notifications.service';
import {Profile_Edition_Service} from '../services/profile_edition.service';
import {BdOneShotService} from '../services/comics_one_shot.service';
import {BdSerieService} from '../services/comics_serie.service';
import {Drawings_Artbook_Service} from '../services/drawings_artbook.service';
import {Drawings_Onepage_Service} from '../services/drawings_one_shot.service';
import {Community_recommendation} from '../services/recommendations.service';
import {Writing_Upload_Service} from '../services/writing.service';
import {AuthenticationService} from '../services/authentication.service';
import {NavbarService} from '../services/navbar.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import {trigger, style, animate, transition} from '@angular/animations';
import { PopupContactComponent } from '../popup-contact/popup-contact.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import { PopupShareComponent } from '../popup-share/popup-share.component';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';


@Component({
  selector: 'app-popup-navbar',
  templateUrl: './popup-navbar.component.html',
  styleUrls: ['./popup-navbar.component.scss'],
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
export class PopupNavbarComponent implements OnInit {
  constructor(
    private chatService:ChatService,
    private NotificationsService:NotificationsService,
    private Profile_Edition_Service:Profile_Edition_Service,
    private sanitizer:DomSanitizer,
    private router:Router,
    private route:ActivatedRoute,
    public dialog: MatDialog,
    private deviceService: DeviceDetectorService,
    private location: Location,
    private CookieService:CookieService,
    private Community_recommendation:Community_recommendation,
    private navbar : NavbarService,
    private AuthenticationService:AuthenticationService,
    private cd: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PopupNavbarComponent>,
   
    ) { 
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
    dialogRef.disableClose = true;
  }



  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if( window.innerWidth > 700 ) {
      this.dialogRef.close("closed");
    }
  }

 
  
  profile_picture=this.data.profile_picture;
  profile_picture_unsafe=this.data.profile_picture_unsafe;
  user_id=this.data.user_id;
  author_first_name=this.data.author_first_name;
  author_name=this.data.author_name;
  author_certification=this.data.author_certification;
  pseudo=this.data.pseudo;
  data_retrieved=this.data.data_retrieved;
  number_of_empties=this.data.number_of_empties
 
  list_of_conditions=this.data.list_of_conditions;
  list_of_account_groups_names=this.data.list_of_account_groups_names;
  list_of_account_groups_ids=this.data.list_of_account_groups_ids;
  list_of_account_groups_status=this.data.list_of_account_groups_status;
  list_of_account_groups_pp=this.data.list_of_account_groups_pp;
  pp_group_loaded=this.data.pp_group_loaded;
  user_is_in_a_group=this.data.user_is_in_a_group;


  @ViewChild('chat') chat:ElementRef;
  @ViewChild('notifications') notifications:ElementRef;
  @ViewChild('myScrollContainer') private myScrollContainer: ElementRef;
  @ViewChild('myScrollContainer_chat') private myScrollContainer_chat: ElementRef;


   @HostListener('document:click', ['$event'])
  clickout(event) {
    if(this.show_notifications){
      if(this.notifications && !this.notifications.nativeElement.contains(event.target) ) {
        this.show_notifications=false;
        this.change_notifications_status_to_checked();
      } 
    }
    if(this.show_chat_messages){
      if(this.chat &&!this.chat.nativeElement.contains(event.target) ) {
        this.show_chat_messages=false;
        this.number_of_unseen_messages=0;
        this.cd.detectChanges();
      } 
    }
  }

  show_icon=false;
  device_info='';
  current_user:any;

  ngOnInit() {

    this.device_info = this.deviceService.getDeviceInfo().browser + ' ' + this.deviceService.getDeviceInfo().deviceType + ' ' + this.deviceService.getDeviceInfo().os + ' ' + this.deviceService.getDeviceInfo().os_version;
    this.Profile_Edition_Service.get_current_user().subscribe(r=>{
      this.current_user=r;
    });
    if(!this.list_of_friends_retrieved){
      this.chatService.get_number_of_unseen_messages().subscribe(a=>{
        if(a[0]){
          this.number_of_unseen_messages=a[0].number_of_unseen_messages;
        }
        else{
          this.number_of_unseen_messages=0
        }
        this.sort_friends_list();
      })
    }

    if(!this.notifications_pictures_retrieved){
      this.compteur_get_final_list++;
      let compteur=this.compteur_get_final_list;
      let compteur_pp=0;
      for(let i=0;i<this.list_of_notifications.length;i++){
       this.list_of_notifications_dates[i]=this.get_date(this.list_of_notifications[i].createdAt,i);
        if(status=="initialize"){
          this.Profile_Edition_Service.retrieve_profile_picture_for_notifs(this.list_of_notifications[i].id_user,compteur).subscribe(t=> {
            if(this.compteur_get_final_list==t[1]){
             let url = (window.URL) ? window.URL.createObjectURL(t[0]) : (window as any).webkitURL.createObjectURL(t[0]);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.list_of_notifications_profile_pictures[i] = url;
                compteur_pp++;
                if(compteur_pp==this.list_of_notifications.length){
                  this.index_of_notifications_to_show=15+this.number_of_empties;
                  this.notifications_pictures_retrieved=true;
                  this.display_number_of_unchecked_notifications();
                }
              
            }
           
          })
        }
        if(status=="add" ){
          if( this.list_of_notifications_profile_pictures[i]){
            compteur_pp++;
            if(compteur_pp==this.list_of_notifications.length){
              this.index_of_notifications_to_show=15+this.number_of_empties;
              this.notifications_pictures_retrieved=true;
              this.display_number_of_unchecked_notifications();
            }
          }
          else{
            this.Profile_Edition_Service.retrieve_profile_picture_for_notifs(this.list_of_notifications[i].id_user,compteur).subscribe(t=> {
              if(this.compteur_get_final_list==t[1]){
                let url = (window.URL) ? window.URL.createObjectURL(t[0]) : (window as any).webkitURL.createObjectURL(t[0]);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                  this.list_of_notifications_profile_pictures[i] = url;
                  compteur_pp++;
                  if(compteur_pp==this.list_of_notifications.length){
                   this.index_of_notifications_to_show=15+this.number_of_empties;
                    this.notifications_pictures_retrieved=true;
                    this.display_number_of_unchecked_notifications();
                  }
                
              }
             
            })
          }
  
        }
        
      }
    }
   
  }

  chat_scroll(event){
    if(this.show_chat_messages){
      if(this.myScrollContainer_chat && (this.myScrollContainer_chat.nativeElement.scrollTop + this.myScrollContainer_chat.nativeElement.offsetHeight >= this.myScrollContainer_chat.nativeElement.scrollHeight*0.8)){
        if(this.number_of_friends_to_show<this.list_of_friends_ids.length){
          this.number_of_friends_to_show+=10;
        }
      }
    }
  }

  notifs_scroll(event){
    if(this.show_notifications){
      if((this.myScrollContainer.nativeElement.scrollTop + this.myScrollContainer.nativeElement.offsetHeight >= this.myScrollContainer.nativeElement.scrollHeight*0.8)){
        if(this.index_of_notifications_to_show<this.final_list_of_notifications_to_show.length){
  
          let number_of_notifs=0;
          let index_fin=-1;
          for(let i=this.index_of_notifications_to_show;i<this.final_list_of_notifications_to_show.length;i++){
            if(this.final_list_of_notifications_to_show[i]){
              number_of_notifs+=1;
            }
            if(number_of_notifs==10){
              index_fin=i;
            }
          }
  
          if(index_fin>0){
            this.index_of_notifications_to_show=index_fin;
          }
          else{
            this.index_of_notifications_to_show=this.final_list_of_notifications_to_show.length;
          }
        }
        
      }
    }
  }

  

  disconnecting=false;
  logout() {
    if (this.disconnecting) {
      return
    }
    this.disconnecting = true;

    this.AuthenticationService.logout().subscribe(r => {
      let recommendations_string = this.CookieService.get('recommendations');
      if(r[0].ok){
        if (recommendations_string) {
          this.disconnecting = false;
          this.location.go('/')
          location.reload();
  
        }
        else {
          this.Community_recommendation.generate_recommendations().subscribe(r => {
            this.disconnecting = false;
            this.cd.detectChanges();
            this.location.go('/')
            location.reload();
          })
        }
      }
      else{
        this.AuthenticationService.create_visitor().subscribe(r=>{
          this.Community_recommendation.generate_recommendations().subscribe(r => {
            this.disconnecting = false;
            this.cd.detectChanges();
            this.location.go('/')
            location.reload();
          })
        })
      }
     
    });
  }

  pp_is_loaded=false;
  pp_loaded(){
    this.pp_is_loaded=true;
  }

  
/*********************************************  NOTIFICATIONS ****************************/
/*********************************************  NOTIFICATIONS ****************************/
/*********************************************  NOTIFICATIONS ****************************/
/*********************************************  NOTIFICATIONS ****************************/
/*********************************************  NOTIFICATIONS ****************************/
/*********************************************  NOTIFICATIONS ****************************/

number_of_unchecked_notifications=this.data.number_of_unchecked_notifications;
index_of_notifications_to_show=this.data.index_of_notifications_to_show;
show_notifications=this.data.show_notifications;
check_chat_service=this.data.check_chat_service;
check_notifications_from_service=this.data.check_notifications_from_service;
list_of_notifications_profile_pictures=this.data.list_of_notifications_profile_pictures;
notifications_pictures_retrieved=this.data.notifications_pictures_retrieved;
list_of_notifications=this.data.list_of_notifications;
notification_loaded=this.data.notification_loaded;


dictionnary_of_similar_notifications=this.data.dictionnary_of_similar_notifications;
list_of_notifications_dates=this.data.list_of_notifications_dates;
final_list_of_notifications_to_show=this.data.final_list_of_notifications_to_show;
compteur_get_final_list=this.data.compteur_get_final_list;

load_notification_pp(i){
  this.notification_loaded[i]=true;
}


close_notifications(){
  this.show_notifications=false;
  this.change_notifications_status_to_checked();
  this.cd.detectChanges();
}


not_using_chat(){
  if( this.navbar.get_using_chat()){
    this.navbar.set_not_using_chat();
  }
  
}

open_my_account() {
  this.not_using_chat();
  if(this.show_notifications){
    this.close_notifications();
  }
  this.close_dialog()
}
get_my_account() {
  return "/account/" + this.pseudo + "/my_account";
}

go_to_home(){

  this.not_using_chat();
  this.router.navigate(['/']);
  this.close_dialog()
}

go_to_linkcollab(){
  this.not_using_chat();
  this.router.navigate(['/linkcollab']);
  this.close_dialog()
}

go_to_add_artwork(){
  this.not_using_chat();
  this.router.navigate(['/add-artwork']);
  this.close_dialog()
}

really_open_my_profile() {
  this.not_using_chat();
  this.router.navigate([`/account/${this.pseudo}`]);
  this.close_dialog()
}
really_open_my_account() {
  this.not_using_chat();
  this.router.navigate([`/account/${this.pseudo}/my_account`]);
  this.close_dialog()
}

open_my_trending(){
  this.not_using_chat();
  this.close_notifications();
}
get_my_trending(category) {
  this.not_using_chat();
  if(category=='comic'){
    return "/home/trendings/comics"
  }
  if(category=='drawing'){
    return "/home/trendings/drawings"
  }
  if(category=='writing'){
    return "/home/trendings/writings"
  }
}


get_my_favorite() {
    return "/home/favorites"
}

get_account_for_notification(notif:any) {
  return "/account/" + notif.id_user_name ;
}
open_comic(notif:any) {
  this.router.navigate([this.get_comic(notif)]);
  this.not_using_chat();
  this.close_notifications();
  this.close_dialog();
}
get_comic(notif:any) {
  let title_url=notif.publication_name.replace(/\%/g, '%25').replace(/\;/g, '%3B').replace(/\#/g, '%23').replace(/\=/g, '%3D').replace(/\&/g, '%26').replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\ /g, '%20').replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\:/g, '%3A');
    return "/artwork-comic/" + notif.format + "/" + title_url+ "/" + notif.publication_id;
}

open_comic_chapter(notif:any) {
  this.router.navigate([this.get_comic_chapter(notif)]);
  this.not_using_chat();
  this.close_notifications();
  this.close_dialog();
}
get_comic_chapter(notif:any) {
  let title_url=notif.publication_name.replace(/\%/g, '%25').replace(/\;/g, '%3B').replace(/\#/g, '%23').replace(/\=/g, '%3D').replace(/\&/g, '%26').replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\ /g, '%20').replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\:/g, '%3A');
  return "/artwork-comic/" + notif.format + "/" + title_url + "/" + notif.publication_id + "/" + notif.chapter_number;
}
open_drawing(notif:any) {
  this.router.navigate([this.open_drawing(notif)]);
  this.not_using_chat();
  this.close_notifications();
  this.close_dialog();
}
get_drawing(notif:any) {
  let title_url=notif.publication_name.replace(/\%/g, '%25').replace(/\;/g, '%3B').replace(/\#/g, '%23').replace(/\=/g, '%3D').replace(/\&/g, '%26').replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\ /g, '%20').replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\:/g, '%3A');
  return "/artwork-drawing/" + notif.format + "/" + title_url+ "/" + notif.publication_id;
}
open_writing(notif:any) {
  this.router.navigate([this.open_writing(notif)]);
  this.not_using_chat();
  this.close_notifications();
  this.close_dialog();
}
get_writing(notif:any) {
  let title_url=notif.publication_name.replace(/\%/g, '%25').replace(/\;/g, '%3B').replace(/\#/g, '%23').replace(/\=/g, '%3D').replace(/\&/g, '%26').replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\ /g, '%20').replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\:/g, '%3A');
  return "/artwork-writing/" + title_url + "/" + notif.publication_id;
}
open_ad(notif:any) {
  this.router.navigate([this.open_ad(notif)]);
  this.not_using_chat();
  this.close_notifications();
  this.close_dialog();
}
get_ad(notif:any) {
  let title_url=notif.publication_name.replace(/\%/g, '%25').replace(/\;/g, '%3B').replace(/\#/g, '%23').replace(/\=/g, '%3D').replace(/\&/g, '%26').replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\ /g, '%20').replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\:/g, '%3A');
    return "/ad-page/" + title_url + "/" + notif.publication_id;
}

sort_notifications(msg){
  if(msg[0].for_notifications){
    if(msg[0].information!='remove'){
      this.list_of_notifications.splice(0,0,msg[0])
    }
    else if(msg[0].information=='remove'){
      let index=-1;
      for(let i=0;i<this.list_of_notifications.length;i++){
        if(this.list_of_notifications[i].id_user==msg[0].id_user &&
          this.list_of_notifications[i].publication_category==msg[0].publication_category && 
          this.list_of_notifications[i].publication_id==msg[0].publication_id && 
          this.list_of_notifications[i].type==msg[0].type && 
          this.list_of_notifications[i].is_comment_answer==msg[0].is_comment_answer && 
          this.list_of_notifications[i].comment_id==msg[0].comment_id && 
          this.list_of_notifications[i].format==msg[0].format && 
          this.list_of_notifications[i].chapter_number==msg[0].chapter_number){
            index=i;
          }
      }
      if(index>=0){
        this.list_of_notifications.splice(index,1)
      }
      
    }
    this.get_final_list_of_notifications_to_show("add");
  }
  else{
    this.list_of_messages.splice(0,0,msg[0]);

  }
}



change_notifications_status_to_checked(){
  let modify=false;
  for(let i=0;i<this.list_of_notifications.length;i++){
    if(this.list_of_notifications[i].status=="unchecked"){
      modify=true;
      this.list_of_notifications[i].status="checked";
      if(this.final_list_of_notifications_to_show[i]){
        this.final_list_of_notifications_to_show[i].status="checked"
      }
    }
  }
  if(modify){
    this.NotificationsService.change_all_notifications_status_to_checked(this.user_id).subscribe(r=>{  
    })
  }
  this.number_of_unchecked_notifications=0;
}


get_final_list_of_notifications_to_show(status){
  if(status=="add"){
    this.list_of_notifications_profile_pictures.splice(0,0,null);
  }
  this.compteur_get_final_list++;
  let compteur=this.compteur_get_final_list
  this.final_list_of_notifications_to_show=[];
  this.dictionnary_of_similar_notifications={};
  this.dictionnary_of_similar_notifications[0]=[];
  this.final_list_of_notifications_to_show[0]=this.list_of_notifications[0];
  let number_of_empties=0;
  if(this.list_of_notifications.length>1){
    for(let i=1;i<this.list_of_notifications.length;i++){
      this.dictionnary_of_similar_notifications[i]=[];
      let similar_found=false;
      for(let j=0;j<i;j++){
        if(this.list_of_notifications[i].type=='comment_like' || this.list_of_notifications[i].type=='comment_answer_like' || this.list_of_notifications[i].type=='comment_answer'){
          if(this.list_of_notifications[i].publication_category==this.list_of_notifications[j].publication_category && 
            this.list_of_notifications[i].publication_id==this.list_of_notifications[j].publication_id && 
            this.list_of_notifications[i].type==this.list_of_notifications[j].type && 
            this.list_of_notifications[i].is_comment_answer==this.list_of_notifications[j].is_comment_answer && 
            this.list_of_notifications[i].comment_id==this.list_of_notifications[j].comment_id && 
            this.list_of_notifications[i].format==this.list_of_notifications[j].format && 
            this.list_of_notifications[i].chapter_number==this.list_of_notifications[j].chapter_number){
              if(!similar_found && this.list_of_notifications[i].id_user!=this.list_of_notifications[j].id_user){
                this.dictionnary_of_similar_notifications[j].push(this.list_of_notifications[i]);
                similar_found=true;
              }
              if(!similar_found && this.list_of_notifications[i].id_user==this.list_of_notifications[j].id_user){
                similar_found=true;
              }
              
            }
        }
        else if( 
          this.list_of_notifications[i].publication_category==this.list_of_notifications[j].publication_category && 
          this.list_of_notifications[i].publication_id==this.list_of_notifications[j].publication_id && 
          this.list_of_notifications[i].type==this.list_of_notifications[j].type && 
          this.list_of_notifications[i].format==this.list_of_notifications[j].format && 
          this.list_of_notifications[i].chapter_number==this.list_of_notifications[j].chapter_number){
            if(!similar_found && this.list_of_notifications[i].id_user!=this.list_of_notifications[j].id_user){
              this.dictionnary_of_similar_notifications[j].push(this.list_of_notifications[i]);
              similar_found=true;
            }
            if(!similar_found && this.list_of_notifications[i].id_user==this.list_of_notifications[j].id_user){
              similar_found=true;
            }
        }
      }
      if(!similar_found ){
          this.final_list_of_notifications_to_show[i]=this.list_of_notifications[i];
      }
      else if(i<20){
        number_of_empties+=1
      }
    }
  }
  this.index_of_notifications_to_show=15+number_of_empties;
  this.data_retrieved=true;
  this.display_number_of_unchecked_notifications();
  let compteur_pp=0;
  for(let i=0;i<this.list_of_notifications.length;i++){
   this.list_of_notifications_dates[i]=this.get_date(this.list_of_notifications[i].createdAt,i);

    if(status=="initialize"){
      this.Profile_Edition_Service.retrieve_profile_picture_for_notifs(this.list_of_notifications[i].id_user,compteur).subscribe(t=> {
        if(this.compteur_get_final_list==t[1]){
         let url = (window.URL) ? window.URL.createObjectURL(t[0]) : (window as any).webkitURL.createObjectURL(t[0]);
          const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_notifications_profile_pictures[i] = url;
            compteur_pp++;
            if(compteur_pp==this.list_of_notifications.length){
              this.index_of_notifications_to_show=15+number_of_empties;
              this.notifications_pictures_retrieved=true;
              this.display_number_of_unchecked_notifications();
            }
          
        }
       
      })
    }
    if(status=="add" ){
      if( this.list_of_notifications_profile_pictures[i]){
        compteur_pp++;
        if(compteur_pp==this.list_of_notifications.length){
          this.index_of_notifications_to_show=15+number_of_empties;
          this.notifications_pictures_retrieved=true;
          this.display_number_of_unchecked_notifications();
        }
      }
      else{
        this.Profile_Edition_Service.retrieve_profile_picture_for_notifs(this.list_of_notifications[i].id_user,compteur).subscribe(t=> {
          if(this.compteur_get_final_list==t[1]){
            let url = (window.URL) ? window.URL.createObjectURL(t[0]) : (window as any).webkitURL.createObjectURL(t[0]);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_notifications_profile_pictures[i] = url;
              compteur_pp++;
              if(compteur_pp==this.list_of_notifications.length){
                this.index_of_notifications_to_show=15+number_of_empties;
                this.notifications_pictures_retrieved=true;
                this.display_number_of_unchecked_notifications();
              }
            
          }
         
        })
      }

    }
    
  }
  
  
  
}


display_number_of_unchecked_notifications(){
  let number=0;
  for(let i=0;i<this.list_of_notifications.length;i++){
    if(this.list_of_notifications[i].status=="unchecked"){
      number+=1;
    }
  }
  this.number_of_unchecked_notifications=number;
}

indice=0
get_date(created,i){
  if(created){
    let now=Math.trunc( new Date().getTime()/1000);
    let date=created;
    date = date.replace("Z",'');
    date=date.slice(0,19)
    let deco_date=Math.trunc( new Date(date + '+00:00').getTime()/1000)
    return get_date_to_show_navbar(now-deco_date);
  }
  else{
    return "A l'instant"
  }
  
}

  open_notifications_notifs(event: any){
    event.stopPropagation();
    this.open_notifications();
  }
  
  scroll_notifs:any;
  open_notifications(){
    if(this.show_notifications){
      this.show_notifications=false;
      this.change_notifications_status_to_checked();
      return
    }
    for(let i=0;i<this.list_of_notifications.length;i++){
      this.list_of_notifications_dates[i]=this.get_date(this.list_of_notifications[i].createdAt,i);
    }
    this.show_notifications=true;
    if(this.myScrollContainer){
      this.scroll_notifs = merge(
        fromEvent(window, 'scroll'),
        fromEvent(this.myScrollContainer.nativeElement, 'scroll')
      );
    }
    
  }


/********************************************* CHAT MESSAGES NOTIFICATIONS ****************************/
/********************************************* CHAT MESSAGES NOTIFICATIONS ****************************/
/********************************************* CHAT MESSAGES NOTIFICATIONS ****************************/
/********************************************* CHAT MESSAGES NOTIFICATIONS ****************************/
/********************************************* CHAT MESSAGES NOTIFICATIONS ****************************/
/********************************************* CHAT MESSAGES NOTIFICATIONS ****************************/

//chat_friends and groups
show_chat_messages=this.data.show_chat_messages;
list_of_messages=this.data.list_of_messages;
number_of_unseen_messages=this.data.number_of_unseen_messages;
using_chat=this.data.using_chat;
using_chat_retrieved=this.data.using_chat_retrieved;


list_of_chat_friends_ids=this.data.list_of_chat_friends_ids; // id de la liste list_of_chat_friends
number_of_friends_to_show=this.data.number_of_friends_to_show;
list_of_friends_types=this.data.list_of_friends_types;
list_of_friends_profile_pictures=this.data.list_of_friends_profile_pictures;
list_of_friends_pseudos=this.data.list_of_friends_pseudos;
list_of_friends_names=this.data.list_of_friends_names;
list_of_friends_certifications=this.data.list_of_friends_certifications;
list_of_friends_ids=this.data.list_of_friends_ids;
list_of_friends_last_message=this.data.list_of_friends_last_message;
list_of_friends_retrieved=this.data.list_of_friends_retrieved;
list_of_friends_date=this.data.list_of_friends_date
list_of_friends_users_only=this.data.list_of_friends_users_only;

list_of_last_connection_dates=this.data.list_of_last_connection_dates;
list_of_friends_connected=this.data.list_of_friends_connected;
connections_status_retrieved=this.data.connections_status_retrieved;
list_of_groups_retrieved=this.data.list_of_groups_retrieved;
list_of_groups_ids=this.data.list_of_groups_ids;

list_of_pp_sorted=this.data.list_of_pp_sorted;
can_sort_list_of_profile_pictures=this.data.can_sort_list_of_profile_pictures;
list_of_pictures_by_ids_users=this.data.list_of_pictures_by_ids_users;
list_of_pictures_by_ids_groups=this.data.list_of_pictures_by_ids_groups;


open_chat_2() {
  this.show_chat_messages=false;
  this.close_dialog();
}
get_chat_2(i:number) {
  return "/chat/" + this.get_chat_url(i);
}


open_chat_main() {
  this.show_chat_messages=false;
  this.router.navigate([`/chat`]);
  this.close_dialog()
}

get_chat_url(i){
  if(this.list_of_friends_types[i]=='group'){

    this.number_of_unseen_messages=0;
    return `group/${this.list_of_friends_pseudos[i]}/${this.list_of_friends_ids[i]}`
  }
  else{
    this.number_of_unseen_messages=0;
    return `${this.list_of_friends_pseudos[i]}/${this.list_of_friends_ids[i]}`
  }
}


open_messages_notifs(event: any) {
  event.stopPropagation();
  this.open_messages();
}

scroll_chat:any;
open_messages(){
  
  if(this.show_chat_messages){
    this.show_chat_messages=false;
    return;
  }
  if(!this.using_chat && this.using_chat_retrieved){
    this.show_chat_messages=true;
    this.cd.detectChanges();
    if(this.myScrollContainer_chat){
      this.scroll_chat = merge(
        fromEvent(window, 'scroll'),
        fromEvent(this.myScrollContainer_chat.nativeElement, 'scroll')
      );
    }
  }
 
}




sort_friends_list() {
  this.list_of_chat_friends_ids=[]; 
  this.number_of_friends_to_show=10;
  this.list_of_friends_types=[];
  this.list_of_friends_profile_pictures=[];
  this.list_of_friends_pseudos=[];
  this.list_of_friends_names=[];
  this.list_of_friends_certifications=[];
  this.list_of_friends_ids=[];
  this.list_of_friends_last_message=[];
  this.list_of_friends_retrieved=false;
  this.list_of_friends_date=[]
  this.list_of_friends_users_only=[];

  this.list_of_last_connection_dates=[];
  this.list_of_friends_connected=[];
  this.connections_status_retrieved=false;
  this.list_of_groups_retrieved=false;
  this.list_of_groups_ids=[];

 

  this.chatService.get_list_of_users_I_talk_to_navbar().subscribe(r=>{

    let friends=r[0].friends;
    if(friends.length>0){
      let compt=0;
      let compt_pp=0;
      for(let i=0;i<friends.length;i++){
        this.list_of_chat_friends_ids[i]=friends[i].id;
        let data_retrieved=false;
        if(friends[i].id_user==this.user_id){
            this.list_of_friends_types[i]='user';
            this.list_of_friends_users_only[i]=friends[i].id_receiver;
            this.list_of_friends_ids[i]=friends[i].id_receiver;
            this.list_of_friends_date[i]=new Date(friends[i].date).getTime()/1000;
            this.Profile_Edition_Service.retrieve_profile_data(friends[i].id_receiver).subscribe(s=>{
              this.list_of_friends_pseudos[i]=s[0].nickname;
              this.list_of_friends_names[i]=s[0].firstname + ' ' + s[0].lastname;
              this.list_of_friends_certifications[i]=s[0].certified_account;
              data_retrieved=true;
              all_retrieved(this);
            });

            this.Profile_Edition_Service.retrieve_profile_picture( friends[i].id_receiver ).subscribe(t=> {
              let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_pictures_by_ids_users[friends[i].id_receiver] = url;
              compt_pp++;
              if(compt_pp==friends.length){
                this.sort_list_of_profile_pictures()
              }
            });
           
            
            function all_retrieved(THIS){
              if(data_retrieved ){
                compt ++;
                if(compt==friends.length){
                  THIS.chatService.get_last_friends_message(THIS.list_of_friends_ids).subscribe(u=>{
                    THIS.list_of_friends_last_message=u[0].list_of_friends_messages;
                    THIS.sort_friends_groups_chats_list();
                  });
                }
              }
            }
        }
        else{
            this.list_of_friends_types[i]='user';
            this.list_of_friends_ids[i]=friends[i].id_user;
            this.list_of_friends_users_only[i]=friends[i].id_user;
            this.list_of_friends_date[i]=new Date(friends[i].date).getTime()/1000;
            this.Profile_Edition_Service.retrieve_profile_data(friends[i].id_user).subscribe(s=>{
              this.list_of_friends_pseudos[i]=s[0].nickname;
              this.list_of_friends_names[i]=s[0].firstname + ' ' + s[0].lastname;
              this.list_of_friends_certifications[i]=s[0].certified_account;
              data_retrieved=true;
              all_retrieved(this);
            });

            this.Profile_Edition_Service.retrieve_profile_picture(  friends[i].id_user ).subscribe(t=> {
              let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_pictures_by_ids_users[friends[i].id_user] = url;
              compt_pp++;
              if(compt_pp==friends.length){
                this.sort_list_of_profile_pictures()
              }
            });

            
            function all_retrieved(THIS){
              if(data_retrieved ){
                compt ++;
                if(compt==friends.length){
                  THIS.chatService.get_last_friends_message(THIS.list_of_friends_ids).subscribe(u=>{
                    THIS.list_of_friends_last_message=u[0].list_of_friends_messages;
                    THIS.sort_friends_groups_chats_list();
                  });
                }
              }
            }
        }
      }
    }
    
  })
};


sort_friends_groups_chats_list(){
  let len =this.list_of_friends_ids.length;
  this.chatService.get_my_list_of_groups_navbar().subscribe(l=>{
    let list_of_names=[]
    if(l[0].length>0){
      for(let k=0;k<l[0].length;k++){
        
        list_of_names.push(l[0][k].name)
        this.list_of_friends_names[len+k]=l[0][k].name;
        this.list_of_friends_certifications[len+k]=null;
        this.list_of_friends_pseudos[len+k]=l[0][k].name
        this.list_of_groups_ids[k]=l[0][k].id;
        if(k==l[0].length-1){
          // get_list_of_groups_I_am_in sans les spams
          this.chatService.get_list_of_groups_I_am_in( this.list_of_groups_ids).subscribe(r=>{
           
            let compt=0;
            let list_of_ids=[]
            for(let i=0;i<r[0].friends.length;i++){
              list_of_ids.push(r[0].friends[i].id_receiver);
              this.list_of_chat_friends_ids[len+i]=r[0].friends[i].id;
              this.list_of_friends_ids[len+i]=r[0].friends[i].id_receiver;
              this.list_of_friends_date[len+i]=new Date(r[0].friends[i].date).getTime()/1000;
              this.list_of_friends_types[len+i]='group';
              
              this.chatService.retrieve_chat_profile_picture(r[0].friends[i].chat_profile_pic_name,r[0].friends[i].profile_pic_origin).subscribe(t=> {
               
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.list_of_pictures_by_ids_groups[r[0].friends[i].id_receiver] = url;
                compt ++;
                if(compt==r[0].friends.length){
                  this.sort_list_of_profile_pictures();
                }
              });

            }
            this.chatService.get_last_friends_groups_message(list_of_ids).subscribe(u=>{    
              this.list_of_friends_last_message=this.list_of_friends_last_message.concat(u[0].list_of_friends_messages);
              this.sort_list_of_groups_and_friends();
            });
          })
        }
      }
      
    }
    else{
      this.can_sort_list_of_profile_pictures=true;
      if(this.list_of_pp_sorted){
        this.sort_list_of_profile_pictures()
      }
      this.get_connections_status();
      this.list_of_friends_retrieved=true;
    }
    
    
    
  })
}

sort_list_of_groups_and_friends(){
  let length=this.list_of_friends_ids.length
  for(let i=1;i<length;i++){
    for(let j=0;j<i;j++){
      if(this.list_of_friends_date[i]>this.list_of_friends_date[j]){
        this.list_of_chat_friends_ids.splice(j,0,this.list_of_chat_friends_ids.splice(i,1)[0]);
        this.list_of_friends_last_message.splice(j,0,this.list_of_friends_last_message.splice(i,1)[0]);
        this.list_of_friends_date.splice(j,0,this.list_of_friends_date.splice(i,1)[0]);
        this.list_of_friends_ids.splice(j,0,this.list_of_friends_ids.splice(i,1)[0]);
        this.list_of_friends_types.splice(j,0,this.list_of_friends_types.splice(i,1)[0]);
        this.list_of_friends_names.splice(j,0,this.list_of_friends_names.splice(i,1)[0]);
        this.list_of_friends_certifications.splice(j,0,this.list_of_friends_certifications.splice(i,1)[0]);
        this.list_of_friends_pseudos.splice(j,0,this.list_of_friends_pseudos.splice(i,1)[0]);
      }
    }
  }
  this.can_sort_list_of_profile_pictures=true;
  if(this.list_of_pp_sorted){
    this.sort_list_of_profile_pictures()
  }
  this.get_connections_status();
  this.list_of_friends_retrieved=true;
}


sort_list_of_profile_pictures(){
  if(this.can_sort_list_of_profile_pictures){
    let length=this.list_of_friends_ids.length;
    for(let i=0;i<length;i++){
      if(this.list_of_friends_types[i]=='user'){
        this.list_of_friends_profile_pictures[i]=this.list_of_pictures_by_ids_users[this.list_of_friends_ids[i]]
      }
      else{
        this.list_of_friends_profile_pictures[i]=this.list_of_pictures_by_ids_groups[this.list_of_friends_ids[i]]
      }
    }
   
  }
  else{
    this.list_of_pp_sorted=true;
  }
  
}

friends_pp_loaded=[]
load_friends_pp(i){
  this.friends_pp_loaded[i]=true;
}

get_connections_status(){
  this.chatService.get_users_connected_in_the_chat(this.list_of_friends_users_only).subscribe(r=>{
    let compt=0
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
            if(list[j]!=this.user_id){
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
  this.list_of_friends_certifications.splice(0,0,this.list_of_friends_certifications.splice(index,1)[0]);
  this.list_of_chat_friends_ids.splice(0,0,this.list_of_chat_friends_ids.splice(index,1)[0]);
  this.list_of_friends_profile_pictures.splice(0,0,this.list_of_friends_profile_pictures.splice(index,1)[0]);
  this.list_of_friends_pseudos.splice(0,0,this.list_of_friends_pseudos.splice(index,1)[0]);
  this.cd.detectChanges()
}

change_message_status(event){
  if(!event.spam){
    
    let index_friend=-1;
    for(let i=0;i<this.list_of_friends_ids.length;i++){
      if(this.list_of_friends_ids[i]==event.friend_id && this.list_of_friends_types[i]==event.friend_type){
        index_friend=i;
      }
    }
    if(index_friend>=0){
      if(event.status=="delete" && this.list_of_friends_last_message[index_friend].id_chat_section==event.id_chat_section){
        this.list_of_friends_last_message[index_friend].status="deleted";
      } 
      if(event.status=="seen" &&  this.list_of_friends_last_message[index_friend].id_chat_section==event.id_chat_section){
        if(event.friend_type=='group'){
           if( (this.list_of_friends_last_message[index_friend].id_user==this.user_id && this.user_id!=event.real_friend_id)
             || this.list_of_friends_last_message[index_friend].id_user!=this.user_id ){
              if( this.list_of_friends_last_message[index_friend].list_of_users_who_saw.indexOf(event.real_friend_id)<0){
                this.list_of_friends_last_message[index_friend].list_of_users_who_saw.push(event.real_friend_id);
              }
           }
        }
        else if((this.list_of_friends_last_message[index_friend].id_user==this.user_id && this.user_id!=event.real_friend_id)
        || this.list_of_friends_last_message[index_friend].id_user!=this.user_id){
          this.list_of_friends_last_message[index_friend].status="seen";
        }
        
        
      } 
      
      
    }
    
  }
  this.cd.detectChanges()
}

  new_sort_friends_list(event){
    if(this.list_of_pp_sorted){
      let index=-1;
      for(let i=0;i<this.list_of_friends_ids.length;i++){
        if(this.list_of_friends_ids[i]==event.friend_id && this.list_of_friends_types[i]==event.friend_type ){
          index=i;
        }
      }
      if(index>=0){
        this.list_of_friends_last_message[index]=event.message;
        this.cd.detectChanges();
        this.list_of_friends_last_message[index].status="received";
        this.cd.detectChanges();
        
        this.list_of_friends_types.splice(0,0,this.list_of_friends_types.splice(index,1)[0]);
        this.list_of_friends_ids.splice(0,0,this.list_of_friends_ids.splice(index,1)[0]);
        this.list_of_friends_last_message.splice(0,0,this.list_of_friends_last_message.splice(index,1)[0]);
        this.list_of_friends_names.splice(0,0,this.list_of_friends_names.splice(index,1)[0]);
        this.list_of_friends_certifications.splice(0,0,this.list_of_friends_certifications.splice(index,1)[0]);
        this.list_of_chat_friends_ids.splice(0,0,this.list_of_chat_friends_ids.splice(index,1)[0]);
        this.list_of_friends_profile_pictures.splice(0,0,this.list_of_friends_profile_pictures.splice(index,1)[0]);
        this.list_of_friends_pseudos.splice(0,0,this.list_of_friends_pseudos.splice(index,1)[0]);
        this.cd.detectChanges();

      }
      else{
        if(event.friend_type=='group'){
          this.get_group_chat_name(event.friend_id,event.message);
        }
        else{
          this.chatService.check_if_is_related(event.friend_id).subscribe(r=>{
            if(r[0].value){
              if(event.friend_id==this.user_id){
                this.list_of_friends_types.splice(0,0,'user');
                this.list_of_friends_ids.splice(0,0,event.friend_id);
                  this.list_of_friends_last_message.splice(0,0,event.message);
                  this.list_of_friends_last_message[0].status="received";
                  this.list_of_friends_names.splice(0,0,this.author_name);
                  this.list_of_friends_certifications.splice(0,0,this.author_certification);
                  this.list_of_chat_friends_ids.splice(0,0,event.message.chat_id);
                  this.list_of_friends_profile_pictures.splice(0,0,this.profile_picture_unsafe);
                  this.list_of_friends_pseudos.splice(0,0,this.pseudo);
                  this.cd.detectChanges();
              }
              else{
                let name;
                let pseudo;
                let picture;
                let data_retrieved=false;
                let pp_retrieved=false;
                let certification= false;
                this.Profile_Edition_Service.retrieve_profile_data(event.friend_id).subscribe(s=>{
                  pseudo = s[0].nickname;
                  certification = s[0].certified_account;
                  name =s[0].firstname + ' ' + s[0].lastname;
                  data_retrieved=true;
                  check_all(this)
                });
    
                this.Profile_Edition_Service.retrieve_profile_picture( event.friend_id).subscribe(t=> {
                  let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                  const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                  picture = url;
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
                    THIS.list_of_friends_certifications.splice(0,0,certification);
                    THIS.list_of_chat_friends_ids.splice(0,0,event.message.chat_id);
                    THIS.list_of_friends_profile_pictures.splice(0,0,picture);
                    THIS.list_of_friends_pseudos.splice(0,0,pseudo);
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


  add_group_to_contacts(event){
    this.get_group_chat_name(event.friend_id,event.message)
  }
  

  get_group_chat_name(id,message){
    let pseudo = message.group_name;
    let name =message.group_name;
    this.chatService.get_group_chat_as_friend(id).subscribe(s=>{
      this.chatService.retrieve_chat_profile_picture(s[0].chat_profile_pic_name,s[0].profile_pic_origin).subscribe(t=> {
        let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        let picture = url;
        this.list_of_chat_friends_ids.splice(0,0,s[0].id)
        this.list_of_friends_types.splice(0,0,'group');
        this.list_of_friends_ids.splice(0,0,id);
        this.list_of_friends_last_message.splice(0,0,message);
        this.list_of_friends_last_message[0].status="received";
        this.list_of_friends_names.splice(0,0,name);
        this.list_of_friends_certifications.splice(0,0,null);
        this.list_of_friends_profile_pictures.splice(0,0,picture);
        this.list_of_friends_pseudos.splice(0,0,pseudo);
        this.cd.detectChanges();
      })
      
    })
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
      if(day=='Thu'){
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

  blocking_managment(event){
    let index=-1;
    for(let i=0;i<this.list_of_friends_ids.length;i++){
      if(this.list_of_friends_ids[i]==event.friend_id && this.list_of_friends_types[i]=='user'){
        index=i;
      }
    }
    if(index>=0){
      this.list_of_friends_types.splice(index,1);
      this.list_of_friends_ids.splice(index,1);
      this.list_of_friends_last_message.splice(index,1);
      this.list_of_friends_names.splice(index,1);
      this.list_of_friends_certifications.splice(index,1);
      this.list_of_chat_friends_ids.splice(index,1);
      this.list_of_friends_profile_pictures.splice(index,1);
      this.list_of_friends_pseudos.splice(index,1);
      this.cd.detectChanges()
    }
  }
  
  
  close_dialog(){
    this.show_chat_messages=false;
    this.show_notifications=false;
    this.dialogRef.close();
  }

  open_share() {
    this.close_dialog();
    const dialogRef = this.dialog.open(PopupShareComponent, {
      data:{type_of_profile:"account"},
      panelClass:"popupShareClass"
    });
    this.navbar.add_page_visited_to_history(`/open-share-maile/account/${this.user_id}/`,this.device_info ).subscribe();
  }
  open_contact() {
    this.close_dialog();
    const dialogRef = this.dialog.open(PopupContactComponent, {
      data:{current_user:this.current_user},
      panelClass:"popupContactComponentClass"
    });
    this.navbar.add_page_visited_to_history(`/contact-us`,this.device_info ).subscribe();
  }

  my_groups_opened:boolean = false;
  close_my_groups() {
    this.my_groups_opened = false;
  }
  open_my_groups() {
    this.my_groups_opened = true;
  }

  load_pp_group(k){
    this.pp_group_loaded[k]=true;
  }
  loading_connexion_unit=false;
  open_group(i){
   if(this.loading_connexion_unit){
     return
   }
   if(!this.list_of_account_groups_status[i]){
     const dialogRef = this.dialog.open(PopupConfirmationComponent, {
       data: {showChoice:false, text:"Connexion impossible. La création de ce groupe n'a pas encore été validée par tous ses membres."},
       panelClass: "popupConfirmationClass",
     });
     return
   }
   this.loading_connexion_unit=true;
   this.disconnecting=true;
   this.navbar.add_page_visited_to_history(`/navbar/${this.pseudo}/${this.user_id}/switch_to_group/${this.list_of_account_groups_names[i]}/${this.list_of_account_groups_ids[i]}`, this.device_info).subscribe();
   this.AuthenticationService.login_group_as_member(this.list_of_account_groups_ids[i],this.user_id).subscribe( data => {
     if(data.token){
       this.Community_recommendation.delete_recommendations_cookies();
       this.Community_recommendation.generate_recommendations().subscribe(r=>{
         this.loading_connexion_unit=false;
         this.disconnecting=false;
         this.location.go("/account/" + this.list_of_account_groups_names[i])
         location.reload();
       })
     }
     else{
       const dialogRef = this.dialog.open(PopupConfirmationComponent, {
         data: {showChoice:false, text:"Une erreur est survenue. Veuillez réessayer ultérieurement."},
         panelClass: "popupConfirmationClass",
       });
       this.loading_connexion_unit=false;
       this.disconnecting=false;
     }
   })
  }
}
