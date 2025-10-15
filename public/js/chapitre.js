const params = new URLSearchParams(window.location.search);
const ID_MATIERE = params.get("id");
const NOM_MATIERE = decodeURIComponent(params.get("nom"));
document.getElementById("titre-matiere").textContent =
  `Chapitres de la matière : ${NOM_MATIERE}`;

const listeChapitres = document.getElementById("liste-chapitres");
const formChapitre = document.getElementById("form-chapitre");

// Modale
const modal = document.getElementById("modal");
const editNom = document.getElementById("edit-nom");
const editFichier = document.getElementById("edit-fichier");
const saveBtn = document.getElementById("save-btn");
const cancelBtn = document.getElementById("cancel-btn");

let chapitreCourant = null;

// =====================
// Charger les chapitres
// =====================
async function chargerChapitres() {
  const res = await fetch(`/api/chapitres/${ID_MATIERE}`);
  const chapitres = await res.json();

  listeChapitres.innerHTML = "";

  if (chapitres.length === 0) {
    listeChapitres.innerHTML = `<p>Aucun chapitre dans "${NOM_MATIERE}" pour le moment.</p>`;
    return;
  }

  chapitres.forEach((c) => {
    const li = document.createElement("li");
    const lienAffichage = c.CHEMIN_FICHIER
      ? `<a href="${c.CHEMIN_FICHIER}" target="_blank">📎 Voir fichier</a>`
      : "<em>Aucun fichier</em>";

    li.innerHTML = `
      <strong>${c.NOM_CHAPITRE}</strong><br>
      ${lienAffichage}
      <div class="actions">
        <button class="btn-edit">✏️ Modifier</button>
        <button class="btn-del">🗑️ Supprimer</button>
      </div>
    `;

    // Modifier
    li.querySelector(".btn-edit").onclick = () => {
      chapitreCourant = c;
      editNom.value = c.NOM_CHAPITRE;
      editFichier.value = "";
      modal.classList.remove("hidden");
    };

    // Supprimer
    li.querySelector(".btn-del").onclick = async () => {
      if (confirm(`Supprimer le chapitre "${c.NOM_CHAPITRE}" ?`)) {
        await fetch(`/api/chapitres/${c.ID_CHAPITRE}`, { method: "DELETE" });
        chargerChapitres();
      }
    };

    listeChapitres.appendChild(li);
  });
}

// =====================
// Modifier un chapitre
// =====================
saveBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  if (!chapitreCourant) return;

  const NOM_CHAPITRE = editNom.value.trim();
  const FICHIER = editFichier.files[0];

  if (!NOM_CHAPITRE) {
    alert("Le nom du chapitre est requis.");
    return;
  }

  const formData = new FormData();
  formData.append("NOM_CHAPITRE", NOM_CHAPITRE);
  if (FICHIER) formData.append("fichier", FICHIER);

  try {
    const res = await fetch(`/api/chapitres/${chapitreCourant.ID_CHAPITRE}`, {
      method: "PUT",
      body: formData,
    });

    if (res.ok) {
      modal.classList.add("hidden");
      chargerChapitres();
    } else {
      const err = await res.json();
      alert("❌ Erreur : " + err.error);
    }
  } catch (err) {
    console.error("Erreur PUT :", err);
    alert("Erreur de communication avec le serveur");
  }
});

// Annuler
cancelBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  chapitreCourant = null;
});

// =====================
// Ajouter un chapitre
// =====================
formChapitre.addEventListener("submit", async (e) => {
  e.preventDefault();

  const NOM_CHAPITRE = document.getElementById("NOM_CHAPITRE").value.trim();
  const FICHIER = document.getElementById("FICHIER").files[0];

  if (!NOM_CHAPITRE) {
    alert("Veuillez entrer un nom de chapitre.");
    return;
  }

  const formData = new FormData();
  formData.append("NOM_CHAPITRE", NOM_CHAPITRE);
  formData.append("ID_MATIERE", ID_MATIERE);
  if (FICHIER) formData.append("fichier", FICHIER);

  try {
    const res = await fetch("/api/chapitres", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      formChapitre.reset();
      chargerChapitres();
    } else {
      const err = await res.json();
      alert("❌ Erreur lors de l’ajout : " + err.error);
    }
  } catch (err) {
    console.error("Erreur POST :", err);
    alert("Erreur de communication avec le serveur");
  }
});

chargerChapitres();
