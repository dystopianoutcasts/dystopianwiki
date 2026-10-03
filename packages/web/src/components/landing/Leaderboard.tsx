import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import type { TabId } from '../../lib/leaderboard';
import { loadNameMode, NAME_MODE_STORAGE_KEY, subscribeNameMode, type NameMode } from '../../lib/nameMode';
import { LeaderboardView, tabDomId } from './LeaderboardView';
import '../../styles/components/home-sections.css';
import '../../styles/components/leaderboard.css';

// "Season <n> leaderboard" (T66): aurora.leaderboard() (T65, migration 036) in four tabs.
// Before 036 exists the function is missing and the section shows one quiet line.
// Names follow the Survivor name / Username switch in "Who is on now" (T62): the same
// saved choice, a change on this page (subscribeNameMode) or on the map in another tab.

export function Leaderboard() {
  const { data, unavailable, loading } = useLeaderboard();
  const titleId = useId();
  const prefix = useId();
  const [tab, setTab] = useState<TabId>('kills');
  const [mode, setMode] = useState<NameMode>(() => loadNameMode());
  // Which tabs have "Show all N" pressed (T70): each tab folds and unfolds on its own.
  const [expanded, setExpanded] = useState<Partial<Record<TabId, boolean>>>({});
  const focusPending = useRef(false);

  useEffect(() => subscribeNameMode(setMode), []);
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === NAME_MODE_STORAGE_KEY) setMode(loadNameMode());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // An arrow key moved the selection: focus follows it (roving tabindex).
  useEffect(() => {
    if (!focusPending.current) return;
    focusPending.current = false;
    document.getElementById(tabDomId(prefix, tab))?.focus();
  }, [tab, prefix]);

  const onSelect = useCallback((next: TabId, viaKey: boolean) => {
    focusPending.current = viaKey;
    setTab(next);
  }, []);

  const onToggle = useCallback((t: TabId) => {
    setExpanded((prev) => ({ ...prev, [t]: !prev[t] }));
  }, []);

  return (
    <LeaderboardView
      titleId={titleId}
      prefix={prefix}
      data={data}
      unavailable={unavailable}
      loading={loading}
      mode={mode}
      tab={tab}
      onSelect={onSelect}
      expanded={expanded}
      onToggle={onToggle}
      now={new Date()}
    />
  );
}
