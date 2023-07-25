// Use this URL for when the website is running
//const URL = "https://makerverse.binary141.com"

//Use this URL for when hoting locally
const URL = "http://localhost:8080"

Vue.createApp({
    data() {
        return {
		page: "home",
                showPrintDetails: "hidden",
		makes: [],
		filteredMakes: [],
		selectedMake: [],
                selectedPrintSetup: [],
		search: "",
                current_user: {
                        userId : "",
                        username: "",
                        email: "",
                        password: "",
                        userMakes: [],
                },
                user_auth: {
                        username: "",
                        email: "",
                        password: ""
                },
                request: "hide",
                authModal: false,
                authType: "up",
                uneditedPhotoNames: {},
                uneditedFileNames: {},
                newMake: {                       
                        title: "",
                        descriptions: "",
                        photos: [],
                        files: [],
                        components: "",
                        printerSetup: [],
                        likes: [],
                        user: ""
                },
                newPrintSetup: {
                        title: "",
                        user: "",
                        nozzleTemp: "",
                        bedTemp: "",
                        layerThickness: "",
                        printSpeed: "",
                        other: "",
                        likes: "",
                },
                signOut: false,
        }
    },
    methods : {
            getMakes: function() {
                    fetch(`${URL}/blueprints/`)
                            .then(response => response.json()).then((data) => {
				console.log("Dee response: ", data);
                                for (item of data) {
                                        this.uneditedPhotoNames[item._id] = item.photos;
                                        this.uneditedFileNames[item._id] = item.files;
                                        let updatedPhotos = []
                                        for (photo of item.photos) {
                                                updatedPhotos.push(`${URL}/imagedownload/${photo}`)
						console.log("Photots: ", photo);
                                        }
                                        item.photos = updatedPhotos
                                }
                                for (item of data) {
                                        let updatedFiles = []
                                        for (file of item.files) {
                                                updatedFiles.push(`${URL}/filedownload/${file}`)
                                        }
                                        item.files = updatedFiles
                                }
                                    this.makes = data;
				    console.log(this.makes);
				    console.log("Why am I here?");
                            })
            },
            updateMake: function(make) {

                var updatedMake = {
                        _id: make._id,
                        title: make.title,
                        description: make.description,
                        photos: this.uneditedPhotoNames[make._id],
                        files: this.uneditedFileNames[make._id],
                        components: make.components,
                        printSetup: make.printSetup,
                        likes: make.likes,
                        user: make.user
                };

                console.log(updatedMake)

                var myHeaders = new Headers();
                myHeaders.append("Content-Type" , "application/json");
                var options = {
                        method: "PUT",
                        body: JSON.stringify(updatedMake),
                        headers: myHeaders
                };

                var makeId = updatedMake._id;
                fetch(`${URL}/blueprints/${makeId}` , options)
                .then((response) => {
                        if (response.status == 200) {
                                console.log("Make Updated")
                        }
                        else {
                                alert("Unable to Update Make")
                        }
                })
            },
            updatePrintSetup: function(printer) {

                var updatedPrintSetup = {
                        _id: printer._id,
                        title: printer.title,
                        user: printer.user,
                        nozzleTemp: printer.nozzleTemp,
                        bedTemp: printer.bedTemp,
                        layerThickness: printer.layerThickness,
                        printSpeed: printer.printSpeed,
                        other: printer.other
                };

                console.log(updatedPrintSetup)

                var myHeaders = new Headers();
                myHeaders.append("Content-Type" , "application/json");
                var options = {
                        method: "PUT",
                        body: JSON.stringify(updatedPrintSetup),
                        headers: myHeaders
                };

                var printerId = updatedPrintSetup._id;
                fetch(`${URL}/printers/${printerId}` , options)
                .then((response) => {
                        if (response.status == 200) {
                                console.log("Printer setup Updated")
                        }
                        else {
                                alert("Unable to Update Printer setup")
                        }
                })
            },
            uploadFile: function() {
                var formData = new FormData(fileData);
                options = {
                        method: "POST",
                        body: formData,
                };

                fetch(`${URL}/files` , options)
                .then(response => response.json())
                .then(data => {
                        var info = document.querySelector("#fileData");
                        info.reset();
                        return data.filename;
                })
            },
            uploadPhoto: function() {
                var formData = new FormData(imgData);
                options = {
                        method: "POST",
                        body: formData,
                };

                fetch(`${URL}images` , options)
                .then(response => response.json())
                .then(data => {
                        var info = document.querySelector("#imgData");
                        info.reset();
                        return data.filename;
                })
            },
            createMake: function() {
                filename = this.uploadFile();
                photoName = this.uploadPhoto();

                this.newMake.photos.push(photoName);
                this.newMake.files.push(filename);
                this.newMake.user = this.current_user.userId;
                this.newMake.printSetup = [this.newPrintSetup]

                var myHeaders = new Headers();
                myHeaders.append("Content-Type" , "application/json");

                console.log(this.newMake)

                var options = {
                        method: "POST",
                        body: this.newMake,
                        headers: myHeaders
                };

                fetch(`${URL}/blueprints` , options)
                .then((response) => {
                        if (response.status == 201) {
                                console.log("Blueprint Created")
                        }
                        else {
                                alert("Unable to Create Blueprint")
                        }
                })

            },
            createPrintSetup: function() {
                this.newPrintSetup.user = current_user.userId;
                this.likes = [];

            },
	    viewMake: function(make) {
		    this.page = 'viewMake';
                    this.selectedMake = make;
	    },
            likePrintSetup: function(printer) {
                if (this.current_user.username == "") {
                        this.signInRequest
                        return
                }
                else {
                        index = printer.likes.indexOf(this.current_user.username);
                        if (index < 0) {
                                printer.likes.push(this.current_user.username);
                                this.updatePrintSetup(printer);
                        } else {
                                printer.likes.splice(index, 1);
                                this.updatePrintSetup(printer);
                        }
                }
            },
	    likeMake: function(make) {
                if (this.current_user.username == "") {
                        this.signInRequest()
                        return
                }
                else {
                        index = make.likes.indexOf(this.current_user.username);
                        if (index < 0) {
                                make.likes.push(this.current_user.username);
                                this.updateMake(make);
                        }
                        else {
                                make.likes.splice(index, 1);
                                this.updateMake(make);
                        }
                }
	    },
            signInRequest: function() {
                this.request = "show"
                setTimeout(() => {
                        this.request = "hide"
                }, 3000)
        },
	    displayPrintDetails: function() {
                if (this.showPrintDetails == "hidden") {
                        this.showPrintDetails = "shown";
                } else if (this.showPrintDetails =="shown") {
                        this.showPrintDetails = "hidden";
                }
	    },
	    home: function() {
                // will need to be changed when sign in is functional
                this.selectedMake = [];
                this.authModal = false;
                this.page = "home"
	    },
            toSignIn: function () {
                this.authModal = true;
                this.authType = "in";
            },
            toSignUp: function() {
                this.authModal = true;
                this.authType = "up"
            },
            signup: function() {
                var myHeaders = new Headers();
                myHeaders.append("Content-Type" , "application/json");

                var options = {
                        method: "POST",
                        headers: myHeaders,
                        body: JSON.stringify(this.user_auth)
                };

                fetch(`${URL}/users`, options)
                .then((response) => {
                        if (response.status === 201) {
                                console.log("Signup Complete")
                                this.createSession()
                        }
                        else {
                                alert("Could not Create User")
                        }
                })
            },
            createSession: function() {
                var myHeaders = new Headers();
                myHeaders.append("Content-Type" , "application/json");

                var options = {
                        method: "POST",
                        headers: myHeaders,
                        body: JSON.stringify(this.user_auth),
                        credentials: 'include'
                };

                fetch(`${URL}/session`, options)
                .then((response) => {
                        if (response.status === 201) {
                                response.text().then(data => {
                                        if (data) {
                                                data = JSON.parse(data);
                                                this.page = "home",
                                                this.authModal = false,
                                                this.current_user.userId = data.userId
                                                this.current_user.username = data.username
                                                this.current_user.email = this.user_auth.email;
                                                for (make of this.makes) {
                                                        if (this.current_user.userId === make.user._id) {
                                                                this.current_user.userMakes.push(make)
                                                        }
                                                };
                                                this.user_auth = {
                                                        username: "",
                                                        email: "",
                                                        password: "",
                                                }
                                        }
                                        else {
                                                alert("Cannot Log In")
                                        }
                                })
                        }
                        else {
                                alert("Could not create session")
                        }
                })
            },
            signOutModal: function() {
                this.signOut = !this.signOut
            },
            signOutUser: function() {
                var options = {
                        method: "DELETE",
                        credentials: "include",
                    };
        
                    fetch(`${URL}/session`, options).then(response => {
                        this.page = "home";
                        this.current_user = {
                                userId: "",
                                username: "",
                                email: "",
                                password: "",
                                userMakes: [],
                        };
                    })
                    this.signOut = false;
            },
            viewYourMakes: function() {
                this.page = 'yourMakes'
            },
            toCreate: function() {
                this.page = "create"
            }
    },
    created : function() {
	    this.getMakes();
    },
    watch: {
        search(newSearch, oldSearch) {
                this.filteredMakes = this.makes.filter((make) => {
                        return make.title.toLowerCase().includes(newSearch.toLowerCase());
                });
        }
},
}).mount("#app");
