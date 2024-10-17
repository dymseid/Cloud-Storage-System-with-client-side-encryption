import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // Upload file to server
  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        alert('File uploaded successfully!');
        setFile(null);
        fetchFiles(); // Refresh the file list after upload
      } else {
        alert('File upload failed!');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all uploaded files
  const fetchFiles = async () => {
    try {
      const response = await fetch('/files');
      const result = await response.json();
      if (response.ok) {
        setFiles(result.files);
      } else {
        alert('Failed to fetch files!');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  // Fetch files when the component mounts
  useEffect(() => {
    fetchFiles();
  }, []);
  const deleteFile = async (public_id) => {
    try {
      await fetch(`/files/${public_id}`, {method: 'DELETE'});
      alert('File deleted successfully');
      // After deleting, fetch the files again to update the list
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
  };

  return (
    <div className="App">
      <h1>Cloudinary File Upload</h1>

      {/* File upload section */}
      <div className="upload-section">
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={loading}>
          {loading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>

      {/* Display uploaded files */}
      <div className="files-section">
        <h3>Uploaded Files</h3>
        {files.length > 0 ? (
          files.map((file) => (
            <div key={file.public_id} className="file">
              <p><strong>Public ID:</strong> {file.public_id}</p>
              <p><strong>URL:</strong> <a href={file.secure_url} target="_blank" rel="noopener noreferrer">{file.secure_url}</a></p>
              <p><strong>Format:</strong> {file.format}</p>
              <button onClick={() => deleteFile(file.public_id)} className="delete-button">
                Delete
              </button>
            </div>
          ))
        ) : (
          <p>No files uploaded yet.</p>
        )}
      </div>
    </div>
  );
}

export default App;
