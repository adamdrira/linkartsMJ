import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupFormDrawingComponent } from './popup-form-drawing.component';

describe('PopupFormDrawingComponent', () => {
  let component: PopupFormDrawingComponent;
  let fixture: ComponentFixture<PopupFormDrawingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupFormDrawingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupFormDrawingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
