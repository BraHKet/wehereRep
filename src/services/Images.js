// src/services/images.js
import axios from 'axios';

// La tua configurazione di Cloudinary
const CLOUDINARY_UPLOAD_PRESET = 'tuo_upload_preset'; // Crealo dal dashboard di Cloudinary
const CLOUDINARY_CLOUD_NAME = 'tuo_cloud_name';

export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData
    );
    
    return response.data.secure_url;
  } catch (error) {
    console.error('Errore durante il caricamento dell\'immagine:', error);
    throw error;
  }
};