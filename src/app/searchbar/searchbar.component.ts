import { Component, OnInit } from '@angular/core';
import { ElementRef, Renderer2, ViewChild, HostListener} from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { SearchbarService } from '../services/searchbar.service';



declare var $: any;

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({opacity: 0}),
          animate('200ms', style({opacity: 1}))
        ]),
        transition(':leave', [
          style({opacity: 1})
        ])
      ]
    )
  ]
})
export class SearchbarComponent implements OnInit {

  
panels_data: any[] ;


  constructor(private rd: Renderer2, private eRef: ElementRef, public searchbarservice: SearchbarService) { 
    this.panels_data = searchbarservice.panels_data[ searchbarservice.status ];
  }


  @ViewChild('input') input:ElementRef;
  @ViewChild('megaMenu') megaMenu:ElementRef;

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if( ! this.eRef.nativeElement.contains(event.target) ) {
      this.close_panel();
    }
  }
  
  activateBorder() {
    this.input.nativeElement.classList.add("input-box-shadow");
    this.close_panel();
  }
  disactivateBorder() {
    this.input.nativeElement.classList.remove("input-box-shadow");
  }
  //MEGA MENU FUNCTIONS
  open_panel() {
    if( this.panels_data[0].opened==0 ) {
      this.megaMenu.nativeElement.classList.add("active");
      this.panels_data[0].opened=1;
    }
    else {
      this.megaMenu.nativeElement.classList.remove("active");
      this.panels_data[0].opened=0;
    }
  }

  close_panel() {
    this.megaMenu.nativeElement.classList.remove("active");
    this.panels_data[0].opened=0;
  }
  click_checkbox(i0, i1, i2) {
    if( this.panels_data[i0][i1].values[i2].checked == 1 ) {
      this.panels_data[i0][i1].values[i2].checked=0;
    }
    else {
      this.panels_data[i0][i1].values[i2].checked=1;
    }
  }


  ngOnInit() {
    
  }


  ngAfterViewInit() {


    $(document).ready(function () {
      $('.SelectBox').SumoSelect();
    });

    this.megaMenu.nativeElement.classList.remove("active");
    this.panels_data[0].opened=0;
    


  }
  

}

