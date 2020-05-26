import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEditCoverDrawingComponent } from './popup-edit-cover-drawing.component';

describe('PopupEditCoverDrawingComponent', () => {
  let component: PopupEditCoverDrawingComponent;
  let fixture: ComponentFixture<PopupEditCoverDrawingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupEditCoverDrawingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupEditCoverDrawingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
