import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatRightContainerComponent } from './chat-right-container.component';

describe('ChatRightContainerComponent', () => {
  let component: ChatRightContainerComponent;
  let fixture: ComponentFixture<ChatRightContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatRightContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatRightContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
