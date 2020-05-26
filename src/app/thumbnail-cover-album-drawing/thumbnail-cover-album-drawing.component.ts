import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-thumbnail-cover-album-drawing',
  templateUrl: './thumbnail-cover-album-drawing.component.html',
  styleUrls: ['./thumbnail-cover-album-drawing.component.scss']
})
export class ThumbnailCoverAlbumDrawingComponent implements OnInit {

  constructor() { }


  @Input('pictures_number') pictures_number:number;
  @Input('pictures_list') pictures_list:any;
  @Input('album_name') album_name:String;
  
  
  ngOnInit(): void {
    
  }



}
