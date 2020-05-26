import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploaderCoverPictureComponent } from './uploader-cover-picture.component';

describe('UploaderCoverPictureComponent', () => {
  let component: UploaderCoverPictureComponent;
  let fixture: ComponentFixture<UploaderCoverPictureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploaderCoverPictureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploaderCoverPictureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
