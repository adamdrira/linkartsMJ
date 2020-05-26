import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscribingsSeeMoreComponent } from './subscribings-see-more.component';

describe('SubscribingsSeeMoreComponent', () => {
  let component: SubscribingsSeeMoreComponent;
  let fixture: ComponentFixture<SubscribingsSeeMoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubscribingsSeeMoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscribingsSeeMoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
