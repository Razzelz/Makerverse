const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

dotenv.config();
mongoose.connect(process.env.DB_LINK);

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: [true, "Username already in use"]
    },
    email: {
        type: String,
        required: [true, "E-Mail address is reqired"],
        unique: [true, "E-mail already in use"],
    },
    password: {
        type: String,
        required: [true , "Password Required"]
    }
});

//Printer Setup
const PrinterSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Setup must have a printer name"]
    },
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    nozzleTemp: Number,
    bedTemp: Number,
    layerThickness: Number,
    printSpeed: Number,
    other: String,
    likes: Array,
});

const BlueprintSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Blueprint must have a title"]
    },
    description: String,
    // photos: , !!Will be finished with Multer!!
    // files: ,
    components: String,
    printSetup: [{type: mongoose.Schema.Types.ObjectId, ref: "Printer"}],
    likes: Array,
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
});

UserSchema.methods.setPassword = function(plainPassword) {
    var promise = new Promise((resolve, reject) => {
        bcrypt.hash(plainPassword, 12).then(hashedPassword => {
            this.password = hashedPassword;
            resolve();
        }).catch(() => {
            reject();
        });
    });

    return promise;

};

UserSchema.methods.verifyPassword = function(plainPassword) {
    var promise = new Promise((resolve, reject) => {
        bcrypt.compare(plainPassword, this.password).then(result => {
            resolve(result);
        }).catch(() => {
            reject();
        });
    });
    return promise;
};

const Printer = mongoose.model("Printer" , PrinterSchema);
const User = mongoose.model("User" , UserSchema);
const Blueprint = mongoose.model("Blueprint" , BlueprintSchema);

module.exports = {
    Printer: Printer,
    Blueprint: Blueprint,
    User: User,
}
