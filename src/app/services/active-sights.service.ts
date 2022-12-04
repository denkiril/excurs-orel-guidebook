import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

import { UpdateActiveSightsData } from '../models/sights.models';
import { SightsService } from './sights.service';

@Injectable({
  providedIn: 'root',
})
export class ActiveSightsService {
  private activeSights: number[] = [];

  activeSights$ = new ReplaySubject<number[]>();

  constructor(private readonly sightsService: SightsService) {
    this.sightsService.needUpdateActiveSights$.subscribe((data) => {
      this.updateActiveSights(data);
    });
  }

  add(sightId: number): void {
    this.activeSightsAdd(sightId);
    this.emitActiveSights('add');
  }

  delete(sightId: number): void {
    this.activeSightsDelete(sightId);
    this.emitActiveSights('delete');
  }

  clear(): void {
    this.activeSights = [];
    this.emitActiveSights('clear');
  }

  private activeSightsAdd(sightId: number): void {
    const ids = this.sightsService.getSightsIds(sightId);
    this.activeSights.push(...ids);
  }

  private activeSightsDelete(sightId: number): void {
    const ids = this.sightsService.getSightsIds(sightId);
    ids.forEach((id) => {
      const index = this.activeSights.indexOf(id);
      if (index > -1) this.activeSights.splice(index, 1);
    });
  }

  private emitActiveSights(_tag: string): void {
    // console.log(`-- emitActiveSights from ${_tag}`, this.activeSights);
    this.activeSights$.next(Array.from(new Set(this.activeSights)));
  }

  private updateActiveSights(data: UpdateActiveSightsData): void {
    const { addId, deleteId } = data;
    // console.log('updateActiveSights | addId, deleteId:', addId, deleteId);
    if (addId) this.activeSightsAdd(addId);
    if (deleteId) this.activeSightsDelete(deleteId);
    if (addId || deleteId) this.emitActiveSights('updateActiveSights');
  }
}
