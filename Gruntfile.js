module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: ['jquery.mousewheel.js']
        },
        uglify: {
            options: {
                compress: true,
                mangle: true,
                preserveComments: 'some',
                report: 'gzip'
            },
            build: {
                src: 'jquery.mousewheel.js',
                dest: 'jquery.mousewheel.min.js'
            }
        },
        connect: {
            server: {
                options: {
                    hostname: '*',
                    keepalive: true,
                    middleware: function(connect, options) {
                        return [
                            connect.static(options.base),
                            connect.directory(options.base)
                        ];
                    }
                }
            }
        },
        bump: {
            options: {
                files: ['package.json', 'mousewheel.jquery.json', 'bower.json', 'jquery.mousewheel.js'],
                commit: false,
                createTag: false,
                push: false
            }
        }
    });

    // Load the plugin that provides the 'uglify' task.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-bump');

    // Default task(s).
    grunt.registerTask('default', ['jshint', 'uglify']);

};
