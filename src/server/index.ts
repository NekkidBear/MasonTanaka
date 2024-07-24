import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import mongoose from 'mongoose';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const startServer = async () => {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  server.applyMiddleware({ app });

  const mongodbConnectionString = process.env.MONGODB_CONNECTION_STRING;

  if (!mongodbConnectionString) {
    console.error('MONGODB_CONNECTION_STRING is not defined in the environment variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongodbConnectionString);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }

  const port = process.env.PORT || 4000;
  app.listen({ port }, () =>
    console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`)
  );
};

startServer();