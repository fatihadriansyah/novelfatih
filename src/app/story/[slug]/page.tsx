'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowLeft, BookOpen, Coffee } from 'lucide-react';
import { ReactLenis } from '@studio-freight/react-lenis';
import { novels } from '../../../data/novels';

const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=Playfair+Display:wght@400;700&display=swap');
  .font-novel-title { font-family: 'Playfair Display', serif; }
  .font-novel-body { font-family: 'Lora', serif; }
`;

export default function StoryReaderPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;

  // Mencari cerita yang sesuai dengan kata di URL (slug)
  const story = novels.find((n) => n.slug === slug);

  // Otomatis update history bacaan terakhir ketika halaman dibuka
  useEffect(() => {
    if (story) {
      localStorage.setItem('fatih_last_read', JSON.stringify(story.id));
    }
  }, [story]);

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#050505] text-zinc-500 font-mono text-sm">
        Cerita tidak ditemukan, Fatih-sama...
      </div>
    );
  }

  return (
    <ReactLenis root>
      <style>{fontStyles}</style>
      <main className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-zinc-900 dark:text-[#e5e5e5] selection:bg-purple-900 selection:text-white overflow-x-hidden transition-colors duration-500">
        <ReaderView story={story} onBack={() => router.push('/')} />
      </main>
    </ReactLenis>
  );
}

function ReaderView({ story, onBack }: { story: any, onBack: () => void }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <div className="relative w-full min-h-screen">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-purple-500 origin-left z-50" style={{ scaleX }} />
      <nav className="fixed top-0 w-full p-6 md:p-8 flex justify-between items-center z-40 bg-gradient-to-b from-white/80 dark:from-[#050505] to-transparent pointer-events-none">
        <button onClick={onBack} className="pointer-events-auto group flex items-center gap-3 text-zinc-500 hover:text-black dark:hover:text-white transition-colors px-4 py-2 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 backdrop-blur-md">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/><span className="text-xs tracking-widest uppercase">Anthology</span>
        </button>
        <div className="pointer-events-auto flex items-center gap-4 text-zinc-500 text-xs tracking-widest uppercase bg-white/80 dark:bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-black/10 dark:border-white/10 mr-12">
           <span className="hidden md:inline">{story.title}</span><span className="w-px h-3 bg-black/20 dark:bg-white/20"></span><span className="flex items-center gap-2 text-purple-600 dark:text-purple-400"><Coffee size={14}/> Zen Mode</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 pt-40 pb-40">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center mb-20">
          <span className="text-purple-600 dark:text-purple-500 text-xs tracking-[0.3em] uppercase mb-4 block">Short Story</span>
          <h1 className="font-novel-title text-5xl md:text-7xl text-black dark:text-white mb-6 leading-tight">{story.title}</h1>
          <div className="flex items-center justify-center gap-6 text-zinc-500 text-sm font-novel-body italic">
            <span>By Fatih Adriansyah</span><span>&bull;</span><span>{story.date}</span>
          </div>
        </motion.div>
        
        <div className="space-y-8 relative z-10">
          {story.content.map((paragraph: string, index: number) => <Paragraph key={index} text={paragraph} />)}
        </div>

        <div className="mt-32 pt-10 border-t border-black/10 dark:border-white/10 text-center relative z-10">
          <BookOpen size={32} className="mx-auto text-zinc-400 dark:text-zinc-700 mb-4" />
          <p className="text-zinc-600 font-novel-title italic text-xl">The End.</p>
          <button onClick={onBack} className="mt-8 text-sm text-purple-600 dark:text-purple-400 hover:text-black dark:hover:text-white transition-colors tracking-widest uppercase">Back to Anthology</button>
        </div>
      </div>
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150"></div>
    </div>
  );
}

function Paragraph({ text }: { text: string }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.2, 1, 1, 0.2]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [20, 0, 0, -20]);
  
  const isHeader = text.startsWith("BAGIAN") || text.startsWith("PROLOG") || text.startsWith("EPILOG");

  return (
    <motion.p 
      ref={ref} 
      style={{ opacity, y }} 
      className={`font-novel-body leading-relaxed text-zinc-800 dark:text-zinc-200 ${isHeader ? 'text-2xl md:text-3xl font-bold mt-12 mb-6 text-black dark:text-white' : 'text-lg md:text-xl'}`}
    >
      {text}
    </motion.p>
  );
}