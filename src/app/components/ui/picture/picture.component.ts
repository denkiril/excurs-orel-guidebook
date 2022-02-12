import { Component, Input, OnInit } from '@angular/core';
import { ImageItem, ImageSizeItem } from 'src/app/services/sights.service';

@Component({
  selector: 'exogb-picture',
  templateUrl: './picture.component.html',
  styleUrls: ['./picture.component.scss'],
})
export class PictureComponent implements OnInit {
  @Input() image!: ImageItem;
  @Input() targetWidth = 600;

  srcset = '';
  srcsetWebp = '';
  sizes = '(max-width: 768px) 100vw, 768px';
  width = 768;
  height = 512;
  src = '';
  // mimeType = 'image/jpeg';

  ngOnInit(): void {
    // console.log('image:', this.image);
    const { meta } = this.image;
    const baseUrl = this.image.full.replace(meta.file, '');

    const sizes = Object.values(meta.sizes);
    sizes.push({
      file: meta.file,
      width: meta.width,
      height: meta.height,
    });

    sizes.sort((a, b) => a.width - b.width);
    this.srcset = sizes
      .map((item) => `${baseUrl}${item.file} ${item.width}w`)
      .join(', ');
    this.srcsetWebp = sizes
      .map((item) => `${baseUrl}${item.file}.webp ${item.width}w`)
      .join(', ');
    // console.log('sizes:', sizes);
    // console.log('srcset:', this.srcset);
    // const sizesItemWithType = sizes.find((item) => item['mime-type']);
    // if (sizesItemWithType) this.mimeType = sizesItemWithType['mime-type'];

    this.findTargetImage(sizes, baseUrl);
  }

  private findTargetImage(sizes: ImageSizeItem[], baseUrl: string): void {
    sizes.sort((a, b) => b.width - a.width);
    const targetWidth =
      this.targetWidth <= sizes[0].width ? this.targetWidth : sizes[0].width;
    const target = sizes.find(
      (item, idx, arr) =>
        targetWidth <= item.width &&
        (arr[idx + 1] === undefined || targetWidth > arr[idx + 1].width),
    );

    if (target) {
      this.sizes = `(max-width: ${target.width}px) 100vw, ${target.width}px`;
      this.width = target.width;
      this.height = target.height;
      this.src = `${baseUrl}${target.file}`;
    }
  }
}
