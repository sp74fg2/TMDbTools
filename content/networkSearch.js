'use strict';

let query = '';
function executeNetworkSearch() {
	if (query !== $('#input').val().trim()) {
		query = $('#input').val().trim();
		$('#results').empty();
		let url = 'https://www.themoviedb.org/search/remote/tv_network?take=20&skip=0';
		url = url + '&page=1&pageSize=20&filter[filters][0][value]=';
		url = url + $('#input').val();
		url = url + '&filter[filters][0][operator]=startswith&filter[filters][0][field]=name';
		url = url + '&filter[filters][0][ignoreCase]=false&filter[logic]=and&_=';
		url = url + Math.round(new Date().getTime());
		$.ajax(url)
			.done(function (data) {
				data.forEach(function (item) {
					console.log(item.id + ' ' + item.name);
					if (item.id !== 0) {
						$('<a/>')
							.text(item.name + ' (' + item.id + ')')
							.css('display', 'block')
							.css('margin', '10px')
							.attr('href', 'https://themoviedb.org/network/' + item.id)
							.attr('target', '_blank')
							.appendTo('#results');
					}
				});
			})
			.fail(function (data) {
				$('#results').append('Lookup failed! <br/><br/>' + data);
			});
	}
};

document.title = 'TMDb Network Search';
$('div.media h2').text('Network Search');
$('div.media p').remove();
let thread = null;
$('<input/>').attr({
	id: 'input',
	type: 'text',
	class: 'k-input',
	style: 'line-height: 2.214em; text-indent: .8em; width: 50%;'
})
	.appendTo('div.media')
	.keypress(function (e) {
		if (e.keyCode === 13) {
			executeNetworkSearch();
		}
	})
	.keyup(function () {
		thread = setTimeout(function () { executeNetworkSearch(); }, 500);
	});
$('<div id="results" />')
	.css('margin', '20px')
	.css('min-height', '600px')
	.appendTo('div.media');
