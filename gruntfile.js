'use strict';
/*
This file in the main entry point for defining grunt tasks and using grunt plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkID=513275&clcid=0x409
*/

/* global module, require */
module.exports = function (grunt) {
	grunt.initConfig({
		jshint: {
			// define the files to lint
			files: ['background/*.js', 'content/*.js', 'gruntfile.js'],
			// configure JSHint (documented at http://www.jshint.com/docs/)
			options: {
				jshintrc: true,
				reporter: require('jshint-stylish')
			}
		},
		compress: {
			main: {
				options: {
					archive: 'TMDbTools.zip',
					pretty: true
				},
				expand: true,
				src: ['*.*', 'background/**', 'content/**', 'vendor/**']
			}
		},
		lintspaces: {
			all: {
				src: ['background/*', 'content/*'],
				options: {
					editorconfig: '.editorconfig',
					ignores: ['js-comments']
				}
			}
		},
		csslint: {
			options: {
				gradients: false
			},
			strict: {
				src: ['content/*.css']
			}
		},
		watch: {
			files: ['<%= jshint.files %>'],
			tasks: ['lintspaces', 'jshint']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-lintspaces');
	grunt.loadNpmTasks('grunt-contrib-csslint');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('lint', ['jshint', 'csslint']);
	grunt.registerTask('default', ['lint', 'lintspaces']);
	grunt.registerTask('noCsslint', ['jshint', 'lintspaces']);
};
