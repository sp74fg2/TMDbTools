'use strict';

/* exported lookupIMDbId, duplicateCheck, newMovie, addMovieGenres */

var apiKey = '79550a480ebeefe9f8cf1895264c7dc3',
	urlbase = '//api.themoviedb.org/3/';

function performAjax(url, headers, method, data) {
	var defer = $.Deferred();

	$.ajax({
		url: url,
		headers: headers,
		method: method,
		data: data
	}).done(function (s) {
		defer.resolve(s);
	}).fail(function (jqXHR, textStatus, errorThrown) {
		defer.reject(textStatus + ': ' + errorThrown);
	});
	return defer;
}

function apiUrl(urlpath, params) {
	var url = urlbase + urlpath + '?';
	params = params || {};
	params.api_key = apiKey;
	url += $.param(params);
	return url;
}

function lookupIMDbId(imdbId) {
	return performAjax(apiUrl('find/' + imdbId, { 'external_source': 'imdb_id' }));
}

function duplicateCheck(movieTitle, imdbId) {
	var headers = {
		'Accept': 'application/json, text/javascript, */*; q=0.01',
		'Accept-Language': 'en-US,en;q=0.8'
	},
	url = '//www.themoviedb.org/movie/duplicate_check';
	url += '?query=' + encodeURIComponent(movieTitle);
	url += '&imdb_id=' + imdbId;
	url += '&_=' + Math.round(new Date().getTime()).toString();
	return performAjax(url, headers);
}

function newMovie(formData) {
	var headers = {
		'Accept': 'application/json, text/javascript, */*; q=0.01',
		'Accept-Language': 'en-US,en;q=0.8'
	},
		url = 'https://www.themoviedb.org/movie/new';
	return performAjax(url, headers, 'POST', formData);
}

// 1 day = 86400000 milliseconds, getTime return milliseconds
function getMovieGenres() {
	var defer = $.Deferred();
	if (!(localStorage.getItem('movieGenresRetrieved') &&
		(new Date().getTime() - localStorage.getItem('movieGenresRetrieved') < 86400000))) {
		$.ajax({
			url: 'https://www.themoviedb.org/search/remote/genre?media_type=movie&filter%5Blogic%5D=and&filter%5Bfilters%5D%5B0%5D%5Bvalue%5D=actions&filter%5Bfilters%5D%5B0%5D%5Bfield%5D=name&filter%5Bfilters%5D%5B0%5D%5Boperator%5D=startswith&filter%5Bfilters%5D%5B0%5D%5BignoreCase%5D=true&_=' + Math.round(new Date().getTime()).toString()
		}).done(function (movieGenreData) {
			localStorage.setItem('movieGenres', JSON.stringify(movieGenreData));
			localStorage.setItem('movieGenresRetrieved', Math.round(new Date().getTime()).toString());
			defer.resolve(movieGenreData);
		}).fail(function (jqXHR, textStatus, errorThrown) {
			defer.reject(textStatus + ': ' + errorThrown);
		});
	} else {
		defer.resolve(JSON.parse(localStorage.movieGenres));
	}
	return defer;
}

function addMovieGenres(movieId, genres) {
	var defer = $.Deferred(),
		formData = '',
		genresNotAdded = [];

	getMovieGenres().done(function (tmdbMovieGenres) {

		genres = genres.split(', ');

		// generate formData string
		genres.forEach(function (element) {
			var tmdbMovieGenre;
			tmdbMovieGenre = tmdbMovieGenres.filter(function (genre) { return genre.name === element.toString(); });
			if (tmdbMovieGenre[0]) {
				if (formData) { formData += '&'; }
				formData += 'genres%5B%5D=' + tmdbMovieGenre[0].bson_id;
			} else {
				genresNotAdded.push(element.toString());
			}
		});

		if (formData.length > 0) {
			$.ajax({
				url: '//www.themoviedb.org/movie/' + movieId + '/remote/genres_and_keywords?translate=false',
				method: 'POST',
				data: formData
			}).done(function () {
				if (genresNotAdded.length > 0) {
					defer.resolve('not added: ' + genresNotAdded.join(', '));
				} else {
					defer.resolve();
				}
			}).fail(function (jqXHR, textStatus, errorThrown) {
				defer.reject('Error while adding genres. ' + textStatus + ': ' + errorThrown);
			});
		} else {
			// no genres to add
			if (genresNotAdded.length > 0) {
				defer.resolve('not added: ' + genresNotAdded.join(', '));
			} else {
				defer.resolve();
			}
		}

	}).fail(function (errorText) {
		defer.reject('Error while getting TMDb genres. ' + errorText);
	});
	return defer;
}
