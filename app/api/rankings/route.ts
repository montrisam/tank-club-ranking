import { NextResponse } from 'next/server';

const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRa0RA5UeV9x8IJWTZaYceDnGn7_CNQlyhZTxaZt4idff72JrmVinG7OPVNVcncC8NXkwkauEsFRic9/pub?gid=1850007939&single=true&output=csv';

const fallbackRankingData = {
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
};

const fallbackPlayerProfile = {
  name: 'Bir Beer',
  image: '/players/default-player.png',
  prizeWon: '฿292,900',
  bountyPrize: '฿90,000',
  bountyHeads: '52',
  buyInCount: '22',
};

type RankingRow = Record<string, string>;

type Player = {
  name: string;
  image: string;
  prizeWon: number;
  bountyHeads: number;
  bountyPrize: number;
  buyInCount: number;
};

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result.map((cell) => cell.trim());
}

function parseCSV(text: string): RankingRow[] {
  const cleanedText = String(text || '').replace(/^\uFEFF/, '');
  const lines = cleanedText.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];

  const headers = parseCSVLine(lines[0]).map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row: RankingRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    return row;
  });
}

function normalizeKey(value: string): string {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function getCell(row: RankingRow, candidates: string[]): string {
  const entries = Object.entries(row || {});
  for (const candidate of candidates) {
    const normalizedCandidate = normalizeKey(candidate);
    const found = entries.find(([key]) => normalizeKey(key) === normalizedCandidate);
    if (found && found[1] !== '') return found[1];
  }
  return '';
}

function toNumber(value: string): number {
  const cleaned = String(value || '').replace(/[^0-9.-]/g, '');
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : 0;
}

function formatMoney(value: number): string {
  return `฿${Number(value || 0).toLocaleString('en-US')}`;
}

function buildSheetData(rows: RankingRow[]) {
  if (!rows.length) {
    return {
      uniquePlayers: fallbackRankingData.topWinner.length,
      rankingData: fallbackRankingData,
      playerProfile: fallbackPlayerProfile,
    };
  }

  const players: Player[] = rows
    .map((row, index) => ({
      name:
        getCell(row, ['player', 'player_name', 'name', 'nickname', 'display_name']) ||
        `Player ${index + 1}`,
      image:
        getCell(row, ['image', 'photo', 'avatar', 'profile_image', 'player_image']) ||
        '/players/default-player.png',
      prizeWon: toNumber(getCell(row, ['prize_won', 'total_prize', 'prize', 'money_won', 'winnings'])),
      bountyHeads: toNumber(getCell(row, ['bounty_heads', 'bounty_count', 'heads', 'hunter', 'top_hunter'])),
      bountyPrize: toNumber(getCell(row, ['bounty_prize', 'bounty_money', 'bounty_won', 'top_bounty'])),
      buyInCount: toNumber(getCell(row, ['buyin_count', 'buy_in_count', 'buyin', 'buyins'])),
    }))
    .filter((player) => player.name);

  const makeTop = (field: keyof Player, formatter: (value: number) => string) =>
    [...players]
      .sort((a, b) => Number(b[field]) - Number(a[field]))
      .slice(0, 5)
      .map((player, index) => ({
        rank: index + 1,
        name: player.name,
        value: formatter(Number(player[field])),
      }));

  const rankingData = {
    topWinner: makeTop('prizeWon', formatMoney),
    topHunter: makeTop('bountyHeads', (value) => String(value)),
    topBounty: makeTop('bountyPrize', formatMoney),
    topBuyIn: makeTop('buyInCount', (value) => String(value)),
  };

  const featured = [...players].sort((a, b) => b.prizeWon - a.prizeWon)[0] || players[0];

  return {
    uniquePlayers: players.length,
    rankingData: {
      topWinner: rankingData.topWinner.length ? rankingData.topWinner : fallbackRankingData.topWinner,
      topHunter: rankingData.topHunter.length ? rankingData.topHunter : fallbackRankingData.topHunter,
      topBounty: rankingData.topBounty.length ? rankingData.topBounty : fallbackRankingData.topBounty,
      topBuyIn: rankingData.topBuyIn.length ? rankingData.topBuyIn : fallbackRankingData.topBuyIn,
    },
    playerProfile: featured
      ? {
          name: featured.name,
          image: featured.image,
          prizeWon: formatMoney(featured.prizeWon),
          bountyPrize: formatMoney(featured.bountyPrize),
          bountyHeads: String(featured.bountyHeads),
          buyInCount: String(featured.buyInCount),
        }
      : fallbackPlayerProfile,
  };
}

export async function GET() {
  try {
    const response = await fetch(SHEET_CSV_URL, {
      cache: 'no-store',
      headers: {
        Accept: 'text/csv,text/plain;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`Google Sheet request failed: ${response.status}`);
    }

    const text = await response.text();
    const rows = parseCSV(text);
    const data = buildSheetData(rows);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('/api/rankings failed', error);
    return NextResponse.json(
      {
        uniquePlayers: fallbackRankingData.topWinner.length,
        rankingData: fallbackRankingData,
        playerProfile: fallbackPlayerProfile,
        error: true,
      },
      { status: 200 },
    );
  }
}
