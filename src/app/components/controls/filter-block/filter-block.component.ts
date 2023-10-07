import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'exogb-filter-block',
  templateUrl: './filter-block.component.html',
  styleUrls: ['./filter-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterBlockComponent),
      multi: true,
    },
  ],
})
export class FilterBlockComponent implements ControlValueAccessor {
  @Input() blockTitle = '';
  @Input() opened = false;
  @Input() enabled = true;

  @Output() openedChange = new EventEmitter<boolean>();

  switchedOn = true;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  onChange: any = () => {
    // do nothing
  };

  onTouched: any = () => {
    // do nothing
  };

  writeValue(value: any): void {
    this.switchedOn = !!value;
    this.cdr.detectChanges();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // setDisabledState(isDisabled: boolean): void {
  //   this.disabled = isDisabled;
  // }

  toggleOpened(): void {
    this.opened = !this.opened;
    this.cdr.detectChanges();
    this.openedChange.emit(this.opened);
  }

  switch(): void {
    this.switchedOn = !this.switchedOn;
    this.onChange(this.switchedOn);
    this.onTouched();
    this.cdr.detectChanges();
  }
}
