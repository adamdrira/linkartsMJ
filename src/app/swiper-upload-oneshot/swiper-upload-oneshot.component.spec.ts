import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwiperUploadOneshotComponent } from './swiper-upload-oneshot.component';

describe('SwiperUploadOneshotComponent', () => {
  let component: SwiperUploadOneshotComponent;
  let fixture: ComponentFixture<SwiperUploadOneshotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwiperUploadOneshotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwiperUploadOneshotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
