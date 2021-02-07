import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainSearchbarResultsComponent } from './main-searchbar-results.component';

describe('MainSearchbarResultsComponent', () => {
  let component: MainSearchbarResultsComponent;
  let fixture: ComponentFixture<MainSearchbarResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainSearchbarResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainSearchbarResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
