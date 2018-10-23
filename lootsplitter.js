(function(exports) {
    // var fleetMember = Vue.extend({
    // What is this?
    // })

    exports.app = new Vue({
        // the root element that will be compiled
        el: "#splitterapp",

        // app initial state
        data: {
            fleet: {},
            newFleetMember: "",
            iskAmounts: [],
            evepraisals: [],
            newValue: ""
        },

        // computed properties
        computed: {
            fleetSize: function() {
                return Object.keys(this.fleet).length;
            },

            totalShares: function() {
                var sum = 0;
                for (var name in this.fleet) {
                    if (this.fleet[name]) {
                        sum += parseFloat(this.fleet[name]);
                    }
                }
                return sum;
            },

            totalIskAmounts: function() {
                var sum = 0;
                for (var iskAmount of this.iskAmounts) {
                    sum += iskAmount[0];
                }
                return sum;
            },

            totalEvepraisalsBuy: function() {
                var sum = 0;
                for (var evepraisal of this.evepraisals) {
                    sum += evepraisal.totals.buy;
                }
                return sum;
            },

            totalEvepraisalsSell: function() {
                var sum = 0;
                for (var evepraisal of this.evepraisals) {
                    sum += evepraisal.totals.sell;
                }
                return sum;
            },

            totalEvepraisalsAvg: function() {
                return (
                    (this.totalEvepraisalsBuy + this.totalEvepraisalsSell) / 2
                );
            },

            totalValue: function() {
                return this.totalIskAmounts + this.totalEvepraisalsAvg;
            }
        },

        // methods that implement data logic
        methods: {
            demoAddFleetMember: function(names) {
                this.newFleetMember = names;
                this.addFleetMember();
            },

            addFleetMember: function() {
                var value = this.newFleetMember && this.newFleetMember.trim();
                if (!value) {
                    return;
                }
                var lines = value.split(/\r\n|\r|\n/g);
                for (var name of lines) {
                    this.fleet = Object.assign({}, this.fleet, { [name]: 1 });
                }
                this.newFleetMember = "";
            },

            removeFleetMember: function(memberName) {
                Vue.delete(this.fleet, memberName);
            },

            demoAddValue: function(value) {
                this.newValue = value;
                this.addValue();
            },

            addValue: function() {
                var value = this.newValue && this.newValue.trim();
                if (!value) {
                    return;
                }
                var lines = value.split(/\r\n|\r|\n/g);
                for (var line of lines) {
                    if (/https?:\/\/evepraisal\.com\/e\/\d+/.test(line)) {
                        this.addEvepraisal(line);
                    } else if (/^\d*\.?\d+$/.test(line)) {
                        this.addIskAmount(line);
                    } else {
                        console.log("Invalid value input.");
                    }
                }
                this.newValue = "";
            },

            addIskAmount: function(amount) {
                this.iskAmounts.push([parseFloat(amount)]);
            },

            removeIskAmount: function(iskAmount) {
                this.iskAmounts.$remove(iskAmount);
            },

            /**
             * Add an Evepraisal to the list of Evepraisals
             * @param url URL of the evepraisal being added
             */
            addEvepraisal: function(url) {
                /**
                 * URL of CORS proxy (needed b/c Evepraisal lacks CORS support)
                 *
                 * This is a list of other proxies in case this one goes down:
                 * https://gist.github.com/jimmywarting/ac1be6ea0297c16c477e17f8fbe51347
                 * (and there is always the option of hosting our own).
                 */
                var proxyUrl = "https://cors-anywhere.herokuapp.com/";

                axios
                    .get(`${proxyUrl}${url}.json`, {
                        headers: {
                            "User-Agent": "mosbasik.github.io/lootsplitter"
                        }
                    })
                    .then(response => {
                        // handle success
                        this.evepraisals.push(response.data);
                    })
                    .catch(error => {
                        // handle failure
                        console.log(error);
                    });
            },

            removeEvepraisal: function(evepraisal) {
                this.evepraisals.$remove(evepraisal);
            },

            memberPercent: function(memberShares) {
                if (memberShares) {
                    return (memberShares / this.totalShares) * 100;
                } else {
                    return 0;
                }
            },

            memberPayout: function(memberShares) {
                if (memberShares) {
                    return (this.totalValue / this.totalShares) * memberShares;
                } else {
                    return 0;
                }
            }
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
        }
    }); // end of app definition
})(window);
