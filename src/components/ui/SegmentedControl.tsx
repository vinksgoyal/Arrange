import { clsx } from 'clsx';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  'aria-label': string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ...aria
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={aria['aria-label']}
      className="inline-flex w-full rounded-lg bg-surface-muted p-0.5 dark:bg-white/5"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={clsx(
            'flex-1 rounded-[7px] px-2.5 py-1.5 text-sm font-medium transition-colors duration-150',
            value === opt.value
              ? 'bg-white text-ink shadow-sm dark:bg-white dark:text-black'
              : 'text-ink-muted hover:text-ink dark:text-white/50 dark:hover:text-white',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
