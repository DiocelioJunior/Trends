const fs = require('fs');
const path = require('path');
const { getTrends24Brazil } = require('../services/trends24');
const { getTrendInterest } = require('../services/googleTrendsService');
const { readTrends, writeTrends } = require('../db/db');
const { getRedditTrends } = require('../services/redditService'); // Certifique-se de ter esse arquivo!

async function fetchAndSaveTrends() {
  console.log('[cron] Coletando trends...');

  const twitterTrends = await getTrends24Brazil();
  const redditTrends = await getRedditTrends(); 
  console.log('[debug] Reddit Trends:', redditTrends);

  const topTrends = twitterTrends
    .reduce((map, trend) => {
      if (!map.has(trend.name)) {
        map.set(trend.name, {
          name: trend.name,
          count: 1,
          url: trend.url,
          tweet_volume: trend.tweet_volume,
        });
      } else {
        map.get(trend.name).count++;
      }
      return map;
    }, new Map());

  const sorted = Array.from(topTrends.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 25);

  console.log('[cron] Consultando Google Trends...');
  const enriched = [];

  for (const trend of sorted) {
    const g = await getTrendInterest(trend.name);
    enriched.push({
      ...trend,
      google_trends: g,
    });
  }

  // 🔥 em vez de acumular com readTrends + push, monta um array novo
  const db = [{
    timestamp: new Date(),
    twitter: twitterTrends,
    reddit: redditTrends,
    top25_enriched: enriched
  }];

  writeTrends(db); // sobrescreve trends.json com apenas este scrape
  console.log('[cron] Trends salvas com sucesso.');
}

module.exports = { fetchAndSaveTrends };
