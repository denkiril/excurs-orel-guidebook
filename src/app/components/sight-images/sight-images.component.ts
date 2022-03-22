import {
  Component,
  Input,
  OnInit,
  ɵmarkDirty as markDirty,
} from '@angular/core';
import { ImageItem } from 'src/app/services/sights.service';

@Component({
  selector: 'exogb-sight-images',
  templateUrl: './sight-images.component.html',
  styleUrls: ['./sight-images.component.scss'],
})
export class SightImagesComponent implements OnInit {
  @Input() images: ImageItem[] = [];

  topImage?: ImageItem;

  ngOnInit(): void {
    console.log(this.images);
    this.topImage = this.images.length ? this.images[0] : undefined;
  }

  setTopImage(image: ImageItem): void {
    this.topImage = image;
    markDirty(this);
  }
}
