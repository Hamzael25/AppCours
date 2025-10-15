const listeMatieres = document.getElementById("liste-matieres");
const formMatiere = document.getElementById("form-matiere");
const modal = document.getElementById("modal");
const inputModal = document.getElementById("edit-input");
const saveBtn = document.getElementById("save-btn");
const cancelBtn = document.getElementById("cancel-btn");
 
let matiereCourante = null;
 
async function chargerMatieres() {
  const res = await fetch("/api/matieres");
  const matieres = await res.json();
  listeMatieres.innerHTML = "";
 
  if (matieres.length === 0) {
    listeMatieres.innerHTML = "<p>Aucune matière pour le moment.</p>";
    return;
  }
 
  matieres.forEach((m) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${m.NOM_MATIERE}</strong>
      <div class="actions">
        <button class="btn-edit">✏️ Modifier</button>
        <button class="btn-del">🗑️ Supprimer</button>
        <button class="btn-view">📘 Voir chapitres</button>
      </div>
    `;
 
    // 🔸 Modifier matière
    li.querySelector(".btn-edit").onclick = () => {
      matiereCourante = m;
      inputModal.value = m.NOM_MATIERE;
      modal.classList.remove("hidden");
    };
 
    // 🔸 Supprimer matière
    li.querySelector(".btn-del").onclick = async () => {
      if (confirm(`Supprimer la matière "${m.NOM_MATIERE}" ?`)) {
        await fetch(`/api/matieres/${m.ID_MATIERE}`, { method: "DELETE" });
        chargerMatieres();
      }
    };
 
    // 🔸 Voir chapitres
    li.querySelector(".btn-view").onclick = () => {
      window.location.href = `chapitre.html?id=${m.ID_MATIERE}&nom=${encodeURIComponent(m.NOM_MATIERE)}`;
    };
 
    listeMatieres.appendChild(li);
  });
}
 
// 🔹 Sauvegarder la modification
saveBtn.onclick = async () => {
  const nouveauNom = inputModal.value.trim();
  if (!nouveauNom) return;
  await fetch(`/api/matieres/${matiereCourante.ID_MATIERE}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ NOM_MATIERE: nouveauNom }),
  });
  modal.classList.add("hidden");
  chargerMatieres();
};
 
// 🔹 Annuler
cancelBtn.onclick = () => modal.classList.add("hidden");
 
// 🔹 Ajouter matière
formMatiere.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nom = document.getElementById("NOM_MATIERE").value.trim();
  if (!nom) return;
  await fetch("/api/matieres", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ NOM_MATIERE: nom }),
  });
  formMatiere.reset();
  chargerMatieres();
});
 
chargerMatieres();
