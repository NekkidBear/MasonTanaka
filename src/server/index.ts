import express from "express";
import { ApolloServer } from "apollo-server-express";
import mongoose from "mongoose";
import { typeDefs } from "./schema/schema"; // GraphQL schema definitions
import { resolvers } from "./resolvers/resolvers"; // GraphQL resolvers
import dotenv from "dotenv"; // For loading environment variables from .env file
import cors from "cors";

// Load environment variables
dotenv.config();

const startServer = async () => {
  const app = express(); // Initialize express application

  // Configure CORS to allow requests from the frontend origin
  const corsOptions = {
    origin: [
      "https://graphql-frontend-gold.vercel.app", // Allow requests from this frontend URL
      "https://localhost:3000", // Allow requests from local development server
    ],
    credentials: true, // Allows credentials (cookies, authorization headers, etc.)
    methods: ["GET", "POST", "OPTIONS"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers in requests
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  };

  /**
   * Explanation of CORS Options:
   *
   * 1. origin:
   *    - Specifies the allowed origins for cross-origin requests.
   *    - Requests from "https://graphql-frontend-gold.vercel.app" and "https://localhost:3000" are permitted.
   *
   * 2. credentials:
   *    - Indicates whether the response to the request can be exposed when the credentials flag is true.
   *    - Allows cookies, authorization headers, or TLS client certificates to be included in requests.
   *
   * 3. methods:
   *    - Specifies the HTTP methods that are allowed when accessing the resource.
   *    - In this case, GET, POST, and OPTIONS methods are permitted.
   *
   * 4. allowedHeaders:
   *    - Specifies the headers that can be used in the actual request.
   *    - "Content-Type" and "Authorization" headers are allowed.
   *
   * 5. optionsSuccessStatus:
   *    - Provides the status code to use for successful OPTIONS requests.
   *    - Some legacy browsers (e.g., IE11) choke on 204, so 200 is used instead.
   */

  // Handle OPTIONS requests
  app.options("*", cors(corsOptions));

  // Log all requests for debugging
  app.use((req, res, next) => {
    console.log(
      `${req.method} request from origin: ${req.headers.origin} to ${req.url}`
    );
    next();
  });

  // Initialize ApolloServer with type definitions and resolvers for GraphQL
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => ({ req, res }),
  });

  // Start the ApolloServer
  await server.start();

  // Connect ApolloServer middleware to the express application
  server.applyMiddleware({ app, cors: false, path: "/graphql" }); // Disable ApolloServer's built-in CORS handling

  app.use(cors(corsOptions)); // Use CORS middleware with the specified options

  // Retrieve MongoDB connection string from environment variables
  const mongodbConnectionString = process.env.MONGODB_CONNECTION_STRING;

  // Check if MongoDB connection string is provided
  if (!mongodbConnectionString) {
    console.error(
      "MONGODB_CONNECTION_STRING is not defined in the environment variables"
    );
    process.exit(1); // Exit the process with an error code
  }

  try {
    // Attempt to connect to MongoDB using the connection string
    await mongoose.connect(mongodbConnectionString);
    console.log("Connected to MongoDB");
  } catch (error) {
    // Log any errors during MongoDB connection attempt
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with an error code
  }

  // Retrieve the port number from environment variables or use 5001 as default
  const port = process.env.PORT || 5001;
  // Start the express application and listen on the specified port
  app.listen({ port }, () =>
    console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`)
  );
};

startServer(); // Call the function to start the server

/**
 * Troubleshooting and Maintenance Notes:
 *
 * 1. CORS Issues:
 *    - If you encounter CORS issues, ensure that the `origin` in `corsOptions` matches the frontend URL.
 *    - Check the browser console for CORS errors and adjust the `corsOptions` accordingly.
 *
 * 2. MongoDB Connection:
 *    - Ensure that the `MONGODB_CONNECTION_STRING` environment variable is correctly set in your `.env` file.
 *    - If the connection fails, verify the connection string and check MongoDB server status.
 *    - Look for detailed error messages in the console to diagnose connection issues.
 *
 * 3. Environment Variables:
 *    - Make sure to create a `.env` file in the root directory with all necessary environment variables.
 *    - Example:
 *      ```
 *      MONGODB_CONNECTION_STRING=mongodb://your_mongodb_uri
 *      PORT=5001
 *      ```
 *
 * 4. Server Port:
 *    - The server defaults to port 5001 if the `PORT` environment variable is not set.
 *    - Ensure the port is not in use by another application.
 *
 * 5. Debugging Requests:
 *    - All incoming requests are logged to the console for debugging purposes.
 *    - Check the logs to trace request origins and paths.
 *
 * 6. Apollo Server:
 *    - If GraphQL queries are not working, ensure that the `typeDefs` and `resolvers` are correctly defined and imported.
 *    - Use Apollo Server's built-in playground to test queries and mutations.
 */
