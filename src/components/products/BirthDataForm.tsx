'use client';
import { useState, FormEvent } from 'react';
import Input from '@/components/ui/Input';
import { birthDataSchema, BirthData } from '@/lib/validators';

interface BirthDataFormProps {
  onSubmit: (data: BirthData) => void;
}

function formatDateEU(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return '';
  return `${y}/${m}/${d}`;
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

export default function BirthDataForm({ onSubmit }: BirthDataFormProps) {
  const [formData, setFormData] = useState({
    babyName: '',
    birthDate: '',
    birthWeight: '',
    birthHeight: '',
    birthTime: '',
    customNote: '',
  });

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
          <div
            className={`w-full bg-surface-container rounded-[0.75rem] px-4 py-3 text-carbon font-body transition-colors ${
              errors.birthDate ? 'ring-2 ring-red-400' : ''
            }`}
          >
            {formData.birthDate ? (
              formatDateEU(formData.birthDate)
            ) : (
              <span className="text-carbon-light/60">ÉÉÉÉ/HH/NN</span>
            )}
          </div>
          <input
            id="birthDate"
            name="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
