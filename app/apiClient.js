var isServer,
	apiPort,
	methods,
	superagent = require('superagent');

isServer = typeof window === 'undefined';
apiPort = process.env.API_PORT || 3031;
methods = ['get', 'post', 'put', 'path', 'del'];

methods.forEach(function(method) {
	exports[method] = function(path) {
		var args = Array.prototype.slice.call(arguments, 1);
		return superagent[method].apply(null, [formatUrl(path)].concat(args));
	};
});

function formatUrl(path){
	var url;

	if (isServer) {
		url = 'http://localhost:' + apiPort + path;
	} else {
		url = '/api' + path;
	}

	return url;
}
