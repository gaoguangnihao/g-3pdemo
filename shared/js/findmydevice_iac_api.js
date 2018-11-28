/* exported IAC_API_WAKEUP_REASON_ENABLED_CHANGED */
/* exported IAC_API_WAKEUP_REASON_TRY_DISABLE */
/* exported IAC_API_WAKEUP_REASON_LOGIN */
/* exported IAC_API_WAKEUP_REASON_LOGOUT */
/* exported IAC_API_WAKEUP_REASON_STALE_REGISTRATION */
/* exported IAC_API_WAKEUP_REASON_LOCKSCREEN_CLOSED */
/* global IAC_API_WAKEUP_REASON_PROCESS_COMMAND */
/* exported wakeUpFindMyDevice */

'use strict';

const IAC_API_WAKEUP_REASON_ENABLED_CHANGED = 0;
const IAC_API_WAKEUP_REASON_STALE_REGISTRATION = 1;
const IAC_API_WAKEUP_REASON_LOGIN = 2;
const IAC_API_WAKEUP_REASON_LOGOUT = 3;
const IAC_API_WAKEUP_REASON_TRY_DISABLE = 4;
const IAC_API_WAKEUP_REASON_LOCKSCREEN_CLOSED = 5;
const IAC_API_WAKEUP_REASON_PROCESS_COMMAND = 6;

function wakeUpAntitheft(reason, command) {
  var data = {};
  data.reason = reason;
  data.command = command;
  navigator.mozApps.getSelf().onsuccess = function() {
    var app = this.result;
    app.connect('antitheft-wakeup').then(function(ports) {
      ports[0].postMessage(data);
    });
  };
}
