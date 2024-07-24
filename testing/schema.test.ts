import { createTestClient } from "apollo-server-testing";
import { ApolloServer, gql } from "apollo-server";
import { typeDefs } from "../src/server/schema/schema"; 
import {resolvers} from "../src/server/resolvers/resolvers";

// Initialize Apollo Server for testing
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { query } = createTestClient(server);

describe("GraphQL Integration Tests", () => {
  it("fetches single customer", async () => {
    // Define your query
    const GET_CUSTOMER = gql`
      query GetCustomer($username: String!) {
        customer(username: $username) {
          username
          email
        }
      }
    `;

    // Execute the query
    const res = await query({
      query: GET_CUSTOMER,
      variables: { username: "lejoshua" },
    });

    // Assertions
    expect(res).not.toBeNull();
    expect(res.data).not.toBeNull();
    expect(res.data.customer).toBeDefined();
    expect(res.data.customer.username).toEqual("lejoshua");
    // Add more assertions as needed
  });

  // Add more tests for other queries and mutations
});
