/* global NavigationHelper */
'use strict';

(function(exports) {
  var NavigationMap = {
    preView: null,
    currentView : null,

    init: function() {
      window.addEventListener('panelready', this.panelReadyHandler.bind(this));
    },

    registerPanelNavigation: function(navInfo) {
      var bootFocusElement = NavigationHelper.reset(
          navInfo.navigator,
          navInfo.controls,
          navInfo.defaultFocusIndex,
          navInfo.curViewId,
          navInfo.noSetfocus
      );

      return bootFocusElement;
    },

    focusChanged: function(element) {
      element.focus();
      // XXX: Code like this, put scroll func into event queue, only
      // run scroll when main process free.
      setTimeout(() => {element.scrollIntoView(true);});
    },

    scrollToElement: function(element, event) {
      NavigationHelper.scrollToElement(element, event, 50, 40);
    },


    panelReadyHandler: function(event) {
      var navInfo = event.detail;
      var panel = navInfo.panel;
      this.focusedElement = this.registerPanelNavigation(navInfo);
      if (this.focusedElement) {
        this.focusChanged(this.focusedElement);

        if (panel.CLASS_NAME !== 'BasePanel') {
          panel.ready = true;
        }
      }
    },

    navigator: function(id) {
      console.log('navigator ', id);
      this.preView = this.currentView;
      this.currentView = id ? id : 'main';

      if (this.preView) {
        document.getElementById(this.preView).classList.add('hide');
      }
      document.getElementById(this.currentView).classList.remove('hide');
    },

    navigatorBack: function() {
      console.log('navigatorBack');
      if (this.currentView) {
        document.getElementById(this.currentView).classList.add('hide');
      }
      if (this.preView) {
        this.currentView = this.preView;
        document.getElementById(this.currentView).classList.remove('hide');
      }
    }
  };

  exports.NavigationMap = NavigationMap;
}(window));
