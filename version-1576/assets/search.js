document.addEventListener("DOMContentLoaded", function () {
  var movies = Array.isArray(window.SITE_MOVIES) ? window.SITE_MOVIES : [];
  var results = document.getElementById("search-results");
  var empty = document.getElementById("search-empty");
  var input = document.getElementById("search-input");
  var summary = document.getElementById("search-summary");
  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";

  if (input) {
    input.value = query;
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function card(movie) {
    var searchText = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags].join(" ");

    return [
      '<article class="movie-card" data-search="' + escapeHtml(searchText.toLowerCase()) + '">',
      '  <a href="' + escapeHtml(movie.url) + '" class="card-link" aria-label="查看 ' + escapeHtml(movie.title) + '">',
      '    <figure class="poster">',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.remove()">',
      '      <span class="play-corner">▶</span>',
      '    </figure>',
      '    <div class="card-body">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p class="card-line">' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="card-meta">',
      '        <span>' + escapeHtml(movie.year) + '</span>',
      '        <span>' + escapeHtml(movie.region) + '</span>',
      '        <span>' + escapeHtml(movie.genre.split(/[，,、/／\s]+/)[0] || movie.type) + '</span>',
      '      </div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join("");
  }

  function render() {
    var keyword = normalize(query);
    var matched = movies;

    if (keyword) {
      matched = movies.filter(function (movie) {
        var haystack = normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" "));
        return haystack.indexOf(keyword) !== -1;
      });
    } else {
      matched = movies.slice(0, 60);
    }

    if (summary) {
      if (keyword) {
        summary.textContent = '搜索 “' + query + '” 找到 ' + matched.length + ' 个结果。';
      } else {
        summary.textContent = '默认展示前 60 部内容，可输入关键词缩小范围。';
      }
    }

    if (results) {
      results.innerHTML = matched.slice(0, 240).map(card).join("");
    }

    if (empty) {
      empty.hidden = matched.length !== 0;
    }
  }

  render();
});
