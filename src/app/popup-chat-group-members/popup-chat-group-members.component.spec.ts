import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupChatGroupMembersComponent } from './popup-chat-group-members.component';

describe('PopupChatGroupMembersComponent', () => {
  let component: PopupChatGroupMembersComponent;
  let fixture: ComponentFixture<PopupChatGroupMembersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupChatGroupMembersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupChatGroupMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
