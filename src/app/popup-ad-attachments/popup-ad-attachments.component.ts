import { Component, OnInit, Inject, ChangeDetectorRef, ComponentFactoryResolver, ViewContainerRef, ViewChild, Renderer2, ViewChildren, QueryList, ElementRef, HostListener } from '@angular/core';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
import { Story_service } from '../services/story.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { SafeUrl } from '@angular/platform-browser';
import { NavbarService } from '../services/navbar.service';

declare var Swiper:any;
declare var $:any;


@Component({
  selector: 'app-popup-ad-attachments',
  templateUrl: './popup-ad-attachments.component.html',
  styleUrls: ['./popup-ad-attachments.component.scss']
})
export class PopupAdAttachmentsComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PopupAdAttachmentsComponent>,
    private cd:ChangeDetectorRef,
    private resolver: ComponentFactoryResolver, 
    private viewref: ViewContainerRef,
    private rd:Renderer2,
    private location:Location,
    private Story_service:Story_service,
    private navbar: NavbarService,
  @Inject(MAT_DIALOG_DATA) public data: any) { 
    navbar.visibility_observer_font.subscribe(font=>{
      if(font){
        this.show_icon=true;
      }
    })
   }

  
  @ViewChildren('category') categories:QueryList<ElementRef>;
  @ViewChild('leftContainer') leftContainer:ElementRef;
  @ViewChild('swiperWrapper') swiperWrapperRef:ElementRef;
  @ViewChild('swiperContainer') swiperContainerRef:ElementRef;
  @ViewChildren('swiperSlide') swiperSlides:QueryList<ElementRef>;
  @ViewChildren('thumbnail') thumbnailsRef:QueryList<ElementRef>;


  total_pages:number;
  category_index: number = 0;
  pdfSrc:SafeUrl;
  

  /******************************************************* */
  /******************** ON INIT ****************** */
  /******************************************************* */
  show_icon=false;
  ngOnInit() {
    let file = new Blob([this.data.file], {type: 'application/pdf'});
    this.pdfSrc = URL.createObjectURL(file);
  }


  /******************************************************* */
  /******************** AFTER VIEW INIT ****************** */
  /******************************************************* */
 


  afterLoadComplete(pdf: PDFDocumentProxy) {
    this.total_pages = pdf.numPages;
    this.cd.detectChanges();
  }


  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.close_dialog();
  }
  close_dialog(){
    this.dialogRef.close();
  }


}




