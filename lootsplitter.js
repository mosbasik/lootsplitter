

(function (exports) {
    exports.app = new Vue({

        // the root element that will be compiled
        el: '#splitterapp',

        // app initial state
        data: {
            fleet: [],
            newFleetMember: '',
            evepraisals: [],
            newEvepraisal: '',
        },

        // computed properties
        computed: {
            
            fleetRepr: function() {
                return JSON.stringify(this.fleet);
            },

            evepraisalsRepr: function() {
                return JSON.stringify(this.evepraisals);
            }

        },

        // methods that implement data logic
        methods: {
            
            addFleetMember: function() {
                var value = this.newFleetMember && this.newFleetMember.trim();
                if (!value) {
                    return;
                }
                this.fleet.push({name: value, split: 1});
                this.newFleetMember = '';
            },

            removeFleetMember: function(fleetMember) {
                this.fleet.$remove(fleetMember);
            },

            addEvepraisal: function() {
                var value = this.newEvepraisal && this.newEvepraisal.trim();
                if (!value) {
                    return;
                }
                this.evepraisals.push({url: value});
                this.newEvepraisal = '';
                this.$http.get(value + '.json').then((response) => {
                    console.log(response);
                }, (response) => {
                    console.log('the request failed');
                });
            },

            removeEvePraisal: function(evepraisal) {
                this.evepraisals.$remove(evepraisal);
            },

        },

        // custom directive to wait for the DOM to be updated before focusing
        // on the input field
        directives: {
            // 'fleet-member-focus': function (value) {
            //     if (!value) {
            //         return;
            //     }
            //     var el = this.el;
            //     Vue.nextTick(function() {
            //         el.focus();
            //     });
            // },
        },



    }); // end of app definition

})(window);
