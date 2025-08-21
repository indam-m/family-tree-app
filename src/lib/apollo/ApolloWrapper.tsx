'use client';

import { ApolloProvider } from '@apollo/client';
import client from './apollo-client';
import { SessionProvider } from 'next-auth/react';
import { Suspense } from 'react';

export default function ApolloWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ApolloProvider client={client}>
        <Suspense>{children}</Suspense>
      </ApolloProvider>
    </SessionProvider>
  );
}
