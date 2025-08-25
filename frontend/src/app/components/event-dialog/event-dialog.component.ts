import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, startWith, map } from 'rxjs';
import { EventService } from '../../services/event.service';
import { UserService } from '../../services/user.service';
import { CalendarEvent, EventType, EventStatus, CreateEventRequest } from '../../models/event.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-event-dialog',
  templateUrl: './event-dialog.component.html',
  styleUrls: ['./event-dialog.component.scss']
})
export class EventDialogComponent implements OnInit {
  eventForm: FormGroup;
  isEdit: boolean = false;
  isLoading: boolean = false;
  
  eventTypes = Object.values(EventType);
  eventStatuses = Object.values(EventStatus);
  
  allUsers: User[] = [];
  selectedParticipants: User[] = [];
  filteredUsers: Observable<User[]>;

  constructor(
    private formBuilder: FormBuilder,
    private eventService: EventService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEdit = data.isEdit || false;
    
    this.eventForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      startDate: [null, Validators.required],
      startTime: ['', Validators.required],
      endDate: [null, Validators.required],
      endTime: ['', Validators.required],
      location: ['', [Validators.maxLength(100)]],
      eventType: [EventType.MEETING],
      status: [EventStatus.SCHEDULED],
      isAllDay: [false],
      isRecurring: [false],
      recurrencePattern: [''],
      participantSearch: ['']
    });

    this.filteredUsers = this.eventForm.get('participantSearch')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterUsers(value || ''))
    );
  }

  ngOnInit(): void {
    this.loadUsers();
    
    if (this.isEdit && this.data.event) {
      this.populateForm(this.data.event);
    } else if (this.data.startDate) {
      // Pre-fill start and end times from calendar selection
      const startDate = this.data.startDate;
      const endDate = this.data.endDate || new Date(this.data.startDate.getTime() + 60 * 60 * 1000); // 1 hour later
      
      this.eventForm.patchValue({
        startDate: startDate,
        startTime: this.formatTimeForInput(startDate),
        endDate: endDate,
        endTime: this.formatTimeForInput(endDate)
      });
    }
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users;
      },
      error: (error) => {
        console.error('Failed to load users:', error);
      }
    });
  }

  populateForm(event: CalendarEvent): void {
    const startDate = new Date(event.startTime);
    const endDate = new Date(event.endTime);
    
    this.eventForm.patchValue({
      title: event.title,
      description: event.description,
      startDate: startDate,
      startTime: this.formatTimeForInput(startDate),
      endDate: endDate,
      endTime: this.formatTimeForInput(endDate),
      location: event.location,
      eventType: event.eventType,
      status: event.status,
      isAllDay: event.isAllDay,
      isRecurring: event.isRecurring,
      recurrencePattern: event.recurrencePattern
    });

    if (event.participants) {
      this.selectedParticipants = [...event.participants];
    }
  }

  private _filterUsers(value: string): User[] {
    const filterValue = value.toLowerCase();
    return this.allUsers.filter(user => 
      !this.selectedParticipants.some(p => p.id === user.id) &&
      (user.username.toLowerCase().includes(filterValue) ||
       user.email.toLowerCase().includes(filterValue) ||
       (user.firstName && user.firstName.toLowerCase().includes(filterValue)) ||
       (user.lastName && user.lastName.toLowerCase().includes(filterValue)))
    );
  }

  addParticipant(user: User): void {
    if (!this.selectedParticipants.some(p => p.id === user.id)) {
      this.selectedParticipants.push(user);
      this.eventForm.get('participantSearch')?.setValue('');
    }
  }

  removeParticipant(user: User): void {
    this.selectedParticipants = this.selectedParticipants.filter(p => p.id !== user.id);
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      this.isLoading = true;
      
      const formValue = this.eventForm.value;
      const eventRequest: CreateEventRequest = {
        title: formValue.title,
        description: formValue.description,
        startTime: this.combineDateAndTime(formValue.startDate, formValue.startTime),
        endTime: this.combineDateAndTime(formValue.endDate, formValue.endTime),
        location: formValue.location,
        eventType: formValue.eventType,
        status: formValue.status,
        isAllDay: formValue.isAllDay,
        isRecurring: formValue.isRecurring,
        recurrencePattern: formValue.recurrencePattern,
        participantIds: this.selectedParticipants.map(p => p.id)
      };

      const operation = this.isEdit 
        ? this.eventService.updateEvent(this.data.event.id, eventRequest)
        : this.eventService.createEvent(eventRequest);

      operation.subscribe({
        next: (result) => {
          this.snackBar.open(
            this.isEdit ? 'Event updated successfully!' : 'Event created successfully!', 
            'Close', 
            { duration: 3000 }
          );
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open('Failed to save event. Please try again.', 'Close', { duration: 3000 });
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  onDelete(): void {
    if (this.isEdit && this.data.event.id) {
      this.isLoading = true;
      
      this.eventService.deleteEvent(this.data.event.id).subscribe({
        next: () => {
          this.snackBar.open('Event deleted successfully!', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open('Failed to delete event. Please try again.', 'Close', { duration: 3000 });
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  private formatTimeForInput(date: Date): string {
    return date.toTimeString().substring(0, 5); // Returns HH:MM format
  }

  private combineDateAndTime(date: Date, time: string): string {
    const [hours, minutes] = time.split(':');
    const combined = new Date(date);
    combined.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return combined.toISOString();
  }

  getUserDisplayName(user: User): string {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.username;
  }
}
