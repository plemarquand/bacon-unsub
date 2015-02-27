'use strict';
module.exports = function(grunt) {
    // Show elapsed time at the end
    require('time-grunt')(grunt);
    // Load all grunt tasks
    require('load-grunt-tasks')(grunt);

    var config = {
        srcFiles: [{
            expand: true,
            cwd: 'src',
            src: ['**/*.js']
        }],
        testFiles: [{
            expand: true,
            cwd: 'test',
            src: ['**/*.js']
        }]
    };

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            gruntfile: {
                src: ['Gruntfile.js']
            },
            js: {
                files: config.srcFiles
            },
            test: {
                files: config.testFiles
            }
        },
        babel: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['**/*.js'],
                    dest: 'dist'
                }]
            },
            test: {
                files: [{
                    expand: true,
                    cwd: 'test',
                    src: ['**/*.js'],
                    dest: 'dist/test'
                }, {
                    expand: true,
                    cwd: 'src',
                    src: ['**/*.js'],
                    dest: 'dist/src'
                }]
            }
        },
        mochacli: {
            options: {
                reporter: 'spec'
            },
            all: ['dist/test/*.js']
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            js: {
                files: ['src/**/*.js'],
                tasks: ['jshint:js', 'mochacli']
            },
            test: {
                files: ['src/**/*.js', 'test/**/*.js'],
                tasks: ['jshint:test', 'babel:test', 'mochacli']
            }
        },
        clean: ['dist']
    });

    grunt.registerTask('default', ['clean', 'jshint', 'babel:dist']);
    grunt.registerTask('test', ['clean', 'jshint', 'babel:test', 'mochacli']);
    grunt.registerTask('tdd', ['clean', 'jshint', 'babel:test', 'mochacli', 'watch:test']);
};