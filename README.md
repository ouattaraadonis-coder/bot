# Bot WhatsApp Tutoriels

## Variables d'environnement (à configurer sur Railway)
| Variable | Où la trouver |
|---|---|
| `WHATSAPP_TOKEN` | Meta Developers > Votre App > WhatsApp > Token d'accès |
| `PHONE_NUMBER_ID` | Meta Developers > Votre App > WhatsApp > Numéros de téléphone |

## Commandes du bot
- `liste` → affiche tous les tutoriels
- `1` à `N` → envoie le tutoriel correspondant
- `aide` → affiche l'aide

## Ajouter un tutoriel
Dans `index.js`, ajoutez un objet dans le tableau `tutoriels` :
```js
{ titre: "Mon nouveau tutoriel", contenu: "Contenu détaillé ici..." }
```
