 /*jshint esversion: 6 */
window.addEventListener('load', function() {
  var listener = new window.keypress.Listener();

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
    var content = historyItems.map(function(item) {
         return {title: item.title, url: item.url};
       }).filter(function(x) { return !!x;});
    $.fn.search.settings.templates.standard = function(response) {
        var c = 0;
        return response.results.map(function(result) {
          c += 1;
          var num = JSON.parse(JSON.stringify(c));
          listener.unregister_combo(`alt ${num}`);
          listener.simple_combo(`alt ${num}`, function() {
            console.log($(`#result-${num}`));
            $(`#result-${num}`).click();
          });
          var score = Math.floor(result.totalScore * 100);
          var color = 'red';
          if (score > 70) color = 'green';
          else if (score > 60) color = 'olive';
          else if (score > 50) color = 'yellow';
          else if (score > 40) color = 'orange';
          return `<a id="result-${num}" class="result" href="' + result.url + '">
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
          var options = {
            pre: '',
            post: '',
            extract: function(el) { return el.title + '|||' + el.url;}
          };
          var results = fuzzy.filter(searchTerm, source, options).map(function(x) {
            x.original.originalScore = x.score;
            x.original.totalScore = sigmoid(x.score, 0.05) * sigmoid(x.original.visitCount, 0.08) * sigmoid(x.original.typedCount, 0.1);
            x.original.title = x.string.split('|||')[0];
            return x.original;
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
