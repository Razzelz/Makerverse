const URL = "http://localhost:8080/"

Vue.createApp({
    data() {
        return {
		page: "home",
		makes: [],
		filteredMakes: [],
		selectedMake: [],
		search: "",
                current_user: {
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
                authType: "up"
        }
    },
    methods : {
            getMakes: function() {
                    fetch("http://localhost:8080/blueprints/")
                            .then(response => response.json()).then((data) => {
                                for (item of data) {
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
            updateMake: function(make) { //Not Finished
                //Need to convert image and file names back to original...RIP
                var updatedMake = make;
                var myHeaders = new Headers();
                myHeaders.append("Content-Type" , "application/json");

                var options = {
                        method: "PUT",
                        body: updatedMake,
                        headers: myHeaders
                };

                var makeId = updatedMake._id
            },
	    viewMake: function(make) {
		    this.page = 'viewMake';
                    this.selectedMake = make;
		    console.log(this.selectedMake);
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
                        }
                        else {
                                make.likes.splice(index, 1);
                        }
                }
	    },
            signInRequest: function() {
                this.request = "show"
                setTimeout(() => {
                        this.request = "hide"
                }, 3000)
        },
	    downloadMake: function() {
		    console.log("This downloads a make");
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
