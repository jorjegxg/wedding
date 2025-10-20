
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

  // 2️⃣ Import Firebase modules
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
  import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js";
  import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

  // 3️⃣ Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);
  const db = getFirestore(app);

  // 4️⃣ Funcția selectPhoto poate folosi acum storage și db
  async function selectPhoto(id) {
    const input = document.getElementById(`fileInput${id}`);
    input.click();

    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const img = document.getElementById(`preview${id}`);
      img.src = URL.createObjectURL(file);
      img.style.display = "block";

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
    };
  }


    // JS: missions.js

// Funcția "componentă" pentru cardul unei misiuni
function MissionCard({ id, title, description }) {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <h2 class="card-title">${title}</h2>
    <p class="card-description">${description}</p>
    <input type="file" accept="image/*" capture="camera" style="display:none" id="fileInput${id}" />
    <button class="card-button">Creează poza</button>
    <img id="preview${id}" class="photo-preview" />
  `;

  const button = card.querySelector(".card-button");
  const input = card.querySelector(`#fileInput${id}`);
  const img = card.querySelector(`#preview${id}`);

  // 1️⃣ Verificăm dacă există deja o poză salvată în localStorage
  const saved = localStorage.getItem(`mission_${id}`);
  if (saved) {
    img.src = saved;
    img.style.display = "block";
  }

  // 2️⃣ La click pe buton, deschidem selectorul de fișiere
  button.addEventListener("click", () => input.click());

  // 3️⃣ La selectarea pozei, afișăm și salvăm în localStorage
  input.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.src = e.target.result;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxWidth = 800;
      const scale = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.7); // comprimare 70%
      const preview = document.getElementById(`preview${id}`);
      preview.src = dataUrl;
      preview.style.display = "block";

      try {
        localStorage.setItem(`mission_${id}`, dataUrl);
      } catch (err) {
        alert("Poză prea mare pentru localStorage. Încearcă o poză mai mică.");
        console.error(err);
      }
    };
  };
  reader.readAsDataURL(file);
});


  return card;
}

// Lista de misiuni (poți adăuga câte vrei)
const missions = [
  { id: 1, title: "Misiunea 1", description: "Fa o poza cu mireasa" },
  { id: 2, title: "Misiunea 2", description: "Fa o poza cu ce ai in momentul asta in fata" },
  { id: 3, title: "Misiunea 3", description: "Fa o poza cu nasii" },
  { id: 4, title: "Misiunea 4", description: "Fa o poza random" }
];

// Render în containerul HTML
const container = document.getElementById("missions");
missions.forEach(mission => container.appendChild(MissionCard(mission)));
