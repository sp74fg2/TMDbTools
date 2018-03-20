'use strict';

let query = '';
function executeNetworkSearch() {
	if (query !== $('#input').val().trim()) {
		query = $('#input').val().trim();
		$('#results').empty();
		let url = 'https://www.themoviedb.org/search/remote/tv_network?take=20&skip=0';
		url = url + '&page=1&pageSize=20&filter[filters][0][value]=';
		url = url + $('#input').val();
		url = url + '&filter[filters][0][operator]=contains&filter[filters][0][field]=name';
		url = url + '&filter[filters][0][ignoreCase]=false&filter[logic]=and&_=';
		url = url + Math.round(new Date().getTime());
		$.ajax(url)
			.done(function (data) {
				data.results.forEach(function (network) {
					//console.log(network.id + ' ' + network.name);
					if (network.id !== 0) {
						let anchor = $('<a target="_blank" style="display:block;margin:10px;"><span/><span/><img></a>');
						let networkName = network.name;
						if (network.origin_country) {
							networkName += ' (' + network.origin_country + ')';
						}
						anchor.attr('href', 'https://themoviedb.org/network/' + network.id);
						anchor.find('span').first().text(networkName).css('margin-right','10px');
						anchor.find('span').last().text(network.id).css('color', 'grey').css('margin-right','10px');
						if (network.logo_path) {
							anchor.find('img').attr('src', 'https://image.tmdb.org/t/p/h15' + network.logo_path);
						}
						anchor.appendTo('#results');
					}
				});
			})
			.fail(function (data) {
				$('#results').append('Lookup failed! <br/><br/>' + data);
			});
	}
};

document.title = 'Network Search';
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
