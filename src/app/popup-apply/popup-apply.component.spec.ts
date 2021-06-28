import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupApplyComponent } from './popup-apply.component';

describe('PopupApplyComponent', () => {
  let component: PopupApplyComponent;
  let fixture: ComponentFixture<PopupApplyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupApplyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupApplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
