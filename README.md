# Golden Path

Golden Path is a functional (immutable) query tiny parser that can give you the chance to do your object/array queries and updates on the fly.

![Webp net-resizeimage](https://user-images.githubusercontent.com/7091543/90341365-bd16c380-e007-11ea-8f7a-d5024917d8ee.png)

This module has the following functions:
  - get
  - update
  - v

# Examples!

```js
import { get, update, v } from 'golden-path';

const object = { name: 'islam' };
get('name', object); // 'islam'

const object = { peoples: [{ id: 1 }] };
get(`peoples.0.id`, object); // 1

const object = { peoples: [{ id: 1 }, { id: 1 }] };
get(`peoples[id=1]`, object); // { id: 1 } - Only returns first match

const object = { peoples: [{ name: 'John' }, { name: 'Alex' }] };
get(`peoples[name="Alex"]`, object); // { name: 'Alex' }

// For dynamic data it's recommended to wrap with v() in order to not break the parser.
const nameFromServer = '[]&4%45.';
const object = { peoples: [{ name: nameFromServer }, { name: 'x#DCGEDS' }] };
get(`peoples[name="${v(nameFromServer)}"]`, object); // { name: '[]&4%45.' }

const object = { peoples: [{ id: 1 }, { id: 1 }] };
get(`peoples*[id=1]`, object); // { id: 1 }, { id: 1 } - returns all matches

const object = { peoples: [{ id: 1, age: 20 }, { id: 1, age: 30 }] };
get(`peoples*[id=1][age>=20]`, object); // [{ id: 1, age: 20 }, { id: 1, age: 30 }]

const object = { peoples: [{ id: 1, age: 20, kind: 'human' }, { id: 1, age: 30, kind: 'robot' }] };
get(`peoples*[id=1][age>=20].kind`, object); // ['human', 'robot']


// The same can be done with update but update will return the whole root object after being updated.

const object = { peoples: [{ id: 1, age: 20 }, { id: 1, age: 30 }] };

// update can take a value or a function that pass the current value as well!
update(`peoples*[id=1][age>=20]`, (x) => ({...x, updated: true }), object);
// { peoples: [{ id: 1, age: 20, updated: true }, { id: 1, age: 30, updated: true }] }
```

# Install

```
npm i golden-path
```

# Supports:
  - First match queries and updates.
  - Greedy (All matches) queries and updates.
  - Queries in all levels.
  - Multiple queries on the same array items.
  - Sanitization for server dynamic values (in order to not break the parser by any symbols).
  - Comparator operators: = > < >= <= !=
