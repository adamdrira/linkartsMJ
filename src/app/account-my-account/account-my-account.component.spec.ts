import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountMyAccountComponent } from './account-my-account.component';

describe('AccountMyAccountComponent', () => {
  let component: AccountMyAccountComponent;
  let fixture: ComponentFixture<AccountMyAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountMyAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountMyAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
