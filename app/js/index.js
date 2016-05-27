 /*jshint esversion: 6 */
window.addEventListener('load', function() {
  var listener = new window.keypress.Listener();
  var debug = false;
  get('debug', function(enabled) {
    debug = enabled;
  });
  Array.prototype.sortBy = function(p) {
    return this.slice(0).sort(function(a,b) {
      return (a[p] < b[p]) ? 1 : (a[p] > b[p]) ? -1 : 0;
    });
  };

  var sigmoid = function(x, degree) {
    return 1/(1 + Math.pow(Math.E, -degree * x));
  };

  chrome.history.search({
    text: '',
    maxResults: 99000,
    startTime: 0
  }, function(historyItems) {
    $.fn.search.settings.templates.standard = function(response) {
        var c = 0;
        return response.results.map(function(result) {
          c += 1;
          var num = JSON.parse(JSON.stringify(c));
          listener.unregister_combo(`alt ${num}`);
          listener.simple_combo(`alt ${num}`, function() {
            $(`#result-${num}`).click();
          });
          var score = Math.floor(result.totalScore * 100);
          var debugScores = debug? `visitScore: ${Math.floor(result.visitScore * 100)} | visitCount: ${result.visitCount} | termScore: ${Math.floor(result.termScore * 100)}`: '';
          var active = num === 1? 'active': '';
          var color = 'red';
          if (score > 70) color = 'green';
          else if (score > 60) color = 'olive';
          else if (score > 50) color = 'yellow';
          else if (score > 40) color = 'orange';
          return `<a id="result-${num}" class="result ${active}" href="' + result.url + '">
          <div class="ui grid">
            <div class="fourteen wide column">
              <div class="ui feed">
                <div class="event">
                  <div class="content">
                    <div class="summary">
                      <div class="label inline">
                        <img style="height: 16px; margin-bottom: 7px;" src="chrome://favicon/${result.url}">
                      </div>
                      <div class="title inline truncate">
                        ${result.title}
                        <div>${debugScores}</div>
                      </div>
                      <div class="extra text url truncate">
                        ${num} | ${result.url.replace(/%20/g, " ")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="center aligned two wide column">
              <div class="ui big ${color} circular label">${score}</div>
            </div>
          </div>
         </a>`;
        });
      };

    $('.ui.search')
      .search({
        source: historyItems,
        searchFields: [
          'title',
          'url'
        ],
        searchFullText: true,
        overrideSearch: function(searchTerm, source, searchFields) {
          source.map(function(x) {
            x.searchField = x.url;
          });
          var results = fuzzaldrin.filter(source, searchTerm, {key:'searchField', maxResults:700}).map(function(x) {
            x.visitScore = sigmoid(x.visitCount, 0.08);
            x.termScore = sigmoid(fuzzaldrin.score(x.searchField, searchTerm), 0.0001);
            x.totalScore = x.termScore * x.visitScore;
            return x;
          });
          return results.sortBy('totalScore');
        },
        onSelect: function(result){
          chrome.tabs.create({
            selected: true,
            url: result.url
          });
        }
      });
  });
});
