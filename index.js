var async = require('async');
var exec = require('child_process').exec;


module.exports.build = function build(cb) {

	return async.series([
			function(callback) {
				exec("node --harmony node_modules/gulp-metalsmith-build/lib/build.js", callback);
			},
			function(callback) {
				exec("rm -rf public", callback);
			},
			function(callback) {
				exec("cp -r .tmp/ public/", callback);
			},
			function(callback) {
				cb();
			}
		],
		// optional callback
		function(err, results) {
			console.log(new Date() + ': ' + err)
		}
	);

}
