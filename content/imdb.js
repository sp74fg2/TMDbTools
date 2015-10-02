'use strict';

var id = location.href.split('/')[4],
	isNotTvSeries = $('#overview-top .infobar').text().indexOf('TV Series') === -1,
	tmdbSvg = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0" y="0" viewBox="0 0 20 20" xml:space="preserve" width="20" height="20"><path fill="#FFFFFF" d="M17.6 17.3c-0.9 0-2.4-1-3.1-1.4 -1.3 0.3-2.7 0.4-4.5 0.4 -6.9 0-10-2.1-10-6.8s3.1-6.8 10-6.8 10 2.1 10 6.8c0 1.2-0.1 2.8-1.2 4.1 0.5 2.9-0.2 3.3-0.4 3.5C18.1 17.3 17.9 17.3 17.6 17.3L17.6 17.3zM10 7.8c-3.6 0-3.6 1-3.6 1.7 0 0.7 0 1.7 3.6 1.7 3.6 0 3.6-1 3.6-1.7C13.6 8.8 13.6 7.8 10 7.8z"></path><path fill="#748561" d="M19 9.5L19 9.5c0-3-1-5.8-9-5.8 -8 0-9 2.9-9 5.8l0 0c0 3 1 5.8 9 5.8 2 0 3.5-0.2 4.7-0.5 0.6 0.4 2.7 1.7 3.1 1.5 0.4-0.3 0.1-2.3-0.1-3C18.8 12.3 19 10.9 19 9.5zM5.4 9.5c0-1.4 0.5-2.7 4.6-2.7 4.1 0 4.6 1.3 4.6 2.7 0 1.4-0.5 2.7-4.6 2.7C5.9 12.2 5.4 10.8 5.4 9.5z"></path></svg>';

if (id && isNotTvSeries) {
	$('<a>', {
		href: 'http://themoviedb.org/movie/new?imdbId=' + id,
		id: 'tmdbLink',
		Style: 'margin-left:10px',
		html: tmdbSvg
	}).insertAfter('h1.header span.nobr');
}
