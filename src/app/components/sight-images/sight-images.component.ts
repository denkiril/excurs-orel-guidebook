import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
} from '@angular/core';
import { ImageItem, SightId } from 'src/app/models/sights.models';

type ContentType = 'text' | 'sight';

interface ContentPart {
  type: ContentType;
  content: string;
  sightId?: SightId;
}

interface ImageItemLocal extends ImageItem {
  captionParts?: ContentPart[];
  captionText?: string;
}

@Component({
  selector: 'exogb-sight-images',
  templateUrl: './sight-images.component.html',
  styleUrls: ['./sight-images.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SightImagesComponent implements OnChanges {
  @Input() images: ImageItem[] = [];
  @Input() sightId?: SightId;

  topImage?: ImageItemLocal;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnChanges(): void {
    this.setTopImage(this.images.length ? this.images[0] : undefined);
  }

  setTopImage(image?: ImageItem): void {
    this.topImage = image ? { ...image } : undefined;

    if (this.topImage) {
      const text = this.topImage.caption || this.topImage.title;
      const captionParts = this.convertToParts(text);

      if (captionParts.length === 1) {
        this.topImage.captionText = captionParts[0].content;
      } else if (captionParts.length > 1) {
        this.topImage.captionParts = captionParts;
      }
    }

    this.cdr.detectChanges();
  }

  private convertToParts(value: string): ContentPart[] {
    if (!value) return [];
    // console.log('value:', value);

    const parts: ContentPart[] = [];
    let curIdx = 0;
    let lastIdx = 0;

    do {
      const idx1 = value.indexOf('[post', curIdx);
      const idx2 = value.indexOf(']', curIdx);
      const hasTag = idx1 !== -1 && idx2 !== -1;
      lastIdx = hasTag ? idx1 : value.length;
      const content = value.substring(curIdx, lastIdx);
      if (content) parts.push({ type: 'text', content });
      // console.log('content:', content.replace(/\s/g, '*'));

      if (hasTag) {
        lastIdx = idx2 + 1;
        const str = value.substring(idx1, lastIdx);
        const sepIdx = str.indexOf('|');
        const sightId = str.substring(str.indexOf('=') + 1, sepIdx);
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
    return parts.some((item) => item.type !== 'text')
      ? parts
      : [{ type: 'text', content: parts.map((item) => item.content).join('') }];
  }
}
