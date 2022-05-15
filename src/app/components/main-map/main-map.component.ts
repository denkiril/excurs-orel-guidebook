import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  // ɵmarkDirty as markDirty,
} from '@angular/core';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { MapService } from 'src/app/services/map.service';
import { SightsService } from 'src/app/services/sights.service';

@Component({
  selector: 'exogb-main-map',
  templateUrl: './main-map.component.html',
  styleUrls: ['./main-map.component.scss'],
})
export class MainMapComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) container!: ElementRef<HTMLElement>;
  private destroy$ = new Subject();

  // winW = 0;
  // winH = 0;
  // docW = 0;
  // docH = 0;
  // vw = 0;
  // vh = 0;

  constructor(
    private mapService: MapService,
    private sightsService: SightsService,
  ) {}

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method, @typescript-eslint/no-empty-function
  ngOnInit(): void {
    this.initMap();
    // this.calcParams();
    // setTimeout(() => this.calcParams(), 10000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.mapService.destroy();
  }

  private initMap(): void {
    this.sightsService.sightsData$.pipe(first()).subscribe((sightsData) => {
      console.log('sightsData$', sightsData);
      this.mapService
        .init(this.container.nativeElement, sightsData)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          console.log('mapService init!');
        });
    });
  }

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
