'use strict';

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch (request.method) {
      case 'getImdbCredits':
        var imdbId;
        $.ajax({
          url: 'https://www.themoviedb.org/movie/' + request.tmdbId + '/edit' + (request.queryLanguage ? '?language=' + request.queryLanguage : ''),
          type: 'GET',
          dataType: 'text'
        }).done(function(tmdbHtml) {
          imdbId = $(tmdbHtml).find('#imdb_id').val();
          if (imdbId) {
            $.ajax({
              url: 'http://www.imdb.com/title/' + imdbId + '/fullcredits'
            }).done(function(imdbHtml) {
              var credits = {
                cast: [],
                crew: []
              };
              //imdbHtml = imdbHtml.replace(/<img[^>]*>/g,'');
              // replace image src attributes with data-src so jQuery can load & parse
              imdbHtml = imdbHtml.replace(/(<img[^>]*)(\s?src)([^>]*>)/g, '$1data-src$3');
              $(imdbHtml).find('table.cast_list tr.even, table.cast_list tr.odd').each(function() {
                var castLink, idMatch, memberImdbId, castImg, imageUrl, castMember;
                castLink = $(this).find('td[itemprop=actor] a');
                if (castLink[0]) {
                  idMatch = /name\/(nm\d+)/.exec(castLink.attr('href'));
                  if (idMatch) {
                    memberImdbId = idMatch[1];
                  }
                }
                castImg = $(this).find('td.primary_photo img');
                if (castImg[0]) {
                  imageUrl = castImg.attr('loadlate') || castImg.attr('data-src');
                }
                // replace /\/ .../ & /\(\d+ episodes, \d+\)/ are for miniseries
                //   entered as movies
                castMember = {
                  name: $(this).find('td[itemprop=actor]').text().trim(),
                  imdbId: memberImdbId,
                  character: $(this).find('td.character').text()
                    .replace(/\/ .../, '')
                    .replace(/\(\d+ episodes, \d+\)/, '').trim()
                    .replace(/\s\s+/, ' '),
                  imageUrl: imageUrl
                };
                credits.cast.push(castMember);
              });
              sendResponse({
                credits: credits
              });
            });
          } else {
            sendResponse({
              error: 'No IMDb Id found. Enter IMDb Id in Primary Facts first.'
            });
          }
        });
        break;
      case 'getMovieInfo':
        $.ajax({
          url: 'http://www.imdb.com/title/' + request.imdbId + '/combined'

        });
        break;
    }
    // indicate we will send a response asynchronously
    //    (keep the message channel open until sendResponse is called)
    return true;
  });
