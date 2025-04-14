// app.js
const express = require('express');
const cloudinary = require('./cloudinaryConfig');
const upload = require('./multerConfig');
const dotenv = require('dotenv');
const axios = require('axios');
const CryptoJS = require('crypto-js');
const { Blob } = require('node:buffer');
const path = require('path');
const fs = require('fs');



// Initialize the app and load environment variables
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON data
app.use(express.json());

// Route to upload file
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // Decrypt file (if needed) before uploading to Cloudinary
    // console.log('Uploading');
    // console.log('req...........', req.body); //

    const encryptedFile = req.body.file; // This is the encrypted file data
    // console.log('req...........', req); //
    // Optionally, decrypt the file (using CryptoJS in Node.js)
    // const decryptedFile = CryptoJS.AES.decrypt(encryptedFile.toString(), 'your-secret-key');
    // const fileBuffer = decryptedFile.toString(CryptoJS.enc.Utf8);

    // Upload the encrypted file to Cloudinary (without decrypting it here)
    // const base64EncodedFile = encryptedFile.toString('base64');
    // const fileWithMime = `data:application/octet-stream;base64,${base64EncodedFile}`;
    // console.log(fileWithMime);
    const result = await cloudinary.uploader.upload_stream(
      // fileWithMime,
      { resource_type: 'raw' },
      (error, result) => {
        if (error) {
          res.status(500).send({ message: 'Upload failed', error });
        } else {
          res.status(200).send({ message: 'Upload successful', url: result.secure_url });
        }
      }
    ).end(encryptedFile); // Upload encrypted data

  } catch (error) {
    res.status(500).send({ message: 'Upload error', error });
  }
});

app.get('/decrypt/:public_id/:key', async (req, res) => {
  try{
  const { public_id, key } = req.params;
    const fileResponse = await cloudinary.api.resource(public_id, {
      resource_type: 'raw', 
    });
    const encryptedFileUrl = fileResponse.secure_url;
    // Download the file from Cloudinary
    const response = await axios.get(encryptedFileUrl, { responseType: 'blob' });      
    const decryptedWordArray = CryptoJS.AES.decrypt(response.data, key);
    const decryptedBytes = new Uint8Array(decryptedWordArray.sigBytes);
    for (let i = 0; i < decryptedWordArray.sigBytes; i++) {
      decryptedBytes[i] = (decryptedWordArray.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    }
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="decrypted-file"`,
    });
    res.status(200).send(Buffer.from(decryptedBytes));
  } catch (error) {
    console.error('Error decrypting file:', error);
    res.status(500).send({ message: 'Error decrypting file', error: error.message });
  }
});

// Route to delete file
// app.delete('/delete', async (req, res) => {
//   const { public_id } = req.body; // The public ID of the file in Cloudinary
//   console.log(req); //
//   try {
//     const result = await cloudinary.uploader.destroy(public_id);
//     if (result.result === 'ok') {
//       res.status(200).send({ message: 'File deleted successfully' });
//     } else {
//       res.status(400).send({ message: 'File deletion failed' });
//     }
//   } catch (error) {
//     res.status(500).send({ message: 'Deletion error', error });
//   }
// });



// Delete file by public_id from Cloudinary
app.delete('/files/:public_id', async (req, res) => {
  const { public_id } = req.params;
  try {
    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: 'raw', // or specify 'image', 'video', etc.
    });

    if (result.result === 'ok') {
      res.status(200).send({ message: 'File deleted successfully' });
    } else {
      res.status(400).send({ message: 'Failed to delete file' });
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).send({ message: 'Error deleting file', error: error.message });
  }
});


// Route to fetch all uploaded files
app.get('/files', async (req, res) => {
    try {
      const response = await axios(`https://${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}@api.cloudinary.com/v1_1/dwonwcdpp/resources/raw`, {
        method: 'GET',
      });
        return res.status(200).json({ message: 'Files fetched successfully', files: response.data.resources });
    } catch (error) {
      console.error('Error fetching files:', error);
      res.status(500).json({ message: 'Error fetching files', error: error.message });
    }
  });
  

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
