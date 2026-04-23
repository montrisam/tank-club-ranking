'use client';

import React, { useEffect, useState } from 'react';
import {
  CalendarDays,
  Crown,
  Globe,
  Image as ImageIcon,
  LayoutDashboard,
  Mail,
  Phone,
  ShoppingBag,
  Newspaper,
  ScrollText,
  Trophy,
} from 'lucide-react';

type RankItem = { rank: number; name: string; value: string };
type SheetData = {
  uniquePlayers: number;
  rankingData: {
    topWinner: RankItem[];
    topHunter: RankItem[];
    topBounty: RankItem[];
    topBuyIn: RankItem[];
  };
  playerProfile: {
    name: string;
    image: string;
    prizeWon: string;
    bountyPrize: string;
    bountyHeads: string;
    buyInCount: string;
  };
};

const BACKEND_API_URL = '/api/rankings';
const LOGO_TEXT = 'TANK CLUB';

const slides = [
  { title: 'TANK CLUB CHAMPIONSHIP', subtitle: 'พื้นที่โฆษณาหลัก: Event / News / Sponsor', tag: 'Slide 1' },
  { title: 'BREAKING NEWS', subtitle: 'ข่าวด่วน / press / update', tag: 'Slide 2' },
  { title: 'SPONSOR CAMPAIGN', subtitle: 'แบนเนอร์สปอนเซอร์', tag: 'Slide 3' },
  { title: 'WEEKEND EVENTS', subtitle: 'โปรโมตซีรีส์', tag: 'Slide 4' },
];

const eventCards = [
  { name: 'TANK Championship', date: '12-14 July 2026' },
  { name: 'Weekend Bounty Cup', date: '20 July 2026' },
  { name: 'High Roller Night', date: '27 July 2026' },
  { name: 'Deepstack Sunday', date: '28 July 2026' },
];

const newsCards = [
  { title: 'TANK CLUB announces new festival series', date: '24 Apr 2026' },
  { title: 'Weekend bounty structure updated', date: '21 Apr 2026' },
  { title: 'Special sponsor partnership launch', date: '18 Apr 2026' },
];

const fallbackData: SheetData = {
  uniquePlayers: 128,
  rankingData: {
    topWinner: [
      { rank: 1, name: 'Bir Beer', value: '฿292,900' },
      { rank: 2, name: 'Art P', value: '฿143,000' },
      { rank: 3, name: 'Aui Lungkea', value: '฿140,000' },
      { rank: 4, name: 'Appza', value: '฿122,000' },
      { rank: 5, name: 'Anucha', value: '฿102,000' },
    ],
    topHunter: [
      { rank: 1, name: 'Bir Beer', value: '52' },
      { rank: 2, name: 'Appza', value: '41' },
      { rank: 3, name: 'Anucha', value: '37' },
      { rank: 4, name: 'Art P', value: '31' },
      { rank: 5, name: 'Aui Lungkea', value: '28' },
    ],
    topBounty: [
      { rank: 1, name: 'Bir Beer', value: '฿90,000' },
      { rank: 2, name: 'Art P', value: '฿55,000' },
      { rank: 3, name: 'Aui Lungkea', value: '฿44,000' },
      { rank: 4, name: 'Appza', value: '฿39,000' },
      { rank: 5, name: 'Anucha', value: '฿31,000' },
    ],
    topBuyIn: [
      { rank: 1, name: 'Bir Beer', value: '22' },
      { rank: 2, name: 'Art P', value: '20' },
      { rank: 3, name: 'Anucha', value: '20' },
      { rank: 4, name: 'Appza', value: '16' },
      { rank: 5, name: 'Aui Lungkea', value: '13' },
    ],
  },
  playerProfile: {
    name: 'Bir Beer',
    image: '/players/default-player.png',
    prizeWon: '฿292,900',
    bountyPrize: '฿90,000',
    bountyHeads: '52',
    buyInCount: '22',
  },
};

const sponsors = ['Sponsor A', 'Sponsor B', 'Sponsor C', 'Sponsor D', 'Sponsor E'];

type NavKey = 'home' | 'events' | 'news' | 'ranking' | 'store' | 'press' | 'admin';

const navItems = [
  { key: 'home' as const, label: 'Home', icon: Crown },
  { key: 'events' as const, label: 'Events', icon: CalendarDays },
  { key: 'news' as const, label: 'News', icon: Newspaper },
  { key: 'ranking' as const, label: 'Ranking', icon: Trophy },
  { key: 'store' as const, label: 'TANK Store', icon: ShoppingBag },
  { key: 'press' as const, label: 'Press', icon: ScrollText },
  { key: 'admin' as const, label: 'Admin', icon: LayoutDashboard },
];

function CardBox({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[28px] border border-white/10 bg-white/5 ${className}`}>{children}</div>;
}

export default function Page() {
  const [active, setActive] = useState<NavKey>('home');
  const [slideIndex, setSlideIndex] = useState(0);
  const [rankTab, setRankTab] = useState<'topWinner' | 'topHunter' | 'topBounty' | 'topBuyIn'>('topWinner');
  const [sheetData, setSheetData] = useState<SheetData>(fallbackData);
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);
  const [sheetError, setSheetError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadRankings() {
      try {
        setIsLoadingSheet(true);
        setSheetError('');

        const response = await fetch(BACKEND_API_URL, {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`โหลดข้อมูลไม่สำเร็จ (${response.status})`);
        }

        const data = (await response.json()) as Partial<SheetData>;
        if (isMounted && data) {
          setSheetData({
            uniquePlayers: data.uniquePlayers ?? fallbackData.uniquePlayers,
            rankingData: data.rankingData ?? fallbackData.rankingData,
            playerProfile: data.playerProfile ?? fallbackData.playerProfile,
          });
        }
      } catch (error) {
        if (isMounted) {
          setSheetError(error instanceof Error ? error.message : 'โหลดข้อมูลจาก backend ไม่สำเร็จ');
          setSheetData(fallbackData);
        }
      } finally {
        if (isMounted) setIsLoadingSheet(false);
      }
    }

    loadRankings();
    return () => {
      isMounted = false;
    };
  }, []);

  const slide = slides[slideIndex];

  return (
    <div className="min-h-screen bg-[#050508] bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.2),transparent_30%)] text-white">
      <div className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <div className="text-lg font-black tracking-wide">{LOGO_TEXT}</div>
          <div className="hidden flex-wrap items-center gap-2 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActive(item.key)}
                  className={`rounded-full border px-4 py-2 text-sm ${isActive ? 'border-purple-400/40 bg-purple-500/20 text-white' : 'border-white/10 bg-white/5 text-white/85 hover:bg-white/10'}`}
                >
                  <span className="inline-flex items-center gap-2"><Icon className="h-4 w-4" />{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-4 max-w-7xl px-4 md:px-8">
        <div className="rounded-2xl border border-sky-400/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
          เวอร์ชันนี้ดึงข้อมูลผ่าน backend API ({BACKEND_API_URL}) แล้ว จึงไม่ดึง Google Sheet ตรงจากหน้าเว็บ
        </div>
      </div>
      {isLoadingSheet ? (
        <div className="mx-auto mt-4 max-w-7xl px-4 md:px-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">กำลังโหลดข้อมูล Ranking จาก backend...</div>
        </div>
      ) : null}
      {sheetError ? (
        <div className="mx-auto mt-4 max-w-7xl px-4 md:px-8">
          <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">โหลดข้อมูลจาก backend ไม่สำเร็จ กำลังใช้ข้อมูลตัวอย่างแทนชั่วคราว</div>
        </div>
      ) : null}

      {active === 'home' && (
        <div>
          <section className="relative h-[80vh] w-full overflow-hidden bg-black">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-black" />
            <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-6">
              <div className="mb-4 w-fit rounded-full bg-purple-500/20 px-3 py-1 text-sm text-purple-100">Hero Banner / Editable from Admin</div>
              <h1 className="text-5xl font-black md:text-7xl">{slide.title}</h1>
              <p className="mt-4 max-w-xl text-white/70">{slide.subtitle}</p>
              <div className="mt-6 flex gap-3">
                <button className="rounded-2xl bg-purple-600 px-4 py-2 hover:bg-purple-500">Promote</button>
                <button className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-white hover:bg-white/10">News</button>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {slides.map((item, idx) => (
                  <button key={idx} onClick={() => setSlideIndex(idx)} className={`rounded-full px-3 py-1 text-xs ${idx === slideIndex ? 'bg-white text-black' : 'bg-white/10 text-white/70'}`}>{item.tag}</button>
                ))}
              </div>
            </div>
          </section>

          <div className="mx-auto max-w-7xl px-4 py-10">
            <div className="mb-5">
              <h2 className="text-2xl font-black text-white md:text-3xl">Events</h2>
              <p className="mt-1 text-sm text-white/55">รายการแข่งขันล่าสุด</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {eventCards.map((e) => (
                <CardBox key={e.name} className="overflow-hidden">
                  <div className="h-32 bg-purple-800/30" />
                  <div className="p-4">
                    <div className="font-bold text-white">{e.name}</div>
                    <div className="mt-1 text-sm text-white/70">{e.date}</div>
                  </div>
                </CardBox>
              ))}
            </div>

            <section className="mt-10 grid gap-6 xl:grid-cols-2">
              <CardBox>
                <div className="p-5 text-xl font-bold">Latest News</div>
                <div className="px-5 pb-5">
                  {newsCards.map((n) => (
                    <div key={n.title} className="mb-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="text-sm text-white/50">{n.date}</div>
                      <div className="mt-1 text-white">{n.title}</div>
                    </div>
                  ))}
                </div>
              </CardBox>

              <CardBox>
                <div className="p-5 text-xl font-bold">TOP TANK Ranking</div>
                <div className="px-5 pb-5 text-sm text-white/70">Players: {sheetData.uniquePlayers}</div>
                <div className="px-5 pb-5">
                  <div className="mb-4 flex flex-wrap gap-2">
                    <button onClick={() => setRankTab('topWinner')} className={`rounded-xl px-3 py-2 text-sm ${rankTab === 'topWinner' ? 'bg-purple-600' : 'bg-white/10 hover:bg-white/15'}`}>Top Winner</button>
                    <button onClick={() => setRankTab('topHunter')} className={`rounded-xl px-3 py-2 text-sm ${rankTab === 'topHunter' ? 'bg-purple-600' : 'bg-white/10 hover:bg-white/15'}`}>Top Hunter</button>
                    <button onClick={() => setRankTab('topBounty')} className={`rounded-xl px-3 py-2 text-sm ${rankTab === 'topBounty' ? 'bg-purple-600' : 'bg-white/10 hover:bg-white/15'}`}>Top Bounty</button>
                  </div>
                  {sheetData.rankingData[rankTab].map((p) => (
                    <div key={`${rankTab}-${p.rank}`} className="mb-2 flex justify-between rounded-xl bg-black/20 p-3 text-white">
                      <span>#{p.rank} {p.name}</span>
                      <span>{p.value}</span>
                    </div>
                  ))}
                </div>
              </CardBox>
            </section>

            <section className="mt-10">
              <div className="mb-5 text-2xl font-black">Sponsors</div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                {sponsors.map((s) => (
                  <div key={s} className="flex h-20 items-center justify-center rounded-[24px] border border-white/10 bg-white/5 text-white/80">{s}</div>
                ))}
              </div>
            </section>

            <footer className="mt-12 rounded-[32px] border border-white/10 bg-white/5 p-6 md:p-8">
              <div className="grid gap-6 md:grid-cols-4">
                <div>
                  <div className="text-xl font-black">{LOGO_TEXT}</div>
                  <p className="mt-3 text-sm text-white/60">Premium poker club website prototype.</p>
                </div>
                <div><div className="font-semibold text-white">Press</div></div>
                <div><div className="font-semibold text-white">About Us</div></div>
                <div>
                  <div className="font-semibold text-white">Contact</div>
                  <div className="mt-3 space-y-2 text-sm text-white/60">
                    <div className="flex items-center gap-2"><Phone className="h-4 w-4" />+66 xx xxx xxxx</div>
                    <div className="flex items-center gap-2"><Mail className="h-4 w-4" />contact@tankclub.com</div>
                    <div className="flex items-center gap-2"><Globe className="h-4 w-4" />Line / Facebook / Instagram</div>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      )}

      {active === 'events' && <div className="mx-auto max-w-7xl px-4 py-10 md:px-8"><EventsSection /></div>}
      {active === 'ranking' && <div className="mx-auto max-w-7xl px-4 py-10 md:px-8"><RankingSection sheetData={sheetData} /></div>}
      {active === 'admin' && <div className="mx-auto max-w-7xl px-4 py-10 md:px-8"><AdminSection apiUrl={BACKEND_API_URL} /></div>}
      {active === 'news' && <SimplePage title="Latest News & Articles" subtitle="หน้านี้เป็นต้นแบบของเมนู News" items={newsCards.map((n) => `${n.date} — ${n.title}`)} />}
      {active === 'store' && <SimplePage title="Club Merchandise Store" subtitle="ต้นแบบหน้าร้านสำหรับสินค้า" items={['TANK Hoodie — ฿1,490', 'TANK Cap — ฿690', 'Club Jersey — ฿1,290', 'Card Protector — ฿490']} />}
      {active === 'press' && <SimplePage title="Press & Media" subtitle="ต้นแบบหน้า Press" items={newsCards.map((n) => `${n.date} — ${n.title}`)} />}
    </div>
  );
}

function EventsSection() {
  const [selectedEvent, setSelectedEvent] = useState(1);
  const eventList = [
    { id: 1, eventNo: '#1', name: 'TANK Championship Main Event', date: 'Fri 12 Jul 2026', time: '13:00', buyIn: '฿15,000', stack: '50,000', level: '40 min', lateReg: 'LV 10 @ 16:30', status: 'Upcoming', guarantee: '฿1,000,000 GTD', venue: 'TANK CLUB Bangkok', structureImageLabel: 'Freezeout Structure Poster' },
    { id: 2, eventNo: '#2', name: 'NLH 6 Max Turbo', date: 'Sat 13 Jul 2026', time: '16:00', buyIn: '฿5,000', stack: '20,000', level: '15 min', lateReg: 'LV 7', status: 'Open', guarantee: '-', venue: 'TANK CLUB Bangkok', structureImageLabel: '6 Max Structure Poster' },
    { id: 3, eventNo: '#3', name: 'Mystery / PKO / Big Bounty', date: 'Sun 14 Jul 2026', time: '13:00', buyIn: '฿5,000', stack: '30,000 - 40,000', level: '20 min', lateReg: 'LV 10 @ 16:30', status: 'Limited', guarantee: 'Special Bounty Event', venue: 'TANK CLUB Bangkok', structureImageLabel: 'Mystery / PKO / Big Bounty Poster' },
  ];
  const currentEvent = eventList.find((item) => item.id === selectedEvent) || eventList[0];

  return (
    <>
      <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#170d24] to-[#08070d] p-6 md:p-8">
        <div className="rounded-full bg-purple-500/20 px-3 py-1 text-sm text-purple-100 inline-block">Events / Series Layout</div>
        <h1 className="mt-4 text-4xl font-black text-white md:text-5xl">Events Main Page</h1>
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <CardBox>
          <div className="p-5 text-xl font-bold">Events Schedule Table</div>
          <div className="space-y-3 px-5 pb-5">
            {eventList.map((item) => (
              <button key={item.id} onClick={() => setSelectedEvent(item.id)} className={`grid w-full grid-cols-[64px_1.45fr_0.95fr_auto] items-center gap-4 rounded-2xl border p-4 text-left ${selectedEvent === item.id ? 'border-purple-400/40 bg-purple-500/10' : 'border-white/10 bg-black/20 hover:bg-white/10'}`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 font-black text-white">{item.eventNo}</div>
                <div><div className="font-semibold text-white">{item.name}</div><div className="mt-1 text-sm text-white/45">Buy-in {item.buyIn} • Stack {item.stack} • Level {item.level}</div></div>
                <div className="text-sm text-white/65"><div>{item.date}</div><div>{item.time}</div></div>
                <div className="rounded-full bg-white/10 px-3 py-1 text-sm text-white">{item.status}</div>
              </button>
            ))}
          </div>
        </CardBox>
        <CardBox>
          <div className="p-5 text-xl font-bold">Event Detail Page</div>
          <div className="space-y-5 px-5 pb-5">
            <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
              <div className="text-2xl font-black text-white">{currentEvent.name}</div>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {[["Date", currentEvent.date],["Time", currentEvent.time],["Buy-in", currentEvent.buyIn],["Stack", currentEvent.stack],["Level", currentEvent.level],["Late Reg", currentEvent.lateReg],["Guarantee", currentEvent.guarantee],["Venue", currentEvent.venue],["Status", currentEvent.status]].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs text-white/45">{label}</div><div className="mt-1 font-medium text-white">{value}</div></div>
                ))}
              </div>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
              <div className="mb-3 text-lg font-bold text-white">Structure Poster / Image Upload</div>
              <div className="flex min-h-[420px] items-center justify-center rounded-[24px] border border-dashed border-white/15 bg-white/[0.03] text-center text-white/50">
                <div>
                  <ImageIcon className="mx-auto h-12 w-12 text-purple-200/70" />
                  <div className="mt-3 text-base text-white/70">{currentEvent.structureImageLabel}</div>
                </div>
              </div>
            </div>
          </div>
        </CardBox>
      </div>
    </>
  );
}

function RankingSection({ sheetData }: { sheetData: SheetData }) {
  const rankingTabs = [
    { key: 'topWinner' as const, label: 'Top Winner' },
    { key: 'topHunter' as const, label: 'Top Hunter' },
    { key: 'topBounty' as const, label: 'Top Bounty' },
    { key: 'topBuyIn' as const, label: 'Top Buy-in' },
  ];
  const [activeRankingTab, setActiveRankingTab] = useState<'topWinner' | 'topHunter' | 'topBounty' | 'topBuyIn'>('topWinner');
  const rankingData = sheetData.rankingData;
  const playerProfile = sheetData.playerProfile;

  return (
    <>
      <div className="mb-8 rounded-[32px] border border-white/10 bg-gradient-to-br from-[#170d24] to-[#08070d] p-6 md:p-8">
        <div className="rounded-full bg-purple-500/20 px-3 py-1 text-sm text-purple-100 inline-block">Ranking / Connected to backend</div>
        <h1 className="mt-4 text-4xl font-black md:text-5xl">Ranking Leaderboard + Player Profile</h1>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <CardBox>
          <div className="p-5 text-xl font-bold">Leaderboard TOP 5</div>
          <div className="px-5 pb-5 text-sm text-white/50">ผู้เล่นทั้งหมด (unique players): {sheetData.uniquePlayers}</div>
          <div className="px-5 pb-5">
            <div className="mb-4 flex flex-wrap gap-2">
              {rankingTabs.map((tab) => (
                <button key={tab.key} onClick={() => setActiveRankingTab(tab.key)} className={`rounded-xl px-3 py-2 text-sm ${activeRankingTab === tab.key ? 'bg-purple-600' : 'bg-white/10 hover:bg-white/15'}`}>{tab.label}</button>
              ))}
            </div>
            <div className="space-y-3">
              {rankingData[activeRankingTab].map((player) => (
                <button key={`${activeRankingTab}-${player.rank}`} className="grid w-full grid-cols-[60px_1fr_auto] items-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-left hover:bg-white/10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 font-black text-purple-100">#{player.rank}</div>
                  <div><div className="font-semibold text-white">{player.name}</div></div>
                  <div className="font-bold text-white">{player.value}</div>
                </button>
              ))}
            </div>
          </div>
        </CardBox>
        <CardBox>
          <div className="p-5 text-xl font-bold">Player Profile Detail</div>
          <div className="grid gap-5 px-5 pb-5 lg:grid-cols-[0.78fr_1.22fr]">
            <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
              <div className="mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-purple-500/25 to-violet-800/25 text-5xl font-black">
                {playerProfile.name.charAt(0)}
              </div>
              <div className="mt-4 text-center text-2xl font-black">{playerProfile.name}</div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[["Prize Won", playerProfile.prizeWon],["Bounty Prize", playerProfile.bountyPrize],["Bounty Heads", playerProfile.bountyHeads],["Buy-in Count", playerProfile.buyInCount]].map(([label, value]) => (
                <div key={label} className="rounded-[24px] border border-white/10 bg-black/20 p-5"><div className="text-sm text-white/45">{label}</div><div className="mt-2 text-2xl font-black text-white">{value}</div></div>
              ))}
            </div>
          </div>
        </CardBox>
      </div>
    </>
  );
}

function AdminSection({ apiUrl }: { apiUrl: string }) {
  const [adminTab, setAdminTab] = useState('dashboard');
  const sidebarItems = ['dashboard', 'homepage', 'events', 'ranking', 'news', 'store', 'press', 'sponsors', 'media', 'settings'];
  return (
    <>
      <div className="mb-8 rounded-[32px] border border-white/10 bg-gradient-to-br from-[#170d24] to-[#08070d] p-6 md:p-8">
        <div className="rounded-full bg-purple-500/20 px-3 py-1 text-sm text-purple-100 inline-block">Admin / Backend Layout</div>
        <h1 className="mt-4 text-4xl font-black text-white md:text-5xl">TANK CLUB Back Office</h1>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.26fr_0.74fr]">
        <CardBox>
          <div className="p-5 text-xl font-bold">Admin Menu</div>
          <div className="space-y-2 px-5 pb-5">
            {sidebarItems.map((item) => (
              <button key={item} onClick={() => setAdminTab(item)} className={`w-full rounded-2xl border px-4 py-3 text-left text-sm ${adminTab === item ? 'border-purple-400/40 bg-purple-500/15 text-white' : 'border-white/10 bg-black/20 text-white/75 hover:bg-white/10'}`}>{item}</button>
            ))}
          </div>
        </CardBox>
        <div className="space-y-6">
          {adminTab === 'dashboard' && <SimplePage title='Dashboard' subtitle='' items={['Active Events', 'Homepage Slides', 'Players', 'News Posts']} embedded />}
          {adminTab === 'homepage' && <SimplePage title='Homepage Editor' subtitle='' items={['Hero Slider', 'Events Section', 'Latest News', 'TOP TANK Ranking', 'Sponsors', 'Footer']} embedded />}
          {adminTab === 'events' && <SimplePage title='Events Editor' subtitle='' items={['Series title', 'Event number', 'Event name', 'Date / time', 'Buy-in / stack / level', 'Structure image upload']} embedded />}
          {adminTab === 'ranking' && <SimplePage title='Ranking / Players' subtitle='' items={[`Backend API URL: ${apiUrl}`, 'Google Sheet จะถูกอ่านผ่าน backend', 'Player image upload', 'Featured player', 'Ranking labels']} embedded />}
          {adminTab === 'news' && <SimplePage title='News Editor' subtitle='' items={['News Title', 'Cover Image', 'Excerpt', 'Publish Date']} embedded />}
          {adminTab === 'store' && <SimplePage title='Store Management' subtitle='' items={['Product Name', 'Category', 'Price', 'Product Images']} embedded />}
          {adminTab === 'press' && <SimplePage title='Press Management' subtitle='' items={['Press Title', 'Cover Image', 'Release Body', 'Publish Date']} embedded />}
          {adminTab === 'sponsors' && <SimplePage title='Sponsors' subtitle='' items={['Sponsor Name', 'Logo Upload', 'Sponsor Link', 'Display Order']} embedded />}
          {adminTab === 'media' && <SimplePage title='Media Library' subtitle='' items={['Homepage Banners', 'Player Images', 'Structure Posters', 'Videos']} embedded />}
          {adminTab === 'settings' && <SimplePage title='Site Settings' subtitle='' items={['Site Logo', 'Contact Info', 'Google Sheet URL', 'Theme Colors']} embedded />}
        </div>
      </div>
    </>
  );
}

function SimplePage({ title, subtitle, items, embedded = false }: { title: string; subtitle: string; items: string[]; embedded?: boolean }) {
  const wrapper = (
    <CardBox>
      <div className="p-5 text-xl font-bold">{title}</div>
      {subtitle ? <div className="px-5 pb-2 text-white/65">{subtitle}</div> : null}
      <div className="grid gap-4 px-5 pb-5 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">{item}</div>
        ))}
      </div>
    </CardBox>
  );

  if (embedded) return wrapper;

  return <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">{wrapper}</div>;
}
