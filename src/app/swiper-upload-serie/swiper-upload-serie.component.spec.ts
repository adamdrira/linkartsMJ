import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwiperUploadSerieComponent } from './swiper-upload-serie.component';

describe('SwiperUploadSerieComponent', () => {
  let component: SwiperUploadSerieComponent;
  let fixture: ComponentFixture<SwiperUploadSerieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwiperUploadSerieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwiperUploadSerieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
