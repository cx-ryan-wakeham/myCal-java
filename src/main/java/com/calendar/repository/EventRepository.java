package com.calendar.repository;

import com.calendar.model.Event;
import com.calendar.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    
    List<Event> findByOwner(User owner);
    
    List<Event> findByOwnerOrderByStartTimeAsc(User owner);
    
    @Query("SELECT e FROM Event e WHERE e.owner = :user OR :user MEMBER OF e.participants")
    List<Event> findEventsByUserInvolved(@Param("user") User user);
    
    @Query("SELECT e FROM Event e WHERE (e.owner = :user OR :user MEMBER OF e.participants) ORDER BY e.startTime ASC")
    List<Event> findEventsByUserInvolvedOrderByStartTime(@Param("user") User user);
    
    @Query("SELECT e FROM Event e WHERE (e.owner = :user OR :user MEMBER OF e.participants) AND e.startTime BETWEEN :startDate AND :endDate ORDER BY e.startTime ASC")
    List<Event> findEventsByUserAndDateRange(@Param("user") User user, 
                                           @Param("startDate") LocalDateTime startDate, 
                                           @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT e FROM Event e WHERE e.startTime BETWEEN :startDate AND :endDate ORDER BY e.startTime ASC")
    List<Event> findEventsByDateRange(@Param("startDate") LocalDateTime startDate, 
                                    @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT e FROM Event e WHERE (e.owner = :user OR :user MEMBER OF e.participants) AND e.title LIKE %:searchTerm%")
    List<Event> findEventsByUserAndSearchTerm(@Param("user") User user, 
                                            @Param("searchTerm") String searchTerm);
    
    @Query("SELECT e FROM Event e WHERE (e.owner = :user OR :user MEMBER OF e.participants) AND e.status = :status")
    List<Event> findEventsByUserAndStatus(@Param("user") User user, 
                                        @Param("status") Event.EventStatus status);
    
    @Query("SELECT e FROM Event e WHERE (e.owner = :user OR :user MEMBER OF e.participants) AND e.eventType = :eventType")
    List<Event> findEventsByUserAndEventType(@Param("user") User user, 
                                           @Param("eventType") Event.EventType eventType);
}
