import { Component, OnInit, Renderer2, ChangeDetectorRef, Inject, ViewChild, ElementRef } from '@angular/core';


import { NotificationsService } from '../services/notifications.service';
import { ChatService } from '../services/chat.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Subscribing_service } from '../services/subscribing.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';
import { NavbarService } from '../services/navbar.service';


@Component({
  selector: 'app-popup-subscribers',
  templateUrl: './popup-subscribers.component.html',
  styleUrls: ['./popup-subscribers.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateY(0)', opacity: 0}),
          animate('400ms', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ]
    ),
  ],
})
export class PopupSubscribersComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PopupSubscribersComponent>,
    private cd:ChangeDetectorRef,
    private NotificationsService:NotificationsService,
    private chatService:ChatService,
    private sanitizer:DomSanitizer,
    private Subscribing_service:Subscribing_service,
    public dialog: MatDialog,
    private Profile_Edition_Service:Profile_Edition_Service,
    private navbar: NavbarService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
  }

  list_of_subscribers=this.data.subscribers;
  list_of_subscribers_information:any[]=[];
  list_of_check_subscribtion:any[]=[];
  list_of_profile_pictures:SafeUrl[]=[];
  subscribtion_info_added=false;
  type_of_profile=this.data.type_of_profile;
  visitor_id=this.data.visitor_id;
  visitor_name=this.data.visitor_name;
  author_gender=this.data.author_gender;
  show_icon=false;

  list_of_data_retrieved=[];
  list_of_sub_retrieved=[];
  list_of_all_retrieved=[];
  first_check=false;
  number_of_subs_to_show=10;
  @ViewChild('myScrollContainer') private myScrollContainer: ElementRef;
  ngOnInit() {
    let n=this.list_of_subscribers.length;
    let compt=0;
    if(n>0){
      for (let i=0;i<n;i++){
        this.Profile_Edition_Service.retrieve_profile_data(this.list_of_subscribers[i].id_user).subscribe(r=>{
          this.list_of_subscribers_information[i]=r[0];
          this.list_of_data_retrieved[i]=true;
          check_all(this,i)
        })

        this.Subscribing_service.check_if_visitor_susbcribed(this.list_of_subscribers[i].id_user).subscribe(information=>{
          if(information[0].value){
            this.list_of_check_subscribtion[i]=true;
          }
          else{
            this.list_of_check_subscribtion[i]=false;
          }
          this.list_of_sub_retrieved[i]=true;
          check_all(this,i);
        });
        this.Profile_Edition_Service.retrieve_profile_picture( this.list_of_subscribers[i].id_user).subscribe(r=> {
          let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
          const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
          this.list_of_profile_pictures[i] = SafeURL;
        });
        function check_all(THIS,i){
          if(THIS.list_of_data_retrieved[i] && THIS.list_of_sub_retrieved[i]){
            compt++;
            THIS.list_of_all_retrieved[i]=true;
            if(THIS.list_of_subscribers.length>10){
              let compt1 =0
              for(let j=0;j<10;j++){
                if(THIS.list_of_all_retrieved[j]){
                  compt1++;
                }
              }
              if(compt1==10){
                THIS.first_check=true;
              }
            }
          
            if(compt==n){
              THIS.subscribtion_info_added=true;
              THIS.first_check=true;
              THIS.cd.detectChanges()
            }
          }
        }
        
      }
    }
  }

  loading_more=false
  onScroll(){
    if(!this.loading_more && this.number_of_subs_to_show<this.list_of_subscribers.length && this.myScrollContainer.nativeElement.scrollTop + this.myScrollContainer.nativeElement.offsetHeight >= this.myScrollContainer.nativeElement.scrollHeight*0.7){
      let len = this.list_of_subscribers.length - this.number_of_subs_to_show;
      let see_more=false;
      this.loading_more=true;
      if(len>10){
        let compt =0
        for(let i=0;i<10;i++){           
          if(this.list_of_all_retrieved[ this.number_of_subs_to_show +i]){
            compt++;
          }
        }
        if(compt==10){
          see_more=true;
        }
      }
      else{
        let compt =0
        for(let i=0;i<len;i++){
          if(this.list_of_all_retrieved[ this.number_of_subs_to_show +i]){
            compt++;
          }
        }
        if(compt==len){
          see_more=true;
        }
      }
      if(  see_more ){
        this.number_of_subs_to_show+=10;
        this.loading_more=false;
        this.cd.detectChanges();
      }
      else{
        let pause = setInterval(()=>{
          this.loading_more=false;
          this.onScroll()
          clearInterval(pause)
        },1000)
      }

    }
  }

  loading_subscribtion=false;
  
  subscribtion(i){
    if(this.data.type_of_profile=='account'){
      if(!this.loading_subscribtion){
        this.loading_subscribtion=true;
        if(!this.list_of_check_subscribtion[i]){
          this.list_of_check_subscribtion[i]=true;
          this.Subscribing_service.subscribe_to_a_user(this.list_of_subscribers_information[i].id).subscribe(information=>{
            if(information[0].subscribtion){
              this.loading_subscribtion=false;
              this.cd.detectChanges();
            }
            else{
              this.NotificationsService.add_notification('subscribtion',this.data.visitor_id,this.data.visitor_name,this.list_of_subscribers_information[i].id,this.list_of_subscribers_information[i].id.toString(),'none','none',this.data.visitor_id,0,"add",false,0).subscribe(l=>{
                let message_to_send ={
                  for_notifications:true,
                  type:"subscribtion",
                  id_user_name:this.data.visitor_name,
                  id_user:this.data.visitor_id, 
                  id_receiver:this.list_of_subscribers_information[i].id,
                  publication_category:this.list_of_subscribers_information[i].id.toString(),
                  publication_name:'none',
                  format:'none',
                  publication_id:this.data.visitor_id,
                  chapter_number:0,
                  information:"add",
                  status:"unchecked",
                  is_comment_answer:false,
                  comment_id:0,
                }
                this.loading_subscribtion=false;
                this.chatService.messages.next(message_to_send);
                this.cd.detectChanges();
              })
            }
           
          });
        }
        else{
          this.list_of_check_subscribtion[i]=false;
          this.Subscribing_service.remove_subscribtion(this.list_of_subscribers_information[i].id).subscribe(information=>{
            this.NotificationsService.remove_notification('subscribtion',this.list_of_subscribers_information[i].id.toString(),'none',this.data.visitor_id,0,false,0).subscribe(l=>{
              let message_to_send ={
                for_notifications:true,
                type:"subscribtion",
                id_user_name:this.data.visitor_name,
                id_user:this.data.visitor_id, 
                id_receiver:this.list_of_subscribers_information[i].id,
                publication_category:this.list_of_subscribers_information[i].id.toString(),
                publication_name:'none',
                format:'none',
                publication_id:this.data.visitor_id,
                chapter_number:0,
                information:"remove",
                status:"unchecked",
                is_comment_answer:false,
                comment_id:0,
              }
              this.loading_subscribtion=false;
              this.chatService.messages.next(message_to_send);
              this.cd.detectChanges();
            })
          });
        }
      }
    }
    else{
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Vous devez avoir un compte Linkarts pour pouvoir vous abonner'},
        panelClass: "popupConfirmationClass",
      });
    }
  }

  get_user_link(i:number) {
    if(this.list_of_subscribers_information[i]){
      return "/account/"+ this.list_of_subscribers_information[i].nickname ;
    }
    return false
  }
  pp_is_loaded=[];
  load_pp(i){
    this.pp_is_loaded[i]=true;
  }
  close_dialog() {
    this.dialogRef.close();
  }
}
