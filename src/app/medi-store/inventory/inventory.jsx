'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, MapPin, RefreshCw, Bell, AlertCircle, Navigation, Package, Pill, Building2, Phone, Mail, Calendar, DollarSign } from 'lucide-react';

export default function InventoryManagement({ token }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searchMode, setSearchMode] = useState('pharmacy'); 
  const [userLocation, setUserLocation] = useState({ lat: null, lon: null });
  const [locationError, setLocationError] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(null);

  const getCurrentLocation = useCallback(() => {
    setIsGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: Number(position.coords.latitude).toFixed(4),
          lon: Number(position.coords.longitude).toFixed(4)
        });
        setLocationError(null);
        setIsGettingLocation(false);
      },
      (error) => {
        let errorMessage = "Unable to get location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
          default:
            errorMessage = "An unknown error occurred while getting location";
            break;
        }
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 
      }
    );
  }, []);

  const getInventoryByPharmacyName = useCallback(async (pharmacyName) => {
    if (!token || !pharmacyName.trim()) return;

    const trimmedName = pharmacyName.trim();

    try {
      setIsSearching(true);
      setError(null);

      const response = await fetch(
        `https://codequantum.in/healthdesk/inventory/pharmacy?name=${encodeURIComponent(trimmedName)}`,
        {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            "token": token,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`No inventory found for pharmacy "${trimmedName}"`);
        }
        throw new Error(`Failed to fetch inventory! status: ${response.status}`);
      }

      
      const text = await response.text();
      if (!text) {
        
        setSearchResults([]);
        setError(`No inventory data returned for "${trimmedName}"`);
      } else {
        try {
          const result = JSON.parse(text);
          setSearchResults(Array.isArray(result) ? result : [result]);
          setError(null);
        } catch (parseErr) {
          console.error('Failed to parse inventory response JSON:', parseErr, 'raw:', text);
          setSearchResults([]);
          setError('Received invalid response from inventory service');
        }
      }
    } catch (err) {
      console.error("Pharmacy inventory error:", err);
      setError(err.message);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [token]);

  const getPharmaciesWithMedicineName = useCallback(async (medicineName) => {
    if (!token || !medicineName.trim()) return;

    const trimmedName = medicineName.trim();

    try {
      setIsSearching(true);
      
      setError(null);

      const response = await fetch(
        `https://codequantum.in/healthdesk/inventory/medicine?name=${encodeURIComponent(trimmedName)}`,
        {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            "token": token,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`No pharmacies found with medicine "${trimmedName}"`);
        }
        throw new Error(`Failed to fetch pharmacies! status: ${response.status}`);
      }

      
      const text = await response.text();
      if (!text) {
        setSearchResults([]);
        setError(`No data returned for medicine "${trimmedName}"`);
      } else {
        try {
          const result = JSON.parse(text);
          setSearchResults(Array.isArray(result) ? result : [result]);
          setError(null);
        } catch (parseErr) {
          console.error('Failed to parse medicine search response JSON:', parseErr, 'raw:', text);
          setSearchResults([]);
          setError('Received invalid response from medicine search service');
        }
      }
    } catch (err) {
      console.error("Medicine search error:", err);
      setError(err.message);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [token]);

  const sendNotificationRequest = useCallback(async () => {
    if (!token || !searchQuery.trim() || !userLocation.lat || !userLocation.lon) {
      setNotificationStatus("Cannot send notification: Missing medicine name or location");
      return;
    }

    try {
      setNotificationStatus("Sending notification request...");
      const response = await fetch(
        `https://codequantum.in/healthdesk/notification/request?medicineName=${encodeURIComponent(searchQuery.trim())}&latitude=${userLocation.lat}&longitude=${userLocation.lon}`,
        {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "token": token,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.clone().text();
        throw new Error(`Failed to send notification request: ${response.status} - ${errorText}`);
      }

      const responseClone = response.clone();
      let result;
      try {
        result = await responseClone.json();
        setNotificationStatus(JSON.stringify(result, null, 2));
      } catch (jsonError) {
        result = await response.text();
        setNotificationStatus(result);
      }
    } catch (err) {
      console.error("Error sending notification request:", err);
      setNotificationStatus(`Error: ${err.message}`);
    }
  }, [token, searchQuery, userLocation]);

  const searchNearestPharmacies = useCallback(async (medicineName) => {
    if (!token || !medicineName.trim()) return;

    if (!userLocation.lat || !userLocation.lon) {
      setError("Location is required for nearest pharmacy search. Please enable location access.");
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      setError(null);

      const response = await fetch(
        `https://codequantum.in/healthdesk/inventory/nearest?medicineName=${encodeURIComponent(medicineName)}&lat=${userLocation.lat}&lon=${userLocation.lon}`,
        {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            "token": token,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setSearchResults([]);
          setError(`No pharmacies found with "${medicineName}" nearby`);
          return;
        }
        throw new Error(`Nearest pharmacy search failed! status: ${response.status}`);
      }

      const text = await response.text();
      if (!text) {
        setSearchResults([]);
        setError(`No pharmacies found with "${medicineName}" nearby`);
        return;
      }

      const result = JSON.parse(text);

      const pharmacies = Array.isArray(result) ? result.map(item => ({
        pharmacyId: item.pharmacy?.id || item.pharmacyId || 'N/A',
        pharmacyName: item.pharmacy?.pharmaName || item.pharmacy?.name || item.pharmacyName || 'Unknown Pharmacy',
        address: item.pharmacy?.address || item.address || 'Address not available',
        phone: item.pharmacy?.phone || item.phone || null,
        gstin: item.pharmacy?.gstin || null,
        medicineId: item.medicine?.id || item.medicineId || 'N/A',
        medicineName: item.medicine?.name || item.medicineName || 'Unknown Medicine',
        genericName: item.medicine?.genericName || null,
        strength: item.medicine?.strength || null,
        form: item.medicine?.form || null,
        stock: item.stock || item.quantity || 0,
        price: item.medicine?.price || item.price || item.unitPrice || 0.00,
        latitude: item.pharmacy?.latitude || item.latitude || null,
        longitude: item.pharmacy?.longitude || item.longitude || null,
        distanceKm: item.pharmacy?.distanceKm || item.distanceKm || item.distance_km || item.distance || null,
        expiryDate: item.medicine?.expiryDate || item.expiryDate || null,
        manufactureDate: item.medicine?.manufactureDate || item.manufactureDate || null,
        createdAt: item.medicine?.createdAt || item.createdAt || null,
        updatedAt: item.updatedAt || null,
        inventoryId: item.id || null
      })) : [];

      setSearchResults(pharmacies);
      setError(pharmacies.length === 0 ? `No pharmacies found with "${medicineName}" nearby` : null);

    } catch (err) {
      console.error("Error searching nearest pharmacies:", err);
      setError(err.message || "Failed to search nearest pharmacies");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [token, userLocation]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        if (searchMode === 'pharmacy') {
          getInventoryByPharmacyName(searchQuery);
        } else if (searchMode === 'medicine') {
          getPharmaciesWithMedicineName(searchQuery);
        } else if (searchMode === 'nearest') {
          searchNearestPharmacies(searchQuery);
        }
      } else {
        setSearchResults(null);
        setError(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchMode, getInventoryByPharmacyName, getPharmaciesWithMedicineName, searchNearestPharmacies]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleSearchModeChange = (mode) => {
    setSearchMode(mode);
    setSearchQuery('');
    setSearchResults(null);
    setError(null);
    setLocationError(null);
    setNotificationStatus(null);
    
    if (mode === 'nearest' && (!userLocation.lat || !userLocation.lon)) {
      getCurrentLocation();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setError(null);
    setLocationError(null);
    setNotificationStatus(null);
  };

  const getPlaceholderText = () => {
    switch (searchMode) {
      case 'pharmacy':
        return "Search inventory by pharmacy name...";
      case 'medicine':
        return "Search inventory by medicine name...";
      case 'nearest':
        return "Enter medicine name to find nearest pharmacy...";
      default:
        return "Search...";
    }
  };

  const displayData = searchResults;
  const isShowingSearchResults = searchResults !== null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-cyan-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
            <Package className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-cyan-600" size={24} />
          </div>
          <p className="mt-4 text-lg text-slate-600 font-medium">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-cyan-50/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
      
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-cyan-600 p-3 rounded-2xl shadow-lg">
              <Package className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              {searchMode === 'nearest' ? 'Nearest Pharmacies' : 'Inventory Directory'}
            </h1>
          </div>
          {displayData && displayData.length > 0 && (
            <p className="text-slate-600 text-lg">
              {displayData.length} {searchMode === 'pharmacy' ? 'items' : 'pharmacies'} found
            </p>
          )}
        </div>

      
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-slate-100">
          
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              className={`flex-1 min-w-[200px] px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                searchMode === 'pharmacy'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              onClick={() => handleSearchModeChange('pharmacy')}
            >
              <Building2 className="inline mr-2" size={18} />
              Pharmacy Inventory
            </button>
            <button
              className={`flex-1 min-w-[200px] px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                searchMode === 'medicine'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              onClick={() => handleSearchModeChange('medicine')}
            >
              <Pill className="inline mr-2" size={18} />
              Medicine Availability
            </button>
            <button
              className={`flex-1 min-w-[200px] px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                searchMode === 'nearest'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              onClick={() => handleSearchModeChange('nearest')}
            >
              <MapPin className="inline mr-2" size={18} />
              Nearest Pharmacy
            </button>
          </div>

          
          {searchMode === 'nearest' && (
            <div className="mb-4">
              {isGettingLocation && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-blue-700 font-medium">Getting your location...</span>
                </div>
              )}
              
              {locationError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="text-red-600" size={20} />
                    <span className="text-sm text-red-700">{locationError}</span>
                  </div>
                  <button 
                    onClick={getCurrentLocation} 
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Retry
                  </button>
                </div>
              )}
              
              {userLocation.lat && userLocation.lon && !isGettingLocation && !locationError && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <Navigation className="text-green-600" size={20} />
                  <span className="text-sm text-green-700 font-medium">Location access granted</span>
                </div>
              )}
            </div>
          )}

          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-500" size={20} />
            <input
              type="text"
              placeholder={getPlaceholderText()}
              value={searchQuery}
              onChange={handleSearchChange}
              disabled={searchMode === 'nearest' && (!userLocation.lat || !userLocation.lon)}
              className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-cyan-500 focus:bg-white transition-all duration-300 text-slate-700 placeholder-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
            {searchQuery && (
              <button 
                onClick={clearSearch} 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-cyan-600 transition-colors duration-200"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {isSearching && (
            <div className="flex items-center justify-center gap-2 text-cyan-600 py-3">
              <div className="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">
                {searchMode === 'pharmacy' ? 'Loading inventory...' : 
                 searchMode === 'nearest' ? 'Finding nearest pharmacies...' : 
                 'Finding pharmacies...'}
              </span>
            </div>
          )}

          {isShowingSearchResults && (
            <div className="flex items-center justify-between bg-cyan-50 border border-cyan-200 rounded-xl p-4">
              <span className="text-sm text-cyan-700 font-medium">
                {searchResults.length > 0
                  ? (searchMode === 'pharmacy'
                      ? `Found ${searchResults.length} item(s) in pharmacy "${searchQuery}"`
                      : searchMode === 'nearest'
                      ? `Found ${searchResults.length} pharmacy(ies) with "${searchQuery}"`
                      : `Found ${searchResults.length} pharmacy(ies) with medicine "${searchQuery}"`)
                  : (searchMode === 'pharmacy'
                      ? `No inventory found for pharmacy "${searchQuery}"`
                      : searchMode === 'nearest'
                      ? `No pharmacies found with "${searchQuery}" nearby`
                      : `No pharmacies found with medicine "${searchQuery}"`)}
              </span>
              <button 
                onClick={clearSearch} 
                className="text-sm bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
              >
                Clear
              </button>
            </div>
          )}

          {error && (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <span className="text-sm text-red-700">{error}</span>
              </div>
              {searchMode === 'nearest' && (
                <button 
                  onClick={sendNotificationRequest} 
                  disabled={!searchQuery.trim() || !userLocation.lat || !userLocation.lon}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                  <Bell size={18} />
                  Request Notification for "{searchQuery}"
                </button>
              )}
            </div>
          )}

          {notificationStatus && (
            <div className={`rounded-xl p-4 mt-4 ${
              notificationStatus.includes('Error') 
                ? 'bg-red-50 border border-red-200 text-red-700' 
                : 'bg-green-50 border border-green-200 text-green-700'
            }`}>
              <pre className="text-sm whitespace-pre-wrap font-mono">{notificationStatus}</pre>
            </div>
          )}
        </div>

        {isShowingSearchResults && displayData && displayData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayData.map((item, index) => {
              if (searchMode === 'nearest') {
                return (
                  <div 
                    key={`nearest-${item.pharmacyId}-${item.medicineId}-${index}`} 
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-cyan-300 overflow-hidden animate-slide-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-white line-clamp-2 flex-1">
                          {item.pharmacyName}
                        </h3>
                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg ml-2">
                          <Building2 className="text-white" size={20} />
                        </div>
                      </div>
                      {item.distanceKm && (
                        <div className="flex items-center gap-2 text-cyan-100">
                          <MapPin size={16} />
                          <span className="text-sm font-medium">{Number(item.distanceKm).toFixed(2)} km away</span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Pill className="text-cyan-600" size={16} />
                          <span className="text-xs font-medium text-cyan-700">Medicine</span>
                        </div>
                        <p className="text-sm font-bold text-slate-800">{item.medicineName}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="text-slate-400 flex-shrink-0 mt-0.5" size={16} />
                          <div>
                            <p className="text-xs text-slate-500">Address</p>
                            <p className="text-sm text-slate-800">{item.address}</p>
                          </div>
                        </div>

                        {item.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="text-slate-400" size={16} />
                            <div>
                              <p className="text-xs text-slate-500">Phone</p>
                              <p className="text-sm text-slate-800 font-medium">{item.phone}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Stock</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              Number(item.stock) > 0 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                              {item.stock} units
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500 mb-1">Price</p>
                            <p className="text-2xl font-bold text-cyan-600">₹{Number(item.price).toFixed(2)}</p>
                          </div>
                        </div>

                        {item.expiryDate && (
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                            <Calendar className="text-slate-400" size={16} />
                            <div>
                              <p className="text-xs text-slate-500">Expiry Date</p>
                              <p className="text-sm text-slate-800">{new Date(item.expiryDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-slate-50 to-cyan-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                      <span>Pharmacy: {item.pharmacyId}</span>
                      <span>Med: {item.medicineId}</span>
                    </div>
                  </div>
                );
              } else if (searchMode === 'pharmacy') {
                return (
                  <div 
                    key={`pharmacy-${item.medicineId || item.inventoryId || index}`}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-cyan-300 overflow-hidden animate-slide-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6">
                      <div className="flex items-start justify-between">
                        <h3 className="text-xl font-bold text-white line-clamp-2 flex-1">
                          {item.medicineName || item.medicine?.name || 'Medicine'}
                        </h3>
                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg ml-2">
                          <Pill className="text-white" size={20} />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      {item.genericName && (
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs text-slate-500 mb-1">Generic Name</p>
                          <p className="text-sm font-semibold text-slate-800">{item.genericName}</p>
                        </div>
                      )}

                      {item.strength && (
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-slate-500">Strength:</div>
                          <div className="text-sm font-semibold text-slate-800">{item.strength}</div>
                        </div>
                      )}

                      {item.manufacturer && (
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-slate-500">Manufacturer:</div>
                          <div className="text-sm font-semibold text-slate-800">{item.manufacturer}</div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Stock</p>
                          <span className="text-sm font-bold text-slate-800">{item.stock || item.quantity || 0} units</span>
                        </div>
                        {(item.price || item.unitPrice || item.medicine?.price) && (
                          <div className="text-right">
                            <p className="text-xs text-slate-500 mb-1">Price</p>
                            <p className="text-2xl font-bold text-cyan-600">
                              ₹{item.price || item.unitPrice || item.medicine?.price || 0}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-slate-50 to-cyan-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs text-slate-500">ID: {item.inventoryId || item.id || 'N/A'}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        (item.stock || item.quantity || 0) === 0 
                          ? 'bg-red-100 text-red-700' 
                          : (item.stock || item.quantity || 0) <= (item.reorderLevel || 10)
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {(item.stock || item.quantity || 0) === 0 
                          ? 'Out of Stock' 
                          : (item.stock || item.quantity || 0) <= (item.reorderLevel || 10) 
                          ? 'Low Stock' 
                          : 'In Stock'}
                      </span>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div 
                    key={`medicine-${item.pharmacyId || item.inventoryId || index}`}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-cyan-300 overflow-hidden animate-slide-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6">
                      <div className="flex items-start justify-between">
                        <h3 className="text-xl font-bold text-white line-clamp-2 flex-1">
                          {item.pharmaName || item.pharmacyName || item.pharmacy?.pharmaName || item.pharmacy?.name || 'Pharmacy'}
                        </h3>
                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg ml-2">
                          <Building2 className="text-white" size={20} />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      {(item.address || item.pharmacy?.address) && (
                        <div className="flex items-start gap-2">
                          <MapPin className="text-slate-400 flex-shrink-0 mt-0.5" size={16} />
                          <div className="flex-1">
                            <p className="text-xs text-slate-500 mb-1">Address</p>
                            <p className="text-sm text-slate-800">{item.address || item.pharmacy?.address}</p>
                          </div>
                        </div>
                      )}

                      {(item.phone || item.pharmacy?.phone) && (
                        <div className="flex items-center gap-2">
                          <Phone className="text-slate-400" size={16} />
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Phone</p>
                            <p className="text-sm text-slate-800 font-medium">{item.phone || item.pharmacy?.phone}</p>
                          </div>
                        </div>
                      )}

                      {(item.email || item.pharmacy?.email) && (
                        <div className="flex items-center gap-2">
                          <Mail className="text-slate-400" size={16} />
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Email</p>
                            <p className="text-sm text-slate-800">{item.email || item.pharmacy?.email}</p>
                          </div>
                        </div>
                      )}

                      {(item.medicineName || item.medicine?.name) && (
                        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Pill className="text-cyan-600" size={16} />
                            <span className="text-xs font-medium text-cyan-700">Medicine Available</span>
                          </div>
                          <p className="text-sm font-bold text-slate-800">{item.medicineName || item.medicine?.name}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Stock Available</p>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            (item.quantity || item.stock || 0) > 0 
                              ? 'bg-green-100 text-green-700 border border-green-200' 
                              : 'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                            {item.quantity || item.stock || 0} units
                          </span>
                        </div>
                        {(item.unitPrice !== undefined || item.price !== undefined) && (
                          <div className="text-right">
                            <p className="text-xs text-slate-500 mb-1">Price</p>
                            <p className="text-2xl font-bold text-cyan-600">
                              ₹{(item.unitPrice || item.price || 0).toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-slate-50 to-cyan-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        ID: {item.inventoryId || item.id || 'N/A'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        (item.quantity || item.stock || 0) === 0 
                          ? 'bg-red-100 text-red-700' 
                          : (item.quantity || item.stock || 0) <= (item.reorderLevel || 10)
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {(item.quantity || item.stock || 0) === 0 
                          ? 'Out of Stock' 
                          : (item.quantity || item.stock || 0) <= (item.reorderLevel || 10) 
                          ? 'Low Stock' 
                          : 'In Stock'}
                      </span>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}

        {isShowingSearchResults && displayData && displayData.length === 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-slate-100">
            <div className="flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4">
              <Package className="text-slate-400" size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Results Found</h3>
            <p className="text-slate-600">
              No results found for "{searchQuery}"
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.4s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}