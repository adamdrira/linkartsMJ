import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploaderProfilePictureComponent } from './uploader-profile-picture.component';

describe('UploaderProfilePictureComponent', () => {
  let component: UploaderProfilePictureComponent;
  let fixture: ComponentFixture<UploaderProfilePictureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploaderProfilePictureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploaderProfilePictureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
