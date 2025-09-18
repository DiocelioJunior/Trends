const fs = require('fs');
const path = require('path');

const trendsPath = path.join(__dirname, '../../data/trends.json');

function readTrends() {
  if (!fs.existsSync(trendsPath)) return [];
  const raw = fs.readFileSync(trendsPath, 'utf-8');
  return JSON.parse(raw || '[]');
}

function writeTrends(data) {
  fs.writeFileSync(trendsPath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
  readTrends,
  writeTrends
};
