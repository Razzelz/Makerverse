const URL = "http://localhost:8080/"

Vue.createApp({
    data() {
        return {
		page: "create",
                showPrintDetails: "hidden",
		makes: [],
		filteredMakes: [],
		selectedMake: [],
		search: "",
                current_user: {
                        userId : "",
                        username: "",
                        email: "",
                        password: ""
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
                }
        }
    },
    methods : {
            getMakes: function() {
                    fetch("http://localhost:8080/blueprints/")
                            .then(response => response.json()).then((data) => {
                                for (item of data) {
                                        this.uneditedPhotoNames[item._id] = item.photos;
                                        this.uneditedFileNames[item._id] = item.files;
                                        let updatedPhotos = []
                                        for (photo of item.photos) {
                                                updatedPhotos.push(URL + "imagedownload/" + photo)
                                        }
                                        item.photos = updatedPhotos
                                }
                                for (item of data) {
                                        let updatedFiles = []
                                        for (file of item.files) {
                                                updatedFiles.push(URL + "filedownload/" + file)
                                        }
                                        item.files = updatedFiles
                                }
                                    this.makes = data;
				    console.log(this.makes);
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
                fetch(`http://localhost:8080/blueprints/${makeId}` , options)
                .then((response) => {
                        if (response.status == 200) {
                                console.log("Make Updated")
                        }
                        else {
                                alert("Unable to Update Make")
                        }
                })
            },
            uploadFile: function() {
                var formData = new FormData(fileData);
                options = {
                        method: "POST",
                        body: formData,
                };

                fetch(URL + "files" , options)
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

                fetch(URL + "images" , options)
                .then(response => response.json())
                .then(data => {
                        var info = document.querySelector("#imgData");
                        info.reset();
                        return data.filename;
                })
            },
            createMake: function() {
                filename = uploadFile();
                photoName = uploadPhoto();

                newMake.photos.push(photoName);
                newMake.files.push(filename);
                newMake.user = current_user.userId;

                var myHeaders = new Headers();
                myHeaders.append("Content-Type" , "application/json");

                var options = {
                        method: "POST",
                        body: newMake,
                        headers: myHeaders
                };

                fetch("http://localhost:8080/blueprints" , options)
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
		    console.log(this.selectedMake);
	    },
            likePrintSetup: function(printSetup) {
                if (this.current_user.username == "") {
                        this.signInRequest
                        return
                }
                else {
                        
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
	    },
	    home: function() {
                // will need to be changed when sign in is functional
                this.selectedMake = [];
                this.authModal = false;
                this.page = "home"
		    console.log("This takes to home page");
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

                fetch(URL + "users", options)
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

                fetch(URL + "session", options)
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
}
}).mount("#app");
