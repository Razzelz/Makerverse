const express = require("express");
const cors = require("cors");
const app = express();
const session = require("express-session");
const bcrypt = require("bcrypt");
const model = require("./model.js");
const { MongoUnexpectedServerResponseError } = require("mongodb");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const MongoClient = require("mongodb").MongoClient;
const GridFSBucket = require("mongodb").GridFSBucket;
const dotenv = require("dotenv");
const port = 8080;
app.use(express.static("public"));
dotenv.config();
const url = process.env.DB_LINK;
const storage = new GridFsStorage({
    url,
    file: (req, file) => {
      //If it is an image, save to photos bucket
      if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/heic") {
        return {
          bucketName: "photos",
          filename: `${Date.now()}_${file.originalname}`,
        }
      }
      else if (file.mimetype === "model/stl") {
        return {
            bucketName: "blueprints",
            filename: `${Date.now()}_${file.originalname}`,
        }
      }
      else {
        //Otherwise save to default bucket
        return `${Date.now()}_${file.originalname}`
      }
    },
});
const mongoClient = new MongoClient(url)
const upload = multer({ storage });

app.use(cors({
    credentials: true,
    origin: function(origin, callback) {
        callback(null, origin);
    }
}));
app.use(express.json());
app.use(session({
    secret: "jao84028jhf9ja8he03089j920j00nv0hg8halpmzx",
    cookie: {secure: false, httpOnly: false, sameSite: "lax"},
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
        photos: req.body.photos,
        files: req.body.files,
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
        blueprint.photos = req.body.photos;
        blueprint.files = req.body.files;
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
        printer.likes = req.body.likes;
        model.Printer.findOneAndUpdate({"_id" : printerId} , printer , {new:true, runValidators:true})
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
    res.send(req.session)
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
                        req.session.username = user.username;
                        res.status(201).send(req.session)
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
    req.session.username = undefined;

    res.status(204).send("Session Deleted");
});

//Images
app.get("/images", async (req, res) => {
    await mongoClient.connect()

    const database = mongoClient.db("test")
    var images = database.collection("photos.files");
    var cursor = images.find({});
    if (!cursor) {
        return res.status(404).send({
            message: "Error: No Images Found"
        })
    }

    const allImages = []

    await cursor.forEach(item => {
        allImages.push(item)
      })

      res.send({ files: allImages })
});

app.get("/images/:filename" , async (req, res) => {
    await mongoClient.connect()

    var name = req.params.filename;
    const database = mongoClient.db("test")
    var photos = database.collection("photos.files");
    var cursor = photos.find({filename: name});
    if (!cursor) {
        return res.status(404).send({
            message: "Error: No Image Found"
        })
    }

    const allImages = []

    await cursor.forEach(item => {
        allImages.push(item)
      })

      res.send({ image: allImages })
})

app.get("/imagedownload/:filename" , async (req, res) => {
    const database = mongoClient.db("test");
    const fileBucket = new GridFSBucket(database, {
        bucketName: "photos"
    })

    let downloadStream = fileBucket.openDownloadStreamByName(
        req.params.filename
    )

    downloadStream.on("data" , function(data) {
        return res.status(200).write(data)
    })

    downloadStream.on("error" , function (data) {
        return res.status(404).send({error: "Image not Found"})
    })

    downloadStream.on("end" , () => {
        return res.end()
    })
});

  app.post("/images", upload.single("image") ,function(req, res) {
    const file = req.file;
    res.send({
        message: "Uploaded",
        id: file.id,
        name: file.filename,
        contentType: file.contentType
    })
  });

  //Blueprint Files
  app.get("/files", async (req, res) => {
    await mongoClient.connect()

    const database = mongoClient.db("test")
    var files = database.collection("blueprints.files");
    var cursor = files.find({});
    if (!cursor) {
        return res.status(404).send({
            message: "Error: No Files Found"
        })
    }

    const allFiles = []

    await cursor.forEach(item => {
        allFiles.push(item)
      })

      res.send({ files: allFiles })
});

app.get("/files/:filename", async (req, res) => {
    await mongoClient.connect()

    var name = req.params.filename;
    const database = mongoClient.db("test")
    var files = database.collection("blueprints.files");
    var cursor = files.find({filename: name});
    if (!cursor) {
        return res.status(404).send({
            message: "Error: No File Found"
        })
    }

    const allFiles = []

    await cursor.forEach(item => {
        allFiles.push(item)
      })

      res.send({ file: allFiles })
});

//Downloads are necessary to access actual file information
//Normal get functions only pull file descriptors
//Actual download functions need to be applied in HTML
app.get("/filedownload/:filename" , async (req, res) => {
    await mongoClient.connect();

    const database = mongoClient.db("test")
    const fileBucket = new GridFSBucket(database, {
        bucketName: "blueprints",
    });

    let downloadStream = fileBucket.openDownloadStreamByName(
        req.params.filename
    )

    downloadStream.on("data" , function (data) {
        return res.status(200).write(data)
    })

    downloadStream.on("error" , function (data) {
        return res.status(404).send({ error: "File Not Found"})
    })

    downloadStream.on("end", () => {
        return res.end()
    })
});

app.post("/files", upload.single("file") ,function(req, res) {
    const file = req.file;
    res.send({
        message: "Uploaded",
        id: file.id,
        name: file.filename,
        contentType: file.contentType
    })
  });

app.listen(port, function() {
    console.log("Server Started Locally on Port",port);
});
