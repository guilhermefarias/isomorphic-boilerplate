var express = require('express'),
api = require('./lib/api'),
routes = require('./app/routes'),
Router = require('./app/router'),
app, port, apiPort, router;

app = express();
port = process.env.PORT || 3030;
apiPort = process.env.API_PORT || 3031;
router = new Router(routes);

app.use(express.static(__dirname + '/public'));
app.use(router.middleware());
app.use('/api', api.proxyMiddleware(apiPort));
app.listen(port);
api.listen(apiPort);

console.log('App running on port %s; API on port %s', port, apiPort);
