const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const dbFile = './campaigns.json';

// Helper: read campaigns from file
function readCampaigns() {
  if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, '[]');
  const data = fs.readFileSync(dbFile);
  return JSON.parse(data);
}

// Helper: write campaigns to file
function writeCampaigns(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

// Get all campaigns
app.get('/api/campaigns', (req, res) => {
  const campaigns = readCampaigns();
  res.json(campaigns);
});

// Add a campaign
app.post('/api/campaigns', (req, res) => {
  const campaigns = readCampaigns();
  const newCampaign = { id: Date.now(), ...req.body };
  campaigns.push(newCampaign);
  writeCampaigns(campaigns);
  res.json(newCampaign);
});

// Update campaign status
app.put('/api/campaigns/:id', (req, res) => {
  const campaigns = readCampaigns();
  const idx = campaigns.findIndex(c => c.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  campaigns[idx].status = req.body.status;
  writeCampaigns(campaigns);
  res.json(campaigns[idx]);
});

// Delete campaign
app.delete('/api/campaigns/:id', (req, res) => {
  let campaigns = readCampaigns();
  campaigns = campaigns.filter(c => c.id != req.params.id);
  writeCampaigns(campaigns);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
