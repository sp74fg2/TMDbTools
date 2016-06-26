'use strict';

/* globals countryNameFromAlpha2 */

$('#grid tbody img').each(function() {
	var $this = $(this),
		countryName = countryNameFromAlpha2($(this).attr('alt'));
	if (countryName) {
		$this.attr('title', countryName);
		$this.wrap('<a href="https://en.wikipedia.org/wiki/' + countryName + '" target="_blank"></a>');
	}
});
