//
// Run manually in the terminal using "node ./hymnals/build-scripts/build-hymnals.js"
// Runs automatically when...

const hymnReader = require('./read-hymn-files');
const hymnalRoot = './hymnals/';

const STATUS_ERROR = -1;
const STATUS_SKIP = 1;
const STATUS_UPSERT = 2;
const STATUS_DELETE = 3;

let hymns = hymnReader.readAllHymnals(hymnalRoot);
console.log(hymns.length);
