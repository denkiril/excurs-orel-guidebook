import { Component, HostListener } from '@angular/core';
import { UtilitiesService } from './services/utilities.service';

@Component({
  selector: 'exogb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private utilitiesService: UtilitiesService) {}

  @HostListener('document:click', ['$event'])
  documentClick(event: any): void {
    console.log('AppComponent document click');
    this.utilitiesService.documentClickedTarget.next(event.target);
  }
}
