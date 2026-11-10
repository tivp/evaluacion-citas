import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardContent, IonButton, IonIcon, IonText } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';
import { Cita } from '../../services/citas.service';

@Component({
  selector: 'app-cita-tarjeta',
  templateUrl: './cita-tarjeta.component.html',
  styleUrls: ['./cita-tarjeta.component.scss'],
  standalone: true,
  imports: [CommonModule, IonCard, IonCardContent, IonButton, IonIcon, IonText]
})
export class CitaTarjetaComponent {
  @Input() cita: Cita | null = null;
  @Input() permitirBorrar: boolean = false;
  @Output() onEliminarCita = new EventEmitter<number>();

  constructor() {
    addIcons({ trashOutline });
  }

  solicitarEliminacion(): void {
    if (this.cita?.id !== undefined) {
      this.onEliminarCita.emit(this.cita.id);
    }
  }
}