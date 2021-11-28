import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  ɵmarkDirty as markDirty,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'exogb-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchBarComponent),
      multi: true,
    },
  ],
})
export class SearchBarComponent implements ControlValueAccessor {
  @Input() placeholder = 'Поиск';
  @Input() value = '';
  @Input() enabled = true;

  @Output() valueSubmited = new EventEmitter<string>();
  @Output() valueChanged = new EventEmitter<string>();

  onChange: any = () => {
    // do nothing
  };

  onTouched: any = () => {
    // do nothing
  };

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public checkValue(value: string, event: KeyboardEvent): void {
    console.log('checkValue', value, event.key);
    if (event.key === 'Enter') {
      this.searchValue(value);
    } else {
      markDirty(this);
      this.valueChanged.emit(value.trim());
    }
  }

  public clearValue(): void {
    console.log('clearValue', this.value);
    markDirty(this);
    if (this.value !== '') this.searchValue('');
  }

  public searchValue(value: string): void {
    console.log('searchValue', value);
    this.value = value.trim();
    markDirty(this);
    this.valueSubmited.emit(this.value);
    this.onChange(this.value);
    this.onTouched();
  }
}
