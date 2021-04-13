import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild, } from '@angular/core';


import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NavbarService } from '../services/navbar.service';
import { Story_service } from '../services/story.service';

import html2canvas from 'html2canvas';
import { trigger, transition, style, animate } from '@angular/animations';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { FileItem, FileUploader } from 'ng2-file-upload';
declare var Cropper;

const url = 'https://linkarts.fr/routes/upload_story';

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
  imageDestination: string = "";
  image_width:number;
  image_height:number;
  image_initial_width:number;
  image_initial_height:number;
  scale:number;
  cropper: any;
  cropperInitialized: boolean = false;
  
  
  //photo uploadée picture_blob:SafeUrl;
  picture_blob:SafeUrl;

  afficherpreview: boolean = false;
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
        console.log(re.exec(file._file.name)[1])
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
          this.picture_blob = this.sanitizer.bypassSecurityTrustUrl(url);
          this.afficherpreview = true;

          this.cd.detectChanges();
          this.initialize_cropper(this.image);
        }
      }

    };

    this.uploader.onCompleteItem = (file) => {
      location.reload();
    }
  }

  @ViewChild("image")  image : ElementRef;

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

        if( canvas.height > ((0.85 * window.innerHeight) - 51 - 63) ) {
          this.image_height = ((0.85 * window.innerHeight) - 51 - 63);
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
      return ((0.85 * window.innerHeight) - 51 - 63);
    }
    else {
      return ((window.innerHeight) - 51 - 63);
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
    
    if( !this.imageDestination && this.afficherpreview ) {
      this.remove_beforeupload(this.uploader.queue[0]);
      this.afficherpreview = false;
      this.cropperInitialized=false;
    }
    else {
      this.cropperInitialized=false;
      this.imageDestination='';
  
      this.cd.detectChanges();
      this.initialize_cropper(this.image);
    }
    
  }

  //lorsqu'on supprime l'item avant l'upload, on l'enlève de l'uploader queue et on affiche l'uplaoder
  remove_beforeupload(item: FileItem) {
    item.remove();
    this.afficherpreview = false;
  }
  
  onFileClick(event) {
    event.target.value = '';
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
      return;
    }
    this.set_no_activated_objects();
    this.loading=true;

    this.set_no_activated_objects();
    this.cd.detectChanges();
    
    var THIS = this;
    
    html2canvas( this.image_container.nativeElement ).then(canvas => {
      canvas.toBlob(
        blob => {
          THIS.set_no_activated_objects();
          
          THIS.cd.detectChanges();
          
          THIS.Story_service.upload_story( blob ).subscribe(res => {
            console.log(res)
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


  stop(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  };


}
