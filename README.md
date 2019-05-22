# Flexi Stack Boilerplate

Flexible stack of boilerplates for rapid web app development.

The stack is flexible in that it can be used for client and/or server
development.

You want 100% server side code, cool. You want 100% client side? Also cool.
Or both, with initial server side rendering, followed by client side
rendering? Yup got that.
How about no sever or clients, just build a completely static site? Sure why
not.

This stack is completely opinionated based on my choices, but should be
flexible enough if someone else wants to use it. It's sole purpose is to
demonstrate a simple web application that has all the tooling you could want
for any real software engineering project.

## Stack

- TypeScript
- React
- Webpack (client bundles)
- Babel (client transpiling)
- Jest (testing + coverage)
- ESlint (linting)

## Other notes

The tests have 100% code coverage. That's incredibly hard to maintain in the
real world, but it does not start you ham stringed.

ALso linter rules are based off TSLint's reccomended settings, however for any
rules not clearly defined I use my opinion on good code, and basically every
other developer will have differing opinions.
