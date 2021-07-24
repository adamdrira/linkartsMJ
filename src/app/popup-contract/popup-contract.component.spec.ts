import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupContractComponent } from './popup-contract.component';

describe('PopupContractComponent', () => {
  let component: PopupContractComponent;
  let fixture: ComponentFixture<PopupContractComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupContractComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
