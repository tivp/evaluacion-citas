import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  // Clave única para guardar el ajuste de borrado en Preferences
  private readonly KEY_BORRAR_INICIO = 'PERMITIR_BORRAR_EN_INICIO';

  constructor() {}

  // Lee la preferencia guardada y la convierte a booleano (por defecto es false)
  async permitirBorrarEnInicio(): Promise<boolean> {
    const resultado = await Preferences.get({ key: this.KEY_BORRAR_INICIO });
    return resultado.value === 'true';
  }

  // Guarda el estado del interruptor como texto en el almacenamiento local
  async setPermitirBorrarEnInicio(permitir: boolean): Promise<void> {
    await Preferences.set({
      key: this.KEY_BORRAR_INICIO,
      value: permitir ? 'true' : 'false'
    });
  }
}