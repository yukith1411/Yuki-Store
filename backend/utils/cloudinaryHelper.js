import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

/**
 * Upload a single local file to Cloudinary and delete it locally afterwards.
 * @param {string} filePath - Path to local file
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<string>} - Cloudinary URL of the uploaded image
 */
export const uploadSingleToCloudinary = async (filePath, folder = 'products') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `e-commerce/${folder}`,
      resource_type: 'image',
    });
    // Remove local file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return result.secure_url;
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error(`Cloudinary Upload Failed: ${error.message}`);
  }
};

/**
 * Upload multiple local files to Cloudinary.
 * @param {Array<string>} filePaths - Array of local file paths
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Array<string>>} - Array of Cloudinary URLs
 */
export const uploadMultipleToCloudinary = async (filePaths, folder = 'products') => {
  try {
    const uploadPromises = filePaths.map((path) => uploadSingleToCloudinary(path, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new Error(`Cloudinary Batch Upload Failed: ${error.message}`);
  }
};
