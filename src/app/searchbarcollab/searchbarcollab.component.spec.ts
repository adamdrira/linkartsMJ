import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchbarcollabComponent } from './searchbarcollab.component';

describe('SearchbarcollabComponent', () => {
  let component: SearchbarcollabComponent;
  let fixture: ComponentFixture<SearchbarcollabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchbarcollabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchbarcollabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
