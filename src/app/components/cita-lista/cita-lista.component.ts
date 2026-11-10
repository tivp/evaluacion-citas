import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonList, IonItem, IonLabel, IonButton, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';
import { Cita } from '../../services/citas.service';

@Component({
  selector: 'app-cita-lista',
  templateUrl: './cita-lista.component.html',
  styleUrls: ['./cita-lista.component.scss'],
  standalone: true,
  imports: [CommonModule, IonList, IonItem, IonLabel, IonButton, IonIcon]
})
export class CitaListaComponent {
  // Arreglo de citas que le pasa GestionCitasPage para recorrerlo con *ngFor
  @Input() citas: Cita[] = [];

  // Emite el id de la fila seleccionada cuando se pulsa el icono de eliminar
  @Output() onEliminar = new EventEmitter<number>();

  constructor() {
    addIcons({ trashOutline });
  }

  eliminar(id?: number): void {
    if (id !== undefined) {
      this.onEliminar.emit(id);
    }
  }
}