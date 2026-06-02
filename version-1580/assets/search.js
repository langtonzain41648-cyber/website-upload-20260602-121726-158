(function () {
  function escapeText(value) {
    return String(value || '').replace(/[&<>"]/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch];
    });
  }

  function render() {
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim().toLowerCase();
    var input = document.querySelector('.search-page-input');
    var target = document.querySelector('.search-results');
    if (input) {
      input.value = q;
    }
    if (!target) {
      return;
    }
    if (!q) {
      target.innerHTML = '<div class="empty-state">输入片名、题材、地区或年份，即可浏览相关影片。</div>';
      return;
    }
    var data = Array.isArray(window.SEARCH_MOVIES) ? window.SEARCH_MOVIES : [];
    var matches = data.filter(function (item) {
      return [item.title, item.year, item.region, item.type, item.genre, item.category, item.oneLine].join(' ').toLowerCase().indexOf(q) !== -1;
    }).slice(0, 120);
    if (!matches.length) {
      target.innerHTML = '<div class="empty-state">暂未找到匹配影片，可尝试更换关键词。</div>';
      return;
    }
    target.innerHTML = '<div class="grid cards">' + matches.map(function (item) {
      return '<article class="movie-card">'
        + '<a class="poster" href="' + escapeText(item.url) + '">'
        + '<img src="' + escapeText(item.cover) + '" alt="' + escapeText(item.title) + '" loading="lazy">'
        + '<span class="poster-badge">' + escapeText(item.year) + '</span>'
        + '</a>'
        + '<div class="card-body">'
        + '<div class="card-meta">' + escapeText(item.region) + ' · ' + escapeText(item.type) + ' · ' + escapeText(item.category) + '</div>'
        + '<h3><a href="' + escapeText(item.url) + '">' + escapeText(item.title) + '</a></h3>'
        + '<p>' + escapeText(item.oneLine) + '</p>'
        + '<div class="tag-row"><span>' + escapeText(item.genre) + '</span></div>'
        + '</div>'
        + '</article>';
    }).join('') + '</div>';
  }

  if (document.readyState !== 'loading') {
    render();
  } else {
    document.addEventListener('DOMContentLoaded', render);
  }
})();
