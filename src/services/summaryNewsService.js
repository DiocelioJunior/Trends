const axios = require('axios');
const NEWS_API_KEY = process.env.NEWSAPI_KEY;

async function getNewsSummary(keyword) {
  const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];

  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(keyword)}&from=${fromDate}&language=pt&sortBy=popularity&pageSize=3&apiKey=${NEWS_API_KEY}`;

  try {
    console.log('[DEBUG] URL usada na request:', url);

    const response = await axios.get(url);
    const articles = response.data.articles;

    if (!articles || articles.length === 0) {
      return null;
    }

    return articles.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url
    }));
  } catch (err) {
    console.warn(`[ResumoNews] Falhou para "${keyword}": ${err.message}`);
    return null;
  }
}

module.exports = { getNewsSummary };
