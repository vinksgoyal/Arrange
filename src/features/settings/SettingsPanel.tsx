import type { ReactNode } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import type { Density, MarginSize, Orientation, PageSize, Spacing } from '@/types';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium text-ink-muted">{label}</span>
      {children}
    </div>
  );
}

export function SettingsPanel() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-ink dark:text-white">Page settings</h3>

      <Field label="Page size">
        <SegmentedControl<PageSize>
          aria-label="Page size"
          value={settings.pageSize}
          onChange={(pageSize) => updateSettings({ pageSize })}
          options={[
            { value: 'A4', label: 'A4' },
            { value: 'Letter', label: 'Letter' },
            { value: 'Legal', label: 'Legal' },
          ]}
        />
      </Field>

      <Field label="Orientation">
        <SegmentedControl<Orientation>
          aria-label="Orientation"
          value={settings.orientation}
          onChange={(orientation) => updateSettings({ orientation })}
          options={[
            { value: 'portrait', label: 'Portrait' },
            { value: 'landscape', label: 'Landscape' },
          ]}
        />
      </Field>

      <Field label="Margins">
        <SegmentedControl<MarginSize>
          aria-label="Margins"
          value={settings.margin}
          onChange={(margin) => updateSettings({ margin })}
          options={[
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
          ]}
        />
      </Field>

      <Field label="Spacing between images">
        <SegmentedControl<string>
          aria-label="Spacing"
          value={String(settings.spacing)}
          onChange={(v) => updateSettings({ spacing: Number(v) as Spacing })}
          options={[
            { value: '2', label: '2 mm' },
            { value: '4', label: '4 mm' },
            { value: '6', label: '6 mm' },
            { value: '8', label: '8 mm' },
          ]}
        />
      </Field>

      <Field label="Image density">
        <SegmentedControl<Density>
          aria-label="Image density"
          value={settings.density}
          onChange={(density) => updateSettings({ density })}
          options={[
            { value: 'large', label: 'Large' },
            { value: 'balanced', label: 'Balanced' },
            { value: 'saving', label: 'Max saving' },
          ]}
        />
        <p className="text-[11px] leading-snug text-ink-faint">
          {settings.density === 'large' && 'Fewer, larger images per page.'}
          {settings.density === 'balanced' && 'A comfortable mix of size and paper efficiency.'}
          {settings.density === 'saving' && 'Fits the most images per page to save paper.'}
        </p>
      </Field>
    </div>
  );
}
