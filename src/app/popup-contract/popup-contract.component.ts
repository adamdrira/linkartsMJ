import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NavbarService } from '../services/navbar.service';
import { FileUploader } from 'ng2-file-upload';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { trigger, transition, style, animate } from '@angular/animations';

const url = '';

@Component({
  selector: 'app-popup-contract',
  templateUrl: './popup-contract.component.html',
  styleUrls: ['./popup-contract.component.scss'],
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


export class PopupContractComponent implements OnInit {

  constructor(
    private cd: ChangeDetectorRef,
    public navbar: NavbarService,
    public dialogRef: MatDialogRef<PopupContractComponent,any>,
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
  }

  show_icon=false;


  ngOnInit(): void {

    
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
          /*var today = new Date();
          var ss = String(today.getSeconds()).padStart(2, '0');
          var mi = String(today.getMinutes()).padStart(2, '0');
          var hh = String(today.getHours()).padStart(2, '0');
          var dd = String(today.getDate()).padStart(2, '0');
          var mm = String(today.getMonth() + 1).padStart(2, '0'); 
          var yyyy = today.getFullYear();
          let Today = yyyy + mm + dd + hh+ mi + ss;
          this.file_name = this.visitor_id + '-' + Today + '.' + sufix;*/

          this.uploaded_file=this.uploader.queue[0]._file.name;
          file.withCredentials = true;

          
        }
        
      }
    };

    this.uploader.onCompleteItem = (file) => {
    }

  }

  close_dialog(){
    this.dialogRef.close();
  }


  uploaded_file:String;
  uploader: FileUploader;

  hasBaseDropZoneOver: boolean;
  hasAnotherDropZoneOver: boolean;
  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }
  public fileOverAnother(e: any): void {
    this.hasAnotherDropZoneOver = e;
  }

  //file_name:string;
  onFileClick(event) {
    event.target.value = '';
  }
  delete_file() {

    if( !this.loading_step_1 ) {
      this.uploaded_file=undefined;
      if( this.uploader.queue[0] ) {
        this.uploader.queue[0].remove();
      }
    }
    else {
      return;
    }
  }


  cgu_accepted:boolean = false;
  display_cgu_error:boolean = false;
  setCgu(e){
    if(e.checked){
      this.cgu_accepted = true;
    }else{
    this.cgu_accepted = false;
    }
  }


  page_0_step=0;
  step_back() {
    this.page_0_step = 0;
  }
  category:number;//0: collaboration bénévole, 1: collaboration rémunérée, 2: contrat de travail.
  set_category(i:number) {
    this.category=i;
    this.page_0_step++;
  }
  loading_step_1=false;
  validate_step(i){

    if(i==0) {

    }
    else if(i==1) {

      if( this.uploaded_file && !this.loading_step_1 && this.cgu_accepted ) {
        this.loading_step_1 = true;



      }
      else if( !this.uploaded_file ) {
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:"Veuillez télécharger votre contrat PDF"},
          panelClass: "popupConfirmationClass",
        });
      }
      else if( !this.cgu_accepted ) {
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:"Veuillez accepter les conditions"},
          panelClass: "popupConfirmationClass",
        });
      }
    }
    
  }


  list_of_members = [
    {
      name: "adam drira",
      pseudo: "test",
      status: "signed",
    },
    {
      name: "mokhtar meghaichi",
      pseudo: "test_2323",
      status: "waiting",
    },
  ];
  
  stop(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  };

  read_contract() {

  }

}
