import { User } from './user.model';

export interface CalendarEvent {
  id?: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  eventType?: EventType;
  status?: EventStatus;
  isAllDay?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: string;
  ownerId?: number;
  ownerUsername?: string;
  participantIds?: number[];
  participants?: User[];
}

export enum EventType {
  MEETING = 'MEETING',
  APPOINTMENT = 'APPOINTMENT',
  REMINDER = 'REMINDER',
  BIRTHDAY = 'BIRTHDAY',
  HOLIDAY = 'HOLIDAY',
  PERSONAL = 'PERSONAL',
  WORK = 'WORK'
}

export enum EventStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  TENTATIVE = 'TENTATIVE'
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  eventType?: EventType;
  status?: EventStatus;
  isAllDay?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: string;
  participantIds?: number[];
}
