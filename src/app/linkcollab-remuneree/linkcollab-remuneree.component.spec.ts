import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkcollabRemunereeComponent } from './linkcollab-remuneree.component';

describe('LinkcollabRemunereeComponent', () => {
  let component: LinkcollabRemunereeComponent;
  let fixture: ComponentFixture<LinkcollabRemunereeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkcollabRemunereeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkcollabRemunereeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
