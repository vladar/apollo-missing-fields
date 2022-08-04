# Apollo missing fields benchmark

Sometimes `apollo.cache.diff` returns results with missing fields.

> Note: `apollo.cache.diff` is the same as `apollo.cache.readQuery`,
> but additionally returns information about missing fields

# Example

Let's write an array of objects with a single `id` field and then try to read fields `id`, `foo` and `bar`:

```js
  client.cache.writeQuery({
    query: gql`{ items { id } }`,
    data: { items: [{ id: 1 }, { id: 2 } /*, ... */, { id: 10 } ] },
  });

  const returned = client.cache.diff({
    optimistic: false,
    query: gql`{ items: { id, foo, bar }}`,
  });
```

We haven't written `foo` and `bar` fields. So Apollo will report us which fields are missing in the returned result:

```js
// `returned` contains:
{
    result: {
        items: [
            { id: 1 },
            { id: 2 },
            /* ... 8 more */
        ]
    },
    missing: [
        MissingFieldError {
            message: "Can't find field 'foo' on Item:0 object",
            path: [Array],
            query: [Object],
            clientOnly: false,
            variables: {}
        },
        MissingFieldError {
            message: "Can't find field 'bar' on Item:0 object",
            path: [Array],
            query: [Object],
            clientOnly: false,
            variables: {}
        },
        /* ...18 more errors */
    ],
}
```

# Benchmark

This benchmarks explores how those missing fields affect Apollo performance (we use 100 items in the benchmark):

```
Apollo 3.3.21

missing fields: 0 x 155 ops/sec ±4.21% (72 runs sampled)
missing fields: 1 x 118 ops/sec ±2.54% (70 runs sampled)
missing fields: 2 x 99.18 ops/sec ±1.42% (69 runs sampled)
```

```
Apollo 3.6.9

missing fields: 0 x 405 ops/sec ±12.86% (55 runs sampled)
missing fields: 1 x 279 ops/sec ±10.99% (59 runs sampled)
missing fields: 2 x 276 ops/sec ±17.04% (46 runs sampled)
```

# Try it

```
yarn
yarn bench
```
