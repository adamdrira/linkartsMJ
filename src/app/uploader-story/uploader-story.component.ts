import { Component, OnInit,  ElementRef,  ViewChild, Renderer2, ChangeDetectorRef, HostListener } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { DomSanitizer, SafeUrl} from '@angular/platform-browser';
import { Story_service } from '../services/story.service';
import { MatDialog } from '@angular/material/dialog';

import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { trigger, transition, style, animate } from '@angular/animations';
import domtoimage from 'dom-to-image';
import { NavbarService } from '../services/navbar.service';


const url = 'http://localhost:4600/routes/upload_story';

@Component({
  selector: 'app-uploader-story',
  templateUrl: './uploader-story.component.html',
  styleUrls: ['./uploader-story.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(0)', opacity: 0 }),
        animate('400ms', style({ transform: 'translateX(0px)', opacity: 1 }))
      ])
    ]
    ),
    trigger(
      'enterAnimation2', [
      transition(':enter', [
        style({ 'max-height': '578px', opacity: 0.8 }),
        animate('3000ms ease-out', style({ 'max-height': '1500px', opacity: 1 }))
      ])
    ]),
  ],
})
export class UploaderStoryComponent implements OnInit {



  constructor(
    private Story_service: Story_service,
    private rd: Renderer2,
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    public dialog: MatDialog,
    private navbar: NavbarService,
  ) {
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

  load_emoji=false;


  imageSource: SafeUrl = "";
  uploader: FileUploader;
  hasBaseDropZoneOver: boolean;
  hasAnotherDropZoneOver: boolean;
  image_to_show:any;
  //pour cacher l'uploader dans certains cas
  afficherpreview: boolean = false;

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  public fileOverAnother(e: any): void {
    this.hasAnotherDropZoneOver = e;
  }

  show_icon=false;
  ngOnInit() {

    let inter= setInterval(() => {
      this.load_emoji=true;
      clearInterval(inter)
    }, 1000);

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
          this.image_to_show = this.sanitizer.bypassSecurityTrustUrl(url);
          this.afficherpreview = true;
                    
        
        }
      }

    };

    this.uploader.onCompleteItem = (file) => {
      location.reload();
    }
  };

  
  @ViewChild("validator") validator:ElementRef;
  load_image(){
    this.validator.nativeElement.scrollIntoView({behavior: "smooth"});
  }

  //on affiche le preview du fichier ajouté
  displayContent(item: FileItem): SafeUrl {
    let url = (window.URL) ? window.URL.createObjectURL(item._file) : (window as any).webkitURL.createObjectURL(item._file);
    const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
    return SafeURL;
  }

  step_back() {

    //this.uploader.clearQueue();
    this.texts=[];
    this.activated_popup = -1;
    this.remove_beforeupload(this.uploader.queue[0]);
    this.afficherpreview = false;
  }

  //lorsqu'on supprime l'item avant l'upload, on l'enlève de l'uploader queue et on affiche l'uplaoder
  remove_beforeupload(item: FileItem) {
    item.remove();
    this.afficherpreview = false;
  }

  onFileClick(event) {
    event.target.value = '';
  }

  @ViewChild ('image_container') image_container:ElementRef;
  @ViewChild ('image') image:ElementRef;
  texts: any[] = [];
  add_text() {
    this.texts.push( {
      text:'Nouveau texte',
      background:'white',
      font_family:'system-ui',
      font_size:14,
      rotation:0,
      font_bold:false,//600 or bold
      font_italic:false,
      font_color:'black',
      text_align:'left',//left,right,center,justified
      background_color:'white'

    });

    this.activated_popup = this.texts.length - 1;
  }
  
  bigger_size(i: number) {
    this.texts[i].font_size++;
    this.cd.detectChanges();
  }
  smaller_size(i: number) {
    this.texts[i].font_size--;
    this.cd.detectChanges();
  }
  click_bold(i: number) {
    this.texts[i].font_bold = !this.texts[i].font_bold;
  }
  click_italic(i: number) {
    this.texts[i].font_italic = !this.texts[i].font_italic;
  }
  click_align_left(i: number) {
    this.texts[i].text_align = 'left';
  }
  click_align_right(i: number) {
    this.texts[i].text_align = 'right';
  }
  click_align_center(i: number) {
    this.texts[i].text_align = 'center';
  }
  click_align_justify(i: number) {
    this.texts[i].text_align = 'justify';
  }
  rotate_clockwise(i: number) {
    this.texts[i].rotation = this.texts[i].rotation + 10;
    this.cd.detectChanges();
  }
  rotate_anticlockwise(i: number) {
    this.texts[i].rotation = this.texts[i].rotation - 10;
    this.cd.detectChanges();
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
  }

  set_activated_popup(i:number) {

    this.activated_popup = i;
    /*this.texts[i].leftPosition = 50 + (e.source.getFreeDragPosition().x / this.image.nativeElement.offsetWidth) * 100;
    this.texts[i].bottomPosition = 50 - (e.source.getFreeDragPosition().y / this.image.nativeElement.offsetHeight) * 100;

    console.log( this.texts[i].leftPosition );
    console.log( this.texts[i].bottomPosition );*/
  }
  reset_style(i:number) {
    this.texts.splice(i,1,
      {
        text: this.texts[i].text,
        background:'white',
        font_family:'system-ui',
        font_size:14,
        rotation:0,
        font_bold:false,//600 or bold
        font_italic:false,//600 or bold
        font_color:'black',
        text_align:'left',//left,right,center,justified
        background_color:'white',
  
      });
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
  

  loading=false;
  set_crop() {

    if(this.loading){
      return
    }
    this.loading=true;

    this.set_activated_popup(-1);
    var THIS = this;
      


    setTimeout(() => domtoimage.toSvg(this.image_container.nativeElement, {filter: THIS.filter})
    .then(function (svg) {

        const svg_file = svg.replace(/data:image\/svg\+xml;charset=utf-8,/, '');
        //console.log(svg_file);

        const blob = new Blob([svg_file], {type: ''});

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
        })
    })
    .catch(function (error) {
      const dialogRef = THIS.dialog.open(PopupConfirmationComponent, {
        data: { showChoice: false, text: 'Une erreur est survenue' },
        panelClass: "popupConfirmationClass",
      });
      THIS.loading=false;
    }), 1000);

  }

  filter (node) {
    return (node.tagName !== 'i');
  }
  


  show_emojis=false;
  set = 'native';
  native = true;
  @ViewChild('emojis') emojis:ElementRef;
  @ViewChild('emoji_button') emoji_button:ElementRef;
  open_emojis(){
    if( !this.show_emojis ) {
      this.show_emojis=true;
      this.rd.setStyle(this.emojis.nativeElement, 'visibility', 'visible');
    }
    else {
      this.rd.setStyle(this.emojis.nativeElement, 'visibility', 'hidden');
      this.show_emojis=false;
    }
  }

  handleClick($event, i : number) {
    //this.selectedEmoji = $event.emoji;

    let data = this.texts[i];
    if(data){
      this.texts[i].text = this.texts[i].text + $event.emoji.native;
    }
    this.cd.detectChanges();
  }
  
  //click lisner for emojis, and research chat
  @HostListener('document:click', ['$event.target'])
  clickout(btn) {
    if(this.show_emojis){
      console.log("emoji shown");
      if (!(this.emojis.nativeElement.contains(btn) || this.emoji_button.nativeElement.contains(btn))){
        console.log('on est ailleurs');
        this.rd.setStyle(this.emojis.nativeElement, 'visibility', 'hidden');
        this.show_emojis=false;
      }
    }
  }

}