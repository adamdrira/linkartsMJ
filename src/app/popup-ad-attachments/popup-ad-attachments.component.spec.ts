import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAdAttachmentsComponent } from './popup-ad-attachments.component';

describe('PopupAdAttachmentsComponent', () => {
  let component: PopupAdAttachmentsComponent;
  let fixture: ComponentFixture<PopupAdAttachmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupAdAttachmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAdAttachmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
