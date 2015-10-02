'use strict';

/* jshint unused:false */

function getImdbMovieInfo(imdbId) {
	var defer = $.Deferred();

	chrome.runtime.sendMessage({
		method: 'getMovieInfo',
		imdbId: imdbId
	}, function (movieInfo) {
		if (movieInfo.error) {
			defer.reject(movieInfo.error);
		} else {
			defer.resolve(movieInfo);
		}
	});
	return defer;
}
