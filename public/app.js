Vue.createApp({
    data() {
        return {
		makes: []
        }
    },
    methods : {
            getMakes: function() {
                    fetch("http://localhost:8080/blueprints/")
                            .then(response => response.json()).then((data) => {
                                    this.makes = data;
                            })
            },
	    viewMake: function() {
		    console.log("This takes to new page");
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
    }
}).mount("#app");
