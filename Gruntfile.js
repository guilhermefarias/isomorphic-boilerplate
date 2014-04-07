module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		browserify: {
			main: {
				options: {
					debug: true,
					transform: ['hbsfy'],
					aliasMappings: [
						{
							cwd: 'app/views',
							src: ['**/*'],
							dest: 'app/views',
							rename: function(cwd, src) {
								var ext = src.split('.').pop();
								return cwd + '/' + src + '.' + ext;
							}
						}
					],
					alias: ['jquery-browserify:jquery'],
				},
				files: {
					'public/scripts.js': 'app/entry.js',
				},
			},
		},

		nodemon: {
			main: {},
			debug: {
				options: {
					nodeArgs: ['--debug']
				}
			}
		},

		watch: {
			app: {
				files: 'app/**/*',
				tasks: ['browserify'],
				options: {
					interrupt: true
				}
			}
		},

		concurrent: {
			main: {
				tasks: ['nodemon', 'watch'],
				options: {
					logConcurrentOutput: true
				}
			},

			debug: {
				tasks: ['nodemon:debug', 'watch', 'node-inspector'],
				options: {
					logConcurrentOutput: true
				}
			}
		},

		'node-inspector': {
			main: {}
		}
	});

	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-node-inspector');

	grunt.registerTask('compile', ['browserify']);
	grunt.registerTask('default', ['compile']);
	grunt.registerTask('server', ['compile', 'concurrent']);
	grunt.registerTask('server:debug', ['compile', 'concurrent:debug']);
};
