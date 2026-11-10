import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonToggle
} from '@ionic/angular';
import { ConfiguracionService } from '../../services/configuracion.service';

@Component({
  selector: 'app-configuraciones',
  templateUrl: './configuraciones.page.html',
  styleUrls: ['./configuraciones.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonToggle
  ]
})
export class ConfiguracionesPage implements OnInit {
  permitirEliminarInicio: boolean = false;

  constructor(
    private configService: ConfiguracionService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    await this.cargarConfiguracion();
  }

  // Recarga el valor cada vez que entramos a la vista de configuraciones
  async ionViewWillEnter(): Promise<void> {
    await this.cargarConfiguracion();
  }

  // Recupera el ajuste desde Preferences y refresca el estado del ion-toggle
  async cargarConfiguracion(): Promise<void> {
    this.permitirEliminarInicio = await this.configService.permitirBorrarEnInicio();
    this.cdr.detectChanges();
  }

  // Se dispara con ionChange cuando el usuario mueve el interruptor
  async guardarCambio(): Promise<void> {
    await this.configService.setPermitirBorrarEnInicio(this.permitirEliminarInicio);
  }
}