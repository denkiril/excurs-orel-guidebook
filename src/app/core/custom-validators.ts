import {
  AbstractControl,
  FormGroup,
  // ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export class CustomValidators {
  // static emptyValueValidator: ValidatorFn = (control: AbstractControl) => {
  //   return control.value.trim() ? null : { emptyValue: true };
  // };

  // static requiredFormGroup: ValidatorFn = (ac: AbstractControl) => {
  //   const controls = (ac as FormGroup).controls || [];
  //   const controlsKeys = Object.keys(controls);
  //   const formGroupErrors: ValidationErrors | null =
  //     controlsKeys.every((key) => controls[key].value) ||
  //     controlsKeys.every((key) => !controls[key].value)
  //       ? null
  //       : { requiredFormGroup: true };
  //   const controlsErrors = formGroupErrors ? { required: true } : null;

  //   controlsKeys.forEach((key) => {
  //     if (!controls[key].value) controls[key].setErrors(controlsErrors);
  //   });

  //   return formGroupErrors;
  // };

  static checkedFormGroup: ValidatorFn = (ac: AbstractControl) => {
    const controls = (ac as FormGroup).controls || [];

    return Object.keys(controls).some((key) => controls[key].value)
      ? null
      : { notChecked: true };
  };
}
