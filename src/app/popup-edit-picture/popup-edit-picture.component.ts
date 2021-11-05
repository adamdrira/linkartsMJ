import { trigger, transition, style, animate } from '@angular/animations';
import { ChangeDetectorRef, Component, ElementRef, HostListener, Inject, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NavbarService } from '../services/navbar.service';
import { ChatService } from '../services/chat.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import ImageEditor from "tui-image-editor";
declare var $:any;

@Component({
  selector: 'app-popup-edit-picture',
  templateUrl: './popup-edit-picture.component.html',
  styleUrls: ['./popup-edit-picture.component.scss'],
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
export class PopupEditPictureComponent implements OnInit {

  constructor(
    private renderer: Renderer2,
    private cd:ChangeDetectorRef,
    public dialogRef: MatDialogRef<PopupEditPictureComponent>,
    public dialog: MatDialog,
    private ChatService:ChatService,
    private navbar: NavbarService,
    private sanitizer : DomSanitizer,



    @Inject(MAT_DIALOG_DATA) public data: any) {


      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
      dialogRef.disableClose = true;
      
    }

    show_icon=false;
    picture_blob:Blob;
    step=0;
    imageSource: SafeUrl = "";
    
    
    @ViewChild("image")  image : ElementRef;
    
    ngOnInit(): void {
      
      
    }

    
    ngAfterViewInit(){
      if(this.data.modify_chat_after){
        if(this.data.type=="attachment"){
          this.ChatService.get_attachment_popup(this.data.attachment_name,this.data.friend_type,this.data.chat_friend_id).subscribe(r=>{
            var file = new File([r], "name");
            this.initialize_image_editor();
            this.image_editor.loadImageFromFile(file).then(result => {
            
              this.cd.detectChanges();
              this.image_editor.clearUndoStack();
              this.image_editor.clearRedoStack();
            });
            this.cd.detectChanges();
  
          }) ;
        }
        
        else{
          this.ChatService.get_picture_sent_by_msg(this.data.attachment_name).subscribe(r=>{
            this.initialize_image_editor();
            this.image_editor.loadImageFromFile(r).then(result => {
            
              this.cd.detectChanges();
              this.image_editor.clearUndoStack();
              this.image_editor.clearRedoStack();
            });
            this.cd.detectChanges();
          })
        }
        
      }
      else if(this.data.modify_chat_before){

        this.initialize_image_editor();
        this.image_editor.loadImageFromFile(this.data.picture_file).then(result => {
            
          this.cd.detectChanges();
          this.image_editor.clearUndoStack();
          this.image_editor.clearRedoStack();
        });
        this.cd.detectChanges();
        
        
      }
    }


    @HostListener('window:resize', ['$event'])
    onResize(event) {
      
    }
    
    loading=false;


    send_picture() {
      if(this.loading){
        return;
      }
      
      let blob = this.dataURItoBlob( this.image_editor.toDataURL() );
      this.dialogRef.close(blob);
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
      console.log("initialize",this.imageEditorContainer)
      this.image_editor = new ImageEditor( this.imageEditorContainer.nativeElement, {
        
        usageStatistics: false,
        
        includeUI: {
          menuBarPosition: 'top'
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

    
    close_dialog(){
      this.dialogRef.close();
    }

    stop(e: Event) {
      e.preventDefault();
      e.stopPropagation();
    };
}
