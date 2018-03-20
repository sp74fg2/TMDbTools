'use strict';

// TV search icons
chrome.storage.local.get({ addTvSearchIcons: true }, function (items) {
	if (items.addTvSearchIcons) {
		let seriesNameLink, seriesName, seriesNameEncoded, tvdbLinkText, traktLinkText;
		$.fn.ignore = function (sel) {
			return this.clone().find(sel || '>*').remove().end();
		};
		seriesNameLink = $('.header .title h2, .header .title h3').first();
		seriesName = seriesNameLink.ignore('span').text().trim();
		if (location.href.includes('/season/')) {
			seriesName = $('title').text().substring(0, $('title').text().indexOf(':'));
		}
		seriesNameEncoded = encodeURIComponent(seriesName);

		// Add TVDb & Trakt search icon to tv series pages
		tvdbLinkText = 'http://thetvdb.com/?tab=listseries&function=Search&string=' + seriesNameEncoded;
		traktLinkText = 'https://trakt.tv/search?query=' + seriesNameEncoded;
		/*jshint -W101 */
		seriesNameLink.after('<a href="' + tvdbLinkText + '" style="margin:5px;" target="_blank"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAb1BMVEUAHS0CHy0PKzAQKzoRLTAbNzIgOUcgOzMwSFU5Uk1AVmJCXDpEXztJYztQZG9Qaj1gcnxpgkJwgIlyi0R8lEaAjpaEm0eGnkiIoEiQnaSgq7Gtw0+vxlDAx8vF21TI3VXP5FbQ1djg5OXw8vP///+dWsA7AAAAiElEQVQYGQXBjSKEQAAGwCGSRXdSaN3Sz/f+z2gGAL4vAPA4z3+3+QMAL7/b9vOEvi3A17a9QUkDd7fX90/0U/ZSlP7+gefCmiQZs8MRSs2xLI709NlR0rBmYsqEkoYhjZYeJQ2OdF0OKGlQc71mhZIGY2rNAF12cJ7nAZyptaMmK7Ak6RiTAf/5lAyvMHqm6QAAAABJRU5ErkJggg=="></a>');
		seriesNameLink.after('<a href="' + traktLinkText + '" style="margin:5px;" target="_blank"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB50lEQVQ4EQXB3WtOcQAA4Od3zvtOQ0knE03N2fkDlhaSWqvJhUj5SERKLiTlygpXyoXvYtOQkrlYKR8XZNdqF8NcLB8Xr5dIws7KR9nG+/48TwAAKPOiD3vQwAwSzMNi3MvqtTsAEACgzIv7SDGG3whoESwSTaFHkIm2Z/XaFASAMi8m8AzD2I/daBXAZbMuoUOLXsFB0ZqsXvuUQJkXd/EKQ3iKA2gVwKBZQ6J1ohGzvorOCR5CUubFBrThDCYABDBszlXRSsGk4DMGzXmGt2VeHE9wGA9wDABEt805q6ld8AEnsUpAdMs/o4LeBL8wg70AgtuaTmnoFgScwk4AdIoWYDzBT0QA3BCdl+rS4rXoCLYBAIiWir4kgFY0cBZX0C76JdWh6rpoEgAAARIsxBI8xwjaEdEh+q3ij6p9opcAgG+CtgSLkeIR1uINjuIaujT9ULFM1X7Rc8BHiZ9YneAm+jCIHxjARsBpdGuallqu6pCoLjgp1YMXSVavPcR39OMJNgEABtAtIpVnn2udqlYI1mfvaicSwBbswAX04j4AAgZA9LjsLE5I9Iu2QgAo86KKUUxhTAhRo9EiRtK0gvnoQic2ZfXaewgAAGVe7MJmMU6pVKYlSdPfv4vE2C6E8axeuwgA/wEN4KQIl9R8xAAAAABJRU5ErkJggg=="></a>');
		/*jshint +W101 */
	}
});
