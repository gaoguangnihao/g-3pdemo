'use strict';
/* global NavigationMap, LazyLoader, SettingsListener,
 secondCall, OptionMenu
*/

const FORM_ID = 'softkeyPanel';

var SoftkeyPanel = function (actions, optionMenuCallback, area) {
  if (!actions || !actions.items || actions.items.length === 0) {
    return;
  }
  this.softKeyArea = area || document.body;
  this.subMenuNeedHide = false;

  this.initSoftKeyPanel = function (actionlList) {
    var self = this;
    if (this.handleDelay) {
      this.pause = true;
    }
    if (actionlList && actionlList.items && actionlList.items.length > 0) {
      if (this.actions && this.actions.items && this.actions.items.length > 0) {
        this.actions.clear();
      }
      this.actions = actionlList.items;
      this.header = actionlList.header || 'header';
      this.handlers.clear();

      // it is necessary to change softkey bar executing order by restart
      // the listener if the other softkey instance initialized (mainly
      // for CustomDialog)
      this.stopListener();
      initSoftkeys.call(this);
      setSoftkeys.call(this);
      this.startListener();
    }
    if (this.handleDelay) {
      setTimeout(function() {
        self.pause = false;
      }, 200);
    }
  };

  this.startListener = function () {
    window.addEventListener('keydown', this.keyDownHandler, true);
    window.addEventListener('menuChangeEvent', this.keyDownHandler);
  };

  this.stopListener = function () {
    window.removeEventListener('keydown', this.keyDownHandler, true);
    window.removeEventListener('menuChangeEvent', this.keyDownHandler);
  };

  this.keyDownHandler = (function (e) {
    if (!this.form) {
      return;
    }
    if (!this.form.classList.contains('visible') && !this.menuVisible) {
      return;
    }
    if ((e.key === 'Enter' || e.key === 'Accept') && this.menuVisible) {
      var focusedButton = this.menu.form.querySelector('.focus');
      var isSubMenu = false;
      if (focusedButton !== null) {
        isSubMenu = focusedButton.dataset.hasmenu || false;
      }
      if (this.menu && !isSubMenu) {
        closeMenu.call(this);
      }
      return;
    }
    if (this.pause) {
      return;
    }
    if (typeof NavigationMap !== 'undefined' &&
        NavigationMap.currentActivatedLength > 0) {
      return;
    }
    switch (e.key) {
    case 'BrowserSearch':
    case 'F2': //device key
    case 'SoftRight': //emulator key
      if (this.menuVisible || (!this.softKeyVisible)) {
        break;
      }
      if (this.menuStartIndex != -1) {
        openMenu.call(this);
      } else {
        callMethod.call(this, this.buttonRsk);
      }
      e.preventDefault();
      e.stopPropagation();
      break;
    case 'ContextMenu':
    case 'F1': //device key
    case 'SoftLeft': //emulator key
      if (!this.menuVisible && this.softKeyVisible) {
        callMethod.call(this, this.buttonLsk);
        e.preventDefault();
      }
      break;
      /*
      case "End": //keybord key
      case "ContextMenu": //emulator key
      console.log("RSK relized", this.buttonLsk);
        callMethod.call(this, this.buttonLsk);
        break;
        */
    case 'Enter': //keyboard key
    case 'Accept': //emulator key
      if (this.menuVisible) {
        closeMenu.call(this);
      } else {
        if (!this.softKeyVisible) {
          break;
        }
        callMethod.call(this, this.buttonCsk);
      }
      break;
    case 'BrowserBack': //emulator key
    case 'Backspace':
      if (this.menuVisible) {
        e.preventDefault();
      }
      if (this.menu && this.menu.subMenuDisplayed) {
        this.subMenuNeedHide = true;
      }
      closeMenu.call(this);
      break;
    }
    if (e.detail !== null) {
      switch (e.detail.action) {
        case 'closeMenu':
          closeMenu.call(this);
          break;
      }
    }
  }).bind(this);

  function createForm(formId) {
    var form = document.createElement('form');
    form.id = formId;
    form.dataset.type = this.actions.type || 'action';
    form.className = 'skbar';
    form.classList.add('none-paddings');
    form.setAttribute('data-z-index-level', 'softkeyPanel');
    form.addEventListener('submit', function (event) {
      event.preventDefault();
    });

    //add/remove
    form.addEventListener('transitionend', function (event) {
      if (event.target !== form) {
        return;
      }
      if (!form.classList.contains('visible') && form.parentNode) {
        if (this.softKeyArea) {
          this.softKeyArea.removeChild(form);
        } else {
          document.body.removeChild(form);
        }
      }
    }.bind(this));
    return form;
  }

  this.createPanel = function (form) {
    var lskDiv = document.createElement('div');
    var cskDiv = document.createElement('div');
    var rskDiv = document.createElement('div');

    this.buttonLsk = document.createElement('button');
    this.buttonLsk.className = 'sk-button';
    this.buttonLsk.setAttribute('id', 'software-keys-left');

    this.buttonCsk = document.createElement('button');
    this.buttonCsk.className = 'sk-button';
    this.buttonCsk.setAttribute('id', 'software-keys-center');

    this.buttonRsk = document.createElement('button');
    this.buttonRsk.className = 'sk-button';
    this.buttonRsk.setAttribute('id', 'software-keys-right');

    form.appendChild(lskDiv);
    form.appendChild(cskDiv);
    form.appendChild(rskDiv);

    lskDiv.appendChild(this.buttonLsk);
    cskDiv.appendChild(this.buttonCsk);
    rskDiv.appendChild(this.buttonRsk);

    initSoftkeys.call(this);
    setSoftkeys.call(this);
    this.startListener();
  };

  function initSoftkeys() {
    var lskReady = false;
    var cskReady = false;
    var rskReady = false;
    //reset indexes
    this.menuStartIndex = -1;
    this.lskIndex = -1;
    this.cskIndex = -1;
    this.rskIndex = -1;

    for (var i = 0; i < this.actions.length; i++) {
      var curPriority = this.actions[i].priority;
      if (curPriority < this.menuActionsPriority) {
        // trying to initialize softkeys, if they are not initialized yet
        if (!lskReady && curPriority == this._lskPriority) {
          this.lskIndex = i;
          lskReady = true;
        } else if (!cskReady && curPriority == this._cskPriority) {
          this.cskIndex = i;
          cskReady = true;
        } else if (!rskReady) {
          if (i == (this.actions.length - 1)) {
            this.rskIndex = i;
          } else {
            // there are > 1 items in the actions list left:
            // - assign 'Options' to RSK and move tail to menu actions.
            this.menuStartIndex = i;
          }
          rskReady = true;
          break;
        } else {
          console.warn('no SK for set actions');
        }
      } else {
        if (!rskReady) {
          // there are no more actions with sufficient priorities in list
          // - assign 'Options' to RSK and move tail to menu actions.
          this.menuStartIndex = i;
          rskReady = true;
          break;
        }
      }
    }
  }

  function setSoftkeys() {
    function getSkHtml(item) {
      var name = item.l10nId ? navigator.mozL10n.get(item.l10nId) : item.name;
      try {
        return item.icon
          ? (`<span data-name="${name}" data-icon="${item.icon}">${item.iconMixedText ? name : ''}</span>`)
          : name;
      } catch (e) {
        console.warn(e);
        return name;
      }
    }

    function setButton(handlers, skBtn, menuItem, index) {
      var needDisable = true;
      if (index !== -1) {
        handlers.set(skBtn, menuItem);
        needDisable = menuItem.disabled || false;
        if (menuItem.l10nId && menuItem.priority !== 2 && !menuItem.icon) {
          skBtn.setAttribute('data-l10n-id', menuItem.l10nId);
        }
        skBtn.innerHTML = getSkHtml(menuItem);
      } else {
        skBtn.innerHTML = '';
      }
      disableSk(skBtn, needDisable);
    }

    // update LSK
    setButton(this.handlers, this.buttonLsk, this.actions[this.lskIndex], this.lskIndex);

    //update CSK
    setButton(this.handlers, this.buttonCsk, this.actions[this.cskIndex], this.cskIndex);

    // update RSK
    if (this.menuStartIndex !== -1) {
      this.buttonRsk.setAttribute('data-l10n-id', 'softkey-options');
      this.buttonRsk.innerHTML = navigator.mozL10n.get('softkey-options') || 'Options';
      disableSk(this.buttonRsk, false);
    } else {
      setButton(this.handlers, this.buttonRsk, this.actions[this.rskIndex], this.rskIndex);
    }
    modifyAllString.call(this);
  }

  function callMethod(button) {
    var action = this.handlers.get(button);

    if (typeof action !== 'undefined') {
      var method = action.method || function () {};

      method.apply(null, action.params || []);

      if (typeof this.actions.complete === 'function' && !action.incomplete) {
        this.actions.complete();
      }
    }
  }

  function closeMenu() {
    if (this.menu) {
      var promise = this.menu.hide();
      promise && promise.then(() => {
        if (this.menu.subMenuDisplayed || this.subMenuNeedHide) {
          this.subMenuNeedHide = false;
          secondCall = false;
        } else {
          this.menuVisible = false;
          setSoftkeys.call(this);
          document.dispatchEvent(this.menuHideEvent);
          window.dispatchEvent(this.menuHideEvent);
        }
      });
    }
  }
  this.hideMenu = function () {
    closeMenu.call(this);
  };

  function openMenu() {
    setOptionMenuSk.call(this);

    var promise;
    var om_params;
    om_params = {
      header: this.header,
      items: this.actions.slice(this.menuStartIndex).sort((a, b) => {
        return a.priority - b.priority;
      }),
      classes: ['group-menu', 'softkey'],
      menuClassName: this.menuClassName
    };
    if (typeof OptionMenu == 'undefined') {
      LazyLoader.load(['/shared/js/option_menu.js',
        '/shared/style/action_menu.css',
        '/shared/style/option_menu.css'
      ], () => {
        this.menu = new OptionMenu(om_params, this.optionMenuCallback);
        promise = this.menu.show();
        promise && promise.then(() => {
          setOptionMenuSk.call(this);
          document.dispatchEvent(this.menuShowEvent);
          window.dispatchEvent(this.menuShowEvent);
        });
      });
    } else {
      //if(!this.menu)
      secondCall = false;
      this.menu = new OptionMenu(om_params, this.optionMenuCallback);
      promise = this.menu.show();
      promise && promise.then(() => {
        setOptionMenuSk.call(this);
        document.dispatchEvent(this.menuShowEvent);
        window.dispatchEvent(this.menuShowEvent);
      });
    }
    this.menuVisible = true;
  }

  function setOptionMenuSk() {
    this.buttonLsk.innerHTML = '';
    disableSk(this.buttonLsk, true);
    this.buttonCsk.innerHTML = navigator.mozL10n.get("select");
    disableSk(this.buttonCsk, false);
    this.buttonRsk.innerHTML = '';
    disableSk(this.buttonRsk, true);
  }

  function disableSk(skBtn, isDisabled) {
    var alreadyDisabled = skBtn.hasAttribute('disabled');
    if (isDisabled && !alreadyDisabled) {
      skBtn.setAttribute('disabled', 'disabled');
    } else if (!isDisabled && alreadyDisabled) {
      skBtn.removeAttribute('disabled');
    }
  }
  this.handlers = new Map();
  this.menuActionsPriority = 4;
  this.actions = actions.items;
  this.header = actions.header || 'header';
  this.optionMenuCallback = optionMenuCallback;
  this.handleDelay = !!actions.handleDelay;
  this.pause = false;
  this.menuClassName = actions.menuClassName;
  if (this.menuClassName === undefined) {
    this.menuClassName = 'menu-button';
  }
  this.menu = null;
  this.menuShowEvent = new CustomEvent('menuEvent', {
    detail: {
      softkeyPanel: this,
      menuName: this.menuClassName,
      menuVisible: true
    }
  });
  this.menuHideEvent = new CustomEvent('menuEvent', {
    detail: {
      softkeyPanel: this,
      menuName: this.menuClassName,
      menuVisible: false
    }
  });
  this.menuVisible = false;
  this.softKeyVisible = false;
  this._lskPriority = 1;
  this._cskPriority = 2;
  this.form = createForm.call(this, FORM_ID);

  this.createPanel(this.form);
  this.getLeftKey = function () {
    return this.buttonLsk;
  };
  this.getRightKey = function () {
    return this.buttonRsk;
  };
  this.getCenterKey = function () {
    return this.buttonCsk;
  };
};

SoftkeyPanel.prototype.show = function () {

  if (!this.form.parentNode) {
    if (this.softKeyArea) {
      this.softKeyArea.appendChild(this.form);
    } else {
      document.body.appendChild(this.form);
    }
    this.form.clientTop;
  }
  this.form.classList.remove('inactive');
  this.form.classList.add('visible', 'focused');

  this.softKeyVisible = true;
  this.form.focus();
};

function modifyAllString() {
  var keysInfo = [];

  if (this.buttonLsk.innerHTML.length > 0) {
    // get string from button before modifyString.
    keysInfo.push(getInfoFromButton(this.buttonLsk, this));
  }

  if (this.buttonCsk.innerHTML.length > 0) {
    // get string from button before modifyString.
    keysInfo.push(getInfoFromButton(this.buttonCsk, this));
  }

  if (this.buttonRsk.innerHTML.length > 0) {
    // get string from button before modifyString.
    keysInfo.push(getInfoFromButton(this.buttonRsk, this));
  }
  // registerKeys via softkeyManager
  registerSoftkeys(keysInfo);
}

function getInfoFromButton(targetElement, self) {
  var info = {};
  var childElement;
  switch(targetElement) {
    case self.buttonLsk:
      info.code = 'SoftLeft';
      break;
    case self.buttonCsk:
      info.code = 'Enter';
      break;
    case self.buttonRsk:
      info.code = 'SoftRight';
      break;
  }

  childElement = targetElement.querySelector('span');
  if (childElement) {
    var elementName = childElement.dataset.name;
    info.options = {
      'name': (elementName)? elementName : '',
      'icon': childElement.dataset.icon
    };
  } else {
    info.options = {
      'name': targetElement.textContent,
      'icon': ''
    };
  }

  return info;
}

function registerSoftkeys(keysInfo) {
  // registerKeys via softkeyManager
  if(keysInfo && navigator.softkeyManager) {
    navigator.softkeyManager.registerKeys(keysInfo);
  }

}

//todo Method doesn't work
SoftkeyPanel.prototype.hide = function () {
  this.form.classList.remove('visible', 'focused');
  this.softKeyVisible = false;
};

SoftkeyPanel.prototype.destroy = function () {
  if (this.softKeyArea) {
    this.softKeyArea.removeChild(this.form);
  } else {
    document.body.removeChild(this.form);
  }
  this.form = null;
  this.stopListener();
  this.softKeyVisible = false;
  this.menuVisible = false;
};
