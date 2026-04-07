'use client';
import { useState, FormEvent } from 'react';
import Input from '@/components/ui/Input';
import { birthDataSchema, BirthData } from '@/lib/validators';

interface BirthDataFormProps {
  onSubmit: (data: BirthData) => void;
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      onSubmit={handleSubmit}
      className="bg-[#faf6f1] rounded-2xl p-6 md:p-8 space-y-5 shadow-sm"
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

      <Input
        label="Születési dátum"
        name="birthDate"
        type="date"
        value={formData.birthDate}
        onChange={handleChange}
        error={errors.birthDate}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Születési súly"
          name="birthWeight"
          value={formData.birthWeight}
          onChange={handleChange}
          error={errors.birthWeight}
          placeholder="3450g"
        />

        <Input
          label="Születési hossz"
          name="birthHeight"
          value={formData.birthHeight}
          onChange={handleChange}
          error={errors.birthHeight}
          placeholder="52cm"
        />
      </div>

      <Input
        label="Születés időpontja (opcionális)"
        name="birthTime"
        value={formData.birthTime}
        onChange={handleChange}
        error={errors.birthTime}
        placeholder="14:32"
      />

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
        className="w-full bg-primary text-on-primary rounded-full px-8 py-3 font-bold btn-anim transition-all hover:shadow-md"
      >
        Mentés
      </button>
    </form>
  );
}
