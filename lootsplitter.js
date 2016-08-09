

(function (exports) {

    // var fleetMember = Vue.extend({
        
    // })

    exports.app = new Vue({

        // the root element that will be compiled
        el: '#splitterapp',

        // app initial state
        data: {
            fleet: {},
            newFleetMember: '',
            iskAmounts: [],
            evepraisals: [],
            newValue: '',
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
                return (this.totalEvepraisalsBuy + this.totalEvepraisalsSell) / 2;
            },

            totalValue: function() {
                return this.totalIskAmounts + this.totalEvepraisalsAvg;
            },

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
                    this.fleet = Object.assign({}, this.fleet, {[name]: 1});
                }
                this.newFleetMember = '';
            },

            removeFleetMember: function(memberName) {
                Vue.delete(this.fleet, memberName);
            },

            addValue: function() {
                var value = this.newValue && this.newValue.trim();
                if (!value) {
                    return;
                } else if (/https?:\/\/evepraisal\.com\/e\/\d+/.test(this.newValue)) {
                    alert('evepraisal: ' + this.newValue);
                    this.addEvepraisal();
                } else if (/^\d*\.?\d+$/.test(this.newValue)) {
                    // alert(parseFloat(this.newValue));
                    this.addIskAmount();
                } else {
                    console.log('Invalid value input.');
                }
            },

            addIskAmount: function() {
                this.iskAmounts.push([parseFloat(this.newValue)]);
                this.newValue = '';
            },

            removeIskAmount: function(iskAmount) {
                this.iskAmounts.$remove(iskAmount);
            },

            demoAddEvepraisal: function(url) {
                this.newValue = url;
                this.addEvepraisal();
            },

            addEvepraisal: function() {

                function addEvepraisalAJAX(url, callbackFunction) {
                    $.ajax({
                        dataType: 'json',
                        url: 'https://crossorigin.me/' + url + '.json',
                        success: function(data) {
                            callbackFunction(data);
                        }
                    });
                }

                addEvepraisalAJAX(this.newValue.trim(), $.proxy(function(data) {
                    this.evepraisals.push(data);
                }, this));

                this.newValue = '';
            },

            removeEvepraisal: function(evepraisal) {
                this.evepraisals.$remove(evepraisal);
            },

            memberPercent: function(memberShares) {
                if (memberShares) {
                    return memberShares / this.totalShares * 100;
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
