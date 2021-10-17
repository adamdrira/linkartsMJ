import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren, } from '@angular/core';


import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NavbarService } from '../services/navbar.service';
import { Story_service } from '../services/story.service';

import { trigger, transition, style, animate } from '@angular/animations';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { FileItem, FileUploader } from 'ng2-file-upload';


import ImageEditor from "tui-image-editor";


const url = 'https://www.linkarts.fr/routes/upload_story';

@Component({
  selector: 'app-popup-add-story',
  templateUrl: './popup-add-story.component.html',
  styleUrls: ['./popup-add-story.component.scss'],
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
export class PopupAddStoryComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PopupAddStoryComponent>,
    public dialog: MatDialog,
    private cd:ChangeDetectorRef,
    private navbar: NavbarService,
    private sanitizer : DomSanitizer,
    private Story_service: Story_service,
    ) { 
    dialogRef.disableClose = true;
    navbar.visibility_observer_font.subscribe(font=>{
      if(font){
        this.show_icon=true;
      }
    })

    this.uploader = new FileUploader({
      itemAlias: 'cover',
      url: url,

    });

    this.hasBaseDropZoneOver = false;
    this.hasAnotherDropZoneOver = false;
  }

  show_icon=false;
  step=0;
  imageSource: SafeUrl = "";
  imageDestination: any;

  uploader: FileUploader;
  hasBaseDropZoneOver: boolean;
  hasAnotherDropZoneOver: boolean;
  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }
  public fileOverAnother(e: any): void {
    this.hasAnotherDropZoneOver = e;
  }

  ngOnInit() {

    this.uploader.onAfterAddingFile = async (file) => {

      var re = /(?:\.([^.]+))?$/;
      let size = file._file.size / 1024 / 1024;
      let sufix =re.exec(file._file.name)[1].toLowerCase()

      if(sufix!="jpeg" && sufix!="png" && sufix!="jpg" && sufix!="gif"){
        this.uploader.queue.pop();
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: { showChoice: false, text: 'Veuillez sélectionner un fichier .jpg, .jpeg, .png, .gif' },
          panelClass: "popupConfirmationClass",
        });
      }
      else {
        if (Math.trunc(size) >= 10) {
          this.uploader.queue.pop();
          const dialogRef2 = this.dialog.open(PopupConfirmationComponent, {
            data: { showChoice: false, text: "Votre fichier est trop volumineux, veuillez saisir un fichier de moins de 10mo (" + (Math.round(size * 10) / 10) + "mo)" },
            panelClass: "popupConfirmationClass",
          });
        }
        else {
          file.withCredentials = true;
          let url = (window.URL) ? window.URL.createObjectURL(file._file) : (window as any).webkitURL.createObjectURL(file._file);
          
          this.imageDestination= this.sanitizer.bypassSecurityTrustUrl(url);

          this.cd.detectChanges();
          this.initialize_image_editor();
                
          this.image_editor.loadImageFromFile(file._file).then(result => {
          });

        }
      }

    };

    this.uploader.onCompleteItem = (file) => {
      location.reload();
    }
  }

  
  
  @ViewChild("image")  image : ElementRef;
  
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    
  }





  step_back() {
    
    if( this.imageDestination ) {
      this.remove_beforeupload(this.uploader.queue[0]);
      this.imageDestination=null;
    }
    
  }

  //lorsqu'on supprime l'item avant l'upload, on l'enlève de l'uploader queue et on affiche l'uplaoder
  remove_beforeupload(item: FileItem) {
    item.remove();
  }
  
  onFileClick(event) {
    event.target.value = '';
  }





  filter (node) {
    return (node.tagName !== 'i');
  }
  loading=false;

  send_picture() {
    if(this.loading){
      return;
    }

    this.loading=true;
    this.cd.detectChanges();

    var THIS = this;
    
    
    let blob = this.dataURItoBlob( this.image_editor.toDataURL() );

    THIS.Story_service.upload_story( blob ).subscribe(res => {
      if(!res[0].num && !res[0].error && !res[0].msg){
        location.reload();
      }
      else if(res[0].num){
        const dialogRef = THIS.dialog.open(PopupConfirmationComponent, {
          data: { showChoice: false, text: 'Vous ne pouvez pas ajouer plus de 15 stories par jour' },
          panelClass: "popupConfirmationClass",
        });
        THIS.loading=false;

      }
      else{
        const dialogRef = THIS.dialog.open(PopupConfirmationComponent, {
          data: { showChoice: false, text: 'Une erreur est survenue' },
          panelClass: "popupConfirmationClass",
        });
        THIS.loading=false;
      }
      
    },
    error => {
      THIS.loading = false;
        const dialogRef = THIS.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:"Une erreure s'est produite. Veuillez vérifier que votre connexion est optimale et réessayer ultérieurement."},
          panelClass: "popupConfirmationClass",
        });
    });

  }
  
  dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
  }

  close_dialog(){
    this.dialogRef.close();
  }

  stop(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  };



  @ViewChild("imageEditorContainer")  imageEditorContainer : ElementRef;
  image_editor:any;



  initialize_image_editor() {
    this.image_editor = new ImageEditor( this.imageEditorContainer.nativeElement, {
      
      usageStatistics: false,
      
      includeUI: {
        menuBarPosition: 'bottom'
      },

      cssMaxWidth: document.documentElement.clientWidth,
      cssMaxHeight: document.documentElement.clientHeight,

      selectionStyle: {
        cornerSize: 50,
        rotatingPointOffset: 100,
      },
      
    });
    
    this.image_editor.ui.activeMenuEvent();
  }



  ngAfterViewInit() {
        
  }
  

}
