'use strict';

(function (exports) {

  var Tab = {
    tabs: document.querySelectorAll('gaia-tabs a'),
    tabViews:['view_1', 'view_2'],

    selectedIndex: 0,  // record selected tab index

    init: function _init() {
      console.log('tab init ');
      this.selectTab(this.selectedIndex);

      window.addEventListener('keydown', (e) => {
        console.log('keydown key:', e.key);
        var index = this.selectedIndex;
        switch (e.key) {
          case 'ArrowLeft' :
          index --;
          this.selectTab(index);
          break;
          case 'ArrowRight' :
          index ++;
          this.selectTab(index);
          break;
          case 'Backspace' :
            console.log('tab key BackSpace');
            NavigationMap.navigatorBack();
            e.preventDefault();
            e.stopPropagation();
          break;
        }
      });

      // window.addEventListener('keyup', (e) => {
      //   switch(e.key) {
      //     case 'BackSpace' :
      //       console.log('BackSpace key up');
      //       e.preventDefault();
      //       e.stopPropagation();
      //     break;
      //   }
      // });
      var params = {
          items: [
            {
              name: 'tabkeyleft',
              priority: 1,
              method: () => {
                console.log('tabkeyleft clicked');
              }

            },
            {
              name: 'tabkeyright',
              priority: 3,
              method: () => {
                console.log('tabkeyright clicked');
              }
            }
          ]
        };
      this.updateSoftkey(params);
    },

    updateSoftkey: function _updateSoftkey(params) {
      App.softkey.initSoftKeyPanel(params);
      App.softkey.show();
    },


    selectTab: function _selectTab(index) {
      console.log('selectTab index', index);

      index = index < 0 ? 0 : index;
      index = index > this.tabs.length - 1 ? this.tabs.length -1 : index; 

      this.selectedIndex = index;

      this.tabs.forEach( (tab) => {
        tab.classList.remove('selected');
      });

      //hide all views
      this.tabViews.forEach( (view) => {
        document.getElementById(view).classList.add('hide');
      })

      this.tabs[index].classList.add('selected');
      document.getElementById(this.tabViews[index]).classList.remove('hide');

    }
  }


  exports.Tab = Tab;
})(window);

