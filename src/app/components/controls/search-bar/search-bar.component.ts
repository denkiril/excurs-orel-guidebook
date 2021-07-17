import {
  Component,
  EventEmitter,
  Input,
  Output,
  ɵmarkDirty as markDirty,
} from '@angular/core';

@Component({
  selector: 'exogb-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent {
  @Input() placeholder = 'Поиск';
  @Input() value = '';

  @Output() valueSubmited = new EventEmitter<string>();
  @Output() valueChanged = new EventEmitter<string>();

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
  }
}
