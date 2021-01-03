import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupCommentsComponent } from './popup-comments.component';

describe('PopupCommentsComponent', () => {
  let component: PopupCommentsComponent;
  let fixture: ComponentFixture<PopupCommentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupCommentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
