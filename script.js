const SERVER_URL = "https://a40ed1ee-c227-4be7-be0d-df17cfc36f5e-00-2xjlwes2k0pyh.janeway.replit.dev";
const CORRECT_PASSWORD = "&X9r@z!Vq#7^BdW";
let motDePasse = "";
let decrypterActif = false;

// Algorithme de cryptage/décryptage maison
function customEncrypt(text, key) {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const keyCode = key.charCodeAt(i % key.length);
    result += String.fromCharCode((charCode + keyCode) % 256);
  }
  return btoa(result);
}

function customDecrypt(base64, key) {
  try {
    const text = atob(base64);
    let result = "";
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const keyCode = key.charCodeAt(i % key.length);
      result += String.fromCharCode((charCode - keyCode + 256) % 256);
    }
    return result;
  } catch (e) {
    return "[décryptage impossible]";
  }
}

document.getElementById("passwordInput").addEventListener("input", (e) => {
  motDePasse = e.target.value;
  decrypterActif = motDePasse === CORRECT_PASSWORD;
  chargerMessages(); // recharge avec ou sans décryptage
});

function envoyer() {
  const msg = document.getElementById("message").value.trim();
  if (!msg) return alert("Message vide");

  if (!motDePasse || motDePasse !== CORRECT_PASSWORD) {
    return alert("Mot de passe requis ou incorrect pour envoyer.");
  }

  const encrypted = customEncrypt(msg, motDePasse);

  fetch(SERVER_URL + "/post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: encrypted })
  }).then(res => {
    if (res.ok) {
      document.getElementById("message").value = "";
      chargerMessages();
    } else {
      alert("Erreur lors de l'envoi.");
    }
  });
}

function viderChat() {
  if (!confirm("Supprimer tous les messages ?")) return;

  fetch(SERVER_URL + "/clear", {
    method: "POST"
  }).then(res => {
    if (res.ok) {
      chargerMessages();
    } else {
      alert("Erreur lors de la suppression");
    }
  });
}

async function chargerMessages() {
  try {
    const res = await fetch(SERVER_URL + "/get");
    const data = await res.json();

    document.getElementById("messages").innerHTML = data.reverse().map(m => {
      const contenu = decrypterActif ? customDecrypt(m.message, motDePasse) : m.message;
      return `<div class="message">${contenu}</div>`;
    }).join('');
  } catch (err) {
    console.error("Erreur chargement messages :", err);
  }
}

function mettreAJourCompteur() {
  const socket = io(SERVER_URL);
  socket.on('userCount', (count) => {
    document.getElementById("user-count").textContent = count;
  });
}

mettreAJourCompteur();
setInterval(chargerMessages, 1000);
