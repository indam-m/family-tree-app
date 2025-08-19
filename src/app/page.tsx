'use client';
import { useQuery } from '@apollo/client';
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { GET_HEALTH } from '@/lib/graphql/queries';
import SignOutForm from '@/components/SignOutForm';

export default function Home() {
  const { data, error } = useQuery(GET_HEALTH);
  const { data: session, status } = useSession();
  const [isLogOutOpen, setIsLogoutOpen] = useState(false);
  console.log('Apollo is alive ✅', { data, error });
  return (
    <div className="grid grid-rows items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-between px-6 py-12 text-gray-800 shadow-black shadow-2xl rounded-md">
        <div className="w-full flex justify-end items-center mb-6">
          {status === 'authenticated' && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, <b>{session.user?.name || 'User'}</b>!
              </span>
              <a
                onClick={() => setIsLogoutOpen(true)}
                className="text-blue-600 hover:underline hover:cursor-pointer"
              >
                Logout
              </a>
            </div>
          )}
        </div>
        {/* Hero Section */}
        <section className="max-w-2xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Build Your Family Tree
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            A simple, visual, and powerful way to map out your family history
            and relationships.
          </p>
          {status === 'authenticated' ? (
            <a
              href="/trees"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition"
            >
              Go to Your Trees
            </a>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <a
                href="/register" // or your login/register page
                className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 transition"
              >
                Register
              </a>
              <a href="/login" className="ml-4 text-indigo-600 hover:underline">
                Already have an account? Login
              </a>
              <a href="/trees" className="ml-4 text-blue-600 hover:underline">
                View Sample Trees
              </a>
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className="mt-20 grid md:grid-cols-3 gap-6 max-w-4xl text-center">
          {[
            {
              title: 'Visual Tree Builder',
              desc: 'Create and navigate through a dynamic family tree.',
            },
            {
              title: 'Flexible Relationships',
              desc: 'Supports single parents, multiple marriages, and more.',
            },
            {
              title: 'Secure Data',
              desc: 'Your information is safe and accessible only to you.',
            },
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

        {isLogOutOpen && (
          <SignOutForm
            isOpen={isLogOutOpen}
            onClose={() => {
              setIsLogoutOpen(false);
            }}
            onSignOut={() => {}}
          />
        )}

        {/* Footer CTA */}
        <footer className="mt-20 text-center">
          Copyright © {new Date().getFullYear()} Family Tree App | Created by
          <a href="https://indam-m.github.io/"> Indam</a>
        </footer>
      </main>
    </div>
  );
}
