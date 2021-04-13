import { trigger, transition, style, animate } from '@angular/animations';
import { ChangeDetectorRef, Component, ElementRef, HostListener, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NavbarService } from '../services/navbar.service';
import { ChatService } from '../services/chat.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';

import domtoimage from 'dom-to-image';
import html2canvas from 'html2canvas';

declare var Cropper;

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
    picture_blob:SafeUrl;
    step=0;
    imageSource: SafeUrl = "";
    imageDestination: string = "";
    image_width:number;
    image_height:number;
    image_initial_width:number;
    image_initial_height:number;
    scale:number;
    cropper: any;
    cropperInitialized: boolean = false;


    @ViewChild("image")  image : ElementRef;
    
    ngOnInit(): void {
      console.log("popup");
      console.log(this.data)
      if(this.data.modify_chat_after){
        var re = /(?:\.([^.]+))?$/;

        if(this.data.type=="attachment"){
          this.ChatService.get_attachment_popup(this.data.attachment_name,this.data.friend_type,this.data.chat_friend_id).subscribe(r=>{
          
            if(re.exec(this.data.attachment_name)[1].toLowerCase()=="svg"){
              let THIS=this;
              var reader = new FileReader()
              reader.readAsText(r);
              reader.onload = function(this) {
                  let blob = new Blob([reader.result], {type: 'image/svg+xml'});
                  let url = (window.URL) ? window.URL.createObjectURL(blob) : (window as any).webkitURL.createObjectURL(blob);
                  const SafeURL = THIS.sanitizer.bypassSecurityTrustUrl(url);
                  THIS.picture_blob= SafeURL;
                  console.log(THIS.picture_blob)
                  THIS.cd.detectChanges();
                  THIS.initialize_cropper(THIS.image)
              }
            }
            else{
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.picture_blob= SafeURL;
              this.cd.detectChanges();
              this.initialize_cropper(this.image)
            }
            
  
          }) ;
        }
        else{
          this.ChatService.get_picture_sent_by_msg(this.data.attachment_name).subscribe(r=>{
          
            if(re.exec(this.data.attachment_name)[1].toLowerCase()=="svg"){
              let THIS=this;
              var reader = new FileReader()
              reader.readAsText(r);
              reader.onload = function(this) {
                  let blob = new Blob([reader.result], {type: 'image/svg+xml'});
                  let url = (window.URL) ? window.URL.createObjectURL(blob) : (window as any).webkitURL.createObjectURL(blob);
                  const SafeURL = THIS.sanitizer.bypassSecurityTrustUrl(url);
                  THIS.picture_blob= SafeURL;
                  console.log(THIS.picture_blob)
                  THIS.cd.detectChanges();
                  THIS.initialize_cropper(THIS.image)
              }
            }
            else{
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.picture_blob= SafeURL;
              this.cd.detectChanges();
              this.initialize_cropper(this.image)
            }
            
  
          }) ;
        }
        
      }
      else if(this.data.modify_chat_before){
        this.picture_blob=this.data.picture_blob;
        this.cd.detectChanges();
        this.initialize_cropper(this.image)
      }
      
    }

    initialize_cropper(content: ElementRef) {
    
      if( !this.cropperInitialized ) {
        this.cropper = new Cropper(content.nativeElement, {
          guides: true,
          viewMode:2,
          center:true,
          restore:false,
          zoomOnWheel:false,
          fillColor: 'rgb(32,56,100)'
  
        });
        this.cropperInitialized = true;
      }
  
      this.cd.detectChanges();
    }
    

    set_crop() {
    

      const canvas = this.cropper.getCroppedCanvas();
  
      if( ((canvas.height / canvas.width) < (180/300)) ) {
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, higher_crop:true, text:"Veuillez augmenter la hauteur, ou réduire la largeur du rognage"},
          panelClass: "popupConfirmationClass",
        });
        return;
      }
      else if( ((canvas.height / canvas.width) > (600/300)) ) {
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, larger_crop:true, text:"Veuillez augmenter la largeur, ou réduire la hauteur du rognage"},
          panelClass: "popupConfirmationClass",
        });
        return;
      }

      canvas.toBlob(blob => {
        if(this.imageDestination==''){
          this.imageDestination = canvas.toDataURL("image/png");

          this.image_width = canvas.width;
          this.image_height = canvas.height;
          this.image_initial_width = canvas.width;
          this.image_initial_height = canvas.height;
          this.scale= this.image_height / this.image_width;

          if( canvas.height > ((0.85 * window.innerHeight) - 51 - 66 - 80 - 46) ) {
            this.image_height = ((0.85 * window.innerHeight) - 51 - 66 - 80 - 46);
          }
          else {
            this.image_height = canvas.height;
          }
          

          if( canvas.width > 0.8 * window.innerWidth ) {
            this.image_width = 0.8 * window.innerWidth;
          }
          else {
            this.image_width = canvas.width;
          }
          

          this.cd.detectChanges();
          this.update_image_container_size();
        }
      }, "image/png");
      
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
      this.update_image_container_size();
    }
    

    //width: 1080
    //height: 1349
    update_image_container_size() {
      if(this.imageDestination) {
        
        if( this.image_initial_height < this.get_height_available() && this.image_initial_width < this.get_width_available() ) {
          this.image_height = this.image_initial_height;
          this.image_width = this.image_initial_width;
        }

        if( this.image_initial_height > this.get_height_available() && this.image_initial_width < this.get_width_available() ) {
          this.image_height = this.get_height_available();
          this.image_width = this.image_height / this.scale;
          return;
        }

        if( this.image_initial_height < this.get_height_available() && this.image_initial_width > this.get_width_available() ) {
          this.image_width = this.get_width_available();
          this.image_height = this.scale * this.image_width;
          return;
        }


        if( this.image_initial_height > this.get_height_available() && this.image_initial_width > this.get_width_available() ) {
          
          /*if( (this.image_initial_height - this.get_height_available()) > (this.image_initial_width - this.get_width_available() ) ) {
            this.image_height = this.get_height_available();
            this.image_width = this.image_height / this.scale;
          }
          else {
            this.image_width = this.get_width_available();
            this.image_height = this.scale * this.image_width;
          }*/

          if( this.scale * this.get_width_available() > this.get_height_available() ) {
            this.image_height = this.get_height_available();
            this.image_width = this.image_height / this.scale;
          }
          else {
            this.image_width = this.get_width_available();
            this.image_height = this.scale * this.image_width;
          }

        }
      }
      
    }


    get_height_available() {
      if( window.innerWidth > 650 ) {
        return ((0.85 * window.innerHeight) - 51 - 66 - 80 - 46);
      }
      else {
        return ((window.innerHeight) - 51 - 66 - 80 - 46);
      }
    }

    get_width_available() {
      if( window.innerWidth > 650 ) {
        return 0.8 * window.innerWidth;
      }
      else {
        return window.innerWidth;
      }
    }


    rectangles: any[] = [];
    add_rectangle() {
      this.rectangles.push( {
        stroke_color:'black',
        background_color:'transparent',
        height:50,
        width:50,
        rotation:0,
        stroke_width:6,
        z_index:this.get_max_index()+1,
      });
      this.set_no_activated_objects();
      this.activated_rectangle = this.rectangles.length - 1;
    }


    
    larger_rectangle(i: number) {
      this.rectangles[i].width = this.rectangles[i].width + 10;
      this.cd.detectChanges();
      window.dispatchEvent(new Event('resize'));
    }
    thiner_rectangle(i: number) {
      this.rectangles[i].width = this.rectangles[i].width - 10;
      this.cd.detectChanges();
      window.dispatchEvent(new Event('resize'));
    }
    higher_rectangle(i: number) {
      this.rectangles[i].height = this.rectangles[i].height + 10;
      this.cd.detectChanges();
      window.dispatchEvent(new Event('resize'));
    }
    less_higher_rectangle(i: number) {
      this.rectangles[i].height = this.rectangles[i].height - 10;
      this.cd.detectChanges();
      window.dispatchEvent(new Event('resize'));
    }
    bigger_rectangle_stroke(i: number) {
      this.rectangles[i].stroke_width++;
      this.cd.detectChanges();
      window.dispatchEvent(new Event('resize'));
    }
    smaller_rectangle_stroke(i: number) {
      this.rectangles[i].stroke_width--;
      this.cd.detectChanges();
      window.dispatchEvent(new Event('resize'));
    }

    rotate_rectangle_clockwise(i: number) {
      this.rectangles[i].rotation = this.rectangles[i].rotation + 10;
      this.cd.detectChanges();
      window.dispatchEvent(new Event('resize'));
    }
    rotate_rectangle_anticlockwise(i: number) {
      this.rectangles[i].rotation = this.rectangles[i].rotation - 10;
      this.cd.detectChanges();
      window.dispatchEvent(new Event('resize'));
    }

    set_rectangle_font_color(s: string) {
      this.rectangles[ this.activated_rectangle ].stroke_color = s;
    }
    set_rectangle_background_color(s: string) {
      this.rectangles[ this.activated_rectangle ].background_color = s;
    }

    put_rectangle_to_front(i:number) {
      this.rectangles[ this.activated_rectangle ].z_index = this.get_max_index()+1;
    }

    set_activated_rectangle(i:number) {
      this.set_no_activated_objects();
      this.activated_rectangle = i;
    }
    remove_rectangle(i:number) {
      this.rectangles.splice(i,1);
      this.activated_rectangle = -1;
    }
    activated_rectangle=-1;





    circles: any[] = [];
    add_circle() {
      this.circles.push( {
        stroke_color:'black',
        background_color:'transparent',
        rayon:15,
        stroke_width:4,
        z_index:this.get_max_index()+1,
      });
      this.set_no_activated_objects();
      this.activated_circle = this.circles.length - 1;
    }
    bigger_circle_size(i: number) {
      this.circles[i].rayon = this.circles[i].rayon + 3;
      this.cd.detectChanges();
      window.dispatchEvent(new Event('resize'));
    }
    smaller_circle_size(i: number) {
      this.circles[i].rayon = this.circles[i].rayon - 3;
      this.cd.detectChanges();
      window.dispatchEvent(new Event('resize'));
    }

    bigger_circle_stroke(i: number) {
      this.circles[i].stroke_width++;
      this.cd.detectChanges();
      window.dispatchEvent(new Event('resize'));
    }
    smaller_circle_stroke(i: number) {
      this.circles[i].stroke_width--;
      this.cd.detectChanges();
      window.dispatchEvent(new Event('resize'));
    }

    set_circle_font_color(s: string) {
      this.circles[ this.activated_circle ].stroke_color = s;
    }
    set_circle_background_color(s: string) {
      this.circles[ this.activated_circle ].background_color = s;
    }

    put_circle_to_front(i:number) {
      this.circles[ this.activated_circle ].z_index = this.get_max_index()+1;
    }

    set_activated_circle(i:number) {
      this.set_no_activated_objects();
      this.activated_circle = i;
    }
    remove_circle(i:number) {
      this.circles.splice(i,1);
      this.activated_circle = -1;
    }
    activated_circle=-1;





    texts: any[] = [];
      
    add_text() {
      this.texts.push( {
        text:'Ajouter un texte',
        background:'white',
        font_family:'system-ui',
        font_size:14,
        rotation:0,
        font_bold:false,//600 or bold
        font_italic:false,
        font_color:'black',
        text_align:'center',//left,right,center,justified
        background_color:'white',
        z_index:this.get_max_index()+1,

      });
      this.set_no_activated_objects();
      this.activated_popup = this.texts.length - 1;
    }
    
    bigger_size(i: number) {
      this.texts[i].font_size++;
      this.cd.detectChanges();
      window.dispatchEvent(new Event('resize'));
    }
    smaller_size(i: number) {
      this.texts[i].font_size--;
      this.cd.detectChanges();
      window.dispatchEvent(new Event('resize'));
    }
    click_bold(i: number) {
      this.texts[i].font_bold = !this.texts[i].font_bold;
      this.cd.detectChanges();
      window.dispatchEvent(new Event('resize'));
    }
    click_italic(i: number) {
      this.texts[i].font_italic = !this.texts[i].font_italic;
      this.cd.detectChanges();
      window.dispatchEvent(new Event('resize'));
    }
    click_align_left(i: number) {
      this.texts[i].text_align = 'left';
      this.cd.detectChanges();
      window.dispatchEvent(new Event('resize'));
    }
    click_align_right(i: number) {
      this.texts[i].text_align = 'right';
      this.cd.detectChanges();
      window.dispatchEvent(new Event('resize'));
    }
    click_align_center(i: number) {
      this.texts[i].text_align = 'center';
      this.cd.detectChanges();
      window.dispatchEvent(new Event('resize'));
    }
    click_align_justify(i: number) {
      this.texts[i].text_align = 'justify';
      this.cd.detectChanges();
      window.dispatchEvent(new Event('resize'));
    }
    rotate_clockwise(i: number) {
      this.texts[i].rotation = this.texts[i].rotation + 10;
      this.cd.detectChanges();
      window.dispatchEvent(new Event('resize'));
    }
    rotate_anticlockwise(i: number) {
      this.texts[i].rotation = this.texts[i].rotation - 10;
      this.cd.detectChanges();
      window.dispatchEvent(new Event('resize'));
    }
    
    colors: any[] = ["no-background","white","silver","gray","black","red","maroon","yellow","olive","lime","green","aqua","teal","blue","navy","fuchsia","purple"];
    set_font_color(s: string) {
      this.texts[ this.activated_popup ].font_color = s;
    }
    set_background_color(s: string) {
      this.texts[ this.activated_popup ].background_color = s;
    }

    fonts:any[] = ["System-ui","Arial","Arial Black","Verdana","Tahoma","Trebuchet MS","Impact","Times New Roman","Didot","Georgia","American Typewriter","Andalé Mono","Courier","Lucida Console","Monaco","Bradley Hand","Brush Script MT","Luminari","Comic Sans MS"];
    set_font_family(s: string) {
      this.texts[ this.activated_popup ].font_family = s;
      this.cd.detectChanges();
      window.dispatchEvent(new Event('resize'));
    }

    put_text_to_front(i:number) {
      this.texts[ this.activated_popup ].z_index = this.get_max_index()+1;
    }

    set_activated_popup(i:number) {
      this.set_no_activated_objects();
      this.activated_popup = i;
    }
    remove_text(i:number) {
      this.texts.splice(i,1);
      if( this.texts.length ) {
        this.activated_popup = 0;
      }
      else {
        this.activated_popup = -1;
      }
    }
    activated_popup=-1;


    step_back() {
      this.texts=[];
      this.activated_popup = -1;
      
      if( !this.imageDestination ) {
        return;
      }
      
      this.cropperInitialized=false;
      this.imageDestination='';

      this.cd.detectChanges();
      this.initialize_cropper(this.image);
    }

    set_no_activated_objects() {
      this.activated_circle=-1;
      this.activated_popup=-1;
      this.activated_rectangle=-1;
    }

    get_max_index() {
      let max_of_texts:number = 1010;
      let max_of_circles:number = 1010;
      let max_of_rectangles:number = 1010;

      if(this.texts) {
        for(let i=0; i<this.texts.length; i++) {
          if(this.texts[i].z_index>max_of_texts) {
            max_of_texts = this.texts[i].z_index;
          }
        }
      }

      if(this.circles) {
        for(let i=0; i<this.circles.length; i++) {
          if(this.circles[i].z_index>max_of_circles) {
            max_of_circles = this.circles[i].z_index;
          }
        }
      }

      if(this.rectangles) {
        for(let i=0; i<this.rectangles.length; i++) {
          if(this.rectangles[i].z_index>max_of_rectangles) {
            max_of_rectangles = this.rectangles[i].z_index;
          }
        }
      }

      if(max_of_texts>=max_of_circles && max_of_texts>=max_of_rectangles) {
        return max_of_texts;
      }
      else if(max_of_circles>=max_of_texts && max_of_circles>=max_of_rectangles) {
        return max_of_circles;
      }
      else {
        return max_of_rectangles;
      }
    }



    filter (node) {
      return (node.tagName !== 'i');
    }
    @ViewChild ('image_container') image_container:ElementRef;
    loading=false;

    
    send_picture() {
      if(this.loading){
        return
      }
      this.loading=true;

      this.set_no_activated_objects();
      var THIS = this;
      
      html2canvas( this.image_container.nativeElement ).then(canvas => {
        canvas.toBlob(
          blob => {
            THIS.dialogRef.close(blob);
          },
          'image/png',
          1,
        );

        THIS.loading=false;
      });

    }
    

    close_dialog(){
      this.dialogRef.close();
    }
}
