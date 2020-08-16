# Golden Path

Golden Path is a functional (immutable) query tiny parser that can give you the chance to do your object/array queries and updates on the fly.

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

// For dynamic data it's recommended to wrap with v() in order to
// not break the parser.
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

// See spec.js files for more crazy stuff!
```

# Install

```
npm i golden-path
```
