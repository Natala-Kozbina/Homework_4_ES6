var app = {

    initialize: function () {
        console.info('init');
        // use - {{ }}
        _.templateSettings = {
          interpolate: /\{\{(.+?)\}\}/g
        };

        var manager = new app.Manager(document.querySelector('.list'));
        manager.initialize();
    }

};
