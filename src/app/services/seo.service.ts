import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

const DEFAULT_TITLE = 'Путеводитель по Орлу';
const DEFAULT_DESCRIPTION =
  'Достопримечательности и музеи на карте города Орла, с описанием и фото.';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  constructor(
    private readonly meta: Meta,
    private readonly title: Title,
  ) {}

  setDescription(content: string): void {
    this.meta.updateTag({
      name: 'description',
      content,
    });

    this.meta.updateTag({
      property: 'og:description',
      content,
    });
  }

  setTitle(content: string): void {
    this.title.setTitle(content);

    this.meta.updateTag({
      property: 'og:title',
      content,
    });
  }

  updateSeoParams(title?: string, description?: string): void {
    this.setTitle(title || DEFAULT_TITLE);
    this.setDescription(description || DEFAULT_DESCRIPTION);
  }
}
