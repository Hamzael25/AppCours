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

// =====================
// 🔹 Dossier pour les fichiers uploadés
// =====================
const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Dossier 'uploads' créé avec succès !");
}

// =====================
// 🔹 Configuration Multer (upload)
// =====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// =====================
// 🔹 Base de données
// =====================
let db;
(async () => {
  db = await creerBaseDeDonnees();
})();

// =====================
// 🔹 CRUD MATIERE
// =====================

// Lire toutes les matières
app.get("/api/matieres", async (req, res) => {
  const matieres = await db.all("SELECT * FROM T_MATIERE");
  res.json(matieres);
});

// Ajouter une matière
app.post("/api/matieres", async (req, res) => {
  const { NOM_MATIERE } = req.body;
  await db.run("INSERT INTO T_MATIERE (NOM_MATIERE) VALUES (?)", NOM_MATIERE);
  res.json({ message: "Matière ajoutée avec succès" });
});

// Modifier une matière
app.put("/api/matieres/:id", async (req, res) => {
  const { id } = req.params;
  const { NOM_MATIERE } = req.body;
  await db.run("UPDATE T_MATIERE SET NOM_MATIERE = ? WHERE ID_MATIERE = ?", [
    NOM_MATIERE,
    id,
  ]);
  res.json({ message: "Matière modifiée avec succès" });
});

// Supprimer une matière et ses chapitres
app.delete("/api/matieres/:id", async (req, res) => {
  const { id } = req.params;
  await db.run("DELETE FROM T_CHAPITRE WHERE ID_MATIERE = ?", id);
  await db.run("DELETE FROM T_MATIERE WHERE ID_MATIERE = ?", id);
  res.json({ message: "Matière supprimée avec succès" });
});

// =====================
// 🔹 CRUD CHAPITRE
// =====================

// Lire tous les chapitres d'une matière
app.get("/api/chapitres/:id_matiere", async (req, res) => {
  const { id_matiere } = req.params;
  const chapitres = await db.all(
    "SELECT * FROM T_CHAPITRE WHERE ID_MATIERE = ?",
    id_matiere
  );
  res.json(chapitres);
});

// Ajouter un chapitre avec upload
app.post("/api/chapitres", upload.single("fichier"), async (req, res) => {
  try {
    const { NOM_CHAPITRE, ID_MATIERE } = req.body;
    const fichier = req.file ? `/uploads/${req.file.filename}` : null;

    await db.run(
      "INSERT INTO T_CHAPITRE (NOM_CHAPITRE, CHEMIN_FICHIER, ID_MATIERE) VALUES (?, ?, ?)",
      [NOM_CHAPITRE, fichier, ID_MATIERE]
    );

    res.json({ message: "Chapitre ajouté avec succès" });
  } catch (error) {
    console.error("❌ Erreur POST chapitre :", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Modifier un chapitre (avec ou sans nouveau fichier)
app.put("/api/chapitres/:id", upload.single("fichier"), async (req, res) => {
  try {
    const { id } = req.params;
    const { NOM_CHAPITRE } = req.body;

    // Si un fichier est envoyé, on remplace l'ancien
    let nouveauChemin;
    if (req.file) {
      nouveauChemin = `/uploads/${req.file.filename}`;
    } else {
      // Sinon on garde le même
      const ancien = await db.get(
        "SELECT CHEMIN_FICHIER FROM T_CHAPITRE WHERE ID_CHAPITRE = ?",
        id
      );
      nouveauChemin = ancien?.CHEMIN_FICHIER || null;
    }

    await db.run(
      "UPDATE T_CHAPITRE SET NOM_CHAPITRE = ?, CHEMIN_FICHIER = ? WHERE ID_CHAPITRE = ?",
      [NOM_CHAPITRE, nouveauChemin, id]
    );

    console.log(`✅ Chapitre ${id} mis à jour`);
    res.json({ message: "Chapitre modifié avec succès" });
  } catch (error) {
    console.error("❌ Erreur PUT chapitre :", error);
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un chapitre
app.delete("/api/chapitres/:id", async (req, res) => {
  const { id } = req.params;
  await db.run("DELETE FROM T_CHAPITRE WHERE ID_CHAPITRE = ?", id);
  res.json({ message: "Chapitre supprimé avec succès" });
});

// =====================
// 🔹 Lancement du serveur
// =====================
app.listen(port, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
});
