import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';

declare var $:any;

@Component({
  selector: 'app-thumbnail-skeleton',
  templateUrl: './thumbnail-skeleton.component.html',
  styleUrls: ['./thumbnail-skeleton.component.scss']
})
export class ThumbnailSkeletonComponent implements OnInit {

  constructor() { }


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resize_skeleton();
  }

  @Output() send_number_of_skeletons = new EventEmitter<object>();
  @Input() show_other_one:boolean;
  @Input() type_of_skeleton:string;

  ngOnInit(): void {
    //console.log(this.type_of_skeleton)
  }

  ngAfterViewInit() {
    this.resize_skeleton();
  }
  
  //Comic functions
  resize_skeleton() {
  
    if(this.show_other_one ){
      console.log("show_other_one")
      this.get_skeleton_size2()
        
      $('.skeleton-container2').css({'width': this.get_skeleton_size2() +'px'});
    }
    else if( $('.container-skeletons') ) {
      if(this.type_of_skeleton!="drawing"){
        $('.skeleton-container').css({'width': this.get_skeleton_size() +'px'});
      }
      else{
         this.get_skeleton_size()
        
        $('.skeleton-container').css({'width': '210px'});
      }

    }
    
  }

  get_skeleton_size() {
    return ($('.container-skeletons').width())/this.skeletons_per_line();
  }

  get_skeleton_size2() {
    return ($('.container-skeletons2').width())/this.skeletons_per_line2();
  }

  skeletons_per_line() {
    if(this.type_of_skeleton!="drawing"){
      var width = $('.container-skeletons').width();
      var n = Math.floor(width/250);
      if( width < 500 ) {
        this.send_number_of_skeletons.emit({number:1});
        return 1;
      }
      else if(width>0){
        this.send_number_of_skeletons.emit({number:n});
        return n;
      }
    }
    else{
      
      var width = $('.container-skeletons').width();
      var n = Math.floor(width/210);
      if( width < 420 ) {
        this.send_number_of_skeletons.emit({number:1});
        return 1;
      }
      else {
        this.send_number_of_skeletons.emit({number:n});
        return n;
      }
    }
    
  }

  skeletons_per_line2() {
    var width = $('.container-skeletons2').width();
    var n = Math.floor(width/250);
    if( width < 500 ) {
      this.send_number_of_skeletons.emit({number:1});
      return 1;
    }
    else if(width>0){
      this.send_number_of_skeletons.emit({number:n});
      return n;
    }
    
  }

}
