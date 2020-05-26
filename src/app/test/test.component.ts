
import { Component, OnInit, ViewChildren, QueryList, ElementRef, SimpleChanges, Input, ViewContainerRef, ChangeDetectorRef, ComponentFactoryResolver, Renderer2, ViewChild, ComponentRef } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import {DomSanitizer, SafeUrl, SafeResourceUrl} from '@angular/platform-browser';
import { FormControl, Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { BdOneShotService} from '../services/comics_one_shot.service';
import { async } from '@angular/core/testing';
import { Subject, BehaviorSubject } from 'rxjs';
import { BdSerieService } from '../services/comics_serie.service';
import { UploadService } from '../services/upload.service';
import { ConstantsService } from '../services/constants.service';
import { SwiperUploadSerieComponent } from '../swiper-upload-serie/swiper-upload-serie.component';


declare var $: any;


@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})


export class TestComponent implements OnInit {

  constructor (private rd: Renderer2, 
    private el: ElementRef,
    private _constants: ConstantsService, 
    private _upload: UploadService,
    private resolver: ComponentFactoryResolver, 
    private cd: ChangeDetectorRef,
    private viewref: ViewContainerRef,
    private bdOneShotService: BdOneShotService,
    private bdSerieService: BdSerieService,
    private fb:FormBuilder
    ){
      
  }

  
  
  ngOnInit() {
 
    
  };



  

    
}