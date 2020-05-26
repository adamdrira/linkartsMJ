import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThumbnailArtworkComponent } from './thumbnail-artwork.component';

describe('ThumbnailArtworkComponent', () => {
  let component: ThumbnailArtworkComponent;
  let fixture: ComponentFixture<ThumbnailArtworkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThumbnailArtworkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThumbnailArtworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
