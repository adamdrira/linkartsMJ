
import { Component, OnInit, Input, ElementRef, ChangeDetectorRef, ViewChild, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { NavbarService } from '../services/navbar.service';
import { ChatService} from '../services/chat.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ChatComponent } from '../chat/chat.component';
import { MatDialog } from '@angular/material/dialog';
import { PopupAdPicturesComponent } from '../popup-ad-pictures/popup-ad-pictures.component';
import { pattern } from '../helpers/patterns';
import { trigger, transition, style, animate } from '@angular/animations';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';


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
    private sanitizer:DomSanitizer,
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    public navbar: NavbarService, 
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
  list_of_options:string[]=["Fichiers partagés", "Images partagées","Mes Archives"];
  panelOpenState_0 = false;
  panelOpenState_1= false;
  panelOpenState_2=false;
  //files
  list_of_files:any[]=[];
  list_of_files_src:any[]=[];
  list_of_files_retrieved=false;

   //pictures
   list_of_pictures:any[]=[];
   list_of_pictures_src:any[]=[];
   list_of_pictures_names=[];
   list_of_pictures_retrieved=false;

   //archives

  
  //change_number
  change_number=0;

  //total size of files
  total_size_of_files:any[]=[];
  total_size_of_pictures:any[]=[];
  ngOnChanges(changes: SimpleChanges) {
    if(this.change_number>0){
      if(this.current_friend_id!=this.friend_id || this.friend_type!= this.current_friend_type){
        this.current_friend_type=this.friend_type;
        this.current_friend_id=this.friend_id;
        this.list_of_files_retrieved=false;
        this.total_size_of_files=[];
        this.total_size_of_pictures=[];
       
        this.chatService.get_size_of_files(this.friend_id,this.id_chat_section,this.friend_type).subscribe(l=>{
          this.total_size_of_files[0]=Number(l[0][0].total);
         
        })

        this.chatService.get_size_of_pictures(this.friend_id,this.id_chat_section,this.friend_type).subscribe(r=>{
          this.total_size_of_pictures[0]=Number(r[0][0].total);
        })
        this.get_archives_folders();
        this.get_files_and_pictures(this.id_chat_section);
        this.change_number=0;
      }
      if(this.current_id_chat_section!=this.id_chat_section){
        this.total_size_of_files=[];
        this.total_size_of_pictures=[];
        this.current_id_chat_section=this.id_chat_section;
        this.chatService.get_size_of_files(this.friend_id,this.id_chat_section,this.friend_type).subscribe(l=>{
          this.total_size_of_files[0]=Number(l[0][0].total);
         
        })
        this.chatService.get_size_of_pictures(this.friend_id,this.id_chat_section,this.friend_type).subscribe(r=>{
          this.total_size_of_pictures[0]=Number(r[0][0].total);
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

  show_scroll_archives=false;
  ngOnInit(): void {
    this.createFormAd();
    this.createFormAd_archives();
    
    this.current_friend_type=this.friend_type;
    this.current_id_chat_section=this.id_chat_section;
    this.current_friend_id=this.friend_id;
    
    this.chatService.get_size_of_files(this.friend_id,this.id_chat_section,this.friend_type).subscribe(l=>{
      this.total_size_of_files[0]=Number(l[0][0].total);
      
    })
    this.chatService.get_size_of_pictures(this.friend_id,this.id_chat_section,this.friend_type).subscribe(r=>{
      this.total_size_of_pictures[0]=Number(r[0][0].total);
      
    })
    this.get_files_and_pictures(this.id_chat_section);

    this.ChatComponent.reload_list_of_files.subscribe(m=>{
      if(m){
        this.list_of_files_retrieved=false;
        this.list_of_pictures_retrieved=false;
        this.list_of_files_src=[];
        this.list_of_pictures_src=[];
        this.chatService.get_size_of_files(this.friend_id,this.id_chat_section,this.friend_type).subscribe(l=>{
          this.total_size_of_files[0]=Number(l[0][0].total);
          
        })
        this.chatService.get_size_of_pictures(this.friend_id,this.id_chat_section,this.friend_type).subscribe(r=>{
          this.total_size_of_pictures[0]=Number(r[0][0].total);
         
        })
        this.get_files_and_pictures(this.id_chat_section);
      }
    })


    this.ChatComponent.reload_list_of_archives.subscribe(event=>{
      if(event.reload){
        this.list_of_folders_retrieved=false;
        this.chatService.get_chat_folders(this.chat_friend_id).subscribe(r=>{
          if(r[0] && r[0].length>0){
            this.list_of_folders=r[0];
          }
          this.folders_emitter.emit({folders:this.list_of_folders});
          this.list_of_folders_retrieved=true;
          if(event.add){
            let index =this.list_of_folders.findIndex(x => x.id==event.id_folder)
            this.list_of_folders[index].number_of_files+=1;
          }
          if(event.remove){
            let index =this.list_of_folders.findIndex(x => x.id==event.id_folder)
            this.list_of_folders[index].number_of_files-=1;
          }
          this.cd.detectChanges()
        })
        this.list_of_folders_opened=[];
        this.show_files_of_folder=[];
        this.list_of_files_retrieved_by_folder=[];
        this.list_of_files_loading=[];

        
        
      }
    })

    this.get_archives_folders();
  }


  OnScroll(){
    
    if(this.panelOpenState_0||this.panelOpenState_1 || this.panelOpenState_2){
      if(this.myScrollContainer.nativeElement.scrollTop>=(this.myScrollContainer.nativeElement.scrollHeight-this.myScrollContainer.nativeElement.getBoundingClientRect().height)*0.8 -100 ){
        if(this.panelOpenState_0 && this.can_get_other_files && !this.show_scroll_files){
          this.show_scroll_files=true;
          this.chatService.get_all_files(this.date_of_last_file,this.friend_id,this.id_chat_section,this.friend_type).subscribe(r=>{
            if(r[0][0]){
              this.list_of_files=this.list_of_files.concat(r[0]);
              let length =this.list_of_files_src.length;
              let compt=0;
                for(let i=0;i<r[0].length;i++){
                  this.chatService.get_attachment_popup(r[0][i].attachment_name,(this.friend_type=='user')?'user':'group',this.chat_friend_id).subscribe(t=>{
                    let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                    const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                    this.list_of_files_src[length+i]=SafeURL;
                    compt++;
                    if(compt==r[0].length){
                      this.date_of_last_file=r[0][r[0].length-1].createdAt;
                      this.show_scroll_files=false;
                      if(compt<15){
                        this.can_get_other_files=false;
                      }
                      this.cd.detectChanges();
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

        if(this.panelOpenState_1 && this.can_get_other_pictures && !this.show_scroll_pictures){
          this.show_scroll_pictures=true;
          this.chatService.get_all_pictures(this.date_of_last_picture,this.friend_id,this.id_chat_section,this.friend_type).subscribe(r=>{

            if(r[0][0]){
              this.list_of_pictures=this.list_of_pictures.concat(r[0]);
              let length =this.list_of_pictures_src.length;
              let compt=0;
              var re = /(?:\.([^.]+))?$/;
              for(let i=0;i<r[0].length;i++){
                if(re.exec(r[0][i].attachment_name)[1].toLowerCase()=="svg"){
                  this.chatService.get_attachment_popup(r[0][i].attachment_name,(this.friend_type=='user')?'user':'group',this.chat_friend_id).subscribe(r=>{ 
                    let THIS=this;
                    var reader = new FileReader()
                    reader.readAsText(r);
                    reader.onload = function(this) {
                        let blob = new Blob([reader.result], {type: 'image/svg+xml'});
                        let url = (window.URL) ? window.URL.createObjectURL(blob) : (window as any).webkitURL.createObjectURL(blob);
                        let SafeURL = THIS.sanitizer.bypassSecurityTrustUrl(url);
                        THIS.list_of_pictures_src[length+i]=SafeURL;
                        THIS.list_of_pictures_names[length+i]=r[0][i].attachment_name
                        compt++;
                        if(compt==r[0].length){
                          THIS.date_of_last_picture=r[0][r[0].length-1].createdAt;
                          THIS.show_scroll_pictures=false;
                          if(compt<15){
                            THIS.can_get_other_pictures=false;
                          }
                          THIS.cd.detectChanges();
                        }
                    }
      
                  })
                }
                else{
                  this.chatService.get_attachment_right(r[0][i].attachment_name,(this.friend_type=='user')?'user':'group',this.chat_friend_id).subscribe(t=>{
                    let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                    const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                    this.list_of_pictures_src[length+i]=SafeURL;
                    this.list_of_pictures_names[length+i]=r[0][i].attachment_name
                    compt++;
                    if(compt==r[0].length){
                      this.date_of_last_picture=r[0][r[0].length-1].createdAt;
                      this.show_scroll_pictures=false;
                      if(compt<15){
                        this.can_get_other_pictures=false;
                      }
                      this.cd.detectChanges();
                    }
                  })
                }
                
              }
            }
            else{
              this.can_get_other_pictures=false;
              this.show_scroll_pictures=false;
              this.can_get_other_pictures=false;
            }
          })
        }

        if(this.panelOpenState_2 && !this.show_scroll_archives && this.show_files_of_folder.findIndex(x => x)>=0){

          let index=this.show_files_of_folder.findIndex(x => x);
          if(this.can_get_other_files_from_archive[index]){
            this.show_scroll_archives=true;
            this.offset_by_folder[index]+=15;
            let length =this.list_of_files_object_by_folder[index].length;
            var re = /(?:\.([^.]+))?$/;
            this.chatService.get_files_by_folder(this.list_of_folders[index].id,this.offset_by_folder[index]).subscribe(m=>{
              let r=[]
              if(m[0].messages && m[0].messages.length>0){
                r[0]=m[0].messages;
                let compt=0;
                for(let i=0;i<r[0].length;i++){
                  this.list_of_files_object_by_folder[index][i+length]=r[0][i];
                  if((re.exec(r[0][i].attachment_name)[1].toLowerCase()=="svg" && r[0][i].attachment_type=="picture_attachment") || r[0][i].attachment_type=="file_attachment" ){
                    this.chatService.get_attachment_popup(r[0][i].attachment_name,(this.friend_type=='user')?'user':'group',this.chat_friend_id).subscribe(t=>{ 
                      let THIS=this;
                      if(re.exec(r[0][i].attachment_name)[1].toLowerCase()=="svg"){
                        var reader = new FileReader()
                        reader.readAsText(t);
                        reader.onload = function(this) {
                            let blob = new Blob([reader.result], {type: 'image/svg+xml'});
                            let url = (window.URL) ? window.URL.createObjectURL(blob) : (window as any).webkitURL.createObjectURL(blob);
                            let SafeURL = THIS.sanitizer.bypassSecurityTrustUrl(url);
                            THIS.list_of_files_by_folder[index][i+length]=SafeURL;
                            THIS.list_of_files_types_by_folder[index][i+length]="picture_attachment";
                            THIS.list_of_files_names_by_folder[index][i+length]=r[0][i].attachment_name
                            compt++;
                            if(compt==r[0].length){
                              THIS.show_scroll_archives=false;
                              if(compt<15){
                                THIS.can_get_other_files_from_archive[index]=false;
                              }
                              THIS.cd.detectChanges();
                            }
                        }
                      }
                      else{
                        let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                        this.list_of_files_by_folder[index][i+length]=SafeURL;
                        this.list_of_files_types_by_folder[index][i+length]="file_attachment";
                        this.list_of_files_names_by_folder[index][i+length]=r[0][i].attachment_name
                        compt++;
                        if(compt==r[0].length){
                          this.show_scroll_archives=false;
                          if(compt<15){
                            this.can_get_other_files_from_archive[index]=false;
                          }
                          this.cd.detectChanges();
                        }
                      }
                      
        
                    })
                  }
                  else if(r[0][i].attachment_type=="picture_attachment" && re.exec(r[0][i].attachment_name)[1].toLowerCase()!="svg"){
                    this.chatService.get_attachment_right(r[0][i].attachment_name,(this.friend_type=='user')?'user':'group',this.chat_friend_id).subscribe(t=>{
                      let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                      this.list_of_files_by_folder[index][i+length]=SafeURL;
                      this.list_of_files_types_by_folder[index][i+length]="picture_attachment";
                      this.list_of_files_names_by_folder[index][i+length]=r[0][i].attachment_name
                      compt++;
                      if(compt==r[0].length){
                        this.show_scroll_archives=false;
                        if(compt<15){
                          this.can_get_other_files_from_archive[index]=false;
                        }
                        this.cd.detectChanges();
                      }
                    })
                  }
                  else{
                    this.chatService.get_picture_sent_by_msg(r[0][i].attachment_name).subscribe(t=>{
                      let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                      this.list_of_files_by_folder[index][i+length]=SafeURL;
                      this.list_of_files_types_by_folder[index][i+length]="picture_attachment";
                      this.list_of_files_names_by_folder[index][i+length]=r[0][i].attachment_name
                      compt++;
                      if(compt==r[0].length){
                        this.show_scroll_archives=false;
                        if(compt<15){
                          this.can_get_other_files_from_archive[index]=false;
                        }
                        this.cd.detectChanges();
                      }
                    })
                  }
                  
                }
              }
              
              else{
                this.list_of_files_retrieved_by_folder[index]=true;
                this.show_files_of_folder[index]=true;
                this.list_of_files_loading[index]=false;
              }
             
            })
          }
          
        }
        
      }
    }
  }

  show_icon=false;
  

  get_files_and_pictures(id_chat_section){
    this.chatService.get_all_files("now",this.friend_id,id_chat_section,this.friend_type).subscribe(l=>{
      this.list_of_files=l[0];
      let compt=0;
      if(l[0].length>0){
        for(let i=0;i<l[0].length;i++){
          this.chatService.get_attachment_popup(l[0][i].attachment_name,(this.friend_type=='user')?'user':'group',this.chat_friend_id).subscribe(r=>{
            let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_files_src[i]=SafeURL;
            
            compt++;
            if(compt==l[0].length){
              this.date_of_last_file=l[0][l[0].length-1].createdAt;
              if(compt>=15){
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
      var re = /(?:\.([^.]+))?$/;
      if(l[0].length>0){
        for(let i=0;i<l[0].length;i++){

          if(re.exec(l[0][i].attachment_name)[1].toLowerCase()=="svg"){
            this.chatService.get_attachment_popup(l[0][i].attachment_name,(this.friend_type=='user')?'user':'group',this.chat_friend_id).subscribe(r=>{
              
              let THIS=this;
              var reader = new FileReader()
              reader.readAsText(r);
              reader.onload = function(this) {
                  let blob = new Blob([reader.result], {type: 'image/svg+xml'});
                  let url = (window.URL) ? window.URL.createObjectURL(blob) : (window as any).webkitURL.createObjectURL(blob);
                  let SafeURL = THIS.sanitizer.bypassSecurityTrustUrl(url);
                  THIS.list_of_pictures_src[i]=SafeURL;
                  THIS.list_of_pictures_names[i]=l[0][i].attachment_name;
                  compt++;
                  if(compt==l[0].length){
                    THIS.date_of_last_picture=l[0][l[0].length-1].createdAt;
                    if(compt>=15){
                      THIS.can_get_other_pictures=true
                    }
                    THIS.list_of_pictures_retrieved=true;
                  }
              }

            })
          }
          else{
            this.chatService.get_attachment_right(l[0][i].attachment_name,(this.friend_type=='user')?'user':'group',this.chat_friend_id).subscribe(r=>{
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_pictures_src[i]=SafeURL;
              this.list_of_pictures_names[i]=l[0][i].attachment_name;
              compt++;
              if(compt==l[0].length){
                this.date_of_last_picture=l[0][l[0].length-1].createdAt;
                if(compt>=15){
                  this.can_get_other_pictures=true
                }
                this.list_of_pictures_retrieved=true;
              }
            })
          }
         
        }
      }
      else{
        this.list_of_pictures_retrieved=true;
      }
    })
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
    let list_of_pics=[];
    let new_list_types=Array(15).fill("picture_attachment");
    if(indice<=7){
      list_of_pics=this.list_of_pictures_names.slice(0,15)
    }
    else{
      list_of_pics=this.list_of_pictures_names.slice(indice-7,indice+7)
    }
    const dialogRef = this.dialog.open(PopupAdPicturesComponent, {
      data: {
        list_of_pictures:list_of_pics,
        list_of_types:new_list_types,
        index_of_picture:indice,
        for_chat:true,
        friend_type:(this.friend_type=='user')?'user':'group',
        chat_friend_id:this.chat_friend_id
      },      
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
  @Output() folders_emitter = new EventEmitter<any>();
  
  
  chat_section_name_added: FormControl;
  chat_section_name_added_archives: FormControl;
  chat_section_group:FormGroup;
  chat_section_group_archives:FormGroup;
 

  add_chat_section() {
    this.addChatSection.emit();
  }
  delete_chat_section() {
    this.deletedChatSection.emit();
  }
  add_chat_section_name() {
    if(this.chat_section_group.valid){
      if(this.chat_section_group.value.chat_section_name_added.replace(/\s/g, '').length>0 ){
        this.addChatSectionName.emit( this.chat_section_group.value.chat_section_name_added.replace(/\n\s*\n\s*\n/g, '\n\n').replace(/\s+$/,''));
        this.chat_section_group.reset();
      }
      else{
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:"Veuillez saisir un titre valide."},          
          panelClass: "popupConfirmationClass",
        });
      }
    }
    else{
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:"Veuillez saisir un titre valide."},          
        panelClass: "popupConfirmationClass",
      });
    }
    
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


  /********************************************* ARCHVIES  **************************************/
  /********************************************* ARCHVIES  **************************************/


  activate_add_chat_section_archives=false;
  loading_chat_section_name_archives=false;


  list_of_folders=[];
  list_of_files_loading=[];
  list_of_folders_retrieved=false;
  list_of_files_object_by_folder=[];
  list_of_files_retrieved_by_folder=[];
  list_of_files_types_by_folder=[];
  list_of_files_by_folder=[];
  list_of_files_names_by_folder=[];
  list_of_pictures_loaded_by_folder=[];

  createFormAd_archives() {
    this.chat_section_group_archives = this.formBuilder.group({
      chat_section_name_added_archives:['',
      Validators.compose([
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30),
        Validators.pattern(pattern("text")),
      ]),
    ],
    });
  }

  get_archives_folders(){
    this.chatService.get_chat_folders(this.chat_friend_id).subscribe(r=>{
      if(r[0] && r[0].length>0){
        this.list_of_folders=r[0];
      }
      this.folders_emitter.emit({folders:this.list_of_folders});
      this.list_of_folders_retrieved=true;
    })
  }

  index_of_folder_open=-1;
  folder_open=false;
  list_of_folders_opened=[];
  show_files_of_folder=[];
  can_get_other_files_from_archive=[];
  offset_by_folder=[];

  open_folder(i){
    this.list_of_folders_opened[i]=true;
    for(let j=0;j<this.list_of_folders_opened.length;j++){
      if(j!=i){
        this.list_of_folders_opened[j]=false;
        this.show_files_of_folder[j]=false;
      }
    }
    this.get_files_by_folder(i);
  }

  get_files_by_folder(index){
    if(this.list_of_files_retrieved_by_folder[index]){
      this.show_files_of_folder[index]=true;
      return
    }
    else if(this.list_of_files_loading[index]){
      return
    }
    else{
      var re = /(?:\.([^.]+))?$/;
      this.offset_by_folder[index]=0;
      this.list_of_files_by_folder[index]=[];
      this.list_of_files_types_by_folder[index]=[];
      this.list_of_files_names_by_folder[index]=[];
      this.list_of_files_object_by_folder[index]=[];
      this.list_of_pictures_loaded_by_folder[index]=[];
      this.list_of_files_loading[index]=true;
      this.chatService.get_files_by_folder(this.list_of_folders[index].id,0).subscribe(m=>{
        let r=[]
        if(m[0].messages && m[0].messages.length>0){
          r[0]=m[0].messages;
          this.list_of_folders[index].number_of_files=m[0].num;
          let compt=0;
          for(let i=0;i<r[0].length;i++){
            this.list_of_files_object_by_folder[index][i]=r[0][i];
            if((re.exec(r[0][i].attachment_name)[1].toLowerCase()=="svg" && r[0][i].attachment_type=="picture_attachment") || r[0][i].attachment_type=="file_attachment" ){
              this.chatService.get_attachment_popup(r[0][i].attachment_name,(this.friend_type=='user')?'user':'group',this.chat_friend_id).subscribe(t=>{ 
                let THIS=this;
                if(re.exec(r[0][i].attachment_name)[1].toLowerCase()=="svg"){
                  var reader = new FileReader()
                  reader.readAsText(t);
                  reader.onload = function(this) {
                      let blob = new Blob([reader.result], {type: 'image/svg+xml'});
                      let url = (window.URL) ? window.URL.createObjectURL(blob) : (window as any).webkitURL.createObjectURL(blob);
                      let SafeURL = THIS.sanitizer.bypassSecurityTrustUrl(url);
                      THIS.list_of_files_by_folder[index][i]=SafeURL;
                      THIS.list_of_files_types_by_folder[index][i]="picture_attachment";
                      THIS.list_of_files_names_by_folder[index][i]=r[0][i].attachment_name
                      compt++;
                      if(compt==r[0].length){
                        THIS.list_of_files_retrieved_by_folder[index]=true;
                        THIS.show_files_of_folder[index]=true;
                        THIS.list_of_files_loading[index]=false;
                        if(compt>=15){
                          THIS.can_get_other_files_from_archive[index]=true;
                        }
                        THIS.cd.detectChanges();
                      }
                  }
                }
                else{
                  let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                  const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                  this.list_of_files_by_folder[index][i]=SafeURL;
                  this.list_of_files_types_by_folder[index][i]="file_attachment";
                  this.list_of_files_names_by_folder[index][i]=r[0][i].attachment_name
                  compt++;
                  if(compt==r[0].length){
                    this.list_of_files_retrieved_by_folder[index]=true;
                    this.show_files_of_folder[index]=true;
                    this.list_of_files_loading[index]=false;
                    if(compt>=15){
                      this.can_get_other_files_from_archive[index]=true;
                    }
                    this.cd.detectChanges();
                  }
                }
                
  
              })
            }
            else if(r[0][i].attachment_type=="picture_attachment" && re.exec(r[0][i].attachment_name)[1].toLowerCase()!="svg"){
              this.chatService.get_attachment_right(r[0][i].attachment_name,(this.friend_type=='user')?'user':'group',this.chat_friend_id).subscribe(t=>{
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.list_of_files_by_folder[index][i]=SafeURL;
                this.list_of_files_types_by_folder[index][i]="picture_attachment";
                this.list_of_files_names_by_folder[index][i]=r[0][i].attachment_name
                compt++;
                if(compt==r[0].length){
                  this.list_of_files_retrieved_by_folder[index]=true;
                  this.show_files_of_folder[index]=true;
                  this.list_of_files_loading[index]=false;
                  if(compt>=15){
                    this.can_get_other_files_from_archive[index]=true;
                  }
                  this.cd.detectChanges();
                }
              })
            }
            else{
              this.chatService.get_picture_sent_by_msg(r[0][i].attachment_name).subscribe(t=>{
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.list_of_files_by_folder[index][i]=SafeURL;
                this.list_of_files_types_by_folder[index][i]="picture_attachment";
                this.list_of_files_names_by_folder[index][i]=r[0][i].attachment_name
                compt++;
                if(compt==r[0].length){
                  this.list_of_files_retrieved_by_folder[index]=true;
                  this.show_files_of_folder[index]=true;
                  this.list_of_files_loading[index]=false;
                  if(compt>=15){
                    this.can_get_other_files_from_archive[index]=true;
                  }
                  this.cd.detectChanges();
                }
              })
            }
            
          }
        }
        
        else{
          this.list_of_files_retrieved_by_folder[index]=true;
          this.show_files_of_folder[index]=true;
          this.list_of_files_loading[index]=false;
        }
       
      })
    }
  }

  
  load_picture_of_file(i,j){
    this.list_of_pictures_loaded_by_folder[i][j]=true;
  }

  show_images_of_folder(i,j){
    let list_of_pics=[];
    let new_list_types=[];
    let indice=0;
    if(j<15){
      if(this.list_of_files_object_by_folder[i].length<30){
        for(let k=0;k<this.list_of_files_object_by_folder[i].length;k++){
          if(this.list_of_files_object_by_folder[i][k].attachment_type=="picture_attachment" ||this.list_of_files_object_by_folder[i][k].attachment_type=="picture_message" ){
            list_of_pics.push(this.list_of_files_object_by_folder[i][k].attachment_name);
            new_list_types.push(this.list_of_files_object_by_folder[i][k].attachment_type);
            if(this.list_of_files_object_by_folder[i][k].id==this.list_of_files_object_by_folder[i][j].id){
              indice=k;
            }
          }
        }
      }
      else{
        for(let k=0;k<30;k++){
          if(this.list_of_files_object_by_folder[i][k].attachment_type=="picture_attachment" ||this.list_of_files_object_by_folder[i][k].attachment_type=="picture_message" ){
            list_of_pics.push(this.list_of_files_object_by_folder[i][k].attachment_name);
            new_list_types.push(this.list_of_files_object_by_folder[i][k].attachment_type);
            if(this.list_of_files_object_by_folder[i][k].id==this.list_of_files_object_by_folder[i][j].id){
              indice=k;
            }
          }
        }
      }
     
    }
    else{
      for(let k=(j-15);k<j+15;k++){
        if(this.list_of_files_object_by_folder[i][k].attachment_type=="picture_attachment" ||this.list_of_files_object_by_folder[i][k].attachment_type=="picture_message" ){
          list_of_pics.push(this.list_of_files_object_by_folder[i][k].attachment_name);
          new_list_types.push(this.list_of_files_object_by_folder[i][k].attachment_type);
          if(this.list_of_files_object_by_folder[i][k].id==this.list_of_files_object_by_folder[i][j].id){
            indice=k;
          }
        }
      }
    }
    
    const dialogRef = this.dialog.open(PopupAdPicturesComponent, {
      data: {
        list_of_pictures:list_of_pics,
        list_of_types:new_list_types,
        index_of_picture:indice,
        for_chat:true,
        friend_type:(this.friend_type=='user')?'user':'group',
        chat_friend_id:this.chat_friend_id
      },      
      panelClass:"popupDocumentClass",
    });
  }

  add_chat_section_archives() {
    this.in_rename_folder=false;
    this.activate_add_chat_section_archives=true;
  }
  
  cancel_add_section_archives() {
    this.chat_section_group_archives.reset();
    this.activate_add_chat_section_archives=false;
  }


  unarchive(i,j){
    let id_message = this.list_of_files_object_by_folder[i][j].id;
    this.chatService.unarchive_chat_message(id_message,this.list_of_folders[i].id).subscribe(r=>{
      this.list_of_files_object_by_folder[i].splice(j,1)
      this.list_of_files_by_folder[i].splice(j,1)
      this.list_of_files_types_by_folder[i].splice(j,1)
      this.list_of_files_names_by_folder[i].splice(j,1)
      this.list_of_files_object_by_folder[i].splice(j,1)
      this.list_of_pictures_loaded_by_folder[i].splice(j,1)
      this.get_archives_folders();
    })
  }


  remove_folder(index){
    if(this.list_of_folders[index].id_user!=this.current_user_id){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:"Vous ne pouvez pas supprimer ce dossier car vous ne l'avez pas créé."},
        panelClass: "popupConfirmationClass",
      });
    }
    else{

      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:true, text:"Voulez-vous vraiment supprimer ce dossier ? Tous les fichiers resteront disponibles dans les fichiers et images partagés."},
        panelClass: "popupConfirmationClass",
      });
      dialogRef.afterClosed().subscribe(result => {
        if(result){
          this.list_of_folders_retrieved=false;
          this.chatService.remove_folder(this.list_of_folders[index].id,this.chat_friend_id).subscribe(r=>{
            if(!r[0].error){
              if( r[0].length>0){
                this.list_of_folders=r[0];
              }
              this.folders_emitter.emit({folders:this.list_of_folders});
              this.list_of_folders_retrieved=true;
              this.list_of_folders_opened=[];
              this.show_files_of_folder=[];
              this.list_of_files_retrieved_by_folder=[];
              this.list_of_files_loading=[];
            }
            else{
              const dialogRef = this.dialog.open(PopupConfirmationComponent, {
                data: {showChoice:false, text:"Une erreure est survenue. Veuillez réitérer le processus."},
                panelClass: "popupConfirmationClass",
              });
              this.list_of_folders_retrieved=false;
              this.get_archives_folders();
            }
            
          })
        }
       
      });

      
    }
   
    
  }

  in_rename_folder=false;
  index_folder_to_rename=0;
  rename_folder(index){
    this.in_rename_folder=true;
    this.index_folder_to_rename=index;
    this.chat_section_group_archives.controls['chat_section_name_added_archives'].setValue(this.list_of_folders[index].title);
    this.activate_add_chat_section_archives=true;
    this.myScrollContainer.nativeElement.scrollTop=0;
  }

  cancel_rename_folder(){
    this.in_rename_folder=false;
    this.chat_section_group_archives.reset();
    this.index_folder_to_rename=0;
  }

  validate_rename_folder(){
    if(this.list_of_folders[this.index_folder_to_rename].id_user!=this.current_user_id){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:"Vous ne pouvez pas renommer ce dossier car vous ne l'avez pas créé."},
        panelClass: "popupConfirmationClass",
      });
    }
    else if(this.chat_section_group_archives.valid){
      if(this.chat_section_group_archives.value.chat_section_name_added_archives.replace(/\s/g, '').length>0 ){
        this.loading_chat_section_name_archives=true;
        this.chatService.rename_chat_folder(this.list_of_folders[this.index_folder_to_rename].id,this.chat_section_group_archives.value.chat_section_name_added_archives.replace(/\n\s*\n\s*\n/g, '\n\n').replace(/\s+$/,''),this.chat_friend_id).subscribe(r=>{
          if(r[0].error){
            const dialogRef = this.dialog.open(PopupConfirmationComponent, {
              data: {showChoice:false, text:"Ce titre est déjà utilisé ailleurs."},          
              panelClass: "popupConfirmationClass",
            });
          }
          else{
            this.list_of_folders[this.index_folder_to_rename].title=this.chat_section_group_archives.value.chat_section_name_added_archives.replace(/\n\s*\n\s*\n/g, '\n\n').replace(/\s+$/,'');
          }
          this.activate_add_chat_section_archives=false;
          this.in_rename_folder=false;
          this.loading_chat_section_name_archives=false;
          this.chat_section_group_archives.reset();
        })
        
      }
      else{
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:"Veuillez saisir un titre valide."},          
          panelClass: "popupConfirmationClass",
        });
      }
    }
    else{
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:"Veuillez saisir un titre valide."},          
        panelClass: "popupConfirmationClass",
      });
    }
  }

  add_chat_section_name_archives() {
    if(this.loading_chat_section_name_archives){
      return
    }
   

    if(this.list_of_folders.length>=15){
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Vous ne pouvez pas crééer plus de 15 dossiers.'},
          panelClass: "popupConfirmationClass",
        });
    }
    else if(this.chat_section_group_archives.valid){
      if(this.chat_section_group_archives.value.chat_section_name_added_archives.replace(/\s/g, '').length>0 ){
        this.loading_chat_section_name_archives=true;
        this.chatService.add_chat_folder(this.chat_friend_id ,this.chat_section_group_archives.value.chat_section_name_added_archives.replace(/\n\s*\n\s*\n/g, '\n\n').replace(/\s+$/,'')).subscribe(r=>{
          if(r[0].error){
            const dialogRef = this.dialog.open(PopupConfirmationComponent, {
              data: {showChoice:false, text:"Ce titre est déjà utilisé ailleurs."},          
              panelClass: "popupConfirmationClass",
            });
          }
          else{
            this.folders_emitter.emit({folders:this.list_of_folders});
            this.list_of_folders=r[0];
            this.list_of_folders_retrieved=true;
          }
          this.activate_add_chat_section_archives=false;
          this.loading_chat_section_name_archives=false;
        })
        this.chat_section_group_archives.reset();
      }
      else{
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:"Veuillez saisir un titre valide."},          
          panelClass: "popupConfirmationClass",
        });
      }
    }
    else{
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:"Veuillez saisir un titre valide."},          
        panelClass: "popupConfirmationClass",
      });
    }
    
  }



}
