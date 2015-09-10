'use strict';


function duplicateCheck(movieTitle) {
  var defer = $.Deferred(),
    url = 'https://www.themoviedb.org/movie/duplicate_check';

  url += '?query=' + encodeURIComponent(movieTitle);
  //url += '&imdb_id=' + ($('input:text.newImdb_id').val() || '').trim();
  url += '&imdb_id=tt0076759';
  url += '&_=' + Math.round(new Date().getTime()).toString();

  $.ajax({
    url: url,
    headers: {
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Accept-Language': 'en-US,en;q=0.8'
    }
  }).done(function(s) {
    defer.resolve(s);
  }).fail(function(jqXHR, textStatus, errorThrown) {
    defer.reject(textStatus + ': ' + errorThrown);
  });
  return defer;
}
