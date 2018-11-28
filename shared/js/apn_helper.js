/**
 * @fileoverview This file provides common helper functions used to manipulate
 *               access point names (APNs)
 */

/* exported ApnHelper */

(function(exports) {
  'use strict';

  /**
   * Get an APN from the specified list which is compatible with the specified
   * MCC, MNC and connection type
   *
   * @param {Object} list The global APN list, the format should be the same as
   *        the one used in apn.json
   * @param {Integer} mcc The mobile country code
   * @param {Integer} mnc The mobile network code
   * @param {String} type The network type which the filtered APNs must be
   *                 compatible with
   *
   * @return {Array} A list of compatible APNs
   */
  function ah_getCompatible(list, mcc, mnc, type) {
    var apns = list[mcc] ? (list[mcc][mnc] || []) : [];
    return apns;
  }

  function ah_getAll(list, mcc, mnc) {
    var apns = list[mcc] ? (list[mcc][mnc] || []) : [];

    return apns;
  }

  var ApnHelper = {
    getCompatible: ah_getCompatible,
    getAll: ah_getAll
  };

  exports.ApnHelper = ApnHelper;
})(this);
