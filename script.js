const SERVER_URL = "https://a40ed1ee-c227-4be7-be0d-df17cfc36f5e-00-2xjlwes2k0pyh.janeway.replit.dev"; // adresse Replit (on la crée juste après)

function envoyer() {
  const msg = document.getElementById("message").value.trim();
  if (!msg) return alert("Message vide");

  fetch(SERVER_URL + "/post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: msg })
  }).then(res => {
    if (res.ok) alert("Message envoyé !");
    else alert("Erreur lors de l'envoi.");
  });
}

async function chargerMessages() {
  const res = await fetch(SERVER_URL + "/get");
  const data = await res.json();

  document.getElementById("messages").innerHTML = data.map(m =>
    `<pre>${m.message}</pre>`
  ).join('');
}

setInterval(chargerMessages, 5000);
