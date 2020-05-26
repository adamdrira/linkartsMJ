import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupSubscribersComponent } from './popup-subscribers.component';

describe('PopupSubscribersComponent', () => {
  let component: PopupSubscribersComponent;
  let fixture: ComponentFixture<PopupSubscribersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupSubscribersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupSubscribersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
