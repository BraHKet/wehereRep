// src/services/database.js
import { db, auth } from '../firebase/config.js';
import { 
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, 
  query, where, orderBy, limit, Timestamp, serverTimestamp, 
  setDoc
} from 'firebase/firestore';





/**
 * Permette a un utente di abbandonare un party
 * Se rimane solo un membro, il party viene eliminato
 */
export const leaveParty = async (partyId) => {
  try {
    if (!auth.currentUser) {
      throw new Error('Utente non autenticato');
    }
    
    const userId = auth.currentUser.uid;
    
    // Verifica se l'utente è il creatore del party
    const partyDoc = await getDoc(doc(db, 'parties', partyId));
    if (!partyDoc.exists()) {
      throw new Error('Party non trovato');
    }
    
    const partyData = partyDoc.data();
    const isCreator = partyData.creatorId === userId;
    
    // Ottieni tutti i membri del party
    const membersQuery = query(
      collection(db, 'partyMembers'),
      where('partyId', '==', partyId)
    );
    
    const membersSnapshot = await getDocs(membersQuery);
    const members = membersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Trova il documento dell'utente corrente
    const userMemberDoc = members.find(member => member.userId === userId);
    if (!userMemberDoc) {
      throw new Error('Non sei un membro di questo party');
    }
    
    // Se ci sono meno di 3 membri (includendo l'utente che sta abbandonando)
    if (members.length < 3) {
      // Elimina il party e tutti i documenti associati
      
      // 1. Elimina tutti i membri
      for (const member of members) {
        await deleteDoc(doc(db, 'partyMembers', member.id));
      }
      
      // 2. Elimina i prodotti associati
      const productsQuery = query(
        collection(db, 'partyProducts'),
        where('partyId', '==', partyId)
      );
      
      const productsSnapshot = await getDocs(productsQuery);
      
      for (const productDoc of productsSnapshot.docs) {
        await deleteDoc(productDoc.ref);
      }
      
      // 3. Elimina il party
      await deleteDoc(doc(db, 'parties', partyId));
      
      return { 
        success: true, 
        partyDeleted: true, 
        message: 'Hai abbandonato il party. Poiché non c\'erano abbastanza membri, il party è stato eliminato.'
      };
    } else {
      // Se ci sono almeno 3 membri (dopo l'abbandono ne rimangono almeno 2)
      
      // Se l'utente è il creatore, trasferisci la proprietà a un altro membro
      if (isCreator) {
        // Trova un altro membro a cui trasferire la proprietà (il primo non creatore)
        const newCreator = members.find(member => 
          member.userId !== userId && member.status === 'accepted'
        );
        
        if (newCreator) {
          // Aggiorna il ruolo del nuovo creatore
          await updateDoc(doc(db, 'partyMembers', newCreator.id), {
            role: 'creator'
          });
          
          // Aggiorna il documento del party
          await updateDoc(doc(db, 'parties', partyId), {
            creatorId: newCreator.userId,
            updatedAt: serverTimestamp()
          });
          
          // Crea una notifica per il nuovo creatore
          await addDoc(collection(db, 'notifications'), {
            userId: newCreator.userId,
            type: 'PARTY_OWNERSHIP',
            title: 'Sei diventato proprietario del party',
            message: `Sei diventato il nuovo proprietario del party "${partyData.name}"`,
            read: false,
            createdAt: serverTimestamp(),
            data: {
              partyId,
              partyName: partyData.name
            },
            action: 'view_party'
          });
        }
      }
      
      // Rimuovi l'utente dal party
      await deleteDoc(doc(db, 'partyMembers', userMemberDoc.id));
      
      // Notifica gli altri membri
      for (const member of members) {
        if (member.userId !== userId && member.status === 'accepted') {
          await addDoc(collection(db, 'notifications'), {
            userId: member.userId,
            type: 'PARTY_MEMBER_LEFT',
            title: 'Un membro ha abbandonato il party',
            message: `Un membro ha abbandonato il party "${partyData.name}"`,
            read: false,
            createdAt: serverTimestamp(),
            data: {
              partyId,
              partyName: partyData.name
            },
            action: 'view_party'
          });
        }
      }
      
      return { 
        success: true, 
        partyDeleted: false, 
        message: isCreator 
          ? 'Hai abbandonato il party. La proprietà è stata trasferita a un altro membro.'
          : 'Hai abbandonato il party con successo.'
      };
    }
  } catch (error) {
    console.error('Errore nell\'abbandono del party:', error);
    return { success: false, error: error.message };
  }
};










/**
 * USERS
 */


export const getRecentParties = async (limitResults = 10) => {
  try {
    // Query per ottenere i party attivi ordinati per data di creazione (più recenti prima)
    const partiesQuery = query(
      collection(db, 'parties'),
      where('status', '==', 'active'),  // Filtra solo i party attivi
      orderBy('createdAt', 'desc'),    // Ordina per data di creazione
      limit(limitResults)              // Limita il numero di risultati
    );

    const partiesSnapshot = await getDocs(partiesQuery);
    const parties = partiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString()
    }));

    return parties;
  } catch (error) {
    console.error('Errore nel recupero dei party recenti:', error);
    throw error;
  }
};




// Crea un nuovo utente nel database
export const createUser = async (userData) => {
  try {
    const userRef = doc(db, 'users', userData.id);
    
    await setDoc(userRef, {
      email: userData.email,
      displayName: userData.displayName,
      profilePictureUrl: userData.profilePicture,
      authProvider: userData.authProvider,
      authProviderId: userData.authProviderId,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      preferences: {
        theme: 'light',
        notifications: true
      }
    });
    
    return userData.id;
  } catch (error) {
    console.error('Errore nella creazione dell\'utente:', error);
    throw error;
  }
};

// Ottieni un utente tramite ID
export const getUserById = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Errore nel recupero dell\'utente:', error);
    throw error;
  }
};

// Aggiorna le informazioni di un utente
export const updateUser = async (userId, userData) => {
  try {
    // Aggiungi timestamp di aggiornamento
    const updateData = {
      ...userData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(doc(db, 'users', userId), updateData);
    
    return true;
  } catch (error) {
    console.error('Errore nell\'aggiornamento dell\'utente:', error);
    throw error;
  }
};

/**
 * PARTIES
 */

// Crea un nuovo party
// Crea un nuovo party
export const createParty = async (partyData) => {
  try {
    // Verifica che l'utente sia autenticato
    if (!auth.currentUser) {
      throw new Error('Utente non autenticato');
    }

    // Formatta la data del party
    let partyDate = null;
    if (partyData.partyDate) {
      // Assicurati che la data sia un oggetto Date valido
      partyDate = new Date(partyData.partyDate);
      
      // Verifica che sia una data valida
      if (isNaN(partyDate.getTime())) {
        console.error('Data non valida:', partyData.partyDate);
        partyDate = null;
      }
    }
    
    // Crea il documento del party
    const newParty = {
      name: partyData.partyName,
      description: partyData.partyDescription || '',
      date: partyDate, // Usa la data corretta
      imageUrl: partyData.partyImageUrl || '',
      creatorId: auth.currentUser.uid,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      settings: {
        isPrivate: true,
        allowGuestProducts: true
      }
    };
    
    const partyRef = await addDoc(collection(db, 'parties'), newParty);
    
    // Aggiungi il creatore come membro
    await addDoc(collection(db, 'partyMembers'), {
      partyId: partyRef.id,
      userId: auth.currentUser.uid,
      role: 'creator',
      status: 'accepted',
      invitedBy: auth.currentUser.uid,
      invitedAt: serverTimestamp(),
      joinedAt: serverTimestamp()
    });
    
    // Invita amici se presenti
    if (partyData.friends && partyData.friends.length > 0) {
      for (const friendEmail of partyData.friends) {
        // Cerca l'utente tramite email
        const usersQuery = query(
          collection(db, 'users'),
          where('email', '==', friendEmail)
        );
        
        const userSnapshot = await getDocs(usersQuery);
        
        if (!userSnapshot.empty) {
          const friendId = userSnapshot.docs[0].id;
          
          // Aggiungi come membro
          await addDoc(collection(db, 'partyMembers'), {
            partyId: partyRef.id,
            userId: friendId,
            role: 'member',
            status: 'invited',
            invitedBy: auth.currentUser.uid,
            invitedAt: serverTimestamp()
          });
          
          // Crea notifica (usando la funzione diretta invece di importarla per evitare dipendenze circolari)
          await addDoc(collection(db, 'notifications'), {
            userId: friendId,
            type: 'PARTY_INVITE',
            title: 'Nuovo invito a un party',
            message: `Sei stato invitato al party "${partyData.partyName}"`,
            read: false,
            createdAt: serverTimestamp(),
            data: {
              partyId: partyRef.id,
              inviterId: auth.currentUser.uid
            },
            action: 'view_party'
          });
        }
      }
    }
    
    return { success: true, partyId: partyRef.id };
  } catch (error) {
    console.error('Errore nella creazione del party:', error);
    return { success: false, error: error.message };
  }
};

// Ottieni tutti i party dell'utente
export const getUserParties = async () => {
  try {
    if (!auth.currentUser) {
      throw new Error('Utente non autenticato');
    }
    
    const userId = auth.currentUser.uid;
    
    // Ottieni tutti gli ID dei party in cui l'utente è membro
    const membershipQuery = query(
      collection(db, 'partyMembers'),
      where('userId', '==', userId)
    );
    
    const membershipDocs = await getDocs(membershipQuery);
    const partyIds = membershipDocs.docs.map(doc => doc.data().partyId);
    
    if (partyIds.length === 0) {
      return [];
    }
    
    // Ottieni i dettagli di tutti i party
    const parties = [];
    
    for (const partyId of partyIds) {
      const partyDoc = await getDoc(doc(db, 'parties', partyId));
      
      if (partyDoc.exists()) {
        const partyData = partyDoc.data();
        
        // Gestisci la data in modo corretto
        let formattedDate = null;
        if (partyData.date) {
          // Se è un timestamp di Firestore, converti in data
          if (partyData.date.toDate) {
            formattedDate = partyData.date.toDate().toISOString();
          } 
          // Se è già una data JavaScript
          else if (partyData.date instanceof Date) {
            formattedDate = partyData.date.toISOString();
          }
          // Se è una stringa, prova a convertirla in data
          else if (typeof partyData.date === 'string') {
            formattedDate = partyData.date;
          }
        }
        
        parties.push({
          id: partyDoc.id,
          name: partyData.name,
          description: partyData.description,
          date: formattedDate,
          imageUrl: partyData.imageUrl,
          status: partyData.status,
          creatorId: partyData.creatorId,
          isCreator: partyData.creatorId === userId,
          createdAt: partyData.createdAt?.toDate().toISOString()
        });
      }
    }
    
    // Ordina per data di creazione (più recenti prima)
    return parties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Errore nel recupero dei party dell\'utente:', error);
    throw error;
  }
};

// Ottieni i dettagli completi di un party specifico
export const getPartyById = async (partyId) => {
  try {
    const partyDoc = await getDoc(doc(db, 'parties', partyId));
    
    if (!partyDoc.exists()) {
      return null;
    }
    
    // Ottieni i membri del party
    const membersQuery = query(
      collection(db, 'partyMembers'),
      where('partyId', '==', partyId)
    );
    
    const membersSnapshot = await getDocs(membersQuery);
    const members = [];
    
    for (const memberDoc of membersSnapshot.docs) {
      const memberData = memberDoc.data();
      // Ottieni informazioni utente
      const userDoc = await getDoc(doc(db, 'users', memberData.userId));
      
      if (userDoc.exists()) {
        members.push({
          id: memberDoc.id,
          ...memberData,
          invitedAt: memberData.invitedAt?.toDate().toISOString(),
          joinedAt: memberData.joinedAt?.toDate().toISOString(),
          user: {
            id: userDoc.id,
            displayName: userDoc.data().displayName,
            profilePictureUrl: userDoc.data().profilePictureUrl
          }
        });
      }
    }
    
    // Ottieni i prodotti del party
    const productsQuery = query(
      collection(db, 'partyProducts'),
      where('partyId', '==', partyId)
    );
    
    const productsSnapshot = await getDocs(productsQuery);
    const products = [];
    
    for (const productDoc of productsSnapshot.docs) {
      const productData = productDoc.data();
      // Ottieni informazioni prodotto
      const itemDoc = await getDoc(doc(db, 'products', productData.productId));
      
      if (itemDoc.exists()) {
        products.push({
          id: productDoc.id,
          ...productData,
          addedAt: productData.addedAt?.toDate().toISOString(),
          product: {
            id: itemDoc.id,
            ...itemDoc.data()
          }
        });
      }
    }
    
    const partyData = partyDoc.data();
    
    return {
      id: partyDoc.id,
      name: partyData.name,
      description: partyData.description,
      date: partyData.date?.toDate().toISOString(),
      imageUrl: partyData.imageUrl,
      status: partyData.status,
      creatorId: partyData.creatorId,
      createdAt: partyData.createdAt?.toDate().toISOString(),
      updatedAt: partyData.updatedAt?.toDate().toISOString(),
      settings: partyData.settings,
      members,
      products
    };
  } catch (error) {
    console.error('Errore nel recupero del party:', error);
    throw error;
  }
};

// Invita un utente a un party
export const inviteUserToParty = async (partyId, email) => {
  try {
    if (!auth.currentUser) {
      throw new Error('Utente non autenticato');
    }
    
    // Trova l'utente tramite email
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', email)
    );
    
    const userSnapshot = await getDocs(usersQuery);
    
    if (userSnapshot.empty) {
      throw new Error('Utente non trovato');
    }
    
    const userId = userSnapshot.docs[0].id;
    
    // Controlla se l'utente è già membro del party
    const membershipQuery = query(
      collection(db, 'partyMembers'),
      where('partyId', '==', partyId),
      where('userId', '==', userId)
    );
    
    const membershipSnapshot = await getDocs(membershipQuery);
    
    if (!membershipSnapshot.empty) {
      throw new Error('L\'utente è già stato invitato a questo party');
    }
    
    // Ottieni il nome del party
    const partyDoc = await getDoc(doc(db, 'parties', partyId));
    const partyName = partyDoc.exists() ? partyDoc.data().name : 'Party';
    
    // Aggiungi l'utente come membro del party
    await addDoc(collection(db, 'partyMembers'), {
      partyId,
      userId,
      role: 'member',
      status: 'invited',
      invitedBy: auth.currentUser.uid,
      invitedAt: serverTimestamp()
    });
    
    // Crea una notifica per l'utente invitato
    await addDoc(collection(db, 'notifications'), {
      userId,
      type: 'PARTY_INVITE',
      title: 'Nuovo invito a un party',
      message: `Sei stato invitato al party "${partyName}"`,
      read: false,
      createdAt: serverTimestamp(),
      data: {
        partyId,
        inviterId: auth.currentUser.uid
      },
      action: 'view_party'
    });
    
    return { success: true };
  } catch (error) {
    console.error('Errore nell\'invito dell\'utente al party:', error);
    return { success: false, error: error.message };
  }
};

/**
 * PRODUCTS
 */

// Aggiungi un prodotto al database
export const addProduct = async (productData) => {
  try {
    // Aggiungi timestamp
    const newProduct = {
      ...productData,
      imageUrls: productData.imageUrls || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const productRef = await addDoc(collection(db, 'products'), newProduct);
    return productRef.id;
  } catch (error) {
    console.error('Errore nell\'aggiunta del prodotto:', error);
    throw error;
  }
};

// Aggiungi un prodotto a un party
export const addProductToParty = async (partyId, productId, options = {}) => {
  try {
    if (!auth.currentUser) {
      throw new Error('Utente non autenticato');
    }
    
    // Ottieni dettagli del prodotto
    const productDoc = await getDoc(doc(db, 'products', productId));
    
    if (!productDoc.exists()) {
      throw new Error('Prodotto non trovato');
    }
    
    const productData = productDoc.data();
    
    // Aggiungi il prodotto al party
    const partyProductRef = await addDoc(collection(db, 'partyProducts'), {
      partyId,
      productId,
      addedBy: auth.currentUser.uid,
      addedAt: serverTimestamp(),
      selectedSize: options.selectedSize || '',
      selectedColor: options.selectedColor || '',
      quantity: options.quantity || 1,
      status: 'pending',
      notes: options.notes || '',
      price: productData.price,
      currency: productData.currency || 'EUR'
    });
    
    // Aggiorna il timestamp del party
    await updateDoc(doc(db, 'parties', partyId), {
      updatedAt: serverTimestamp()
    });
    
    // Ottieni membri del party per le notifiche
    const membersQuery = query(
      collection(db, 'partyMembers'),
      where('partyId', '==', partyId),
      where('userId', '!=', auth.currentUser.uid),
      where('status', '==', 'accepted')
    );
    
    const membersSnapshot = await getDocs(membersQuery);
    
    // Ottieni dettagli dell'utente corrente
    const currentUserDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    const userName = currentUserDoc.exists() 
      ? currentUserDoc.data().displayName 
      : 'Un utente';
    
    // Ottieni il nome del party
    const partyDoc = await getDoc(doc(db, 'parties', partyId));
    const partyName = partyDoc.exists() ? partyDoc.data().name : 'un party';
    
    // Crea notifiche per gli altri membri
    const notificationPromises = membersSnapshot.docs.map(memberDoc => {
      return addDoc(collection(db, 'notifications'), {
        userId: memberDoc.data().userId,
        type: 'PRODUCT_ADDED',
        title: 'Nuovo prodotto nel party',
        message: `${userName} ha aggiunto ${productData.title} al party "${partyName}"`,
        read: false,
        createdAt: serverTimestamp(),
        data: {
          partyId,
          productId,
          partyProductId: partyProductRef.id,
          addedBy: auth.currentUser.uid
        },
        action: 'view_product'
      });
    });
    
    await Promise.all(notificationPromises);
    
    return { success: true, partyProductId: partyProductRef.id };
  } catch (error) {
    console.error('Errore nell\'aggiunta del prodotto al party:', error);
    return { success: false, error: error.message };
  }
};

// Ottieni i prodotti associati a un party
export const getPartyProducts = async (partyId) => {
  try {
    const productsQuery = query(
      collection(db, 'partyProducts'),
      where('partyId', '==', partyId),
      orderBy('addedAt', 'desc')
    );
    
    const productsSnapshot = await getDocs(productsQuery);
    const products = [];
    
    for (const productDoc of productsSnapshot.docs) {
      const productData = productDoc.data();
      // Ottieni informazioni prodotto
      const itemDoc = await getDoc(doc(db, 'products', productData.productId));
      
      // Ottieni informazioni utente che ha aggiunto
      const userDoc = await getDoc(doc(db, 'users', productData.addedBy));
      
      if (itemDoc.exists()) {
        products.push({
          id: productDoc.id,
          ...productData,
          addedAt: productData.addedAt?.toDate().toISOString(),
          product: {
            id: itemDoc.id,
            ...itemDoc.data()
          },
          addedByUser: userDoc.exists() ? {
            id: userDoc.id,
            displayName: userDoc.data().displayName,
            profilePictureUrl: userDoc.data().profilePictureUrl
          } : null
        });
      }
    }
    
    return products;
  } catch (error) {
    console.error('Errore nel recupero dei prodotti del party:', error);
    throw error;
  }
};

/**
 * NOTIFICATIONS
 */

// Ottieni le notifiche di un utente
export const getUserNotifications = async (maxResults = 20) => {
  try {
    if (!auth.currentUser) {
      throw new Error('Utente non autenticato');
    }
    
    const userId = auth.currentUser.uid;
    
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );
    
    const notificationsSnapshot = await getDocs(notificationsQuery);
    
    return notificationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      readAt: doc.data().readAt?.toDate().toISOString()
    }));
  } catch (error) {
    console.error('Errore nel recupero delle notifiche:', error);
    throw error;
  }
};

// Segna una notifica come letta
export const markNotificationAsRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true,
      readAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Errore nell\'aggiornamento della notifica:', error);
    return { success: false, error: error.message };
  }
};

// Crea una nuova notifica
export const createNotification = async (userId, type, title, message, data = {}) => {
  try {
    const notificationData = {
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: serverTimestamp(),
      data
    };
    
    const notificationRef = await addDoc(collection(db, 'notifications'), notificationData);
    
    return notificationRef.id;
  } catch (error) {
    console.error('Errore nella creazione della notifica:', error);
    throw error;
  }
};

// Segna tutte le notifiche di un utente come lette
export const markAllNotificationsAsRead = async () => {
  try {
    if (!auth.currentUser) {
      throw new Error('Utente non autenticato');
    }
    
    const userId = auth.currentUser.uid;
    
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const notificationsSnapshot = await getDocs(notificationsQuery);
    
    const updatePromises = notificationsSnapshot.docs.map(doc => 
      updateDoc(doc.ref, {
        read: true,
        readAt: serverTimestamp()
      })
    );
    
    await Promise.all(updatePromises);
    
    return { success: true, count: notificationsSnapshot.docs.length };
  } catch (error) {
    console.error('Errore nell\'aggiornamento delle notifiche:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Funzioni helper
 */

// Formatta i timestamp
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return null;
  
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  
  if (timestamp.toDate) {
    return timestamp.toDate();
  }
  
  return timestamp;
};