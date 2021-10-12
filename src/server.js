const express = require("express");
const app = express();
const routes = require("./routes");
const webRoutes = require("./webRoutes");
const ProductsWebSocket = require("./ProductsWebSocket");
const PersistenciaChat = require('./persistencia/PersistenciaChat')
const PersistenciaProducto = require('./persistencia/PersistenciaProducto')
const handlebars = require("hbs");
const mongoose=require('mongoose')
const session =  require('express-session')
const MongoStore = require('connect-mongo')

const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy

const advancedOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}
handlebars.registerHelper("raw-helper", function(options) {
    return options.fn(this);
})

const { UserModel, isValidPassword, createHash } = require('./persistencia/user')


//conecto la base de datos
CRUD()

async function CRUD(){
  // const URL='mongodb://localhost:27017/ecommerce'
   const URL = 'mongodb+srv://alex:Rflexion11@cluster0.cdny0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
    let rta =await mongoose.connect(URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    })
    console.log("BASE DE DATOS CONECTADA")
}

passport.use(new FacebookStrategy({
    clientID: '895703051379886',
    clientSecret: '8a5714c1dd03fa7850bfc7af42fcf75e',
    callbackURL: 'http://localhost:8080/auth/facebook/callback',
}, function(accessToken, refreshToken, profile, done) {
    done(null, {id: profile.id})
}))

passport.serializeUser(function(user, done) {
    done(null, user.id)
})

passport.deserializeUser(function(id, done) {
    done(null, {_id: id})
})


app.use(passport.initialize())



// importo las rutas de vistas
const productRoutes = require("./productRoutes");

app.use(session({
    secret: "secreto",
    saveUninitialized: true, 
    cookie: {
        maxAge: 60000 * 10
    },
    store: MongoStore.create({
        mongoUrl: 'mongodb+srv://alex:Rflexion11@cluster0.cdny0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', // la url de atlas se omite en el codigo fuente  por motivos de seguridad
        mongoOptions: advancedOptions
    })
}))
app.use(passport.session())

app.get('/auth/facebook', passport.authenticate('facebook'))
app.get('/auth/facebook/callback', 
    passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login', scope: ['public_profile', 'email']})
)


// Uso handlebars
app.set("view engine", "hbs");
// https://www.geeksforgeeks.org/handlebars-templating-in-expressjs/#:~:text=To%20use%20handlebars%20in%20express,pages%20in%20the%20views%20folder.&text=Now%2C%20we%20need%20to%20change%20the%20default%20view%20engine.&text=Now%2C%20we%20render%20our%20webpage%20through%20express%20to%20the%20local%20server.
app.use(express.json());
app.use(express.urlencoded());

app.use("/api", routes);
app.use("/", webRoutes)

app.get("/", (req, res) => {
    res.render("index");
});

// registro las rutas para las vistas
app.use("/productos", productRoutes);





// Inicializo el web socket
ProductsWebSocket.inicializar();

app.listen(8080, () => {
    console.log("El servidor está escuchando en el puerto 8080")
})