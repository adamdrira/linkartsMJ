import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupChatSearchComponent } from './popup-chat-search.component';

describe('PopupChatSearchComponent', () => {
  let component: PopupChatSearchComponent;
  let fixture: ComponentFixture<PopupChatSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupChatSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupChatSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
