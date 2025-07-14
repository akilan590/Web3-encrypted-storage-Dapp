import { useState, useRef, useCallback } from "react";
import axios from "axios";
import "./FileUpload.css";

function FileUpload({ contract, provider, account }) {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No file selected");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !account) return;
    
    setIsUploading(true);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
    
    try {
      // Validate file before upload
      if (file.size > MAX_FILE_SIZE) {
        throw new Error("File size exceeds 10MB limit");
      }
      
      if (!SUPPORTED_TYPES.includes(file.type)) {
        throw new Error("Unsupported file type");
      }

      const formData = new FormData();
      formData.append("file", file);

      const resFile = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: formData,
        headers: {
          pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
          pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      const ipfsHash = resFile.data.IpfsHash;
      const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      
      const signer = contract.connect(provider.getSigner());
      const tx = await signer.add(account, gatewayUrl);
      
      // Wait for transaction confirmation
      await tx.wait();

      setSuccess(true);
      setTimeout(() => resetForm(), 2000);
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const retrieveFile = useCallback((e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (!file) return;
    
    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      setError("File size exceeds 10MB limit");
      return;
    }
    
    if (!SUPPORTED_TYPES.includes(file.type)) {
      setError("Unsupported file type. Please upload JPG, PNG, GIF, or PDF.");
      return;
    }
    
    setError(null);
    setFile(file);
    setFileName(`${file.name} (${formatFileSize(file.size)})`);
    
    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const resetForm = useCallback(() => {
    setFile(null);
    setFileName("No file selected");
    setPreview(null);
    setUploadProgress(0);
    setSuccess(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add("active-drop");
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("active-drop");
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("active-drop");
    retrieveFile(e);
  }, [retrieveFile]);

  return (
    <div className="file-upload-container">
      <h2 className="upload-title">Upload to Blockchain</h2>
      
      <form 
        className="upload-form"
        onSubmit={handleSubmit}
      >
        <div 
          className={`upload-area ${file ? "has-file" : ""}`}
          onClick={() => fileInputRef.current.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {preview ? (
            <div className="preview-container">
              <img src={preview} alt="Preview" className="file-preview" />
            </div>
          ) : (
            <>
              <div className="upload-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              <p className="upload-text">Drag & drop files here or click to browse</p>
              <p className="upload-hint">Supports: JPG, PNG, GIF, PDF (Max 10MB)</p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          id="file-upload"
          onChange={retrieveFile}
          accept="image/*,.pdf"
          className="file-input"
          disabled={!account || isUploading}
        />

        {file && (
          <div className="file-info">
            <span className="file-name" title={file.name}>
              {fileName}
            </span>
            <button 
              type="button" 
              className="clear-btn"
              onClick={resetForm}
              disabled={isUploading}
            >
              ×
            </button>
          </div>
        )}

        {isUploading && (
          <div className="upload-progress">
            <div 
              className="progress-bar" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        <div className="action-buttons">
          <button
            type="submit"
            className="upload-btn"
            disabled={!file || isUploading || !account}
          >
            {isUploading ? (
              <>
                <span className="spinner"></span>
                Uploading... {uploadProgress}%
              </>
            ) : (
              "Upload to Blockchain"
            )}
          </button>
        </div>

        {error && (
          <p className="connect-wallet-notice error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </p>
        )}

        {success && (
          <p className="success-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            File uploaded successfully to blockchain!
          </p>
        )}

        {!account && (
          <p className="connect-wallet-notice">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
            Please connect your wallet to upload files
          </p>
        )}
      </form>
    </div>
  );
}

export default FileUpload;