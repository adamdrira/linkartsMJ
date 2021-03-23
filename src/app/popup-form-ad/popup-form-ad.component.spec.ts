import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupFormAdComponent } from './popup-form-ad.component';

describe('PopupFormAdComponent', () => {
  let component: PopupFormAdComponent;
  let fixture: ComponentFixture<PopupFormAdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupFormAdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupFormAdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
