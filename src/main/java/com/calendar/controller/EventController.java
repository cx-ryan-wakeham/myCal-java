package com.calendar.controller;

import com.calendar.dto.EventDto;
import com.calendar.dto.MessageResponse;
import com.calendar.security.UserPrincipal;
import com.calendar.service.EventService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;

    @GetMapping
    public ResponseEntity<List<EventDto>> getAllEvents(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<EventDto> events = eventService.getAllEventsForUser(userPrincipal.getId());
        return ResponseEntity.ok(events);
    }

    @GetMapping("/range")
    public ResponseEntity<List<EventDto>> getEventsInDateRange(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<EventDto> events = eventService.getEventsForUserInDateRange(userPrincipal.getId(), startDate, endDate);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDto> getEventById(@PathVariable Long id, 
                                                @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            EventDto event = eventService.getEventById(id, userPrincipal.getId());
            return ResponseEntity.ok(event);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<EventDto> createEvent(@Valid @RequestBody EventDto eventDto,
                                              @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            EventDto createdEvent = eventService.createEvent(eventDto, userPrincipal.getId());
            return ResponseEntity.ok(createdEvent);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventDto> updateEvent(@PathVariable Long id,
                                              @Valid @RequestBody EventDto eventDto,
                                              @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            EventDto updatedEvent = eventService.updateEvent(id, eventDto, userPrincipal.getId());
            return ResponseEntity.ok(updatedEvent);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteEvent(@PathVariable Long id,
                                                     @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            eventService.deleteEvent(id, userPrincipal.getId());
            return ResponseEntity.ok(new MessageResponse("Event deleted successfully!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/participants/{participantId}")
    public ResponseEntity<EventDto> addParticipant(@PathVariable Long id,
                                                 @PathVariable Long participantId,
                                                 @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            EventDto updatedEvent = eventService.addParticipantToEvent(id, participantId, userPrincipal.getId());
            return ResponseEntity.ok(updatedEvent);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}/participants/{participantId}")
    public ResponseEntity<EventDto> removeParticipant(@PathVariable Long id,
                                                    @PathVariable Long participantId,
                                                    @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            EventDto updatedEvent = eventService.removeParticipantFromEvent(id, participantId, userPrincipal.getId());
            return ResponseEntity.ok(updatedEvent);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
