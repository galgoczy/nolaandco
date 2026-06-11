'use client';
import { useState, useRef, FormEvent } from 'react';
import Input from '@/components/ui/Input';
import { birthDataSchema, BirthData } from '@/lib/validators';

interface BirthDataFormProps {
  initialValue?: BirthData | null;
  onSubmit: (data: BirthData) => void;
}

function formatDateEU(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return '';
  return `${y}/${m}/${d}`;
}

function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}/${digits.slice(4)}`;
  return `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6)}`;
}

/** Convert YYYY/MM/DD text to an ISO YYYY-MM-DD, or '' if incomplete/invalid. */
function parseDateEU(text: string): string {
  const m = text.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!m) return '';
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const d = parseInt(m[3], 10);
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) return '';
  return `${m[1]}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function formatTime24(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function clampTime(value: string): string {
  const m = value.match(/^(\d{1,2}):(\d{1,2})$/);
  if (!m) return value;
  let h = parseInt(m[1], 10);
  let min = parseInt(m[2], 10);
  if (Number.isNaN(h) || Number.isNaN(min)) return value;
  if (h > 23) h = 23;
  if (min > 59) min = 59;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

export default function BirthDataForm({ initialValue, onSubmit }: BirthDataFormProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    babyName: initialValue?.babyName ?? '',
    birthDate: initialValue?.birthDate ?? '',
    birthWeight: initialValue?.birthWeight ?? '',
    birthHeight: initialValue?.birthHeight ?? '',
    birthTime: initialValue?.birthTime ?? '',
    customNote: initialValue?.customNote ?? '',
  });
  const [dateText, setDateText] = useState(() =>
    formatDateEU(initialValue?.birthDate ?? '')
  );

  const [errors, setErrors] = useState<Partial<Record<keyof BirthData, string>>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof BirthData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDateTextChange = (raw: string) => {
    const text = formatDateInput(raw);
    setDateText(text);
    const iso = parseDateEU(text);
    setFormData((prev) => ({ ...prev, birthDate: iso }));
    if (errors.birthDate) setErrors((prev) => ({ ...prev, birthDate: undefined }));
  };

  const handleDatePickerChange = (iso: string) => {
    setFormData((prev) => ({ ...prev, birthDate: iso }));
    setDateText(formatDateEU(iso));
    if (errors.birthDate) setErrors((prev) => ({ ...prev, birthDate: undefined }));
  };

  const openDatePicker = () => {
    const el = dateInputRef.current;
    if (!el) return;
    if (typeof el.showPicker === 'function') {
      try {
        el.showPicker();
        return;
      } catch {
        /* fall through */
      }
    }
    el.focus();
    el.click();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = birthDataSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof BirthData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof BirthData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onSubmit(result.data);
  };

  return (
    <form
      id="birth-data-form"
      onSubmit={handleSubmit}
      className="bg-[#faf6f1] rounded-2xl p-6 md:p-8 space-y-5 shadow-sm scroll-mt-24"
    >
      <h3 className="text-lg font-bold text-carbon mb-2">Személyre szabás</h3>

      <Input
        label="Baba neve"
        name="babyName"
        value={formData.babyName}
        onChange={handleChange}
        error={errors.babyName}
        placeholder="Bence"
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="birthDate" className="text-carbon-light text-sm font-body">
          Születési dátum
        </label>
        <div className="relative">
          <input
            id="birthDate"
            type="text"
            inputMode="numeric"
            value={dateText}
            onChange={(e) => handleDateTextChange(e.target.value)}
            placeholder="ÉÉÉÉ/HH/NN"
            maxLength={10}
            className={`w-full bg-surface-container rounded-[0.75rem] px-4 py-3 pr-12 text-carbon font-body outline-none transition-colors focus:ring-2 focus:ring-primary/30 ${errors.birthDate ? 'ring-2 ring-red-400' : ''}`}
          />
          <button
            type="button"
            onClick={openDatePicker}
            aria-label="Naptár megnyitása"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-carbon-light hover:text-carbon hover:bg-white/60 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>
          <input
            ref={dateInputRef}
            type="date"
            value={formData.birthDate}
            onChange={(e) => handleDatePickerChange(e.target.value)}
            tabIndex={-1}
            aria-hidden="true"
            className="absolute opacity-0 pointer-events-none w-0 h-0"
          />
        </div>
        {errors.birthDate && (
          <span className="text-red-500 text-xs mt-0.5">{errors.birthDate}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="birthWeight" className="text-carbon-light text-sm font-body">
            Születési súly (gramm)
          </label>
          <input
            id="birthWeight"
            name="birthWeight"
            inputMode="numeric"
            pattern="[0-9]*"
            value={formData.birthWeight}
            onChange={(e) => {
              const onlyDigits = e.target.value.replace(/\D/g, '');
              setFormData((prev) => ({ ...prev, birthWeight: onlyDigits }));
              if (errors.birthWeight) setErrors((prev) => ({ ...prev, birthWeight: undefined }));
            }}
            placeholder="3450"
            className={`bg-surface-container rounded-[0.75rem] px-4 py-3 text-carbon font-body outline-none transition-colors focus:ring-2 focus:ring-primary/30 ${errors.birthWeight ? 'ring-2 ring-red-400' : ''}`}
          />
          {errors.birthWeight && (
            <span className="text-red-500 text-xs mt-0.5">{errors.birthWeight}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="birthHeight" className="text-carbon-light text-sm font-body">
            Születési hossz (cm)
          </label>
          <select
            id="birthHeight"
            name="birthHeight"
            value={formData.birthHeight}
            onChange={handleChange}
            className={`bg-surface-container rounded-[0.75rem] px-4 py-3 text-carbon font-body outline-none transition-colors focus:ring-2 focus:ring-primary/30 mt-3 md:mt-0 ${errors.birthHeight ? 'ring-2 ring-red-400' : ''}`}
          >
            <option value="">Válassz...</option>
            {Array.from({ length: 61 - 44 + 1 }, (_, i) => 44 + i).map((cm) => (
              <option key={cm} value={String(cm)}>
                {cm} cm
              </option>
            ))}
          </select>
          {errors.birthHeight && (
            <span className="text-red-500 text-xs mt-0.5">{errors.birthHeight}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="birthTime" className="text-carbon-light text-sm font-body">
          Születés időpontja (opcionális)
        </label>
        <input
          id="birthTime"
          name="birthTime"
          type="text"
          inputMode="numeric"
          value={formData.birthTime}
          onChange={(e) => {
            const formatted = formatTime24(e.target.value);
            setFormData((prev) => ({ ...prev, birthTime: formatted }));
            if (errors.birthTime) setErrors((prev) => ({ ...prev, birthTime: undefined }));
          }}
          onBlur={(e) => {
            const clamped = clampTime(e.target.value);
            if (clamped !== e.target.value) {
              setFormData((prev) => ({ ...prev, birthTime: clamped }));
            }
          }}
          placeholder="ÓÓ:PP"
          maxLength={5}
          className={`bg-surface-container rounded-[0.75rem] px-4 py-3 text-carbon font-body outline-none transition-colors focus:ring-2 focus:ring-primary/30 ${errors.birthTime ? 'ring-2 ring-red-400' : ''}`}
        />
        {errors.birthTime && (
          <span className="text-red-500 text-xs mt-0.5">{errors.birthTime}</span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="customNote"
          className="text-carbon-light text-sm font-body"
        >
          Megjegyzés
        </label>
        <textarea
          id="customNote"
          name="customNote"
          value={formData.customNote}
          onChange={handleChange}
          rows={3}
          maxLength={200}
          placeholder="Egyedi üzenet vagy kérés (opcionális)"
          className="bg-surface-container rounded-[0.75rem] px-4 py-3 text-carbon font-body outline-none transition-colors focus:ring-2 focus:ring-primary/30 resize-none"
        />
        {errors.customNote && (
          <span className="text-red-500 text-xs mt-0.5">{errors.customNote}</span>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-[#D5E8F0] text-[#4A4A4A] rounded-full px-8 py-3 font-bold btn-anim transition-all hover:shadow-md"
      >
        Mentés
      </button>
    </form>
  );
}
