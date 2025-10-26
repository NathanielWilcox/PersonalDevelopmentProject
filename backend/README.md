# Backend API Documentation

## Database Schema

### User Profile Table

The `userprofile` table is optimized for both performance and data integrity.

#### Table Structure

| Column   | Type                                                     | Constraints                    | Description                    |
|----------|----------------------------------------------------------|--------------------------------|--------------------------------|
| idusers  | INT                                                      | PRIMARY KEY, AUTO_INCREMENT    | Unique identifier              |
| username | VARCHAR(45)                                              | NOT NULL, UNIQUE, LENGTH >= 3  | User's login name              |
| password | VARCHAR(255)                                             | NOT NULL                       | Bcrypt hashed password         |
| email    | VARCHAR(100)                                             | REGEX validation               | User's email address           |
| role     | ENUM                                                     | DEFAULT 'user'                 | User's system role             |
| created  | TIMESTAMP                                                | DEFAULT CURRENT_TIMESTAMP      | Account creation time          |

#### Indexes

1. **Primary Key**: `idusers`
   - Automatically indexed
   - Used for unique identification and relations

2. **Username Index**: `idx_username`
   - Type: UNIQUE
   - Used for: Login queries, username lookups
   - Benefits: Fast authentication checks

3. **Email Index**: `idx_email`
   - Type: NORMAL
   - Used for: Email searches
   - Benefits: Quick duplicate email checks

4. **Role-Created Index**: `idx_role_created`
   - Type: COMPOUND
   - Columns: (role, created)
   - Used for: Role-based queries with time filtering
   - Benefits: Efficient user listing by role and signup date

#### Constraints

1. **Username Constraints**
   - Minimum length: 3 characters
   - Pattern: Alphanumeric and underscores only
   - Must be unique

2. **Email Constraints**
   - Valid email format required if not null
   - Format: <username@domain.tld>
   - Maximum length: 100 characters

3. **Role Constraints**
   - Valid values: 'user', 'photographer', 'videographer', 'musician', 'artist', 'admin'
   - Default: 'user'

## API Endpoints

### Rate Limiting

All endpoints are protected by rate limiting:

| Endpoint          | Time Window | Max Requests | Error Response                    |
|-------------------|-------------|--------------|-----------------------------------|
| Create User       | 15 minutes  | 10          | Too many accounts created         |
| Get User Profiles | 15 minutes  | 100         | Too many requests                 |
| Login            | 15 minutes  | 10          | Too many login attempts           |

### Security Measures

1. **Password Handling**
   - Passwords are hashed using bcrypt
   - Salt rounds: 10
   - Never stored in plain text

2. **Authentication**
   - JWT-based authentication
   - Token expiration: 1 hour
   - Secure token storage in cookies

3. **Input Validation**
   - All inputs are sanitized
   - SQL injection prevention via parameterized queries
   - XSS protection through proper escaping

## Performance Optimizations

### Query Optimization

1. **SELECT Queries**
   - Specific column selection instead of SELECT *
   - Proper use of indexes
   - Efficient JOIN operations

2. **Database Connection**
   - Connection pooling
   - Automatic reconnection
   - Error handling with retries

### Best Practices

1. **Error Handling**
   - Comprehensive error catching
   - Proper error responses
   - Detailed error logging

2. **Security**
   - CORS configuration
   - Rate limiting
   - Input validation

## Development Guidelines

### Adding New Features

1. **Database Changes**
   - Add appropriate indexes for new queries
   - Include proper constraints
   - Document changes in schema

2. **API Endpoints**
   - Follow RESTful conventions
   - Include rate limiting
   - Add proper documentation
   - Implement input validation

### Testing

1. **Database Testing**
   - Test constraints
   - Verify index usage
   - Check query performance

2. **API Testing**
   - Test all endpoints
   - Verify rate limiting
   - Check error handling
  