import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupFormWritingComponent } from './popup-form-writing.component';

describe('PopupFormWritingComponent', () => {
  let component: PopupFormWritingComponent;
  let fixture: ComponentFixture<PopupFormWritingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupFormWritingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupFormWritingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
