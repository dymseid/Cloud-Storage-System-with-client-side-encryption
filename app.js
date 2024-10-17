// app.js
const express = require('express');
const cloudinary = require('./cloudinaryConfig');
const upload = require('./multerConfig');
const dotenv = require('dotenv');
const axios = require('axios');

// Initialize the app and load environment variables
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON data
app.use(express.json());

// Route to upload file
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      { resource_type: 'auto' },
      (error, result) => {
        if (error) {
          res.status(500).send({ message: 'Upload failed', error });
        } else {
          res.status(200).send({ message: 'Upload successful', url: result.secure_url });
        }
      }
    ).end(req.file.buffer); // Use buffer since we stored the file in memory
  } catch (error) {
    res.status(500).send({ message: 'Upload error', error });
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
      resource_type: 'image', // or specify 'image', 'video', etc.
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
      const response = await axios(`https://${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}@api.cloudinary.com/v1_1/dwonwcdpp/resources/image`, {
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
