import { Component } from '@angular/core';
import {ElementRef,Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';

declare var $:any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private rd: Renderer2) {}

  


  ngAfterViewInit() {
    console.log(this.rd);
    
    
  }

  ngOnInit() {
  }




}