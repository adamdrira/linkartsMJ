import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAdPicturesComponent } from './popup-ad-pictures.component';

describe('PopupAdPicturesComponent', () => {
  let component: PopupAdPicturesComponent;
  let fixture: ComponentFixture<PopupAdPicturesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupAdPicturesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAdPicturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
