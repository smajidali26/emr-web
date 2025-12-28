/**
 * User Avatar Component
 * Displays user avatar with initials fallback
 */

'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface UserAvatarProps {
  name?: string;
  email?: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

/**
 * Sanitize input string by removing special characters and HTML entities
 */
function sanitizeInput(input: string): string {
  // Remove HTML tags
  const withoutHtml = input.replace(/<[^>]*>/g, '');

  // Remove special characters except letters, numbers, and spaces
  const withoutSpecialChars = withoutHtml.replace(/[^a-zA-Z0-9\s]/g, '');

  // Decode common HTML entities
  const decoded = withoutSpecialChars
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");

  return decoded.trim();
}

/**
 * Get user initials from name or email
 * SECURITY: Sanitizes input to prevent XSS attacks
 */
function getInitials(name?: string, email?: string): string {
  if (name) {
    const sanitized = sanitizeInput(name);
    if (!sanitized) return 'U';

    const parts = sanitized.split(' ').filter(part => part.length > 0);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return sanitized.substring(0, 2).toUpperCase();
  }

  if (email) {
    const sanitized = sanitizeInput(email);
    if (!sanitized) return 'U';
    return sanitized.substring(0, 2).toUpperCase();
  }

  return 'U';
}

/**
 * Generate a consistent background color based on name or email
 */
function getAvatarColor(name?: string, email?: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-orange-500',
  ];

  const str = name || email || '';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export function UserAvatar({
  name,
  email,
  avatarUrl,
  size = 'md',
  className,
}: UserAvatarProps) {
  const initials = getInitials(name, email);
  const bgColor = getAvatarColor(name, email);

  // Generate descriptive alt text
  const altText = name
    ? `${name}'s avatar`
    : email
    ? `Avatar for ${email}`
    : 'User avatar';

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {avatarUrl && (
        <AvatarImage
          src={avatarUrl}
          alt={altText}
        />
      )}
      <AvatarFallback className={cn(bgColor, 'text-white font-semibold')}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
