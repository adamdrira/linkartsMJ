import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEditCoverComponent } from './popup-edit-cover.component';

describe('PopupEditCoverComponent', () => {
  let component: PopupEditCoverComponent;
  let fixture: ComponentFixture<PopupEditCoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupEditCoverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupEditCoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
