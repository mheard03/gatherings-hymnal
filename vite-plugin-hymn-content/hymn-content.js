import { createFilter, dataToEsm } from '@rollup/pluginutils';
import jsdom from 'jsdom';

export default function hymnContent(options = {}) {
  const filter = createFilter(options.include, options.exclude);
  const indent = 'indent' in options ? options.indent : '\t';

  return {
    name: 'json',

    // eslint-disable-next-line no-shadow
    transform(code, id) {
      if (id.slice(-5) !== '.html' || !filter(id)) return null;

      try {
        const parsed = JSON.parse(code);
        return {
          code: dataToEsm(
            { id, parsed },
            {
              preferConst: options.preferConst,
              compact: options.compact,
              namedExports: options.namedExports,
              indent,
            }
          ),
          map: { mappings: '' },
        };
      } catch (err) {
        const message = 'Could not parse JSON file';
        const position = parseInt(/[\d]/.exec(err.message)[0], 10);
        this.warn({ message, id, position });
        return null;
      }
    },
  };
}

/*
function getResult() {
  let result = true;
  fs.writeFileSync('newfile.txt', 'Learn Node FS module', function (err) {
    if (err) throw err;
    console.log('File is created successfully.');
  });
}

// Get every .html file specified
// Load existing .json
// Perform CRUD
// Overwrite .json
export default function buildHymnContent(rest) {
  return {
    name: 'build-hymn-content',
    hello: 'jpg',
  };
}

// actually just cannibalize this
// https://github.com/jycouet/kitql/blob/main/packages/vite-plugin-watch-and-run/src/index.ts
*/
