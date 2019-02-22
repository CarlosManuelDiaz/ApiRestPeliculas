const moongose = require("mongoose");
const express = require("express");
const bodyparser = require("body-parser");
const PeliculasModel = require("../peliculas/modelopeliculas");
const UsersModel = require("../peliculas/modelousuario");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

moongose.connect("mongodb://localhost:27017/pelis", { useNewUrlParser: true });

const app = express();
app.use(bodyparser.json());
// Devuelve el listado de peliculas
app.get("/movies", async function(req, res) {
  const movies = await PeliculasModel.find();
  res.json(movies);
});
// Genera nuevas peliculas usando el modelo de modelopeliculas.js
app.post("/movies", async function(req, res) {
  const movieData = req.body;
  const movie = new PeliculasModel(movieData);

  await movie.save();
  res.send("Pelicula Guardada");
});
//Ordena las peliculas por puntuacion y muestra el numero de peliculas que se piden desde parametros
app.get("/movies/:n", async function(req, res) {
  const top = parseInt(req.params.n);
  const toppeliculas = await PeliculasModel.find()
    .sort({ Puntuacion: -1 })
    .limit(top);
  res.json(toppeliculas);
});
// registra un nuevo usuario usando el modelo modelousuarios.js y le asigna un token
app.post("/register", async function(req, res) {
  const Nuevousuario = req.body;
  const usuario = new UsersModel(Nuevousuario);
  const token = jwt.sign({usuario}, 'my_secret_key');
  await usuario.save();
  res.send({token});
});
// realiza el login de un usuario compronado tanto el usuario como la contraseña Haseada
app.post("/login", async function (req, res) {
    const UserName = req.body.UserName;
    const Password = req.body.Password;
    await UsersModel.findOne({ UserName: UserName, })
        .then(user => {
            if (!user) return res.send("Not logged in!");
            bcrypt.compare(Password, user.Password)//verifica las contraseñas ya haseadas
                .then(match => {
                    if (match) return res.status(200).send({ message: 'Acceso' });
                    return res.status(200).send({ message: 'Password incorrecto' })
                }).catch(error => {
                    console.log(error);
                    res.status(500).send({ error });
                });
        }).catch(error => {
            console.log(error);
            res.status(500).send({ error })
        });
});
//Busca las peliculas de un usuario que asignamos desde parametros
app.get("/user/:userId/movies", async function(req, res) {
  const userId = req.params.userId;
  const peliculasusuario = await PeliculasModel.find({ UserID: userId });
  res.json(peliculasusuario);
});
//acceso restringido solo pueden acceder usuarios con el token asignado
app.get("/user/protegido", ensureToken, (req, res) => {
    jwt.verify(req.token, 'my_secret_key', (err, data) => {
        if (err) {
            res.sendStatus(403);
        } else {
            res.json({
                text: "Protegido",
                data
            });
        }
    });
});
//funcion de middleware que recoge los datos del token y los divide dejando solo la numeracion que genera y omite el 1 campo
function ensureToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    console.log(bearerHeader);
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403)
    };
};
//muestra el top de peliculas de un usuario 
app.get("/user/:userId/movies/top/:n", async function(req, res) {
  const userId = req.params.userId;
  const top = parseInt(req.params.n);
  const topusuario = await PeliculasModel.find({ UserID: userId })
    .sort({ Puntuacion: -1 })
    .limit(top);
  res.json(topusuario);
});

app.listen(3000, () => console.log("Server listening"));
