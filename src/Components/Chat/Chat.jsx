import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Trash2, Check, Image, X, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import './ChatCSS.css';

function Chat({ refresh, onRefreshComplete }) {
  const [inquiries, setInquiries] = useState([]);
  const [homeValues, setHomeValues] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [messageImages, setMessageImages] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [discussionClosed, setDiscussionClosed] = useState(false);
  const fileInputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();
  const API_INQUIRIES_URL = 'http://localhost:3001/api/inquiries';
  const API_USERS_URL = 'http://localhost:3001/api/users';
  const API_HOME_VALUES_URL = 'http://localhost:3001/api/home-values';

  const itemsPerView = 3;
  const maxIndex = Math.max(0, selectedItem?.images?.length - itemsPerView) || 0;

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
      fetchInquiries();
      fetchHomeValues();
    } else {
      setError('Veuillez vous connecter pour voir les messages');
    }
  }, [token]);

  useEffect(() => {
    if (refresh) {
      fetchInquiries();
      fetchHomeValues();
      if (onRefreshComplete) onRefreshComplete();
    }
  }, [refresh]);

  useEffect(() => {
    if (selectedItem) {
      fetchMessages(selectedItem.id, selectedItem.type);
      setCarouselIndex(0);
      checkDiscussionStatus();
    } else {
      setMessages([]);
      setDiscussionClosed(false);
    }
  }, [selectedItem]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
    checkDiscussionStatus();
  }, [messages]);

  const fetchCurrentUser = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_USERS_URL}/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch user');
      const userData = await response.json();
      setCurrentUserId(userData.id);
      setUserRole(userData.role);
    } catch (err) {
      setError('Impossible de récupérer les informations utilisateur');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_INQUIRIES_URL}/user/inquiries`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch inquiries');
      const data = await response.json();
      setInquiries(data.map(item => ({ ...item, type: 'inquiry' })));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHomeValues = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_HOME_VALUES_URL}/user-and-expert`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch home values');
      const data = await response.json();
      setHomeValues(data.map(item => ({ ...item, type: 'home_value' })));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (itemId, itemType) => {
    setIsLoading(true);
    try {
      const url = itemType === 'inquiry'
        ? `${API_INQUIRIES_URL}/${itemId}/messages`
        : `${API_HOME_VALUES_URL}/${itemId}/messages`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const checkDiscussionStatus = () => {
    if (selectedItem?.type === 'home_value' && selectedItem.expert_id) {
      const expertReplied = messages.some(msg => msg.sender_id === selectedItem.expert_id);
      setDiscussionClosed(expertReplied);
    } else {
      setDiscussionClosed(false);
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && messageImages.length === 0) || !selectedItem) return;
    if (discussionClosed && userRole !== 'expert') return;

    setIsLoading(true);
    try {
      const url = selectedItem.type === 'inquiry'
        ? `${API_INQUIRIES_URL}/${selectedItem.id}/messages`
        : `${API_HOME_VALUES_URL}/${selectedItem.id}/messages`;

      const formData = new FormData();
      formData.append('message', newMessage);
      messageImages.forEach((image) => formData.append('images', image));

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to send message');

      setNewMessage('');
      setMessageImages([]);
      await fetchMessages(selectedItem.id, selectedItem.type);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateRequest = async (requestId, e) => {
    e.stopPropagation();
    if (userRole !== 'expert') {
      alert('Only experts can validate requests.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_HOME_VALUES_URL}/${requestId}/validate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to validate request');
      fetchHomeValues();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInquiry = async (itemId, type, e) => {
    e.stopPropagation();

    if (type === 'home_value') {
      const homeValue = homeValues.find(item => item.id === itemId);
      if (userRole === 'expert' && homeValue.expert_id !== currentUserId) {
        alert('Only the assigned expert can delete this home value request.');
        return;
      }
      if (userRole !== 'expert' && homeValue.user_id !== currentUserId) {
        alert('You can only delete your own home value requests.');
        return;
      }
    }

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément?')) return;

    setIsLoading(true);
    try {
      const url = type === 'inquiry' ? `${API_INQUIRIES_URL}/${itemId}` : `${API_HOME_VALUES_URL}/${itemId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete item');
      if (type === 'inquiry') {
        setInquiries(inquiries.filter(item => item.id !== itemId));
      } else {
        setHomeValues(homeValues.filter(item => item.id !== itemId));
      }
      if (selectedItem?.id === itemId && selectedItem?.type === type) {
        setSelectedItem(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const shouldAlignRight = (message) => message.message_type === 'self';

  const hasUnreadMessages = (itemId, itemType) => {
    if (!selectedItem || selectedItem.id !== itemId || selectedItem.type !== itemType) return false;
    return messages.some(msg => msg.sender_id !== currentUserId && !msg.is_read);
  };

  const handleImageClick = (imageUrl) => setSelectedImage(imageUrl);
  const handleRemoveImage = (index) => setMessageImages(messageImages.filter((_, i) => i !== index));
  const handleCloseImage = () => setSelectedImage(null);
  const handleImageUploadClick = () => fileInputRef.current.click();
  const handleImageSelect = (e) => {
    if (e.target.files) setMessageImages([...messageImages, ...Array.from(e.target.files)]);
  };

  const canDeleteHomeValue = (item) =>
    (userRole === 'expert' && item.expert_id === currentUserId) || item.user_id === currentUserId;

  const combinedItems = [...inquiries, ...homeValues];

  const getImageCountLabel = (images) =>
    images?.length ? (images.length === 1 ? '1 image' : `${images.length} images`) : '';

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-4 col-lg-3 sidebar p-4">
          <h5 className="mb-4">Messages</h5>
          {isLoading && <p className="text-muted">Chargement...</p>}
          {error && <div className="alert alert-danger">{error}</div>}
          {combinedItems.length === 0 && !error && !isLoading ? (
            <p className="text-muted small">Aucune conversation.</p>
          ) : (
            <ul className="list-group">
              {combinedItems.map((item) => (
                <li
                  key={`${item.type}-${item.id}`}
                  className={`list-group-item list-group-item-action ${selectedItem?.id === item.id && selectedItem?.type === item.type ? 'active' : ''}`}
                  onClick={() => setSelectedItem(item)}
                  style={{ cursor: 'pointer', position: 'relative' }}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>
                        {item.type === 'inquiry'
                          ? (item.property_title || `Demande #${item.id}`)
                          : `Estimation: ${item.address}`}
                        {item.type === 'home_value' && item.expert_id ? ' (Réservée)' : ''}
                      </strong>
                      <br />
                      <small className="text-muted">{format(new Date(item.created_at), 'MMM d, yyyy')}</small>
                    </div>
                    <div className="d-flex gap-2">
                      {item.type === 'home_value' && !item.expert_id && userRole === 'expert' && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={(e) => handleValidateRequest(item.id, e)}
                          title="Valider"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      {(item.type === 'home_value' && canDeleteHomeValue(item)) ||
                       (item.type === 'inquiry' && (item.role === 'user' || item.role === 'agent')) ? (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={(e) => handleDeleteInquiry(item.id, item.type, e)}
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : null}
                    </div>
                  </div>
                  {hasUnreadMessages(item.id, item.type) && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '10px',
                        height: '10px',
                        backgroundColor: 'red',
                        borderRadius: '50%',
                      }}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="col-md-8 col-lg-9 messages-container p-4">
          {isLoading && <p className="text-center">Chargement des messages...</p>}
          {!selectedItem && !isLoading ? (
            <div className="text-center mt-5">
              <MessageSquare size={48} className="text-muted mb-3" />
              <h4>Aucun Élément Sélectionné</h4>
            </div>
          ) : (
            selectedItem && (
              <div>
                <h5 className="mb-3">
                  {selectedItem.type === 'inquiry' && (userRole === 'agent' || userRole === 'user') ? (
                    <a
                      href={`/listing/${selectedItem.property_id }`}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/listing/${selectedItem.property_id || selectedItem.id}`);
                      }}
                      style={{ textDecoration: 'none', color: '#007bff', cursor: 'pointer' }}
                      onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
                    >
                      {selectedItem.property_title || `Demande #${selectedItem.id}`}
                    </a>
                  ) : (
                    <>
                      {selectedItem.type === 'inquiry'
                        ? (selectedItem.property_title || `Demande #${selectedItem.id}`)
                        : `Estimation: ${selectedItem.address}`}
                      {selectedItem.type === 'home_value' && selectedItem.expert_id ? ' (Réservée)' : ''}
                    </>
                  )}
                </h5>
                {selectedItem.images && selectedItem.images.length > 0 && (
                  <div className="mb-4">
                    <h6 className="mb-2">Images du bien:</h6>
                    <div
                      className="property-images-gallery p-2 position-relative"
                      style={{ backgroundColor: '#f0f2f5', borderRadius: '12px' }}
                    >
                      <div
                        className="carousel-container caro"
                        style={{
                          overflowX: selectedItem.images.length > 3 ? 'hidden' : 'visible',
                          overflowY: 'hidden',
                          position: 'relative',
                        }}
                      >
                        <div
                          className="carousel-track cari"
                          style={{
                            display: 'flex',
                            gap: '10px',
                            transition: 'transform 0.3s ease',
                            transform: `translateX(-${carouselIndex * (120 + 10)}px)`,
                          }}
                        >
                          {selectedItem.images.map((img, index) => (
                            <div
                              key={index}
                              className="image-thumbnail"
                              style={{
                                height: '100px',
                                minWidth: '120px',
                                position: 'relative',
                                overflow: 'hidden',
                                borderRadius: '8px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                transition: 'transform 0.2s',
                                cursor: 'pointer',
                              }}
                              onClick={() => handleImageClick(`http://localhost:3001${img}`)}
                              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                            >
                              <img
                                src={`http://localhost:3001${img}`}
                                alt={`Image ${index + 1}`}
                                style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                              />
                              <div
                                className="image-overlay"
                                style={{
                                  position: 'absolute',
                                  bottom: '0',
                                  left: '0',
                                  right: '0',
                                  padding: '4px 8px',
                                  backgroundColor: 'rgba(0,0,0,0.5)',
                                  color: 'white',
                                  fontSize: '12px',
                                  textAlign: 'center',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Maximize2 size={12} style={{ marginRight: '4px' }} />
                                <span>Agrandir</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {selectedItem.images.length > 3 && (
                        <>
                          <button
                            className="carousel-btn carousel-btn-left carb"
                            onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
                            disabled={carouselIndex === 0}
                            style={{
                              position: 'absolute',
                              left: '0',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'rgba(0,0,0,0.5)',
                              border: 'none',
                              color: 'white',
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              cursor: 'pointer',
                              zIndex: 1,
                            }}
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <button
                            className="carousel-btn carousel-btn-right"
                            onClick={() => setCarouselIndex(Math.min(maxIndex, carouselIndex + 1))}
                            disabled={carouselIndex === maxIndex}
                            style={{
                              position: 'absolute',
                              right: '0',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'rgba(0,0,0,0.5)',
                              border: 'none',
                              color: 'white',
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              cursor: 'pointer',
                              zIndex: 1,
                            }}
                          >
                            <ChevronRight size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div
                  ref={messagesContainerRef}
                  className="chat-messages p-3"
                  style={{
                    height: '350px',
                    overflowY: 'auto',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.05)',
                    padding: '16px',
                  }}
                >
                  {messages.length === 0 && !isLoading ? (
                    <div className="text-center mt-5">
                      <MessageSquare size={32} className="text-muted mb-2" />
                      <p className="text-muted">Aucun message pour cet élément.</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} style={{ width: '100%', marginBottom: '18px' }}>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: shouldAlignRight(msg) ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: shouldAlignRight(msg) ? '#007bff' : '#ffffff',
                              color: shouldAlignRight(msg) ? 'white' : 'black',
                              padding: '12px 16px',
                              borderRadius: shouldAlignRight(msg) ? '18px 18px 0 18px' : '18px 18px 18px 0',
                              maxWidth: '75%',
                              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                              border: shouldAlignRight(msg) ? 'none' : '1px solid #f0f0f0',
                              wordBreak: 'break-word',
                            }}
                          >
                            {msg.message && (
                              <div style={{ marginBottom: msg.images?.length ? '12px' : '0' }}>
                                {msg.message}
                              </div>
                            )}
                            {msg.images && msg.images.length > 0 && (
                              <div className="message-images" style={{ marginTop: msg.message ? '8px' : '0' }}>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '8px',
                                    fontSize: '12px',
                                    color: shouldAlignRight(msg) ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)',
                                  }}
                                >
                                  <Image size={14} style={{ marginRight: '4px' }} />
                                  <span>{getImageCountLabel(msg.images)}</span>
                                </div>
                                <div
                                  className="images-grid"
                                  style={{
                                    display: 'grid',
                                    gap: '4px',
                                    gridTemplateColumns:
                                      msg.images.length === 1
                                        ? '1fr'
                                        : msg.images.length === 2
                                        ? '1fr 1fr'
                                        : 'repeat(auto-fill, minmax(100px, 1fr))',
                                    maxWidth: '100%',
                                  }}
                                >
                                  {msg.images.map((img, index) => (
                                    <div
                                      key={index}
                                      style={{
                                        position: 'relative',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        border: `2px solid ${
                                          shouldAlignRight(msg) ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)'
                                        }`,
                                        height: msg.images.length <= 2 ? '180px' : '120px',
                                      }}
                                      onClick={() => handleImageClick(`http://localhost:3001${img}`)}
                                    >
                                      <img
                                        src={`http://localhost:3001${img}`}
                                        alt={`Message Image ${index + 1}`}
                                        style={{
                                          width: '100%',
                                          height: '100%',
                                          objectFit: 'cover',
                                          cursor: 'pointer',
                                          transition: 'transform 0.3s ease',
                                        }}
                                      />
                                      <div
                                        className="expand-overlay"
                                        style={{
                                          position: 'absolute',
                                          inset: '0',
                                          backgroundColor: 'rgba(0,0,0,0.3)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          opacity: '0',
                                          transition: 'opacity 0.2s ease',
                                          cursor: 'pointer',
                                        }}
                                        onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
                                        onMouseOut={(e) => (e.currentTarget.style.opacity = '0')}
                                      >
                                        <Maximize2 size={24} color="white" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: '#6c757d',
                              marginTop: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                            <span
                              style={{
                                display: 'inline-block',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: msg.is_read ? '#28a745' : '#f8f9fa',
                                border: `1px solid ${msg.is_read ? '#28a745' : '#6c757d'}`,
                                marginLeft: '4px',
                              }}
                            />
                            <span style={{ fontSize: '0.7rem' }}>{msg.is_read ? 'Lu' : 'Non lu'}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="message-input-container mt-3">
                  {discussionClosed && userRole !== 'expert' ? (
                    <div className="alert alert-info text-center">
                      Cette discussion est fermée. Un expert a répondu à votre demande d'estimation.
                    </div>
                  ) : (
                    <>
                      {messageImages.length > 0 && (
                        <div className="preview-images mb-2">
                          {messageImages.map((image, index) => (
                            <div
                              key={index}
                              className="preview-image-container"
                              style={{ position: 'relative', display: 'inline-block', marginRight: '8px' }}
                            >
                              <img
                                src={URL.createObjectURL(image)}
                                alt={`Preview ${index}`}
                                style={{
                                  width: '100px',
                                  height: '100px',
                                  objectFit: 'cover',
                                  borderRadius: '8px',
                                  border: '2px solid #ccc',
                                }}
                              />
                              <button
                                className="btn btn-sm btn-danger"
                                style={{
                                  position: 'absolute',
                                  top: '-5px',
                                  right: '-5px',
                                  borderRadius: '50%',
                                  padding: '0.15rem',
                                  width: '20px',
                                  height: '20px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                }}
                                onClick={() => handleRemoveImage(index)}
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="input-group input-group-sm shadow-sm rounded-pill bg-white overflow-hidden">
                        <input
                          type="text"
                          className="form-control border-0 py-2 ps-3"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Tapez votre message..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) handleSendMessage();
                          }}
                          disabled={isLoading || (discussionClosed && userRole !== 'expert')}
                        />
                        <button
                          className="btn btn-link text-muted border-0 px-3"
                          type="button"
                          onClick={handleImageUploadClick}
                          disabled={isLoading || (discussionClosed && userRole !== 'expert')}
                          title="Ajouter des images"
                        >
                          <Image size={16} />
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="d-none"
                          onChange={handleImageSelect}
                          accept="image/*"
                          multiple
                        />
                        <button
                          className="btn btn-primary px-3 rounded-end"
                          onClick={handleSendMessage}
                          disabled={isLoading || (discussionClosed && userRole !== 'expert')}
                        >
                          {isLoading ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          ) : (
                            'Envoyer'
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {selectedImage && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)', zIndex: 1050 }}
          onClick={handleCloseImage}
        >
          <img
            src={selectedImage}
            alt="Enlarged view"
            className="img-fluid rounded shadow"
            style={{ maxWidth: '90%', maxHeight: '90%' }}
          />
          <button
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
            onClick={handleCloseImage}
          >
            <X size={24} />
          </button>
        </div>
      )}
    </div>
  );
}

export default Chat;