import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

import { SightId } from '../models/sights.models';
import { SightsService } from './sights.service';

@Injectable({
  providedIn: 'root',
})
export class ActiveSightsService {
  private activeSights: SightId[] = [];

  private readonly activeSightsSubject = new ReplaySubject<SightId[]>();
  readonly activeSights$ = this.activeSightsSubject.asObservable();

  constructor(private readonly sightsService: SightsService) {}

  add(sightId: SightId): void {
    this.activeSightsAdd(sightId);
    this.emitActiveSights('add');
  }

  delete(sightId: SightId): void {
    this.activeSightsDelete(sightId);
    this.emitActiveSights('delete');
  }

  clear(): void {
    this.activeSights = [];
    this.emitActiveSights('clear');
  }

  private activeSightsAdd(sightId: SightId): void {
    const ids = this.sightsService.getSightsIds(sightId);
    this.activeSights.push(...ids);
  }

  private activeSightsDelete(sightId: SightId): void {
    const ids = this.sightsService.getSightsIds(sightId);
    ids.forEach((id) => {
      const index = this.activeSights.indexOf(id);
      if (index > -1) this.activeSights.splice(index, 1);
    });
  }

  private emitActiveSights(_tag: string): void {
    // console.log(`-- emitActiveSights from ${_tag}`, this.activeSights);
    this.activeSightsSubject.next(Array.from(new Set(this.activeSights)));
  }

  // private updateActiveSights(data: UpdateActiveSightsData): void {
  //   const { addId, deleteId } = data;
  //   // console.log('updateActiveSights | addId, deleteId:', addId, deleteId);
  //   if (addId) this.activeSightsAdd(addId);
  //   if (deleteId) this.activeSightsDelete(deleteId);
  //   if (addId || deleteId) this.emitActiveSights('updateActiveSights');
  // }
}
