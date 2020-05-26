import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThumbnailAlbumWritingComponent } from './thumbnail-album-writing.component';

describe('ThumbnailAlbumWritingComponent', () => {
  let component: ThumbnailAlbumWritingComponent;
  let fixture: ComponentFixture<ThumbnailAlbumWritingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThumbnailAlbumWritingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThumbnailAlbumWritingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
