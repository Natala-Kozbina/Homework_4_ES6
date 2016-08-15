app.Storage = (function (window, _) {

    function toSTR(data) {
        return JSON.stringify(data);
    }

    function toJSON(data) {
        return JSON.parse(data);
    }

    function Storage(type) {
        this.storage = window.localStorage;
        this.tempStorage = [];
        return this;
    }

    Storage.prototype = {

        set: function (value) {
            this.tempStorage.unshift(value);
        },

        getData: function () {
            return this.tempStorage;
        },

        getById: function (id) {
            var result;
            
            this.tempStorage.some(function (el) {
                var isValidId = el.id === id;
                if (isValidId) {
                    result = el;
                }

                return isValidId;
            });
            
            return result;
        },

        save: function () {
            localStorage.setItem('persons', toSTR(this.tempStorage));
        },

        load: function () {
            var data = localStorage.getItem('persons');

            if (data) {
                this.tempStorage = toJSON(data);
            } else {
                this.tempStorage = [];
            }
        },

        clearLocalStorage: function () {
            localStorage.clear();
            this.tempStorage = [];
        },

        cancelTempStorage: function () {
            //localStorage.clear();
            this.tempStorage = [];
        }


    };

    return Storage;

} (window, _));


//localStorage.clear();