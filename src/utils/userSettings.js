import { reactive, watch } from 'vue'

const onUpdate = {};
const getFinal = {};

let defaultValues = {
  fontSize: 16
};
let readers = {
  fontSize: readFloat
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
        if (readers[setting]) {
          finalValue = readers[setting](finalValue);
        }
        if (getFinal[setting]) {
          finalValue = getFinal[setting](newValue, oldValue, this.userSettings);
        }
        if (finalValue != newValue) {
          // this write triggers watch again; return to avoid firing update/write logic twice
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
  let oldValueNum = readFloat(oldValue, defaultValues.fontSize);
  return readFloat(newValue, oldValueNum);
}

function readFloat(value, defaultValue) {
  if (typeof(value) == "undefined") return defaultValue;
  if (typeof(value) == "number") return value;
  if (typeof(value) == "string") {
    let result = parseFloat(value);
    if (value != NaN.toString() && Number.isNaN(result)) result = undefined;
    return result;
  }
  return undefined;
}

function readDate(value, defaultValue) {
  if (typeof(value) == "undefined") return defaultValue;
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return defaultValue;
    return value;
  }

  let result = undefined;
  try {
    result = new Date(value);
  }
  catch (e) {
    result = undefined;
  }
  return readDate(result);
}

function writeToStorage(userSettings) {
  let newJson = JSON.stringify(userSettings);
  try {
    let oldJson = JSON.stringify(localStorage["userSettings"]);
    if (newJson != oldJson) {
      localStorage["userSettings"] = newJson;
    }
  }
  catch (e) {
    localStorage["userSettings"] = newJson;
  }
}

function loadFromStorage(target) {
  let savedSettings = localStorage["userSettings"];
  if (!savedSettings) return;

  try {
    savedSettings = JSON.parse(savedSettings);
  }
  catch(e) {
    return;
  }

  for (let field of Object.keys(savedSettings)) {
    if (readers[field]) {
      savedSettings[field] = readers[field](savedSettings[field], target[field]);
    }
  }

  Object.assign(target, savedSettings);
}