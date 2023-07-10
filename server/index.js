const express = require("express");
const cors = require("cors");
const app = express();
const session = require("express-session");
const bcrypt = require("bcrypt");


app.use(cors({
    credentials: true,
    origin: function(origin, callback) {
        callback(null, origin);
    }
}));

app.use(express.json());
app.use(session({
    secret: "jao84028jhf9ja8he03089j920j00nv0hg8halpmzx",
    saveUninitialized: true,
    resave: false,
}));