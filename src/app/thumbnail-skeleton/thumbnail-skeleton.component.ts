import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';

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
  
  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.resize_skeleton();
  }
  
  //Comic functions

  resize_skeleton() {

    if( $('.container-skeletons') ) {
      $('.skeleton-container').css({'width': this.get_skeleton_size() +'px'});
    }
  }

  get_skeleton_size() {
    return $('.container-skeletons').width()/this.skeletons_per_line();
  }

  skeletons_per_line() {
    var width = $('.container-skeletons').width();

    var n = Math.floor(width/250);
    if( width < 500 ) {
      this.send_number_of_skeletons.emit({number:1});
      return 1;
    }
    else {
      this.send_number_of_skeletons.emit({number:n});
      return n;
    }
  }

}
