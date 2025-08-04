'use client';
import { useQuery } from '@apollo/client';
import { GET_HEALTH } from '@/lib/graphql/queries';

export default function Home() {
  const { data, error } = useQuery(GET_HEALTH);
  console.log('Apollo is alive ✅', { data, error });
  return (
    <div className="grid grid-rows items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-between px-6 py-12 text-gray-800 shadow-black shadow-2xl rounded-md">
        {/* Hero Section */}
        <section className="max-w-2xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Build Your Family Tree
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            A simple, visual, and powerful way to map out your family history
            and relationships.
          </p>
          <a
            href="/trees" // or your login/register page
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 transition"
          >
            Get Started
          </a>
        </section>

        {/* Features Section */}
        <section className="mt-20 grid md:grid-cols-2 gap-6 max-w-4xl text-center">
          {[
            {
              title: 'Visual Tree Builder',
              desc: 'Create and navigate through a dynamic family tree.',
            },
            {
              title: 'Flexible Relationships',
              desc: 'Supports single parents, multiple marriages, and more.',
            },
            /*{
              title: 'Secure Data',
              desc: 'Your information is safe and accessible only to you.',
            },*/
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 bg-blue-200 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </section>

        {/* Footer CTA */}
        <footer className="mt-20 text-center">
          Copyright © {new Date().getFullYear()} Family Tree App | Created by
          <a href="https://indam-m.github.io/"> Indam</a>
        </footer>
      </main>
    </div>
  );
}
