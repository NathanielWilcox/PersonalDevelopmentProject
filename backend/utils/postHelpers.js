/**
 * Post query helper functions
 * Centralizes database queries for posts feature
 */

/**
 * Build dynamic SQL WHERE clause for post filtering
 * @param {Object} filters - Filter options
 * @returns {Object} { whereClause, params }
 */
export const buildPostFiltersQuery = (filters = {}) => {
  const { filterBy = 'all', mediaType = 'all', visibility = 'public' } = filters;
  
  let whereClause = `p.visibility = ?`;
  let params = [visibility];

  if (filterBy !== 'all') {
    whereClause += ` AND u.role = ?`;
    params.push(filterBy);
  }

  if (mediaType !== 'all') {
    whereClause += ` AND p.media_type = ?`;
    params.push(mediaType);
  }

  return { whereClause, params };
};

/**
 * Build ORDER clause for posts
 * @param {String} sort - 'newest' or 'popular'
 * @returns {String} ORDER BY clause
 */
export const buildOrderClause = (sort = 'newest') => {
  switch (sort) {
    case 'popular':
      return 'p.likes_count DESC, p.created_at DESC';
    case 'newest':
    default:
      return 'p.created_at DESC';
  }
};

/**
 * Calculate pagination offset
 * @param {Number} page - Page number (1-indexed)
 * @param {Number} limit - Items per page
 * @returns {Number} SQL OFFSET value
 */
export const getPaginationOffset = (page, limit) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, parseInt(limit) || 10);
  return (pageNum - 1) * limitNum;
};

/**
 * Check if user owns the post
 * @param {Number} userId - Current user ID
 * @param {Number} postUserId - Post owner ID
 * @returns {Boolean}
 */
export const userOwnsPost = (userId, postUserId) => {
  return userId === postUserId;
};

/**
 * Format post response with pagination info
 * @param {Array} posts - Array of post objects
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @param {Number} total - Total items in database
 * @returns {Object} Formatted response
 */
export const formatPostsResponse = (posts, page, limit, total) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, parseInt(limit) || 10);
  const offset = (pageNum - 1) * limitNum;

  return {
    posts,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      hasMore: offset + limitNum < total,
      totalPages: Math.ceil(total / limitNum)
    }
  };
};

/**
 * Validate post creation input
 * @param {Object} data - Post data
 * @returns {Object} { isValid, errors }
 */
export const validatePostData = (data) => {
  const errors = {};

  if (!data.title || !data.title.trim()) {
    errors.title = 'Title is required';
  } else if (data.title.length > 255) {
    errors.title = 'Title must be 255 characters or less';
  }

  if (data.description && data.description.length > 5000) {
    errors.description = 'Description must be 5000 characters or less';
  }

  if (data.media_type && !['photo', 'video', 'text'].includes(data.media_type)) {
    errors.media_type = 'Invalid media type';
  }

  if (data.visibility && !['public', 'private', 'friends'].includes(data.visibility)) {
    errors.visibility = 'Invalid visibility setting';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
