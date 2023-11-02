import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { environment } from 'src/environments/environment';

const { BASE_URL } = environment;
const DEFAULT_TITLE = 'Путеводитель по Орлу';
const DEFAULT_DESCRIPTION =
  'Достопримечательности и музеи на карте города Орла, с описанием и фото.';
const SEO_TITLE_POSTFIX = ' — Путеводитель по Орлу';

interface SeoParams {
  title?: string;
  description?: string;
  canonicalParamsStr?: string;
}

type SeoPriority = 'high' | 'low';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private highSeoParams?: SeoParams;
  private lowSeoParams?: SeoParams;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
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

  private setCanonicalUrl(canonicalParamsStr?: string): void {
    const content = canonicalParamsStr
      ? `${BASE_URL}?${canonicalParamsStr}`
      : BASE_URL;

    this.updateLinkCanonical(content);

    this.meta.updateTag({
      property: 'og:url',
      content,
    });
  }

  private updateLinkCanonical(content: string): void {
    const linkEl: HTMLLinkElement | null = this.document.querySelector(
      `link[rel='canonical']`,
    );

    if (linkEl) {
      linkEl.setAttribute('href', content);
    }
  }

  updateSeoParams(
    title?: string,
    description?: string,
    canonicalParamsStr?: string,
    priority: SeoPriority = 'low',
  ): void {
    switch (priority) {
      case 'high':
        this.highSeoParams = { title, description, canonicalParamsStr };
        break;
      case 'low':
        this.lowSeoParams = { title, description, canonicalParamsStr };
        break;
      default:
        break;
    }

    this.setTitle(this.highSeoParams?.title || this.lowSeoParams?.title);
    this.setDescription(
      this.highSeoParams?.description || this.lowSeoParams?.description,
    );
    this.setCanonicalUrl(
      this.highSeoParams?.canonicalParamsStr ||
        this.lowSeoParams?.canonicalParamsStr,
    );
  }
}
