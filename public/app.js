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
            }
    },
    created : function() {
	    this.getMakes();
    }
}).mount("#app");
