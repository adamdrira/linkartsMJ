import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaSeeMoreComicsComponent } from './media-see-more-comics.component';

describe('MediaSeeMoreComicsComponent', () => {
  let component: MediaSeeMoreComicsComponent;
  let fixture: ComponentFixture<MediaSeeMoreComicsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MediaSeeMoreComicsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaSeeMoreComicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
