const express = require('express');
const path = require('path');
const morgan = require('morgan');
const mysql = require('mysql');
const myConnection = require('express-myconnection');
const handlebars = require('express-handlebars');
const session = require('cookie-session');
const multer = require('multer');
const SocketIO = require('socket.io');
const compression = require('compression');
const helmet = require('helmet');
const jwt = require('jsonwebtoken')
const app = express();
const cron = require('node-cron');
app.use(compression());
app.use(helmet());

app.set('trust proxy', 1);
app.use(session({
    secret: 'clave secretosa',
    resave: false,
    saveUninitialized: false
}));


app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'src/views'));
app.engine('.hbs', handlebars({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs'
}));

app.set('view engine', '.hbs');

app.use(express.json());


//configurar middlewares
app.use(morgan('dev'));
app.use(myConnection(mysql, {
    host: 'localhost',
    user: 'root',
    password: '$BTC$#1my00770p',
    port: 3306,
    database: 'mychemis_algebrae_v01'
}, 'single'));
app.use(express.urlencoded({ extended: true }));

app.use('/', require(path.join(__dirname, 'src/rutas/rutas')));

//Archivos estáticos
app.use(express.static(path.join(__dirname, 'src/public')));

//oye we xd en que ruta es el pedo solo dime el nombre
app.use((req, res, next) => {
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.redirect('/');
    }
});


//Inicializar servidor  
const serverU = app.listen(app.get('port'), () => {
    console.log(`SERVER IN PORT ${app.get('port')}`);
});
/**--------------------------SCOKETS-------------------------------- */
const io = SocketIO(serverU);
// 
io.on('connection', (socket) => {
    console.log('new connection', socket.id);
    socket.on('chat:message', (data) => {
        io.sockets.emit('chat:message', data);

    });
    socket.on('chat:typing', (data) => {
        socket.broadcast.emit('chat:typing', data);
    });
});