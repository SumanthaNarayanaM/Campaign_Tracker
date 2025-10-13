const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'campaigns.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '[]');

function readDB() {
  const raw = fs.readFileSync(DB_FILE, 'utf8');
  try {
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

app.get('/api/campaigns', (req, res) => {
  const campaigns = readDB();
  res.json(campaigns);
});

app.post('/api/campaigns', (req, res) => {
  const { campaignName, clientName, startDate, status } = req.body;
  if (!campaignName || !clientName || !startDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const campaigns = readDB();
  const newCampaign = {
    id: makeId(),
    campaignName,
    clientName,
    startDate,
    status: status || 'Active',
    createdAt: new Date().toISOString(),
  };
  campaigns.push(newCampaign);
  writeDB(campaigns);
  res.status(201).json(newCampaign);
});

app.put('/api/campaigns/:id', (req, res) => {
  const id = req.params.id;
  const updates = req.body;
  const campaigns = readDB();
  const index = campaigns.findIndex((c) => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  campaigns[index] = { ...campaigns[index], ...updates, updatedAt: new Date().toISOString() };
  writeDB(campaigns);
  res.json(campaigns[index]);
});

app.delete('/api/campaigns/:id', (req, res) => {
  const id = req.params.id;
  let campaigns = readDB();
  const index = campaigns.findIndex((c) => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  const removed = campaigns.splice(index, 1)[0];
  writeDB(campaigns);
  res.json({ success: true, removed });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server listening on port ${PORT}`));
