const express = require('express');
const path = require('path');
const cron = require('node-cron');
const { fetchAndSaveTrends } = require('./src/jobs/fetchTrends');
require('dotenv').config();


const trendsRouter = require('./src/routes');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', trendsRouter);


cron.schedule('0 * * * *', fetchAndSaveTrends);
fetchAndSaveTrends();

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
