import {
  Component,
  Input,
  forwardRef,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  ɵmarkDirty as markDirty,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'exogb-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() controlTitle: string | undefined;
  @Input() checked = false;
  @Input() enabled = true;
  @Input() alert = false;
  @Input() textLeft: string | undefined;
  @Input() textRight: string | undefined;
  @Input() textWrap = false;
  @Input() size = 20;
  @Output() changeChecked: EventEmitter<boolean> = new EventEmitter();

  @ViewChild('checkbox') checkbox!: ElementRef;
  @ViewChild('label') label!: ElementRef;

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor() {}

  // ngAfterViewInit(): void {
  //   if (this.size && !(this.size === 20 || this.size === 24)) {
  //     this.renderer.setStyle(this.checkbox.nativeElement, 'width', this.size);
  //     this.renderer.setStyle(this.checkbox.nativeElement, 'height', this.size);
  //     this.renderer.setStyle(this.label.nativeElement, 'lineHeight', this.size);
  //   }
  // }

  writeValue(value: any): void {
    this.checked = !!value;
    markDirty(this);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.enabled = !isDisabled;
  }

  change(): void {
    this.checked = !this.checked;
    this.onChange(this.checked);
    this.onTouched();
    this.changeChecked.emit(this.checked);
  }
}
