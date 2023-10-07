import {
  Component,
  Input,
  forwardRef,
  AfterViewInit,
  Renderer2,
  ViewChild,
  ElementRef,
  EventEmitter,
  Output,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'exogb-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleComponent),
      multi: true,
    },
  ],
})
export class ToggleComponent implements AfterViewInit, ControlValueAccessor {
  @Input() checked = false;
  @Input() enabled = true;
  @Input() controlTitle: string | undefined;
  @Output() changeChecked: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('knob') private readonly knob: ElementRef | undefined;

  onChange: any = () => {
    // do nothing
  };

  onTouched: any = () => {
    // do nothing
  };

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly renderer: Renderer2,
  ) {}

  ngAfterViewInit(): void {
    if (this.knob?.nativeElement)
      this.renderer.addClass(this.knob.nativeElement, 'animate');
  }

  writeValue(value: any): void {
    this.checked = Boolean(value);
    this.cdr.detectChanges();
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
