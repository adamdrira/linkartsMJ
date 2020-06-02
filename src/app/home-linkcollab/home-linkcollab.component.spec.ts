import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeLinkcollabComponent } from './home-linkcollab.component';

describe('HomeLinkcollabComponent', () => {
  let component: HomeLinkcollabComponent;
  let fixture: ComponentFixture<HomeLinkcollabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeLinkcollabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeLinkcollabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
