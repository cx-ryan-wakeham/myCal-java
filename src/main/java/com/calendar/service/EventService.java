package com.calendar.service;

import com.calendar.dto.EventDto;
import com.calendar.model.Event;
import com.calendar.model.User;
import com.calendar.repository.EventRepository;
import com.calendar.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    public List<EventDto> getAllEventsForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return eventRepository.findEventsByUserInvolvedOrderByStartTime(user)
                .stream()
                .map(EventDto::new)
                .collect(Collectors.toList());
    }

    public List<EventDto> getEventsForUserInDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return eventRepository.findEventsByUserAndDateRange(user, startDate, endDate)
                .stream()
                .map(EventDto::new)
                .collect(Collectors.toList());
    }

    public EventDto getEventById(Long eventId, Long userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user has access to this event
        if (!hasAccessToEvent(event, user)) {
            throw new RuntimeException("Access denied to this event");
        }
        
        return new EventDto(event);
    }

    public EventDto createEvent(EventDto eventDto, Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Event event = new Event();
        updateEventFromDto(event, eventDto);
        event.setOwner(owner);
        
        // Add participants
        if (eventDto.getParticipantIds() != null && !eventDto.getParticipantIds().isEmpty()) {
            List<User> participants = userRepository.findByIdIn(eventDto.getParticipantIds());
            for (User participant : participants) {
                event.addParticipant(participant);
            }
        }
        
        Event savedEvent = eventRepository.save(event);
        return new EventDto(savedEvent);
    }

    public EventDto updateEvent(Long eventId, EventDto eventDto, Long userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is the owner of this event
        if (!event.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Only the event owner can update this event");
        }
        
        updateEventFromDto(event, eventDto);
        
        // Update participants
        if (eventDto.getParticipantIds() != null) {
            // Clear existing participants
            event.getParticipants().clear();
            
            // Add new participants
            if (!eventDto.getParticipantIds().isEmpty()) {
                List<User> participants = userRepository.findByIdIn(eventDto.getParticipantIds());
                for (User participant : participants) {
                    event.addParticipant(participant);
                }
            }
        }
        
        Event savedEvent = eventRepository.save(event);
        return new EventDto(savedEvent);
    }

    public void deleteEvent(Long eventId, Long userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        // Check if user is the owner of this event
        if (!event.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Only the event owner can delete this event");
        }
        
        eventRepository.delete(event);
    }

    public EventDto addParticipantToEvent(Long eventId, Long participantId, Long userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        User participant = userRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        // Check if user is the owner of this event
        if (!event.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Only the event owner can add participants");
        }
        
        event.addParticipant(participant);
        Event savedEvent = eventRepository.save(event);
        return new EventDto(savedEvent);
    }

    public EventDto removeParticipantFromEvent(Long eventId, Long participantId, Long userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        User participant = userRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        // Check if user is the owner of this event or the participant themselves
        if (!event.getOwner().getId().equals(userId) && !participantId.equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        
        event.removeParticipant(participant);
        Event savedEvent = eventRepository.save(event);
        return new EventDto(savedEvent);
    }

    private void updateEventFromDto(Event event, EventDto eventDto) {
        event.setTitle(eventDto.getTitle());
        event.setDescription(eventDto.getDescription());
        event.setStartTime(eventDto.getStartTime());
        event.setEndTime(eventDto.getEndTime());
        event.setLocation(eventDto.getLocation());
        event.setEventType(eventDto.getEventType());
        event.setStatus(eventDto.getStatus());
        event.setAllDay(eventDto.isAllDay());
        event.setRecurring(eventDto.isRecurring());
        event.setRecurrencePattern(eventDto.getRecurrencePattern());
    }

    private boolean hasAccessToEvent(Event event, User user) {
        return event.getOwner().getId().equals(user.getId()) || 
               event.getParticipants().contains(user);
    }
}
