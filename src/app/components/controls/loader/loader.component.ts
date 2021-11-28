import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'exogb-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
})
export class LoaderComponent {
  @Input() showSpinner = false;
  @Input() showServerError = false;
  @Input() disabled = false;

  @Output() clickRefresh = new EventEmitter<void>();

  emitClickRefresh(): void {
    this.clickRefresh.emit();
  }
}
