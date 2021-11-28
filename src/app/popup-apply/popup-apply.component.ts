import { trigger, transition, style, animate } from '@angular/animations';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { StripeService } from '../services/stripe.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { normalize_to_nfc, pattern } from '../helpers/patterns';
import { NavbarService } from '../services/navbar.service';
import { ConstantsService } from '../services/constants.service';
import { Edtior_Projects } from '../services/editor_projects.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Observable } from 'rxjs';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent  } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs/operators';

import {  first } from 'rxjs/operators';
import { FileUploader } from 'ng2-file-upload';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { ChatService } from '../services/chat.service';
import { NotificationsService } from '../services/notifications.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { DomSanitizer } from '@angular/platform-browser';

declare var Stripe: any;
const url = 'https://www.linkarts.fr/routes/upload_project_for_editor/'

@Component({
  selector: 'app-popup-apply',
  templateUrl: './popup-apply.component.html',
  styleUrls: ['./popup-apply.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({opacity: 0}),
          animate('150ms', style({opacity: 1}))
        ])
      ],
    ),
    trigger(
      'enterFromTopAnimation', [
        transition(':enter', [
          style({transform: 'translateY(-100%)', opacity: 0}),
          animate('400ms ease-out', style({transform: 'translateY(0px)', opacity: 1}))
        ])
      ]
    ),
  ]
})
export class PopupApplyComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private cd: ChangeDetectorRef,
    private sanitizer:DomSanitizer,
    public navbar: NavbarService,
    public dialogRef: MatDialogRef<PopupApplyComponent,any>,
    private Edtior_Projects:Edtior_Projects,
    private ConstantsService:ConstantsService,
    private StripeService:StripeService,
    private chatService:ChatService,
    private deviceService: DeviceDetectorService,
    private NotificationsService:NotificationsService,
    public dialog: MatDialog,
    @Inject(DOCUMENT) private document: Document,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
    dialogRef.disableClose = true;
    
    this.uploader = new FileUploader({
      itemAlias: 'cover', 
      url:url,
    });

    navbar.visibility_observer_font.subscribe(font=>{
      if(font){
        this.show_icon=true;
      }
    })
    this.filteredGenres = this.genresCtrl.valueChanges.pipe(
      startWith(null),
      map((genre: string | null) => genre ? this._filter_genre(genre) : this.list_of_genres.slice()));
  }

  show_icon=false;


  multiple_submission:boolean=false;


  list_of_editors_ids=[];
  editor_pictures_names={};
  editor_pictures={}
  editor_names={};
  editor_nicknames={};
  formulas={};
  prices={};
  delays={};
  total_price=0;
  visitor_id:number;
  visitor_certified:boolean;
  visitor_description:string;
  user_name:string;
  user_nickname:string;
  likes:number;
  loves:number;
  views:number;
  subscribers_number:number;
  number_of_visits:number;
  number_of_comics:number;
  number_of_drawings:number;
  number_of_writings:number;
  number_of_ads:number;
  number_of_artpieces:number;

  after_payement:boolean
  file_name:string;
  id_project:number;

  loading_check=false;
  step=0;
  loading_project=false;

  standard_prices:any={};
  standard_delays:any={};
  express_prices:any={};
  express_delays:any={};

  id_multiple:string;
  device_info='';
  ngOnInit() {
    this.device_info = this.deviceService.getDeviceInfo().browser + ' ' + this.deviceService.getDeviceInfo().deviceType + ' ' + this.deviceService.getDeviceInfo().os + ' ' + this.deviceService.getDeviceInfo().os_version;
    
    this.after_payement=this.data.after_payement;
    if(this.after_payement){
      this.loading_check=true;
      this.step=2;
      this.id_project=this.data.id_project;
      let password=this.data.password;
      let multiple =this.data.is_multiple;
      this.navbar.add_page_visited_to_history(`/check_if_payement_done_` +multiple.toString(),this.device_info).pipe( first() ).subscribe();
      this.Edtior_Projects.check_if_payement_done(this.id_project,password,multiple).pipe(first() ).subscribe(r=>{
        if(r[0]){
          this.navbar.add_page_visited_to_history(`/payement_done_`+multiple.toString(),this.device_info).pipe( first() ).subscribe();
          this.Edtior_Projects.set_payement_done_for_project(this.id_project,multiple).pipe(first() ).subscribe(r=>{
            if(multiple){
              if(r && r[0] && r[0].length>0){
                for(let i=0;i<r[0].length;i++){
                  this.send_email_and_notifs(r[0][i]);
                }
              }
            }
            else if (r[0]){
              this.send_email_and_notifs(r[0]);
            }
           
            this.loading_check=false;
            this.step=2;
          })
        }
        else{
          this.navbar.add_page_visited_to_history(`/payement_NOT_done_`+multiple.toString(),this.device_info).pipe( first() ).subscribe();
          this.loading_check=false;
          this.step=3
        }
      })
      

      return
    }

    this.user_name=this.data.visitor_name;
    this.user_nickname=this.data.visitor_nickname;
      
    this.multiple_submission=this.data.multiple_submission;

    this.list_of_editors_ids=this.data.list_of_editors_ids;
    this.editor_pictures_names=this.data.editor_pictures;
    for(let i=0;i<this.list_of_editors_ids.length;i++){
      this.Edtior_Projects.get_editor_pp(this.editor_pictures_names[this.list_of_editors_ids[i]]).subscribe(r=>{
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.editor_pictures[this.list_of_editors_ids[i]]=SafeURL;
      })
    }
    console.log("this.editor", this.editor_pictures)
    this.editor_names=this.data.editor_names;
    this.editor_nicknames=this.data.editor_nicknames;
    this.formulas=this.data.formulas;
    this.prices=this.data.prices;
    this.delays=this.data.delays;

    this.visitor_id=this.data.visitor_id;
    this.visitor_certified=this.data.visitor_certified;
    this.visitor_description=this.data.visitor_description;
    this.likes=this.data.visitor_likes;
    this.loves=this.data.visitor_loves;
    this.views=this.data.visitor_views;
    this.subscribers_number=this.data.visitor_subscribers_number;
    this.number_of_visits=this.data.visitor_number_of_visits;
    this.number_of_comics=this.data.visitor_number_of_comics;
    this.number_of_drawings=this.data.visitor_number_of_drawings;
    this.number_of_writings=this.data.visitor_number_of_writings;
    this.number_of_ads=this.data.visitor_number_of_ads;
    this.number_of_artpieces=this.data.visitor_number_of_artpieces;
   
    this.standard_prices=this.data.standard_prices;
    this.standard_delays=this.data.standard_delays;
    this.express_prices=this.data.express_prices;
    this.express_delays=this.data.express_delays;

    if(!this.multiple_submission){
      for(let i=0;i<this.list_of_editors_ids.length;i++){
        this.total_price+=this.prices[this.list_of_editors_ids[i]]
      }
    }
    else{
      var today = new Date();
      var ss = String(today.getSeconds()).padStart(2, '0');
      var mi = String(today.getMinutes()).padStart(2, '0');
      var hh = String(today.getHours()).padStart(2, '0');
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); 
      var yyyy = today.getFullYear();
      this.id_multiple = this.visitor_id + yyyy + mm + dd + hh+ mi + ss;
    }
    

    this.build_form();

    
        
    this.uploader.onAfterAddingFile = async (file) => {
        

      var re = /(?:\.([^.]+))?$/;
      let size = file._file.size/1024/1024;
      let sufix =re.exec(file._file.name)[1].toLowerCase()

      if(sufix!="pdf"){
        this.uploader.queue.pop();
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Veuillez sélectionner un fichier .pdf'},
          panelClass: "popupConfirmationClass",
        });
      }
      else{
        if(Math.trunc(size)>=15){
          this.uploader.queue.pop();
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:"Votre fichier est trop volumineux, veuillez saisir un fichier de moins de 10mo ("+ (Math.round(size * 10) / 10)  +"mo)"},
            panelClass: "popupConfirmationClass",
          });
        }
        else{
          var today = new Date();
          var ss = String(today.getSeconds()).padStart(2, '0');
          var mi = String(today.getMinutes()).padStart(2, '0');
          var hh = String(today.getHours()).padStart(2, '0');
          var dd = String(today.getDate()).padStart(2, '0');
          var mm = String(today.getMonth() + 1).padStart(2, '0'); 
          var yyyy = today.getFullYear();
          let Today = yyyy + mm + dd + hh+ mi + ss;
          this.file_name = this.visitor_id + '-' + Today + '.' + sufix;

          this.uploaded_file=this.uploader.queue[0]._file.name;
          file.withCredentials = true;

          
        }
        
      }
    };

    this.uploader.onCompleteItem = (file) => {
      this.check_payement_after_project_submited()
    }
    
  }

  ngAfterViewInit() {

    if (document.getElementsByClassName('mat-dialog-container')[0].getAttribute('listener') !== 'true') {
      document.getElementsByClassName('mat-dialog-container')[0].addEventListener('scroll', function(event) {
        window.dispatchEvent(new Event('resize'));
      });
    }
  }

  ngOnDestroy() {
    document.getElementsByClassName('mat-dialog-container')[0].removeEventListener('scroll', function(event) {
      window.dispatchEvent(new Event('resize'));
    });
  }

  close_dialog(){
    this.dialogRef.close();
  }
 
  step_back() {
    if(this.step > 0) {
      this.step--;
      this.cd.detectChanges();
    }
    else {
      return;
    }
  }

  
  validate_step(i:number) {

    if(i==0) {
      if(this.registerForm.valid && this.uploaded_file) {

        if(this.multiple_submission){
          this.step++;
        }
        else{
          this.loading_project=true;
          
          let data={
            
            id_user: this.visitor_id,
            user_name:this.user_name,
            user_nickname:this.user_nickname,
            user_verified:this.visitor_certified,
            user_description:this.visitor_description,
            title:this.registerForm.value.title,
            category:this.registerForm.value.category,
            genres:this.genres,
            target_id:this.list_of_editors_ids[0],
            editor_name:this.editor_names[this.list_of_editors_ids[0]],
            editor_nickname:this.editor_nicknames[this.list_of_editors_ids[0]],
            formula:this.formulas[this.list_of_editors_ids[0]],
            price:this.total_price,
            delay:this.list_of_delays_in_days[this.delays[this.list_of_editors_ids[0]]],
            likes: this.likes,
            loves: this.loves,
            views: this.views,
            subscribers_number:this.subscribers_number,
            number_of_visits: this.number_of_visits,
            number_of_comics: this.number_of_comics,
            number_of_drawings: this.number_of_drawings,
            number_of_writings: this.number_of_writings,
            number_of_ads: this.number_of_ads,
            number_of_artpieces: this.number_of_artpieces,
            payement_status:"not_done",
            file_name:this.file_name,
            
          }
          this.submit_single_project(data)
        }
        this.cd.detectChanges();
      }
      else if( !this.uploaded_file ) {
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:"Veuillez télécharger votre dossier PDF"},
          panelClass: "popupConfirmationClass",
        });
      }
      else if( !this.registerForm.valid) {
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:"Veuillez correctement remplir le formulaire"},
          panelClass: "popupConfirmationClass",
        });
      }
    }
    else if(i==1) {
      let pass=true
      for(let k=0;k<this.list_of_editors_ids.length;k++){
        if(!this.list_of_selected_formulas[this.list_of_editors_ids[k]]){
          pass=false;
        }
      }

      if(!pass){
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:"Veuillez sélectionner une formule pour chaque éditeur."},
          panelClass: "popupConfirmationClass",
        });
        return
      }
      else{
        
        this.loading_project=true;
        this.submit_multiple_project()
      }
    }
  }


  
  open_applications(){
    this.dialogRef.close(true);
  }

  stripe:any;

  submit_single_project(data){
    this.navbar.add_page_visited_to_history(`/submit_single_project`,this.device_info).pipe( first() ).subscribe();
    this.Edtior_Projects.submit_project_for_editor(data).subscribe(r=>{
      this.NotificationsService.add_notification('apply',this.visitor_id,this.user_name,this.list_of_editors_ids[0],data.formula,'none','none',r[0].id,0,"add",false,0).pipe(first() ).subscribe(l=>{
        let message_to_send ={
          for_notifications:true,
          type:"apply",
          id_user_name:this.user_name,
          id_user:this.visitor_id, 
          id_receiver:this.list_of_editors_ids[0],
          publication_category:data.formula,
          publication_name:'none',
          format:'none',
          publication_id:r[0].id,
          chapter_number:0,
          information:"add",
          status:"unchecked",
          is_comment_answer:false,
          comment_id:0,
        }
       
        this.id_project=r[0].id
        let URL = url + `${r[0].id}/${this.file_name}/false`;
        this.uploader.setOptions({ url: URL});
        this.uploader.queue[0].upload();

        
        this.chatService.messages.next(message_to_send);
        this.cd.detectChanges();
      })
     
    })
  }


  submit_multiple_project(){
    let compteur=0;

    this.navbar.add_page_visited_to_history(`/submit_multiple_project_before_payement`,this.device_info).pipe( first() ).subscribe();
    for(let i=0;i<this.list_of_editors_ids.length;i++){

      let data={
          
        is_multiple:true,
        id_multiple:this.id_multiple,

        id_user: this.visitor_id,
        user_name:this.user_name,
        user_nickname:this.user_nickname,
        user_verified:this.visitor_certified,
        user_description:this.visitor_description,
        title:this.registerForm.value.title,
        category:this.registerForm.value.category,
        genres:this.genres,

        target_id:this.list_of_editors_ids[i],
        editor_name:this.editor_names[this.list_of_editors_ids[i]],
        editor_nickname:this.editor_nicknames[this.list_of_editors_ids[i]],
        formula:this.list_of_selected_formulas[this.list_of_editors_ids[i]],
        price:this.total_price,
        delay:(this.list_of_selected_formulas[this.list_of_editors_ids[i]]=="standard")?this.list_of_delays_in_days[this.standard_delays[this.list_of_editors_ids[i]]]:this.list_of_delays_in_days[this.express_delays[this.list_of_editors_ids[i]]],

        likes: this.likes,
        loves: this.loves,
        views: this.views,
        subscribers_number:this.subscribers_number,
        number_of_visits: this.number_of_visits,
        number_of_comics: this.number_of_comics,
        number_of_drawings: this.number_of_drawings,
        number_of_writings: this.number_of_writings,
        number_of_ads: this.number_of_ads,
        number_of_artpieces: this.number_of_artpieces,
        payement_status:"not_done",
        file_name:this.file_name,
        
      }

      this.Edtior_Projects.submit_project_for_editor(data).subscribe(r=>{
        compteur+=1;
        if(compteur==this.list_of_editors_ids.length){
          let URL = url + `${this.id_multiple}/${this.file_name}/true`;
          this.uploader.setOptions({ url: URL});
          this.uploader.queue[0].upload();

        }
       
      })
    }
    
  }

  check_payement_after_project_submited(){
    if(this.multiple_submission){
      this.navbar.add_page_visited_to_history(`/create_checkout_project_submission_multiple`,this.device_info).pipe( first() ).subscribe();
      if(this.total_price==0){
        this.navbar.add_page_visited_to_history(`/set_payement_done_for_project_multiple_null`,this.device_info).pipe( first() ).subscribe();
        this.Edtior_Projects.set_payement_done_for_project(this.id_multiple,true).pipe(first() ).subscribe(r=>{
          this.step=2;
          this.loading_project=false;
          if(r && r[0] && r[0].length>0){
            for(let i=0;i<r[0].length;i++){
              this.send_email_and_notifs(r[0][i]);
            }
          }
        })
      }
      else{
        this.navbar.add_page_visited_to_history(`/create_checkout_project_submission_multiple_` + this.total_price.toString(),this.device_info).pipe( first() ).subscribe();
        this.StripeService.create_checkout_project_submission(this.total_price*100,this.user_nickname,this.id_multiple,this.registerForm.value.title,this.multiple_submission).pipe(first() ).subscribe(r=>{
          this.stripe=Stripe(r[0].key)
          return this.stripe.redirectToCheckout({ sessionId: r[0].id });
        })
      }

     
    }
    else{
      this.navbar.add_page_visited_to_history(`/create_checkout_project_submission_single`,this.device_info).pipe( first() ).subscribe();
      if(this.total_price==0){
        this.navbar.add_page_visited_to_history(`/set_payement_done_for_project_single_null`,this.device_info).pipe( first() ).subscribe();
        this.Edtior_Projects.set_payement_done_for_project(this.id_project,false).pipe(first() ).subscribe(r=>{
          this.step=2;
          this.loading_project=false;
          this.send_email_and_notifs(r)
        })
      }
      else{
        this.navbar.add_page_visited_to_history(`/create_checkout_project_submission_single` +this.total_price.toString(),this.device_info).pipe( first() ).subscribe();
        this.StripeService.create_checkout_project_submission(this.total_price*100,this.user_nickname,this.id_project,this.registerForm.value.title,this.multiple_submission).pipe(first() ).subscribe(r=>{
          this.stripe=Stripe(r[0].key)
          return this.stripe.redirectToCheckout({ sessionId: r[0].id });
        })
      }
    }
  }


  send_email_and_notifs(project){
    this.NotificationsService.add_notification('apply',project.id_user,project.user_name,project.target_id,project.formula,'none','none',project.id,0,"add",false,0).pipe(first() ).subscribe(l=>{
      let message_to_send ={
        for_notifications:true,
        type:"apply",
        id_user_name:project.user_name,
        id_user:project.id_user, 
        id_receiver:project.target_id,
        publication_category:project.formula,
        publication_name:'none',
        format:'none',
        publication_id:project.id,
        chapter_number:0,
        information:"add",
        status:"unchecked",
        is_comment_answer:false,
        comment_id:0,
      }
  
      this.chatService.messages.next(message_to_send);
    })

    
   
   
  }

  /*************************************** FORMS MANAGMENT ***********************************/
  /*************************************** FORMS MANAGMENT ***********************************/
  /*************************************** FORMS MANAGMENT ***********************************/

  list_of_categories=this.ConstantsService.list_of_categories;
  registerForm: FormGroup;
  build_form() {
    this.registerForm = this.formBuilder.group({
      category: new FormControl( '', [Validators.required]),
      genres: new FormControl( this.genres, [Validators.required]),
      title:['', 
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(45),
          Validators.pattern(pattern("text")),
        ]),
      ],
    });
  }

  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  
  @ViewChild('genresInput') genresInput: ElementRef<HTMLInputElement>;
  genresCtrl = new FormControl();
  genres: string[] = [];
  filteredGenres: Observable<string[]>;
  list_of_genres=this.ConstantsService.list_of_genres;

  genre_clicked(){
    this.genresInput.nativeElement.blur()
  }
  add_genre(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if( this.genres.length >= 15 ) {
      return;
    }

    let do_not_add:boolean = true;
    let index:number;

    if ((value || '').trim()) {

      for( let i=0; i<this.list_of_genres.length; i++ ) {
        if( this.list_of_genres[i].toLowerCase() == value.toLowerCase() ) {
          do_not_add=false;
          index = i;
        }
      }
      for( let i=0; i<this.genres.length; i++ ) {
        if( this.genres[i].toLowerCase() == value.toLowerCase() ) {
          do_not_add=true;
        }
      }

      if( !do_not_add ) {
        this.genres.push(this.list_of_genres[index].trim());
      }
    }
    if (input) {
      input.value = '';
    }
    this.genresCtrl.setValue(null);
    this.registerForm.controls['genres'].updateValueAndValidity();
  }
  remove_genre(genre: string): void {
    const index = this.genres.indexOf(genre);
    if (index >= 0) {
      this.genres.splice(index, 1);
    }
    this.registerForm.controls['genres'].updateValueAndValidity();
  }
  selected_genre(event: MatAutocompleteSelectedEvent): void {
    
    

    if( this.genres.length >= 15 ) {
      this.genresInput.nativeElement.value = '';
      this.genresCtrl.setValue(null);  
      return;
    }      
    for( let i=0; i<this.genres.length; i++ ) {
      if( this.genres[i].toLowerCase() == event.option.viewValue.toLowerCase() ) {
        this.genresInput.nativeElement.value = '';
        this.genresCtrl.setValue(null);    
        return;
      }
    }
    this.genres.push(event.option.viewValue);
    this.genresInput.nativeElement.value = '';
    this.genresCtrl.setValue(null);
    this.registerForm.controls['genres'].updateValueAndValidity();
    
  }
  _filter_genre(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.list_of_genres.filter(genre => genre.toLowerCase().indexOf(filterValue) === 0);
  }





  uploaded_file:String;
  uploader:FileUploader;
  onFileClick(event) {
    event.target.value = '';
  }
  delete_file() {
    this.uploaded_file=undefined;
    if( this.uploader.queue[0] ) {
      this.uploader.queue[0].remove();
    }
  }




  list_of_real_delays={"1s":"1 semaine","2s":"2 semaines","3s":"3 semaines",
  "1m":"1 mois","6s":"6 semaines","7s":"7 semaines","2m":"2 mois",
  "3m":"3 mois","4m":"4 mois","5m":"5 mois","6m":"6 mois"}

  list_of_delays_in_days={"1s":7,"2s":14,"3s":21,
  "1m":30,"6s":42,"7s":49,"2m":60,
  "3m":90,"4m":120,"5m":150,"6m":180}

 
  update_total_price() {
    this.total_price=0;
    for(let i=0;i<this.list_of_editors_ids.length;i++) {
      if(this.list_of_selected_formulas[this.list_of_editors_ids[i]]=='standard') {
        this.total_price+=this.standard_prices[this.list_of_editors_ids[i]]
      }
      else if(this.list_of_selected_formulas[this.list_of_editors_ids[i]]=='express'){
        this.total_price+=this.express_prices[this.list_of_editors_ids[i]]
      }
    }
    this.cd.detectChanges();
  }

  list_of_selected_formulas={}
  set_formula(id:number, s:string) {
    if(this.list_of_selected_formulas[id]==s){
      this.list_of_selected_formulas[id]=null;
      this.update_total_price();
      return
    }
    this.list_of_selected_formulas[id]=s;
    this.update_total_price();
  }
  delete(i:number) {
    if(this.list_of_editors_ids.length==1) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:"Vous devez conserver au moins un éditeur"},
        panelClass: "popupConfirmationClass",
      });
      return;
    }
    this.list_of_editors_ids.splice(i,1);
    this.update_total_price();
  }




  normalize_input(fg: FormGroup, fc: string) {
    if(!fg || !fc) {
      return;
    }
    normalize_to_nfc(fg,fc);
  }



}
