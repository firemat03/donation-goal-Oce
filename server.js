// server.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

// Fichier local pour stocker la progression (persistance sur Render)
const DATA_FILE = path.join(__dirname, 'data.json');

// Fonction utilitaire
async function loadData() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { currentAmount: 0, goalAmount: 100 };
  }
}

async function saveData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// GET → lire les valeurs
app.get('/donation-goal', async (req, res) => {
  const data = await loadData();
  res.json(data);
});

// POST → mettre à jour (protégé avec clé API via header Authorization)
app.post('/donation-goal', async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token !== process.env.API_KEY) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { currentAmount, goalAmount } = req.body;
  const data = await loadData();
  if (typeof currentAmount === "number") data.currentAmount = currentAmount;
  if (typeof goalAmount === "number") data.goalAmount = goalAmount;

  await saveData(data);
  res.json(data);
});

// Render écoute le port fourni par la plateforme
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Donation goal API running on port ${PORT}`));
