const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
app.use(express.json());

const DATA_FILE = path.join(__dirname, "data.json");

// Lire les données du goal
async function loadData() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { currentAmount: 0, goalAmount: 100 };
  }
}

// Sauvegarder les données
async function saveData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// Route GET → récupérer l’état du goal
app.get("/donation-goal", async (req, res) => {
  const data = await loadData();
  res.json(data);
});

// Route POST → mettre à jour (protégé par une clé API)
app.post("/donation-goal", async (req, res) => {
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

// Render fournit PORT dans l’environnement
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Donation Goal API running on port ${PORT}`);
});
