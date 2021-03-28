
import { Component, OnInit,  ElementRef, Input, ChangeDetectorRef, ViewChild, HostListener } from '@angular/core';

import { FormControl, Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import {NotificationsService}from '../services/notifications.service';
import {ChatService}from '../services/chat.service';
import {Subscribing_service}from '../services/subscribing.service';
import { Subscription } from 'rxjs';
import { BdSerieService } from '../services/comics_serie.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Bd_CoverService } from '../services/comics_cover.service';

import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';

import { pattern } from '../helpers/patterns';
import { NavbarService } from '../services/navbar.service';



@Component({
  selector: 'app-form-serie',
  templateUrl: './form-serie.component.html',
  styleUrls: ['./form-serie.component.scss']
})
export class FormSerieComponent implements OnInit {

value:string="add";
@HostListener('window:beforeunload', ['$event'])
  beforeUnload($event) { 
    this.cancel_all();
  }



  ngOnChanges( changes ) {
    if( changes.chapter && this.initialized && this.form_number==0) {
      this.componentRef[ 0 ].name = this.chapter;
    }
  }

  constructor (
    private Subscribing_service:Subscribing_service,
    private chatService:ChatService,
    private NotificationsService:NotificationsService,
    private cd: ChangeDetectorRef,
    private bdSerieService: BdSerieService,
    private router:Router,
    private Bd_CoverService:Bd_CoverService,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private navbar: NavbarService,
    private Profile_Edition_Service:Profile_Edition_Service

    ){
      this.edit_name = -1;
      this.current_chapter = 0;
      this.initialized = false;
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })

  }

  @ViewChild('validateButton', { read: ElementRef }) validateButton:ElementRef;
  display_loading=false;

  subscription: Subscription;

  @Input() user_id:number;
  @Input() pseudo:string ;
  @Input() bd_id: number;
  @Input() chapter: string;
  @Input() form_number: number;
  @Input() list_of_chapters: any;
  @Input() bdtitle: string;
  @Input() bd_id_add_comics:number;
  list_of_chapters_validated:any[]=[];
  list_of_new_chapters:any[]=[];
  //for series chapters
  chapter_creation_in_progress: boolean = false;
  chapter_remove_in_progress: boolean = false;
  //Modèle : {type:"Série", chapter:i, name:"", swiperInitialized:false, swiperUploaded:false}
  componentRef: any[] = [];
  edit_name: number;
  current_chapter: number;
  initialized: boolean;

  form: FormGroup;

  @ViewChild("cancelDeleteChapter", {static:false}) cancelDeleteChapter:ElementRef;
  @ViewChild("continueDeleteChapter", {static:false}) continueDeleteChapter:ElementRef;

  @ViewChild('changeName') changeName:ElementRef;


  display_chapters=false;
  show_icon=false;
  ngOnInit() {
    console.log("for se")
    console.log(this.user_id)
    window.scroll(0,0);
    if(this.form_number==1){
      this.current_chapter==this.list_of_chapters[this.list_of_chapters.length-1].chapter_number-1;
      this.bd_id= this.bd_id_add_comics;
      
    }

    
 
    this.form = new FormGroup({
      chapters: new FormArray([
      ]),
    });

    if(this.form_number==0){
      this.componentRef.push({type:"Série", chapter:this.current_chapter , name:"", swiperInitialized:true, chapterValidated:false});
      this.addChapter();
      (<FormArray>this.form.get('chapters')).controls[0].setValue( this.chapter );
      this.componentRef[ this.componentRef.length - 1 ].name = this.chapter;
      this.componentRef[ this.componentRef.length - 1 ].bdtitle = this.bdtitle;
      this.chapter_creation_in_progress=true;
      this.initialized = true;
    }

    else{
      for(let i=0;i<this.list_of_chapters.length;i++){
        
        this.list_of_chapters_validated[i]=true,
        this.list_of_new_chapters[i]=false;
        this.addChapter();
        (<FormArray>this.form.get('chapters')).controls[i].setValue( this.list_of_chapters[i].title );
      }
      this.display_chapters=true;
    }
    

  };
  
 

  
  get chapters(): FormArray { 
    return this.form.get('chapters') as FormArray; 
  }
  addChapter() { 
    this.chapters.push(new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern( pattern("text") ) ] )); 
  }
  deleteChapter() { 
    this.chapters.removeAt( this.chapters.length - 1 ); 
  }




  set_edit_name(i: number, value:string) {
    this.value=value;
    this.edit_name = i;
    this.cd.detectChanges();
    if(this.form_number==0){
      this.display_swiper=false;
      this.changeName.nativeElement.value= this.componentRef[i].name;
    }
    else{
      this.display_swiper=false;
      if(value=="add"){
        this.changeName.nativeElement.value= "";
      }
      else{
        this.changeName.nativeElement.value= this.list_of_chapters[i].title;
      }
      
    }
    this.changeName.nativeElement.focus();
  }


  display_swiper=true;
  new_chapter_added=false;
  number_of_new_chapters=0;

  validate_name(i: number) {

    this.cd.detectChanges();
    if( (<FormArray>this.form.get('chapters')).controls[i].valid && this.form_number==0) {

      this.componentRef[i].name = this.changeName.nativeElement.value;

      this.componentRef[i].swiperInitialized = true;
      this.edit_name = -1;


      if (this.value=="modify") {
        this.bdSerieService.modify_chapter_bd_serie(this.bd_id,i+1,this.componentRef[i].name).subscribe(r=>{
          this.display_swiper=true;
          return true;
        });
        
      }
      else if (this.value=="add") {
        this.bdSerieService.add_chapter_bd_serie(this.bd_id, i+1 , this.componentRef[i].name).subscribe(r=>{
          this.display_swiper=true;
          return false;
        });
        
      }
    }
    else if(this.form_number==1 && (<FormArray>this.form.get('chapters')).controls[i].valid){

      this.edit_name = -1;
      if (this.value=="modify") {
        this.bdSerieService.modify_chapter_bd_serie2(this.list_of_chapters[i].bd_id,this.list_of_chapters[i].chapter_number,(<FormArray>this.form.get('chapters')).controls[i].value).subscribe(r=>{
          this.list_of_chapters[i].title=(<FormArray>this.form.get('chapters')).controls[i].value;
          this.cd.detectChanges();
          this.display_swiper=true;
          return true;
        });
        
      }
      else if (this.value=="add") {
        this.bdSerieService.add_chapter_bd_serie2(this.list_of_chapters[0].bd_id, i+1 , (<FormArray>this.form.get('chapters')).controls[i].value).subscribe(r=>{
          this.new_chapter_added=true;
          this.number_of_new_chapters+=1;
          this.list_of_chapters[i].title=(<FormArray>this.form.get('chapters')).controls[i].value;
          this.display_swiper=true;
          return false;
        });
        
      }
      
    }

  }


  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  
  createComponent(i : number) {
    //Creating new component
    this.componentRef.push({type:"Série", chapter:i, name:"", swiperInitialized:false, chapterValidated:false});
    this.addChapter();
  }


  add_series_chapter() {
    if( (this.form_number==0 && this.componentRef.length==100) || (this.form_number==1 && this.list_of_chapters.length==100) ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:"Vous ne pouvez pas ajouter plus de 100 chapitres"},
        panelClass: "popupConfirmationClass",
      });
    }
    else if( this.chapter_creation_in_progress ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:"Veuillez valider le chapitre en cours avant d'en ajouter un nouveau"},
        panelClass: "popupConfirmationClass",
      });
    }
    else if(this.form_number==0){
      this.chapter_creation_in_progress=true;
      this.current_chapter = this.componentRef.length;
      this.createComponent( this.componentRef.length );
      this.set_edit_name( this.componentRef.length - 1, 'add');
    }
    else if(this.form_number==1){
        this.chapter_creation_in_progress=true;
        this.current_chapter = this.list_of_chapters.length;
        this.list_of_chapters.push({title:"",chapter_number:this.current_chapter+1,bd_id:this.list_of_chapters[0].bd_id})
        this.addChapter();
        (<FormArray>this.form.get('chapters')).controls[this.current_chapter].setValue( "" );
        this.list_of_chapters_validated[this.current_chapter ]=false;
        this.list_of_new_chapters.push(true);
        this.set_edit_name( this.current_chapter, 'add');
    }

  }

  cancel_add_chapter(i){
    if(this.form_number==1){
      this.chapter_creation_in_progress=false;
      this.current_chapter=i-1;
      this.edit_name=-1;
      this.list_of_chapters.pop();
      this.deleteChapter();
    }
    else{
      this.chapter_creation_in_progress=false;
      this.current_chapter=i-1;
      this.edit_name=-1;
      this.componentRef.splice(i, 1);
      for( let j = 0; j< this.componentRef.length; j++ ) {
        this.componentRef[j].chapter = j;
      }
      this.deleteChapter();
    }
    
  }


  openDeleteDialog(i: number): void {

    if(this.form_number==0){
      if( this.componentRef.length > 1 ) {
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:true, text:'Êtes-vous sûr de vouloir supprimer ce chapitre ?'},
          panelClass: "popupConfirmationClass",
        });
  
        dialogRef.afterClosed().subscribe(result => {
          if( result ) {
            this.delete_chapter(i);
          }
        });
      }
  
      else {
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Vous devez conserver au moins un chapitre'},
          panelClass: "popupConfirmationClass",
        });
      }
    }
    else{
      if( this.list_of_chapters.length > 1 ) {
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:true, text:'Êtes-vous sûr de vouloir supprimer ce chapitre ?'},
          panelClass: "popupConfirmationClass",
        });
  
        dialogRef.afterClosed().subscribe(result => {
          if( result ) {
            this.delete_chapter(i);
          }
        });
      }
  
      else {
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:'Vous devez conserver au moins un chapitre'},
            panelClass: "popupConfirmationClass",
          });
       
      }
    }
    
    
  }


  delete_chapter(i: number) {
    if(this.form_number==0){
      this.componentRef.splice(i, 1);
      for( let j = 0; j< this.componentRef.length; j++ ) {
        this.componentRef[j].chapter = j;
      }
  
      this.deleteChapter();
      this.bdSerieService.delete_chapter_bd_serie(this.bd_id,i+1).subscribe(r=>{
        this.Subscribing_service.remove_content('comic', 'serie', this.bd_id,i+1).subscribe(r=>{
          this.chapter_creation_in_progress=false;
        })
        
      });
    }
    else{
      if(i+1==this.list_of_chapters[this.list_of_chapters.length-1].chapter_number){
        
        this.deleteChapter();
        this.chapter_creation_in_progress=false;
        this.bdSerieService.delete_chapter_bd_serie2(this.list_of_chapters[0].bd_id,this.list_of_chapters[this.list_of_chapters.length-1].chapter_number).subscribe(r=>{
          this.Subscribing_service.remove_content('comic', 'serie', this.list_of_chapters[0].bd_id,this.list_of_chapters[this.list_of_chapters.length-1].chapter_number).subscribe(r=>{
            this.list_of_chapters.splice(this.list_of_chapters.length-1,1);
            if(this.new_chapter_added){
              this.number_of_new_chapters-=1;
              this.list_of_new_chapters.splice(this.list_of_new_chapters.length-1,1);
              if(this.number_of_new_chapters==0){
                this.new_chapter_added=false;
              }
            }
            this.cd.detectChanges();
          })
          
        });
      }
    }
      

    
  }


  open_chapter(i: number) {
    if(this.form_number==0){
      this.current_chapter = i;
    }
    else{
      if(this.list_of_new_chapters[i]){
        this.current_chapter = i;
      }
      else{
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:"Vous ne pouvez pas modifier le contenu des chapitres validés"},
          panelClass: "popupConfirmationClass",
        });
      }
    }
    
  }

  validated_chapter(i: number) {
    if(this.form_number==0){
      this.chapter_creation_in_progress=false
      this.componentRef[i].chapterValidated = true;
    }
    else{
      this.chapter_creation_in_progress=false;
      if(this.new_chapter_added){
        this.number_of_new_chapters-=1;
        if(this.number_of_new_chapters==0){
          this.new_chapter_added=false;
        }
      }
      this.list_of_chapters_validated[i]=true;
    }
    
  }


  validateAll() {

    this.validateButton.nativeElement.disabled = true;

    if( this.edit_name != -1 ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Attention ! Vous devez valider l\'édition du nom avant de finaliser le téléchargement.'},
        panelClass: "popupConfirmationClass",
      });
      this.validateButton.nativeElement.disabled = false;
    }

    let errorMsg : string = "Le ou les chapitres suivants n'ont pas été validés : "
    let valid = true;
      
    if(this.form_number==0){
      for (let step = 0; step < this.componentRef.length; step++) {
        if( !this.componentRef[step].chapterValidated ) {
          errorMsg = errorMsg + (step+1) + ", ";
          valid = false;
        }
      
      }
  
      if(!valid) {
  
        this.validateButton.nativeElement.disabled = false;
        errorMsg = errorMsg + "merci de les valider ou de supprimer ces chapitres.";
        
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:errorMsg},
          panelClass: "popupConfirmationClass",
        });
  
      }
      else {
        
        this.display_loading=true;
        this.bdSerieService.validate_bd_serie(this.bd_id,this.componentRef.length).subscribe(r=>{
           this.Subscribing_service.validate_content("comic","serie",r[0],r[1]).subscribe(l=>{
            this.NotificationsService.add_notification('add_publication',this.user_id,this.pseudo,null,'comic',this.bdtitle,'serie',this.bd_id,this.componentRef.length,"add",false,0).subscribe(l=>{
              let message_to_send ={
                for_notifications:true,
                type:"add_publication",
                id_user_name:this.pseudo,
                id_user:this.user_id, 
                publication_category:'comic',
                publication_name:this.bdtitle,
                format:'serie',
                publication_id:this.bd_id,
                chapter_number:this.componentRef.length,
                information:"add",
                status:"unchecked",
                is_comment_answer:false,
                comment_id:0,
              }
              this.chatService.messages.next(message_to_send);
              this.block_cancel=true;
              this.Bd_CoverService.remove_covername();
              this.router.navigate([`/account/${this.pseudo}`]);
          }); 
          
          
            
          }) 
          
        })
      }
    }
    else{
      for (let i = 0; i < this.list_of_chapters_validated.length; i++) {
        if( !this.list_of_chapters_validated[i]) {
          errorMsg = errorMsg + (i+1) + ", ";
          valid = false;
        }
      }
      if(!valid) {
  
        this.validateButton.nativeElement.disabled = false;
        errorMsg = errorMsg + "merci de valider ou de supprimer ces chapitres.";
        
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:errorMsg},
          panelClass: "popupConfirmationClass",
        });
  
      }
      else {
        this.display_loading=true;
        let type="extend_publication";
        let compt=0;
        for(let i=0;i<this.list_of_new_chapters.length;i++){
          if(this.list_of_new_chapters[i]){
            compt+=1;
          }
        }
        if(compt==0){
          
          this.router.navigate( [ `/account/${this.pseudo}` ] );
          
        }
        else{
          this.Subscribing_service.extend_serie_and_update_content(this.bd_id,this.list_of_chapters.length).subscribe(u=>{
            this.NotificationsService.add_notification(type,this.user_id,this.pseudo,null,'comic',this.bdtitle,'serie',this.bd_id,compt,"add",false,0).subscribe(l=>{
              let message_to_send ={
                for_notifications:true,
                type:type,
                id_user_name:this.pseudo,
                id_user:this.user_id, 
                publication_category:'comic',
                publication_name:this.bdtitle,
                format:'serie',
                publication_id:this.bd_id,
                chapter_number:compt,
                information:"add",
                status:"unchecked",
                is_comment_answer:false,
                comment_id:0,
              }
              this.chatService.messages.next(message_to_send);
              this.router.navigate( [ `/account/${this.pseudo}` ] );
              
            }) 
          })
          
        }
        
        
      }
    }
    

  }

  block_cancel=false;
  cancel_all(){
    if(!this.block_cancel){
      if(this.form_number==0){
        for( let j = 0; j< this.componentRef.length; j++ ) {
          this.bdSerieService.delete_chapter_bd_serie(this.bd_id,j+1).subscribe(r=>{
            this.Subscribing_service.remove_content('comic', 'serie', this.bd_id,j+1).subscribe(r=>{
              this.chapter_creation_in_progress=false;
            })
          });
        }
      }
      else{
        if(this.new_chapter_added){
          let indice=-1;
          for(let i=0;i<this.list_of_new_chapters.length;i++){
            if(!this.list_of_chapters_validated[i] ||indice>0){
              indice=i;
              this.bdSerieService.delete_chapter_bd_serie2(this.list_of_chapters[0].bd_id,this.list_of_chapters[i].chapter_number).subscribe(r=>{
                this.Subscribing_service.remove_content('comic', 'serie', this.list_of_chapters[0].bd_id,this.list_of_chapters[i].chapter_number).subscribe(r=>{
                })
              });
            }
          }
          
        }
      }
    }
   
    
  }


  
  stop(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }


    
}