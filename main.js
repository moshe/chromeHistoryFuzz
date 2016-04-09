window.addEventListener('load', function() {
    chrome.history.search({
        text: '',
        maxResults: 1000
    }, function(historyItems) {

    var content = historyItems.map(function(item) {
             return {title: item.title, url: item.url};
         }).filter(function(x) { return !!x;});

        $.fn.search.settings.templates = {
            escape: function(string) {
                // returns escaped string for injected results
            },
            message: function(message, type) {
                // returns html for message with given message and type
            },
            category: function(response) {
                // returns results html for category results
            },
            standard: function(response) {
                // returns results html for standard results
                return response.results.map(function(result) {
                    return '<a class="result" href="' +
                        result.url +
                        '"><div class="content"><div class="title">' +
                        result.title +
                        '</div><div class="urlResult" style="color:#989898;">' +
                        result.url +
                        '</div></div></a>';
                });
            }
        };

        $('.ui.search')
            .search({
                source: content,
                searchFields: [
                    'title',
                    'url'
                ],
                searchFullText: true,
                onSelect: function(result){
                    chrome.tabs.create({
                        selected: true,
                        url: result.url
                    });
                }
            });
    });
});
