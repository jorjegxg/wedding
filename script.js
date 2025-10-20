  // 2️⃣ Import Firebase modules
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
  import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js";
  import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

  // 1️⃣ Configurația Firebase
 const firebaseConfig = {
  apiKey: "AIzaSyCkskJFpmUNbop-0HB4ixoN5ENu98Utei4",
  authDomain: "weddings-app-1a13a.firebaseapp.com",
  projectId: "weddings-app-1a13a",
  storageBucket: "weddings-app-1a13a.firebasestorage.app",
  messagingSenderId: "991177390318",
  appId: "1:991177390318:web:033cd5b9619edfc7441bff",
  measurementId: "G-YZ5108NPN3"
};

  // 10️⃣ Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);
  const db = getFirestore(app);


async function uploadImageToFirebase(id, file){
  // 2️⃣ Upload Firebase
  try {
    const filename = `${id}_${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `misiuni/${id}/${filename}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    await addDoc(collection(db, "poze_misiuni"), {
      missionId: id,
      imageUrl: url,
      timestamp: new Date()
    });

    console.log("Poză încărcată și URL salvat:", url);
  } catch (error) {
    console.error("Eroare la upload:", error);
  }
}


// 🔹 Funcție pentru redimensionarea unei imagini folosind <canvas>
function resizeImage(image, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");

    // Calculăm factorul de scalare (nu mărim imaginea peste dimensiunea ei originală)
    const scale = Math.min(maxWidth / image.width, 1);

    // Setăm dimensiunile canvas-ului redimensionat
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Convertim imaginea redimensionată într-un string base64 (JPEG)
    const dataUrl = canvas.toDataURL("image/jpeg", quality);

    resolve(dataUrl);
  });
}

// 🔹 Funcția principală MissionCard
function MissionCard({ id, title, description }) {
  // 🔸 Creăm un card HTML
  const card = document.createElement("div");
  card.className = "card";

  // 🔸 Structura internă a cardului
  card.innerHTML = `
    <h2 class="card-title">${title}</h2>
    <p class="card-description">${description}</p>
    <input 
      type="file" 
      accept="image/*" 
      capture="camera" 
      style="display:none" 
      id="fileInput${id}" 
    />
    <button class="card-button">Creează poza</button>
    <img id="preview${id}" class="photo-preview" />
  `;

  // 🔸 Selectăm elementele HTML relevante
  const button = card.querySelector(".card-button");
  const input = card.querySelector(`#fileInput${id}`);
  const img = card.querySelector(`#preview${id}`);

  // 🔹 1️⃣ Dacă există deja o imagine salvată în localStorage, o încărcăm
  const saved = localStorage.getItem(`mission_${id}`);
  if (saved) {
    img.src = saved;
    img.style.display = "block";
  }

  // 🔹 2️⃣ La click pe buton, declanșăm input-ul de fișiere
  button.addEventListener("click", () => input.click());

  // 🔹 3️⃣ Când se selectează o imagine, o citim, redimensionăm și salvăm
  input.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (e) => {
      // Creăm un element Image din fișierul citit
      const imgElement = new Image();
      imgElement.src = e.target.result;

      imgElement.onload = async () => {
        try {
          // 🔸 Redimensionăm imaginea folosind funcția externă
          const dataUrl = await resizeImage(imgElement, 400, 1);

          // 🔸 Afișăm preview-ul
          const preview = document.getElementById(`preview${id}`);
          preview.src = dataUrl;
          preview.style.display = "block";

          // 🔸 Salvăm în localStorage
          localStorage.setItem(`mission_${id}`, dataUrl);

        } catch (err) {
          console.error("❌ Eroare la procesarea imaginii:", err);
        }
      };
    };

    reader.readAsDataURL(file); // Citim fișierul ca DataURL

          // 🔸 (Opțional) urcăm imaginea în Firebase
          uploadImageToFirebase(id, file);
  });

  return card;
}


// Lista de misiuni (poți adăuga câte vrei)
const missions = [
  { id: 1, title: "Misiunea 1", description: "Fa o poza cu mireasa" },
  { id: 2, title: "Misiunea 2", description: "Fa o poza cu ce ai in momentul asta in fata" },
  { id: 3, title: "Misiunea 3", description: "Fa o poza cu nasii" },
  { id: 4, title: "Misiunea 4", description: "Fa o poza random" },
  { id: 5, title: "Misiunea 5", description: "Fa o poza la momentul sampania mirelui" },
  { id: 6, title: "Misiunea 5", description: "Cauta-l pe Gabriel Luta si zi-i ca ai terminat" },

];

// Render în containerul HTML
const container = document.getElementById("missions");
missions.forEach(mission => container.appendChild(MissionCard(mission)));

