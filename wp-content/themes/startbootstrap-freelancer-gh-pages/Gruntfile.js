module.exports = function (grunt) {
    grunt.initConfig({
        jshint: ['Gruntfile.js'],
        compass: {                  // Task 
          dev: {                    // Target 
            options: {              // Target options 
              sassDir: 'scss',
              cssDir: 'css1',
              environment: 'development',
              outputStyle: 'expanded' // nested, expanded, compact, compressed
            }
          },
          dist: {                    // Target 
            options: {              // Target options 
              sassDir: 'scss',
              cssDir: 'css',
              environment: 'production',
              outputStyle: 'compact' // nested, expanded, compact, compressed
            }
          }
        },
        cssmin: {
            target: {
              files: [{
                expand: true,
                cwd: 'css',
                src: ['*.css', '!*.min.css'],
                dest: 'css',
                ext: '.min.css'
              }]
            }
        },
        bump: {
          options: {
            commit: true,
            createTag: true,
            path: true,
            pushTo: 'origin'
          }
        },
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
            banner: '/*! <%= pkg.name %> - v<%= pkg.version %> */'
            },
            my_target: {
              files: {
                'js/output.min.js': ['js/freelancer.js', 'js/contact_me.js']
              }
            }
          }
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-bump');
    grunt.registerTask('default', ['jshint','compass:dist','cssmin','bump','uglify']);
};