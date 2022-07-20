const defaultEventOptions = {
  capture: true,
  passive: false
};

class Pinch {
  constructor(pinchManager) {
    this.pinchManager = pinchManager;
    this.isIgnored = false;
    this.isDefaultPrevented = false;
    this.center = undefined;
    this.initialDirection = 0;
    this.initialDistance = 0;
    this.distance = 0;

    Object.defineProperty(this, 'pinchManager', {
      enumerable: false,
      configurable: false,
      writable: false
    });
  }

  get delta() {
    return (this.distance - this.initialDistance);
  }

  ignore() {
    this.isIgnored = true;
  }

  preventDefault() {
    console.log('preventDefault');
    this.isDefaultPrevented = true;
    this.pinchManager.preventDefault();
  }
}


const PINCH_THRESHOLD = 5;

class PinchManager {
  constructor(element, eventOptions) {
    this.element = element || document.scrollingElement;
    this.reset();    
    this.addOrUpdateListeners(eventOptions);
  }
  reset() {
    if (this.hasOngoingPinch) {
      const pinchEvent = new CustomEvent("pinchend", { detail: this.currentPinch });
      this.element.dispatchEvent(pinchEvent);
    }
    this.eventCache = [];
    this.currentPinch = new Pinch(this);
    this.hasPossiblePinch = false;
    this.hasOngoingPinch = false;
  }
  destroy() {
    this.removeListeners();
    this.reset();
  }

  handleEvent(e) {
    // We only care about touch events
    if (!e.type.startsWith("touch")) return;
    
    // Continuation logic based on touch count
    //   0: reset and return
    //   1: cache event and return
    //   2: cache event and handle it
    //   3: reset and return
    if (e.touches.length == 1 || e.touches.length == 2) {
      if (e.cancelable) {
        if (this.currentPinch.isDefaultPrevented) {
          e.preventDefault();
        }
        else if (e.type == "touchstart" || e.type == "touchmove") {
          this.eventCache.push(e);
        }
      }
    }
    else {
      this.reset();
    }


    if (e.touches.length != 2) {
      if (this.hasOngoingPinch) this.reset();
      return;
    }

    const eventType = this.hasOngoingPinch ? "pinchmove" : "pinchstart";
    this.currentPinch.center = getCenter(...e.touches);
    this.currentPinch.distance = getDistance(...e.touches);

    // Handle 2-finger touch events statefully
    //   currentPinch.ignored:  no further events sent to client
    //   hasPossiblePinch:      no events sent to client, center and initialDistance tracked
    //   hasOngoingPinch:       events sent to client, initialDirection tracked
    if (this.currentPinch.isIgnored) {
      return;
    }

    if (!this.hasPossiblePinch) {
      // set hasPossiblePinch as soon as exactly 2 fingers are on the device
      this.hasPossiblePinch = true;
      this.currentPinch.center = getCenter(...e.touches);
      this.currentPinch.initialDistance = this.currentPinch.distance;
      return;
    }

    if (!this.hasOngoingPinch) {
      if (Math.abs(this.currentPinch.delta) < PINCH_THRESHOLD) {
        return;
      }
      else {
        // set hasOngoingPinch when fingers have moved together or apart by at least PINCH_THRESHOLD
        // reset initialDistance so .delta will change smoothly from zero
        this.hasOngoingPinch = true;
        this.currentPinch.initialDirection = Math.sign(this.currentPinch.delta);
        this.currentPinch.initialDistance = this.currentPinch.distance;
      }
    }

    // Dispatch event;
    const pinchEvent = new CustomEvent(eventType, { detail: this.currentPinch });
    this.element.dispatchEvent(pinchEvent);
  }

  preventDefault() {
    this.eventCache.forEach(e => e.preventDefault());
    this.eventCache = [];
  }

  addOrUpdateListeners(eventOptions) {
    eventOptions = Object.assign({}, defaultEventOptions, eventOptions || {});
    this.removeListeners();

    this.element.addEventListener('touchstart', this, eventOptions);
    this.element.addEventListener('touchmove', this, eventOptions);
    this.element.addEventListener('touchcancel', this, eventOptions);
    this.element.addEventListener('touchend', this, eventOptions);
  }
  removeListeners() {
    this.element.removeEventListener('touchstart', this);
    this.element.removeEventListener('touchmove', this);
    this.element.removeEventListener('touchcancel', this);
    this.element.removeEventListener('touchend', this);
  }
}

function getDistance(touch1, touch2) {
  let dx = touch1.screenX - touch2.screenX;
  let dy = touch1.screenY - touch2.screenY;
  return Math.sqrt(dx * dx + dy * dy);
}
function getCenter(touch1, touch2) {
  let cx = (touch1.screenX + touch2.screenX) / 2;
  let cy = (touch1.screenY + touch2.screenY) / 2;
  return [cx, cy];
}

export default PinchManager;



/*
class TouchCache extends Map {
  cacheTouchEvent(event) {
    if (event.type == "touchend") {
      for (let t of event.changedTouches) {
        this.delete(t.identifier);
      }
    }
    else {
      for (let t of event.changedTouches) {
        this.upsertTouch(t, event);
      }
    }

    let cachedTouchIds = [...this.keys()];
    let expectedTouchIds = event.touches.map(t => t.identifier);

    let cacheIsIncorrect = cachedTouchIds.length != expectedTouchIds.length;
    if (!cacheIsIncorrect) {
      for (let i = 0; i < cachedTouchIds.length; i++) {
        if (cachedTouchIds[i] != expectedTouchIds[i]) {
          cacheIsIncorrect = true;
          break;
        }
      }
    }
    if (cacheIsIncorrect) {
      event.touches.forEach(t => upsertTouch(t, event));
      let deletedTouchIds = cachedTouchIds.filter(t => expectedTouchIds.indexOf(t) < 0);
      deletedTouchIds.forEach(id => this.delete(id));
    }
  }
  upsertTouch(touch, event) {
    let cached = this.get(touch.identifier);
    if (!cached) {
      cached = { identifier: touch.identifier, firstEvent: event };
      this.set(touch.identifier, cached);
    }
    cached.clientX = touch.clientX;
    cached.clientY = touch.clientY;
    cached.timestamp = event.timestamp;
  }
}
*/