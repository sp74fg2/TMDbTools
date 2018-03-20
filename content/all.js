'use strict';

// change log modifications
chrome.storage.local.get({ changeLogModifications: true }, function (items) {
	if (items.changeLogModifications) {
		let changeImgRegex = /\{"file_path"=>"\/(\w+\.jpg)"/,
			episodeRegex = /\{"episode_id"=>(\d+)/,
			videoRegex = /"key"=>"([^"]+)"/;

		// add image thumbs (in change log)
		$('td.content .wrap').each(function () {
			var contentTextNode = $(this).contents().filter(function () { return this.nodeType === 3; }).last(),
				content = $(contentTextNode).text().trim(),
				results = changeImgRegex.exec(content),
				cdnUrl, cdnPath, imgUrl;
			if (results) {
				if (typeof cdn_url === 'string') {
					cdnUrl = cdn_url;
				} else {
					cdnUrl = 'https://image.tmdb.org/';
				}
				if (typeof cdn_path === 'string') {
					cdnPath = cdn_path;
				} else {
					cdnPath = 't/p/';
				}

				imgUrl = cdnUrl.replace(/\/\/$/, '/') + cdnPath + 'w92/' + results[1];
				$(this).append('<img src="' + imgUrl + '">');
			}
			results = episodeRegex.exec(content);
			if (results) {
				contentTextNode.replaceWith('<a href="https://www.themoviedb.org/tv/episode/' + results[1] + '">' +
					content + '</a>');
			}
		});

		$('td.content .wrap code').each(function () {
			var content = $(this).text().trim(),
				results = changeImgRegex.exec(content),
				cdnUrl, cdnPath, imgUrl;
			if (results) {
				if (typeof cdn_url === 'string') {
					cdnUrl = cdn_url;
				} else {
					cdnUrl = 'https://image.tmdb.org/';
				}
				if (typeof cdn_path === 'string') {
					cdnPath = cdn_path;
				} else {
					cdnPath = 't/p/';
				}

				imgUrl = cdnUrl.replace(/\/\/$/, '/') + cdnPath + 'w92/' + results[1];
				$(this).append('<img src="' + imgUrl + '">');
			}
			results = episodeRegex.exec(content);
			if (results) {
				$(this).replaceWith('<a href="https://www.themoviedb.org/tv/episode/' + results[1] + '">' +
					content + '</a>');
			}
			results = videoRegex.exec(content);
			if (results) {
				$(this).replaceWith('<a href="https://www.youtube.com/watch?v=' + results[1] + '">' +
					content + '</a>&nbsp;' + results[1]);
			}
		});

		// add link to youtube videos in admin changes
		$('td.key:contains(videos)').next().find('div').contents()
			.filter(function () { return this.nodeType === 3; })
			.each(function () {
				var content = $(this).text().trim(),
					results = videoRegex.exec(content);
				if (results) {
					$(this).replaceWith('<a href="https://www.youtube.com/watch?v=' + results[1] + '">' +
						content + '</a>&nbsp;' + results[1]);
				}
			});
	}
});

