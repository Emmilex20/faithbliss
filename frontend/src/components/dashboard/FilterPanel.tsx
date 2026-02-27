import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Filter, RotateCcw, X } from 'lucide-react';
import AppDropdown from '@/components/AppDropdown';

export interface DashboardFiltersPayload {
  preferredGender?: 'MALE' | 'FEMALE';
  preferredDenominations?: string[];
  minAge?: number;
  maxAge?: number;
  maxDistance?: number;
  preferredMinHeight?: number;
  preferredFaithJourney?: string[];
  preferredChurchAttendance?: string[];
  preferredRelationshipGoals?: string[];
}

export type DashboardFilterFocusSection =
  | 'gender'
  | 'distance'
  | 'age'
  | 'height'
  | 'faith-journey'
  | 'denomination'
  | 'church-attendance'
  | 'relationship-goal';

interface FilterPanelProps {
  onClose: () => void;
  onApplyFilters: (filters: DashboardFiltersPayload) => void;
  isOpen?: boolean;
  initialFocusSection?: DashboardFilterFocusSection | null;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const sanitizeNumberInput = (value: string, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const INTERESTED_IN_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'MALE', label: 'Men' },
  { value: 'FEMALE', label: 'Women' },
];

const FAITH_JOURNEY_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'EXPLORING', label: 'Exploring' },
  { value: 'GROWING', label: 'Growing' },
  { value: 'ROOTED', label: 'Rooted' },
  { value: 'PASSIONATE', label: 'Passionate' },
];

const DENOMINATION_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'BAPTIST', label: 'Baptist' },
  { value: 'METHODIST', label: 'Methodist' },
  { value: 'PRESBYTERIAN', label: 'Presbyterian' },
  { value: 'PENTECOSTAL', label: 'Pentecostal' },
  { value: 'CATHOLIC', label: 'Catholic' },
  { value: 'ORTHODOX', label: 'Orthodox' },
  { value: 'ANGLICAN', label: 'Anglican' },
  { value: 'LUTHERAN', label: 'Lutheran' },
  { value: 'ASSEMBLIES_OF_GOD', label: 'Assemblies of God' },
  { value: 'SEVENTH_DAY_ADVENTIST', label: 'Seventh-day Adventist' },
  { value: 'OTHER', label: 'Other' },
];

const CHURCH_ATTENDANCE_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BIWEEKLY', label: 'Bi-weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'OCCASIONALLY', label: 'Occasionally' },
  { value: 'RARELY', label: 'Rarely' },
];

const RELATIONSHIP_GOAL_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'FRIENDSHIP', label: 'Friendship' },
  { value: 'RELATIONSHIP', label: 'Relationship' },
  { value: 'MARRIAGE_MINDED', label: 'Marriage-minded' },
];

export const FilterPanel = ({ onClose, onApplyFilters, isOpen = false, initialFocusSection = null }: FilterPanelProps) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | ''>('');
  const [distance, setDistance] = useState(50);
  const [minAge, setMinAge] = useState(22);
  const [maxAge, setMaxAge] = useState(40);
  const [minHeight, setMinHeight] = useState(120);
  const [faithJourney, setFaithJourney] = useState('');
  const [churchAttendance, setChurchAttendance] = useState('');
  const [relationshipGoal, setRelationshipGoal] = useState('');
  const [denomination, setDenomination] = useState('');

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (gender) count += 1;
    if (distance !== 50) count += 1;
    if (minAge !== 22 || maxAge !== 40) count += 1;
    if (minHeight > 120) count += 1;
    if (faithJourney) count += 1;
    if (churchAttendance) count += 1;
    if (relationshipGoal) count += 1;
    if (denomination) count += 1;
    return count;
  }, [churchAttendance, denomination, distance, faithJourney, gender, maxAge, minAge, minHeight, relationshipGoal]);

  const resetLocalState = () => {
    setGender('');
    setDistance(50);
    setMinAge(22);
    setMaxAge(40);
    setMinHeight(120);
    setFaithJourney('');
    setChurchAttendance('');
    setRelationshipGoal('');
    setDenomination('');
  };

  const buildPayload = (): DashboardFiltersPayload => {
    const safeMinAge = clamp(Math.round(minAge), 18, 99);
    const safeMaxAge = clamp(Math.round(maxAge), 18, 99);
    const normalizedMinAge = Math.min(safeMinAge, safeMaxAge);
    const normalizedMaxAge = Math.max(safeMinAge, safeMaxAge);

    const payload: DashboardFiltersPayload = {};
    if (gender) payload.preferredGender = gender;
    if (distance !== 50) payload.maxDistance = clamp(Math.round(distance), 1, 500);
    if (minAge !== 22 || maxAge !== 40) {
      payload.minAge = normalizedMinAge;
      payload.maxAge = normalizedMaxAge;
    }
    if (minHeight > 120) payload.preferredMinHeight = clamp(Math.round(minHeight), 120, 220);
    if (faithJourney) payload.preferredFaithJourney = [faithJourney];
    if (churchAttendance) payload.preferredChurchAttendance = [churchAttendance];
    if (relationshipGoal) payload.preferredRelationshipGoals = [relationshipGoal];
    if (denomination) payload.preferredDenominations = [denomination];

    return payload;
  };

  const handleApply = () => {
    onApplyFilters(buildPayload());
    onClose();
  };

  const handleClear = () => {
    resetLocalState();
    onApplyFilters({});
    onClose();
  };

  useEffect(() => {
    if (!isOpen || !initialFocusSection) return;

    if (initialFocusSection === 'denomination' || initialFocusSection === 'church-attendance' || initialFocusSection === 'relationship-goal') {
      setShowAdvanced(true);
    }

    const timer = window.setTimeout(() => {
      const selector = `[data-filter-section="${initialFocusSection}"]`;
      const section = scrollContainerRef.current?.querySelector(selector) as HTMLElement | null;
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 140);

    return () => window.clearTimeout(timer);
  }, [initialFocusSection, isOpen]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-slate-700/60">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Filter className="w-5 h-5 text-pink-400" />
              Match Filters
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Refine your discovery feed with accurate preferences.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700/60 transition-colors"
            aria-label="Close filters"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>
        <div className="mt-3 inline-flex items-center rounded-full bg-pink-500/15 border border-pink-400/30 px-3 py-1 text-xs font-semibold text-pink-200">
          {activeFilterCount} active filter{activeFilterCount === 1 ? '' : 's'}
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 space-y-5">
        <section data-filter-section="gender" className="rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-4">
          <label className="block text-xs font-semibold uppercase tracking-wide text-indigo-200 mb-2">Interested In</label>
          <AppDropdown
            value={gender}
            onChange={(next) => setGender(next as 'MALE' | 'FEMALE' | '')}
            options={INTERESTED_IN_OPTIONS}
            placeholder="Any"
            triggerClassName="w-full rounded-xl bg-slate-900/70 border border-indigo-300/30 px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-400/40"
            menuClassName="border-indigo-300/30 bg-slate-900/98"
          />
        </section>

        <section data-filter-section="distance" className="rounded-2xl border border-pink-400/20 bg-pink-500/10 p-4">
          <label className="block text-xs font-semibold uppercase tracking-wide text-pink-200 mb-2">Distance</label>
          <input
            type="range"
            min={1}
            max={500}
            value={distance}
            onChange={(e) => setDistance(clamp(sanitizeNumberInput(e.target.value, 50), 1, 500))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
          <div className="mt-2 text-sm text-slate-200 font-semibold">{distance} km</div>
        </section>

        <section data-filter-section="age" className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
          <label className="block text-xs font-semibold uppercase tracking-wide text-cyan-200 mb-2">Age Range</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={18}
              max={99}
              value={minAge}
              onChange={(e) => setMinAge(clamp(sanitizeNumberInput(e.target.value, 22), 18, 99))}
              className="w-24 rounded-xl bg-slate-900/70 border border-cyan-300/30 px-3 py-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
            />
            <span className="text-slate-300 text-sm">to</span>
            <input
              type="number"
              min={18}
              max={99}
              value={maxAge}
              onChange={(e) => setMaxAge(clamp(sanitizeNumberInput(e.target.value, 40), 18, 99))}
              className="w-24 rounded-xl bg-slate-900/70 border border-cyan-300/30 px-3 py-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
            />
          </div>
        </section>

        <section data-filter-section="height" className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 p-4">
          <label className="block text-xs font-semibold uppercase tracking-wide text-fuchsia-200 mb-2">Minimum Height</label>
          <input
            type="range"
            min={120}
            max={220}
            value={minHeight}
            onChange={(e) => setMinHeight(clamp(sanitizeNumberInput(e.target.value, 120), 120, 220))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
          />
          <div className="mt-2 text-sm text-slate-200 font-semibold">{minHeight} cm +</div>
        </section>

        <section data-filter-section="faith-journey" className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
          <label className="block text-xs font-semibold uppercase tracking-wide text-emerald-200 mb-2">Faith Journey</label>
          <AppDropdown
            value={faithJourney}
            onChange={setFaithJourney}
            options={FAITH_JOURNEY_OPTIONS}
            placeholder="Any"
            triggerClassName="w-full rounded-xl bg-slate-900/70 border border-emerald-300/30 px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-400/40"
            menuClassName="border-emerald-300/30 bg-slate-900/98"
          />
        </section>

        <button
          type="button"
          onClick={() => setShowAdvanced((prev) => !prev)}
          className="w-full rounded-2xl border border-slate-600/60 bg-slate-800/60 px-4 py-3 text-sm text-white font-semibold flex items-center justify-between hover:bg-slate-700/60 transition-colors"
        >
          Advanced Filters
          <ChevronDown className={`w-5 h-5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {showAdvanced && (
          <div className="space-y-4">
            <section data-filter-section="denomination" className="rounded-2xl border border-purple-400/20 bg-purple-500/10 p-4">
              <label className="block text-xs font-semibold uppercase tracking-wide text-purple-200 mb-2">Denomination</label>
              <AppDropdown
                value={denomination}
                onChange={setDenomination}
                options={DENOMINATION_OPTIONS}
                placeholder="Any"
                searchable
                searchPlaceholder="Search denomination..."
                triggerClassName="w-full rounded-xl bg-slate-900/70 border border-purple-300/30 px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-purple-400/40"
                menuClassName="border-purple-300/30 bg-slate-900/98"
              />
            </section>

            <section data-filter-section="church-attendance" className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
              <label className="block text-xs font-semibold uppercase tracking-wide text-amber-200 mb-2">Church Attendance</label>
              <AppDropdown
                value={churchAttendance}
                onChange={setChurchAttendance}
                options={CHURCH_ATTENDANCE_OPTIONS}
                placeholder="Any"
                triggerClassName="w-full rounded-xl bg-slate-900/70 border border-amber-300/30 px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-amber-400/40"
                menuClassName="border-amber-300/30 bg-slate-900/98"
              />
            </section>

            <section data-filter-section="relationship-goal" className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4">
              <label className="block text-xs font-semibold uppercase tracking-wide text-rose-200 mb-2">Relationship Goal</label>
              <AppDropdown
                value={relationshipGoal}
                onChange={setRelationshipGoal}
                options={RELATIONSHIP_GOAL_OPTIONS}
                placeholder="Any"
                triggerClassName="w-full rounded-xl bg-slate-900/70 border border-rose-300/30 px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-rose-400/40"
                menuClassName="border-rose-300/30 bg-slate-900/98"
              />
            </section>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-700/60 space-y-3">
        <button
          type="button"
          onClick={handleApply}
          className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-3 text-white font-semibold hover:from-pink-400 hover:to-purple-500 transition-colors"
        >
          Apply Filters
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="w-full rounded-2xl border border-slate-600/70 bg-slate-800/60 px-4 py-3 text-slate-200 font-medium hover:bg-slate-700/60 transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Clear Filters
        </button>
      </div>
    </div>
  );
};
