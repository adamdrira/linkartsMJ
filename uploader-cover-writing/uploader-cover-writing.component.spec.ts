import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploaderCoverWritingComponent } from './uploader-cover-writing.component';

describe('UploaderCoverWritingComponent', () => {
  let component: UploaderCoverWritingComponent;
  let fixture: ComponentFixture<UploaderCoverWritingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploaderCoverWritingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploaderCoverWritingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
