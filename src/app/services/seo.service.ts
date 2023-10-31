import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

const DEFAULT_TITLE = 'Путеводитель по Орлу';
const DEFAULT_DESCRIPTION =
  'Достопримечательности и музеи на карте города Орла, с описанием и фото.';
const SEO_TITLE_POSTFIX = ' — Путеводитель по Орлу';

interface SeoParams {
  title?: string;
  description?: string;
}

type SeoPriority = 'high' | 'low';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private highSeoParams: SeoParams = {
    title: undefined,
    description: undefined,
  };
  private lowSeoParams: SeoParams = {
    title: undefined,
    description: undefined,
  };

  constructor(
    private readonly meta: Meta,
    private readonly title: Title,
  ) {}

  private setTitle(value?: string): void {
    const content = value ? value + SEO_TITLE_POSTFIX : DEFAULT_TITLE;

    this.title.setTitle(content);

    this.meta.updateTag({
      property: 'og:title',
      content,
    });
  }

  private setDescription(value?: string): void {
    const content = value || DEFAULT_DESCRIPTION;

    this.meta.updateTag({
      name: 'description',
      content,
    });

    this.meta.updateTag({
      property: 'og:description',
      content,
    });
  }

  updateSeoParams(
    title?: string,
    description?: string,
    priority: SeoPriority = 'low',
  ): void {
    switch (priority) {
      case 'high':
        this.highSeoParams = { title, description };
        break;
      case 'low':
        this.lowSeoParams = { title, description };
        break;
      default:
        break;
    }

    this.setTitle(this.highSeoParams.title || this.lowSeoParams.title);
    this.setDescription(
      this.highSeoParams.description || this.lowSeoParams.description,
    );
  }
}
