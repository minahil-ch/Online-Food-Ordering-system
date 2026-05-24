import { useRef, useState } from 'react';
import { FOOD_STOCK_IMAGES, RESTAURANT_STOCK_IMAGES } from '../../data/stockImages';

export interface ImageSelection {
  file: File | null;
  url: string | null;
}

interface ImagePickerProps {
  label?: string;
  previewUrl: string | null;
  onChange: (selection: ImageSelection) => void;
  variant?: 'restaurant' | 'food';
}

type Tab = 'browse' | 'upload' | 'url';

export function ImagePicker({
  label = 'Image',
  previewUrl,
  onChange,
  variant = 'food',
}: ImagePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>('browse');
  const [urlInput, setUrlInput] = useState(previewUrl ?? '');
  const gallery = variant === 'restaurant' ? RESTAURANT_STOCK_IMAGES : FOOD_STOCK_IMAGES;

  const selectUrl = (url: string) => {
    setUrlInput(url);
    onChange({ file: null, url });
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setUrlInput(objectUrl);
    onChange({ file, url: null });
  };

  const applyUrl = () => {
    const trimmed = urlInput.trim();
    if (trimmed) {
      onChange({ file: null, url: trimmed });
    }
  };

  const displayPreview = previewUrl || urlInput || null;

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">{label}</label>

      {displayPreview && (
        <div className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <img src={displayPreview} alt="Selected preview" className="h-40 w-full object-cover" />
          <button
            type="button"
            className="absolute right-2 top-2 rounded-lg bg-black/60 px-2 py-1 text-xs text-white"
            onClick={() => {
              setUrlInput('');
              onChange({ file: null, url: null });
            }}
          >
            Remove
          </button>
        </div>
      )}

      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        {(
          [
            { id: 'browse' as Tab, label: 'Browse' },
            { id: 'upload' as Tab, label: 'Upload' },
            { id: 'url' as Tab, label: 'URL' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition ${
              tab === t.id
                ? 'bg-white text-brand-600 shadow dark:bg-gray-900'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'browse' && (
        <div>
          <p className="mb-2 text-xs text-gray-500">Click an image to select it</p>
          <div className="grid max-h-48 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
            {gallery.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => selectUrl(img.url)}
                className={`group relative overflow-hidden rounded-lg border-2 transition ${
                  previewUrl === img.url || urlInput === img.url
                    ? 'border-brand-600 ring-2 ring-brand-500/30'
                    : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                title={img.label}
              >
                <img src={img.url} alt={img.label} className="aspect-square w-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                  {img.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === 'upload' && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <p className="text-sm text-gray-600 dark:text-gray-400">Upload from your computer</p>
          <button
            type="button"
            className="btn-secondary mt-3"
            onClick={() => fileInputRef.current?.click()}
          >
            Browse files…
          </button>
          <p className="mt-2 text-xs text-gray-500">JPG, PNG, WebP · Max 5MB</p>
        </div>
      )}

      {tab === 'url' && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput.startsWith('blob:') ? '' : urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="input-field flex-1 text-sm"
          />
          <button type="button" className="btn-secondary shrink-0" onClick={applyUrl}>
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
