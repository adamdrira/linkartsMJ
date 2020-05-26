import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaComicsComponent } from './media-comics.component';

describe('MediaComicsComponent', () => {
  let component: MediaComicsComponent;
  let fixture: ComponentFixture<MediaComicsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MediaComicsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaComicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
