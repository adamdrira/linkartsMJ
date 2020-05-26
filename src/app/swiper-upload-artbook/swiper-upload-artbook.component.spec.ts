import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwiperUploadArtbookComponent } from './swiper-upload-artbook.component';

describe('SwiperUploadArtbookComponent', () => {
  let component: SwiperUploadArtbookComponent;
  let fixture: ComponentFixture<SwiperUploadArtbookComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwiperUploadArtbookComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwiperUploadArtbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
