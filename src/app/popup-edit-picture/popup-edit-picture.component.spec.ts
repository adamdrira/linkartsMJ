import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEditPictureComponent } from './popup-edit-picture.component';

describe('PopupEditPictureComponent', () => {
  let component: PopupEditPictureComponent;
  let fixture: ComponentFixture<PopupEditPictureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupEditPictureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupEditPictureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
