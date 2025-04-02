// src/components/shared/ImageUploader.js
import React, { useState } from 'react';
import { uploadImage } from '../services/Images';

const ImageUploader = ({ onImageUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Verifica che sia un'immagine
    if (!file.type.startsWith('image/')) {
      setError('Per favore seleziona un file immagine.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const imageUrl = await uploadImage(file);
      onImageUploaded(imageUrl);
    } catch (err) {
      setError('Errore nel caricamento dell\'immagine. Riprova più tardi.');
      console.error('Errore nel caricamento:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-uploader">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="file-input"
      />
      {uploading && <div className="upload-spinner">Caricamento in corso...</div>}
      {error && <div className="upload-error">{error}</div>}
    </div>
  );
};

export default ImageUploader;