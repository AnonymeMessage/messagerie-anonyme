const SERVER_URL = "https://a40ed1ee-c227-4be7-be0d-df17cfc36f5e-00-2xjlwes2k0pyh.janeway.replit.dev";
let motDePasse = "";
let decrypterActif = false;

const MESSAGE_TEST_CHIFFRE = "UWJZUUZXXUI=";

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
  const password = e.target.value;

  fetch(SERVER_URL + "/verify-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        motDePasse = password;
        decrypterActif = true;
      } else {
        decrypterActif = false;
        motDePasse = "";
      }
      chargerMessages();
    })
    .catch(err => {
      alert("Mot de passe incorrect");
      decrypterActif = false;
    });
});

function envoyer() {
  const msg = document.getElementById("message").value.trim();
  if (!msg) return alert("Message vide");
  if (!decrypterActif || !motDePasse) return alert("Mot de passe requis ou incorrect.");

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
