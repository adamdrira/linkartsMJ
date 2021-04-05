/*mes changements*/
const domino = require('domino');
const fs = require('fs');
const path = require('path');
var Element = domino.impl.Element;
import { Blob } from "blob-polyfill";
const cors = require('cors');
const  session = require('express-session');
var bodyParser = require('body-parser');
const cookieParser = require('cookie-parser'); 
const routes = require('./data_and_routes/routes/routes'); //récupération des routes qui sont entretenus après "/routes"
//const python = require('./data_and_routes/routes/python');
var compression = require('compression');
//import router from  './data_and_routes/routes/routes';
//import * as python from './data_and_routes/routes/python';



/*mes changements*/
require('zone.js/dist/zone-node');
require('zone.js/dist/long-stack-trace-zone');
require('zone.js/dist/proxy');
require('zone.js/dist/sync-test');
require('zone.js/dist/async-test');
require('zone.js/dist/fake-async-test');


/*mes changements*/
const template = fs.readFileSync(path.join(__dirname, '..','browser', 'index.html')).toString();

/*mes changements*/
const window = domino.createWindow(template);

window.requestAnimationFrame = function(callback) {
  setTimeout(callback, 0);
};

global['window'] = window;
global['document'] = window.document;
global['Element'] = Element;
global['location'] = window.location;
global['Blob'] = Blob;
// tslint:disable-next-line:no-string-literal
global['HTMLElement'] = window.HTMLElement;
// tslint:disable-next-line:no-string-literal
global['navigator'] = window.navigator;



import 'zone.js/dist/zone-node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { join } from 'path';

import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';

// The Express app is exported so that it can be used by serverless Functions.
export function app() {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/linkarts/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';



  //ajouts de express.js
  server.use(session({secret:'zz',resave:true,saveUninitialized:true}))
  server.use(cookieParser());
  server.use(bodyParser.json());
  server.use('/routes', routes); //le fichier routes.js va s'occuper de gérer les routes à partir d'ici 
  server.set('trust proxy', 'loopback');
  server.use(function(req, res, next) {
    
    res.setHeader('Access-Control-Allow-Credentials', "true");
    res.setHeader("Access-Control-Allow-Origin", ["http://localhost:4000"]); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization");
    //pour l'upload de contenus
    next();
  });
  const corsOptions = {
    origin: ['http://localhost:4000'],
    optionsSuccessStatus: 200
  };
  server.use(cors(corsOptions));
  server.use(bodyParser.urlencoded({ extended: false }));
  require('./authentication/user.route.js')(server);
  //Middleware
  /*process.env.NODE_ENV="production"
  
  //server.use(compression());
  
  //Réglage des headers
  server.set('trust proxy', 'loopback') // specify a single subnet
  server.use(function(req, res, next) {
    
    res.setHeader('Access-Control-Allow-Credentials', "true");
    res.setHeader("Access-Control-Allow-Origin", ["http://localhost:4000","http://localhost:4200"]); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization");
    //pour l'upload de contenus
    next();
  });
  //Peut-être que cette partie est un doublons des headers précedents
  const corsOptions = {
    origin: ['http://localhost:4000','http://localhost:4200'],
    optionsSuccessStatus: 200
  };
  server.use(cors(corsOptions));
  
 
  server.use(fileUpload()); //pour télécharger des fichiers de pythons
  
  require('./authentication/user.route.js')(app); //Database configuration, get users with model.*/
  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Example Express Rest API endpoints
  // app.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
  });

  return server;
}

function run() {
  const port = process.env.PORT || 4600;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log("start3")
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';