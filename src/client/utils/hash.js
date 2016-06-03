
/**
 * @prototype Hash
 * This prototype contains methods to manipulate the hash of the web page
 */
export let hash = {
  _callbacks: [],
  _prevHash: '',

  /**
   * get an object value with all parameters in the hash
   * @return {Object} query    object containing key/values
   */
  getAll: function () {
    var str = window.location.hash.substring(1) // skip the # character
    var params = str.split('&')
    var query = {}
    for (var i = 0, iMax = params.length; i < iMax; i++) {
      var keyvalue = params[i].split('=')
      if (keyvalue.length >= 2) {
        var key = decodeURIComponent(keyvalue.shift())
        var value = decodeURIComponent(keyvalue.join('='))
        query[key] = value
      }
    }
    return query
  },

  /**
   * Register a callback function which will be called when the hash of the web
   * page changes.
   * @param {String | '*'} key
   * @param {function} callback   Will be called with the new value as parameter
   */
  onChange: function (key, callback) {
    // TODO: make key optional

    hash._prevHash = ''
    if (!hash._callbacks) {
      hash._callbacks = []
    }
    hash._callbacks.push({
      'key': key,
      'value': undefined,
      'callback': callback
    })

    function checkForChanges() {
      for (var i = 0; i < hash._callbacks.length; i++) {
        var obj = hash._callbacks[i]
        if (obj.key === '*') {
          var oldValue = obj.value
          obj.value = hash.getAll()
          obj.callback(obj.value, oldValue)
        }
        else {
          var oldValue = obj.value
          var value = hash.get(obj.key)
          var changed = (value !== oldValue)
          if (changed) {
            obj.value = value
            obj.callback(value, oldValue)
          }
        }
      }
    }

    // source: http://stackoverflow.com/questions/2161906/handle-url-anchor-change-event-in-js
    if ('onhashchange' in window) {
      window.onhashchange = function () {
        checkForChanges()
      }
    }
    else {
      // onhashchange event not supported
      hash._prevHash = window.location.hash
      window.setInterval(function () {
        var hash = window.location.hash
        if (hash != hash._prevHash) {
          hash._prevHash = hash
          checkForChanges()
        }
      }, 1000)
    }
  },

  /**
   * Remove a callback function
   * @param {String | '*'} key
   * @param {function} callback The earlier registered callback function
   */
  offChange: function (key, callback) {
    hash._callbacks = hash._callbacks.filter(function (entry) {
      return entry.key !== key || entry.callback !== callback
    })
  },

  /**
   * Set hash parameters
   * @param {Object} query    object with strings
   */
  setAll: function (query) {
    var str = ''

    for (var key in query) {
      if (query.hasOwnProperty(key)) {
        var value = query[key]
        if (value != undefined) {
          if (str.length) {
            str += '&'
          }
          str += encodeURIComponent(key)
          str += '='
          str += encodeURIComponent(query[key])
        }

        // apply changes to registered callbacks, so they will not fire a change
        if (hash._callbacks) {
          for (var i = 0; i < hash._callbacks.length; i++) {
            var obj = hash._callbacks[i]
            if (obj.key == key) {
              obj.value = value + '' // to string
            }
          }
        }
      }
    }

    window.location.hash = (str.length ? ('#' + str) : '')
  },


  /**
   * Retrieve a parameter value from the hash
   * @param {String} key
   * @return {String | undefined} value   undefined when the value is not found
   */
  'get': function (key) {
    var query = this.getAll()
    return query[key]
  },

  /**
   * Set an hash parameter or set multiple hash parameters at once
   * @param {String | Object} key   A key or an object with multiple key/values
   * @param {String} [value]
   */
  'set': function (key, value) {
    var query = this.getAll()

    if (typeof key === 'string') {
      query[key] = value
    }
    else {
      for (var k in key) {
        if (key.hasOwnProperty(k)) {
          query[k] = key[k]
        }
      }
    }

    this.setAll(query)
  },

  /**
   * Remove an hash parameter
   * @param {String} key
   */
  remove: function (key) {
    var query = this.getAll()
    if (query[key]) {
      delete query[key]
      this.setAll(query)
    }
  }
}
