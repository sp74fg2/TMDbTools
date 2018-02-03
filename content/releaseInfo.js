'use strict';

//remove language
let removeLangA = '<a role="button" class="k-button k-button-icontext" href="#">Remove Language</a>';
$('div.k-grid-toolbar').append($(removeLangA).click(function (e) {
	e.preventDefault();
	let releaseUrl = (location.origin + location.pathname)
		.replace('/edit',
		'/remote/release_information?translate=false&language=en-US&timezone=America/New_York');
	$.getJSON(releaseUrl).done(function (data) {
		//console.log(data);
		$(data).each(function () {
			if (this.iso_3166_1 !== 'CH') {
				$(this.releases).each(function () {
					if (this.iso_639_1) {
						//console.log(this.iso_639_1);
						//console.log(JSON.stringify(this));
						this.iso_639_1 = '';
						$.ajax({
							url: releaseUrl,
							method: 'PUT',
							dataType: 'json',
							data: { data: JSON.stringify(this) }
						});
					}
				});
			}
		});
	});
	this.remove();
	let refreshA = '<a role="button" class="k-button k-button-icontext" href="#">Refresh</a>';
	$('div.k-grid-toolbar').append($(refreshA).click(function () {
		location.reload();
	}));
}));

//filter to show only release dates with language
let isFiltered = false;
let filterA = '<a role="button" class="k-button k-button-icontext" href="#" title="Show only infos with language">' +
	'<span class="k-icon k-i-filter"/><span class="text"/></a>';
$('div.k-grid-toolbar').append($(filterA).click(function (e) {
	e.preventDefault();
	$(this).find('span.k-icon').toggleClass('k-i-filter').toggleClass('k-i-filter-clear');
	isFiltered = !isFiltered;
	let counter = 0;

	$('tr.k-detail-row').each(function () {
		if (isFiltered) {
			let releaseInfoCount = $(this).find('table[role=grid] tbody[role=rowgroup] tr td:nth-child(2)').length;
			let withLangCount = $(this).find('table[role=grid] tbody[role=rowgroup] tr td:nth-child(2):contains(-)').length;
			if (releaseInfoCount == withLangCount) {
				$(this).hide();
				$(this).prev().hide();
			}
		} else {
			$(this).show();
			$(this).prev().show();
		}
	});

	$('table[role=grid] tbody[role=rowgroup] tr td:nth-child(2)').each(function () {
		if ($(this).text().trim() == '-') {
			//console.log($(this).text().trim());
			$(this).parent('tr').toggle();
		} else {
			counter += 1;
		}
	});
	$(this).find('.text').text(counter);
}));
