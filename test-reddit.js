const axios = require('axios');

async function testReddit() {
  const url = 'https://www.reddit.com/r/brasil/hot.json?limit=5';
  try {
    const resp = await axios.get(url, {
      headers: { 'User-Agent': 'trends-app/1.0' }
    });

    const posts = resp.data.data.children.map(p => ({
      name: p.data.title,
      url: "https://reddit.com" + p.data.permalink,
      upvotes: p.data.ups
    }));

    console.log(posts);
  } catch (err) {
    console.error('Erro ao buscar Reddit:', err.message);
  }
}

testReddit();
