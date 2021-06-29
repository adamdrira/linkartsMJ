import { trigger, transition, style, animate } from '@angular/animations';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { normalize_to_nfc, pattern } from '../helpers/patterns';
import { NavbarService } from '../services/navbar.service';
import { ConstantsService } from '../services/constants.service';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { DomSanitizer } from '@angular/platform-browser';

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
    private cd: ChangeDetectorRef,
    public navbar: NavbarService,
    public dialogRef: MatDialogRef<PopupEditorArtworkComponent,any>,
    private ConstantsService:ConstantsService,
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
    itemAlias: 'image', // pour la fonction en backend, préciser multer.single('image')

    });

    this.hasBaseDropZoneOver = false;
    this.hasAnotherDropZoneOver = false;
  }

  show_icon=false;
  
  
  ngOnInit(): void {
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
          let url = (window.URL) ? window.URL.createObjectURL(file._file) : (window as any).webkitURL.createObjectURL(file._file);
          this.image_to_show= this.sanitizer.bypassSecurityTrustUrl(url);
          this.image_uploaded = true;

          file.withCredentials = true; 
        }
      }
    };

  }


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
          Validators.maxLength(100),
          Validators.pattern(pattern("text")),
        ]),
      ],
      description: new FormControl( '', [
        Validators.minLength(2),
        Validators.maxLength(200),
        Validators.required,
        Validators.pattern(pattern("text_with_linebreaks")),
      ]),
      link: new FormControl( '', [
        Validators.minLength(2),
        Validators.maxLength(500),
        Validators.required,
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



      }
    }
  }



  image_to_show:any;
  uploader:FileUploader;
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
  
  
  
  