'use client';

import { Region, REGIONS } from '@/lib/playlist';

interface RegionTabsProps {
  active: Region;
  onChange: (region: Region) => void;
}

export default function RegionTabs({ active, onChange }: RegionTabsProps) {
  return (
    <div
      className="flex gap-1 p-1 rounded-lg region-tabs-container"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        position: 'relative',
      }}
      role="tablist"
      aria-label="Select region"
    >
      {REGIONS.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={isActive}
            id={`region-tab-${id}`}
            className={`region-tab${isActive ? ' active' : ''}`}
            onClick={() => onChange(id)}
            style={{
              position: 'relative',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
