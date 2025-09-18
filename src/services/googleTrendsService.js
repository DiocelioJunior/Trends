const googleTrends = require('google-trends-api');

async function getTrendInterest(keyword) {
  try {
    const results = await googleTrends.interestOverTime({
      keyword,
      geo: 'BR',
      hl: 'pt-BR',
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      // opcional: adicionar algum agente ou headers
      // agent: algum proxy HTTP, se tiver
    });

    const data = JSON.parse(results);
    const timeline = data.default.timelineData || [];
    if (timeline.length === 0) {
      throw new Error('Sem timelineData');
    }
    const values = timeline.map(d => d.value[0] || 0);

    const average = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    const max = Math.max(...values);
    const last = values[values.length - 1];

    return { average, peak: max, last, samples: values.length, keyword };
  } catch (err) {
    console.warn(`[Google Trends] Falhou para "${keyword}": ${err.message}`);
    return null;
  }
}

module.exports = { getTrendInterest };
