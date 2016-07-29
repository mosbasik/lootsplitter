(function (exports) {

    'use strict';
    
    var STORAGE_KEY = 'lootsplitter-vuejs';

    exports.storage = {
        fetch: function () {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        },
        save: function (fleet) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(fleet));
        }
    }

})(window);