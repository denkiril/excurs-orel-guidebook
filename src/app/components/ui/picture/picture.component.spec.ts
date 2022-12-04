import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageSizeItem, ImageItem } from 'src/app/models/sights.models';

import { PictureComponent } from './picture.component';

const mockImageSizeItem: ImageSizeItem = {
  file: 'file',
  height: 100,
  width: 150,
};

const mockImage: ImageItem = {
  alt: '',
  caption: '',
  title: 'img title',
  full: 'img_full',
  meta: {
    file: 'img_file',
    height: 1200,
    width: 1920,
    sizes: {
      large: mockImageSizeItem,
      medium: mockImageSizeItem,
      medium_large: mockImageSizeItem,
      thumbnail: mockImageSizeItem,
    },
  },
};

describe('PictureComponent', () => {
  let component: PictureComponent;
  let fixture: ComponentFixture<PictureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PictureComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PictureComponent);
    component = fixture.componentInstance;
    component.image = mockImage;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
