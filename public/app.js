Vue.createApp({
    data() {
        return {
		page: "home",
		makes: [],
		filteredMakes: [],
		selectedMake: [],
		search: ""
        }
    },
    methods : {
            getMakes: function() {
                    fetch("http://localhost:8080/blueprints/")
                            .then(response => response.json()).then((data) => {
                                    this.makes = data;
				    console.log(this.makes);
                            })
            },
	    viewMake: function(make) {
		    this.page = 'viewMake';
		    console.log(make);
	    },
	    likeMake: function() {
		    console.log("This likes a make");
	    },
	    downloadMake: function() {
		    console.log("This downloads a make");
	    },
	    home: function() {
		    console.log("This takes to home page");
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
