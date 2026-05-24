import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    navigate(`/restaurants?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="hidden flex-1 max-w-md md:block">
      <label htmlFor="global-search" className="sr-only">
        Search restaurants
      </label>
      <input
        id="global-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search restaurants or cuisine..."
        className="input-field w-full py-2 text-sm"
      />
    </form>
  );
}
