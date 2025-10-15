import express from "express";
import cors from "cors";
import multer from "multer";
import { creerBaseDeDonnees } from "./database.js";
import path from "path";
import fs from "fs";

const app = express();
const port = 3000;
const __dirname = path.resolve();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// 🔹 Dossier de stockage des fichiers uploadés
const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// 🔹 Configuration de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

let db;
(async () => {
  db = await creerBaseDeDonnees();
})();

// =====================
// 🔹 CRUD MATIERE
// =====================

app.get("/api/matieres", async (req, res) => {
  const matieres = await db.all("SELECT * FROM T_MATIERE");
  res.json(matieres);
});

app.post("/api/matieres", async (req, res) => {
  const { NOM_MATIERE } = req.body;
  await db.run("INSERT INTO T_MATIERE (NOM_MATIERE) VALUES (?)", NOM_MATIERE);
  res.json({ message: "Matière ajoutée avec succès" });
});

app.put("/api/matieres/:id", async (req, res) => {
  const { id } = req.params;
  const { NOM_MATIERE } = req.body;
  await db.run("UPDATE T_MATIERE SET NOM_MATIERE = ? WHERE ID_MATIERE = ?", [
    NOM_MATIERE,
    id,
  ]);
  res.json({ message: "Matière modifiée avec succès" });
});

app.delete("/api/matieres/:id", async (req, res) => {
  const { id } = req.params;
  await db.run("DELETE FROM T_CHAPITRE WHERE ID_MATIERE = ?", id);
  await db.run("DELETE FROM T_MATIERE WHERE ID_MATIERE = ?", id);
  res.json({ message: "Matière supprimée avec succès" });
});

// =====================
// 🔹 CRUD CHAPITRE
// =====================

app.get("/api/chapitres/:id_matiere", async (req, res) => {
  const { id_matiere } = req.params;
  const chapitres = await db.all(
    "SELECT * FROM T_CHAPITRE WHERE ID_MATIERE = ?",
    id_matiere
  );
  res.json(chapitres);
});

// ✅ Ajouter un chapitre AVEC upload
app.post("/api/chapitres", upload.single("fichier"), async (req, res) => {
  const { NOM_CHAPITRE, ID_MATIERE } = req.body;
  const fichier = req.file ? `/uploads/${req.file.filename}` : null;

  await db.run(
    "INSERT INTO T_CHAPITRE (NOM_CHAPITRE, CHEMIN_FICHIER, ID_MATIERE) VALUES (?, ?, ?)",
    [NOM_CHAPITRE, fichier, ID_MATIERE]
  );
  res.json({ message: "Chapitre ajouté avec succès" });
});

app.put("/api/chapitres/:id", async (req, res) => {
  const { id } = req.params;
  const { NOM_CHAPITRE, CHEMIN_FICHIER } = req.body;
  await db.run(
    "UPDATE T_CHAPITRE SET NOM_CHAPITRE = ?, CHEMIN_FICHIER = ? WHERE ID_CHAPITRE = ?",
    [NOM_CHAPITRE, CHEMIN_FICHIER, id]
  );
  res.json({ message: "Chapitre modifié avec succès" });
});

app.delete("/api/chapitres/:id", async (req, res) => {
  const { id } = req.params;
  await db.run("DELETE FROM T_CHAPITRE WHERE ID_CHAPITRE = ?", id);
  res.json({ message: "Chapitre supprimé avec succès" });
});

app.listen(port, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
});
