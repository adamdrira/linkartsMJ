import { Component, OnInit, Renderer2,  ChangeDetectorRef,  Inject } from '@angular/core';
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
  selector: 'app-popup-subscribings',
  templateUrl: './popup-subscribings.component.html',
  styleUrls: ['./popup-subscribings.component.scss'],
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
export class PopupSubscribingsComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PopupSubscribingsComponent>,
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

  list_of_subscribings=this.data.subscribings;
  list_of_subscribings_information:any[]=[];
  list_of_check_subscribtion:any[]=[];
  list_of_profile_pictures:SafeUrl[]=[];
  subscribtion_info_added=false;
  type_of_profile=this.data.type_of_profile;
  visitor_id=this.data.visitor_id;
  author_id=this.data.author_id;
  visitor_name=this.data.visitor_name;
  show_icon=false;
  ngOnInit() {
    let n=this.list_of_subscribings.length;
    let compt=0;
    if(n>0){
      for (let i=0;i<n;i++){

        let  sub_retrieved=false;
        let data_retrieved=false;

        this.Profile_Edition_Service.retrieve_profile_data(this.list_of_subscribings[i].id_user_subscribed_to).subscribe(r=>{
          this.list_of_subscribings_information[i]=r[0];
          console.log("user info")
          console.log(this.list_of_subscribings_information)
          data_retrieved=true;
          check_all(this);
        })
        this.Subscribing_service.check_if_susbcribed_to_visitor(this.list_of_subscribings[i].id_user_subscribed_to).subscribe(information=>{
          console.log("res check")
          console.log(information)
          console.log(this.list_of_subscribings[i])
          if(information[0].value){
            this.list_of_check_subscribtion[i]=true;
          }
          else{
            this.list_of_check_subscribtion[i]=false;
          }
          sub_retrieved=true;
          check_all(this);
          
        });

        this.list_of_profile_pictures[i]=null;
        this.Profile_Edition_Service.retrieve_profile_picture(this.list_of_subscribings[i].id_user_subscribed_to).subscribe(r=> {
          let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
          const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
          this.list_of_profile_pictures[i] = SafeURL;
          
        });

        function check_all(THIS){
          if(sub_retrieved && data_retrieved){
            compt++;
            if(compt==n){
              THIS.subscribtion_info_added=true;
              THIS.cd.detectChanges()
            }
          }
        }
        
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
          this.Subscribing_service.subscribe_to_a_user(this.list_of_subscribings_information[i].id).subscribe(information=>{
            if(information[0].subscribtion){
              
              this.loading_subscribtion=false;
              this.cd.detectChanges();
            }
            else{
              this.NotificationsService.add_notification('subscribtion',this.data.visitor_id,this.data.visitor_name,this.list_of_subscribings_information[i].id,this.list_of_subscribings_information[i].id.toString(),'none','none',this.data.visitor_id,0,"add",false,0).subscribe(l=>{
                let message_to_send ={
                  for_notifications:true,
                  type:"subscribtion",
                  id_user_name:this.data.visitor_name,
                  id_user:this.data.visitor_id, 
                  id_receiver:this.list_of_subscribings_information[i].id,
                  publication_category:this.list_of_subscribings_information[i].id.toString(),
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
          this.Subscribing_service.remove_subscribtion(this.list_of_subscribings_information[i].id).subscribe(information=>{
            this.NotificationsService.remove_notification('subscribtion',this.list_of_subscribings_information[i].id.toString(),'none',this.data.visitor_id,0,false,0).subscribe(l=>{
              let message_to_send ={
                for_notifications:true,
                type:"subscribtion",
                id_user_name:this.data.visitor_name,
                id_user:this.data.visitor_id, 
                id_receiver:this.list_of_subscribings_information[i].id,
                publication_category:this.list_of_subscribings_information[i].id.toString(),
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


  pp_is_loaded=[];
  load_pp(i){
    this.pp_is_loaded[i]=true;
  }
  get_user_link(i:number) {
    return "/account/"+ this.list_of_subscribings_information[i].nickname +"/"+ this.list_of_subscribings_information[i].id;
  }
  close_dialog() {
    this.dialogRef.close();
  }

}
