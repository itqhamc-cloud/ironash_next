'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminDashboard } from '@/components/AdminDashboard';
import { ArrowLeft } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col">
      <header className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between text-white">
        <button
          onClick={handleClose}
          className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to IronAsh Storefront</span>
        </button>
        <span className="text-xs font-mono text-amber-500 font-bold">Admin Route Mode</span>
      </header>

      <main className="flex-1 flex flex-col py-4 sm:py-6">
        <AdminDashboard
          isOpen={isOpen}
          onClose={handleClose}
          isInline={true}
        />
      </main>
    </div>
  );
}
