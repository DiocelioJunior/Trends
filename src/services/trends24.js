const axios = require('axios');
const cheerio = require('cheerio');

async function getTrends24Brazil() {
  try {
    const { data: html } = await axios.get('https://trends24.in/brazil/');
    const $ = cheerio.load(html);

    const allTrends = [];

    $('.list-container').each((_, container) => {
      const timeLabel = $(container).find('h3.title').text().trim();

      $(container).find('ol.trend-card__list li').each((i, el) => {
        const name = $(el).find('a.trend-link').text().trim();
        const url = $(el).find('a.trend-link').attr('href');
        const tweetCount = $(el).find('.tweet-count').text().trim();

        if (name) {
          allTrends.push({
            name,
            url: `https://trends24.in${url}`,
            tweet_volume: tweetCount || null,
            position: i + 1,
            hour: timeLabel
          });
        }
      });
    });

    return allTrends;
  } catch (err) {
    console.error('Erro Trends24:', err.message);
    return [];
  }
}

module.exports = { getTrends24Brazil };
