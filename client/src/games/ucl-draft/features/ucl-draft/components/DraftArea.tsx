import React, { useState, useMemo } from 'react';
import { Player, PlayerCategory, Era, PitchSlot } from '../../../types/draft';
import { GameMode, DraftChallenge } from '../types';
import { PlayerCard } from './PlayerCard';
import { ALL_CLUBS, ALL_ERAS, ALL_CATEGORIES, CATEGORY_LABELS } from '../../../data/players';
import { Search, X, ArrowUpDown, Users, Dices, RotateCcw } from 'lucide-react';
import { isPlayerDrafted, getDraftedSlotId } from '../../../utils/draftLogic';

interface DraftAreaProps {
  players: Player[];
  allPlayersCount: number;
  squad: Record<string, Player | null>;
  selectedSlot: PitchSlot | null;
  mode: GameMode;
  challenge: DraftChallenge;
  currentRollClub: string | null;
  rerollsRemaining: number;
  onRerollClub: () => void;
  onDraftPlayer: (player: Player) => void;
}

export type SortOption = 'rating-desc' | 'titles-desc' | 'appearances-desc' | 'name-asc';

export const DraftArea: React.FC<DraftAreaProps> = ({
  players,
  allPlayersCount,
  squad,
  selectedSlot,
  mode,
  challenge,
  currentRollClub,
  rerollsRemaining,
  onRerollClub,
  onDraftPlayer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<PlayerCategory | 'ALL'>('ALL');
  const [filterClub, setFilterClub] = useState<string>('ALL');
  const [filterEra, setFilterEra] = useState<Era | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('rating-desc');

  // Filtered and sorted candidate pool
  const displayedPlayers = useMemo(() => {
    return players
      .filter((p) => {
        // If in Club Draw challenge, restrict to current drawn club unless "ALL" override
        if (challenge === 'club-draw' && currentRollClub && !p.uclClubs.includes(currentRollClub)) {
          return false;
        }

        // Search text
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchClub = p.uclClubs.some((c) => c.toLowerCase().includes(q));
          const matchNation = p.nationality.toLowerCase().includes(q);
          const matchPos = p.specificPosition.toLowerCase().includes(q);
          if (!matchName && !matchClub && !matchNation && !matchPos) return false;
        }

        // Category filter
        if (filterCategory !== 'ALL' && p.primaryCategory !== filterCategory) return false;

        // Manual Club filter (in Open Scout mode)
        if (challenge === 'scout' && filterClub !== 'ALL' && !p.uclClubs.includes(filterClub)) {
          return false;
        }

        // Era filter
        if (filterEra !== 'ALL' && p.era !== filterEra) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating-desc') {
          // If in Almanac mode, we can still sort by underlying rating or by appearances/titles
          return b.editorialRating - a.editorialRating;
        }
        if (sortBy === 'titles-desc') {
          return b.uclStats.titles - a.uclStats.titles || b.editorialRating - a.editorialRating;
        }
        if (sortBy === 'appearances-desc') {
          return b.uclStats.appearances - a.uclStats.appearances;
        }
        if (sortBy === 'name-asc') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [players, challenge, currentRollClub, searchQuery, filterCategory, filterClub, filterEra, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterCategory('ALL');
    setFilterClub('ALL');
    setFilterEra('ALL');
    setSortBy('rating-desc');
  };

  return (
    <div className="flex flex-col h-full bg-white border border-[#DCE3EA] rounded-2xl p-4 shadow-sm">
      {/* Header & Controls */}
      <div className="space-y-3 pb-3 border-b border-[#DCE3EA]">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#3478F6]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#172638] font-heading">
              Candidate Pool
            </h2>
            <span className="text-xs text-[#697789] font-mono bg-[#F6F8FA] border border-[#DCE3EA] px-2 py-0.5 rounded-full">
              {displayedPlayers.length} Available
            </span>
          </div>

          {selectedSlot && (
            <div className="flex items-center gap-1.5 text-xs text-[#172638] bg-[#EDF4FF] border border-[#BFDBFE] px-2.5 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-[#3478F6] animate-ping" />
              <span>
                Targeting: <strong className="font-heading text-[#3478F6]">{selectedSlot.label}</strong>
              </span>
            </div>
          )}
        </div>

        {/* 7a0 Club Draw Challenge Banner */}
        {challenge === 'club-draw' && (
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#3478F6] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Dices className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#3478F6] tracking-wider block">
                  Current Turn Draw
                </span>
                <span className="font-heading text-lg font-black text-[#172638]">
                  {currentRollClub || 'Pick Any Club'}
                </span>
              </div>
            </div>

            <button
              onClick={onRerollClub}
              disabled={rerollsRemaining <= 0}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-[#172638] border border-[#DCE3EA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#3478F6]" />
              <span>Reroll ({rerollsRemaining} left)</span>
            </button>
          </div>
        )}

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#697789]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search legends, clubs, nationalities, or roles..."
            className="w-full bg-[#F6F8FA] border border-[#DCE3EA] rounded-xl pl-9 pr-9 py-2 text-xs sm:text-sm text-[#172638] placeholder-[#697789] focus:outline-none focus:border-[#3478F6] focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#697789] hover:text-[#172638]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilterCategory('ALL')}
            className={`px-3 py-1 text-xs font-bold rounded-lg whitespace-nowrap transition-all font-heading uppercase ${
              filterCategory === 'ALL'
                ? 'bg-[#172638] text-white shadow-2xs'
                : 'bg-[#F6F8FA] text-[#697789] hover:text-[#172638] hover:bg-[#E5E9F0] border border-[#DCE3EA]'
            }`}
          >
            All Roles
          </button>
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 text-xs font-bold rounded-lg whitespace-nowrap transition-all font-heading uppercase ${
                filterCategory === cat
                  ? 'bg-[#3478F6] text-white shadow-2xs'
                  : 'bg-[#F6F8FA] text-[#697789] hover:text-[#172638] hover:bg-[#E5E9F0] border border-[#DCE3EA]'
              }`}
            >
              {cat} ({CATEGORY_LABELS[cat]})
            </button>
          ))}
        </div>

        {/* Dropdown Filters & Sorting */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {/* Club (in Scout Mode) */}
          {challenge === 'scout' && (
            <div className="flex items-center gap-1 bg-[#F6F8FA] border border-[#DCE3EA] rounded-lg px-2 py-1.5">
              <span className="text-[10px] uppercase font-bold text-[#697789] tracking-wider">Club:</span>
              <select
                value={filterClub}
                onChange={(e) => setFilterClub(e.target.value)}
                className="bg-transparent text-[#172638] focus:outline-none w-full truncate text-xs font-medium"
              >
                <option value="ALL">All Clubs</option>
                {ALL_CLUBS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {/* Era */}
          <div className="flex items-center gap-1 bg-[#F6F8FA] border border-[#DCE3EA] rounded-lg px-2 py-1.5">
            <span className="text-[10px] uppercase font-bold text-[#697789] tracking-wider">Era:</span>
            <select
              value={filterEra}
              onChange={(e) => setFilterEra(e.target.value as Era | 'ALL')}
              className="bg-transparent text-[#172638] focus:outline-none w-full truncate text-xs font-medium"
            >
              <option value="ALL">All Eras</option>
              {ALL_ERAS.map((era) => (
                <option key={era} value={era}>{era}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1 bg-[#F6F8FA] border border-[#DCE3EA] rounded-lg px-2 py-1.5">
            <ArrowUpDown className="w-3 h-3 text-[#3478F6] shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-[#172638] focus:outline-none w-full truncate text-xs font-medium"
            >
              <option value="rating-desc">Rating (High to Low)</option>
              <option value="titles-desc">UCL Titles (Most)</option>
              <option value="appearances-desc">Appearances (Most)</option>
              <option value="name-asc">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-3 min-h-[350px] max-h-[720px]">
        {displayedPlayers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <div className="w-10 h-10 rounded-full bg-[#F6F8FA] border border-[#DCE3EA] flex items-center justify-center text-[#697789] mb-2">
              <Search className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-[#172638]">No eligible UCL players found</p>
            <p className="text-xs text-[#697789] mt-1">
              {challenge === 'club-draw'
                ? `No candidates match ${currentRollClub} for active filters. Try rerolling or clearing role filters.`
                : 'Try adjusting your search query or reset your filters.'}
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-3 px-3 py-1.5 text-xs font-semibold bg-[#F6F8FA] hover:bg-[#E5E9F0] text-[#3478F6] border border-[#DCE3EA] rounded-lg transition-colors"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayedPlayers.map((player) => {
              const drafted = isPlayerDrafted(squad, player.id);
              const slotId = drafted ? getDraftedSlotId(squad, player.id) : null;

              return (
                <PlayerCard
                  key={player.id}
                  player={player}
                  mode={mode}
                  isDrafted={drafted}
                  draftedSlotLabel={slotId ? slotId.toUpperCase() : null}
                  selectedSlot={selectedSlot}
                  onDraft={onDraftPlayer}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
