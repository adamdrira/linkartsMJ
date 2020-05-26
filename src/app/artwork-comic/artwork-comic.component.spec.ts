import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtworkComicComponent } from './artwork-comic.component';

describe('ArtworkComicComponent', () => {
  let component: ArtworkComicComponent;
  let fixture: ComponentFixture<ArtworkComicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArtworkComicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtworkComicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
