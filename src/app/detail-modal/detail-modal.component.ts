import { Component, Input, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-detail-modal',
  templateUrl: './detail-modal.component.html',
  styleUrls: ['./detail-modal.component.scss'],
})
export class DetailModalComponent {
  @ViewChild('modal') modal: IonModal;

  @Input() title: string;
  @Input() label: string;
  @Input() value: string;
  @Input() data: Observable<{ label: string; count: number }[]>;

  present() {
    this.modal.present();
  }
}
