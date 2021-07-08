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

import { FileUploader } from 'ng2-file-upload';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';

//ajouter une url pour upload de dossier
declare var Stripe: any;
const url = 'http://localhost:4600/routes/upload_project_for_editor/'

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
    public navbar: NavbarService,
    public dialogRef: MatDialogRef<PopupApplyComponent,any>,
    private Edtior_Projects:Edtior_Projects,
    private ConstantsService:ConstantsService,
    private StripeService:StripeService,
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


  multiple_submission:boolean;


  list_of_editors_ids=[];
  editor_pictures={};
  editor_names={};
  editor_nicknames={};
  formulas={};
  prices={};
  delays={};
  total_price=0;
  //visitor
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
  ngOnInit() {

    this.after_payement=this.data.after_payement;
    if(this.after_payement){
      this.loading_check=true;
      this.step=2;
      this.id_project=this.data.id_project;
      let password=this.data.password;
      this.Edtior_Projects.check_if_payement_done(this.id_project,password).subscribe(r=>{
        if(r[0]){
          this.Edtior_Projects.set_payement_done_for_project(this.id_project).subscribe(r=>{
            this.loading_check=false;
            this.step=2;
          })
        }
        else{
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
    this.editor_pictures=this.data.editor_pictures;
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
   

    for(let i=0;i<this.list_of_editors_ids.length;i++){
      this.total_price+=this.prices[this.list_of_editors_ids[i]]
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
          //Cas dépôt de projet depuis account
          
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
    }
    else if(i==1) {

    }
  }


  
  open_applications(){
    this.dialogRef.close(true);
  }

  stripe:any;
  submit_single_project(data){
    this.Edtior_Projects.submit_project_for_editor(data).subscribe(r=>{
      this.id_project=r[0].id
      let URL = url + `${r[0].id}/${this.file_name}`;
      this.uploader.setOptions({ url: URL});
      this.uploader.queue[0].upload();
    })
  }
  check_payement_after_project_submited(){
    if(this.multiple_submission){

    }
    else{
      if(this.total_price==0){
        //cas gratuit
        this.Edtior_Projects.set_payement_done_for_project(this.id_project).subscribe(r=>{
          this.step=2;
          this.loading_project=false;
        })
      }
      else{
        this.StripeService.create_checkout_project_submission(this.total_price*100,this.user_nickname,this.id_project,this.registerForm.value.title).subscribe(r=>{
          this.stripe=Stripe(r[0].key)
          return this.stripe.redirectToCheckout({ sessionId: r[0].id });
        })
      }
    }
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

    // Add our genre
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
    // Reset the input value
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
  list_of_editors=[
    {
      "picture": 'pp safeurl',
      "name": 'editeur 1',
      'standard_price':0,
      'standard_delay':"4m",
      'express_price':6,
      'express_delay':"1m",
      'selected_option':'standard',//'standard' ou 'express'
    },
    {
      "picture": 'pp safeurl',
      "name": 'editeur 2',
      'standard_price':2,
      'standard_delay':"4m",
      'express_price':6,
      'express_delay':"1m",
      'selected_option':'standard',//'standard' ou 'express'
    },
    {
      "picture": 'pp safeurl',
      "name": 'editeur 3',
      'standard_price':4,
      'standard_delay':"4m",
      'express_price':6,
      'express_delay':"1m",
      'selected_option':'standard',//'standard' ou 'express'
    }
  ]
  
  update_total_price() {
    this.total_price=0;
    for(let i=0;i<this.list_of_editors.length;i++) {
      if(this.list_of_editors[i].selected_option=='standard') {
        this.total_price+=this.list_of_editors[i].standard_price;
      }
      else {
        this.total_price+=this.list_of_editors[i].express_price;
      }
    }
    this.cd.detectChanges();
  }

  set_formula(i:number, s:string) {
    this.list_of_editors[i].selected_option=s;
    this.update_total_price();
  }
  delete(i:number) {
    if(this.list_of_editors.length==1) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:"Vous devez conserver au moins un éditeur"},
        panelClass: "popupConfirmationClass",
      });
      return;
    }
    this.list_of_editors.splice(i,1);
    this.update_total_price();
  }




  normalize_input(fg: FormGroup, fc: string) {
    if(!fg || !fc) {
      return;
    }
    normalize_to_nfc(fg,fc);
  }


 

}
