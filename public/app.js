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
                        username: "0",
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
	    viewMake: function(make) {
		    this.page = 'viewMake';
                    this.selectedMake = make;
		    console.log(this.selectedMake);
	    },
	    likeMake: function(make) {
                if (this.current_user.username = "0") {
                        this.signInRequest()
                        return
                }
                else {
                        index = make.likes.indexOf(this.current_user.username);
                        if (index < 0) {
                                make.likes.append(this.current_user.username);
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
}
}).mount("#app");
