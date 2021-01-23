import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploaderReportsAttachmentsComponent } from './uploader-reports-attachments.component';

describe('UploaderReportsAttachmentsComponent', () => {
  let component: UploaderReportsAttachmentsComponent;
  let fixture: ComponentFixture<UploaderReportsAttachmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploaderReportsAttachmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploaderReportsAttachmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
