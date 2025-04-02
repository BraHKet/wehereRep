// src/components/shared/LeavePartyButton.js
import React, { useState } from 'react';
import { leaveParty } from '../services/Database';
import { useNavigate } from 'react-router-dom';
import './LeavePartyButton.css';

const LeavePartyButton = ({ partyId, partyName, isCreator }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLeaveClick = () => {
    setShowConfirmation(true);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const handleConfirmLeave = async () => {
    try {
      setLoading(true);
      const result = await leaveParty(partyId);
      
      if (result.success) {
        // Mostra un messaggio all'utente
        alert(result.message);
        
        // Reindirizza alla pagina dei party dell'utente
        navigate('/my-parties');
      } else {
        alert('Si è verificato un errore: ' + (result.error || 'Errore sconosciuto'));
        setShowConfirmation(false);
      }
    } catch (error) {
      console.error('Errore nell\'abbandono del party:', error);
      alert('Si è verificato un errore. Riprova più tardi.');
      setShowConfirmation(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leave-party-container">
      {!showConfirmation ? (
        <button className="leave-party-button" onClick={handleLeaveClick}>
          {isCreator ? 'Abbandona party' : 'Esci dal party'}
        </button>
      ) : (
        <div className="leave-confirmation">
          <p>
            {isCreator 
              ? 'Sei il creatore di questo party. Se abbandoni, un altro membro diventerà proprietario.' 
              : 'Sei sicuro di voler abbandonare questo party?'}
          </p>
          <p>
            {`Se rimangono meno di 2 membri, il party "${partyName}" verrà eliminato.`}
          </p>
          <div className="leave-confirmation-buttons">
            <button 
              className="confirm-leave-button" 
              onClick={handleConfirmLeave}
              disabled={loading}
            >
              {loading ? 'Uscita in corso...' : 'Sì, abbandona'}
            </button>
            <button 
              className="cancel-leave-button" 
              onClick={handleCancel}
              disabled={loading}
            >
              Annulla
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavePartyButton;