const express = require("express");
const cors = require("cors");
const app = express();
const session = require("express-session");
const bcrypt = require("bcrypt");
const model = require("./model.js");
const { MongoUnexpectedServerResponseError } = require("mongodb");
const port = 8080;


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

//Wil need to be added once users and session is ready
function AuthMiddleware(req, res, next) {
    if (req.session && req.session.userId) {
        model.User.findOne({"_id" : req.session.userId}).then(user => {
            if (user) {
                req.user = user;
                next(); //proceed to next process
            }
            else {
                res.status(401).send("Unauthenticated")//user doesn't exist
            }
        })
    }
    else {
        res.status(401).send("Unauthenticated");//no session to authroize
    }
};

//Blueprints
app.get("/blueprints" , function(req, res) {
    model.Blueprint.find().populate("printSetup")
    .populate("user")
    .then((blueprint) => {
        res.status(200).send(blueprint);
    })
});

app.get("/blueprints/:blueprintId" , function(req, res) {
    model.Blueprint.findOne({"_id" : req.params.blueprintId})
    .populate("printSetup")
    .populate("user")
    .then((blueprint) => {
        if (blueprint) {
            res.status(200).send(blueprint);
        }
        else {
            res.status(404).send("Blueprint not found");
        }
    }).catch((errors) => {
        res.status(422).send("Not a valid request");
    })
});


//Post Blueprint needs to be finished when upload/download is figured out
app.post("/blueprints" , function(req, res) {
    var newBlueprint = new model.Blueprint({
        title: req.body.title,
        description: req.body.description,
        // photos: , !!Will be finished with Multer!!
        // files: ,
        components: req.body.components,
        printSetup: req.body.printSetup,
        likes: [],
        user: req.body.user,
    })

    newBlueprint.save().then(() => {
        res.status(201).send("Blueprint created");
    }).catch((errors) => {
        let errorList = []
        for (key in errors.errors) {
            errorList.push(errors.errors[key].properties.message);
            res.status(422).send(errorList)
        }
    })
});


//Put Blueprint needs to be finished when upload/download is figured out
app.put("/blueprints/:blueprintId" , function(req, res) {
    var blueprintId = req.params.blueprintId

    model.Blueprint.findOne({"_id" : blueprintId}).then((blueprint) => {
        blueprint.title =  req.body.title;
        blueprint.description = req.body.description;
        // blueprint.photos = ; !!Will be finished with Multer!!
        // blueprint.files = ;
        blueprint.components = req.body.components;
        blueprint.printSetup =  req.body.printSetup;
        blueprint.likes = req.body.likes;
        blueprint.user = req.body.user;
        model.Blueprint.findOneAndUpdate({"_id" : blueprintId} , blueprint , {new:true, runValidators:true})
        .then((results) => {
            res.status(200).send("Blueprint Updated")
        }).catch((errors) => {
            let errorList = []
            for (key in errors.errors) {
                errorList.push(errors.errors[key].properties.message);
                res.status(422).send(errorList)
            }
        })
    }).catch((errors) => {
        res.status(400).send("Blueprint not found")
    })
});

app.delete("/blueprints/:blueprintId" , function(req, res) {
    var blueprintId = req.params.blueprintId;

    model.Blueprint.findOne({"_id" : blueprintId}).then(blueprint => {
        if (blueprint) {
            model.Blueprint.deleteOne({"_id" : blueprintId})
            .then(result => {
                res.status(204).send("Blueprint Deleted");
            })
        }
    }).catch(errors => {
        res.status(400).send("Blueprint was not found or could not be deleted")
    })
});

//Printer
app.get("/printers" , function(req, res) {
    model.Printer.find()
    .populate("user")
    .then((printer) => {
        res.status(200).send(printer);
    })
});

app.get("/printers/:printerId" , function(req, res) {
    model.Printer.findOne({"_id" : req.params.printerId})
    .populate("user")
    .then((printer) => {
        if (printer) {
            res.status(200).send(printer);
        }
        else {
            res.status(404).send("Printer setup not found");
        }
    }).catch((errors) => {
        res.status(422).send("Not a valid request");
    })
});

app.post("/printers" , function(req, res) {
    var newPrinter = new model.Printer({
        title: req.body.title,
        user: req.body.user,
        nozzleTemp: req.body.nozzleTemp,
        bedTemp: req.body.bedTemp,
        layerThickness: req.body.layerThickness,
        printSpeed: req.body.printSpeed,
        other: req.body.other,
        likes: [],
    });

    newPrinter.save().then(() => {
        res.status(201).send("Printer setup saved")
    }).catch((errors) => {
        let errorList = []
        for (key in errors.errors) {
            errorList.push(errors.errors[key].properties.message);
            res.status(422).send(errorList)
        }
    })
});

app.put("/printers/:printerId" , function(req, res) {
    var printerId = req.params.printerId

    model.Printer.findOne({"_id" : printerId}).then((printer) => {
        printer.title = req.body.title;
        printer.user = req.body.user;
        printer.nozzleTemp = req.body.nozzleTemp;
        printer.bedTemp = req.body.bedTemp;
        printer.layerThickness = req.body.layerThickness;
        printer.printSpeed = req.body.printSpeed;
        printer.other = req.body.other;
        printer.likes = [];
        model.Printer.findOneAndUpdate({"_id" : printerId} , blueprint , {new:true, runValidators:true})
        .then((results) => {
            res.status(200).send("Printer setup Updated")
        }).catch((errors) => {
            let errorList = []
            for (key in errors.errors) {
                errorList.push(errors.errors[key].properties.message);
                res.status(422).send(errorList)
            }
        })
    }).catch((errors) => {
        res.status(400).send("Printer setup not found")
    })
});

app.delete("/printers/:printerId" , function(req, res) {
    var printerId = req.params.printerId;

    model.Printer.findOne({"_id" : printerId}).then(printer => {
        if (printer) {
            model.Printer.deleteOne({"_id" : printerId})
            .then(result => {
                res.status(204).send("Printer setup deleted");
            })
        }
    }).catch(errors => {
        res.status(400).send("Printer setup was not found or could not be deleted")
    })
});


//User
app.get("/users" , function(req, res) {
    model.User.find().then(function(users) {

        //User data protection -- commented out for testing
        // for (var i=0; i < user.length; i++) {
        //     user[i].password = "******"
        // }

        res.send(users);
    })
});

app.get("/users/:userId" , function(req, res) {
    model.User.findOne({"_id" : req.params.userId}).then(function(user) {
        if (user) {
            res.send(user);
        }
        else {
            res.status(404).send("User not Found");
        }
    }).catch(function(errors) {
        res.status(422).send("Not a Valid Request")
    })
});

app.post("/users" , function(req, res) {
    var newUser = new model.User({
        username: req.body.username,
        email: req.body.email,
    });

    newUser.setPassword(req.body.password).then(() => {
        newUser.save().then(function() {
            res.status(201).send("User Created")
        }).catch(function(errors) {
            let errorList = []
            for (key in errors.errors) {
                errorList.push(errors.errors[key].properties.message);
                res.status(422).send(errorList)
            }
        })
    })
});

app.put("/users/:userId" , function(req, res) {
    var userId = req.params.userId;

    model.User.findOne({"_id" : userId}).then(user => {
            user.username = req.body.username;
            user.email = req.body.email;
            user.setPassword(req.body.password).then(() => {
                model.User.findOneAndUpdate({"_id" : userId} , user , {new:true, runValidators:true}).then(result => {
                    res.status(200).send("User Info Updated")
            })
            }).catch(function() {
                res.status(400).send("User info could not be Updated")
            })
        }).catch(errors => {
            res.status(400).send("User not Found")
        })
});

app.delete("/users/:userId" , function(req, res) {
    var userId = req.params.userId;

    model.User.findOne({"_id" : userId}).then(user => {
        if (user) {
            model.User.deleteOne({"_id" : userId}).then(result => {
                res.status(204).send("User Deleted");
            })
        }
    }).catch(errors => {
        res.status(400).send("User not Found or Could not Delete")
    })

});

//Session
app.get("/session" , function(req, res) {
    console.log(req.session);
    res.send()
});

app.post("/session" , function(req, res) {
    //email
    //password

    model.User.findOne({"email" : req.body.email}).then(user => {
        if (user) {
            //user exists, check password
            user.verifyPassword(req.body.password).then(result => {
                    if (result) {
                        //password matches
                        req.session.userId = user._id;
                        req.session.firstName = user.firstName;
                        res.status(201).send("Session Created")
                    }
                    else {
                        //password doesn't match
                        res.status(401).send("Couldn't authenticate. Check E-Mail and Password")
                    }
            })
        }
        else {
            //user doesn't exist
            res.status(401).send("Couldn't authenticate. Check E-Mail and Password")
        }
    }).catch(errors => {
        //user errors
        res.status(400).send("Couldn't authenticate request")
    })
});

app.delete("/session" , function(req, res) {
    req.session.userId = undefined;
    req.session.name = undefined;

    res.status(204).send("Session Deleted");
});

app.listen(port, function() {
    console.log("Server Started Locally on Port",port);
});

