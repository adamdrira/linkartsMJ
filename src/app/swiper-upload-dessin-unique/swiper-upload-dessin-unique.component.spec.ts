import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwiperUploadDessinUniqueComponent } from './swiper-upload-dessin-unique.component';

describe('SwiperUploadDessinUniqueComponent', () => {
  let component: SwiperUploadDessinUniqueComponent;
  let fixture: ComponentFixture<SwiperUploadDessinUniqueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwiperUploadDessinUniqueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwiperUploadDessinUniqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
