
'use strict';

(function(exports){
  var App = {

    init:function() {
      console.log('app init');

      NavigationHelper.reset(
                VerticalNavigator,
                this.getControls.bind(this)
            );
      // var navInfo = {
      //   navigator: VerticalNavigator,
      //   controls: this.getControls.bind(this)
      // }
      NavigationMap.navigator('main');

      window.addEventListener('keydown', (e) => {
        console.log('keydown key:', e.key);
        switch (e.key) {
          case 'Enter':
            this.handleKeyEvent(e);
            break;

          case 'BackSpace' :

            break;
        }
      });

      //softkey
      this.initSK();
    },
    initSK: function() {
        this.defaultParams = {
          items: [
            {
              name: 'keyLeft',
              priority: 1,
              method: () => {
                console.log('softkey left clicked');
              }

            },
            {
              name: 'keyRight',
              priority: 3,
              method: () => {
                console.log('softkey right clicked');
              }
            }
          ]
        };

        this.softkey = new SoftkeyPanel(this.defaultParams);
        this.softkey.initSoftKeyPanel(this.defaultParams);
        this.softkey.show();
    },

    handleKeyEvent: function(e) {
      console.log('key target ', e.target);
      switch(e.target.id) {
        case "btn_1":
        console.log('button 1 clicked');
        Tab.init();
        NavigationMap.navigator('view');
        break;
        case "btn_2":
        console.log('button 2 clicked');
        break;
      }
    },

    getControls: function _getControls() {
      return document.querySelectorAll('#btnlist li');
    },
  }
  exports.App = App;
})(window)


navigator.mozL10n.ready(function() {
  App.init();
});