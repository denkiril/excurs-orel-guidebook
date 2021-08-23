import {
  Component,
  Input,
  forwardRef,
  OnInit,
  Output,
  EventEmitter,
  // ChangeDetectionStrategy,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'exogb-radiobutton',
  templateUrl: './radiobutton.component.html',
  styleUrls: ['./radiobutton.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadiobuttonComponent),
      multi: true,
    },
  ],
})
export class RadiobuttonComponent implements OnInit, ControlValueAccessor {
  @Input() controlTitle: string | undefined;
  @Input() formControlName: string | undefined;
  @Input() name: string | undefined;
  @Input() value = '';
  @Input() checked: boolean | undefined;
  @Input() disabled: boolean | undefined;
  @Input() textLeft: string | undefined;
  @Input() textRight: string | undefined;
  @Output() changeValue: EventEmitter<string> = new EventEmitter();

  onChange: any = () => {
    // do nothing
  };

  onTouched: any = () => {
    // do nothing
  };

  ngOnInit(): void {
    this.name = this.formControlName || this.name;
  }

  writeValue(value: any): void {
    this.checked = value === this.value || this.checked;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  change(): void {
    this.onChange(this.value);
    this.onTouched();
    this.changeValue.emit(this.value);
  }
}
