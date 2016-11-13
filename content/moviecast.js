'use strict';

/*globals accent_fold, getImdbCredits */

var tmdbMovieId = (function() {
	var regMatch = /themoviedb\.org\/movie\/(\d+)/.exec(location.href);
	if (regMatch) {
		return regMatch[1];
	}
	return null;
}()),
	movieName = $('h1').text(),
	existingCastWorking = [],
	existingCast = [],
	imdbCastCredits = [],
	castUrl = location.origin + location.pathname.replace('/edit', '') + '/remote/cast?translate=false',
	queryLanguage = $('#edit_translation_selector').val(),
	resultsItemTemplate,
	contentShellHtml,
	noImagePortraitSvg = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0" y="0" viewBox="0 0 300 450" xml:space="preserve" style="width:45px;float:left;"><rect width="300" height="450" style="fill:#DBDBDB;"/><path  style="fill:#B5B5B5;" d="M128.3 202.3c0 7-5.7 12.7-12.7 12.7 -7 0-12.7-5.7-12.7-12.7s5.7-12.7 12.7-12.7C122.7 189.7 128.3 195.3 128.3 202.3zM220 171.5v106.8c-2 2-2.8 2.8-4.8 4.8h-130c-2-2-3.3-2.8-5.3-4.8V171.5c2-2 3.3-3.5 5.3-4.5h130C217.2 168 218 169.5 220 171.5zM92 179v86.6l35.6-23.5c5.1 1.6 31.2 17.9 33.1 15.9 3.3-3.5-15.8-22.3-15.8-22.3s24.5-27.8 32-27.8c7.2 0 18.8 13.9 31.1 26.2V179H92z"/></svg>';

contentShellHtml = ' <div id="accordion">';
contentShellHtml += '  <h3>Matching credits with different character names</h3><div id="differences"></div>';
contentShellHtml += '  <h3>Matches (TMDb & IMDb match exactly)</h3>            <div id="matches"></div>';
contentShellHtml += '  <h3>TMDb credits without matching IMDb credit</h3>      <div id="tmdbExtras"></div>';
contentShellHtml += '  <h3>To Add (IMDb has a credit but TMDb doesn\'t)</h3>   <div id="additions"></div>';
contentShellHtml += '</div>';

function compareCast() {
	if (tmdbMovieId) {
		blockUI();

		getImdbCredits(tmdbMovieId, queryLanguage)
			.done(function(response) {
				if (response.credits.cast.length > 0) {
					imdbCastCredits = response.credits.cast;
					getTMDbCast()
						.done(function(data) {
							existingCast = data;
							existingCastWorking = data.slice(0);
							$('#main section.content').empty().append(contentShellHtml);
							$(imdbCastCredits).each(function() {
								parseImdbCast(this);
							});
							addTmdbExtras();
							configureElements();
						})
						.fail(function(errorThrown) {
							alert('Error getting TMDb existing cast.  The error returned was: ' + errorThrown);
						});
				} else {
					alert('No cast found on IMDb');
				}
			})
			.fail(function(errorResponse) {
				alert(errorResponse.error);
			})
			.always(function() {
				unblockUI();
			});

	} else {
		alert('Uable to get Movie Id');
	}
}

function getTMDbCast() {
	var defer = $.Deferred();
	$.ajax({
		url: castUrl,
		headers: {
			'Accept': 'application/json, text/javascript, */*; q=0.01',
			'Accept-Language': 'en-US,en;q=0.8'
		}
	}).done(function(s) {
		defer.resolve(s);
	}).fail(function(jqXHR, textStatus, errorThrown) {
		defer.reject(errorThrown);
	});
	return defer;
}

function parseImdbCast(imdbCastCredit) {
	var tmdbExistingCredit = $(existingCastWorking).filter(function(index, credit) {
		return accent_fold(credit.name) === accent_fold(imdbCastCredit.name);
	})[0],
	  imdbCreditedAsMatch = /(\(as\s+(.+)\))/.exec(imdbCastCredit.character);

	imdbCastCredit.character = imdbCastCredit.character.replace(/\s\s+/g, ' ');
	if (imdbCreditedAsMatch) {
		//remove "(as XXXXX)" from character name
		imdbCastCredit.character = imdbCastCredit.character.replace(imdbCreditedAsMatch[1], '').trim();
		imdbCastCredit.creditedAs = imdbCreditedAsMatch[2].replace(/\s\s+/g, ' ').trim();
	}

	if (tmdbExistingCredit) {
		if (tmdbExistingCredit.character === imdbCastCredit.character) {
			// exact match
			addExactMatchCast(tmdbExistingCredit, imdbCastCredit);
		} else {
			// TMDb & IMDb both have credit with same name, but character name differs
			addExistingCastWithDiffChar(imdbCastCredit, tmdbExistingCredit);
		}
		removeCreditFromArray(existingCastWorking, tmdbExistingCredit);
	} else {
		// imdb has a credit that tmdb doesn't
		addAdditionalCastMember(imdbCastCredit);
	}
	removeCreditFromArray(imdbCastCredits, imdbCastCredit);
}

function removeCreditFromArray(array, credit) {
	$.each(array, function(index, result) {
		if (credit.name === result.name) {
			array.splice(index, 1);
			return false;
		}
	});
}

function addExactMatchCast(tmdbCredit, imdbCredit) {
	var $matchesSection = $('<section></section>').appendTo('#matches'),
	  $workingDiv;

	$matchesSection.append(tmdbCredit.name + ' as ' + tmdbCredit.character);
	$workingDiv = $('<div class="working"></div>').appendTo($matchesSection);

	getTmdbPersonExtIdsForm(tmdbCredit)
	  .done(function($extIdsForm) {
	  	var $tmdbImdbIdInput = $extIdsForm.find('input:text[name=imdb_id]'),
		  tmdbImdbId = $tmdbImdbIdInput.val().trim();
	  	if (tmdbImdbId !== imdbCredit.imdbId) {
	  		if (tmdbImdbId !== '') {
	  			$matchesSection.append('<p style="margin-left:10px" class="ui-state-error">IMDB Ids don\'t match!</p>');
	  		} else {
	  			$matchesSection.attr('noselection', 'false');
	  			$tmdbImdbIdInput.val(imdbCredit.imdbId);
	  			$('<div class="selectable ui-selected checked">Add IMDb Id: ' + imdbCredit.imdbId + '</div>')
				  .appendTo($matchesSection)
				  .append('<input type="hidden" name="personName" value="' + tmdbCredit.name + '">')
				  .append('<input type="hidden" name="personExtIdsUrl" value="https://www.themoviedb.org/person/' + tmdbCredit.url + '/remote/external_ids?translate=false">')
				  .append('<input type="hidden" name="formData" value="' + $extIdsForm.serialize() + '">')
				  .click(function() {
				  	$(this).toggleClass('ui-selected');
				  	$matchesSection.attr('noselection', $matchesSection.find('div.ui-selected').length === 0);
				  });
	  		}
	  	}
	  })
	  .fail(function(data) {
	  	$matchesSection.append('<p style="margin-left:10px">Error checking IMDb Id: ' + data + '</p>');
	  })
	  .always(function() {
	  	$workingDiv.remove();
	  });
}

function getTmdbPersonExtIdsForm(tmdbCredit) {
	var defer = $.Deferred();
	//console.log(tmdbCredit);
	//$.get('//www.themoviedb.org/translate/person/' + tmdbCredit.url + '/add?language=en-US&_=' + new Date().getTime())
	//	.always(function() {
	//		console.log('always in getTmdbPersonExtIdsForm $.get function');
	$.ajax({
		url: 'https://www.themoviedb.org/person/' + tmdbCredit.url + '/edit?active_nav_item=external_ids',
		headers: {
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
			'Accept-Language': 'en-US,en;q=0.8'
		}
	}).done(function(s) {
		defer.resolve($(s).find('#external_ids_form'));
	}).fail(function(jqXHR, textStatus, errorThrown) {
		console.log('jqXHR:');
		console.log(jqXHR);
		defer.reject(textStatus + ': ' + errorThrown);
	});
	return defer;
	//})
	//.fail(function() {
	//	console.log('fail in getTmdbPersonExtIdsForm $.get function');
	//});
}

function addAdditionalCastMember(imdbCredit) {
	var $additionSection = $('<section noselection="true"></section>').appendTo('#additions'),
		imdbCastHtml;

	imdbCastHtml = ' <img src="' + imdbMediumImageUrl(imdbCredit.imageUrl) + '" class="imdbImg" style="height: 70px">';
	imdbCastHtml += '<a class="searchAgain mainName"/>';
	imdbCastHtml += '<a href="http://www.imdb.com/name/' + imdbCredit.imdbId + '/" title="View on IMDb" target="_blank" class="external">' + imdbCredit.name + '</a> as ';
	imdbCastHtml += '<input type="text" value="' + imdbCredit.character + '" name="character">';
	if (imdbCredit.creditedAs) {
		imdbCastHtml += '<p>Credited as: <span class="creditedAs">' + imdbCredit.creditedAs + '</span><a class="searchAgain"/></p>';
	}
	imdbCastHtml += '<div style="clear:both;"></div>';
	$additionSection.append(imdbCastHtml);

	$additionSection.find('p a.searchAgain').click(function() {
		searchAgainClick(imdbCredit.creditedAs);
	});
	$additionSection.find('a.searchAgain.mainName').hide()
		.click(function() {
			searchAgainClick(imdbCredit.name);
		});
	$additionSection.find('a.searchAgain').attr('title', 'refresh search using this name');

	function searchAgainClick(searchName) {
		/* jshint validthis:true */
		$(this).hide();
		$additionSection.find('a.searchAgain').toggle();
		$additionSection.find('div.person_results').remove();
		searchAdditionalCastMember($additionSection, searchName);
		$additionSection.attr('noselection', 'true');
	}

	searchAdditionalCastMember($additionSection, imdbCredit.name);
}

function searchAdditionalCastMember($additionSection, name) {
	var lookupUrl, $workingDiv, $searchResultDiv;

	$workingDiv = $('<div class="working"></div>').appendTo($additionSection);

	lookupUrl = 'https://www.themoviedb.org/search/remote/person?search_type=ngram';
	lookupUrl += '&flatten_known_for=true&take=20&skip=0&page=1&pageSize=10&filter[logic]=and';
	lookupUrl += '&filter[filters][0][value]=' + encodeURIComponent(name).replace('%20', '+').toLowerCase();
	lookupUrl += '&filter[filters][0][operator]=startswith&filter[filters][0][field]=name';
	lookupUrl += '&filter[filters][0][ignoreCase]=true';
	lookupUrl += '&_=' + Math.round(new Date().getTime()).toString();
	$.ajax({
		url: lookupUrl
	}).done(function(data) {
		$workingDiv.remove();
		$(data).each(function() {
			var existingPersonInCredits, searchResultHtml,
				searchResultId = this.id;

			searchResultHtml = ' <div class="person_results selectable">';
			searchResultHtml += '  <img width="45">';
			searchResultHtml += '  <div class="creditInfo">';
			searchResultHtml += '    <p>';
			searchResultHtml += '      <a class="creditName external" title="view on TMDb"><span></span></a><br>';
			searchResultHtml += '      <span class="known_for"></span>';
			searchResultHtml += '    </p>';
			searchResultHtml += '    <input type="hidden" name="id">';
			searchResultHtml += '    <input type="hidden" name="bson_id">';
			searchResultHtml += '    <input type="hidden" name="profile_path">';
			searchResultHtml += '    <input type="hidden" name="name">';
			searchResultHtml += '    <input type="hidden" name="character">';
			searchResultHtml += '  </div>';
			searchResultHtml += '  <div style="clear:both"></div>';
			searchResultHtml += '</div>';
			$searchResultDiv = $(searchResultHtml).appendTo($additionSection);
			// If the names match exactly, highlight it as a suggestion.
			//  This is good in cases where there are many results, but the matching
			//  names are lower priority and therefore lower in the list.
			$searchResultDiv.find('a.creditName span').text(this.name)
				.addClass(this.name === name ? 'suggested' : '')
				.click(function(event) {
					// so clicking the link doesn't toggle selection
					event.stopPropagation();
				});
			if (this.id === 0) {
				$searchResultDiv.find('a.creditName span').unwrap();
			} else {
				$searchResultDiv.find('a.creditName')
					.attr('href', location.origin + '/person/' + this.id)
					.attr('target', '_blank');
			}
			$searchResultDiv.find('span.known_for').text(this.known_for);
			if (this.profile_path) {
				$searchResultDiv.find('img').attr('src', 'https://image.tmdb.org/t/p/w45' + this.profile_path);
			} else {
				$searchResultDiv.find('img').replaceWith(noImagePortraitSvg);
			}
			$searchResultDiv.find('input[name=id]').val(this.id);
			$searchResultDiv.find('input[name=bson_id]').val(this.bson_id);
			$searchResultDiv.find('input[name=profile_path]').val(this.profile_path);
			$searchResultDiv.find('input[name=name]').val(this.id !== 0 ? this.name : name);

			existingPersonInCredits = $(existingCast).filter(function() {
				return this.id === searchResultId;
			})[0];
			if (existingPersonInCredits) {
				$searchResultDiv.find('.creditInfo p')
					.append('</br><span class="ui-state-error">This person is already a cast member!</span>');
			}
			// make selectable
			$($searchResultDiv).click(function() {
				$(this).toggleClass('ui-selected').siblings().removeClass('ui-selected');
				$additionSection.attr('noselection', $additionSection.find('div.ui-selected').length === 0);
			});
		});
	});
}

// add to output a credit where TMDb & IMDb names match but character is different
function addExistingCastWithDiffChar(imdbCredit, tmdbCredit) {
	console.log(tmdbCredit);
	var $differencesSection = $('<section noselection="true"></section>').appendTo('#differences'),
		itemTemplate;
	// //set hidden field values
	// $differencesSection.append(hiddenFieldsTemplate)
	//   .find('input[name=id]').val(tmdbCredit.id)
	//   .find('input[name=bson_id]').val(tmdbCredit.bson_id)
	//   .find('input[name=profile_path]').val(tmdbCredit.profile_path)
	//   .find('input[name=name]').val(tmdbCredit.name)
	//   //   character name comes from the IMDb credit bacause the hidden fields will
	//   //   only be used if the user selects the IMDb character name.
	//   .find('input[name=character]').val(imdbCredit.character);

	itemTemplate = ' <div class="person_results">';
	itemTemplate += '  <img width="45" style="float:left">';
	itemTemplate += '  <div><p></p></div>';
	itemTemplate += '</div>';

	var $tmdbDiv = $(itemTemplate).appendTo($differencesSection)
		.addClass('tmdb selectable');
	if (tmdbCredit.profile_path) {
		$tmdbDiv.find('img').attr('src', 'https://image.tmdb.org/t/p/w45' + tmdbCredit.profile_path);
	} else {
		$tmdbDiv.find('img').replaceWith(noImagePortraitSvg);
	}
	$tmdbDiv.find('p').text(tmdbCredit.name + ' as ' + tmdbCredit.character);
	$tmdbDiv.find('p').after('<p class="isSelected">(No change will be made)<p>');
	$tmdbDiv.find('p:last').after('<p class="isNotSelected">Click here to keep the credit as-is<p>');
	$tmdbDiv.click(function() {
		$(this).toggleClass('ui-selected').siblings().removeClass('ui-selected');
		$differencesSection.attr('noselection', $differencesSection.find('div.ui-selected').length === 0);
	});

	var $imdbDiv = $(itemTemplate).appendTo($differencesSection)
		.addClass('imdb selectable');
	$imdbDiv.find('img').attr('src', imdbMediumImageUrl(imdbCredit.imageUrl));
	$imdbDiv.find('p').text(imdbCredit.name + ' as ' + imdbCredit.character);
	$imdbDiv.find('p').after('<p class="isSelected"">(Credit will be changed to this character name)<p>');
	$imdbDiv.find('p:last').after('<p class="isNotSelected">Click here to update the credit using this character name<p>');
	tmdbCredit.character = imdbCredit.character;
	$('<input type=hidden name="formData">').appendTo($imdbDiv).val($.param(tmdbCredit));
	$imdbDiv.click(function() {
		$(this).toggleClass('ui-selected').siblings().removeClass('ui-selected');
		$differencesSection.attr('noselection', $differencesSection.find('div.ui-selected').length === 0);
	});
}

function addTmdbExtras() {
	var $tmdbExtrasSection;
	if (existingCastWorking.length > 0) {
		$tmdbExtrasSection = $('<section></section>').appendTo('#tmdbExtras');
		$(existingCastWorking).each(function() {
			$tmdbExtrasSection.append(this.name + ' as ' + this.character + '</br>');
		});
	}
}

function configureElements() {
	//remove empty main sections
	$('#accordion > div').each(function() {
		if ($(this).find('section').length === 0) {
			$(this).prev('h3').remove();
			$(this).remove();
		}
	});
	// make the accordian div a jquery-ui accordian
	$('#accordion').accordion({
		heightStyle: 'content',
		collapsible: true
	});
	// add submit buttons
	$('<input id="submit" type="submit" value="Submit" class="submitCreditsButton">')
		.insertAfter('#accordion')
		.click(function() {
			doSubmit();
		});

	// $('#accordion').before('<button class="submitCreditsButton top">Submit Changes</button><div style="clear: both;"></div>');
	// $('#accordion').after(' <button class="submitCreditsButton bottom">Submit Changes</button>');
	// $('.submitCreditsButton').button({
	//   icons: {
	//     primary: 'ui-icon-disk'
	//   }
	// }).click(function() {
	//   doSubmit();
	// });
}

// submit button event handler
function doSubmit() {
	var $configuredAdditions = $('#additions section[noselection=false]'),
		$configuredDifferences = $('#differences section[noselection=false] .imdb.ui-selected'),
		$configuredAddImdbIds = $('#matches .ui-selected');
	if ($configuredAdditions.length === 0 &&
		$configuredDifferences.length === 0 &&
		$configuredAddImdbIds.length === 0) {
		alert('No credits have been configured, nothing to submit.');
		return;
	}
	$('body').append('<div class="resultsPage"><h1>Updating TMDb cast for movie "' + movieName + '"...</h1></div>');
	$('body').css('overflow', 'hidden');

	resultsItemTemplate = ' <div class="resultItem todo">';
	resultsItemTemplate += '  <div class="item-title"></div>';
	resultsItemTemplate += '  <div class="item-message"></div>';
	resultsItemTemplate += '</div>';

	// additions
	// get all configured additions, add to results list, and call method to add
	$configuredAdditions.each(function(index) {
		var $resultItemDiv = $(resultsItemTemplate).appendTo('.resultsPage'),
			name = $(this).find('.ui-selected input[name=name]').val(),
			character = $(this).find('input:text[name=character]').val(),
			itemTitle = 'Add: ' + name + ' as ' + character,
			formData,
			isNewPerson = $(this).find('.ui-selected  input[name=id]').val() === '0';
		$(this).find('.ui-selected input:hidden[name=character]').val(character);
		formData = $(this).find('.ui-selected input:hidden').serialize();
		$resultItemDiv.find('div.item-title').text(itemTitle);

		window.setTimeout(function() {
			addOrUpdateCastCredit($resultItemDiv, formData, isNewPerson);
		}, index * 300);
	});
	// End additions

	// differences
	// get all configured character name updates, add to results list, and call method to update
	$configuredDifferences.each(function(index) {
		var $resultItemDiv = $(resultsItemTemplate).appendTo('.resultsPage'),
			itemTitle = 'Update: ' + $(this).find('div p:first').text(),
			formData = $(this).find('input:hidden').val();

		$resultItemDiv.find('div.item-title').text(itemTitle);

		window.setTimeout(function() {
			addOrUpdateCastCredit($resultItemDiv, formData, false);
		}, index * 300);
	});
	// end differences

	// exact matches, add IMDb ID
	$configuredAddImdbIds.each(function(index) {
		var $resultItemDiv = $(resultsItemTemplate).appendTo('.resultsPage'),
			personName = $(this).find('input:hidden[name=personName]').val(),
			itemTitle = 'Add IMDb Id to ' + personName,
			formData = $(this).find('input:hidden[name=formData]').val(),
			personExtIdsUrl = $(this).find('input:hidden[name=personExtIdsUrl]').val();

		$resultItemDiv.find('div.item-title').text(itemTitle);

		window.setTimeout(function() {
			addPersonImdbId($resultItemDiv, formData, personExtIdsUrl);
		}, index * 300);

		// .append('<input type="hidden" name="personName" value="' + tmdbCredit.name + '">')
		// .append('<input type="hidden" name="personExtIdsUrl" value="https://www.themoviedb.org/person/' + tmdbCredit.url + '/remote/external_ids?translate=false">')
		// .append('<input type="hidden" name="formData" value="' + $extIdsForm.serialize() + '">')

	});
	// end exact matches, add IMDb ID
}

function addOrUpdateCastCredit($resultItemDiv, formData, isNewPerson) {
	var methodType = isNewPerson ? 'POST' : 'PUT',
		successMsg = $resultItemDiv.find('div.item-title').text().startsWith('Add') ? 'Added successfully' : 'Updated successfully';

	$.ajax({
		url: castUrl,
		method: methodType,
		data: formData,
		headers: {
			'Accept': 'application/json, text/javascript, */*; q=0.01',
			'Accept-Language': 'en-US,en;q=0.8',
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
		}
	}).done(function(data) {
		if (data.success) {
			$resultItemDiv.find('.item-message').text(successMsg);
			$resultItemDiv.removeClass('todo');
			$resultItemDiv.addClass('resultComplete');
		} else {
			$resultItemDiv.find('.item-message').text(data);
			$resultItemDiv.removeClass('todo');
			$resultItemDiv.addClass('resultError');
		}
	}).fail(function(jqXHR, textStatus, errorThrown) {
		$resultItemDiv.find('.item-message').text(errorThrown);
		$resultItemDiv.removeClass('todo');
		$resultItemDiv.addClass('resultError');
	}).always(function() {
		checkIfDoneUpdating();
	});
}

function addPersonImdbId($resultItemDiv, formData, personExtIdsUrl) {
	$.ajax({
		url: personExtIdsUrl,
		method: 'POST',
		data: formData,
		headers: {
			'Accept': 'application/json, text/javascript, */*; q=0.01',
			'Accept-Language': 'en-US,en;q=0.8',
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
		}
	}).done(function(data) {
		if (data.success) {
			$resultItemDiv.find('.item-message').text('Added successfully');
			$resultItemDiv.removeClass('todo');
			$resultItemDiv.addClass('resultComplete');
		} else {
			$resultItemDiv.find('.item-message').append(data.message);
			$resultItemDiv.removeClass('todo');
			$resultItemDiv.addClass('resultError');
		}
	}).fail(function(jqXHR, textStatus, errorThrown) {
		$resultItemDiv.find('.item-message').text(textStatus + ': ' + errorThrown);
		$resultItemDiv.removeClass('todo');
		$resultItemDiv.addClass('resultError');
	}).always(function() {
		checkIfDoneUpdating();
	});
}

function checkIfDoneUpdating() {
	if ($('.resultsPage .todo').length === 0) {
		// finished updating all credits
		$('.resultsPage').css('cursor', 'auto');
		$('.resultsPage h1').text('Finished updating TMDb cast for movie "' + movieName + '" - Refresh to view results.');
		if (!$('.resultsPage a:contains(Refresh)')[0]) {
			$('<a href="" style="margin: auto;width: 120px;display: block;">Refresh</a>').appendTo('.resultsPage').button();
		}
	}
}

function blockUI() {
	$('body').append('<div class="blockUI blockOverlay" style="z-index: 1000; border: none; margin: 0px; padding: 0px; width: 100%; height: 100%; top: 0px; left: 0px; opacity: 0.6; cursor: wait; position: fixed; background-color: rgb(0, 0, 0);"></div>');
	$('body').append('<div class="blockUI blockMsg blockPage" style="z-index: 1011; position: fixed;"><h1>Working...</h1></div>');
}

function unblockUI() {
	$('.blockUI').remove();
}

function imdbMediumImageUrl(url) {
	var medUrl = url,
		crMatch, crVal;
	medUrl = medUrl.replace('UY44', 'UY317');
	medUrl = medUrl.replace('UX32', 'UX214');
	crMatch = /(_CR(\d+))/.exec(medUrl);
	if (crMatch) {
		crVal = Number(crMatch[2]) * 8;
		medUrl = medUrl.replace(crMatch[1], '_CR' + crVal.toString());
	}
	medUrl = medUrl.replace(',0,32,44_AL_', ',0,214,317_AL_');
	return medUrl;
}

$('a.k-button:contains(Sort)').after('<a class="k-button" id="fromIMDbButton">Compare with IMDb</a>');
$('#fromIMDbButton').click(function(e) {
	e.preventDefault();
	compareCast();
});
