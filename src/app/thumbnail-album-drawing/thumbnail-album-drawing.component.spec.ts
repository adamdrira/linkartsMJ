import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThumbnailAlbumDrawingComponent } from './thumbnail-album-drawing.component';

describe('ThumbnailAlbumDrawingComponent', () => {
  let component: ThumbnailAlbumDrawingComponent;
  let fixture: ComponentFixture<ThumbnailAlbumDrawingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThumbnailAlbumDrawingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThumbnailAlbumDrawingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
