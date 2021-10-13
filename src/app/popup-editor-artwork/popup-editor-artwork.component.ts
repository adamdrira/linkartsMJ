import { trigger, transition, style, animate } from '@angular/animations';
import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { normalize_to_nfc, pattern } from '../helpers/patterns';
import { NavbarService } from '../services/navbar.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { FileUploader } from 'ng2-file-upload';
import { DomSanitizer } from '@angular/platform-browser';
import { first } from 'rxjs/operators';

const url = 'https://www.linkarts.fr/routes/upload_artwork_for_editor/';

@Component({
  selector: 'app-popup-editor-artwork',
  templateUrl: './popup-editor-artwork.component.html',
  styleUrls: ['./popup-editor-artwork.component.scss'],
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
export class PopupEditorArtworkComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private sanitizer:DomSanitizer, 
    public navbar: NavbarService,
    private Profile_Edition_Service:Profile_Edition_Service,
    public dialogRef: MatDialogRef<PopupEditorArtworkComponent,any>,
    public dialog: MatDialog,
    @Inject(DOCUMENT) private document: Document,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
    dialogRef.disableClose = true;

    navbar.visibility_observer_font.subscribe(font=>{
      if(font){
        this.show_icon=true;
      }
    })

    this.uploader = new FileUploader({
    itemAlias: 'image', 
    url:url,

    });

    this.hasBaseDropZoneOver = false;
    this.hasAnotherDropZoneOver = false;
  }

  show_icon=false;
  id_user:number;
  file_name='';
  
  ngOnInit(): void {
    
    this.id_user=this.data.id_user;
    this.build_form();

    
    this.uploader.onAfterAddingFile = async (file) => {
      
      var re = /(?:\.([^.]+))?$/;
      let size = file._file.size/1024/1024;


      let sufix =re.exec(file._file.name)[1].toLowerCase()

      if(sufix!="jpeg" && sufix!="png" && sufix!="jpg" && sufix!="gif"){
        this.uploader.queue.pop();
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Veuillez sélectionner un fichier .jpg, .jpeg, .png, .gif'},
          panelClass: "popupConfirmationClass",
        });
      }
      else{
        if(Math.trunc(size)>=10){
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
          this.file_name = this.id_user + '-' + Today + '.' + sufix;

          let url = (window.URL) ? window.URL.createObjectURL(file._file) : (window as any).webkitURL.createObjectURL(file._file);
          this.image_to_show= this.sanitizer.bypassSecurityTrustUrl(url);
          this.image_uploaded = true;

          file.withCredentials = true; 
        }
      }
    };


    this.uploader.onCompleteItem = (file) => {
      
      this.navbar.add_page_visited_to_history(`/onComplete_popup_editor_artwork`,(file._file.size/1024/1024).toString()).pipe( first() ).subscribe();
        if(this.number_of_reload>10){
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:"Erreur de connexion internet, veuilliez réitérer le processus."},
            panelClass: "popupConfirmationClass",
          });
          return
        }

        if(file.isSuccess  && file._file && file._file.size/1024/1024!=0){
          this.number_of_reload=0;
          this.dialogRef.close(this.file);
        }
        else{
          let reload_interval = setInterval(() => {
            this.uploader.queue[0].upload();
            this.number_of_reload+=1;
            clearInterval(reload_interval)
          }, 500);
        }
    }
  }

  number_of_reload=0;
  registerForm: FormGroup;
  build_form() {
    this.registerForm = this.formBuilder.group({

      title:['', 
        Validators.compose([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          Validators.pattern(pattern("text")),
        ]),
      ],
      authors:['', 
        Validators.compose([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(200),
          Validators.pattern(pattern("text")),
        ]),
      ],
      description: new FormControl( '', [
        Validators.minLength(2),
        Validators.maxLength(500),
        Validators.required,
        Validators.pattern(pattern("text_with_linebreaks")),
      ]),
      link: new FormControl( '', [
        Validators.minLength(2),
        Validators.maxLength(200),
        Validators.pattern(pattern("link")),
      ]),
      
    });
  }



  close_dialog(){
    this.dialogRef.close();
  }

  step=0;
  step_back() {
    this.step--;
  }
  validate_step(i:number) {

    if(i==0) {
      if(this.registerForm.valid) {
        this.step++;
      }
      else {
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:"Veuillez remplir tout le formulaire"},
          panelClass: "popupConfirmationClass",
        });
      }
    }

    if(i==1) {

      if(!this.image_uploaded) {
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:"Veuillez télécharger une photo de miniature"},
          panelClass: "popupConfirmationClass",
        });
      }
      else {

        this.Profile_Edition_Service.add_editor_artwork(this.registerForm.value.title.replace(/\n\s*\n\s*\n/g, '\n\n').trim(),this.registerForm.value.description.replace(/\n\s*\n\s*\n/g, '\n\n').trim(),this.registerForm.value.authors.replace(/\n\s*\n\s*\n/g, '\n\n').trim(),this.registerForm.value.link?this.registerForm.value.link:'',this.file_name).pipe( first() ).subscribe(r=>{
         
          this.file=r[0]
          let URL = url + `${this.file_name}`;
          this.uploader.setOptions({ url: URL});
          this.uploader.queue[0].upload();
        })
    

       


      }
    }
  }



  image_to_show:any;
  uploader:FileUploader;
  file:any;
  image_uploaded: boolean = false;
  hasBaseDropZoneOver:boolean;
  hasAnotherDropZoneOver:boolean;

  public fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }

  public fileOverAnother(e:any):void {
    this.hasAnotherDropZoneOver = e;
  }
  onFileClick(event) {
    event.target.value = '';
  }

  cancel_picture() {
    this.image_uploaded = false;
    this.uploader.clearQueue();
  }




  normalize_input(fg: FormGroup, fc: string) {
    if(!fg || !fc) {
      return;
    }
    normalize_to_nfc(fg,fc);
  }

}
  
  
  
  