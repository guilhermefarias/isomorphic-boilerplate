var isServer,
	viewsDir,
	Handlebars,
	DirectorRouter,
	firstRender = true,
	director = require('director');

isServer = (typeof window === 'undefined');

if(isServer){
	viewsDir  = __dirname + '/views';
	Handlebars = require('handlebars');
	DirectorRouter = director.http.Router;
} else {
	viewsDir  = 'app/views';
	Handlebars = require('hbsfy/runtime');
	DirectorRouter = director.Router;
}

require('./helpers')(Handlebars).register();

module.exports = Router;

function Router(){
	if (routesFn == null){
		throw new Error('Must provide routes.');	
	}
	this.directorRouter = new DirectorRouter(this.parseRoutes(routesFn));
}

Router.prototype.parseRoutes = function(routesFn) {
	var routes = {};

	routesFn(function(pattern, handler) {
		if (isServer) {
			routes[pattern] = {
				get: this.getRouteHandler(handler)
			};
		} else {
			routes[pattern] = this.getRouteHandler(handler);
		}
	}.bind(this));

	return routes;
};

Router.prototype.getRouteHandler = function(handler) {
	var router = this;

	return function() {
		if (!isServer && firstRender) {
			firstRender = false;
			return;
		}

		var routeContext = this,
			params = Array.prototype.slice.call(arguments),
			handleErr = router.handleErr.bind(routeContext);

		function handleRoute() {
			handler.apply(null, params.concat(function routeHandler(err, viewPath, data) {
				if (err){
					return handleErr(err);	
				}

				data = data || {};

				if(isServer){
					data.renderer = 'server';
				} else {
					data.renderer = 'client';
				}

				router.renderView(viewPath, data, function(err, html) {
					if (err){
						return handleErr(err)
					}

					if (isServer) {
						router.handleServerRoute(viewPath, html, routeContext.req, routeContext.res);
					} else {
						router.handleClientRoute(viewPath, html);
					}
				});
			}));
		};

		try {
			handleRoute();
		} catch (err) {
			handleErr(err);
		}
	};
};

Router.prototype.handleErr = function(err) {
	console.error(err.message + err.stack);

	if (this.next) {
		this.next(err);
	} else {
		alert(err.message);
	}
};

Router.prototype.renderView = function(viewPath, data, callback) {
	var template, html;

	try {
		template = require(viewsDir + '/' + viewPath + '.hbs');
		html = template(data);
		callback(null, html);
	} catch (err) {
		callback(err);
	}
};

Router.prototype.wrapWithLayout = function(locals, callback) {
	var layout, layoutHtml;

	try {
		layout = require(viewsDir + '/layout');
		layoutHtml = layout(locals);
		callback(null, layoutHtml);
	} catch (err) {
		callback(err);
	}
};

Router.prototype.handleClientRoute = function(viewPath, html) {
	document.getElementById('view-container').innerHTML = html;
};

Router.prototype.handleServerRoute = function(viewPath, html, req, res) {
	var bootstrappedData = {};
	var locals = {
		body: html,
		bootstrappedData: JSON.stringify(bootstrappedData),
	};

	this.wrapWithLayout(locals, function(err, layoutHtml) {
		res.send(layoutHtml);
	});
};

Router.prototype.middleware = function() {
	var directorRouter = this.directorRouter;

	return function middleware(req, res, next) {
		directorRouter.attach(function() {
			this.next = next;
		});

		directorRouter.dispatch(req, res, function (err) {
			if (err && err.status === 404) {
				next();
			}
		});
	};
};

Router.prototype.start = function(bootstrappedData) {
	this.bootstrappedData = bootstrappedData;
	this.directorRouter.configure({
		html5history: true
	});

	document.addEventListener('click', function(e) {
		var el = e.target,
			dataset = el && el.dataset;

		if (el && el.nodeName === 'A' && (dataset.passThru == null || dataset.passThru === 'false')) {
			this.directorRouter.setRoute(el.attributes.href.value);
			e.preventDefault();
		}
	}.bind(this), false);

	this.directorRouter.init();
};

Router.prototype.setRoute = function(route) {
	this.directorRouter.setRoute(route);
};
