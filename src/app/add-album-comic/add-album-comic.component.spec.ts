import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAlbumComicComponent } from './add-album-comic.component';

describe('AddAlbumComicComponent', () => {
  let component: AddAlbumComicComponent;
  let fixture: ComponentFixture<AddAlbumComicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAlbumComicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAlbumComicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
