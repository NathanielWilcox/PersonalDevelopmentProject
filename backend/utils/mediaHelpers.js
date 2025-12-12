/**
 * Media utilities for post handling
 * Includes validation, cleanup, and cloud storage migration helpers
 */

/**
 * Validate media file
 * @param {File} file - Multer file object
 * @returns {Object} { isValid, error }
 */
export const validateMediaFile = (file) => {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  // Check file size (100MB limit)
  const maxSize = 100 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: `File too large. Maximum 100MB allowed` };
  }

  // Check MIME type
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/x-msvideo'];
  if (!allowedMimes.includes(file.mimetype)) {
    return { isValid: false, error: `File type ${file.mimetype} not supported` };
  }

  return { isValid: true };
};

/**
 * Detect media type from MIME type
 * @param {String} mimeType - File MIME type
 * @returns {String} 'photo' | 'video' | 'text'
 */
export const detectMediaType = (mimeType) => {
  if (mimeType.startsWith('image/')) {
    return 'photo';
  } else if (mimeType.startsWith('video/')) {
    return 'video';
  }
  return 'text';
};

/**
 * Clean post data for response
 * Removes sensitive info, adds computed fields
 * @param {Object} post - Post object from database
 * @returns {Object} Cleaned post object
 */
export const cleanPostData = (post) => {
  return {
    id: post.id,
    user_id: post.user_id,
    username: post.username,
    role: post.role,
    title: post.title,
    description: post.description,
    media_type: post.media_type,
    media_url: post.media_url,
    thumbnail_url: post.thumbnail_url,
    likes_count: post.likes_count || 0,
    comments_count: post.comments_count || 0,
    created_at: post.created_at,
    updated_at: post.updated_at,
    tag_count: post.tag_count || 0
  };
};

/**
 * Cloud storage migration helper
 * To migrate from local filesystem to S3/Cloudinary/Firebase:
 * 1. Read file from local path
 * 2. Upload to cloud storage
 * 3. Update media_url in database to cloud URL
 * 4. Delete local file
 * 
 * This comment marks where cloud migration code will go
 */
export const migrateToCloudStorage = async (localMediaUrl, cloudStorageProvider) => {
  // TODO: Implement cloud migration
  // Example for AWS S3:
  // const s3 = new AWS.S3();
  // const fileContent = fs.readFileSync(localPath);
  // const params = {
  //   Bucket: process.env.AWS_BUCKET,
  //   Key: `posts/${userId}/${filename}`,
  //   Body: fileContent
  // };
  // const result = await s3.upload(params).promise();
  // Update database: media_url = result.Location
  // Delete local file
  return null;
};
