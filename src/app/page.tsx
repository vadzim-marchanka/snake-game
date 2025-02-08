'use client';

import dynamic from 'next/dynamic';

const Game = dynamic(() => import('@/components/snake/Game').then(mod => mod.Game), { ssr: false });

export default function Home() {
  return (
    <main>
      <Game />
    </main>
  );
}
