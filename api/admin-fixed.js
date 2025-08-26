// Fixed Admin API - Uses only existing database columns
// This version works with the actual database schema

export default async function handler(req, res) {
  const { method, query, body } = req;
  const { action, id, postId, slug, operation } = query;

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Import necessary dependencies
    const { Pool } = await import('pg');

    // Create database connection
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    // Route to appropriate action
    switch (action) {
      case 'posts': {
        if (method === 'GET') {
          // Get all posts with filtering and pagination
          const {
            page = '1',
            limit = '10',
            category,
            featured,
            published,
            search,
            sortBy = 'created_at',
            sortOrder = 'desc'
          } = query;

          // Build query with actual database columns
          let queryText = `
            SELECT 
              id, title, slug, excerpt, content, 
              featured_image, category, tags, featured, 
              published, published_date, created_at, 
              updated_at, author_name, author_title, 
              author_image, read_time
            FROM blog_posts
            WHERE 1=1
          `;
          
          const queryParams = [];
          let paramIndex = 1;

          // Add filters
          if (published !== undefined) {
            queryText += ` AND published = $${paramIndex}`;
            queryParams.push(published === 'true');
            paramIndex++;
          }
          
          if (category) {
            queryText += ` AND category = $${paramIndex}`;
            queryParams.push(category);
            paramIndex++;
          }
          
          if (featured !== undefined) {
            queryText += ` AND featured = $${paramIndex}`;
            queryParams.push(featured === 'true');
            paramIndex++;
          }
          
          if (search) {
            queryText += ` AND (title ILIKE $${paramIndex} OR excerpt ILIKE $${paramIndex})`;
            queryParams.push(`%${search}%`);
            paramIndex++;
          }

          // Add sorting (use actual column names)
          const validSortColumns = ['created_at', 'updated_at', 'published_date', 'title', 'category'];
          const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
          const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';
          queryText += ` ORDER BY ${sortColumn} ${sortDirection}`;

          // Add pagination
          const pageNum = parseInt(page);
          const limitNum = parseInt(limit);
          const offset = (pageNum - 1) * limitNum;
          
          queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
          queryParams.push(limitNum, offset);

          // Execute query
          const result = await pool.query(queryText, queryParams);
          const posts = result.rows;

          // Get total count for pagination
          let countQuery = `SELECT COUNT(*) FROM blog_posts WHERE 1=1`;
          const countParams = [];
          let countParamIndex = 1;

          if (published !== undefined) {
            countQuery += ` AND published = $${countParamIndex}`;
            countParams.push(published === 'true');
            countParamIndex++;
          }
          
          if (category) {
            countQuery += ` AND category = $${countParamIndex}`;
            countParams.push(category);
            countParamIndex++;
          }
          
          if (featured !== undefined) {
            countQuery += ` AND featured = $${countParamIndex}`;
            countParams.push(featured === 'true');
            countParamIndex++;
          }
          
          if (search) {
            countQuery += ` AND (title ILIKE $${countParamIndex} OR excerpt ILIKE $${countParamIndex})`;
            countParams.push(`%${search}%`);
            countParamIndex++;
          }

          const countResult = await pool.query(countQuery, countParams);
          const totalItems = parseInt(countResult.rows[0].count);

          await pool.end();

          // Format posts to match expected structure
          const formattedPosts = posts.map(post => ({
            ...post,
            publishedAt: post.published_date || post.created_at,
            author: {
              name: post.author_name,
              title: post.author_title,
              image: post.author_image
            }
          }));

          return res.status(200).json({
            success: true,
            data: formattedPosts,
            pagination: {
              currentPage: pageNum,
              totalPages: Math.ceil(totalItems / limitNum),
              totalItems,
              itemsPerPage: limitNum
            }
          });
        } else if (method === 'POST') {
          // Create new post - simplified version
          const {
            title,
            slug,
            excerpt,
            content,
            category,
            tags = [],
            featured = false,
            published = false,
            featured_image,
            author_name = 'Admin',
            author_title = '',
            author_image = '',
            read_time = 5
          } = body;

          const insertQuery = `
            INSERT INTO blog_posts (
              title, slug, excerpt, content, category, 
              tags, featured, published, featured_image,
              author_name, author_title, author_image, read_time,
              published_date, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING *
          `;

          const now = new Date().toISOString();
          const values = [
            title, slug, excerpt, content, category,
            JSON.stringify(tags), featured, published, featured_image,
            author_name, author_title, author_image, read_time,
            published ? now : null, now, now
          ];

          const result = await pool.query(insertQuery, values);
          const newPost = result.rows[0];
          
          await pool.end();
          
          return res.status(201).json({
            success: true,
            data: newPost
          });
        }
        break;
      }

      case 'post': {
        if (!id) {
          await pool.end();
          return res.status(400).json({ error: 'Post ID is required' });
        }

        if (method === 'GET') {
          // Get single post by ID
          const getQuery = 'SELECT * FROM blog_posts WHERE id = $1';
          const result = await pool.query(getQuery, [parseInt(id)]);
          
          await pool.end();

          if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
          }

          return res.status(200).json({
            success: true,
            data: result.rows[0]
          });
        } else if (method === 'PUT' || method === 'PATCH') {
          // Handle toggle operations
          if (operation === 'publish' || operation === 'unpublish') {
            const newState = operation === 'publish';
            const updateQuery = `
              UPDATE blog_posts 
              SET published = $1, 
                  published_date = $2,
                  updated_at = $3
              WHERE id = $4 
              RETURNING *
            `;
            
            const now = new Date().toISOString();
            const values = [
              newState,
              newState ? now : null,
              now,
              parseInt(id)
            ];
            
            const result = await pool.query(updateQuery, values);
            await pool.end();
            
            if (result.rows.length === 0) {
              return res.status(404).json({ error: 'Post not found' });
            }
            
            return res.status(200).json({
              success: true,
              data: result.rows[0],
              post: result.rows[0] // For backward compatibility
            });
          } else if (operation === 'feature' || operation === 'unfeature') {
            const newState = operation === 'feature';
            const updateQuery = `
              UPDATE blog_posts 
              SET featured = $1, 
                  updated_at = $2
              WHERE id = $3 
              RETURNING *
            `;
            
            const now = new Date().toISOString();
            const values = [newState, now, parseInt(id)];
            
            const result = await pool.query(updateQuery, values);
            await pool.end();
            
            if (result.rows.length === 0) {
              return res.status(404).json({ error: 'Post not found' });
            }
            
            return res.status(200).json({
              success: true,
              data: result.rows[0],
              post: result.rows[0] // For backward compatibility
            });
          } else {
            // Regular update
            const updateFields = [];
            const values = [];
            let paramIndex = 1;

            // Only update fields that exist in the database
            const allowedFields = [
              'title', 'slug', 'excerpt', 'content', 'category',
              'tags', 'featured', 'published', 'featured_image',
              'author_name', 'author_title', 'author_image', 'read_time'
            ];

            Object.keys(body).forEach(key => {
              if (allowedFields.includes(key)) {
                updateFields.push(`${key} = $${paramIndex}`);
                values.push(key === 'tags' ? JSON.stringify(body[key]) : body[key]);
                paramIndex++;
              }
            });

            if (updateFields.length === 0) {
              await pool.end();
              return res.status(400).json({ error: 'No valid fields to update' });
            }

            // Add updated_at
            updateFields.push(`updated_at = $${paramIndex}`);
            values.push(new Date().toISOString());
            paramIndex++;

            // Add id for WHERE clause
            values.push(parseInt(id));

            const updateQuery = `
              UPDATE blog_posts 
              SET ${updateFields.join(', ')}
              WHERE id = $${paramIndex}
              RETURNING *
            `;

            const result = await pool.query(updateQuery, values);
            await pool.end();

            if (result.rows.length === 0) {
              return res.status(404).json({ error: 'Post not found' });
            }

            return res.status(200).json({
              success: true,
              data: result.rows[0]
            });
          }
        } else if (method === 'DELETE') {
          const deleteQuery = 'DELETE FROM blog_posts WHERE id = $1 RETURNING id';
          const result = await pool.query(deleteQuery, [parseInt(id)]);
          
          await pool.end();

          if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
          }

          return res.status(200).json({
            success: true,
            message: 'Post deleted successfully'
          });
        }
        break;
      }

      case 'stats': {
        if (method === 'GET') {
          // Get blog statistics using raw SQL
          const statsQuery = `
            SELECT 
              COUNT(*) as total,
              COUNT(CASE WHEN published = true THEN 1 END) as published,
              COUNT(CASE WHEN published = false THEN 1 END) as drafts,
              COUNT(CASE WHEN featured = true THEN 1 END) as featured
            FROM blog_posts
          `;
          
          const result = await pool.query(statsQuery);
          const stats = result.rows[0];
          
          await pool.end();

          return res.status(200).json({
            success: true,
            data: {
              totalPosts: parseInt(stats.total),
              publishedPosts: parseInt(stats.published),
              draftPosts: parseInt(stats.drafts),
              scheduledPosts: 0, // Column doesn't exist
              featuredPosts: parseInt(stats.featured),
              categoryCounts: {},
              tagCounts: {},
              monthlyPublications: {}
            }
          });
        }
        break;
      }

      case 'categories': {
        if (method === 'GET') {
          // Get unique categories
          const categoriesQuery = `
            SELECT DISTINCT category 
            FROM blog_posts 
            WHERE category IS NOT NULL 
            ORDER BY category
          `;
          
          const result = await pool.query(categoriesQuery);
          const categories = result.rows.map(row => row.category);
          
          await pool.end();

          return res.status(200).json({
            success: true,
            data: categories
          });
        }
        break;
      }

      default:
        await pool.end();
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    await pool.end();
    return res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Admin API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}