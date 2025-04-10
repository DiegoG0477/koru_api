// src/shared/cloudstorage/CloudinaryStorageService.ts
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'; // Import specific response types
import { IStorageService } from './IStorageService';
import dotenv from 'dotenv';
import { Readable } from 'stream';

dotenv.config();

export class CloudinaryStorageService implements IStorageService {

    constructor() {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            console.error("Cloudinary credentials are not fully configured in environment variables.");
            // throw new Error("Cloudinary credentials are not fully configured.");
        } else {
            cloudinary.config({
                cloud_name: cloudName,
                api_key: apiKey,
                api_secret: apiSecret,
                secure: true
            });
            console.log("Cloudinary SDK configured successfully.");
        }
    }

    async uploadFile(
        file: Express.Multer.File,
        destinationPath: string,
        publicFileName: string
    ): Promise<string | null> { // Return type remains the same
        if (!file || !file.buffer) {
            console.error("CloudinaryStorageService: No file buffer provided for upload.");
            return null;
        }

        console.log(`Uploading ${file.originalname} to Cloudinary folder: ${destinationPath}, public_id base: ${publicFileName}...`);

        try {
            // Wrap the stream upload in a promise
            const uploadPromise = new Promise<string>((resolve, reject) => { // Inner promise resolves string or rejects Error
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: destinationPath.endsWith('/') ? destinationPath.slice(0, -1) : destinationPath,
                        public_id: publicFileName,
                        resource_type: "auto"
                    },
                    (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                        if (error) {
                            console.error(`Error uploading file to Cloudinary (${publicFileName}):`, error);
                            // Reject with the actual error object
                            return reject(error);
                        }
                        if (!result) {
                            console.error(`Cloudinary upload for ${publicFileName} completed without error but returned no result.`);
                            // Reject with a specific error
                            return reject(new Error("Cloudinary upload returned no result."));
                        }
                        console.log(`File uploaded successfully to Cloudinary: ${result.secure_url}`);
                        // Resolve with the URL (string)
                        resolve(result.secure_url);
                    }
                );

                const readableStream = new Readable();
                readableStream._read = () => {};
                readableStream.push(file.buffer);
                readableStream.push(null);
                readableStream.pipe(uploadStream);
            });

            // Await the upload promise
            const secureUrl = await uploadPromise;
            return secureUrl; // Return the string URL on success

        } catch (error) {
            // Catch any error rejected by the promise (e.g., Cloudinary error, no result error)
            console.error("Caught error during Cloudinary upload process:", error);
            return null; // Return null on any failure during the upload
        }
    }

    // deleteFile method remains the same as before...
    async deleteFile(fileUrl: string): Promise<boolean> {
        if (!fileUrl) return false;

        try {
            // Attempt to extract public_id (this is a common pattern, adjust if your URLs differ)
            // Example URL: https://res.cloudinary.com/<cloud_name>/image/upload/v12345/<folder>/<public_id>.<ext>
            const urlParts = fileUrl.split('/');
            const publicIdWithExtension = urlParts.pop(); // e.g., public_id.jpg
            // const versionOrFolder = urlParts.pop(); // Might be version (v123...) or part of folder - careful with paths like folder/subfolder

            if (!publicIdWithExtension) return false;

            const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));

            // Need to determine the folder path if it exists in the URL
            const uploadIndex = urlParts.indexOf('upload');
            let folderPath = '';
            if (uploadIndex !== -1 && uploadIndex < urlParts.length -1) {
                // Check if the part after 'upload' is a version number
                const potentialVersion = urlParts[uploadIndex + 1];
                 // If it looks like a version OR it's just the publicId directly after upload (no folder)
                if (/^v\d+$/.test(potentialVersion) || (urlParts[uploadIndex+1] === publicIdWithExtension && urlParts.length === uploadIndex + 2)) {
                     // Path starts after version, or there's no folder
                     folderPath = urlParts.slice(uploadIndex + 2, urlParts.length).join('/'); // Use length-1 because we popped one element already
                } else {
                     // Path starts right after 'upload'
                     folderPath = urlParts.slice(uploadIndex + 1, urlParts.length).join('/'); // Use length-1
                }
            }

            // Reconstruct the full public ID including the folder path if necessary
            // Ensure we don't add a leading slash if folderPath is empty
            const fullPublicId = folderPath ? `${folderPath}/${publicId}` : publicId;


            if (!fullPublicId) {
                console.warn(`Could not extract public_id from Cloudinary URL: ${fileUrl}`);
                return false;
            }

             // Determine resource type based on common patterns (can be enhanced)
             let resourceType = 'image';
             if (urlParts.includes('video')) {
                 resourceType = 'video';
             } else if (urlParts.includes('raw')) {
                 resourceType = 'raw';
             }

            console.log(`Attempting to delete Cloudinary file with public_id: ${fullPublicId} (type: ${resourceType})`);


            const result = await cloudinary.uploader.destroy(fullPublicId, { resource_type: resourceType });

            if (result.result === 'ok') {
                console.log(`Successfully deleted Cloudinary file: ${fullPublicId}`);
                return true;
            } else if (result.result === 'not found') {
                console.warn(`Cloudinary file not found for deletion (maybe already deleted?): ${fullPublicId}`);
                return true; // Treat "not found" as a success for cleanup purposes
            } else {
                console.error(`Failed to delete Cloudinary file ${fullPublicId}:`, result);
                return false;
            }
        } catch (error) {
            console.error(`Error deleting file from Cloudinary (${fileUrl}):`, error);
            return false;
        }
    }
}