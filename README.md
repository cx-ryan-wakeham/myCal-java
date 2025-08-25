# Shared Calendar Application

A full-stack shared calendaring application built with Java Spring Boot backend and Angular frontend.

## Features

- **User Authentication**: JWT-based authentication with login/registration
- **Calendar Management**: Create, edit, delete, and view calendar events
- **Event Sharing**: Invite multiple participants to events
- **Multiple Views**: Month, week, and day calendar views
- **Event Types**: Categorize events (meeting, appointment, reminder, etc.)
- **Event Status**: Track event status (scheduled, confirmed, cancelled, etc.)
- **Responsive Design**: Modern Material Design UI

## Technology Stack

### Backend
- Java 17
- Spring Boot 3.1.5
- Spring Security with JWT
- Spring Data JPA
- H2 Database (in-memory)
- Maven

### Frontend
- Angular 16
- Angular Material
- FullCalendar
- TypeScript
- RxJS

## Project Structure

```
.
├── src/main/java/com/calendar/     # Java Spring Boot backend
│   ├── config/                     # Security configuration
│   ├── controller/                 # REST controllers
│   ├── dto/                        # Data Transfer Objects
│   ├── model/                      # JPA entities
│   ├── repository/                 # Data repositories
│   ├── security/                   # Security components
│   └── service/                    # Business logic
├── frontend/                       # Angular frontend
│   └── src/app/
│       ├── components/             # Angular components
│       ├── guards/                 # Route guards
│       ├── models/                 # TypeScript interfaces
│       └── services/               # Angular services
└── pom.xml                         # Maven dependencies
```

## Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 16+ and npm
- Maven 3.6+

### Backend Setup

1. Navigate to the project root directory
2. Build and run the Spring Boot application:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
3. The backend will start on `http://localhost:8080`
4. H2 Console available at `http://localhost:8080/h2-console`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. The frontend will start on `http://localhost:4200`

## API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration

### Events
- `GET /api/events` - Get all user events
- `GET /api/events/range` - Get events in date range
- `GET /api/events/{id}` - Get specific event
- `POST /api/events` - Create new event
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event
- `POST /api/events/{id}/participants/{userId}` - Add participant
- `DELETE /api/events/{id}/participants/{userId}` - Remove participant

### Users
- `GET /api/users/me` - Get current user
- `GET /api/users` - Get all users
- `GET /api/users/search` - Search users
- `GET /api/users/{id}` - Get user by ID

## Default Users

The application starts with an empty database. Create your first user through the registration page.

## Database Configuration

The application uses H2 in-memory database by default. Database settings can be found in `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    username: sa
    password: password
```

## Security

- JWT tokens for authentication
- CORS enabled for frontend communication
- Password encryption using BCrypt
- Stateless session management

## Calendar Features

### Event Management
- Create events with title, description, location
- Set start/end dates and times
- Mark events as all-day
- Set event types and status
- Add recurring patterns

### Sharing & Collaboration
- Invite multiple participants to events
- Search users by name, username, or email
- View shared events in calendar
- Manage participant lists

### Calendar Views
- Month view for overview
- Week view for detailed planning
- Day view for focused scheduling
- Responsive design for all screen sizes

## Development

### Backend Development
- The backend uses Spring Boot DevTools for hot reload
- Modify Java files and they will automatically restart
- Database schema is created automatically via JPA

### Frontend Development
- Angular CLI provides hot reload during development
- Use `ng generate` commands to create new components
- Material Design components for consistent UI

## Production Deployment

### Backend
Build the JAR file:
```bash
mvn clean package
java -jar target/shared-calendar-0.0.1-SNAPSHOT.jar
```

### Frontend
Build for production:
```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is for demonstration purposes.
