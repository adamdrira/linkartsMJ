import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddComicsChapterComponent } from './add-comics-chapter.component';

describe('AddComicsChapterComponent', () => {
  let component: AddComicsChapterComponent;
  let fixture: ComponentFixture<AddComicsChapterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddComicsChapterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddComicsChapterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
