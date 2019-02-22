const mongoose = require('mongoose');
const bcrypt = require('bcrypt');




const { Schema } = mongoose;

const usersSchema = new Schema({
    UserName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    BirthDate: {
        type: Number,
        required: true,
        
    },
    Password: {
        type: String,
        required: true,
    }   
});

usersSchema.pre('save', function (next){
    bcrypt.genSalt(10).then(salts => {
        bcrypt.hash(this.Password, salts).then(hash =>{
            this.Password = hash;
            next()
        }).catch(error =>next(error))

    }).catch(error => next(error))
})


const UsersModel = mongoose.model('Usuarios',usersSchema);

module.exports = UsersModel;