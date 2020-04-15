import cookieManager from './cookieManager';

const bioEp = {
  shown: false,
  delay: 5,
  showOnDelay: false,
  cookieExp: 30,
  showOncePerSession: false,
  onPopup: null,
  cookieNamespace: "bioep_",

  // Handle the cookieNamespaceshown cookie
  // If present and true, return true
  // If not present or false, create and return false
  checkCookie () {
    // Handle cookie reset
    if (this.cookieExp <= 0) {
      // Handle showing pop up once per browser session.
      if (this.showOncePerSession && cookieManager.get(this.cookieNamespace + "shown_session") == "true")
        return true;

      cookieManager.erase(this.cookieNamespace + "shown");
      return false;
    }

    // If cookie is set to true
    if (cookieManager.get(this.cookieNamespace + "shown") == "true")
      return true;

    return false;
  },

  // Show the popup
  showPopup () {
    if(this.shown) return;

    this.shown = true;

    cookieManager.create(this.cookieNamespace + "shown", "true", this.cookieExp, false);
    cookieManager.create(this.cookieNamespace + "shown_session", "true", 0, true);

    if (typeof this.onPopup === "function") {
      this.onPopup();
    }
  },

  // Event listener initialisation for all browsers
  addEvent: function (obj, event, callback) {
    if(obj.addEventListener)
      obj.addEventListener(event, callback, false);
    else if(obj.attachEvent)
      obj.attachEvent("on" + event, callback);
  },

  // Event listener cleanup for all browsers
  removeEvent: function (obj, event, callback) {
    if(obj.removeEventListener)
      obj.removeEventListener(event, callback, false);
    else if(obj.detachEvent)
      obj.detachEvent("on" + event, callback);
  },

  // Load event listeners for the popup
  loadEvents: function() {
    // Track mouseout event on document
    this.addEvent(document, "mouseout", this.onMouseOverHandler);
  },

  onClose: function () {
    this.removeEvent(document, "mouseout", this.onMouseOverHandler);
    this.removeEvent(document, "DOMContentLoaded", this.onInitHandler);
  },

  // Set user defined options for the popup
  setOptions: function(opts) {
    this.delay = (typeof opts.delay === 'undefined') ? this.delay : opts.delay;
    this.showOnDelay = (typeof opts.showOnDelay === 'undefined') ? this.showOnDelay : opts.showOnDelay;
    this.cookieExp = (typeof opts.cookieExp === 'undefined') ? this.cookieExp : opts.cookieExp;
    this.showOncePerSession = (typeof opts.showOncePerSession === 'undefined') ? this.showOncePerSession : opts.showOncePerSession;
    this.onPopup = (typeof opts.onPopup === 'undefined') ? this.onPopup : opts.onPopup;
    this.cookieNamespace = (typeof opts.cookieNamespace === 'undefined') ? this.cookieNamespace : opts.cookieNamespace;
  },

  onMouseOverHandler: function (e) {
    e = e ? e : window.event;

    // If this is an autocomplete element.
    if(e.target.tagName.toLowerCase() == "input")
      return;

    // Get the current viewport width.
    var vpWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

    // If the current mouse X position is within 50px of the right edge
    // of the viewport, return.
    if(e.clientX >= (vpWidth - 50))
      return;

    // If the current mouse Y position is not within 50px of the top
    // edge of the viewport, return.
    if(e.clientY >= 50)
      return;
  // Reliable, works on mouse exiting window and
    // user switching active program
    var from = e.relatedTarget || e.toElement;
    if(!from)
      this.showPopup();
  },
  onInitHandler: function () {
    // Handle the cookie
    if(this.checkCookie()) return;

    // Load events
    setTimeout(function() {
      this.loadEvents();

      if(this.showOnDelay)
        this.showPopup();
    }.bind(this), this.delay * 1000);
  },
  init: function(opts) {
    // Handle options
    if(typeof opts !== 'undefined')
      this.setOptions(opts);

    // Make sure onClose can remove events on clean up
    this.onClose = this.onClose.bind(this);
    this.onMouseOverHandler = this.onMouseOverHandler.bind(this);
    this.onInitHandler = this.onInitHandler.bind(this);

    // Once the onMouseOverHandler has fully loaded
    if (document.readyState === "interactive" || document.readyState === "complete") {
      this.onInitHandler();
    } else {
      this.addEvent(document, "DOMContentLoaded", this.onInitHandler);
    }
  }
};

export default bioEp;
