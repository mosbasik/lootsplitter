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
            /**
             * @returns Number of people that will receive a payout
             */
            fleetSize: function() {
                return Object.keys(this.fleet).length;
            },

            /**
             * @returns Number of equal shares the loot will be divided into
             */
            totalShares: function() {
                var sum = 0;
                for (var name in this.fleet) {
                    if (this.fleet[name]) {
                        sum += parseFloat(this.fleet[name]);
                    }
                }
                return sum;
            },

            /**
             * @returns Sum of all the submitted _raw ISK_ amounts
             */
            totalIskAmounts: function() {
                var sum = 0;
                for (var iskAmount of this.iskAmounts) {
                    sum += iskAmount[0];
                }
                return sum;
            },

            /**
             * @returns Sum of the _buy values_ of all the submitted evepraisals
             */
            totalEvepraisalsBuy: function() {
                var sum = 0;
                for (var evepraisal of this.evepraisals) {
                    sum += evepraisal.totals.buy;
                }
                return sum;
            },

            /**
             * @returns Sum of the _sell values_ of all the submitted evepraisals
             */
            totalEvepraisalsSell: function() {
                var sum = 0;
                for (var evepraisal of this.evepraisals) {
                    sum += evepraisal.totals.sell;
                }
                return sum;
            },

            /**
             * @returns Sum of the _average values_ of all the submitted evepraisals
             */
            totalEvepraisalsAvg: function() {
                return (
                    (this.totalEvepraisalsBuy + this.totalEvepraisalsSell) / 2
                );
            },

            /**
             * @returns Sum of {@link totalIskAmounts} and {@link totalEvepraisalsAvg}
             */
            totalValue: function() {
                return this.totalIskAmounts + this.totalEvepraisalsAvg;
            }
        },

        // methods that implement data logic
        methods: {
            /**
             * Get names from a parameter and add them to the fleet.
             *
             * This is a convenience wrapper around addFleetMember().
             *
             * @param {string} names - Names separated by newlines
             */
            demoAddFleetMember: function(names) {
                this.newFleetMember = names;
                this.addFleetMember();
            },

            /**
             * Get names from the input textarea and add them to the fleet.
             */
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

            /**
             * Remove a member by name from the fleet.
             *
             * @param {string} memberName - Name of fleet member to remove
             */
            removeFleetMember: function(memberName) {
                Vue.delete(this.fleet, memberName);
            },

            /**
             * Get an ISK amount or Evepraisal URL from a parameter and add it
             * to the pile of loot.
             *
             * This is a convenience wrapper around addValue().
             *
             * @param {number|string} value - ISK amount or Evepraisal URL
             */
            demoAddValue: function(value) {
                this.newValue = value;
                this.addValue();
            },

            /**
             * Get an ISK amount or an Evepraisal URL from the input textarea
             * and add it to the pile of loot.
             */
            addValue: function() {
                var value = this.newValue && this.newValue.trim();
                if (!value) {
                    return;
                }
                var lines = value.split(/\r\n|\r|\n/g);
                for (var line of lines) {
                    if (/https?:\/\/evepraisal\.com\/a\/[a-z0-9]+/.test(line)) {
                        this.addEvepraisal(line);
                    } else if (/^\d*\.?\d+$/.test(line)) {
                        this.addIskAmount(line);
                    } else {
                        console.log(
                            `Input "${line}" not recognized as an Evepraisal URL or ISK amount.`
                        );
                    }
                }
                this.newValue = "";
            },

            /**
             * Add an ISK amount to the list of ISK amounts.
             *
             * @param {number} amount - ISK amount to be added
             */
            addIskAmount: function(amount) {
                this.iskAmounts.push([parseFloat(amount)]);
            },

            /**
             * Remove an ISK amount from the list of ISK amounts
             *
             * @param {number} iskAmount - ISK amount to be be removed
             */
            removeIskAmount: function(iskAmount) {
                this.iskAmounts.$remove(iskAmount);
            },

            /**
             * Add an Evepraisal to the list of Evepraisals.
             *
             * @param {string} url - URL of the evepraisal to be added
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

            /**
             * Remove an Evepraisal to the list of Evepraisals.
             *
             * @param {Object} evepraisal - evepraisal to be removed
             */
            removeEvepraisal: function(evepraisal) {
                this.evepraisals.$remove(evepraisal);
            },

            /**
             * Compute what percent of the total number of shares a given number
             * of shares corresponds to.
             *
             * @param {number} memberShares - Given number of shares
             * @returns {number} Percent of total number of shares
             */
            memberPercent: function(memberShares) {
                if (memberShares) {
                    return (memberShares / this.totalShares) * 100;
                } else {
                    return 0;
                }
            },

            /**
             * Compute the summed ISK value of a given number of shares.
             *
             * @param {number} memberShares - Given number of shares
             * @returns {number} Summed ISK value of the given number of shares
             */
            memberPayout: function(memberShares) {
                if (memberShares) {
                    return (this.totalValue / this.totalShares) * memberShares;
                } else {
                    return 0;
                }
            }
        },

        filters: {
            /**
             * Format an amount of ISK to a nice human readable format
             *
             * @param {number} value - amount of ISK to format
             * @returns {string} amount of ISK in human readable format
             */
            iskFormat: function(value) {
                return accounting.formatMoney(value, {
                    symbol: "",
                    thousand: ",",
                    decimal: ".",
                    precision: 2,
                    format: "%v"
                });
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
