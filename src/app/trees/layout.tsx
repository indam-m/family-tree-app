import ApolloWrapper from '@/lib/apollo/ApolloWrapper';

import { ReactNode } from 'react';

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen text-white">
      <main className="mx-auto px-4 py-8">
        <ApolloWrapper>{children}</ApolloWrapper>
      </main>
    </div>
  );
};

export default Layout;
