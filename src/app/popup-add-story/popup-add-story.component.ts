import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren, } from '@angular/core';


import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NavbarService } from '../services/navbar.service';
import { Story_service } from '../services/story.service';

import { trigger, transition, style, animate } from '@angular/animations';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { FileItem, FileUploader } from 'ng2-file-upload';


import ImageEditor from "tui-image-editor";

declare var $:any;


const url = 'http://localhost:4600/routes/upload_story';

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
            
            this.cd.detectChanges();
            this.image_editor.clearUndoStack();
            this.image_editor.clearRedoStack();
          });
          
          
        }
      }

    };

    this.uploader.onCompleteItem = (file) => {
      location.reload();
    }
  }

  


  //lorsqu'on supprime l'item avant l'upload, on l'enlève de l'uploader queue et on affiche l'uplaoder
  remove_beforeupload(item: FileItem) {
    item.remove();
  }
  
  onFileClick(event) {
    event.target.value = '';
  }


  loading=false;

  send_picture() {

    if(this.loading){
      return;
    }

    this.loading=true;
    this.cd.detectChanges();

    var THIS = this;
    
    
    let blob = this.dataURItoBlob( this.image_editor.toDataURL({format: 'png'}) );
    

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
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);
  
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  
    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
  
    // create a view into the buffer
    var ia = new Uint8Array(ab);
  
    // set the bytes of the buffer to the correct values
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
  
    // write the ArrayBuffer to a blob, and you're done
    var blob = new Blob([ab], {type: mimeString});
    return blob;
  
  }


  close_dialog(){
    this.dialogRef.close();
  }

  stop(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  };



  @ViewChild("imageEditorContainer")  imageEditorContainer : ElementRef;
  @ViewChild("editionContainer")  editionContainer : ElementRef;
  image_editor:any;


  set_brush_opacity() {
    if(this.image_editor) {
      this.image_editor.setBrush({
        color: this.hexToRgbA(this.image_editor.ui.draw.color),
      });
    }
  }
  hexToRgbA(hex){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',1)';
    }
    throw new Error('Bad Hex');
  }


  initialize_image_editor() {
    
    this.image_editor = new ImageEditor( this.imageEditorContainer.nativeElement, {
      
      usageStatistics: false,
      
      includeUI: {
        menuBarPosition: 'top',
      },

      cssMaxWidth: this.editionContainer.nativeElement.offsetWidth,
      cssMaxHeight: this.editionContainer.nativeElement.offsetHeight - 56 - 70 - 54 - 5,

      selectionStyle: { cornerStyle: "circle", cornerSize: 25, cornerColor: "#ffffff", cornerStrokeColor: "#000000", transparentCorners: false, lineWidth: 1, borderColor: "#ffffff", }
      
    });
    

    this.image_editor.ui.activeMenuEvent();
    
    let THIS = this;
    $('.tie-text-color').on( "click", function() {
      $('.color-picker-control').css('top', $('.tie-text-color').offset().top + 38);
      $('.color-picker-control').css('left', $('.tie-text-color').offset().left - 75);
    });
    
    $('.tui-image-editor').mousedown(
      {param1 : THIS},
      function(event) {
        THIS.set_brush_opacity();
      }
    );
    $('.tie-btn-draw').click(
      {param1 : THIS},
      function(event) {
        THIS.set_brush_opacity();
      }
    );
    $('.tui-image-editor-submenu-item').click(
      {param1 : THIS},
      function(event) {
        THIS.set_brush_opacity();
      }
    );

    $('.tie-draw-color').click(
      {param1 : THIS},
      function(event) {
        $('.color-picker-control').css('top', $('.tie-draw-color').offset().top + 38);
        $('.color-picker-control').css('left', $('.tie-draw-color').offset().left - 75);
        THIS.set_brush_opacity();
      }
    );

    
    
    $('.tie-color-fill').on( "click", function() {
      $('.color-picker-control').css('top', $('.tie-color-fill').offset().top + 38);
      $('.color-picker-control').css('left', $('.tie-color-fill').offset().left - 75);
    });
    $('.tie-color-stroke').on( "click", function() {
      $('.color-picker-control').css('top', $('.tie-color-stroke').offset().top + 38);
      $('.color-picker-control').css('left', $('.tie-color-stroke').offset().left - 75);
    });
    $('.tie-icon-color').on( "click", function() {
      $('.color-picker-control').css('top', $('.tie-icon-color').offset().top + 38);
      $('.color-picker-control').css('left', $('.tie-icon-color').offset().left - 75 - 86);
    });


  }


  @HostListener('window:mouseup', ['$event'])
  mouseUp(event){
    this.set_brush_opacity();
  }
  @HostListener('window:mousedown', ['$event'])
  mouseDown(event){
    this.set_brush_opacity();
  }

  ngAfterViewInit() {
        
  }
  

}