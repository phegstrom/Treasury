module.exports = function(grunt){
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),


		watch: {
			sass:{
				files: ['public/sass/**/*.scss'],
				tasks: ['sass', 'cssmin']
			},
			react: {
                files: 'react/**/*.jsx',
                tasks: ['browserify']
            }
		},
		browserify: {
			options: {
				transform: [ require('grunt-react').browserify ]
		    },
		    client: {
				src: ['react/**/*.jsx'],
				dest: 'public/scripts/react/bundle.js'
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
		cssmin: {
			my_target: {
				files: [{
					expand: true,
					cwd: 'public/css/',
					src: ['*.css', '!*.min.css'],
					dest: 'public/css/min/',
					ext: '.min.css'
				}]
				/* COMBINE INTO ONE FILE that is called destStyle.css
				combine: {
					files: {
						'css/destStyle.css': ['css/style1.css', 'css/style2.css']
					}
				}*/
			}
		},
		concat: {
			options: {
				separator: ";",
				stripBanners: true,
				banner: '/*! <% pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */'
			},
			/*dist:{
				src: ['public/css/custom.css', 'public/css/custom2.css'],
				dest: 'public/css/main.min.css'
			},*/
			css: {
				src: ['public/css/min/*.min.css'],
				dest: 'public/css/combined.min.css'
			},
			js: {
				src: ['public/scripts/js/*.min.js'],
				dest: 'public/scripts/combined.min.js'
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
		}
		
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.registerTask('default', ['watch', 'sass', 'concat', 'uglify', 'cssmin']);

};