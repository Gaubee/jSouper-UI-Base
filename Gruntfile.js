module.exports = function(grunt) {
    'use strict';

    //load all grunt tasks
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');

    //define tasks
    grunt.registerTask('server', ['watch']);

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
            css:{
                src: 'jsouper-ui/css/*.css',
                dest: 'jsouper-ui/jsouper.base-ui.css'
            }
        },
        //文件监听
        watch: {
            widgets: {
                files: ['jsouper-ui/widgets/**'],
                tasks: ['concat:widgets']
            },
            css:{
                files: ['jsouper-ui/css/**'],
                tasks: ['concat:css']
            }
        }


    });
};
