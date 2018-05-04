'use strict';

let storage = chrome.storage.local;

$(window).load(function () {
	//configure for popup or non-popup
	if (location.href.includes('?popup')) {
		//console.log('popup!');
		$('.switchContainer:not(.popup)').hide();
	} else {
		$('#fullOptions').hide();
	}

	//hide mod options in popup per modOptionsInPopup option
	storage.get({ modOptionsInPopup: false },
		function (items) {
			if (items.modOptionsInPopup) {
				$('.moderator').show();
			}
		});

	//load option and wire change event handlers
	$('input:checkbox').each(function () {
		var checkbox = this;
		storage.get({ [this.getAttribute('id')]: !this.hasAttribute('data-defaultoff') },
			function (items) {
				checkbox.checked = items[checkbox.getAttribute('id')];
			});

		$(this).change(function () {
			storage.set({ [checkbox.getAttribute('id')]: checkbox.checked });
		})
	})

	//popup "Full Options" link event handler
	$('#fullOptions').click(function (e) {
		e.preventDefault();
		chrome.runtime.openOptionsPage();
	})
});
