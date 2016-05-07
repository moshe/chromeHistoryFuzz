/*jshint esversion: 6 */

function set(key, value, cb) {
  chrome.storage.sync.set({[key]:value}, cb);
}

function get(key, cb) {
  chrome.storage.sync.get(key, function(items) {
  cb(items[key]);
  });
}

function setup_option(name, dflt) {
  $(`#${name}`).checkbox({
      onChecked: function() {
        set(name, true, function() {console.log('Saved');});
      },
      onUnchecked: function() {
        set(name, false, function() {console.log('Saved');});
    }});

  // Sync init state
  get(name, function(enabled) {
    if (enabled === undefined) {
      if (dflt) {
        $(`#${name}`).checkbox('check');
      } else {
        $(`#${name}`).checkbox('uncheck');
      }
    } else if (enabled) {
      $(`#${name}`).checkbox('check');
    } else {
      $(`#${name}`).checkbox('uncheck');
    }
  });
}

$( document ).ready(function() {
  setup_option('debug', false);
  setup_option('invert', false);
});
