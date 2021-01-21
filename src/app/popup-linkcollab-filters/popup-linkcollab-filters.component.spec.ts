import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupLinkcollabFiltersComponent } from './popup-linkcollab-filters.component';

describe('PopupLinkcollabFiltersComponent', () => {
  let component: PopupLinkcollabFiltersComponent;
  let fixture: ComponentFixture<PopupLinkcollabFiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupLinkcollabFiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupLinkcollabFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
