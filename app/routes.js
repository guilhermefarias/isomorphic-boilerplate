var apiClient = require('./apiClient');

module.exports = function(match) {
	match('/', function(callback) {
		callback(null, 'index');
	});

	match('/posts', function(callback) {
		apiClient.get('/posts.json', function(err, res) {
			if (err){
				return callback(err)
			}

			var posts = res.body;
			callback(null, 'posts', {posts: posts});
		});
	});

	match('/posts/:id', function(id, callback) {
		apiClient.get('/posts/' + id + '.json', function(err, res) {
			if (err){
				return callback(err);
			}
			var post = res.body;
			callback(null, 'post', post);
		});
	});
};
