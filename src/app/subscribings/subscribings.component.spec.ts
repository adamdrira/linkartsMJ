import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscribingsComponent } from './subscribings.component';

describe('SubscribingsComponent', () => {
  let component: SubscribingsComponent;
  let fixture: ComponentFixture<SubscribingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubscribingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscribingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
