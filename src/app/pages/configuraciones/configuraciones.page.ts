import { Component, OnInit } from '@angular/core';
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

  constructor(private configService: ConfiguracionService) {}

  async ngOnInit(): Promise<void> {
    this.permitirEliminarInicio = await this.configService.permitirBorrarEnInicio();
  }

  async guardarCambio(): Promise<void> {
    await this.configService.setPermitirBorrarEnInicio(this.permitirEliminarInicio);
  }
}