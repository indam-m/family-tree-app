'use client';

import { useState } from 'react';
import { useSearchPeople } from '@/hooks/usePerson';
import { Person } from '@/types/tree';

type Props = {
  onSelect: (person: Person) => void;
  placeholder?: string;
  excludeIds?: number[];
};

export default function PersonAutocomplete({
  onSelect,
  placeholder,
  excludeIds,
}: Props) {
  const [inputValue, setInputValue] = useState('');
  const [searchPeople, { data }] = useSearchPeople();
  const [showOptions, setShowOptions] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.length >= 3) {
      searchPeople({ variables: { search: value, excludeIds } });
      setShowOptions(true);
    } else {
      setShowOptions(false);
    }
  };

  const handleSelect = (person: Person) => {
    onSelect(person);
    setInputValue(`${person.firstName} ${person.lastName || ''}`);
    setShowOptions(false);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder || 'Search by name...'}
        className="w-full rounded-xl border border-gray-300 p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {showOptions && data?.searchPeople?.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-md">
          {data.searchPeople.map((person: Person) => (
            <li
              key={person.id}
              className="cursor-pointer px-4 py-2 hover:bg-blue-100"
              onClick={() => handleSelect(person)}
            >
              {person.firstName} {person.lastName} ({person.nickName})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
