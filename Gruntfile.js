module.exports = function(grunt) {
    const manifest = require('./app/manifest.json')
    grunt.initConfig({
      compress: {
        main: {
          options: {
            archive: function () {
              return `dist/${manifest.name}-${manifest.version}.zip`
            }
          },
          files: [
            {expand: true, cwd: 'app/', src: ['./**/*'], dest: 'dist/'}
          ]
        }
      }
    });
    grunt.loadNpmTasks('grunt-contrib-compress');
};
