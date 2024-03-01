import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-detail-modal',
  templateUrl: './detail-modal.component.html',
  styleUrls: ['./detail-modal.component.scss'],
})
export class DetailModalComponent implements OnInit {
  @ViewChild('modal') modal: IonModal;

  @Input() title: string;
  @Input() label: string;
  @Input() value: string;
  @Input() data: Observable<{ label: string; count: number }[]>;

  isOpen = false;
  presentingElement = null;

  ngOnInit(): void {
    this.presentingElement = document.querySelector('.ion-page');
  }

  present() {
    this.isOpen = true;
  }

  willDismiss() {
    this.isOpen = false;
  }
}
