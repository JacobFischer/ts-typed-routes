# ts-typed-routes

Zero dependency strongly typed routes and formatting for [TypeScript].

This library exposes simple functions to help build routes with parameters
while preserving strongly typed information and parsers.

This is a TypeScript project, although the compiled source is available in the
npm package without any required runtime dependencies for vanilla JavaScript.

## Examples

### Importing

```ts
import { optionalParameter, parameter, route } from 'ts-typed-routes';
```

### Creating routes

```ts
const dashboardRoute = route('root', 'user', 'settings);

dashboardRoute.path(); // === 'root/user/settings'
```

### Parameters in routes

The true strength of this library is in modeling parameters and preserving their
type information via TypeScript generics.

```ts
const userProfileRoute = route('profile', parameter('id'), parameter('tab'));

userProfileRoute.path(); // === 'profile/:id/:tab'
userProfileRoute.format({ // === 'user/JohnDoe1337/activity'
  id: 'JohnDoe1337',
  tab: 'activity',
});
/*
Note, the above format() function is typed using TypeScript,
and requires the following first arg: `{ id: string; tab: string }`
*/
```

### Extending Routes

Oftentimes we'll want to build hierarchical paths by extending parent routes.

```ts
// we want to have the routes 'user/:name' and 'user/:name/friends/:page?'

const userRoute = route('user', parameter('id'));
const userFriendsRoute = userRoute.extend('friends', optionalParameter('page', Number));

// required arg type is { name: string }
route.format({ name: 'alice' }); // === 'user/alice'

// required arg type is { name: string, page: number }
route.format({ name: 'alice', page: 1 }); // 'user/alice/friends/1'
```

### Typed parameters

You can supply an optional function that takes a string and returns the actual
type you want for that parameter. This is handy using built in type
functions such as `Number` and `Boolean` to clearly indicate to other
developers what the type of that parameter should be.

```ts
const blogRoute = route('blog', 'posts/', parameter('index', Number));

blogRoute.path(); // === 'blog/posts/:index'

// required arg type is { index: number }
blogRoute.format({ index: 5 }); // === 'blog/posts/5'
```

### Optional parameters

Parameters can be marked as optional as well. These parameters are **not**
required when using `.format()`, and will be filled in with their default value.

```ts
const homeRoute = route('home', 'information', optionalParameter('activeTab'));

homeRoute.format({}); // === 'home/information'
homeRoute.format({ activeTab: 'activity' }); // === 'home/information/activity'
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

weirdObjectRoute.path(); // === 'store/:weirdObject'
weirdObjectRoute.format({ weirdObject: {
    weird: true,
    stuff: 'something',
}}); // === 'store/%7B%22weird%22%3Atrue%2C%22object%22%3A%22something%22%7D'
// Note: the above path is a url encoded JSON string, hence so many escaped characters
```

### Parsing route data

Many frameworks expose url parameters via [path-to-regexp] that that will return
the parameters in a solely key based key/value object. You can then parse them
into their correct types with this library.

```ts
const noStringsRoute = route(parameter('start', Number), optionalParameter('end', Boolean));

noStringsRoute.format({ start: 1337, end: true }); // === '1337/true

noStringsRoute.parse({ start: '777', end: 'true' }); // === { start: 777, end: true }
noStringsRoute.parse({ start: '-50' }); // === { start: -50, end: false }
```

## Advanced Usage

These are more niche usage case examples that most developers probably will not
need.

### Custom joiners

The default character used to build the path is `/`, as this library is most
useful to build url paths. However you can specific a custom string instead.

```ts
const simpleRoute = route('first', 'second', 'third');

simpleRoute.path({ joiner: '_-_' }); // === 'first_-_second_-_third'
simpleRoute.format({}, { joiner: '' }); // === 'firstsecondthird'
```

### Encoders and decoders

By default, any values _after_ being stringified, and _before_ being parsed,
will be passed through an encoder and decoder function. These default to
`encodeURIComponent` and `decodeURIComponent` respectively.

#### Encoder

```ts
const example = route('start', parameter('val'));

// by default this URI encodes your values
example.format({ val: '$$$' }); // === 'start/%24%24%24'

// you can override this with a custom string encoder
example.format({ val: '$$$' }, { encoder: (str) => str }); // === start/$$$
```

#### Decoder

```ts
const test = route('contact', parameter('email'));

const email = 'john%2Bdoe%40email.com'; // encoded
test.parse({ email }); // === { email: 'john+doe@email.com' }
test.parse({ email }, { decoder: (s) => s.toUpperCase() }); // === { email: 'JOHN%2BDOE%40EMAIL.COM' }
```

### Parsing incorrect objects

```ts
const lotsOfParams = route(parameter('foo'), parameter('bar'), parameter('baz'));

const weirdData = { bar: 'something' } as Record<string, string>;
lotsOfParams.parse(weirdData, { useDefaults: true }); // === { foo: '', bar: 'something', baz: '' }
lotsOfParams.parse({}, { useDefaults: true }); // === { foo: '', bar: '', baz: '' }
```

## React-Router

**NOTE**: This feature is still very experimental.

[react-router-dom] is listed as an optional dependency with this package.

_If_ you are using it, then you can import a part of this package which adds
useful react-router functionality. Otherwise you can ignore this feature.

### importing

**If you try to import `ts-typed-routes/react-router` without `react-router-dom` installed it will throw an Error**.

However, if you do have it installed this is an extension library that exports
helpful React components wrapped with `route()` logic.

```ts
import { reactRoute, parameter } from 'ts-typed-routes/react-router';
```

_Note_: The `react-router` file within this module re-exports all the imports
from the index.

### Basic usage

A `ReactRoute` exposes all the same functions as a basic `Route`, but adds some
react-route helpers.

```ts
const simple = reactRoute('simple', 'route');

simple.path(); // === 'simple/route';
```

### `<Link>`

```tsx
const BlogRoute = reactRoute('blog', 'articles');

const BlogLinkText = () => (
  <span>
    Link to <blogRoute.Link>blog</blogRoute.Link>
  </span>
);

// another way to use Link

const { Link: BlogLink } = BlogRoute;
const BlobLinkText2 = () => <BlogLink>link text</BlogLink>;

// NavLink too
const BlogNavLink = BlogRoute.NavLink;
```

#### with parameters

```tsx
const articleRoute = reactRoute('article', parameter('id'));

const Articles = (
  <>
    <articleRoute.Link parameters={{ id: 'cool-cars' }}>Cool cars</<ArticleRoute.Link>
    <articleRoute.Link parameters={{ id: 'generic-top-10' }}>Generic top 10 list</<ArticleRoute.Link>
  </>
)
```

### <Route />

```tsx
import { Switch } from 'react-router-dom';

const aboutRoute = reactRoute('about');
const helpRoute = reactRoute('help');
const contactRoute = helpRoute.extend('contact-us'); // help/contact-us
const postsRoute = reactRoute('posts', parameter('uuid'));

const Routes = () => (
  <Switch>
    <aboutRoute.Route />
    {/* same as: <Route path={aboutRoute.path()} /> */}
    <helpRoute.Route />
    <contactRoute.Route />
    <postsRoute.Route />
  </Switch>
)
```

### <Redirect />

```tsx
import { Switch } from 'react-router-dom';

const deprecatedRoute = reactRoute('blog_posts');
const newRoute = reactRoute('blog');

const blogPage = () => {
  <Switch>
    <deprecatedRoute.RedirectFrom to={newRoute.path()}>
    <deprecatedRoute.Route>
      {/* could also do this, but the above redirect would catch first */}
      <newRoute.RedirectTo />
    </deprecatedRoute.Route>
  </Switch>
}
```

### useParams()

```tsx
// have this route used somewhere in a react-router <Switch>
export const route = reactRoute('blog', parameter('postId'), optionalParameter('page', Number));

const Component = () => {
  const { postId, page } = route.useParams();

  return <BlogPost postId={postId} page={page} />;
}

```

[TypeScript]: https://www.typescriptlang.org/
[path-to-regexp]: https://github.com/pillarjs/path-to-regexp
[react-router-dom]: https://github.com/ReactTraining/react-router
