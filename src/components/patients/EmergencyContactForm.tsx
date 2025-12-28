/**
 * Emergency Contact Form Component
 * Form for managing patient emergency contacts
 */

'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Button,
} from '@/components/ui';
import { EmergencyContact } from '@/types';
import { isValidPhoneNumber } from '@/lib/utils/security';
import { Plus, Trash2 } from 'lucide-react';

interface EmergencyContactFormProps {
  initialData?: EmergencyContact[];
  onSubmit: (contacts: EmergencyContact[]) => void;
  onBack?: () => void;
}

export const EmergencyContactForm: React.FC<EmergencyContactFormProps> = ({
  initialData = [],
  onSubmit,
  onBack,
}) => {
  const [contacts, setContacts] = React.useState<EmergencyContact[]>(
    initialData.length > 0 ? initialData : [createEmptyContact()]
  );
  const [errors, setErrors] = React.useState<Record<number, Record<string, string>>>({});

  function createEmptyContact(): EmergencyContact {
    return {
      name: '',
      relationship: '',
      phoneNumber: '',
    };
  }

  const addContact = () => {
    setContacts([...contacts, createEmptyContact()]);
  };

  const removeContact = (index: number) => {
    if (contacts.length > 1) {
      setContacts(contacts.filter((_, i) => i !== index));
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };

  const updateContact = (index: number, field: keyof EmergencyContact, value: string) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);

    // Clear error for this field
    if (errors[index]?.[field]) {
      const newErrors = { ...errors };
      delete newErrors[index][field];
      setErrors(newErrors);
    }
  };

  const validateContacts = (): boolean => {
    const newErrors: Record<number, Record<string, string>> = {};
    let isValid = true;

    contacts.forEach((contact, index) => {
      const contactErrors: Record<string, string> = {};

      if (!contact.name.trim()) {
        contactErrors.name = 'Name is required';
        isValid = false;
      }

      if (!contact.relationship.trim()) {
        contactErrors.relationship = 'Relationship is required';
        isValid = false;
      }

      if (!contact.phoneNumber.trim()) {
        contactErrors.phoneNumber = 'Phone number is required';
        isValid = false;
      } else if (!isValidPhoneNumber(contact.phoneNumber)) {
        contactErrors.phoneNumber = 'Invalid phone number format';
        isValid = false;
      }

      if (contact.alternatePhone && !isValidPhoneNumber(contact.alternatePhone)) {
        contactErrors.alternatePhone = 'Invalid phone number format';
        isValid = false;
      }

      if (Object.keys(contactErrors).length > 0) {
        newErrors[index] = contactErrors;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateContacts()) {
      // Filter out completely empty contacts
      const validContacts = contacts.filter(
        (contact) =>
          contact.name.trim() || contact.relationship.trim() || contact.phoneNumber.trim()
      );
      onSubmit(validContacts);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emergency Contacts</CardTitle>
        <CardDescription>
          Add at least one emergency contact who can be reached in case of emergency
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {contacts.map((contact, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Emergency Contact {index + 1}
                </CardTitle>
                {contacts.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeContact(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`contact-${index}-name`} className="required">
                    Full Name
                  </Label>
                  <Input
                    id={`contact-${index}-name`}
                    value={contact.name}
                    onChange={(e) => updateContact(index, 'name', e.target.value)}
                    placeholder="Jane Doe"
                    aria-invalid={!!errors[index]?.name}
                  />
                  {errors[index]?.name && (
                    <p className="text-xs text-destructive">{errors[index].name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`contact-${index}-relationship`} className="required">
                    Relationship
                  </Label>
                  <Input
                    id={`contact-${index}-relationship`}
                    value={contact.relationship}
                    onChange={(e) => updateContact(index, 'relationship', e.target.value)}
                    placeholder="Spouse, Parent, Sibling, etc."
                    aria-invalid={!!errors[index]?.relationship}
                  />
                  {errors[index]?.relationship && (
                    <p className="text-xs text-destructive">{errors[index].relationship}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`contact-${index}-phone`} className="required">
                    Phone Number
                  </Label>
                  <Input
                    id={`contact-${index}-phone`}
                    type="tel"
                    value={contact.phoneNumber}
                    onChange={(e) => updateContact(index, 'phoneNumber', e.target.value)}
                    placeholder="(555) 123-4567"
                    aria-invalid={!!errors[index]?.phoneNumber}
                  />
                  {errors[index]?.phoneNumber && (
                    <p className="text-xs text-destructive">{errors[index].phoneNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`contact-${index}-altphone`}>Alternate Phone</Label>
                  <Input
                    id={`contact-${index}-altphone`}
                    type="tel"
                    value={contact.alternatePhone || ''}
                    onChange={(e) => updateContact(index, 'alternatePhone', e.target.value)}
                    placeholder="(555) 987-6543"
                    aria-invalid={!!errors[index]?.alternatePhone}
                  />
                  {errors[index]?.alternatePhone && (
                    <p className="text-xs text-destructive">{errors[index].alternatePhone}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button type="button" variant="outline" onClick={addContact} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Another Contact
        </Button>

        <div className="flex justify-between pt-4">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
          )}
          <Button onClick={handleSubmit}>Continue</Button>
        </div>
      </CardContent>
    </Card>
  );
};
