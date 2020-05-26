import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CropSelectionComponent } from './crop-selection.component';

describe('CropSelectionComponent', () => {
  let component: CropSelectionComponent;
  let fixture: ComponentFixture<CropSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CropSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CropSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
