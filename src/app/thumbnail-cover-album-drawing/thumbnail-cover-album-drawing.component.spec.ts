import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThumbnailCoverAlbumDrawingComponent } from './thumbnail-cover-album-drawing.component';

describe('ThumbnailCoverAlbumDrawingComponent', () => {
  let component: ThumbnailCoverAlbumDrawingComponent;
  let fixture: ComponentFixture<ThumbnailCoverAlbumDrawingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThumbnailCoverAlbumDrawingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThumbnailCoverAlbumDrawingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
