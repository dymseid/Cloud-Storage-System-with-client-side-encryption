import React, { useState, useEffect } from 'react';
import './App.css';
import CryptoJS from 'crypto-js';

function App() {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState('');  // State to hold the encryption key
  const [decryptionKey, setDecryptionKey] = useState('');  // State to hold the encryption key

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleEncryptionKeyChange = (event) => {
    setEncryptionKey(event.target.value); // Update encryption key when input changes
  };

  const handleDecryptionKeyChange = (event) => {
    setDecryptionKey(event.target.value); // Update encryption key when input changes
  };

  const encryptFile = (file, key) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const wordArray = CryptoJS.lib.WordArray.create(reader.result);
        const encrypted = CryptoJS.AES.encrypt(wordArray, key).toString();
        resolve(encrypted); // Return base64 encoded encrypted data
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file!');
      return;
    }

    if (!encryptionKey) {
      alert('Please enter an encryption key!');
      return;
    }

    try {
      setLoading(true);
      const encryptedFile = await encryptFile(file, encryptionKey);  // Encrypt using the entered key
      const formData = new FormData();
      formData.append('file', encryptedFile);

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

  const deleteFile = async (public_id) => {
    try {
      await fetch(`/files/${public_id}`, { method: 'DELETE' });
      alert('File deleted successfully');
      fetchFiles(); // Refresh the file list after deletion
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
  };

  const decryptFile = (publicId, encryptionKey) => {
    fetch(`/decrypt/${publicId}/${encryptionKey}`)
      .then((response) => {
        if (!response.ok) throw new Error('Failed to decrypt file');
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'decrypted-file.jpeg';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Error decrypting file.');
      });
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="App">
      <h1>Cloudinary File Upload</h1>

      <div className="container">
        {/* File input section */}
        <div className="upload-section">
          <input type="file" onChange={handleFileChange} />
        </div>

        {/* Encryption key input section */}
        <div className="encryption-section">
          <input
            type="text"
            value={encryptionKey}
            onChange={handleEncryptionKeyChange}
            placeholder="Enter encryption key"
          />
        </div>

        {/* Upload file button */}
        <div className="upload-button">
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
                <button onClick={() => deleteFile(file.public_id)} className="delete-button">
                  Delete
                </button>
                <input
                  type="text"
                  value={decryptionKey}
                  onChange={handleDecryptionKeyChange}
                  placeholder="Enter decryption key"
                />
                <button onClick={() => decryptFile(file.public_id, decryptionKey)} className="decrypt-button" disabled={decryptionKey.length === 0}>
                  Decrypt
                </button>
              </div>
            ))
          ) : (
            <p>No files uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
