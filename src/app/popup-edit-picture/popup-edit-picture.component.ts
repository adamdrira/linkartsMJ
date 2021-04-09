import { trigger, transition, style, animate } from '@angular/animations';
import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NavbarService } from '../services/navbar.service';
import { Location } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { max } from 'rxjs/operators';

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
    private location: Location,
    public dialog: MatDialog,
    private navbar: NavbarService,
    private sanitizer : DomSanitizer,



    @Inject(MAT_DIALOG_DATA) public data: any) {


      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
      dialogRef.disableClose = true;
      this.picture_blob=this.sanitizer.bypassSecurityTrustUrl(data.picture_blob);
    }

    show_icon=false;
    picture_blob:SafeUrl;
    step=0;
    imageSource: SafeUrl = "";
    imageDestination: string = "";
    cropper: any;
    cropperInitialized: boolean = false;


    @ViewChild("image") set imageElement(content: ElementRef) {
      if( this.picture_blob ) {
        this.initialize_cropper(content);
      }
    }
    
    
    ngOnInit(): void {
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
          this.cd.detectChanges();
        }
      }, "image/png");
      
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
      this.activated_circle = this.circles.length - 1;
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
      //this.initialize_cropper(this.imageElement);
    }

    set_no_activated_objects() {
      this.activated_circle=-1;
      this.activated_popup=-1;
      this.activated_rectangle=-1;
    }

    get_max_index() {
      let max_of_texts:number = 0;
      let max_of_circles:number = 0;
      let max_of_rectangles:number = 0;

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

    
}
