import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThumbnailComicsComponent } from './thumbnail-comics.component';

describe('ThumbnailComponent', () => {
  let component: ThumbnailComicsComponent;
  let fixture: ComponentFixture<ThumbnailComicsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThumbnailComicsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThumbnailComicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
