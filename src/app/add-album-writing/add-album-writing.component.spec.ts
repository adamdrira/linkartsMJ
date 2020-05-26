import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAlbumWritingComponent } from './add-album-writing.component';

describe('AddAlbumWritingComponent', () => {
  let component: AddAlbumWritingComponent;
  let fixture: ComponentFixture<AddAlbumWritingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAlbumWritingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAlbumWritingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
