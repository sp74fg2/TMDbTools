'use strict';

/* globals lookupIMDbId, getImdbMovieInfo, duplicateCheck, newMovie, addMovieGenres */

var inputGoHtml,
	imdbIdQueryParam = (function() {
		var match = /[\\?&]imdbId=([^&#]*)/.exec(location.href);
		if (match) {
			return match[1];
		}
	}());

if (imdbIdQueryParam) {
	configureMovieImport(imdbIdQueryParam);
} else {
	// add IMDb Id input box and import button
	inputGoHtml = ' <div class="imdbInput">';
	inputGoHtml += '  <div>';
	inputGoHtml += '    <span>Import with IMDb ID:</span>';
	inputGoHtml += '    <input type="text" id="newImdb_id">';
	inputGoHtml += '    <button>Import</button>';
	inputGoHtml += '    <span class="msg"></span>';
	inputGoHtml += '  </div>';
	inputGoHtml += '</div>';

	$('#new_movie_form').after(inputGoHtml);

	$('a[href=#next]').click(function() {
		$('div.imdbInput').hide();
	});

	$('a[href=#previous]').click(function() {
		if ($('.steps ul li:first').attr('aria-selected') === 'true') {
			$('div.imdbInput').show();
		}
	});

	$('.imdbInput button').click(function() {
		var imdbId = $('#newImdb_id').val().trim();
		if (imdbidIsValid(imdbId)) {
			$('.imdbInput .msg').text('');
			configureMovieImport(imdbId);
			$('div.imdbInput').remove();
		} else {
			$('.imdbInput .msg').text('Invalid IMDb ID, should be in the format ttXXXXXXX');
			$('.imdbInput .msg').hide();
			$('.imdbInput .msg').show(100);
		}
	});
}

function configureMovieImport(imdbId) {
	addForm().done(function() {
		// check if imdbid is already entered in a movie
		lookupIMDbId(imdbId).done(function(lookupIMDbIdResponse) {
			//console.log('lookupIMDbId (TMDb): ');
			//console.log(lookupIMDbIdResponse);
			//console.log(JSON.stringify(lookupIMDbIdResponse));
			if (lookupIMDbIdResponse.movie_results && lookupIMDbIdResponse.movie_results.length > 0) {
				location.href = '//themoviedb.org/movie/' + lookupIMDbIdResponse.movie_results[0].id;
			}
				//else if (lookupIMDbIdResponse.tv_results && lookupIMDbIdResponse.tv_results.length > 0) {
				//	location.href = '//themoviedb.org/tv/' + lookupIMDbIdResponse.tv_results[0].id;
				//}
			else {
				getImdbMovieInfo(imdbId).done(function(movieInfo) {
					enterMovieInfo(movieInfo);
					//console.log('movieInfo (IMDb): ');
					//console.log(movieInfo);
					duplicateCheck(movieInfo.title, imdbId).done(function(dupeCheckResponse) {
						//console.log('dupeCheckResponse (TMDb): ');
						//console.log(dupeCheckResponse);
						if (dupeCheckResponse.success) {
							// no dupe(s) found, add new movie
							$('#duplicate_verified').prop('checked', true);
							showVerifyStep();
						} else {
							// possible dupe found
							$('#duplicate_verified').prop('checked', false);
							$('ul.found_duplicates').html(dupeCheckResponse.html_results);
							showDuplicateCheckStep();
							if (!dupeCheckResponse.imdb_id_duplicate) {
								// no TMDb movie exists with the IMDb id, but there are similar titles
								// console.log('From duplicateCheck - imdb_id_duplicate = false: ');
								//TODO: at this point, the IMDb Id wasn't found - add a button to the possible dupe list items
								// that when clicked will enter the IMDb Id in the corresponding movie
							} else {
								// a TMDb movie already exists with the IMDb id,
								// shouldn't happen since if found the page would've forwarded above

								// temporary - remove these controls so the movie can't be added since it would result in an error
								//    need to add a message stating that the IMDb Id is already in use.
								$('div.duplicate_check').remove();
								$('.duplicate_check button').remove();
							}
						}
					}).fail(function(duplicateCheckFailData) {
						alert('TMDbTools, error while performing duplicate check: ' + duplicateCheckFailData);
					});
				}).fail(function(movieInfoFailData) {
					alert('TMDbTools, error while getting IMDb information: ' + movieInfoFailData.error);
				});
			}
		}).fail(function(jqXHR, textStatus, errorThrown) {
			alert('TMDbTools, error while looking up the IMDb Id: ' + textStatus + ': ' + errorThrown);
		});
	}).fail(function(addFormFailData) {
		alert('TMDbTools, error while adding form: ' + addFormFailData);
	});
}

function imdbidIsValid(imdbID) {
	return /^tt\d{4,}/.test(imdbID);
}

function addForm() {
	var defer = $.Deferred(),
		htmlUrl = chrome.extension.getURL('content/movieNewForm.html'),
		pencilSvg, dialog, fieldName;
	$.ajax({
		url: htmlUrl
	}).done(function(html) {
		//console.log('html: ' + html);
		$('.actions').remove();
		// remove form
		$('#new_movie_wizard').unwrap();
		// empty old content
		$('#new_movie_wizard .content').first().empty();
		// add new content
		$('#new_movie_wizard .content').append(html);
		// duplicate checkbox event handler
		$('#duplicate_verified').change(function() {
			if (this.checked) {
				$('.duplicate_check button').show();
			} else {
				$('.duplicate_check button').hide();
			}
		});
		// duplicate check button event handler
		$('.duplicate_check button').click(function() {
			showVerifyStep();
		});
		// prevent new form from submitting
		$('#imdbImport').submit(function(event) {
			event.preventDefault();
		});
		// import button event handler
		$('#verifyAndImport button').click(function() {
			importMovie();
		});
		//setup edit (pencil) buttons & edit dialog
		dialog = $('#editDialogForm').dialog({
			autoOpen: false,
			height: 399,
			width: 500,
			modal: true,
			closeOnEscape: true,
			dialogClass: 'editDialog'
		});

		pencilSvg = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0" y="0" viewBox="0 0 32 32" enable-background="new 0 0 32 32" xml:space="preserve" width="16" height="16">' +
						'<polygon fill="#F6F6F6" points="23.1 0 23.6 0 32 8.4 32 8.7 8.8 32 0 32 0 23.3 "></polygon>' +
						'<path fill="#00539C" d="M29.4 8.5L26 12l-6-6 3.4-3.5L29.4 8.5zM18 8L4 22l6 6 14-14L18 8zM8 30l-6-6v6H8z"></path>' +
					'</svg>';
		$('a.editFormField').html(pencilSvg);
		$('a.editFormField').click(function() {
			fieldName = $(this).prev().attr('class');
			$('#editTextarea').val($('.' + fieldName).first().text());
			dialog.dialog('option', 'title', 'Edit ' + fieldName.replace('_', ' '));
			dialog.dialog('option', 'buttons', {
				'OK': function() {
					setFormValue(fieldName, $('#editTextarea').val());
					$(this).dialog('close');
				},
				Cancel: function() {
					$(this).dialog('close');
				}
			});
			dialog.dialog('open');
		});


		defer.resolve();
	}).fail(function(jqXHR, textStatus, errorThrown) {
		defer.reject(textStatus + ': ' + errorThrown);
	});
	return defer;
}

function enterMovieInfo(movieInfo) {
	//set input and span values
	setFormValue('original_title', movieInfo.title);
	setFormValue('overview', movieInfo.overview);
	setFormValue('imdb_id', movieInfo.imdbId);
	setFormValue('adult', movieInfo.isAdult);
	setFormValue('tagline', movieInfo.tagline);
	setFormValue('runtime', movieInfo.runtime);
	$('.genre').html(movieInfo.genres.join(', '));
	//console.log(movieInfo.genres);
}

function setFormValue(fieldName, value) {
	$('#' + fieldName).val(value);
	$('.' + fieldName).text(value);
}

function showVerifyStep() {
	$('#imdbImport section').hide();
	$('#verifyAndImport').show();
	$('ul[role=tablist] li').removeClass('current');
	$('#new_movie_wizard-t-5').parent('li').addClass('current');
}

function showDuplicateCheckStep() {
	$('#imdbImport section').hide();
	$('#duplicateCheck').show();
	$('ul[role=tablist] li').removeClass('current');
	$('#new_movie_wizard-t-3').parent('li').addClass('current');
}

function showResultsStep() {
	$('#imdbImport section').hide();
	$('#loading').show();
	$('#importResults').show();
	$('.steps ul li:not(:first)').remove();
	$('.steps ul li:first a').text('Importing').attr('href', '#');
	$('ul[role=tablist] li').addClass('current');
}

function importMovie() {
	//console.log('import button clicked: ');
	//console.log($('#imdbImport').serialize());
	showResultsStep();

	//TODO: Finish movie import
	newMovie($('#imdbImport').serialize()).done(function(newMovieData) {
		if (newMovieData.success === true) {
			var movieUrl = newMovieData.redirect,
				movieIdMatch = /movie\/(\d+)-/.exec(newMovieData.redirect),
				movieId;
			$('#importResults div.result.newMovie').addClass('complete');
			$('#importResults div.result.newMovie p').text('added successfully');
			$('#importResults a').attr('href', movieUrl);
			if (movieIdMatch) {
				movieId = movieIdMatch[1];
				addMovieGenres(movieId, $('.genre').text()).done(function(addMovieGenresData) {
					console.log('addMovieGenresData: ');
					console.log(addMovieGenresData);
					$('#importResults div.result.addGenres').addClass('complete');
					if (addMovieGenresData) {
						$('#importResults div.result.addGenres p').text('Some genres were added, ' + addMovieGenresData);
					} else {
						$('#importResults div.result.addGenres p').text('added successfully');
					}
				}).fail(function(addMovieGenresFailData) {
					$('#importResults div.result.addGenres').addClass('error');
					$('#importResults div.result.addGenres p').text(addMovieGenresFailData);
				}).always(function() {
					$('#importResults a').show();
					$('#loading').hide();
				});
			} else {
				$('#importResults div.result.newMovie').addClass('error');
				$('#importResults div.result.addGenres p').text('not added, unable to find new movie Id!');
				$('#loading').hide();
			}
		} else {
			if (newMovieData.failure === true) {
				$('#importResults div.result.newMovie p').replaceWith(newMovieData.message);
			} else {
				$('#importResults div.result.newMovie p').text(JSON.stringify(newMovieData));
			}
			$('#importResults div.result.newMovie').addClass('error');
			$('#loading').hide();
		}
	}).fail(function(newMovieFailData) {
		$('#importResults div.result.newMovie').addClass('error');
		$('#importResults div.result.newMovie p').text(newMovieFailData);
		$('#loading').hide();
	});
}
