import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimilarContentsComponent } from './similar-contents.component';

describe('SimilarContentsComponent', () => {
  let component: SimilarContentsComponent;
  let fixture: ComponentFixture<SimilarContentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimilarContentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimilarContentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
