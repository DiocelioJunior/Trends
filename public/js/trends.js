document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("trend-container");
    const redditContainer = document.getElementById("reddit-container");
    const searchInput = document.getElementById("news-search");
    const searchForm = document.getElementById("news-search-form");
    const searchResults = document.getElementById("news-results");

    const res = await fetch("/api/trends");
    const allData = await res.json();

    // === Agrupar Trends do Twitter ===
    const trendMap = new Map();

    allData.forEach(entry => {
        if (!entry.twitter) return;

        entry.twitter.forEach(trend => {
            if (!trend.name) return;

            if (!trendMap.has(trend.name)) {
                trendMap.set(trend.name, {
                    name: trend.name,
                    count: 0,
                    totalPosition: 0,
                    tweet_volume: trend.tweet_volume,
                    url: trend.url || `https://x.com/search?q=${encodeURIComponent(trend.name)}`
                });
            }

            const t = trendMap.get(trend.name);
            t.count += 1;
            t.totalPosition += trend.position || 999;
        });
    });

    // Ordenar e renderizar top 25 por média de posição
    const trends = Array.from(trendMap.values())
        .map(t => ({
            ...t,
            avgPosition: t.totalPosition / t.count
        }))
        .sort((a, b) => a.avgPosition - b.avgPosition)
        .slice(0, 25);

    container.innerHTML = "";
    trends.forEach((trend, i) => {
        const block = document.createElement("div");
        block.className = "trend-block";

        block.innerHTML = `
      <div class="trend-row">
        <a class="trend-name-link" href="https://x.com/search?q=${encodeURIComponent(trend.name)}" target="_blank">${i + 1}. ${trend.name}</a>
        <span class="volume">${trend.tweet_volume || "?"}</span>
      </div>
      <div class="trend-buttons">
        <button class="btn-news" data-term="${trend.name}"></button>
        <a class="btn-twitter" title="Ver no X" href="https://x.com/search?q=${encodeURIComponent(trend.name)}" target="_blank"><span class="material-symbols-outlined">news</span></a>
      </div>
      <div class="news-result" id="news-${i}"></div>
    `;

        container.appendChild(block);

        const btnNews = block.querySelector(".btn-news");
        btnNews.onclick = async () => {
            const term = btnNews.getAttribute("data-term");
            const summaryDiv = document.getElementById(`news-${i}`);
            summaryDiv.innerHTML = "Buscando...";

            const resp = await fetch(`/api/news-summary?term=${encodeURIComponent(term)}`);
            const json = await resp.json();

            if (!json || json.length === 0) {
                summaryDiv.innerHTML = "<em>Nenhuma notícia encontrada.</em>";
                return;
            }

            summaryDiv.innerHTML = `
        <ul>${json.map(article => `
          <li><a href="${article.url}" target="_blank">${article.title}</a><br><small>${article.description || ''}</small></li>
        `).join('')}</ul>
      `;
        };
    });

    // === Renderizar Reddit no segundo card-info ===
    if (allData[allData.length - 1].reddit) {
        const redditData = allData[allData.length - 1].reddit;

        redditContainer.innerHTML = redditData.map(post => `
  <div class="reddit-block">
    <a href="${post.url}" target="_blank">${post.title}</a>
    <div class="volume">📌 r/${post.subreddit} — ⬆️ ${post.ups} votos</div>
  </div>
`).join('');

    } else {
        redditContainer.innerHTML = "<em>Sem dados do Reddit disponíveis.</em>";
    }

    // === Busca manual de notícias ===
    searchForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const term = searchInput.value.trim();
        if (!term) return;

        searchResults.innerHTML = "Buscando...";

        try {
            const resp = await fetch(`/api/news-summary?term=${encodeURIComponent(term)}`);
            if (!resp.ok) throw new Error("Erro na requisição");

            const json = await resp.json();

            if (!json || json.length === 0) {
                searchResults.innerHTML = "<em>Nenhuma notícia encontrada.</em>";
                return;
            }

            searchResults.innerHTML = `
        <h2>Notícias para: ${term}</h2>
        <ul>${json.map(article => `
          <li>
            <a href="${article.url}" target="_blank">${article.title}</a><br>
            <small>${article.description || ''}</small>
          </li>
        `).join('')}</ul>
      `;
        } catch (err) {
            console.error("Erro na busca manual:", err);
            searchResults.innerHTML = "<em>Erro ao buscar notícias. Tente novamente.</em>";
        }
    });
});
