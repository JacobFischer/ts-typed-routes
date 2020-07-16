# Typesafe Routes

Routes built and re-usable with typesafe parameters.

## Examples

### Creating routes

```ts
const dashboardRoute = route("dashboard/");

const dashboardRaw = dashboardRoute.raw(); // === "dashboard/"
const dashboardPath = dashboardRoute.create(); // = "dashboard/"
```

### Parameters in routes

```ts
const userProfileRoute = route("profile/", parameter("userId"), "/", parameter("tab"));

const userProfiledRaw = userProfileRoute.raw(); // === "profile/:userId/:tab"
const userProfilePath = userProfileRoute.create({ // === "profile/JohnDoe1337/activity"
    userId: "JohnDoe1337",
    tab: "activity",
});
/*
Note, the above create function is typed using TypeScript,
and requires the following type: { userId: string; tab: string }
*/
```

### Typed parameters

You can supply an optional function that takes a string and returns the actual
type you want for that parameter. This is handy using built in type
constructions such as `Number` and `Boolean` to clearly indicate to other
developers what the type of that parameter should be.

```ts
const blogRoute = route("blog/posts/", parameter("count", Number));

const blogRaw = blogRoute.raw(); // === "blog/posts/:count"
const blogPath = blogRoute.create({ count: 5 }); // === "blog/posts/5"
// the create() function requires an argument of type: `{ count: number }`
```

### Custom types parameters

For complex types that cannot be easily serialized from a string you can supply
a decoder function too.

```ts
type WeirdObject = {
    weird?: boolean;
    object: string;
};

const toWeirdObject = (str: string) => JSON.parse(str) as WeirdObject;
const fromWeirdObject = (obj: WeirdObject) => JSON.stringify(obj);

const weirdObjectRoute = route("store/", parameter("weirdObject", toWeirdObject, fromWeirdObject));

const weirdObjectRaw = weirdObjectRoute.raw(); // === "store/:weirdObject"
const weirdObjectPath = weirdObjectRoute.path({ weirdObject: {
    weird: true,
    object: "something",
}}); // === "store/%7B%22weird%22%3Atrue%2C%22object%22%3A%22something%22%7D"
// Note: the above path is a url encoded JSON string, hence so many escaped characters
```
