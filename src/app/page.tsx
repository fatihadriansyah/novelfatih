'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';
import { Clock, PenTool, Search, ArrowDownAZ, History, Sun, Moon } from 'lucide-react';
import { ReactLenis } from '@studio-freight/react-lenis';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { novels } from '../data/novels';

const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=Playfair+Display:wght@400;700&display=swap');
  .font-novel-title { font-family: 'Playfair Display', serif; }
  .font-novel-body { font-family: 'Lora', serif; }
`;

export default function NovelPage() {
  return (
    <ReactLenis root>
      <style>{fontStyles}</style>
      <main className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-zinc-900 dark:text-[#e5e5e5] selection:bg-purple-900 selection:text-white overflow-x-hidden transition-colors duration-500">
        <ThemeToggle />
        <LibraryView />
      </main>
    </ReactLenis>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="fixed top-6 right-6 z-50 p-3 rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 text-zinc-800 dark:text-zinc-200 hover:scale-110 transition-all"
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

function LibraryView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMethod, setSortMethod] = useState<"latest" | "az" | "za">("latest");
  const [lastReadId, setLastReadId] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('fatih_last_read');
    if (saved) setLastReadId(JSON.parse(saved));
  }, []);

  const filteredAndSortedNovels = useMemo(() => {
    let result = novels.filter(novel => 
      novel.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      novel.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );
    switch (sortMethod) {
      case "az": return result.sort((a, b) => a.title.localeCompare(b.title));
      case "za": return result.sort((a, b) => b.title.localeCompare(a.title));
      case "latest": default: return result.sort((a, b) => b.timestamp - a.timestamp);
    }
  }, [searchQuery, sortMethod]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="relative w-full min-h-screen px-6 py-20 md:p-24 z-10"
    >
      <div className="fixed inset-0 z-0 pointer-events-none"><MagneticGrid /></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-black/10 dark:border-white/10 pb-8 gap-6">
          <div>
            <h1 className="font-novel-title text-5xl md:text-8xl text-black dark:text-white tracking-tight cursor-default">
              <ScrambleText text="The Anthology." />
            </h1>
            <p className="text-zinc-500 font-mono text-xs mt-4">
              SHORT STORIES & ESSAYS BY FATIH ADRIANSYAH
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-500 transition-colors" size={16} />
              <input 
                type="text" placeholder="Cari judul atau genre..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 bg-black/5 dark:bg-zinc-900/50 border border-black/10 dark:border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-black dark:text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/50 transition-all backdrop-blur-sm"
              />
            </div>
            <div className="relative">
              <select 
                value={sortMethod} onChange={(e) => setSortMethod(e.target.value as any)}
                className="w-full appearance-none bg-black/5 dark:bg-zinc-900/50 border border-black/10 dark:border-white/10 rounded-full py-2 pl-4 pr-10 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-purple-500/50 transition-all backdrop-blur-sm cursor-pointer"
              >
                <option value="latest">Latest Updates</option>
                <option value="az">Alphabetical (A-Z)</option>
                <option value="za">Alphabetical (Z-A)</option>
              </select>
              <ArrowDownAZ className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {filteredAndSortedNovels.length === 0 && (
          <div className="text-center py-20 text-zinc-500 font-mono text-sm">
            Tidak ada cerita yang cocok dengan pencarian Fatih-sama...
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
          {filteredAndSortedNovels.map((novel, i) => {
            const isLastRead = lastReadId === novel.id;
            return (
              <Link key={novel.id} href={`/story/${novel.slug}`}>
                <TiltCard index={i}>
                  <div className="flex justify-between items-start mb-6">
                    <span className="inline-block px-3 py-1 rounded-full border border-black/10 dark:border-white/10 text-[10px] tracking-widest uppercase text-zinc-600 dark:text-zinc-400 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                      {novel.genre}
                    </span>
                    {isLastRead && (
                      <span className="flex items-center gap-1 text-[10px] tracking-widest text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full border border-purple-500/20">
                        <History size={12} /> Continue
                      </span>
                    )}
                  </div>
                  
                  <h2 className="font-novel-title text-3xl text-black dark:text-white mb-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {novel.title}
                  </h2>
                  <p className="font-novel-body text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-8 line-clamp-3">
                    {novel.desc}
                  </p>
                  <div className="flex items-center justify-between text-xs text-zinc-500 font-mono border-t border-black/5 dark:border-white/5 pt-4">
                    <span className="flex items-center gap-2"><Clock size={12}/> {novel.readTime}</span>
                    <span>{novel.date}</span>
                  </div>
                </TiltCard>
              </Link>
            );
          })}
          <div className="md:col-span-2 lg:col-span-1 border border-dashed border-black/20 dark:border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 gap-4 group hover:border-black/40 dark:hover:border-white/30 transition-colors">
             <PenTool size={32} className="animate-bounce text-purple-600 dark:text-purple-900 group-hover:text-purple-500 dark:group-hover:text-purple-600 transition-colors"/>
             <p className="text-xs uppercase tracking-widest text-center">Lebih banyak cerita<br/>sedang ditulis...</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TiltCard({ children, index }: any) {
  const x = useMotionValue(0); const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(x, [-0.5, 0.5], ["-10deg", "10deg"]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct); y.set(yPct);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove} onMouseLeave={() => { x.set(0); y.set(0); }}
      className="group relative h-full w-full cursor-pointer rounded-xl bg-white dark:bg-zinc-900/40 border border-black/5 dark:border-white/5 p-8 transition-colors hover:border-purple-500/30 shadow-xl dark:shadow-2xl"
    >
      <div style={{ transform: "translateZ(30px)" }}>{children}</div>
      <motion.div
        style={{ background: useMotionTemplate`radial-gradient(400px circle at ${useTransform(x, v => v * 100 + 50)}% ${useTransform(y, v => v * 100 + 50)}%, rgba(168, 85, 247, 0.15), transparent 80%)` }}
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      />
    </motion.div>
  );
}

function MagneticGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);

    const points: {x: number, y: number, originX: number, originY: number}[] = [];
    for (let x = 0; x < canvas.width; x += 40) {
      for (let y = 0; y < canvas.height; y += 40) {
        points.push({ x, y, originX: x, originY: y });
      }
    }
    const mouse = { x: -1000, y: -1000 };
    const handleMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('mousemove', handleMove);
    
    function animate() {
      if(!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = theme === 'light' ? '#e5e5e5' : '#333'; 
      points.forEach(p => {
        const dx = mouse.x - p.x; const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const force = Math.max(0, 100 - dist);
        const angle = Math.atan2(dy, dx);
        p.x += (p.originX - Math.cos(angle) * force * 2 - p.x) * 0.1; 
        p.y += (p.originY - Math.sin(angle) * force * 2 - p.y) * 0.1;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1, 0, Math.PI * 2); ctx.fill();
      });
      requestAnimationFrame(animate);
    }
    animate();
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('resize', handleResize); };
  }, [theme]);
  return <canvas ref={canvasRef} className="opacity-40 fixed inset-0" />;
}

function ScrambleText({ text }: { text: string }) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+";
  const [displayText, setDisplayText] = useState(text);
  const scramble = () => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(text.split("").map((letter, index) => {
        if (index < iteration) return text[index];
        return letters[Math.floor(Math.random() * 26)];
      }).join(""));
      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);
  };
  return <span onMouseEnter={scramble} className="inline-block">{displayText}</span>;
}