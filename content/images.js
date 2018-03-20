'use strict';

// lock all images button
if ($('span.unlocked').not('.glyphicons').length > 0) {
	chrome.storage.local.get({ lockAllImages: true }, function (items) {
		if (items.lockAllImages) {
			var mediaId,
				mediaType = 'tv_series',
				putUrl;
			mediaId = $('#main').contents().filter(function () {
				return this.nodeType == 8;
			}).get(0).nodeValue.replace('ID:', '').trim();
			if (/\/season\/(\d+)\/episode\/(\d+)\/images\/backdrops/.test(location.href)) {
				mediaType = 'tv_episode';
			} else if (/\/season\/(\d+)\/images/.test(location.href)) {
				mediaType = 'tv_season';
			} else if (location.href.includes('/movie/')) {
				mediaType = 'movie';
			}
			console.log('mediaType = ' + mediaType);

			//add css for new lock button
			$('<style>section.inner_content span.buttons span.unlocked:before { content: "\\e205";}</style>')
				.appendTo('head');
			//add new lock button
			$('section.inner_content span.buttons a:first')
				.after('<a class="button white right rounded edit colorize middle" href=# id="lockAllImages">' +
				'<span class="unlocked glyphicons" title="lock all unlocked images"></span></a>');
			//add lock all button click event handler
			$('#lockAllImages').click(function (e) {
				e.preventDefault();
				this.remove();
				$('span.unlocked').not('.glyphicons').each(function () {
					var imageId = $(this).attr('id');
					//console.log('imageId: ' + imageId);
					putUrl = '//www.themoviedb.org/image/' + imageId +
						'/toggle-lock?media_type=' + mediaType + '&media_id=' + mediaId;
					$.ajax({
						url: putUrl,
						type: 'PUT'
					})
						.done(function (data) {
							if (data.success === true) {
								$('span[id="' + imageId + '"].unlocked')
									.removeClass('unlocked')
									.addClass('locked');
							}
						});
				});
			});
		}
	});
}

// auto-delete images
chrome.storage.local.get({ autoDeleteImages: false }, function (items) {
	if (items.autoDeleteImages) {
		$('.remove.moderator').click();
	}
})
