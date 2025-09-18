const express = require('express');
const router = express.Router();
const fs = require("fs");
const path = require("path"); // <-- ADICIONADO
const trendsPath = path.join(__dirname, "../../data/trends.json"); // <-- ADICIONADO

const { readTrends } = require('../db/db');
const { getNewsSummary } = require('../services/summaryNewsService');
const { getRedditPosts } = require('../services/redditService');
const { fetchAndSaveTrends } = require('../jobs/fetchTrends');


router.get("/api/trends", (req, res) => {
  try {
    const raw = fs.readFileSync(trendsPath, "utf-8");
    const trends = JSON.parse(raw);
    res.json(trends);
  } catch (err) {
    console.error("[ERRO] Falha ao carregar trends:", err);
    res.status(500).json({ error: "Erro ao carregar trends" });
  }
});

router.get('/api/news-summary', async (req, res) => {
  const term = req.query.term;
  if (!term) return res.status(400).json({ error: 'Termo obrigatório' });

  const summary = await getNewsSummary(term);
  if (!summary) return res.status(404).json({ error: 'Nenhuma notícia encontrada' });

  res.json(summary);
});

router.get('/api/reddit-posts', async (req, res) => {
  const term = req.query.term;
  if (!term) return res.status(400).json({ error: 'term obrigatório' });

  const posts = await getRedditPosts(term);
  if (!posts) return res.status(404).json({ error: 'Nenhum post encontrado' });

  res.json(posts);
});

router.get('/scrape', async (req, res) => {
  try {
    await fetchAndSaveTrends();
    res.json({ message: 'Scraping concluído! trends.json atualizado.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao executar scraping.' });
  }
});


module.exports = router;
