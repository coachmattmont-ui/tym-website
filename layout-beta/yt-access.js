/* Shared access helpers for the Layout Tool. List prices only. No dealer cost. */
(function (root) {
  var PRICE_FIELDS = ['price', 'list', 'unit', 'cost', 'dealer', 'dealerCost', 'fr', 'msrp'];
  function editWindowOpen(editUntil, nowMs) {
    if (!editUntil) return false;
    var t = Date.parse(editUntil);
    var now = typeof nowMs === 'number' ? nowMs : Date.now();
    return isFinite(t) && t > now;
  }
  function repriceDeviceList(devices, resolveKey) {
    return (devices || []).map(function (device) {
      var next = Object.assign({}, device);
      PRICE_FIELDS.forEach(function (key) { delete next[key]; });
      if (typeof resolveKey === 'function') {
        var key = resolveKey(next);
        if (key) next.catalogKey = key;
      }
      return next;
    });
  }
  root.YTAccess = {
    EDIT_DAYS: 30,
    editWindowOpen: editWindowOpen,
    repriceDeviceList: repriceDeviceList
  };
})(typeof window !== 'undefined' ? window : globalThis);
