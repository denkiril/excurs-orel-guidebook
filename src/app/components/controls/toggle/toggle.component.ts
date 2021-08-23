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
  AfterContentInit,
  // ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'exogb-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleComponent),
      multi: true,
    },
  ],
})
export class ToggleComponent
  implements AfterContentInit, AfterViewInit, ControlValueAccessor
{
  @Input() checked = false;
  @Input() controlTitle: string | undefined;
  @Input() disabled: boolean | undefined;
  @Output() changeChecked: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('knob') private knob: ElementRef | undefined;

  onChange: any = () => {
    // do nothing
  };

  onTouched: any = () => {
    // do nothing
  };

  constructor(
    private renderer: Renderer2,
    private changeDetector: ChangeDetectorRef,
  ) {}

  ngAfterContentInit(): void {
    this.onChange(this.checked);
  }

  ngAfterViewInit(): void {
    if (this.knob?.nativeElement)
      this.renderer.addClass(this.knob.nativeElement, 'animate');
  }

  writeValue(value: any): void {
    this.checked = Boolean(value);
    this.changeDetector.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  change(): void {
    this.checked = !this.checked;
    this.onChange(this.checked);
    this.onTouched();
    this.changeChecked.emit(this.checked);
  }
}
