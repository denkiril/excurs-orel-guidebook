import { Component, OnInit, ɵmarkDirty as markDirty } from '@angular/core';

@Component({
  selector: 'exogb-main-map',
  templateUrl: './main-map.component.html',
  styleUrls: ['./main-map.component.scss'],
})
export class MainMapComponent implements OnInit {
  winW = 0;
  winH = 0;
  docW = 0;
  docH = 0;
  vw = 0;
  vh = 0;

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method, @typescript-eslint/no-empty-function
  ngOnInit(): void {
    this.calcParams();

    setTimeout(() => this.calcParams(), 10000);
  }

  calcParams(): void {
    const boxEl = document.querySelector('#box10');

    this.winW = window.innerWidth;
    this.winH = window.innerHeight;
    this.docW = document.documentElement.clientWidth;
    this.docH = document.documentElement.clientHeight;
    if (boxEl) {
      this.vw = Math.floor(boxEl.clientWidth * 2.5);
      this.vh = Math.floor(boxEl.clientHeight * 2.5);
    }

    markDirty(this);
  }
}
