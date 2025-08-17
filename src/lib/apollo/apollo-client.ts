'use client';
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getSession } from 'next-auth/react';

const httpLink = new HttpLink({ uri: process.env.NEXT_PUBLIC_GRAPHQL_URI });

const authLink = setContext(async (_, { headers }) => {
  const session = await getSession();
  const accessToken = (session as any)?.accessToken;
  console.log('Auth Link - Session:', session);
  console.log('Auth Link - Access Token:', accessToken);
  return {
    headers: {
      ...headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  };
});

export const client = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
});

export default client;
