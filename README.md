# ts-typed-routes

Routes built and re-usable with type-safe parameters.

TODO: re-write most of this

## Examples

### Importing

```ts
import { route, parameter } from 'ts-typed-routes';
```

### Creating routes

```ts
const dashboardRoute = route('user', 'settings);

const dashboardRaw = dashboardRoute.raw(); // === 'user/settings'
const dashboardPath = dashboardRoute.create(); // = 'user/settings'
```

### Parameters in routes

```ts
const userProfileRoute = route('profile', parameter('userId'), parameter('tab'));

const userProfiledRaw = userProfileRoute.raw(); // === 'profile/:userId/:tab'
const userProfilePath = userProfileRoute.create({ // === 'profile/JohnDoe1337/activity'
  userId: 'JohnDoe1337',
  tab: 'activity',
});
/*
Note, the above create function is typed using TypeScript,
and requires the following type: { userId: string; tab: string }
*/
```

### Extending Routes

```ts
// we want to have the routes '/user/:name' and '/user/:name/friends/:page?'

const userRoute = route('user', parameter('id'));
const userFriendsRoute = userRoute.extend('friends', optionalParameter("page", Number));

const aliceRoute = route.with({ name: 'alice' }); // 'user/alice'
const aliceFriendsRoute = route.with({ name: 'alice', page: 1 }); // 'user/alice/friends/1'
```

### Typed parameters

You can supply an optional function that takes a string and returns the actual
type you want for that parameter. This is handy using built in type
functions such as `Number` and `Boolean` to clearly indicate to other
developers what the type of that parameter should be.

```ts
const blogRoute = route('blog/posts/', parameter('count', Number));

const blogRaw = blogRoute.raw(); // === 'blog/posts/:count'
const blogPath = blogRoute.create({ count: 5 }); // === 'blog/posts/5'
// the create() function requires an argument of type: `{ count: number }`
```

### Custom types parameters

For complex types that cannot be easily serialized from a string you can supply
a decoder function too.

```ts
type WeirdObject = {
  weird?: boolean;
  stuff: string;
};

const toWeirdObject = (str: string) => JSON.parse(str) as WeirdObject;
const fromWeirdObject = (obj: WeirdObject) => JSON.stringify(obj);

const weirdObjectRoute = route('store', parameter('weirdObject', toWeirdObject, fromWeirdObject));

const weirdObjectRaw = weirdObjectRoute.raw(); // === 'store/:weirdObject'
const weirdObjectPath = weirdObjectRoute.path({ weirdObject: {
    weird: true,
    stuff: 'something',
}}); // === 'store/%7B%22weird%22%3Atrue%2C%22object%22%3A%22something%22%7D'
// Note: the above path is a url encoded JSON string, hence so many escaped characters
```
