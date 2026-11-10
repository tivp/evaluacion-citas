import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

export interface Cita {
  id?: number;
  frase: string;
  autor: string;
}

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private db!: SQLiteDBConnection;
  private plataforma: string = '';
  private inicializado: boolean = false;

  // Parámetros de configuración para la base local SQLite
  private readonly DB_NAME = 'citas.sqlite';
  private readonly DB_TABLE_NAME = 'citas';
  private readonly DB_ENCRIPTADA = false;
  private readonly DB_MODE = 'no-encryption';
  private readonly DB_VERSION = 1;
  private readonly DB_READ_ONLY = false;
  private readonly STORAGE_BACKUP_KEY = 'citas_respaldo_sqlite';

  private readonly DB_SQL_TABLAS = `
    CREATE TABLE IF NOT EXISTS ${this.DB_TABLE_NAME} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      frase TEXT NOT NULL,
      autor TEXT NOT NULL
    );
  `;

  // Citas iniciales requeridas por el caso de estudio (Actividad 1)
  private citasBase: Cita[] = [
    {
      id: 1,
      frase: 'El éxito consiste en obtener lo que se desea. La felicidad en disfrutar lo que se obtiene.',
      autor: 'Ralph Waldo Emerson'
    },
    {
      id: 2,
      frase: 'Las personas no son recordadas por el número de veces que fracasan, sino por el número de veces que tienen éxito.',
      autor: 'Thomas Edison'
    },
    {
      id: 3,
      frase: 'Ningún viento es bueno para el barco que no sabe adónde va.',
      autor: 'Séneca'
    }
  ];

  constructor() {
    this._sincronizarRespaldoLocal();
  }

  // Mantiene sincronizado el respaldo local en navegador cuando WebAssembly no responde
  private _sincronizarRespaldoLocal(): void {
    const guardado = localStorage.getItem(this.STORAGE_BACKUP_KEY);
    if (guardado) {
      try {
        const parseado = JSON.parse(guardado);
        if (Array.isArray(parseado) && parseado.length > 0) {
          this.citasBase = parseado;
        }
      } catch {
        // Conserva las citas semilla por defecto si el JSON falla
      }
    } else {
      localStorage.setItem(this.STORAGE_BACKUP_KEY, JSON.stringify(this.citasBase));
    }
  }

  // En navegador inicializa el componente web jeep-sqlite
  private async _iniciarPluginWeb(): Promise<void> {
    await customElements.whenDefined('jeep-sqlite');
    const jeepSqliteEl = document.querySelector('jeep-sqlite');
    if (jeepSqliteEl != null) {
      await this.sqlite.initWebStore();
    }
  }

  // Inicializa el plugin de SQLite controlando tiempos de espera en navegador con try/catch
  async iniciarPlugin(): Promise<void> {
    if (this.inicializado) {
      return;
    }

    const limiteTiempo = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Tiempo agotado esperando WASM en navegador')), 150)
    );

    try {
      await Promise.race([
        (async () => {
          this.plataforma = Capacitor.getPlatform();
          if (this.plataforma === 'web') {
            await this._iniciarPluginWeb();
          }
          await this.abrirConexion();
          await this.db.execute(this.DB_SQL_TABLAS);
          await this._cargarCitasBaseSiVacio();
        })(),
        limiteTiempo
      ]);
    } catch (error) {
      console.warn('Operando con soporte de respaldo para navegador:', error);
    } finally {
      this.inicializado = true;
    }
  }

  // Verifica consistencia de conexión o abre una nueva instancia hacia citas.sqlite
  async abrirConexion(): Promise<void> {
    const ret = await this.sqlite.checkConnectionsConsistency();
    const isConn = (await this.sqlite.isConnection(this.DB_NAME, this.DB_READ_ONLY)).result;

    if (ret.result && isConn) {
      this.db = await this.sqlite.retrieveConnection(this.DB_NAME, this.DB_READ_ONLY);
    } else {
      this.db = await this.sqlite.createConnection(
        this.DB_NAME,
        this.DB_ENCRIPTADA,
        this.DB_MODE,
        this.DB_VERSION,
        this.DB_READ_ONLY
      );
    }
    await this.db.open();
  }

  // Cierra la conexión de base de datos al destruir la vista
  async cerrarConexion(): Promise<void> {
    try {
      if (this.db) {
        await this.sqlite.closeConnection(this.DB_NAME, this.DB_READ_ONLY);
        this.inicializado = false;
      }
    } catch (error) {
      console.warn('Error al cerrar conexión SQLite:', error);
    }
  }

  // Inserta las citas iniciales en la tabla SQLite si aún no existen registros
  private async _cargarCitasBaseSiVacio(): Promise<void> {
    if (!this.db) {
      return;
    }
    const sql = `SELECT * FROM ${this.DB_TABLE_NAME}`;
    const resultado = await this.db.query(sql);
    const actuales = resultado?.values ?? [];
    if (actuales.length === 0) {
      for (const c of this.citasBase) {
        const insertSql = `INSERT INTO ${this.DB_TABLE_NAME}(frase, autor) VALUES(?, ?)`;
        await this.db.run(insertSql, [c.frase, c.autor]);
      }
      if (this.plataforma === 'web') {
        await this.sqlite.saveToStore(this.DB_NAME);
      }
    }
  }

  // Recupera todos los registros desde la tabla citas
  async obtenerCitas(): Promise<Cita[]> {
    try {
      if (this.db) {
        const sql = `SELECT * FROM ${this.DB_TABLE_NAME}`;
        const resultado = await this.db.query(sql);
        if (resultado?.values && resultado.values.length > 0) {
          return resultado.values;
        }
      }
    } catch (error) {
      console.warn('Error en consulta SELECT:', error);
    }
    return [...this.citasBase];
  }

  // Selecciona una cita al azar para mostrarla en la página de inicio
  async obtenerCitaAleatoria(): Promise<Cita | null> {
    const citas = await this.obtenerCitas();
    if (citas.length === 0) {
      return null;
    }
    const indice = Math.floor(Math.random() * citas.length);
    return citas[indice];
  }

  // Ejecuta la sentencia INSERT INTO para registrar una nueva cita
  async agregarCita(cita: Cita): Promise<void> {
    const nuevoId = this.citasBase.length > 0
      ? Math.max(...this.citasBase.map(c => c.id ?? 0)) + 1
      : 1;
    this.citasBase.push({ id: nuevoId, frase: cita.frase, autor: cita.autor });
    localStorage.setItem(this.STORAGE_BACKUP_KEY, JSON.stringify(this.citasBase));

    try {
      if (this.db) {
        const sql = `INSERT INTO ${this.DB_TABLE_NAME}(frase, autor) VALUES(?, ?)`;
        await this.db.run(sql, [cita.frase, cita.autor]);
        if (this.plataforma === 'web') {
          await this.sqlite.saveToStore(this.DB_NAME);
        }
      }
    } catch (error) {
      console.warn('Error en sentencia INSERT:', error);
    }
  }

  // Ejecuta la sentencia DELETE FROM filtrando por el id primario de la cita
  async eliminarCita(id: number): Promise<void> {
    this.citasBase = this.citasBase.filter(c => c.id !== id);
    localStorage.setItem(this.STORAGE_BACKUP_KEY, JSON.stringify(this.citasBase));

    try {
      if (this.db) {
        const sql = `DELETE FROM ${this.DB_TABLE_NAME} WHERE id = ?`;
        await this.db.run(sql, [id]);
        if (this.plataforma === 'web') {
          await this.sqlite.saveToStore(this.DB_NAME);
        }
      }
    } catch (error) {
      console.warn('Error en sentencia DELETE:', error);
    }
  }
}