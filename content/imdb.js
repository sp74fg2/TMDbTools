'use strict';

var id = location.href.split('/')[4],
    isNotTvSeries = $('#overview-top .infobar').text().indexOf('TV Series') === -1 &&
        $('div.subtext').text().indexOf('TV Series') === -1 &&
        $('#overview-top .infobar').text().indexOf('TV Mini-Series') === -1 &&
        $('div.subtext').text().indexOf('TV Mini-Series') === -1,
    tmdbSvg = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 20 20" xml:space="preserve" width="20" height="20"><rect x="0" y="0" fill="#04332E" width="20" height="20"></rect><path fill="#00D474" d="M3.6 16.7l0.9-1h12.4c0.5 0 0.8-0.4 0.8-0.8V4c0-0.5-0.4-0.8-0.8-0.8H3.2C2.8 3.2 2.4 3.6 2.4 4v12.7l-0.8 0.8V3.9c0-0.8 0.7-1.5 1.5-1.5H17c0.9 0 1.5 0.7 1.5 1.5v11.2c0 0.9-0.7 1.6-1.5 1.6H3.6zM5.2 4.4v0.9h1.5v3.5h0.9V5.3h1.5V4.4H5.2zM12.9 6.4l-2-2.1v4.6h0.9V6.5l1.1 1.1L14 6.5v2.3h0.9V4.2L12.9 6.4zM7.1 10H5.6v4.8h1.5c1.3 0 2.4-1.1 2.4-2.4v0C9.5 11.1 8.4 10 7.1 10zM8.4 12.4c0 0.8-0.6 1.5-1.4 1.5H6.5v-3H7C7.9 10.9 8.4 11.6 8.4 12.4L8.4 12.4zM14.6 11.5c0-0.8-0.6-1.4-1.4-1.4h-1.9v4.8h1.9c0.8 0 1.4-0.6 1.4-1.4v0c0-0.4-0.1-0.7-0.4-1C14.4 12.2 14.6 11.8 14.6 11.5L14.6 11.5zM13.5 13.4c0 0.3-0.2 0.5-0.5 0.5h-0.8v-1.1H13C13.3 12.9 13.5 13.1 13.5 13.4L13.5 13.4zM13.5 11.5c0 0.3-0.2 0.5-0.5 0.5h-0.8v-1.1H13C13.3 10.9 13.5 11.2 13.5 11.5L13.5 11.5z"></path></svg>',
    tmdbLink;

if (id && isNotTvSeries) {
    tmdbLink = $('<a>', {
        href: 'http://themoviedb.org/movie/new?imdbId=' + id,
        id: 'tmdbLink',
        target: '_blank',
        title: 'search or import on TMDb',
        html: tmdbSvg,
        style: 'width: 20px !important; display: inline-block;'
    });

    if ($('.title_wrapper h1')[0]) {
        $('.title_wrapper h1').after(tmdbLink);
        $('.title_wrapper h1').css('display', 'inline');
    } else if ($('h1.header span.nobr')[0]) {
        $('h1.header span.nobr').after(tmdbLink);
    } else if ($('h1.header span')[0]) {
        $('h1.header span').after(tmdbLink);
    } else {
        console.warn('TMDbTools: unable to find title in order to add TMDb icon/link.');
    }
}
