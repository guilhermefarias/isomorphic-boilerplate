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
