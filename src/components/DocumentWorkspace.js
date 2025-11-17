import React, { useState, useEffect } from 'react';
import ChatBot from './ChatBot';
import s3Service from '../services/s3Service';
import './DocumentWorkspace.css';

/**
 * BTR Document Workspace
 * Main interface matching boss's diagram with regional filtering and AI integration
 */
const DocumentWorkspace = ({ user }) => {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentContent, setDocumentContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState('ALL');

  // Get user context
  const userRegion = user?.attributes?.['custom:region'] || 'UNKNOWN';
  const userRole = user?.attributes?.['custom:role'] || 'admin';
  const userName = user?.attributes?.email || 'User';

  // Available regions for super admin
  const allRegions = ['ALL', 'NCR', 'REGION-1', 'REGION-2', 'REGION-3', 'REGION-4A', 'REGION-4B', 
                     'REGION-5', 'REGION-6', 'REGION-7', 'REGION-8', 'REGION-9', 
                     'REGION-10', 'REGION-11', 'REGION-12', 'REGION-13'];

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user, regionFilter]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await s3Service.listDocuments(userRegion, userRole);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentSelect = async (doc) => {
    setSelectedDocument(doc.name);
    
    try {
      // For demo purposes, we'll use mock content
      // In production, you'd fetch actual document content
      const mockContent = `Document: ${doc.name}
Region: ${doc.region}
Size: ${doc.size}
Last Modified: ${doc.lastModified}

This is a treasury document containing financial information and budget allocations for ${doc.region}. 
The document includes various sections covering expenditures, revenue, and administrative details.

Sample Financial Data:
- Total Budget: PHP 500,000,000
- Infrastructure: PHP 200,000,000
- Education: PHP 150,000,000
- Healthcare: PHP 100,000,000
- Administrative: PHP 50,000,000

This document is for official Bureau of Treasury use only.`;

      setDocumentContent(mockContent);
    } catch (error) {
      console.error('Error loading document content:', error);
      setDocumentContent('Unable to load document content for analysis.');
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await s3Service.uploadDocument(file, userRegion);
      
      if (result.success) {
        alert(`File "${file.name}" uploaded successfully to ${userRegion}!`);
        loadDocuments(); // Refresh document list
      } else {
        alert(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      alert('Upload failed. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleDownload = (doc) => {
    const downloadUrl = s3Service.getDownloadUrl(doc.fullPath);
    window.open(downloadUrl, '_blank');
  };

  const getFilteredDocuments = () => {
    let filtered = documents;

    // Apply region filter for super admin
    if (userRole === 'super-admin' && regionFilter !== 'ALL') {
      filtered = filtered.filter(doc => doc.region === regionFilter);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.region.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getDocumentStats = () => {
    const filtered = getFilteredDocuments();
    const regions = [...new Set(filtered.map(doc => doc.region))];
    
    return {
      total: filtered.length,
      regions: regions.length,
      totalSize: filtered.reduce((sum, doc) => sum + (parseFloat(doc.size) || 0), 0)
    };
  };

  if (!user) {
    return (
      <div className="document-workspace">
        <div className="workspace-loading">
          <h2>Please log in to access the Bureau of Treasury Document Management System</h2>
        </div>
      </div>
    );
  }

  const stats = getDocumentStats();
  const filteredDocs = getFilteredDocuments();

  return (
    <div className="document-workspace">
      <div className="workspace-header">
        <div className="welcome-section">
          <h1>Welcome to your document workspace!</h1>
          <h2>
            {userRole === 'super-admin' 
              ? `Super Administrator - ${regionFilter === 'ALL' ? 'All Regions' : regionFilter}`
              : `Region: ${userRegion}`
            }
          </h2>
          <div className="user-info">
            <span className="user-email">👤 {userName}</span>
            <span className="user-role">
              {userRole === 'super-admin' ? '👑 Super Admin' : '📍 Regional Admin'}
            </span>
          </div>
        </div>
        
        <div className="workspace-stats">
          <div className="stat-item">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Documents</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.regions}</span>
            <span className="stat-label">Regions</span>
          </div>
        </div>
      </div>

      <div className="workspace-content">
        <div className="documents-panel">
          <div className="panel-header">
            <h3>📁 Document Library</h3>
            {userRole === 'super-admin' && (
              <div className="region-filter">
                <select 
                  value={regionFilter} 
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="region-select"
                >
                  {allRegions.map(region => (
                    <option key={region} value={region}>
                      {region === 'ALL' ? 'All Regions' : region}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="search-upload-section">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button className="search-button">🔍</button>
            </div>
            
            <div className="upload-container">
              <input
                type="file"
                id="file-upload"
                onChange={handleUpload}
                disabled={isUploading}
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
              />
              <label htmlFor="file-upload" className={`upload-button ${isUploading ? 'uploading' : ''}`}>
                {isUploading ? '⏳ Uploading...' : '📤 Upload'}
              </label>
            </div>
          </div>

          <div className="documents-list">
            {isLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading documents...</p>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📄</div>
                <h4>No documents found</h4>
                <p>
                  {searchQuery 
                    ? 'Try adjusting your search terms' 
                    : 'Upload your first document to get started'
                  }
                </p>
              </div>
            ) : (
              <div className="files-container">
                {filteredDocs.map((doc, index) => (
                  <div 
                    key={index} 
                    className={`file-item ${selectedDocument === doc.name ? 'selected' : ''}`}
                    onClick={() => handleDocumentSelect(doc)}
                  >
                    <div className="file-icon">
                      {doc.name.endsWith('.pdf') ? '📄' : 
                       doc.name.endsWith('.doc') || doc.name.endsWith('.docx') ? '📝' :
                       doc.name.endsWith('.xls') || doc.name.endsWith('.xlsx') ? '📊' : '📋'}
                    </div>
                    <div className="file-info">
                      <div className="file-name">{doc.name}</div>
                      <div className="file-meta">
                        <span className="file-size">{doc.size}</span>
                        <span className="file-region">{doc.region}</span>
                        <span className="file-date">
                          {new Date(doc.lastModified).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button 
                      className="download-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(doc);
                      }}
                      title="Download document"
                    >
                      ⬇️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="chat-panel">
          <ChatBot 
            user={user}
            selectedDocument={selectedDocument}
            documentContent={documentContent}
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentWorkspace;
