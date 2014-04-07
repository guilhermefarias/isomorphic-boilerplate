var express = require('express'),
	httpProxy = require('http-proxy'),
	_ = require('underscore'),
	app, postId, posts, proxy;
  	
app = express();
postId = 0;


posts = [{
	id: ++postId,
	title: 'Post example 1',
	author: 'Guilherme Farias',
	created_at: '2014-02-05T15:15:56.403Z',
	body: 'This is just one post from a NodeJS application.'
}, {
	id: ++postId,
	title: 'Post example 2',
	author: 'Guilherme Farias',
	created_at: '2013-03-05T13:30:12.274Z',
	body: 'This is just another post from a NodeJS application.'
}];

module.exports = app;
app.use(express.bodyParser());

app.get('/posts.json', function(req, res) {
	res.send(posts);
});

app.post('/posts.json', function(req, res) {
	var post = req.body;

	if (!post.title || !post.author || !post.body) {
		res.send(400, {success: false, error: 'Missing parameters.'});
	} else {
		post.id = ++postId;
		post.created_at = new Date().toJSON();
		posts.push(post);
		res.send({success: true});
	}
});

app.get('/posts/:id.json', function(req, res) {
	var id = parseInt(req.params.id, 10),
		post = _.find(posts, function(p) {
			return p.id === id
		});

	if (post) {
		res.send(post);
	} else {
		res.send(404, {error: 'Not found.'});
	}
});

proxy = new httpProxy.RoutingProxy();

app.proxyMiddleware = function(apiPort) {
	return function(req, res, next) {
		proxy.proxyRequest(req, res, {
			host: 'localhost',
			port: apiPort
		});
	};
};
