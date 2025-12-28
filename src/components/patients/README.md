# Patient Components - Developer Guide

## Quick Start

### Importing Components

```typescript
import {
  PatientRegistrationForm,
  PatientDemographicsForm,
  EmergencyContactForm,
  InsuranceForm,
  PatientSearchBar,
  PatientCard,
  PatientList,
} from '@/components/patients';
```

---

## Component Usage

### PatientRegistrationForm

Multi-step registration wizard for new patients.

```typescript
<PatientRegistrationForm
  onSuccess={(patientId) => {
    // Handle successful registration
    router.push(`/patients/${patientId}`);
  }}
/>
```

**Features**:
- 4-step wizard: Demographics → Emergency → Insurance → Review
- Built-in validation
- Progress indicator
- Auto-saves data between steps

---

### PatientDemographicsForm

Reusable form for editing patient demographics.

```typescript
<PatientDemographicsForm
  initialData={patient.demographics}
  onSubmit={async (data) => {
    await updatePatientMutation.mutateAsync({
      id: patientId,
      data: { demographics: data },
    });
  }}
  onCancel={() => router.back()}
  isLoading={isUpdating}
/>
```

**Props**:
- `initialData?`: Pre-populate form
- `onSubmit`: Callback with validated data
- `onCancel?`: Cancel handler
- `isLoading?`: Show loading state
- `className?`: Additional CSS classes

---

### EmergencyContactForm

Form for managing multiple emergency contacts.

```typescript
<EmergencyContactForm
  initialData={emergencyContacts}
  onSubmit={(contacts) => {
    // Handle contacts array
  }}
  onBack={() => goToPreviousStep()}
/>
```

**Features**:
- Add/remove contacts dynamically
- Validation for required fields
- Phone number validation

---

### InsuranceForm

Form for managing multiple insurance policies.

```typescript
<InsuranceForm
  initialData={insurances}
  onSubmit={(insurances) => {
    // Handle insurances array
  }}
  onBack={() => goToPreviousStep()}
/>
```

**Features**:
- Multiple policies support
- Primary insurance designation
- Effective/expiration dates
- Optional (can skip)

---

### PatientSearchBar

Search bar with autocomplete functionality.

```typescript
<PatientSearchBar
  onSelect={(patient) => {
    // Handle patient selection
    router.push(`/patients/${patient.id}`);
  }}
  placeholder="Search patients..."
  autoFocus={true}
/>
```

**Features**:
- Real-time search (debounced 300ms)
- Keyboard navigation
- Displays: Avatar, name, MRN, age, gender
- Minimum 2 characters to search

**Keyboard Shortcuts**:
- `↑/↓`: Navigate results
- `Enter`: Select patient
- `Escape`: Close dropdown

---

### PatientCard

Display card for patient information.

```typescript
<PatientCard
  patient={patient}
  onClick={() => router.push(`/patients/${patient.id}`)}
  showDetails={true}
/>
```

**Props**:
- `patient`: Patient or PatientSearchResult
- `onClick?`: Custom click handler
- `className?`: Additional CSS classes
- `showDetails?`: Show extended info (default: true)

**Displays**:
- Name, MRN, age, gender
- Phone, email, address
- Status badges (inactive, deceased)
- Last visit date

---

### PatientList

Paginated list of patients with grid layout.

```typescript
<PatientList
  filters={{ isActive: true }}
  onPatientClick={(id) => router.push(`/patients/${id}`)}
  pageSize={20}
/>
```

**Props**:
- `filters?`: Search filters
- `onPatientClick?`: Custom click handler
- `pageSize?`: Items per page (default: 20)
- `className?`: Additional CSS classes

**Features**:
- Responsive grid (1/2/3 columns)
- Pagination controls
- Loading states
- Empty states
- Error handling

---

## API Hooks

### Query Hooks

```typescript
import { usePatient, usePatients, useSearchPatients } from '@/lib/api';

// Get single patient
const { data, isLoading, error } = usePatient(patientId);

// Get paginated patients
const { data, isLoading } = usePatients({
  page: 1,
  pageSize: 20,
  filter: { isActive: true },
});

// Search patients
const { data: results } = useSearchPatients({
  query: searchTerm,
});
```

### Mutation Hooks

```typescript
import {
  useRegisterPatient,
  useUpdatePatient,
  useDeactivatePatient,
} from '@/lib/api';

// Register new patient
const registerMutation = useRegisterPatient({
  onSuccess: (patient) => {
    console.log('Registered:', patient.id);
  },
});

// Update patient
const updateMutation = useUpdatePatient({
  onSuccess: () => {
    console.log('Updated successfully');
  },
});

// Deactivate patient
const deactivateMutation = useDeactivatePatient();
```

---

## State Management

```typescript
import { usePatientStore } from '@/stores';

function MyComponent() {
  const {
    selectedPatient,
    setSelectedPatient,
    recentPatients,
    addRecentPatient,
    searchFilters,
    setSearchFilters,
  } = usePatientStore();

  // Use the state and actions
}
```

---

## Security Utilities

```typescript
import {
  maskSSN,
  formatSSN,
  isValidSSN,
  maskPhoneNumber,
  formatPhoneNumber,
  isValidPhoneNumber,
  calculateAge,
  checkPatientDataPermission,
} from '@/lib/utils';

// Mask SSN for display
const maskedSSN = maskSSN('123456789'); // "XXX-XX-6789"

// Format phone number
const phone = formatPhoneNumber('5551234567'); // "(555) 123-4567"

// Calculate age
const age = calculateAge(new Date('1990-01-01')); // 34

// Check permissions
const permission = checkPatientDataPermission(
  user.roles,
  'edit'
);
if (!permission.canEdit) {
  console.log(permission.reason);
}
```

---

## Common Patterns

### Patient Detail Page

```typescript
'use client';

import { usePatient } from '@/lib/api';
import { useParams } from 'next/navigation';

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params?.id as string;

  const { data: patient, isLoading, error } = usePatient(patientId);

  if (isLoading) return <Spinner />;
  if (error) return <Alert variant="destructive">{error.message}</Alert>;
  if (!patient) return <Alert>Patient not found</Alert>;

  return (
    <div>
      {/* Display patient information */}
    </div>
  );
}
```

### Patient Search Page

```typescript
'use client';

import { PatientSearchBar, PatientList } from '@/components/patients';
import { useState } from 'react';

export default function PatientsPage() {
  const [filters, setFilters] = useState({});

  return (
    <div>
      <PatientSearchBar
        onSelect={(patient) => {
          // Navigate to detail page
        }}
      />
      <PatientList filters={filters} />
    </div>
  );
}
```

### Patient Registration

```typescript
'use client';

import { PatientRegistrationForm } from '@/components/patients';
import { useRouter } from 'next/navigation';

export default function NewPatientPage() {
  const router = useRouter();

  return (
    <PatientRegistrationForm
      onSuccess={(patientId) => {
        router.push(`/patients/${patientId}`);
      }}
    />
  );
}
```

### Patient Edit with Permissions

```typescript
'use client';

import { PatientDemographicsForm } from '@/components/patients';
import { usePatient, useUpdatePatient } from '@/lib/api';
import { useAuth } from '@/hooks';
import { checkPatientDataPermission } from '@/lib/utils';

export default function EditPatientPage({ params }) {
  const { user } = useAuth();
  const { data: patient } = usePatient(params.id);
  const updateMutation = useUpdatePatient();

  const permission = checkPatientDataPermission(user?.roles || [], 'edit');

  if (!permission.canEdit) {
    return <Alert variant="destructive">{permission.reason}</Alert>;
  }

  return (
    <PatientDemographicsForm
      initialData={patient?.demographics}
      onSubmit={async (data) => {
        await updateMutation.mutateAsync({
          id: params.id,
          data: { demographics: data },
        });
      }}
      isLoading={updateMutation.isPending}
    />
  );
}
```

---

## Validation Examples

### Custom Validation

```typescript
import {
  isValidSSN,
  isValidPhoneNumber,
  isValidDateOfBirth,
} from '@/lib/utils/security';

// SSN Validation
if (ssn && !isValidSSN(ssn)) {
  setError('Invalid SSN format');
}

// Phone Validation
if (!isValidPhoneNumber(phone)) {
  setError('Invalid phone number');
}

// DOB Validation
const dob = new Date(dateInput);
if (!isValidDateOfBirth(dob)) {
  setError('Invalid date of birth');
}
```

---

## Error Handling

### API Errors

```typescript
const { data, error, isError } = usePatient(patientId);

if (isError) {
  // Error is typed as ApiError
  console.log(error.code);        // Error code
  console.log(error.message);     // User-friendly message
  console.log(error.statusCode);  // HTTP status
  console.log(error.details);     // Additional details
}
```

### Mutation Errors

```typescript
const mutation = useRegisterPatient({
  onError: (error) => {
    if (error.statusCode === 409) {
      toast.error('Patient already exists');
    } else {
      toast.error(error.message);
    }
  },
});
```

---

## Best Practices

### 1. Always Use Security Utils
```typescript
// ✅ Good - Mask sensitive data
<span>{maskSSN(patient.ssn)}</span>

// ❌ Bad - Expose full SSN
<span>{patient.ssn}</span>
```

### 2. Check Permissions
```typescript
// ✅ Good - Check permissions first
const permission = checkPatientDataPermission(user.roles, 'edit');
if (permission.canEdit) {
  // Show edit button
}

// ❌ Bad - Assume user has permission
<Button onClick={handleEdit}>Edit</Button>
```

### 3. Use Secure Logging
```typescript
import { secureLogger } from '@/lib/utils/secure-logger';

// ✅ Good - Sensitive data will be redacted
secureLogger.info('Patient updated', { patient });

// ❌ Bad - May log sensitive data
console.log('Patient updated', patient);
```

### 4. Handle Loading States
```typescript
// ✅ Good - Show loading state
if (isLoading) return <Spinner />;

// ❌ Bad - No loading indicator
return <div>{patient?.name}</div>; // May be undefined
```

### 5. Validate User Input
```typescript
// ✅ Good - Validate before submission
if (!isValidPhoneNumber(phone)) {
  setError('Invalid phone number');
  return;
}
submitForm();

// ❌ Bad - No validation
submitForm(); // May send invalid data
```

---

## TypeScript Types

```typescript
import type {
  Patient,
  PatientDemographics,
  PatientSearchResult,
  PatientSearchFilters,
  Gender,
  MaritalStatus,
  Race,
  Ethnicity,
  BloodType,
  Address,
  ContactInfo,
  EmergencyContact,
  Insurance,
} from '@/types';
```

---

## Troubleshooting

### Search Not Working
- Check minimum 2 characters entered
- Verify API endpoint is accessible
- Check network tab for errors
- Ensure search query is debounced

### Form Not Submitting
- Check validation errors
- Ensure all required fields filled
- Check browser console for errors
- Verify API endpoint exists

### Permission Denied
- Check user roles in auth context
- Verify permission checking logic
- Ensure backend permissions match
- Check for role typos (case-sensitive)

### SSN Masking Not Working
- Ensure using `maskSSN` utility
- Check SSN format (9 digits)
- Verify import path is correct

---

## Performance Tips

1. **Use React.memo for Cards**
   - PatientCard already optimized
   - Avoid prop changes that trigger re-renders

2. **Debounce Search Input**
   - Already implemented (300ms)
   - Prevents excessive API calls

3. **Paginate Large Lists**
   - Use PatientList component
   - Configure appropriate page size

4. **Cache Query Results**
   - TanStack Query handles caching
   - Default: 5min stale, 30min GC

5. **Lazy Load Images**
   - Use Next.js Image component
   - Implement placeholder avatars

---

## Additional Resources

- **Main Documentation**: `/PATIENT_REGISTRATION_IMPLEMENTATION.md`
- **Type Definitions**: `/src/types/patient.types.ts`
- **API Reference**: `/src/lib/api/patient-api.ts`
- **Security Utils**: `/src/lib/utils/security.ts`
- **Component Source**: `/src/components/patients/`
