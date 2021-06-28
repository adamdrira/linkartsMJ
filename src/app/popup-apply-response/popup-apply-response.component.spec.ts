import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupApplyResponseComponent } from './popup-apply-response.component';

describe('PopupApplyResponseComponent', () => {
  let component: PopupApplyResponseComponent;
  let fixture: ComponentFixture<PopupApplyResponseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupApplyResponseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupApplyResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
