import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ImageItem, ImageSizeItem } from 'src/app/models/sights.models';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'exogb-picture',
  templateUrl: './picture.component.html',
  styleUrls: ['./picture.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PictureComponent implements OnChanges, OnInit {
  @Input() image!: ImageItem;
  @Input() targetWidth = 600;
  @Input() showLoader = false;

  srcset = '';
  srcsetWebp = '';
  sizes = '(max-width: 768px) 100vw, 768px';
  width = 768;
  height = 512;
  src = '';
  // mimeType = 'image/jpeg';
  isLoading = false;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly appService: AppService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    const { firstChange, currentValue, previousValue } = changes.image;
    if (firstChange === false && currentValue.full !== previousValue.full) {
      this.setImage();
    }
  }

  ngOnInit(): void {
    this.setImage();
  }

  private setImage(): void {
    const { meta } = this.image;

    if (meta) {
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
        .filter((item) => item.width !== 150) // webp 150x100 иногда нет на проде
        .map((item) => `${baseUrl}${item.file}.webp ${item.width}w`)
        .join(', ');

      this.findTargetImage(sizes, baseUrl);
    } else {
      this.srcset = '';
      this.srcsetWebp = '';
      this.src = this.image.full;
    }
    // console.log('sizes:', sizes);
    // console.log('srcset:', this.srcset);
    // const sizesItemWithType = sizes.find((item) => item['mime-type']);
    // if (sizesItemWithType) this.mimeType = sizesItemWithType['mime-type'];

    this.isLoading = !this.appService.isServer;
    this.cdr.detectChanges();
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

  onImgLoad(): void {
    this.isLoading = false;
    this.cdr.detectChanges();
  }
}
