# Blog API Endpoints Task

## Assignment
**Task:** Create REST API endpoints for blog CRUD operations using database
**Status:** Pending Assignment
**Priority:** High
**Estimated Time:** 3-4 hours

## Objective
Create a complete REST API for blog management that replaces localStorage with PostgreSQL database operations.

## Prerequisites
✅ Database setup complete (PostgreSQL + Drizzle ORM)
✅ Database schema created (`blog_posts` table)
⏳ GCS setup (for image handling)

## API Endpoints to Create

### Public Endpoints (Blog Display)
```
GET    /api/blog/posts              # Get published posts with pagination/filtering
GET    /api/blog/posts/:slug        # Get single published post by slug
GET    /api/blog/categories         # Get all categories
GET    /api/blog/tags               # Get all tags
```

### Admin Endpoints (Blog Management)
```
GET    /api/admin/blog/posts        # Get all posts (including drafts)
GET    /api/admin/blog/posts/:id    # Get single post by ID
POST   /api/admin/blog/posts        # Create new post
PUT    /api/admin/blog/posts/:id    # Update existing post
DELETE /api/admin/blog/posts/:id    # Delete post
PATCH  /api/admin/blog/posts/:id/publish   # Publish/unpublish post
PATCH  /api/admin/blog/posts/:id/feature   # Toggle featured status
```

## Implementation Requirements

### 1. Create API Directory Structure
```
/src/api/
  ├── blog/
  │   ├── index.ts          # Main blog routes
  │   ├── public.ts         # Public blog endpoints
  │   ├── admin.ts          # Admin blog endpoints
  │   └── validation.ts     # Request validation schemas
  └── middleware/
      ├── auth.ts           # Authentication middleware
      └── validation.ts     # Validation middleware
```

### 2. Database Service Layer
Create `/src/services/blogDatabaseService.ts` with:
- `getAllPosts(options)` - with pagination, filtering
- `getPostById(id)` 
- `getPostBySlug(slug)`
- `createPost(data)`
- `updatePost(id, data)`
- `deletePost(id)`
- `publishPost(id, published)`
- `toggleFeatured(id)`

### 3. Request Validation
Using Zod or similar for:
- Post creation validation
- Post update validation
- Query parameter validation
- File upload validation

### 4. Response Formatting
Standardized API responses:
```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 5. Error Handling
- Database connection errors
- Validation errors
- Authentication errors
- Not found errors
- Proper HTTP status codes

## Integration Points

### Database Integration
- Use existing Drizzle schema from `/src/db/schema.ts`
- Use database connection from `/src/db/index.ts`
- Handle database transactions for complex operations

### Authentication
- Integrate with existing admin auth system
- Protect admin endpoints
- Allow public access to published content

### File Handling
- Integrate with GCS service for image operations
- Handle featured image uploads
- Clean up images when posts are deleted

## Testing Requirements

### Unit Tests
- Database service functions
- Validation schemas
- Response formatting

### Integration Tests  
- Full CRUD operations
- Authentication flow
- Error scenarios

### Manual Testing
- API endpoints with Postman/Thunder Client
- Frontend integration
- Performance with large datasets

## Current State Analysis
- Blog data currently in `/src/data/blogData.ts` (static)
- Blog service in `/src/services/blogService.ts` (localStorage-based)
- Admin interface uses localStorage
- No API endpoints exist yet

## Migration Considerations
- Maintain compatibility with existing blog display components
- Update admin interface gradually
- Ensure no data loss during transition

## Expected Deliverables
1. ✅ Complete REST API with all endpoints
2. ✅ Database service layer with proper error handling
3. ✅ Request validation and response formatting
4. ✅ Authentication middleware for admin endpoints
5. ✅ Proper error handling and logging
6. ✅ API documentation (comments/README)
7. ✅ Integration with existing database schema

## Performance Considerations
- Implement pagination for large post lists
- Add database indexing for slug and published status
- Consider caching for frequently accessed posts
- Optimize queries with proper joins

## Security Considerations
- Validate all inputs
- Sanitize HTML content
- Protect against SQL injection (Drizzle handles this)
- Rate limiting for API endpoints
- Proper CORS configuration

## Completion Criteria
- All API endpoints working and tested
- Proper error handling for all scenarios
- Authentication protecting admin endpoints
- Database operations are efficient and safe
- API ready for frontend integration

## Handoff Instructions
When complete, update this file with:
- ✅ Status of each endpoint
- 📁 File locations created/modified
- 🔧 API endpoint documentation
- 🧪 Testing results and coverage
- 🐛 Issues encountered and resolved
- 📋 Performance benchmarks
- ➡️ Instructions for frontend integration