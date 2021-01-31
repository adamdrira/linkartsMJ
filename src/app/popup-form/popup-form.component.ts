import { Component, OnInit, Inject, ChangeDetectorRef, ElementRef, ViewChild, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { NotificationsService } from '../services/notifications.service';
import { ChatService } from '../services/chat.service';
import { pattern } from '../helpers/patterns';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NavbarService } from '../services/navbar.service';



declare var $:any;

@Component({
  selector: 'app-popup-form',
  templateUrl: './popup-form.component.html',
  styleUrls: ['./popup-form.component.scss']
})
export class PopupFormComponent implements OnInit {

  constructor(
    private Profile_Edition_Service:Profile_Edition_Service,
    public dialogRef: MatDialogRef<PopupFormComponent>,
    private ChatService:ChatService,
    private cd:ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private NotificationsService:NotificationsService,
    private sanitizer:DomSanitizer,
    private navbar: NavbarService,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
      dialogRef.disableClose = true;

      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
  }

  display_errors:boolean = false;

  //modify group profile pic
  id_receiver_for_group:number;
  id_retrieved=false;

  number_of_artists:number;
  show_icon=false;
  ngOnInit() {
    let THIS=this;

    if(this.data.type=='add_artist'){
      console.log(this.data)
      this.initialize_add_artist();
      this.number_of_artists=10-this.data.members.length;
    }
    
    
    
    if(this.data.type=='edit_chat_profile_picture'){
      this.id_receiver_for_group=this.data.id_receiver;
      console.log(this.id_receiver_for_group)
      this.id_retrieved=true;
    }

  }

 


  /************************************************** ADD ARTIST  **************************************/

  @ViewChild('research') research:ElementRef;
  @ViewChild('input') input:ElementRef;
    
  research_member_loading=false;
  pp_found_loaded=false;
  list_of_pp_found=[];
  list_of_pseudos=[];
  list_of_ids=[];
  list_of_profile_pictures=[];
  list_of_birthdays=[];

  pseudo_found='';
  profile_picture_found:SafeUrl;
  id_found:number;
  display_no_pseudos_found=false;
  display_max_length_members=false;
  compteur_research=0;
  birthday_found:string;
  logo_is_loaded=false;
  display_need_members=false;

  @HostListener('document:click', ['$event.target'])
  clickout(btn) {
    if(this.research_member_loading){
      if (!this.research.nativeElement || !this.research.nativeElement.contains(btn)){
        this.research_member_loading=false;
      }
    }
  }

  registerForm5: FormGroup;

  initialize_add_artist(){
    this.build_form();
  }

  build_form(){
    this.registerForm5 = this.formBuilder.group({

      
      fdSearchbar:['', 
        Validators.compose([
          Validators.maxLength(20),
          Validators.pattern(pattern("name")),
        ]),
      ]

    });
  }

 

  activateFocus_add(){
    console.log("activate add")
    this.profile_picture_found=null;
    this.id_found=null;
    this.research_member_loading=true;
    this.pp_found_loaded=false;
  }
  
  
  research_member(){
    if(!this.research_member_loading){
      this.activateFocus_add();
    }
    this.pp_found_loaded=false;
    if(this.list_of_pseudos.length>=10){
      this.display_no_pseudos_found=true;
      this.pseudo_found='';
      this.profile_picture_found=null;
      this.display_max_length_members=true;
      return
    }
    this.compteur_research++;
    console.log(this.registerForm5.value.fdSearchbar )
    if(this.registerForm5.value.fdSearchbar && this.registerForm5.value.fdSearchbar.replace(/\s/g, '').length>0){
      console.log("loading research")
      this.Profile_Edition_Service.get_pseudos_who_match_for_signup(this.registerForm5.value.fdSearchbar,this.compteur_research).subscribe(r=>{
        console.log(r)
        let compt=r[1];
        if(r[0][0].nothing){
          if(r[1]==this.compteur_research){
            console.log("no result");
            this.display_no_pseudos_found=true;
            this.pseudo_found='';
            this.profile_picture_found=null;
          }
        }
        else if(r[1]==this.compteur_research){
          console.log("in else if")
          this.birthday_found=r[0][0].birthday
          this.pseudo_found=r[0][0].nickname;
          this.id_found=r[0][0].id;
          this.Profile_Edition_Service.retrieve_profile_picture(r[0][0].id).subscribe(p=>{
            console.log(p)
            console.log(compt);
            console.log(this.compteur_research)
            if(compt==this.compteur_research){
              
              let url = (window.URL) ? window.URL.createObjectURL(p) : (window as any).webkitURL.createObjectURL(p);
              this.profile_picture_found= this.sanitizer.bypassSecurityTrustUrl(url);
              this.display_no_pseudos_found=false;
              console.log(this.profile_picture_found)
            }
            
          })
        }
      })
    }
    else{
      this.pp_found_loaded=false;
    }
  }


  add_member(){
    this.list_of_birthdays.push(this.birthday_found)
    console.log(this.list_of_birthdays)
    this.research_member_loading=false;
    this.list_of_ids.push(this.id_found)
    this.list_of_pseudos.push(this.pseudo_found);
    this.list_of_profile_pictures.push(this.profile_picture_found);
    console.log(this.list_of_pseudos);
    this.input.nativeElement.value='';
    this.registerForm5.value.fdSearchbar='';
  }

  check_if_pseudos_added(){
    
    if(this.pseudo_found!=''){
      let value = true;
      for(let i=0;i<this.list_of_pseudos.length;i++){
        if(this.list_of_pseudos[i]==this.pseudo_found){
          value=false;
        }
      }
      for(let i=0;i<this.data.members.length;i++){
        if(this.data.members[i]==this.id_found){
          value=false;
        }
      }
      return value;
    }
    else{
      return false
    }
    
  }

 
  pp_found_load(){
    this.pp_found_loaded=true;
  }

  logo_loaded(){
    this.logo_is_loaded=true;
  }

  list_of_pp_found_load(i){
    this.list_of_pp_found[i]=true;
  }

  remove_member(i){
    this.list_of_pseudos.splice(i,1);
    this.list_of_ids.splice(i,1);
    this.list_of_profile_pictures.splice(i,1);
    this.list_of_pp_found.splice(i,1);
  }

  validation_loading=false;
  validate_add(){
    console.log("validate add")
    console.log(this.list_of_ids)
    if(this.list_of_ids.length==0){
      this.display_need_members=true;
    }
    else{
      this.validation_loading=true;
      let list_of_shares=[];
      let list_of_members=this.data.members.concat(this.list_of_ids)
      console.log(list_of_members)
      for(let i=0;i<list_of_members.length;i++){
        list_of_shares[i]=(100/list_of_members.length).toFixed(2);
      }
      this.Profile_Edition_Service.add_artist_in_a_group(this.data.id_group,this.list_of_ids,list_of_shares).subscribe(r=>{
        console.log(r)
        this.NotificationsService.add_notification_for_group_creation('group_creation',this.data.id_admin,this.data.pseudo,this.list_of_ids,'group_creation',this.data.group_name,'unknown',this.data.id_group,0,"add",false,0).subscribe(l=>{
          let message_to_send ={
            for_notifications:true,
            type:"group_creation",
            id_user_name:this.data.pseudo,
            id_user:this.data.id_admin, 
            list_of_receivers:this.list_of_ids, 
            publication_category:'group_creation',
            publication_name:this.data.group_name,
            format:'unknown',
            publication_id:this.data.id_group,
            chapter_number:0,
            information:"add",
            status:"unchecked",
            is_comment_answer:false,
            comment_id:0,
          }
          this.ChatService.messages.next(message_to_send);
          console.log(l[0])
          this.Profile_Edition_Service.send_email_for_group_edition(this.data.id_group,this.list_of_ids).subscribe(r=>{
            console.log(r[0])
            this.validation_loading=false;
            location.reload();
          })
        })
      })
    }
  }


  close_dialog(){
    if(this.validation_loading){
      return
    }
    this.dialogRef.close();
  }
}
