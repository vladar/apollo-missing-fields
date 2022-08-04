import { NiceBenchmark, createPreExecutedLink } from "./utils";

import {
  ApolloClient,
  InMemoryCache,
  gql,
} from "@apollo/client";

const with2fields = gql`
  {
    items {
      id
      foo
    }
  }
`;

const with3fields = gql`
  {
    items {
      id
      foo
      bar
    }
  }
`;

const with1field = gql`
  {
    items {
      id
    }
  }
`;

let lastResult: any

async function prepareBenchmark(itemCount: number, missingFields: number) {
  function generateResult() {
    const items: any[] = [];
    for (let i = 0; i < itemCount; i++) {
      items.push({
        __typename: `Item`,
        id: String(i),
        foo: "foo",
        bar: "bar",
      });
    }
    return {
      data: {
        items,
      },
    };
  }

  const client = new ApolloClient({
    link: createPreExecutedLink({ items: [] }),
    cache: new InMemoryCache({ resultCaching: false }),
  });

  let query
  if (missingFields === 0) {
    query = with3fields
  } else if (missingFields === 1) {
    query = with2fields
  } else {
    query = with1field
  }

  client.cache.writeQuery({
    query,
    data: generateResult().data,
  })

  return async function runQuery() {
    lastResult = await client.cache.diff({
      optimistic: false,
      query: with3fields,
    });
    return lastResult
  };
}

async function main() {
  const missingFieldsBench = new NiceBenchmark("Benchmark");

  missingFieldsBench.add("missing fields: 0", await prepareBenchmark(100, 0));
  missingFieldsBench.add("missing fields: 1", await prepareBenchmark(100, 1));
  missingFieldsBench.add("missing fields: 2", await prepareBenchmark(100, 2));

  await missingFieldsBench.run({ async: true });

  // console.log(lastResult)
}

main().catch(console.error);
