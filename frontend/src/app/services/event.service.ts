import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CalendarEvent, CreateEventRequest } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly API_URL = 'http://localhost:8080/api/events';

  constructor(private http: HttpClient) {}

  getAllEvents(): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(this.API_URL);
  }

  getEventsInDateRange(startDate: string, endDate: string): Observable<CalendarEvent[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<CalendarEvent[]>(`${this.API_URL}/range`, { params });
  }

  getEventById(id: number): Observable<CalendarEvent> {
    return this.http.get<CalendarEvent>(`${this.API_URL}/${id}`);
  }

  createEvent(event: CreateEventRequest): Observable<CalendarEvent> {
    return this.http.post<CalendarEvent>(this.API_URL, event);
  }

  updateEvent(id: number, event: CreateEventRequest): Observable<CalendarEvent> {
    return this.http.put<CalendarEvent>(`${this.API_URL}/${id}`, event);
  }

  deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  addParticipant(eventId: number, participantId: number): Observable<CalendarEvent> {
    return this.http.post<CalendarEvent>(`${this.API_URL}/${eventId}/participants/${participantId}`, {});
  }

  removeParticipant(eventId: number, participantId: number): Observable<CalendarEvent> {
    return this.http.delete<CalendarEvent>(`${this.API_URL}/${eventId}/participants/${participantId}`);
  }
}
