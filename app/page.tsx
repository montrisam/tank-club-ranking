"use client";

import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";

const DEFAULT_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRa0RA5UeV9x8IJWTZaYceDnGn7_CNQlyhZTxaZt4idff72JrmVinG7OPVNVcncC8NXkwkauEsFRic9/pub?output=csv";

type RawRow = Record<string, string | number | null | undefined>;

type Row = {
  date: string;
  tournamentName: string;
  player: string;
  totalBuyInAmount: number;
  prizeWon: number;
  bountyPrize: number;
  totalPrize: number;
  bountyHead: number;
  trophy: string;
  entries: number;
  bubbleFinish: number;
};

type HistoryItem = {
  Date: string;
  "Tournament Name": string;
  "Total Buy-in Amount": number;
  "Prize Won": number;
  "Bounty Prize": number;
  "Total Prize": number;
  "Bounty Head": number;
  Trophy: string;
};

type TrophyDetail = {
  Date: string;
  "Tournament Name": string;
  Trophy: string;
};

type Player = {
  name: string;
  prizeWon: number;
  bountyHeads: number;
  bountyPrize: number;
  buyInCount: number;
  buyInAmount: number;
  eventsPlayed: number;
  trophies: number;
  trophyTypes: string[];
  trophyDetails: TrophyDetail[];
  recentHistory: HistoryItem[];
  bubbleFinishes: number;
};

const rankingConfigs = [
  { key: "prizeWon", label: "Top 10 Prize Won", subtitle: "เงินรางวัลรวมสูงสุด", kind: "money" },
  { key: "bountyHeads", label: "Top 10 Bounty Heads", subtitle: "จำนวนหัวที่เก็บได้สูงสุด", kind: "number" },
  { key: "bountyPrize", label: "Top 10 Bounty Prize", subtitle: "เงินค่าหัวสะสมสูงสุด", kind: "money" },
  { key: "buyInCount", label: "Top 10 Buy-in Count", subtitle: "จำนวน buy-in รวมสูงสุด", kind: "number" },
  { key: "buyInAmount", label: "Top 10 Buy-in Amount", subtitle: "มูลค่า buy-in รวมสูงสุด", kind: "money" },
  { key: "trophies", label: "Top 10 Trophy Count", subtitle: "จำนวนถ้วยรวมสูงสุด", kind: "number" },
] as const;

function normalizeKey(value: string) {
  return String(value || "").replace(/^\uFEFF/, "").trim().toLowerCase();
}

function getField(row: RawRow, aliases: string[]) {
  const normalized: Record<string, RawRow[string]> = {};
  Object.keys(row || {}).forEach((key) => {
    normalized[normalizeKey(key)] = row[key];
  });

  for (const alias of aliases) {
    const found = normalized[normalizeKey(alias)];
    if (found !== undefined && found !== null) return String(found);
  }
  return "";
}

function toNumber(value: string) {
  if (!value) return 0;
  const cleaned = value.replace(/,/g, "").replace(/฿/g, "").trim();
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toDateValue(dateText: string) {
  const parts = String(dateText || "").split("/");
  if (parts.length !== 3) return 0;
  const [dd, mm, yyyy] = parts.map(Number);
  if (!dd || !mm || !yyyy) return 0;
  return new Date(yyyy, mm - 1, dd).getTime();
}

function normalizeRows(rawRows: RawRow[]): Row[] {
  return rawRows
    .map((row) => ({
      date: getField(row, ["Date"]),
      tournamentName: getField(row, ["Tournament Name", "Tournament", "Event"]),
      player: getField(row, ["Player", "Player Name", "Name"]),
      totalBuyInAmount: toNumber(getField(row, ["Total Buy-in Amount", "Buy-in Amount", "Total Buyin Amount"])),
      prizeWon: toNumber(getField(row, ["Prize Won"])),
      bountyPrize: toNumber(getField(row, ["Bounty Prize"])),
      totalPrize: toNumber(getField(row, ["Total Prize"])),
      bountyHead: toNumber(getField(row, ["Bounty Head", "Bounty Heads"])),
      trophy: getField(row, ["Trophy", "Thophy"]).trim(),
      entries: toNumber(getField(row, ["Total Buy-in count", "Buy-in Count", "Entry Count", "Entries"])),
      bubbleFinish: toNumber(getField(row, ["Bubble P.", "Bubble", "Bubble Finish"])),
    }))
    .filter((row) => row.player);
}

function aggregatePlayers(rows: Row[]): Player[] {
  const map = new Map<string, Player>();

  rows.forEach((row) => {
    const key = row.player.trim();
    if (!map.has(key)) {
      map.set(key, {
        name: key,
        prizeWon: 0,
        bountyHeads: 0,
        bountyPrize: 0,
        buyInCount: 0,
        buyInAmount: 0,
        eventsPlayed: 0,
        trophies: 0,
        trophyTypes: [],
        trophyDetails: [],
        recentHistory: [],
        bubbleFinishes: 0,
      });
    }

    const player = map.get(key)!;
    player.prizeWon += row.prizeWon;
    player.bountyHeads += row.bountyHead;
    player.bountyPrize += row.bountyPrize;
    player.buyInAmount += row.totalBuyInAmount;
    player.buyInCount += row.entries > 0 ? row.entries : 1;
    player.bubbleFinishes += row.bubbleFinish > 0 ? 1 : 0;
    player.recentHistory.push({
      Date: row.date,
      "Tournament Name": row.tournamentName,
      "Total Buy-in Amount": row.totalBuyInAmount,
      "Prize Won": row.prizeWon,
      "Bounty Prize": row.bountyPrize,
      "Total Prize": row.totalPrize,
      "Bounty Head": row.bountyHead,
      Trophy: row.trophy,
    });

    if (row.trophy) {
      player.trophies += 1;
      player.trophyTypes.push(row.trophy);
      player.trophyDetails.push({
        Date: row.date,
        "Tournament Name": row.tournamentName,
        Trophy: row.trophy,
      });
    }
  });

  return [...map.values()].map((player) => ({
    ...player,
    eventsPlayed: new Set(player.recentHistory.map((item) => `${item.Date}-${item["Tournament Name"]}`)).size,
    trophyTypes: [...new Set(player.trophyTypes)],
    trophyDetails: [...player.trophyDetails].sort((a, b) => toDateValue(b.Date) - toDateValue(a.Date)),
    recentHistory: [...player.recentHistory].sort((a, b) => toDateValue(b.Date) - toDateValue(a.Date)).slice(0, 12),
  }));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("th-TH").format(value || 0);
}

function formatValue(value: number, kind: "money" | "number") {
  return kind === "money" ? formatMoney(value) : formatNumber(value);
}

function getTrophyTypeCounts(player: Player | null) {
  const counts: Record<string, number> = {};
  (player?.trophyDetails || []).forEach((item) => {
    const key = item.Trophy || "Unknown";
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts).map(([type, count]) => ({ type, count }));
}

export default function Page() {
  const [sheetUrl, setSheetUrl] = useState(DEFAULT_SHEET_URL);
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState("");
  const [activeMetric, setActiveMetric] = useState<(typeof rankingConfigs)[number]["key"]>("prizeWon");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const loadSheet = async (url = sheetUrl) => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`โหลดข้อมูลไม่สำเร็จ (${response.status})`);
      const text = await response.text();
      const parsed = Papa.parse<RawRow>(text, { header: true, skipEmptyLines: true });
      const normalized = normalizeRows(parsed.data || []);
      if (!normalized.length) throw new Error("ไม่พบข้อมูลใน Google Sheet นี้");
      setRows(normalized);
      setLastUpdated(new Date().toLocaleString("th-TH"));
      setSelectedPlayer(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSheet(DEFAULT_SHEET_URL);
  }, []);

  const players = useMemo(() => aggregatePlayers(rows), [rows]);

  const summary = useMemo(() => ({
    uniquePlayers: players.length,
    totalPrize: players.reduce((sum, player) => sum + player.prizeWon, 0),
    totalBountyPrize: players.reduce((sum, player) => sum + player.bountyPrize, 0),
    totalBuyIns: players.reduce((sum, player) => sum + player.buyInCount, 0),
  }), [players]);

  const filteredPlayers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const source = keyword
      ? players.filter((player) => player.name.toLowerCase().includes(keyword))
      : players;
    return [...source].sort((a, b) => b.prizeWon - a.prizeWon);
  }, [players, search]);

  const activeConfig = rankingConfigs.find((item) => item.key === activeMetric) || rankingConfigs[0];
  const rankingPlayers = useMemo(() => {
    return [...players]
      .sort((a, b) => ((b as any)[activeMetric] || 0) - ((a as any)[activeMetric] || 0) || a.name.localeCompare(b.name))
      .slice(0, 10);
  }, [players, activeMetric]);

  const trophyBreakdown = getTrophyTypeCounts(selectedPlayer);

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="hero-grid">
          <div>
            <div className="pill">TANK CLUB • LIVE RANKING</div>
            <h1>Player Ranking &amp; Profile Leaderboard</h1>
            <p className="hero-text">
              หน้าเว็บนี้เชื่อมกับ Google Sheet ของคุณแล้ว และใช้คำว่า <strong>Trophy</strong> แทน <strong>Thophy</strong> ให้เรียบร้อย
            </p>
            <div className="stats-grid">
              <StatCard label="ผู้เล่นทั้งหมด" value={formatNumber(summary.uniquePlayers)} subValue="unique players" />
              <StatCard label="Prize Won รวม" value={formatMoney(summary.totalPrize)} subValue="รวมเฉพาะ Prize Won" />
              <StatCard label="Bounty Prize รวม" value={formatMoney(summary.totalBountyPrize)} subValue="เงินค่าหัวรวม" />
              <StatCard label="Buy-in Count รวม" value={formatNumber(summary.totalBuyIns)} subValue="จำนวน entries ทั้งหมด" />
            </div>
          </div>

          <div className="panel-card">
            <h2>เชื่อม Google Sheet</h2>
            <p className="muted">ลิงก์นี้ใส่ไว้ให้แล้ว กดรีโหลดข้อมูลได้ทันที</p>
            <input className="input" value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)} />
            <div className="button-row">
              <button className="primary-btn" onClick={() => loadSheet()} disabled={loading}>
                {loading ? "กำลังโหลด..." : "Reload Data"}
              </button>
              <span className="status-badge">CSV Published</span>
            </div>
            {lastUpdated ? <div className="small-muted">อัปเดตล่าสุด: {lastUpdated}</div> : null}
            {error ? <div className="error-box">{error}</div> : null}
          </div>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel-card">
          <h2>Top 10 Ranking</h2>
          <p className="muted">เลือกหมวดเพื่อดูอันดับผู้เล่น 10 คนสูงสุด</p>
          <div className="tabs-wrap">
            {rankingConfigs.map((config) => (
              <button
                key={config.key}
                className={config.key === activeMetric ? "tab-btn active" : "tab-btn"}
                onClick={() => setActiveMetric(config.key)}
              >
                {config.subtitle}
              </button>
            ))}
          </div>

          <div className="section-head">
            <div>
              <h3>{activeConfig.label}</h3>
              <p className="muted">{activeConfig.subtitle}</p>
            </div>
          </div>

          <div className="ranking-list">
            {rankingPlayers.map((player, index) => (
              <button key={player.name} className="ranking-item" onClick={() => setSelectedPlayer(player)}>
                <div className="rank-number">#{index + 1}</div>
                <div className="ranking-main">
                  <div className="ranking-name-row">
                    <strong>{player.name}</strong>
                    {player.trophies > 0 ? <span className="mini-badge">{player.trophies} trophy</span> : null}
                  </div>
                  <div className="small-muted">
                    Events {formatNumber(player.eventsPlayed)} • Buy-in {formatNumber(player.buyInCount)} • Bounty Heads {formatNumber(player.bountyHeads)}
                  </div>
                </div>
                <div className="ranking-value">{formatValue((player as any)[activeMetric] || 0, activeConfig.kind)}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="panel-card">
          <h2>ค้นหาผู้เล่น</h2>
          <p className="muted">พิมพ์ชื่อเพื่อค้นหา แล้วกดดูโปรไฟล์</p>
          <input
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="เช่น appza, bir beer, anucha..."
          />
          <div className="search-list">
            {filteredPlayers.slice(0, 40).map((player) => (
              <button key={player.name} className="search-item" onClick={() => setSelectedPlayer(player)}>
                <div>
                  <div className="search-name">{player.name}</div>
                  <div className="small-muted">
                    Prize {formatMoney(player.prizeWon)} • Bounty {formatNumber(player.bountyHeads)} • Trophies {formatNumber(player.trophies)}
                  </div>
                </div>
                <span className="arrow">›</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {selectedPlayer ? (
        <div className="modal-backdrop" onClick={() => setSelectedPlayer(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <div>
                <h2>{selectedPlayer.name}</h2>
                <p className="muted">Player profile overview from live Google Sheet data</p>
              </div>
              <button className="close-btn" onClick={() => setSelectedPlayer(null)}>✕</button>
            </div>

            <div className="stats-grid profile-grid">
              <StatCard label="Prize Won" value={formatMoney(selectedPlayer.prizeWon)} />
              <StatCard label="Bounty Heads" value={formatNumber(selectedPlayer.bountyHeads)} />
              <StatCard label="Bounty Prize" value={formatMoney(selectedPlayer.bountyPrize)} />
              <StatCard label="Buy-in Count" value={formatNumber(selectedPlayer.buyInCount)} />
            </div>

            <div className="profile-two-col">
              <div className="panel-subcard">
                <h3>ถ้วยรางวัล</h3>
                <p className="muted">ได้ถ้วยทั้งหมด {formatNumber(selectedPlayer.trophies)} ถ้วย</p>
                {selectedPlayer.trophies > 0 ? (
                  <>
                    <div className="badge-row">
                      {trophyBreakdown.map((item) => (
                        <span key={item.type} className="mini-badge">Type {item.type} × {item.count}</span>
                      ))}
                    </div>
                    <div className="history-list compact">
                      {selectedPlayer.trophyDetails.map((item, index) => (
                        <div key={`${item.Date}-${index}`} className="history-item">
                          <div>
                            <strong>{item["Tournament Name"]}</strong>
                            <div className="small-muted">{item.Date}</div>
                          </div>
                          <span className="mini-badge">Trophy {item.Trophy}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="empty-box">ยังไม่มีข้อมูลถ้วยรางวัลของผู้เล่นคนนี้</div>
                )}
              </div>

              <div className="panel-subcard">
                <h3>สถิติรวม</h3>
                <div className="kv-list">
                  <div className="kv-row"><span>Events Played</span><strong>{formatNumber(selectedPlayer.eventsPlayed)}</strong></div>
                  <div className="kv-row"><span>Buy-in Amount</span><strong>{formatMoney(selectedPlayer.buyInAmount)}</strong></div>
                  <div className="kv-row"><span>Bubble Finishes</span><strong>{formatNumber(selectedPlayer.bubbleFinishes)}</strong></div>
                  <div className="kv-row"><span>Trophy Types</span><strong>{selectedPlayer.trophyTypes.length ? selectedPlayer.trophyTypes.join(", ") : "-"}</strong></div>
                </div>
              </div>
            </div>

            <div className="panel-subcard">
              <h3>Recent Tournament History</h3>
              <p className="muted">รายการล่าสุดของผู้เล่นคนนี้</p>
              <div className="history-list">
                {selectedPlayer.recentHistory.length ? (
                  selectedPlayer.recentHistory.map((item, index) => (
                    <div key={`${item.Date}-${index}`} className="history-item history-grid">
                      <div>
                        <strong>{item["Tournament Name"]}</strong>
                        <div className="small-muted">{item.Date}</div>
                      </div>
                      <div><span className="small-muted">Buy-in</span><strong>{formatMoney(item["Total Buy-in Amount"] || 0)}</strong></div>
                      <div><span className="small-muted">Prize Won</span><strong>{formatMoney(item["Prize Won"] || 0)}</strong></div>
                      <div><span className="small-muted">Bounty Prize</span><strong>{formatMoney(item["Bounty Prize"] || 0)}</strong></div>
                      <div><span className="small-muted">Bounty Heads</span><strong>{formatNumber(item["Bounty Head"] || 0)}</strong></div>
                    </div>
                  ))
                ) : (
                  <div className="empty-box">ไม่พบประวัติการแข่งขันของผู้เล่นคนนี้</div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function StatCard({ label, value, subValue }: { label: string; value: string; subValue?: string }) {
  return (
    <div className="stat-card">
      <div className="small-muted">{label}</div>
      <div className="stat-value">{value}</div>
      {subValue ? <div className="small-muted">{subValue}</div> : null}
    </div>
  );
}
