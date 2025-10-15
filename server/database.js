import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const __dirname = path.resolve();

export async function creerBaseDeDonnees() {
  const db = await open({
    filename: path.join(__dirname, "cours.db"),
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS T_MATIERE (
      ID_MATIERE INTEGER PRIMARY KEY AUTOINCREMENT,
      NOM_MATIERE TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS T_CHAPITRE (
      ID_CHAPITRE INTEGER PRIMARY KEY AUTOINCREMENT,
      NOM_CHAPITRE TEXT NOT NULL,
      CHEMIN_FICHIER TEXT,
      ID_MATIERE INTEGER NOT NULL,
      FOREIGN KEY (ID_MATIERE) REFERENCES T_MATIERE(ID_MATIERE)
    );
  `);

		  console.log("✅ Base de données initialisée avec succès !");
  return db;
}