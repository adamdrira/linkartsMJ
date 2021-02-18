import { Component, OnInit, Input, ViewChild, ViewContainerRef, ChangeDetectorRef, ComponentFactoryResolver, Renderer2, ViewChildren, QueryList, ElementRef, SimpleChange, SimpleChanges } from '@angular/core';


import { Router } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';

import { ThumbnailAlbumDrawingComponent } from '../thumbnail-album-drawing/thumbnail-album-drawing.component'
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Albums_service } from '../services/albums.service';

import { pattern } from '../helpers/patterns';

import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { NavbarService } from '../services/navbar.service';

import { normalize_to_nfc } from '../helpers/patterns';

declare var Swiper:any;
declare var Muuri:any;
declare var $:any;


@Component({
  selector: 'app-add-album-drawing',
  templateUrl: './add-album-drawing.component.html',
  styleUrls: ['./add-album-drawing.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateY(0)', opacity: 0}),
          animate('400ms', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ]
    ),
  ],
})
export class AddAlbumDrawingComponent implements OnInit {

  constructor(
    private cd:ChangeDetectorRef,
    private resolver: ComponentFactoryResolver,
    private rd:Renderer2,
    private Albums_service:Albums_service,
    private router:Router,
    public dialog: MatDialog,
    private navbar: NavbarService, 
  ) { 
    navbar.visibility_observer_font.subscribe(font=>{
      if(font){
        this.show_icon=true;
      }
    })
  }
  


  gridAlbum:any;
  now_in_seconds:number;

  @Input() author_name: string;
  @Input() pseudo: string;
  @Input() user_id: number;
  @Input() profile_picture: SafeUrl;
  @Input() primary_description: string;
  @Input() list_drawings_onepage: any;
  @Input() list_drawings_artbook: any;
  
  swiper:any;

  //form variables
  formName: FormControl = new FormControl('', [Validators.required, Validators.minLength(2),Validators.maxLength(15), Validators.pattern( pattern("text") ) ]);
  albumForm: FormGroup = new FormGroup({
    formName: this.formName,
  });

  
  //Liste des contenus SELECTIONNÉS
  array_of_selected_safeurls:any[] = [];

  album_list:any[] = [];
  album_list_to_send:any[] = [];
  solution:any[] = [];
  @ViewChild('target', { read: ViewContainerRef }) target: ViewContainerRef;
  public searchText:any;

  @ViewChild('noResult') noResult:ElementRef;
  //Liste des contenus FINAUX VISIBLES (après filtrage, etc.)
  @ViewChildren('thumbnailAlbum') set thumbnailAlbums(thumbnailAlbums: QueryList<ThumbnailAlbumDrawingComponent>) {

    if( thumbnailAlbums.toArray().length == 0 ) {
      this.rd.setStyle( this.noResult.nativeElement, "display", "flex" );
    }
    else {
      this.rd.setStyle( this.noResult.nativeElement, "display", "none" );
    }
    if( thumbnailAlbums ) {
      for( let i=0; i < thumbnailAlbums.toArray().length; i++ ) {
        for( let j=0; j < this.album_list.length; j ++ ) {
          if( thumbnailAlbums.toArray()[i].item.drawing_id == this.album_list[j].instance.item.drawing_id && thumbnailAlbums.toArray()[i].format == this.album_list[j].instance.format ) {
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

    let THIS=this;
    this.now_in_seconds= Math.trunc( new Date().getTime()/1000);
    
    

  }

  show_icon=false;
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
          slidesPerGroup: 1,
        },
        860: {
            slidesPerView: 2,
            slidesPerGroup: 2,
        },
        1050: {
            slidesPerView: 3,
            slidesPerGroup: 3,
        },
        1450: {
            slidesPerView: 4,
            slidesPerGroup: 4,
        },
        1770: {
            slidesPerView: 5,
            slidesPerGroup: 5,
        },
        2090: {
            slidesPerView: 6,
            slidesPerGroup: 6,
        }
      }
    });

  }


  resize_event() {
    window.dispatchEvent(new Event('resize'));
  }
  
  

  add_to_album(e1:any) {

    let index_in_list:number;
    let THIS = this;

    for( let i = 0; i < this.album_list.length; i++ ) {
      if( this.album_list[ i ].instance.item.drawing_id == e1.id_key && this.album_list[ i ].instance.format == e1.format ) {
        return;
      }
    }
    
    if( e1.format == 'one-shot' ) {
      for( let i = 0; i < this.list_drawings_onepage.length; i++ ) {
        if( this.list_drawings_onepage[i].drawing_id == e1.id_key ) {
          index_in_list = i;
        }
      }
    }
    else if( e1.format == 'artbook' ) {
      for( let i = 0; i < this.list_drawings_artbook.length; i++ ) {
        if( this.list_drawings_artbook[i].drawing_id == e1.id_key ) {
          index_in_list = i;
        }
      }
    }

    this.cd.detectChanges();

    const factory = this.resolver.resolveComponentFactory(ThumbnailAlbumDrawingComponent);
    this.album_list.push( this.target.createComponent(factory) );

    this.album_list[ this.album_list.length - 1 ].instance.state = "album";
    this.album_list[ this.album_list.length - 1 ].instance.user_id = this.user_id;
    this.album_list[ this.album_list.length - 1 ].instance.profile_picture = this.profile_picture;
    this.album_list[ this.album_list.length - 1 ].instance.primary_description = this.primary_description;
    this.album_list[ this.album_list.length - 1 ].instance.author_name = this.author_name;
    this.album_list[ this.album_list.length - 1 ].instance.pseudo = this.pseudo;
    this.album_list[ this.album_list.length - 1 ].instance.now_in_seconds = this.now_in_seconds;
    

    this.album_list[ this.album_list.length - 1 ].instance.pictureUploaded.subscribe( v => {
      this.refresh_album_thumbnails();
    });


    if( e1.format == 'one-shot' ) {
      this.album_list[ this.album_list.length - 1 ].instance.format = 'one-shot';
      this.album_list[ this.album_list.length - 1 ].instance.item = this.list_drawings_onepage[ index_in_list ];
    }
    else if( e1.format == 'artbook' ) {
      this.album_list[ this.album_list.length - 1 ].instance.format = 'artbook';
      this.album_list[ this.album_list.length - 1 ].instance.item = this.list_drawings_artbook[ index_in_list ];
    }
    
    if( !this.gridAlbum ) {
      this.gridAlbum = new Muuri('.gridAddAlbum', {dragEnabled: true,layout: {fillGaps: true},});

      this.gridAlbum.on('dragEnd', function () {
        THIS.refresh_album_thumbnails();
      });

    }
    else {
      this.gridAlbum.add( this.album_list[ this.album_list.length - 1 ].location.nativeElement );
    }

    this.cd.detectChanges();
    window.dispatchEvent(new Event('resize'));
    this.gridAlbum.refreshItems().layout();

    this.refresh_album_thumbnails();
  }


  remove_from_album(e1:any) {

    for( let i = 0; i < this.album_list.length; i++ ) {
      if( this.album_list[ i ].instance.item.drawing_id == e1.id_key &&  this.album_list[ i ].instance.format == e1.format ) {

        

        this.gridAlbum.remove( this.album_list[ i ].location.nativeElement );
        this.album_list[i].destroy();
        this.album_list.splice(i,1);

        this.cd.detectChanges();
        window.dispatchEvent(new Event('resize'));
        this.gridAlbum.refreshItems().layout();
        
        this.refresh_album_thumbnails();
        return;

      }
    }
  }
  
  loading=false;
  get_solution() {
    if(this.loading){
      return
    }

    this.loading=true;

    if( !this.gridAlbum || !this.album_list ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Veuillez sélectionner au moins une œuvre'},
        panelClass: "popupConfirmationClass",
      });
      return;
    }
    if( !(this.album_list.length > 0) ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Veuillez sélectionner au moins une œuvre'},
        panelClass: "popupConfirmationClass",
      });
      return;
    }
    if( !this.formName.valid ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Veuillez sélectionner un titre valide'},
        panelClass: "popupConfirmationClass",
      });
      return;
    }
   
    
    
    this.gridAlbum.refreshItems().layout();
    this.cd.detectChanges();
    window.dispatchEvent(new Event('resize'));

    var solution:any[] = [];
    var permutations:any[] = Object.assign([], this.get_permutations());

    for( let i = 0 ; i < permutations.length; i++ ) {
      for( let j = 0; j < this.gridAlbum._items.length; j ++ ) {
        if( permutations[i] == this.gridAlbum._items[j]._id ) {
          solution.push( j );
        }
      }
    }


    solution = Object.assign([], this.reverse_indexes( solution ));

    
      for( let i = 0; i < solution.length; i++) {
        console.log( this.album_list[ solution[i] ].instance.item.title );
        this.album_list_to_send.push(this.album_list[ solution[i] ].instance.item);
        if(i==solution.length-1){
          this.Albums_service.add_album_drawings(this.albumForm.value.formName,this.album_list_to_send).subscribe(information=>{
            if(information[0].found){
              const dialogRef = this.dialog.open(PopupConfirmationComponent, {
                data: {showChoice:false, text:'Ce titre est déjà utilisé.'},
                panelClass: "popupConfirmationClass",
              });
              this.loading=false;
            }
            else{
              location.reload();
            }
          });

        }
    }
  

  }


  refresh_album_thumbnails() {
    
    
    if( !this.gridAlbum ) {
      return;
    }
    
    this.gridAlbum.refreshItems().layout();
    this.cd.detectChanges();
    window.dispatchEvent(new Event('resize'));

    var solution:any[] = [];
    var permutations:any[] = Object.assign([], this.get_permutations());

    for( let i = 0 ; i < permutations.length; i++ ) {
      for( let j = 0; j < this.gridAlbum._items.length; j ++ ) {
        if( permutations[i] == this.gridAlbum._items[j]._id ) {
          solution.push( j );
        }
      }
    }

    solution = Object.assign([], this.reverse_indexes( solution ));

    this.array_of_selected_safeurls = Object.assign([], []);

    console.log(solution);
    for( let i = 0; i < solution.length; i++) {
      this.array_of_selected_safeurls.push( this.album_list[ solution[i] ].instance.thumbnail_picture );
    };
    this.cd.detectChanges();

  }


  get_permutations() {

    var res:any[] = [];
    for( let i = 0; i < this.gridAlbum._items.length; i++ ) {
      res.push( Number(this.gridAlbum._items[i]._id) );
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


  scroll(el: HTMLElement) {

    this.cd.detectChanges();
    var topOfElement = el.offsetTop - 150;
    window.scroll({top: topOfElement, behavior:"smooth"});
  }


  normalize_input(fg: FormGroup, fc: string) {
    if(!fg || !fc) {
      return;
    }
    normalize_to_nfc(fg,fc);
  }

}


/*
280
560
840
1120
1400
*/