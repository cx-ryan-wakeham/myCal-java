import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CalendarOptions, EventClickArg, DateSelectArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventService } from '../../services/event.service';
import { CalendarEvent } from '../../models/event.model';
import { EventDialogComponent } from '../event-dialog/event-dialog.component';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    height: 'auto'
  };

  events: CalendarEvent[] = [];
  currentEvents: any[] = [];

  constructor(
    private eventService: EventService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.calendarOptions = {
          ...this.calendarOptions,
          events: this.transformEventsForCalendar(events)
        };
      },
      error: (error) => {
        this.snackBar.open('Failed to load events', 'Close', { duration: 3000 });
      }
    });
  }

  handleDateSelect(selectInfo: DateSelectArg): void {
    const dialogRef = this.dialog.open(EventDialogComponent, {
      width: '600px',
      data: {
        isEdit: false,
        startDate: selectInfo.start,
        endDate: selectInfo.end
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEvents(); // Reload events after creation
      }
    });

    // Clear the selection
    selectInfo.view.calendar.unselect();
  }

  handleEventClick(clickInfo: EventClickArg): void {
    const eventId = parseInt(clickInfo.event.id);
    const event = this.events.find(e => e.id === eventId);
    
    if (event) {
      const dialogRef = this.dialog.open(EventDialogComponent, {
        width: '600px',
        data: {
          isEdit: true,
          event: event
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadEvents(); // Reload events after edit/delete
        }
      });
    }
  }

  handleEvents(events: any[]): void {
    this.currentEvents = events;
  }

  private transformEventsForCalendar(events: CalendarEvent[]): any[] {
    return events.map(event => ({
      id: event.id?.toString(),
      title: event.title,
      start: event.startTime,
      end: event.endTime,
      allDay: event.isAllDay || false,
      color: this.getEventColor(event),
      extendedProps: {
        description: event.description,
        location: event.location,
        eventType: event.eventType,
        status: event.status,
        owner: event.ownerUsername,
        participants: event.participants
      }
    }));
  }

  private getEventColor(event: CalendarEvent): string {
    switch (event.eventType) {
      case 'MEETING': return '#2196F3';
      case 'APPOINTMENT': return '#4CAF50';
      case 'REMINDER': return '#FF9800';
      case 'BIRTHDAY': return '#E91E63';
      case 'HOLIDAY': return '#9C27B0';
      case 'PERSONAL': return '#00BCD4';
      case 'WORK': return '#607D8B';
      default: return '#2196F3';
    }
  }

  createEvent(): void {
    const dialogRef = this.dialog.open(EventDialogComponent, {
      width: '600px',
      data: {
        isEdit: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEvents();
      }
    });
  }
}
