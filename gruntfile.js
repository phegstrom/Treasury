module.exports = function(grunt){
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),


		watch: {
			sass:{
				files: ['public/sass/**/*.scss'],
				tasks: ['sass', 'concat:css', 'cssmin']
			},
			js: {
				files: ['public/js/*.js'],
				tasks: ['concat:js']
			},
			react: {
                files: ['react/**/*.jsx'],
                tasks: ['browserify']
            }
		},
        browserify: {
            options: {
                debug: true ,
                extensions: [ '.jsx' ],
                transform: [ 'reactify' ]
            },
            jsx: {
                src: ['./react/**/*.jsx'],
                dest: './public/scripts/react/bundle.js'
            }
        },		
		sass: {
			dist:{
				files: [{
					expand: true,
					cwd: 'public/sass/',
					src: ['**/*.scss'],
					dest: 'public/css/',
					ext: '.css'
				}]
			}
		},
		concat: {
			options: {
				separator: "\n",
				stripBanners: true,
				banner: '/*! <% pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */'
			},
			css: {
				src: ['public/css/*.css'],
				dest: 'public/css/build/combined.css'
			},
			js: {
				src: ['public/js/*.js'],
				dest: 'public/combined.min.js'
			},
		},
		uglify: {
			options: {
				manage: false,
			},
			my_target: {
				files: [{
					expand: true,
					cwd: 'public/scripts/js',
					src: ['*.js', '!*.min.js'],
					dest: 'public/scripts/js/',
					ext: '.min.js'
				}]
			}
		},
		cssmin: {
			target: {
				files: [{
					expand: true,
					cwd: 'public/css/build',
					src: ['*.css', '!*.min.css'],
					dest: 'public/css/build/',
					ext: '.min.css'
				}]
			}
		}				
	});

	// grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-react');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.registerTask('default', ['watch']);

};