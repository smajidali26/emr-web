/**
 * Patient Search Bar Component
 * Search bar with autocomplete for finding patients
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Input, Spinner } from '@/components/ui';
import { useSearchPatients } from '@/lib/api';
import { PatientSearchResult } from '@/types';
import { useDebounce } from '@/hooks/use-debounce';
import { Search, User } from 'lucide-react';
import { cn, calculateAge } from '@/lib/utils';

interface PatientSearchBarProps {
  onSelect?: (patient: PatientSearchResult) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export const PatientSearchBar: React.FC<PatientSearchBarProps> = ({
  onSelect,
  placeholder = 'Search patients by name, MRN, or phone...',
  className,
  autoFocus = false,
}) => {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const searchRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  const { data: results = [], isLoading } = useSearchPatients(
    { query: debouncedQuery },
    {
      enabled: debouncedQuery.length >= 2,
    }
  );

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus if requested
  React.useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length >= 2);
    setSelectedIndex(-1);
  };

  const handlePatientSelect = (patient: PatientSearchResult) => {
    setQuery('');
    setIsOpen(false);
    if (onSelect) {
      onSelect(patient);
    } else {
      router.push(`/patients/${patient.id}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handlePatientSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div ref={searchRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          {results.length > 0 ? (
            <ul className="max-h-80 overflow-auto py-1">
              {results.map((patient, index) => (
                <li key={patient.id}>
                  <button
                    type="button"
                    onClick={() => handlePatientSelect(patient)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent',
                      index === selectedIndex && 'bg-accent'
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>MRN: {patient.medicalRecordNumber}</span>
                        <span>
                          {calculateAge(new Date(patient.dateOfBirth))} yrs, {patient.gender}
                        </span>
                      </div>
                      {patient.primaryPhone && (
                        <p className="text-xs text-muted-foreground">{patient.primaryPhone}</p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            !isLoading && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No patients found matching &quot;{query}&quot;
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
