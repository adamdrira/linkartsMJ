import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NavbarService } from '../services/navbar.service';
import { ChatService } from '../services/chat.service';
import { FileUploader } from 'ng2-file-upload';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { DomSanitizer } from '@angular/platform-browser';
import { PopupAdAttachmentsComponent } from '../popup-ad-attachments/popup-ad-attachments.component';

const url = 'http://localhost:4600/routes/upload_contract/';

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
    private sanitizer:DomSanitizer,
    private ChatService:ChatService,
    public dialogRef: MatDialogRef<PopupContractComponent,any>,
    public dialog: MatDialog,
    @Inject(DOCUMENT) private document: Document,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
    dialogRef.disableClose = true;
    

    this.uploader = new FileUploader({
      url:url,
    });

    navbar.visibility_observer_font.subscribe(font=>{
      if(font){
        this.show_icon=true;
      }
    })
  }

  show_icon=false;
  id_user:number;
  is_a_group_chat:boolean;
  id_receiver:number;
  file_name:string;

  id_contract:number;
  contract:any;
  real_contract:any;
  ben_contract:any;
  rem_contract:any;
  ben_contract_pdf:any;
  rem_contract_pdf:any;
  size:number;
  ngOnInit(): void {

    this.id_user = this.data.id_user;
    this.id_contract=this.data.id_contract;
    this.ChatService.retrieve_contract("collab-ben.docx").subscribe(r=>{
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.ben_contract=SafeURL;
    })
    this.ChatService.retrieve_contract("collab-rem.docx").subscribe(r=>{
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.rem_contract=SafeURL;
    })
    this.ChatService.retrieve_contract("collab-ben.pdf").subscribe(r=>{
      this.ben_contract_pdf=r;
    })
    this.ChatService.retrieve_contract("collab-rem.pdf").subscribe(r=>{
      this.rem_contract_pdf=r
    })

    if(this.data.contract_name){
      this.ChatService.retrieve_contract(this.data.contract_name).subscribe(r=>{
        this.contract=r
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.real_contract=SafeURL;
      })
    }
    

    
    this.uploader.onAfterAddingFile = async (file) => {
        

      var re = /(?:\.([^.]+))?$/;
      this.size = file._file.size/1024/1024;
      let sufix =re.exec(file._file.name)[1].toLowerCase()

      if(sufix!="pdf"){
        this.uploader.queue.pop();
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Veuillez sélectionner un fichier .pdf'},
          panelClass: "popupConfirmationClass",
        });
      }
      else{
        if(Math.trunc( this.size )>=15){
          this.uploader.queue.pop();
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:"Votre fichier est trop volumineux, veuillez saisir un fichier de moins de 10mo ("+ (Math.round(this.size * 10) / 10)  +"mo)"},
            panelClass: "popupConfirmationClass",
          });
        }
        else{

          if(this.data.page==0){
            var today = new Date();
            var ss = String(today.getSeconds()).padStart(2, '0');
            var mi = String(today.getMinutes()).padStart(2, '0');
            var hh = String(today.getHours()).padStart(2, '0');
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); 
            var yyyy = today.getFullYear();
            let Today = yyyy + mm + dd + hh+ mi + ss;
            this.file_name = "contract-"+this.id_user + '-' + Today + '.' + sufix;
          }
          else{
            this.file_name=this.data.contract_name;
          }
         
          this.uploaded_file=this.uploader.queue[0]._file.name;
          file.withCredentials = true;

          
        }
        
      }
    };

    this.uploader.onCompleteItem = (file) => {
      this.dialogRef.close({file_name:this.file_name,size:this.size});
      this.cd.detectChanges();
     }

  }

  read_contract() {
    this.document.body.classList.add('popup-attachment-scroll');
    const dialogRef = this.dialog.open(PopupAdAttachmentsComponent, {
      data: {file:this.contract},
      panelClass: "popupDocumentClass",
    }).afterClosed().subscribe(result => {
      this.document.body.classList.remove('popup-attachment-scroll');
    });
  }


  open_contract_model(){
    let contract=(this.category==0)?this.ben_contract_pdf:this.rem_contract_pdf;
    this.document.body.classList.add('popup-attachment-scroll');
    const dialogRef = this.dialog.open(PopupAdAttachmentsComponent, {
      data: {file:contract},
      panelClass: "popupDocumentClass",
    }).afterClosed().subscribe(result => {
      this.document.body.classList.remove('popup-attachment-scroll');
    });
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
  validate_step(){
      if( this.uploaded_file && !this.loading_step_1 && this.cgu_accepted ) {
        this.loading_step_1 = true;
        let URL = url + `${this.file_name}`;
        this.uploader.setOptions({ url: URL});
        this.uploader.queue[0].upload();
      }
      else if( !this.uploaded_file ) {
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:"Veuillez télécharger votre contrat au format PDF."},
          panelClass: "popupConfirmationClass",
        });
      }
      else if( !this.cgu_accepted ) {
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:"Veuillez accepter les modalités."},
          panelClass: "popupConfirmationClass",
        });
      }
  }

  pp_loaded={}
  load_pp(i){
    this.pp_loaded[i]=true;
  }



  
  stop(e: Event) {
    e.preventDefault();
    e.stopPropagation();

   
  };

  abort_contract(i){
    let message=i==0?"rompre":"refuser";
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:`Etes-vous sûr de vouloir ${message} ce contrat ?`},
      panelClass: "popupConfirmationClass",
    }).afterClosed().subscribe(result => {
      if(result){
        this.ChatService.abort_contract(this.id_contract).subscribe(r=>{
          this.dialogRef.close({abort:true,id_contract:this.id_contract});
        })
      }
    })

    
  }

  
}
