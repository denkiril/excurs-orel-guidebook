import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ɵmarkDirty as markDirty,
} from '@angular/core';
import { ImageItem } from 'src/app/services/sights.service';

type ContentType = 'text' | 'sight';

interface ContentPart {
  type: ContentType;
  content: string;
  sightId?: number;
}

interface ImageItemLocal extends ImageItem {
  captionParts?: ContentPart[];
}

@Component({
  selector: 'exogb-sight-images',
  templateUrl: './sight-images.component.html',
  styleUrls: ['./sight-images.component.scss'],
})
export class SightImagesComponent implements OnChanges {
  @Input() images: ImageItem[] = [];
  @Input() sightId?: number;

  topImage?: ImageItemLocal;

  ngOnChanges(changes: SimpleChanges): void {
    // console.log('changes:', changes);
    if (changes.sightId) {
      this.setTopImage(this.images.length ? this.images[0] : undefined);
    }
  }

  setTopImage(image?: ImageItem): void {
    this.topImage = image;

    if (this.topImage) {
      this.topImage.captionParts = this.convertToParts(
        this.topImage.caption || this.topImage.title,
      );
    }

    markDirty(this);
  }

  private convertToParts(value: string): ContentPart[] {
    if (!value) return [];

    const parts: ContentPart[] = [];
    let curIdx = 0;
    let lastIdx = 0;

    do {
      const idx1 = value.indexOf('[post', curIdx);
      const idx2 = value.indexOf(']', curIdx);
      const hasTag = idx1 !== -1 && idx2 !== -1;
      lastIdx = hasTag ? idx1 : value.length - 1;
      const content = value.substring(curIdx, lastIdx);
      if (content) parts.push({ type: 'text', content });

      if (hasTag) {
        lastIdx = idx2 + 1;
        const str = value.substring(idx1, lastIdx);
        const sepIdx = str.indexOf('|');
        const sightId = Number(str.substring(str.indexOf('=') + 1, sepIdx));
        parts.push({
          type: sightId !== this.sightId ? 'sight' : 'text',
          content: str.substring(sepIdx + 1, str.length - 1),
          sightId,
        });
      }

      curIdx = lastIdx;
    } while (curIdx < value.length - 1);

    // const re = /<a[^>]*>([^<]+)<\/a>/gi;
    // const re = /\[([^|]*)|([^\]]*)\]/gi;
    // const re = /\[post[id]*=(\d+)|([^\]]*)\]/;
    // const tags = value.match(re);
    // console.log('tags:', tags);
    // tags?.forEach((tag) => {
    //   console.log('tag:', tag);
    //   // const hrefValue = tag.match(/href=["'](.*?)["']/);
    //   // if (!hrefValue || (hrefValue && hrefValue[1][0] === '/')) {
    //   //   const content = tag.replace(re, '$1');
    //   //   html = html.replace(tag, content);
    //   // }
    // });

    // console.log('parts:', parts);
    return parts;
  }
}
