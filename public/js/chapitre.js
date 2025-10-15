const params = new URLSearchParams(window.location.search);
const ID_MATIERE = params.get("id");
const NOM_MATIERE = decodeURIComponent(params.get("nom"));
document.getElementById("titre-matiere").textContent =
  `Chapitres de la matière : ${NOM_MATIERE}`;
 
const listeChapitres = document.getElementById("liste-chapitres");
const formChapitre = document.getElementById("form-chapitre");
 
// Modale
const modal = document.getElementById("modal");
const nomInput = document.getElementById("edit-nom");
const lienInput = document.getElementById("edit-lien");
const saveBtn = document.getElementById("save-btn");
const cancelBtn = document.getElementById("cancel-btn");
 
let chapitreCourant = null;
 
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
 
    li.querySelector(".btn-edit").onclick = () => {
      chapitreCourant = c;
      nomInput.value = c.NOM_CHAPITRE;
      lienInput.value = c.CHEMIN_FICHIER || "";
      modal.classList.remove("hidden");
    };
 
    li.querySelector(".btn-del").onclick = async () => {
      if (confirm(`Supprimer le chapitre "${c.NOM_CHAPITRE}" ?`)) {
        await fetch(`/api/chapitres/${c.ID_CHAPITRE}`, { method: "DELETE" });
        chargerChapitres();
      }
    };
 
    listeChapitres.appendChild(li);
  });
}
 
// 🔹 Modifier chapitre
saveBtn.onclick = async () => {
  const NOM_CHAPITRE = nomInput.value.trim();
  const CHEMIN_FICHIER = lienInput.value.trim();
  if (!NOM_CHAPITRE) return;
  await fetch(`/api/chapitres/${chapitreCourant.ID_CHAPITRE}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ NOM_CHAPITRE, CHEMIN_FICHIER }),
  });
  modal.classList.add("hidden");
  chargerChapitres();
};
 
cancelBtn.onclick = () => modal.classList.add("hidden");
 
// ✅ Ajouter chapitre (FormData + fichier)
formChapitre.addEventListener("submit", async (e) => {
  e.preventDefault();
  const NOM_CHAPITRE = document.getElementById("NOM_CHAPITRE").value.trim();
  const FICHIER = document.getElementById("FICHIER").files[0];
 
  const formData = new FormData();
  formData.append("NOM_CHAPITRE", NOM_CHAPITRE);
  formData.append("ID_MATIERE", ID_MATIERE);
  if (FICHIER) formData.append("fichier", FICHIER);
 
  await fetch("/api/chapitres", {
    method: "POST",
    body: formData,
  });
 
  formChapitre.reset();
  chargerChapitres();
});
 
chargerChapitres();