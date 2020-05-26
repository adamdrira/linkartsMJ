import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';


declare var Cropper;


@Component({
  selector: 'app-crop-selection',
  templateUrl: './crop-selection.component.html',
  styleUrls: ['./crop-selection.component.scss']
})
export class CropSelectionComponent implements OnInit {

  constructor() {
    this.imageDestination = "";
  }


  @ViewChild("image", { static: false }) imageElement: ElementRef;

  @Input("src") imageSource: string = "../../assets/img/account.jpg";

  imageDestination: string;
  cropper: any;

  
  ngOnInit() { 


  }


  ngAfterViewInit() {
      this.cropper = new Cropper(this.imageElement.nativeElement, {
          zoomable: false,
          scalable: false,
          aspectRatio: 180/240,
          guides: false,
          viewMode: 1,
          responsive: true,
          movable: false,
          cropmove:'mousemove',
      });
  }

  set_crop() {
    const canvas = this.cropper.getCroppedCanvas();
    this.imageDestination = canvas.toDataURL("image/png");
  }





}