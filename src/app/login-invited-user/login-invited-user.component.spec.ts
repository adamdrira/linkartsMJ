import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginInvitedUserComponent } from './login-invited-user.component';

describe('LoginInvitedUserComponent', () => {
  let component: LoginInvitedUserComponent;
  let fixture: ComponentFixture<LoginInvitedUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginInvitedUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginInvitedUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
