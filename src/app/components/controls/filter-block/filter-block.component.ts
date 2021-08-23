import {
  Component,
  forwardRef,
  Input,
  ɵmarkDirty as markDirty,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'exogb-filter-block',
  templateUrl: './filter-block.component.html',
  styleUrls: ['./filter-block.component.scss'],
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

  public opened = false;
  public switchedOn = true;

  onChange: any = () => {
    // do nothing
  };

  onTouched: any = () => {
    // do nothing
  };

  writeValue(value: any): void {
    this.switchedOn = !!value;
    markDirty(this);
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

  public toggleOpened(): void {
    this.opened = !this.opened;
    markDirty(this);
  }

  public switch(): void {
    this.switchedOn = !this.switchedOn;
    this.onChange(this.switchedOn);
    this.onTouched();
    markDirty(this);
  }
}
