'use client';

import { useEffect, useState, useCallback } from 'react';

export function useHashRoute() {
  const read = () => (typeof window === 'undefined' ? '/' : (window.location.hash.replace(/^#/, '') || '/'));
  const [route, setRoute] = useState(read);

  useEffect(() => {
    const onChange = () => setRoute(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((to: string) => {
    window.location.hash = to;
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  return { route, navigate };
}

export function navigate(to: string) {
  window.location.hash = to;
  window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
}

export function ageFrom(birthDate: string): number {
  const d = new Date(birthDate);
  const diff = Date.now() - d.getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
}

export function category(birthDate: string): string {
  const a = ageFrom(birthDate);
  if (a <= 16) return 'U17';
  if (a <= 18) return 'U19';
  if (a <= 21) return 'U21';
  if (a <= 25) return 'Espoir';
  return 'Senior';
}

export const initials = (name: string) => name.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
