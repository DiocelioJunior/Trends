const axios = require('axios');

async function getRedditTrends(term) {
  try {
    const url = `https://www.reddit.com/r/brasil/hot.json?limit=50`;
    const resp = await axios.get(url, {
      headers: {
        'User-Agent': 'trends-app/1.0'
      }
    });

    const posts = resp.data.data.children;
    if (!posts || posts.length === 0) return null;

    return posts
      .map(p => ({
        title: p.data.title,
        url: 'https://reddit.com' + p.data.permalink,
        subreddit: p.data.subreddit,
        ups: p.data.ups
      }))
      .sort((a, b) => b.ups - a.ups); // ordena por votos, do maior pro menor
  } catch (err) {
    console.warn(`[Reddit] Falhou para "${term}": ${err.message}`);
    return null;
  }
}

module.exports = { getRedditTrends };
