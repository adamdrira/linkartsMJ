import { Component, OnInit, Input, ViewChild, ViewContainerRef, ChangeDetectorRef, ComponentFactoryResolver, Renderer2, ViewChildren, QueryList, ElementRef } from '@angular/core';

import {MatInputModule} from '@angular/material/input';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';

import { ThumbnailAlbumComicComponent } from '../thumbnail-album-comic/thumbnail-album-comic.component'
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Albums_service } from '../services/albums.service';


import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';


declare var Swiper:any;
declare var Muuri:any;
declare var $:any;


@Component({
  selector: 'app-add-album-comic',
  templateUrl: './add-album-comic.component.html',
  styleUrls: ['./add-album-comic.component.scss'],
  entryComponents: [ThumbnailAlbumComicComponent]
})
export class AddAlbumComicComponent implements OnInit {

  constructor(
    private cd:ChangeDetectorRef,
    private resolver: ComponentFactoryResolver,
    private rd:Renderer2,
    private Albums_service:Albums_service,
    private router:Router,
    public dialog: MatDialog,
  ) { }
  


  swiper:any;
  grid:any;
  now_in_seconds:number;

  @Input() author_name: string;
  @Input() user_id: number;
  @Input() profile_picture: SafeUrl;
  @Input() primary_description: string;
  @Input() list_bd_oneshot: any;
  @Input() list_bd_series: any;


  //form variables
  formName: FormControl = new FormControl('', [Validators.required, Validators.maxLength(30), Validators.pattern("^[^\\s]+.*") ]);
  albumForm: FormGroup = new FormGroup({
    formName: this.formName,
  });

  
  //Liste des contenus SELECTIONNÉS
  album_list:any[] = [];
  album_list_to_send:any[] = [];
  solution:any[] = [];
  @ViewChild('target', { read: ViewContainerRef }) target: ViewContainerRef;
  public searchText:any;

  @ViewChild('noResult') noResult:ElementRef;
  //Liste des contenus FINAUX VISIBLES (après filtrage, etc.)
  @ViewChildren('thumbnailAlbum') set thumbnailAlbums(thumbnailAlbums: QueryList<ThumbnailAlbumComicComponent>) {

    if( thumbnailAlbums.toArray().length == 0 ) {
      this.rd.setStyle( this.noResult.nativeElement, "display", "flex" );
    }
    else {
      this.rd.setStyle( this.noResult.nativeElement, "display", "none" );
    }

    if( thumbnailAlbums ) {

      for( let i=0; i < thumbnailAlbums.toArray().length; i++ ) {
        for( let j=0; j < this.album_list.length; j ++ ) {
          if( thumbnailAlbums.toArray()[i].bd_element.bd_id == this.album_list[j].instance.bd_element.bd_id && thumbnailAlbums.toArray()[i].format == this.album_list[j].instance.format ) {
            if( thumbnailAlbums ) { thumbnailAlbums.toArray()[i].selected = true; }
          }
        }
      }

    }
    this.cd.detectChanges();
    if( this.swiper ) {
      this.swiper.update();
    }
    this.cd.detectChanges();
    window.dispatchEvent(new Event('resize'));
  }


 

  ngOnInit(): void {

    this.now_in_seconds= Math.trunc( new Date().getTime()/1000);
  }

  ngAfterViewInit() {

    

    this.swiper = new Swiper('.swiper-container', {
      scrollbar: {
        el: '.swiper-scrollbar',
        hide: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        580: {
          slidesPerView: 1,
        },
        860: {
            slidesPerView: 2,
        },
        1150: {
            slidesPerView: 3,
        },
        1450: {
            slidesPerView: 4,
        },
        1770: {
            slidesPerView: 5,
        }
      }
    });

  }


  

  add_to_album(e1:any) {

    let index_in_list:number;

    for( let i = 0; i < this.album_list.length; i++ ) {
      if( this.album_list[ i ].instance.bd_element.bd_id == e1.id_key && this.album_list[ i ].instance.format == e1.format ) {
        return;
      }
    }
    
    if( e1.format == 'one-shot' ) {
      for( let i = 0; i < this.list_bd_oneshot.length; i++ ) {
        if( this.list_bd_oneshot[i].bd_id == e1.id_key ) {
          index_in_list = i;
        }
      }
    }
    else if( e1.format == 'serie' ) {
      for( let i = 0; i < this.list_bd_series.length; i++ ) {
        if( this.list_bd_series[i].bd_id == e1.id_key ) {
          index_in_list = i;
        }
      }
    }

    

    this.cd.detectChanges();

    const factory = this.resolver.resolveComponentFactory(ThumbnailAlbumComicComponent);
    this.album_list.push( this.target.createComponent(factory) );

    this.album_list[ this.album_list.length - 1 ].instance.state = "album";
    this.album_list[ this.album_list.length - 1 ].instance.user_id = this.user_id;
    this.album_list[ this.album_list.length - 1 ].instance.profile_picture = this.profile_picture;
    this.album_list[ this.album_list.length - 1 ].instance.primary_description = this.primary_description;
    this.album_list[ this.album_list.length - 1 ].instance.author_name = this.author_name;
    this.album_list[ this.album_list.length - 1 ].instance.now_in_seconds = this.now_in_seconds;
    

    if( e1.format == 'one-shot' ) {
      this.album_list[ this.album_list.length - 1 ].instance.format = 'one-shot';
      this.album_list[ this.album_list.length - 1 ].instance.bd_element = this.list_bd_oneshot[ index_in_list ];
    }
    else if( e1.format == 'serie' ) {
      this.album_list[ this.album_list.length - 1 ].instance.format = 'serie';
      this.album_list[ this.album_list.length - 1 ].instance.bd_element = this.list_bd_series[ index_in_list ];
    }
    
    if( !this.grid ) {
      this.grid = new Muuri('.grid', {dragEnabled: true});
    }
    else {
      this.grid.add( this.album_list[ this.album_list.length - 1 ].location.nativeElement );
    }

    this.cd.detectChanges();
    window.dispatchEvent(new Event('resize'));
    this.grid.refreshItems().layout();
  }

  remove_from_album(e1:any) {

    for( let i = 0; i < this.album_list.length; i++ ) {
      if( this.album_list[ i ].instance.bd_element.bd_id == e1.id_key &&  this.album_list[ i ].instance.format == e1.format ) {

        

        this.grid.remove( this.album_list[ i ].location.nativeElement );
        this.album_list[i].destroy();
        this.album_list.splice(i,1);

        this.cd.detectChanges();
        window.dispatchEvent(new Event('resize'));
        this.grid.refreshItems().layout();
        
        return;

      }
    }
  }
  
  
  get_solution() {
    
    if( !this.grid || !this.album_list ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Veuillez sélectionner au moins une œuvre'},
      });
      return;
    }
    if( !(this.album_list.length > 0) ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Veuillez sélectionner au moins une œuvre'},
      });
      return;
    }
    if( !this.formName.valid ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Veuillez sélectionner un titre valide'},
      });
      return;
    }

    this.grid.refreshItems().layout();
    this.cd.detectChanges();
    window.dispatchEvent(new Event('resize'));

    var solution:any[] = [];
    var permutations:any[] = Object.assign([], this.get_permutations());

    for( let i = 0 ; i < permutations.length; i++ ) {
      for( let j = 0; j < this.grid._items.length; j ++ ) {
        if( permutations[i] == this.grid._items[j]._id ) {
          solution.push( j );
        }
      }
    }

    solution = Object.assign([], this.reverse_indexes( solution ));

    if (this.albumForm.valid){
      for( let i = 0; i < solution.length; i++) {
          console.log( this.album_list[ solution[i] ].instance.bd_element.title );
          this.album_list_to_send.push(this.album_list[ solution[i] ].instance.bd_element);
          if(i==solution.length-1){
            this.Albums_service.add_album_comics(this.albumForm.value.formName,this.album_list_to_send).subscribe(information=>{
              location.reload();
            });

          }
      }
    }

  }


  get_permutations() {

    var res:any[] = [];
    for( let i = 0; i < this.grid._items.length; i++ ) {
      res.push( Number(this.grid._items[i]._id) );
    }
    
    res.sort((n1,n2) => n1 - n2);
    return res;
  }

  reverse_indexes(solution: any[]) {

    var res:any[] = [];

    for( let i = 0 ; i < solution.length; i++ ) {
      for( let j = 0 ; j < solution.length; j++ ) {
        if( i == solution[j] ) {
          res.push(j);
        }
      }
    }
    return res;
  }








}


/*
280
560
840
1120
1400
*/