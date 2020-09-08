import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecommendationcollabComponent } from './recommendationcollab.component';

describe('RecommendationcollabComponent', () => {
  let component: RecommendationcollabComponent;
  let fixture: ComponentFixture<RecommendationcollabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecommendationcollabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecommendationcollabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
