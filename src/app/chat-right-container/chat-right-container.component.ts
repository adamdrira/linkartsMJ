
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
  selector: 'app-chat-right-container',
  templateUrl: './chat-right-container.component.html',
  styleUrls: ['./chat-right-container.component.scss']
})
export class ChatRightContainerComponent implements OnInit {

  constructor(private chatService:ChatService,
    private FormBuilder:FormBuilder,
    private sanitizer:DomSanitizer,
    public dialog: MatDialog,
    public navbar: NavbarService, 
    private Profile_Edition_Service:Profile_Edition_Service,
    private cd: ChangeDetectorRef
    ) { }

  //chat_section
  @Input() id_chat_section: number;
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
  @Input() friend_pseudo: string;
  @Input() friend_name: string;
  @Input() friend_picture: SafeUrl;
  @Input() user_present: boolean;

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
    if(this.change_number>0){
      if(this.current_friend_id!=this.friend_id){
        console.log("loading new files");
        this.current_friend_id=this.friend_id;
        this.list_of_files_retrieved=false;
        this.get_files_and_pictures(this.id_chat_section);
        this.change_number=0;
      }
      if(this.current_id_chat_section!=this.id_chat_section){
        this.current_id_chat_section=this.id_chat_section;
        this.get_files_and_pictures(this.id_chat_section);
        this.change_number=0;
      }
    }
    this.change_number++;
  }

  @ViewChild('myScrollContainer') private myScrollContainer: ElementRef;
  can_get_other_files=true;
  date_of_last_file:string;
  show_scroll_files=false;
  can_get_other_pictures=true;
  date_of_last_picture:string;
  show_scroll_pictures=false;

  ngOnInit(): void {
    this.current_id_chat_section=this.id_chat_section;
    this.current_friend_id=this.friend_id;
    this.get_files_and_pictures(this.id_chat_section);

    setInterval(() => {
      if(this.panelOpenState_0||this.panelOpenState_1){
        if(this.myScrollContainer.nativeElement.scrollTop>=this.myScrollContainer.nativeElement.scrollHeight-this.myScrollContainer.nativeElement.getBoundingClientRect().height ){
          if(this.panelOpenState_0 && this.can_get_other_files){
            console.log(3);
            this.show_scroll_files=true;
            this.chatService.get_all_files(this.date_of_last_file,this.friend_id,this.id_chat_section).subscribe(r=>{
              console.log(r);
              if(r[0][0]){
                this.list_of_files=this.list_of_files.concat(r[0]);
                let length =this.list_of_files_src.length;
                console.log(r[0]);
                console.log(this.list_of_files)
                let compt=0;
                  for(let i=0;i<r[0].length;i++){
                    this.total_size_of_files[0]+=Number(r[0][i].size);
                    this.chatService.get_attachment(r[0][i].attachment_name).subscribe(t=>{
                      let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                      this.list_of_files_src[length+i]=SafeURL;
                      compt++;
                      if(compt==r[0].length){
                        this.date_of_last_file=r[0][r[0].length-1].createdAt;
                        this.show_scroll_files=false;
                        this.cd.detectChanges();
                        //this.myScrollContainer.nativeElement.scrollTop=this.myScrollContainer.nativeElement.scrollHeight-this.myScrollContainer.nativeElement.getBoundingClientRect().height
                      }
                    })
                  }
              }
              else{
                this.show_scroll_files=false;
                this.can_get_other_files=false;
              }
            })
          }

          if(this.panelOpenState_1 && this.can_get_other_pictures){
            console.log(3);
            this.show_scroll_pictures=true;
            this.chatService.get_all_pictures(this.date_of_last_picture,this.friend_id,this.id_chat_section).subscribe(r=>{
              console.log(r);
              if(r[0][0]){
                this.list_of_pictures=this.list_of_pictures.concat(r[0]);
                let length =this.list_of_pictures_src.length;
                console.log(r[0]);
                console.log(this.list_of_pictures)
                let compt=0;
                  for(let i=0;i<r[0].length;i++){
                    this.total_size_of_pictures[0]+=Number(r[0][i].size);
                    this.chatService.get_attachment(r[0][i].attachment_name).subscribe(t=>{
                      let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                      this.list_of_pictures_src[length+i]=SafeURL;
                      compt++;
                      if(compt==r[0].length){
                        this.date_of_last_picture=r[0][r[0].length-1].createdAt;
                        this.show_scroll_pictures=false;
                        this.cd.detectChanges();
                      }
                    })
                  }
              }
              else{
                this.show_scroll_pictures=false;
                this.can_get_other_pictures=false;
              }
            })
          }


          
        }
      }
      
    }, 200);

  }


  get_files_and_pictures(id_chat_section){
    this.chatService.get_all_files("now",this.friend_id,id_chat_section).subscribe(l=>{
      this.list_of_files=l[0];
      let compt=0;
      this.total_size_of_files[0]=0;
      if(l[0].length>0){
        for(let i=0;i<l[0].length;i++){
          this.total_size_of_files[0]+=Number(l[0][i].size);
          this.chatService.get_attachment(l[0][i].attachment_name).subscribe(r=>{
            let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_files_src[i]=SafeURL;
            compt++;
            if(compt==l[0].length){
              this.date_of_last_file=l[0][l[0].length-1].createdAt;
              this.list_of_files_retrieved=true;
            }
          })
        }
      }
      else{
        this.list_of_files_retrieved=true;
      }
    })

    this.chatService.get_all_pictures("now",this.friend_id,id_chat_section).subscribe(l=>{
      this.list_of_pictures=l[0];
      let compt=0;
      this.total_size_of_pictures[0]=0;
      if(l[0].length>0){
        for(let i=0;i<l[0].length;i++){
          this.total_size_of_pictures[0]+=Number(l[0][i].size);
          this.chatService.get_attachment(l[0][i].attachment_name).subscribe(r=>{
            let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_pictures_src[i]=SafeURL;
            compt++;
            if(compt==l[0].length){
              this.date_of_last_picture=l[0][l[0].length-1].createdAt;
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

}
