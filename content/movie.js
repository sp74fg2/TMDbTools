'use strict';

var inputGoHtml;

function duplicateCheck(movieTitle) {
	var defer = $.Deferred(),
		url = 'https://www.themoviedb.org/movie/duplicate_check';

	url += '?query=' + encodeURIComponent(movieTitle);
	url += '&imdb_id=' + $('input:text.newImdb_id').val().trim();
	//url += '&imdb_id=tt0076759';
	url += '&_=' + Math.round(new Date().getTime()).toString();

	$.ajax({
		url: url,
		headers: {
			'Accept': 'application/json, text/javascript, */*; q=0.01',
			'Accept-Language': 'en-US,en;q=0.8'
		}
	}).done(function (s) {
		defer.resolve(s);
	}).fail(function (jqXHR, textStatus, errorThrown) {
		defer.reject(textStatus + ': ' + errorThrown);
	});
	return defer;
}

// add IMDb Id input box and import button
inputGoHtml = ' <div class="importIMDb">';
inputGoHtml += '  <div>';
inputGoHtml += '    <span>Import with IMDb ID:</span>';
inputGoHtml += '    <input type="text" id="newImdb_id">';
inputGoHtml += '    <button>Import</button>';
inputGoHtml += '    <span class="msg"></span>';
inputGoHtml += '  </div>';
inputGoHtml += '</div>';

$('#new_movie_form').after(inputGoHtml);

$('a[href=#next]').click(function () {
	$('div.importIMDb').hide();
});

$('a[href=#previous]').click(function () {
	if ($('.steps ul li:first').attr('aria-selected') === 'true') {
		$('div.importIMDb').show();
	}
});

$('.importIMDb button').click(function () {
	var imdbId = $('#newImdb_id').val().trim();
	if (imdbidIsValid(imdbId)) {
		$('.importIMDb .msg').text('');
		console.log(imdbId);
		//duplicateCheck()
		//	.done(function (data) {
		//		if (data.success === true) {
		//			// no dupe found

		//		} else {
		//			// dupe found
		//			if (data.imdb_id_duplicate === true) {
		//				// a TMDb movie already exists with the IMDb id

		//			} else {
		//				// no TMDb movie exists with the IMDb id, but there are similar titles


		//			}
		//			//data.html_results
		//		}
		//	})
		//	.fail(function (errorMessage) {
		//		$('.importIMDb .msg').text(errorMessage);
		//	});
	} else {
		$('.importIMDb .msg').text('Invalid IMDb ID, should be in the format ttXXXXXXX');
		$('.importIMDb .msg').hide();
		$('.importIMDb .msg').show(100);
	}
});

function imdbidIsValid(imdbID) {
	return /^tt\d{4,}/.test(imdbID);
}