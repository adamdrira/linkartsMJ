import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploaderAdResponseAttachmentsComponent } from './uploader-ad-response-attachments.component';

describe('UploaderAdResponseAttachmentsComponent', () => {
  let component: UploaderAdResponseAttachmentsComponent;
  let fixture: ComponentFixture<UploaderAdResponseAttachmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploaderAdResponseAttachmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploaderAdResponseAttachmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
