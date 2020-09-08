import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploaderChatProfilePictureComponent } from './uploader-chat-profile-picture.component';

describe('UploaderChatProfilePictureComponent', () => {
  let component: UploaderChatProfilePictureComponent;
  let fixture: ComponentFixture<UploaderChatProfilePictureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploaderChatProfilePictureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploaderChatProfilePictureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
