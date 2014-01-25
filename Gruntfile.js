module.exports = function(grunt) {
    'use strict';

    //load all grunt tasks
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-wrap');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    //define tasks
    grunt.registerTask('server', ['watch']);

    var jsFiles = ['jsouper-ui/src/*.js', 'jsouper-ui/src/html5attr/*.js', 'jsouper-ui/src/modulesInit/*.js']
    //grunt config
    grunt.initConfig({
        //======== 配置相关 ========
        pkg: grunt.file.readJSON('package.json'),
        src: '',
        //文件合并
        concat: {
            //合并所有模板成一个文件
            widgets: {
                src: 'jsouper-ui/widgets/*.*',
                dest: 'jsouper-ui/jsouper.base-ui.xmp'
            },
            //合并基础样式表
            css: {
                src: 'jsouper-ui/css/*.css',
                dest: 'jsouper-ui/jsouper.base-ui.css'
            },
            //合并js文件
            js: {
                src: jsFiles,
                dest: 'jsouper-ui/jsouper.base-ui.debug.js'
            }
        },
        //包裹合并后的js文件
        wrap: {
            basic: {
                src: ['jsouper-ui/jsouper.base-ui.debug.js'],
                dest: 'jsouper-ui/jsouper.base-ui.js',
                options: {
                    wrapper: ['!(function jSouperUI(global) {\n', '\n}(this));']
                }
            }
        },
        //压缩js
        uglify: {
            options: {
                beautify: false
            },
            my_target: {
                files: {
                    'jsouper-ui/jsouper.base-ui.min.js': ['jsouper-ui/jsouper.base-ui.js']
                }
            }
        },
        //压缩css
        cssmin: {
            combine: {
                files: {
                    'jsouper-ui/jsouper.base-ui.min.css': ['jsouper-ui/jsouper.base-ui.css']
                }
            }
        },
        //文件监听
        watch: {
            widgets: {
                files: ['jsouper-ui/widgets/**'],
                tasks: ['concat:widgets']
            },
            css: {
                files: ['jsouper-ui/css/**'],
                tasks: ['concat:css', "cssmin"]
            },
            js: {
                files: jsFiles,
                tasks: ['concat:js', "wrap", "uglify"]
            }
        }


    });
};
