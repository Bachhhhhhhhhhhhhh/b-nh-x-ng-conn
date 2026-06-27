function renderLegalArticles(articles) {
  if (!articles?.length) return '';
  return `
    <div class="legal-articles">
      ${articles
        .map(
          (a) => `
        <article class="legal-article-card">
          <div class="legal-article-head">
            <span class="legal-article-code">${a.code}</span>
            <span class="legal-article-ref">${a.article}${a.clause ? ` · ${a.clause}` : ''}</span>
          </div>
          <h5 class="legal-article-name">${a.name}</h5>
          <p class="legal-article-law text-xs text-slate-500">${a.law}</p>
          <p class="legal-article-text">${a.text}</p>
          <p class="legal-article-penalty"><strong>Hình phạt:</strong> ${a.penalty}</p>
          ${a.applies ? `<p class="legal-article-applies"><strong>Áp dụng clip:</strong> ${a.applies}</p>` : ''}
        </article>
      `
        )
        .join('')}
    </div>
  `;
}

function formatLegalForExport(articles) {
  if (!articles?.length) return '';
  return articles
    .map(
      (a) =>
        `${a.article}${a.clause ? ` ${a.clause}` : ''} — ${a.name} (${a.code}): ${a.penalty}`
    )
    .join(' | ');
}