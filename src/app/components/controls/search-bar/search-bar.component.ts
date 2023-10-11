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
  selector: 'exogb-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  @Output() inputFocused = new EventEmitter<void>();

  constructor(private readonly cdr: ChangeDetectorRef) {}

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

  checkValue(value: string, event: KeyboardEvent): void {
    // console.log('checkValue', value, event.key);
    if (event.key === 'Enter') {
      this.searchValue(value);
    } else {
      this.value = value.trim();
      this.cdr.detectChanges();
      this.valueChanged.emit(value.trim());
    }
  }

  clearValue(): void {
    // console.log('clearValue', this.value);
    this.searchValue('');
  }

  searchValue(value: string): void {
    // console.log('searchValue', value);
    this.value = value.trim();
    this.cdr.detectChanges();
    this.valueSubmited.emit(this.value);
    this.onChange(this.value);
    this.onTouched();
  }

  onInputFocus(): void {
    this.inputFocused.emit();
  }
}
