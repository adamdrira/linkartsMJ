import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupShareComponent } from './popup-share.component';

describe('PopupShareComponent', () => {
  let component: PopupShareComponent;
  let fixture: ComponentFixture<PopupShareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupShareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
