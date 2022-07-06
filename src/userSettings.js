import { reactive, watch } from 'vue'

const onUpdate = {};
const getFinal = {};

let defaultValues = {
  fontSize: 16
};

export default {
  data() {
    return { userSettings: Object.assign({}, defaultValues) };
  },
  created() {
    // Create a watcher for each property
    for (let setting of Object.keys(this.userSettings)) {
      watch(() => this.userSettings[setting], (newValue, oldValue) => {
        
        let finalValue = newValue;
        if (getFinal[setting]) {
          finalValue = getFinal[setting](newValue, oldValue, this.userSettings);
        }
        if (finalValue != newValue) {
          this.userSettings[setting] = finalValue;
          return;
        }

        if (onUpdate[setting]) {
          onUpdate[setting](newValue, oldValue, this.userSettings);
        }
        writeToStorage(this.userSettings);
      });
    }
    
    // On init, overwrite provided values with whatever's in localStorage
    loadFromStorage(this.userSettings);

    // Do the same whenever the tab emerges from the background
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState != "visible") return;
      loadFromStorage(this.userSettings);
    });
  }
};

getFinal["fontSize"] = function(newValue, oldValue) {
  let oldValueNum = parseFloat(oldValue);
  if (!oldValueNum || oldValueNum <= 0) oldValueNum = defaultValues.fontSize;

  let finalValue = parseFloat(newValue);
  if (isNaN(finalValue)) return oldValueNum;

  finalValue = Math.min(finalValue, 100);
  finalValue = Math.max(finalValue, 14);
  return finalValue;
}

function writeToStorage(userSettings) {
  console.log('writeToStorage');
  localStorage["userSettings"] = JSON.stringify(userSettings);
}

function loadFromStorage(target) {
  console.log('loadFromStorage');
  let savedSettings = localStorage["userSettings"];
  if (!savedSettings) return;

  try {
    savedSettings = JSON.parse(savedSettings);
  }
  catch(e) {
    return;
  }

  Object.assign(target, savedSettings);
}