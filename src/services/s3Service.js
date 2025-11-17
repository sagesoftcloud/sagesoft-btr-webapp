import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Auth } from 'aws-amplify';

/**
 * BTR S3 Service
 * Handles document upload, download, and listing with regional access control
 */
class S3Service {
  constructor() {
    this.client = null;
    this.bucketName = 'btr-treasury-docs-367471965495';
  }

  /**
   * Initialize S3 client with user credentials
   */
  async initializeClient() {
    try {
      const credentials = await Auth.currentCredentials();
      this.client = new S3Client({
        region: 'ap-southeast-1',
        credentials: Auth.essentialCredentials(credentials),
      });
    } catch (error) {
      console.error('Failed to initialize S3 client:', error);
      throw error;
    }
  }

  /**
   * List documents in user's regional folder
   * @param {string} userRegion - User's assigned region
   * @param {string} userRole - User's role (admin, super-admin)
   * @returns {Promise<Array>} List of documents
   */
  async listDocuments(userRegion, userRole = 'admin') {
    if (!this.client) {
      await this.initializeClient();
    }

    try {
      const documents = [];

      if (userRole === 'super-admin') {
        // Super admin can see all regions
        const regions = ['NCR', 'REGION-1', 'REGION-2', 'REGION-3', 'REGION-4A', 'REGION-4B', 
                        'REGION-5', 'REGION-6', 'REGION-7', 'REGION-8', 'REGION-9', 
                        'REGION-10', 'REGION-11', 'REGION-12', 'REGION-13'];
        
        for (const region of regions) {
          const regionDocs = await this.listRegionDocuments(region);
          documents.push(...regionDocs);
        }
      } else {
        // Regional admin can only see their region
        const regionDocs = await this.listRegionDocuments(userRegion);
        documents.push(...regionDocs);
      }

      return documents;
    } catch (error) {
      console.error('Error listing documents:', error);
      return [];
    }
  }

  /**
   * List documents in a specific region folder
   * @param {string} region - Region folder name
   * @returns {Promise<Array>} List of documents in the region
   */
  async listRegionDocuments(region) {
    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: `${region}/`,
      Delimiter: '/'
    });

    try {
      const response = await this.client.send(command);
      
      return (response.Contents || [])
        .filter(item => item.Key !== `${region}/`) // Exclude folder itself
        .map(item => ({
          key: item.Key,
          name: item.Key.split('/').pop(),
          size: this.formatFileSize(item.Size),
          lastModified: item.LastModified,
          region: region,
          fullPath: item.Key
        }));
    } catch (error) {
      console.error(`Error listing documents for region ${region}:`, error);
      return [];
    }
  }

  /**
   * Upload document to user's regional folder
   * @param {File} file - File to upload
   * @param {string} userRegion - User's assigned region
   * @returns {Promise<Object>} Upload result
   */
  async uploadDocument(file, userRegion) {
    if (!this.client) {
      await this.initializeClient();
    }

    try {
      const key = `${userRegion}/${Date.now()}-${file.name}`;
      
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: file.type,
        Metadata: {
          'original-name': file.name,
          'upload-region': userRegion,
          'upload-date': new Date().toISOString()
        }
      });

      await this.client.send(command);

      return {
        success: true,
        key: key,
        name: file.name,
        size: this.formatFileSize(file.size),
        region: userRegion
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get document content for AI analysis
   * @param {string} documentKey - S3 object key
   * @returns {Promise<string>} Document content as text
   */
  async getDocumentContent(documentKey) {
    if (!this.client) {
      await this.initializeClient();
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: documentKey
      });

      const response = await this.client.send(command);
      const content = await response.Body.transformToString();
      
      return content;
    } catch (error) {
      console.error('Error getting document content:', error);
      return `Unable to read document content: ${error.message}`;
    }
  }

  /**
   * Generate presigned URL for document download
   * @param {string} documentKey - S3 object key
   * @returns {string} Download URL
   */
  getDownloadUrl(documentKey) {
    // For now, return a placeholder URL
    // In production, you'd generate a presigned URL
    return `https://${this.bucketName}.s3.ap-southeast-1.amazonaws.com/${documentKey}`;
  }

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default new S3Service();
