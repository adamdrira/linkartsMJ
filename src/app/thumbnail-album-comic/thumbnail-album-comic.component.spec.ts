import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThumbnailAlbumComicComponent } from './thumbnail-album-comic.component';

describe('ThumbnailAlbumComicComponent', () => {
  let component: ThumbnailAlbumComicComponent;
  let fixture: ComponentFixture<ThumbnailAlbumComicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThumbnailAlbumComicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThumbnailAlbumComicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
