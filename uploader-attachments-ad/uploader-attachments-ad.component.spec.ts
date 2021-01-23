import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploaderAttachmentsAdComponent } from './uploader-attachments-ad.component';

describe('UploaderAttachmentsAdComponent', () => {
  let component: UploaderAttachmentsAdComponent;
  let fixture: ComponentFixture<UploaderAttachmentsAdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploaderAttachmentsAdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploaderAttachmentsAdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
