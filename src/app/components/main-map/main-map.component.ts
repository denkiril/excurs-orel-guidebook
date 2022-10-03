import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  // ɵmarkDirty as markDirty,
} from '@angular/core';
import { of, race, Subject } from 'rxjs';
import { delay, first, takeUntil } from 'rxjs/operators';

import { AnalyticsService } from 'src/app/services/analytics.service';
import { MapService } from 'src/app/services/map.service';
import { SightsData, SightsService } from 'src/app/services/sights.service';

@Component({
  selector: 'exogb-main-map',
  templateUrl: './main-map.component.html',
  styleUrls: ['./main-map.component.scss'],
})
export class MainMapComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) container!: ElementRef<HTMLElement>;

  private readonly destroy$ = new Subject();
  // private isMapInitialized = false;

  // winW = 0;
  // winH = 0;
  // docW = 0;
  // docH = 0;
  // vw = 0;
  // vh = 0;

  constructor(
    private readonly mapService: MapService,
    private readonly sightsService: SightsService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  ngOnInit(): void {
    race(this.sightsService.sightsData$, of(undefined).pipe(delay(5000)))
      .pipe(first())
      .subscribe((data) => this.initMap(data || { items: [] }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.mapService.destroy();
  }

  private initMap(sightsData: SightsData): void {
    this.analyticsService.sendEvent('initMap start');
    this.mapService
      .init(this.container.nativeElement, sightsData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.analyticsService.sendEvent('initMap ok');

          this.sightsService.sightsData$
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => {
              // console.log('sightsData$ updated', data);
              this.mapService.update(data);
              // console.log('MAP GOT sightsData$...', this.isMapInitialized);
              // if (!this.isMapInitialized) {
              //   this.isMapInitialized = true;
              //   this.initMap(data);
              // } else {
              //   this.updateMap(sightsData);
              // }
            });
        },
        () => this.analyticsService.sendEvent('initMap fail'),
      );
  }

  // private updateMap(sightsData: SightsData): void {
  //   this.mapService.update(sightsData);
  // }

  // calcParams(): void {
  //   const boxEl = document.querySelector('#box10');

  //   this.winW = window.innerWidth;
  //   this.winH = window.innerHeight;
  //   this.docW = document.documentElement.clientWidth;
  //   this.docH = document.documentElement.clientHeight;
  //   if (boxEl) {
  //     this.vw = Math.floor(boxEl.clientWidth * 2.5);
  //     this.vh = Math.floor(boxEl.clientHeight * 2.5);
  //   }

  //   markDirty(this);
  // }
}
