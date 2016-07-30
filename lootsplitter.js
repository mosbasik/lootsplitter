

(function (exports) {

    // var fleetMember = Vue.extend({
        
    // })

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
            },

            totalShares: function() {
                var sum = 0;
                for (fleetMember of this.fleet) {
                    sum += parseFloat(fleetMember.shares);
                }
                return sum;
            },

            buyPrice: function() {
                var sum = 0
                for (evepraisal of this.evepraisals) {
                    sum += evepraisal.totals.buy;
                }
                return sum;
            },

            sellPrice: function() {
                var sum = 0
                for (evepraisal of this.evepraisals) {
                    sum += evepraisal.totals.sell;
                }
                return sum;
            },

            avgPrice: function() {
                return (this.buyPrice + this.sellPrice) / 2;
            }

        },

        // methods that implement data logic
        methods: {
            
            addFleetMember: function() {
                var value = this.newFleetMember && this.newFleetMember.trim();
                if (!value) {
                    return;
                }
                var lines = value.split(/\r\n|\r|\n/g);
                for (line of lines) {
                    this.fleet.push({name: line, shares: 1});
                }
                this.newFleetMember = '';
            },

            removeFleetMember: function(fleetMember) {
                this.fleet.$remove(fleetMember);
            },

            demoAddEvepraisal: function(url) {
                this.newEvepraisal = url;
                this.addEvepraisal();
            },

            addEvepraisal: function() {
                var value = this.newEvepraisal && this.newEvepraisal.trim();
                if (!value) {
                    return;
                }

                function addEvepraisalAJAX(url, callbackFunction) {
                    $.ajax({
                        dataType: 'json',
                        url: 'https://crossorigin.me/' + url + '.json',
                        success: function(data) {
                            callbackFunction(data);
                        }
                    });
                };

                addEvepraisalAJAX(value, $.proxy(function(data) {
                    this.evepraisals.push(data);
                }, this));

                this.newEvepraisal = '';
            },

            removeEvepraisal: function(evepraisal) {
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
