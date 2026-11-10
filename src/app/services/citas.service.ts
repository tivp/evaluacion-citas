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
  private promesaInicio: Promise<void> | null = null;

  // Parámetros de configuración para la base local SQLite
  private readonly DB_NAME = 'citas.sqlite';
  private readonly DB_TABLE_NAME = 'citas';
  private readonly DB_ENCRIPTADA = false;
  private readonly DB_MODE = 'no-encryption';
  private readonly DB_VERSION = 1;
  private readonly DB_READ_ONLY = false;

  private readonly DB_SQL_TABLAS = `
    CREATE TABLE IF NOT EXISTS ${this.DB_TABLE_NAME} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      frase TEXT NOT NULL,
      autor TEXT NOT NULL
    );
  `;

  // Citas base del enunciado (Actividad 1) para poblar la tabla la primera vez que se abre la app
  private readonly citasBase: Cita[] = [
    {
      frase: 'El éxito consiste en obtener lo que se desea. La felicidad en disfrutar lo que se obtiene.',
      autor: 'Ralph Waldo Emerson'
    },
    {
      frase: 'Las personas no son recordadas por el número de veces que fracasan, sino por el número de veces que tienen éxito.',
      autor: 'Thomas Edison'
    },
    {
      frase: 'Ningún viento es bueno para el barco que no sabe adónde va.',
      autor: 'Séneca'
    }
  ];

  constructor() {}

  // En navegador necesitamos esperar al componente jeep-sqlite antes de crear la base
  private async _iniciarPluginWeb(): Promise<void> {
    await customElements.whenDefined('jeep-sqlite');
    const jeepSqliteEl = document.querySelector('jeep-sqlite');
    if (jeepSqliteEl != null) {
      await this.sqlite.initWebStore();
    }
  }

  // Guarda la promesa en curso para que ngOnInit e ionViewWillEnter no abran dos conexiones a la vez
  async iniciarPlugin(): Promise<void> {
    if (this.inicializado) {
      return;
    }
    if (this.promesaInicio) {
      return this.promesaInicio;
    }

    this.promesaInicio = (async () => {
      this.plataforma = Capacitor.getPlatform();
      if (this.plataforma === 'web') {
        await this._iniciarPluginWeb();
      }
      await this.abrirConexion();
      await this.db.execute(this.DB_SQL_TABLAS);
      await this._cargarCitasBaseSiVacio();
      this.inicializado = true;
    })();

    return this.promesaInicio;
  }

  // Revisa si ya existe una conexión abierta o crea una nueva hacia citas.sqlite
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

  // Cierra la conexión activa cuando se destruye la vista principal
  async cerrarConexion(): Promise<void> {
    if (this.db) {
      await this.sqlite.closeConnection(this.DB_NAME, this.DB_READ_ONLY);
      this.inicializado = false;
      this.promesaInicio = null;
    }
  }

  // Inserta las 3 citas iniciales en SQLite solo si la tabla todavía no tiene registros
  private async _cargarCitasBaseSiVacio(): Promise<void> {
    const actuales = await this.obtenerCitas();
    if (actuales.length === 0) {
      for (const c of this.citasBase) {
        await this.agregarCita(c);
      }
    }
  }

  // Consulta todas las citas guardadas en la tabla
  async obtenerCitas(): Promise<Cita[]> {
    const sql = `SELECT * FROM ${this.DB_TABLE_NAME}`;
    const resultado = await this.db.query(sql);
    return resultado?.values ?? [];
  }

  // Elige una cita al azar de las que están guardadas en la base de datos
  async obtenerCitaAleatoria(): Promise<Cita | null> {
    const citas = await this.obtenerCitas();
    if (citas.length === 0) {
      return null;
    }
    const indice = Math.floor(Math.random() * citas.length);
    return citas[indice];
  }

  // Inserta una nueva cita en SQLite y guarda los cambios en IndexedDB si corre en web
  async agregarCita(cita: Cita): Promise<void> {
    const sql = `INSERT INTO ${this.DB_TABLE_NAME}(frase, autor) VALUES(?, ?)`;
    await this.db.run(sql, [cita.frase, cita.autor]);
    if (this.plataforma === 'web') {
      await this.sqlite.saveToStore(this.DB_NAME);
    }
  }

  // Borra una cita según su id primario y actualiza el almacenamiento web
  async eliminarCita(id: number): Promise<void> {
    const sql = `DELETE FROM ${this.DB_TABLE_NAME} WHERE id = ?`;
    await this.db.run(sql, [id]);
    if (this.plataforma === 'web') {
      await this.sqlite.saveToStore(this.DB_NAME);
    }
  }
}