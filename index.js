const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

// ============================================================
//  CONFIGURATION — remplacez ces valeurs
// ============================================================
const VERIFY_TOKEN = "mon_token_secret_123";   // choisissez librement
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN; // mis dans Railway
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID; // depuis Meta

// ============================================================
//  LISTE DES TUTORIELS — ajoutez/modifiez selon vos besoins
// ============================================================
const tutoriels = [
  { titre: "Installation de Windows 11",          contenu: "📦 Tutoriel Windows 11 :\n1. Téléchargez l'ISO sur microsoft.com\n2. Créez une clé USB bootable avec Rufus\n3. Démarrez sur la clé USB\n4. Suivez l'assistant d'installation\n\n🔗 Guide complet : https://support.microsoft.com/windows11" },
  { titre: "Partage de fichiers via Google Drive", contenu: "☁️ Tutoriel Google Drive :\n1. Connectez-vous sur drive.google.com\n2. Cliquez droit sur votre fichier\n3. Choisissez 'Partager'\n4. Entrez l'email du destinataire\n5. Définissez les droits (lecture/modification)\n\n✅ Le destinataire reçoit un email avec le lien." },
  { titre: "Configurer un VPN",                    contenu: "🔒 Tutoriel VPN :\n1. Choisissez un fournisseur (ProtonVPN, Windscribe...)\n2. Créez un compte gratuit\n3. Téléchargez l'application\n4. Connectez-vous et choisissez un serveur\n\n⚠️ Évitez les VPN gratuits inconnus — ils peuvent voler vos données." },
  { titre: "Créer un mot de passe sécurisé",       contenu: "🔑 Tutoriel mot de passe :\n• Minimum 12 caractères\n• Mélangez lettres, chiffres, symboles\n• Jamais le même sur 2 sites\n• Utilisez un gestionnaire : Bitwarden (gratuit)\n\n💡 Exemple fort : Mango@2024#Ciel" },
  { titre: "Connecter une imprimante réseau",      contenu: "🖨️ Tutoriel imprimante réseau :\n1. Vérifiez que l'imprimante est sur le même WiFi\n2. Windows : Paramètres > Imprimantes > Ajouter\n3. Choisissez 'L'imprimante n'est pas listée'\n4. Cherchez par adresse IP\n5. Installez le pilote si demandé" },
];

// ============================================================
//  VÉRIFICATION DU WEBHOOK (Meta l'appelle une seule fois)
// ============================================================
app.get("/webhook", (req, res) => {
  const mode      = req.query["hub.mode"];
  const token     = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook vérifié");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ============================================================
//  RÉCEPTION DES MESSAGES
// ============================================================
app.post("/webhook", (req, res) => {
  const body = req.body;
  if (body.object !== "whatsapp_business_account") return res.sendStatus(404);

  const changes = body.entry?.[0]?.changes?.[0]?.value;
  const message = changes?.messages?.[0];
  if (!message) return res.sendStatus(200);

  const from = message.from; // numéro de l'expéditeur
  const text = message.text?.body?.trim().toLowerCase() || "";

  console.log(`📩 Message de ${from} : "${text}"`);
  traiterMessage(from, text);
  res.sendStatus(200);
});

// ============================================================
//  LOGIQUE DU BOT
// ============================================================
function traiterMessage(from, text) {
  if (text === "liste") {
    let reponse = "📋 *Tutoriels disponibles :*\n\n";
    tutoriels.forEach((t, i) => {
      reponse += `*${i + 1}.* ${t.titre}\n`;
    });
    reponse += "\n✏️ Répondez avec le *numéro* du tutoriel souhaité.";
    envoyerMessage(from, reponse);
    return;
  }

  const num = parseInt(text);
  if (!isNaN(num) && num >= 1 && num <= tutoriels.length) {
    const tuto = tutoriels[num - 1];
    envoyerMessage(from, `📖 *${tuto.titre}*\n\n${tuto.contenu}`);
    return;
  }

  if (text === "aide" || text === "help" || text === "bonjour") {
    envoyerMessage(from,
      "👋 Bienvenue sur le *Bot Tutoriels* !\n\n" +
      "Commandes disponibles :\n" +
      "• *liste* — voir tous les tutoriels\n" +
      "• *1 à " + tutoriels.length + "* — lire un tutoriel\n" +
      "• *aide* — afficher ce message"
    );
    return;
  }

  envoyerMessage(from,
    "❓ Je n'ai pas compris.\nTapez *liste* pour voir les tutoriels disponibles."
  );
}

// ============================================================
//  ENVOI D'UN MESSAGE WHATSAPP
// ============================================================
async function envoyerMessage(to, texte) {
  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: texte },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`✅ Message envoyé à ${to}`);
  } catch (err) {
    console.error("❌ Erreur envoi :", err.response?.data || err.message);
  }
}

// ============================================================
//  DÉMARRAGE DU SERVEUR
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🤖 Bot démarré sur le port ${PORT}`));
