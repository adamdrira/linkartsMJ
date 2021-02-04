
import { Component, OnInit, Input, ElementRef, ChangeDetectorRef, ViewContainerRef, ViewChild, HostListener, SimpleChanges, ViewChildren, QueryList, Query, EventEmitter, Output } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { NavbarService } from '../services/navbar.service';
import { ChatService} from '../services/chat.service';
import { Profile_Edition_Service} from '../services/profile_edition.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ChatComponent } from '../chat/chat.component';
import { MatDialog } from '@angular/material/dialog';
import { PopupAdPicturesComponent } from '../popup-ad-pictures/popup-ad-pictures.component';
import { pattern } from '../helpers/patterns';
import { trigger, transition, style, animate } from '@angular/animations';

declare var $: any;

@Component({
  selector: 'app-chat-right-container',
  templateUrl: './chat-right-container.component.html',
  styleUrls: ['./chat-right-container.component.scss'],
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
export class ChatRightContainerComponent implements OnInit {

  constructor(private chatService:ChatService,
    private ChatComponent:ChatComponent,
    private FormBuilder:FormBuilder,
    private sanitizer:DomSanitizer,
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    public navbar: NavbarService, 
    private Profile_Edition_Service:Profile_Edition_Service,
    private cd: ChangeDetectorRef
    ) { 
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
    }

  //chat_section
  @Input() id_chat_section: number;
  @Input() chat_section_to_open: string;
  
  current_id_chat_section:number;
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
  current_friend_type:string='';
  @Input() friend_pseudo: string;
  @Input() friend_name: string;
  @Input() friend_picture: SafeUrl;
  @Input() user_present: boolean;
  @Input() chat_friend_id: number;
  @Input() friend_type: string;


  //options
  list_of_options:string[]=["Fichiers partagés", "Images partagées"];
  panelOpenState_0 = false;
  panelOpenState_1= false;
  //files
  list_of_files:any[]=[];
  list_of_files_src:any[]=[];
  list_of_files_retrieved=false;

   //pictures
   list_of_pictures:any[]=[];
   list_of_pictures_src:any[]=[];
   list_of_pictures_retrieved=false;

  //change_number
  change_number=0;

  //total size of files
  total_size_of_files:any[]=[];
  total_size_of_pictures:any[]=[];
  ngOnChanges(changes: SimpleChanges) {
    //console.log("changements right compt")
    //console.log(changes)
    if(this.change_number>0){
      if(this.current_friend_id!=this.friend_id || this.friend_type!= this.current_friend_type){
        //console.log("loading new files");
        this.current_friend_type=this.friend_type;
        this.current_friend_id=this.friend_id;
        this.list_of_files_retrieved=false;
        this.total_size_of_files=[];
        this.total_size_of_pictures=[];
       
        this.chatService.get_size_of_files(this.friend_id,this.id_chat_section,this.friend_type).subscribe(l=>{
          //console.log(l[0][0])
          this.total_size_of_files[0]=Number(l[0][0].total);
         
        })

        this.chatService.get_size_of_pictures(this.friend_id,this.id_chat_section,this.friend_type).subscribe(r=>{
          //console.log(r[0][0])
          this.total_size_of_pictures[0]=Number(r[0][0].total);
          //this.get_files_and_pictures(this.id_chat_section);
        })
        this.get_files_and_pictures(this.id_chat_section);
        this.change_number=0;
      }
      if(this.current_id_chat_section!=this.id_chat_section){
        //console.log(this.total_size_of_files)
        this.total_size_of_files=[];
        this.total_size_of_pictures=[];
        this.current_id_chat_section=this.id_chat_section;
        this.chatService.get_size_of_files(this.friend_id,this.id_chat_section,this.friend_type).subscribe(l=>{
          //console.log(Number(l[0][0].total))
          this.total_size_of_files[0]=Number(l[0][0].total);
         
        })
        this.chatService.get_size_of_pictures(this.friend_id,this.id_chat_section,this.friend_type).subscribe(r=>{
          //console.log(r[0][0])
          this.total_size_of_pictures[0]=Number(r[0][0].total);
          //this.get_files_and_pictures(this.id_chat_section);
        })
        this.get_files_and_pictures(this.id_chat_section);
        this.change_number=0;
      }
    }
    this.change_number++;
  }

  @ViewChild('myScrollContainer') private myScrollContainer: ElementRef;
  can_get_other_files=false;
  date_of_last_file:string;
  show_scroll_files=false;
  can_get_other_pictures=false;
  date_of_last_picture:string;
  show_scroll_pictures=false;

  ngOnInit(): void {
    let THIS=this;
    this.createFormAd();

    this.current_friend_type=this.friend_type;
    this.current_id_chat_section=this.id_chat_section;
    this.current_friend_id=this.friend_id;
    this.chatService.get_size_of_files(this.friend_id,this.id_chat_section,this.friend_type).subscribe(l=>{
      //console.log(l[0][0])
      this.total_size_of_files[0]=Number(l[0][0].total);
      
    })
    this.chatService.get_size_of_pictures(this.friend_id,this.id_chat_section,this.friend_type).subscribe(r=>{
      //console.log(r[0][0])
      this.total_size_of_pictures[0]=Number(r[0][0].total);
      
    })
    this.get_files_and_pictures(this.id_chat_section);

    setInterval(() => {
      if(this.panelOpenState_0||this.panelOpenState_1){
        if(this.myScrollContainer.nativeElement.scrollTop>=(this.myScrollContainer.nativeElement.scrollHeight-this.myScrollContainer.nativeElement.getBoundingClientRect().height)*0.7 ){
          if(this.panelOpenState_0 && this.can_get_other_files){
            //console.log(3);
            this.show_scroll_files=true;
            this.chatService.get_all_files(this.date_of_last_file,this.friend_id,this.id_chat_section,this.friend_type).subscribe(r=>{
              //console.log(r);
              if(r[0][0]){
                this.list_of_files=this.list_of_files.concat(r[0]);
                let length =this.list_of_files_src.length;
                //console.log(r[0]);
                //console.log(this.list_of_files)
                let compt=0;
                  for(let i=0;i<r[0].length;i++){
                    //this.total_size_of_files[0]+=Number(r[0][i].size);
                    this.chatService.get_attachment(r[0][i].attachment_name,(this.friend_type=='user')?'user':'group',this.chat_friend_id).subscribe(t=>{
                      let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                      this.list_of_files_src[length+i]=SafeURL;
                      compt++;
                      if(compt==r[0].length){
                        this.date_of_last_file=r[0][r[0].length-1].createdAt;
                        this.show_scroll_files=false;
                        if(compt<14){
                          this.can_get_other_files=false;
                        }
                        this.cd.detectChanges();
                        //this.myScrollContainer.nativeElement.scrollTop=this.myScrollContainer.nativeElement.scrollHeight-this.myScrollContainer.nativeElement.getBoundingClientRect().height
                      }
                    })
                  }
              }
              else{
                this.can_get_other_files=false;
                this.show_scroll_files=false;
                this.can_get_other_files=false;
              }
            })
          }

          if(this.panelOpenState_1 && this.can_get_other_pictures){
            //console.log(3);
            this.show_scroll_pictures=true;
            this.chatService.get_all_pictures(this.date_of_last_picture,this.friend_id,this.id_chat_section,this.friend_type).subscribe(r=>{
              //console.log(r);
              if(r[0][0]){
                this.list_of_pictures=this.list_of_pictures.concat(r[0]);
                let length =this.list_of_pictures_src.length;
                //console.log(r[0]);
                //console.log(this.list_of_pictures)
                let compt=0;
                  for(let i=0;i<r[0].length;i++){
                    //this.total_size_of_pictures[0]+=Number(r[0][i].size);
                    this.chatService.get_attachment(r[0][i].attachment_name,(this.friend_type=='user')?'user':'group',this.chat_friend_id).subscribe(t=>{
                      let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                      this.list_of_pictures_src[length+i]=SafeURL;
                      compt++;
                      if(compt==r[0].length){
                        this.date_of_last_picture=r[0][r[0].length-1].createdAt;
                        this.show_scroll_pictures=false;
                        if(compt<14){
                          this.can_get_other_pictures=false;
                        }
                        this.cd.detectChanges();
                      }
                    })
                  }
              }
              else{
                this.can_get_other_pictures=false;
                this.show_scroll_pictures=false;
                this.can_get_other_pictures=false;
              }
            })
          }


          
        }
      }
      
    }, 200);


    this.ChatComponent.reload_list_of_files.subscribe(m=>{
      if(m){
        this.list_of_files_retrieved=false;
        this.list_of_pictures_retrieved=false;
        this.list_of_files_src=[];
        this.list_of_pictures_src=[];
        this.chatService.get_size_of_files(this.friend_id,this.id_chat_section,this.friend_type).subscribe(l=>{
          //console.log(l[0][0])
          this.total_size_of_files[0]=Number(l[0][0].total);
          
        })
        this.chatService.get_size_of_pictures(this.friend_id,this.id_chat_section,this.friend_type).subscribe(r=>{
          //console.log(r[0][0])
          this.total_size_of_pictures[0]=Number(r[0][0].total);
         
        })
        this.get_files_and_pictures(this.id_chat_section);
      }
    })
  }

  show_icon=false;
  

  get_files_and_pictures(id_chat_section){
    //console.log("get_files_and_pictures")
    this.chatService.get_all_files("now",this.friend_id,id_chat_section,this.friend_type).subscribe(l=>{
      this.list_of_files=l[0];
      let compt=0;
      //this.total_size_of_files[0]=0;
      if(l[0].length>0){
        for(let i=0;i<l[0].length;i++){
          //this.total_size_of_files[0]+=Number(l[0][i].size);
          this.chatService.get_attachment(l[0][i].attachment_name,(this.friend_type=='user')?'user':'group',this.chat_friend_id).subscribe(r=>{
            let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_files_src[i]=SafeURL;
            compt++;
            if(compt==l[0].length){
              this.date_of_last_file=l[0][l[0].length-1].createdAt;
              if(compt>=14){
                this.can_get_other_files=true
              }
              this.list_of_files_retrieved=true;
            }
          })
        }
      }
      else{
        this.list_of_files_retrieved=true;
      }
    })

    this.chatService.get_all_pictures("now",this.friend_id,id_chat_section,this.friend_type).subscribe(l=>{
      this.list_of_pictures=l[0];
      let compt=0;
      //this.total_size_of_pictures[0]=0;
      if(l[0].length>0){
        for(let i=0;i<l[0].length;i++){
          //this.total_size_of_pictures[0]+=Number(l[0][i].size);
          this.chatService.get_attachment(l[0][i].attachment_name,(this.friend_type=='user')?'user':'group',this.chat_friend_id).subscribe(r=>{
            let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_pictures_src[i]=SafeURL;
            compt++;
            if(compt==l[0].length){
              this.date_of_last_picture=l[0][l[0].length-1].createdAt;
              if(compt>=14){
                this.can_get_other_pictures=true
              }
              this.list_of_pictures_retrieved=true;
            }
          })
        }
      }
      else{
        this.list_of_pictures_retrieved=true;
      }
    })
  }

  get_src_file(i){
    
  }

  /********************************************************loading thumbnails************* */
  /********************************************************loading thumbnails************* */
  /********************************************************loading thumbnails************* */

  pp_is_laoded=false;
  pp_loaded(){
    this.pp_is_laoded=true;
  }

  list_of_images_loaded=[];
  image_loaded(i){
    this.list_of_images_loaded[i]=true;
  }



  /********************************************* SHOW IMAGES *****************************************/
  /********************************************* SHOW IMAGES *****************************************/
  /********************************************* SHOW IMAGES *****************************************/

  show_images(indice){
    //console.log(indice)
    //console.log(this.list_of_pictures)
    const dialogRef = this.dialog.open(PopupAdPicturesComponent, {
      data: {list_of_pictures:this.list_of_pictures_src,index_of_picture:indice},      
      panelClass:"popupDocumentClass",
    });
  }



  
  @Input() list_of_chat_sections: any;
  @Input() list_of_chat_sections_notifications: any;
  @Input() number_of_sections_unseen: number;
  @Input() activate_add_chat_section: boolean;
  @Input() show_notification_message: boolean;
  
  @Output() addChatSection = new EventEmitter<any>();
  @Output() addChatSectionName = new EventEmitter<any>();
  @Output() deletedChatSection = new EventEmitter<any>();
  @Output() cancelAddSection = new EventEmitter<any>();
  @Output() changeSection = new EventEmitter<any>();

  @Output() arrowBack = new EventEmitter<any>();
  
  chat_section_name_added: FormControl;
  chat_section_group:FormGroup;

  add_chat_section() {
    this.addChatSection.emit();
  }
  delete_chat_section() {
    this.deletedChatSection.emit();
  }
  add_chat_section_name() {
    this.addChatSectionName.emit( this.chat_section_group.value.chat_section_name_added );
    this.chat_section_group.reset();
  }
  cancel_add_section() {
    this.chat_section_group.reset();
    this.cancelAddSection.emit();
  }
  change_section(e:any) {
    this.changeSection.emit( e );
  }


  createFormAd() {
    this.chat_section_group = this.formBuilder.group({
      chat_section_name_added: ['',
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern(pattern("text")),
        ]),
      ],
    });
  }

  arrow_back() {
    this.arrowBack.emit();
  }
}
