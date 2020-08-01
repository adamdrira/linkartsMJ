import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormSerieComponent } from './form-serie.component';

describe('FormSerieComponent', () => {
  let component: FormSerieComponent;
  let fixture: ComponentFixture<FormSerieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormSerieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormSerieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
