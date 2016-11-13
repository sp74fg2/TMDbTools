'use strict';

var genreLookup;

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		switch (request.method) {
			case 'getImdbCredits':
				getImdbCredits(request, sender, sendResponse);
				break;
			case 'getMovieInfo':
				getMovieInfo(request, sender, sendResponse);
				break;
		}
		// indicate we will send a response asynchronously
		//    (keep the message channel open until sendResponse is called)
		return true;
	});

function getImdbCredits(request, sender, sendResponse) {
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
				// replace image 'src' attributes with 'data-src' so jQuery can load & parse
				imdbHtml = replaceSrc(imdbHtml);
				$(imdbHtml).find('table.cast_list tr.even, table.cast_list tr.odd').each(function() {
					var castLink, idMatch, memberImdbId, castImg, imageUrl, character, castMember;
					castLink = $(this).find('td[itemprop=actor] a');
					if (castLink[0]) {
						idMatch = /name\/(nm\d+)/.exec(castLink.attr('href'));
						if (idMatch) {
							memberImdbId = idMatch[1];
						}
					}
					castImg = $(this).find('td.primary_photo img');
					if (castImg[0]) {
						imageUrl = castImg.attr('loadlate') || castImg.attr('data-src') ||
							'http://ia.media-imdb.com/images/G/01/imdb/images/nopicture/32x44/name-2138558783._CB379389446_.png';
						console.log(imageUrl);
					}
					character = $(this).find('td.character').text()
						.replace(/\/ .../, '')
						.replace(/\(\d+ episodes, \d+\)/, '').trim()
						.replace(/\s\s+/, ' ');
					// replace /\/ .../ & /\(\d+ episodes, \d+\)/ are for miniseries
					//   entered as movies
					castMember = {
						name: $(this).find('td[itemprop=actor]').text().trim(),
						imdbId: memberImdbId,
						character: character,
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
}

function getMovieInfo(request, sender, sendResponse) {
	$.ajax({
		url: 'http://www.imdb.com/title/' + request.imdbId
	})
	.done(function(imdbHtml) {
		//console.log(imdbHtml);
		var imdbMovieInfo = {},
			$imdbHtml = $(replaceSrc(imdbHtml)),
			taglinesHeader, originalTitleDiv;

		imdbMovieInfo.imdbId = request.imdbId;
		// TODO: check for original title, possibly add alternative titles
		// movie with original title: http://www.imdb.com/title/tt0076101
		originalTitleDiv = $imdbHtml.find('.originalTitle');
		if (originalTitleDiv.length > 0) {
			// get the text node contents and remove surrounding quotes
			imdbMovieInfo.title = originalTitleDiv.contents().filter(function() {
				return this.nodeType == 3;
			}).text().trim().replace(/^"(.+(?="$))"$/, '$1');
		} else {
			//imdbMovieInfo.title = $imdbHtml.find('h1.header [itemprop="name"]').text();
			imdbMovieInfo.title = $imdbHtml.find('.title_wrapper h1[itemprop="name"]').contents().filter(function() {
				return this.nodeType == 3;
			}).text().trim() ||
				$imdbHtml.find('h1.header [itemprop="name"]').text().trim();
		}

		if ($('#overview-top .infobar').text().indexOf('TV Mini-Series') > -1) {
			imdbMovieInfo.isMiniseries = true;
		}

		imdbMovieInfo.overview = $imdbHtml.find('div[itemprop=description] p')
			.contents().filter(function() {
				return this.nodeType == 3;
			}).text().trim();

		imdbMovieInfo.genres = [];
		$imdbHtml.find('div[itemprop=genre] a').each(function() {
			var imdbGenre = $(this).text().trim();
			//imdbMovieInfo.genres.push($(this).text().trim());
			imdbMovieInfo.genres.push(genreLookup[imdbGenre] || imdbGenre);
		});
		imdbMovieInfo.isAdult = imdbMovieInfo.genres.indexOf('Adult') > -1;

		taglinesHeader = $imdbHtml.find('div.txt-block h4:contains(Taglines)')[0];
		if (taglinesHeader) {
			imdbMovieInfo.tagline = taglinesHeader.nextSibling.nodeValue.trim();
		}

		imdbMovieInfo.runtime = $imdbHtml.find('.title_wrapper time[itemprop=duration]').text().replace('min', '').trim();

		sendResponse(imdbMovieInfo);
	}).fail(function(jqXHR, textStatus, errorThrown) {
		sendResponse({
			error: 'Loading IMDb page. ' + textStatus + ': ' + errorThrown
		});
	});
}

// replace image 'src' attributes with 'data-src' so jQuery can load & parse
function replaceSrc(html) {
	return html.replace(/(<img[^>]*)(\s?src)([^>]*>)/g, '$1data-src$3');
}

genreLookup = {
	'Sci-Fi': 'Science Fiction'
};

// Context Menu

var contextMenuClickHandler = function(info) {
	if (info.selectionText) {
		var tmdSearchUrl = 'https://www.themoviedb.org/search?query=' + encodeURIComponent(info.selectionText);
		chrome.tabs.create({
			'url': tmdSearchUrl
		});
	}
};

chrome.contextMenus.create({
	'title': 'TMDb search',
	'contexts': ['selection', 'editable'],
	'onclick': contextMenuClickHandler
});
