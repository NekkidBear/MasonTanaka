import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import mongoose from 'mongoose';
import { typeDefs } from './schema/schema'; // GraphQL schema definitions
import { resolvers } from './resolvers/resolvers'; // GraphQL resolvers
import dotenv from 'dotenv'; // For loading environment variables from .env file

// Load environment variables
dotenv.config();

const startServer = async () => {
  const app = express(); // Initialize express application

  // Initialize ApolloServer with type definitions and resolvers for GraphQL
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  // Start the ApolloServer
  await server.start();

  // Connect ApolloServer middleware to the express application
  server.applyMiddleware({ app });

  // Retrieve MongoDB connection string from environment variables
  const mongodbConnectionString = process.env.MONGODB_CONNECTION_STRING;

  // Check if MongoDB connection string is provided
  if (!mongodbConnectionString) {
    console.error('MONGODB_CONNECTION_STRING is not defined in the environment variables');
    process.exit(1); // Exit the process with an error code
  }

  try {
    // Attempt to connect to MongoDB using the connection string
    await mongoose.connect(mongodbConnectionString);
    console.log('Connected to MongoDB');
  } catch (error) {
    // Log any errors during MongoDB connection attempt
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit the process with an error code
  }

  // Retrieve the port number from environment variables or use 4000 as default
  const port = process.env.PORT || 5001;
  // Start the express application and listen on the specified port
  app.listen({ port }, () =>
    console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`)
  );
};

startServer(); // Call the function to start the server