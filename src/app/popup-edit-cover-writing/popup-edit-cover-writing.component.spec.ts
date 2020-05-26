import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEditCoverWritingComponent } from './popup-edit-cover-writing.component';

describe('PopupEditCoverWritingComponent', () => {
  let component: PopupEditCoverWritingComponent;
  let fixture: ComponentFixture<PopupEditCoverWritingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupEditCoverWritingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupEditCoverWritingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
