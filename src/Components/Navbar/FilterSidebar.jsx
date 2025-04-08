import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

// List of all 58 wilayas in Algeria with their numbers
const wilayas = [
  { number: 1, name: 'Adrar' },
  { number: 2, name: 'Chlef' },
  { number: 3, name: 'Laghouat' },
  { number: 4, name: 'Oum El Bouaghi' },
  { number: 5, name: 'Batna' },
  { number: 6, name: 'Béjaïa' },
  { number: 7, name: 'Biskra' },
  { number: 8, name: 'Béchar' },
  { number: 9, name: 'Blida' },
  { number: 10, name: 'Bouira' },
  { number: 11, name: 'Tamanrasset' },
  { number: 12, name: 'Tébessa' },
  { number: 13, name: 'Tlemcen' },
  { number: 14, name: 'Tiaret' },
  { number: 15, name: 'Tizi Ouzou' },
  { number: 16, name: 'Algiers' },
  { number: 17, name: 'Djelfa' },
  { number: 18, name: 'Jijel' },
  { number: 19, name: 'Sétif' },
  { number: 20, name: 'Saïda' },
  { number: 21, name: 'Skikda' },
  { number: 22, name: 'Sidi Bel Abbès' },
  { number: 23, name: 'Annaba' },
  { number: 24, name: 'Guelma' },
  { number: 25, name: 'Constantine' },
  { number: 26, name: 'Médéa' },
  { number: 27, name: 'Mostaganem' },
  { number: 28, name: "M'Sila" },
  { number: 29, name: 'Mascara' },
  { number: 30, name: 'Ouargla' },
  { number: 31, name: 'Oran' },
  { number: 32, name: 'El Bayadh' },
  { number: 33, name: 'Illizi' },
  { number: 34, name: 'Bordj Bou Arréridj' },
  { number: 35, name: 'Boumerdès' },
  { number: 36, name: 'El Tarf' },
  { number: 37, name: 'Tindouf' },
  { number: 38, name: 'Tissemsilt' },
  { number: 39, name: 'El Oued' },
  { number: 40, name: 'Khenchela' },
  { number: 41, name: 'Souk Ahras' },
  { number: 42, name: 'Tipasa' },
  { number: 43, name: 'Mila' },
  { number: 44, name: 'Aïn Defla' },
  { number: 45, name: 'Naâma' },
  { number: 46, name: 'Aïn Témouchent' },
  { number: 47, name: 'Ghardaïa' },
  { number: 48, name: 'Relizane' },
  { number: 49, name: "El M'Ghair" },
  { number: 50, name: 'El Meniaâ' },
  { number: 51, name: 'Ouled Djellal' },
  { number: 52, name: 'Bordj Badji Mokhtar' },
  { number: 53, name: 'Béni Abbès' },
  { number: 54, name: 'Timimoun' },
  { number: 55, name: 'Touggourt' },
  { number: 56, name: 'In Salah' },
  { number: 57, name: 'In Guezzam' },
  { number: 58, name: 'Tamanrasset' },
];

function FilterSidebar({ onApplyFilters, onClose, selectedLocation }) {
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minSurface, setMinSurface] = useState('');
  const [maxSurface, setMaxSurface] = useState('');
  const [minRooms, setMinRooms] = useState('');
  const [maxRooms, setMaxRooms] = useState('');
  const [selectedWilaya, setSelectedWilaya] = useState(null);
  const [propertyType, setPropertyType] = useState('');
  const [engagementType, setEngagementType] = useState('');
  const [isEquipped, setIsEquipped] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const filters = {
      minPrice: parseInt(minPrice, 10) || 0,
      maxPrice: parseInt(maxPrice, 10) || Infinity,
      minSurface: parseInt(minSurface, 10) || 0,
      maxSurface: parseInt(maxSurface, 10) || Infinity,
      minRooms: parseInt(minRooms, 10) || 0,
      maxRooms: parseInt(maxRooms, 10) || Infinity,
      selectedWilaya: selectedWilaya?.name || selectedLocation || '', // Use wilaya as primary location, fallback to search input
      propertyType,
      engagementType, // 'location' or 'achat'
      isEquipped: isEquipped ? 'true' : 'false',
    };

    console.log('FilterSidebar: Applying filters:', filters);

    // Construct query string
    const queryParams = new URLSearchParams();
    if (filters.selectedWilaya) queryParams.set('location', filters.selectedWilaya); // Wilaya or autosuggestion as location
    if (filters.minPrice > 0) queryParams.set('minPrice', filters.minPrice);
    if (filters.maxPrice !== Infinity) queryParams.set('maxPrice', filters.maxPrice);
    if (filters.minSurface > 0) queryParams.set('minSurface', filters.minSurface);
    if (filters.maxSurface !== Infinity) queryParams.set('maxSurface', filters.maxSurface);
    if (filters.minRooms > 0) queryParams.set('minRooms', filters.minRooms);
    if (filters.maxRooms !== Infinity) queryParams.set('maxRooms', filters.maxRooms);
    if (filters.propertyType) queryParams.set('type', filters.propertyType);
    if (filters.engagementType) queryParams.set('engagement', filters.engagementType);
    if (filters.isEquipped === 'true') queryParams.set('equipped', 'true');

    navigate(`/listings?${queryParams.toString()}`);
    onApplyFilters(filters);
    if (onClose) onClose();
  };

  const handleNonNegativeInput = (setState) => (e) => {
    const value = Math.max(0, parseInt(e.target.value, 10));
    setState(isNaN(value) ? '' : value.toString());
  };

  return (
    <div className="bg-dark text-white" style={{ minWidth: '0', maxWidth: '1000px' }}>
      <h2 className="mb-4">Filtrer les résultats</h2>
      <Form onSubmit={handleSubmit}>
        {/* Wilaya Selection */}
        <Form.Group className="mb-3">
          <Form.Label>Wilaya</Form.Label>
          <Form.Select
            value={selectedWilaya?.number || ''}
            onChange={(e) => {
              const selectedNumber = parseInt(e.target.value, 10);
              const selectedWilaya = wilayas.find((w) => w.number === selectedNumber);
              setSelectedWilaya(selectedWilaya || null);
            }}
            className="bg-dark text-white"
          >
            <option value="">Sélectionner une wilaya</option>
            {wilayas.map((wilaya) => (
              <option key={wilaya.number} value={wilaya.number}>
                {`${wilaya.number} - ${wilaya.name}`}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Price Range */}
        <Form.Group className="mb-3">
          <Form.Label>Prix (DA)</Form.Label>
          <div className="d-flex gap-2">
            <Form.Control
              type="number"
              value={minPrice}
              onChange={handleNonNegativeInput(setMinPrice)}
              placeholder="Min"
              className="bg-white text-black"
              min="0"
            />
            <Form.Control
              type="number"
              value={maxPrice}
              onChange={handleNonNegativeInput(setMaxPrice)}
              placeholder="Max"
              className="bg-white text-black"
              min="0"
            />
          </div>
        </Form.Group>

        {/* Surface Area */}
        <Form.Group className="mb-3">
          <Form.Label>Superficie (m²)</Form.Label>
          <div className="d-flex gap-2">
            <Form.Control
              type="number"
              value={minSurface}
              onChange={handleNonNegativeInput(setMinSurface)}
              placeholder="Min"
              className="bg-white text-black"
              min="0"
            />
            <Form.Control
              type="number"
              value={maxSurface}
              onChange={handleNonNegativeInput(setMaxSurface)}
              placeholder="Max"
              className="bg-white text-black"
              min="0"
            />
          </div>
        </Form.Group>

        {/* Number of Rooms */}
        <Form.Group className="mb-3">
          <Form.Label>Nombre de pièces</Form.Label>
          <div className="d-flex gap-2">
            <Form.Control
              type="number"
              value={minRooms}
              onChange={handleNonNegativeInput(setMinRooms)}
              placeholder="Min"
              className="bg-white text-black"
              min="0"
            />
            <Form.Control
              type="number"
              value={maxRooms}
              onChange={handleNonNegativeInput(setMaxRooms)}
              placeholder="Max"
              className="bg-white text-black"
              min="0"
            />
          </div>
        </Form.Group>

        {/* Property Type */}
        <Form.Group className="mb-3">
          <Form.Label>Type de bien</Form.Label>
          <Form.Select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="bg-dark text-white"
          >
            <option value="">Tous les types</option>
            <option value="appartement">Appartement</option>
            <option value="villa">Villa</option>
            <option value="bureau">Bureau</option>
          </Form.Select>
        </Form.Group>

        {/* Equipped Property */}
        <Form.Group className="mb-3">
          <Form.Check
            type="switch"
            id="equipped-switch"
            label="Équipé"
            checked={isEquipped}
            onChange={(e) => setIsEquipped(e.target.checked)}
          />
        </Form.Group>

        {/* Engagement Type */}
        <Form.Group className="mb-3">
          <Form.Label>Type d'engagement</Form.Label>
          <div>
            <Form.Check
              type="radio"
              name="engagementType"
              id="achat"
              label="Achat"
              value="achat"
              checked={engagementType === 'achat'}
              onChange={(e) => setEngagementType(e.target.value)}
              className="mb-2"
            />
            <Form.Check
              type="radio"
              name="engagementType"
              id="location"
              label="Location"
              value="location"
              checked={engagementType === 'location'}
              onChange={(e) => setEngagementType(e.target.value)}
            />
          </div>
        </Form.Group>

        {/* Apply Filters Button */}
        <Button
          type="submit"
          className="w-100"
          style={{ backgroundColor: '#ff6b00', border: 'none' }}
        >
          Appliquer les filtres
        </Button>
      </Form>
    </div>
  );
}

export default FilterSidebar;