const mongoose = require('mongoose');

const { Schema } = mongoose;

const PeliculasSchema = new Schema({
    Titulo: {
        type: String,
    },
    Año: {
        type: Number,
    },
    Director: {
        type: String,
    },
    ImagenCaratula: {
        type: String,
    },
    Generos: [{
        type: String,
    }],
    Puntuacion: {
        type: Number,
    },
    UserID: Schema.Types.ObjectId,
});

const PeliculasModel = mongoose.model('peliculas', PeliculasSchema);

module.exports = PeliculasModel;