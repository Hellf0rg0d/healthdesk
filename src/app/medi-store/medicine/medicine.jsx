'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Pill, Package, AlertCircle, RefreshCw, Clock, Building2, FileText, Thermometer } from 'lucide-react';

export default function MedicineStore({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  const fetchAllMedicines = useCallback(async () => {
    if (!token) {
      setError("No token provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        "https://codequantum.in/healthdesk/medicines/getAll",
        {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            "token": token,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const searchMedicinesByName = useCallback(async (query) => {
    if (!token || !query.trim()) return;

    try {
      setIsSearching(true);
      setError(null);

      const response = await fetch(
        `https://codequantum.in/healthdesk/medicines/search?q=${encodeURIComponent(query)}`,
        {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            "token": token,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed! status: ${response.status}`);
      }

      const result = await response.json();
      setSearchResults(result);
    } catch (err) {
      setError(err.message);
      console.error("Error searching medicines by name:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAllMedicines();
  }, [fetchAllMedicines]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (searchQuery.trim()) {
        searchMedicinesByName(searchQuery);
      } else {
        setSearchResults(null);
        setError(null);
      }
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setError(null);
  };

  const displayData = searchResults !== null ? searchResults : data;
  const isShowingSearchResults = searchResults !== null;

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-cyan-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
            <Pill className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-cyan-600" size={24} />
          </div>
          <p className="mt-4 text-lg text-slate-600 font-medium">Loading medicines...</p>
        </div>
      </div>
    );
  }

  if (error && !data && !searchResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-cyan-50/20 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-red-100">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <AlertCircle className="text-red-600" size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 text-center mb-2">Error Loading Data</h3>
          <p className="text-slate-600 text-center mb-6">{error}</p>
          <button 
            onClick={fetchAllMedicines} 
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            Retry
          </button>
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
              Medicine Directory
            </h1>
          </div>
          {displayData && (
            <p className="text-slate-600 text-lg">
              {displayData.length} {isShowingSearchResults ? 'medicine(s) found' : 'medicines available'}
            </p>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-slate-100">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-500" size={20} />
            <input
              type="text"
              placeholder="Search medicines by name..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-cyan-500 focus:bg-white transition-all duration-300 text-slate-700 placeholder-slate-400"
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
            <div className="flex items-center justify-center gap-2 text-cyan-600 py-2">
              <div className="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Searching...</span>
            </div>
          )}
          
          {isShowingSearchResults && (
            <div className="flex items-center justify-between bg-cyan-50 border border-cyan-200 rounded-xl p-4">
              <span className="text-sm text-cyan-700 font-medium">
                {searchResults.length > 0 
                  ? `Found ${searchResults.length} medicine(s) matching "${searchQuery}"`
                  : `No medicines found matching "${searchQuery}"`}
              </span>
              <button 
                onClick={clearSearch} 
                className="text-sm bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
              >
                Show All
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mt-2">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}
        </div>

        {!displayData || displayData.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-slate-100">
            <div className="flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4">
              <Package className="text-slate-400" size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Medicines Found</h3>
            <p className="text-slate-600">
              {isShowingSearchResults 
                ? `No medicines match your search for "${searchQuery}"`
                : "No medicines available in the directory"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayData.map((medicine, index) => (
              <div 
                key={medicine.id} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-cyan-300 overflow-hidden group animate-slide-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">
                        {medicine.name}
                      </h3>
                      {medicine.genericName && (
                        <p className="text-cyan-100 text-sm">{medicine.genericName}</p>
                      )}
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                      <Pill className="text-white" size={24} />
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  {medicine.strength && (
                    <div className="flex items-start gap-3">
                      <div className="bg-cyan-100 p-2 rounded-lg">
                        <FileText className="text-cyan-600" size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 font-medium">Strength</p>
                        <p className="text-sm text-slate-800 font-semibold">{medicine.strength}</p>
                      </div>
                    </div>
                  )}
                  {medicine.dosageForm && (
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Package className="text-blue-600" size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 font-medium">Dosage Form</p>
                        <p className="text-sm text-slate-800 font-semibold">{medicine.dosageForm}</p>
                      </div>
                    </div>
                  )}
                  {medicine.manufacturer && (
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Building2 className="text-purple-600" size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 font-medium">Manufacturer</p>
                        <p className="text-sm text-slate-800 font-semibold">{medicine.manufacturer}</p>
                      </div>
                    </div>
                  )}
                  {medicine.category && (
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <p className="text-xs text-slate-500 font-medium mb-1">Category</p>
                      <p className="text-sm text-slate-800 font-semibold">{medicine.category}</p>
                    </div>
                  )}
                  {medicine.description && (
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <p className="text-xs text-slate-500 font-medium mb-1">Description</p>
                      <p className="text-sm text-slate-700 line-clamp-3">{medicine.description}</p>
                    </div>
                  )}
                  {medicine.storageInstructions && (
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 p-2 rounded-lg">
                        <Thermometer className="text-amber-600" size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 font-medium">Storage</p>
                        <p className="text-sm text-slate-800">{medicine.storageInstructions}</p>
                      </div>
                    </div>
                  )}
                  {medicine.expiryDate && (
                    <div className="flex items-start gap-3">
                      <div className="bg-red-100 p-2 rounded-lg">
                        <Clock className="text-red-600" size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 font-medium">Expiry Date</p>
                        <p className="text-sm text-slate-800 font-semibold">
                          {new Date(medicine.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {medicine.prescriptionRequired !== undefined && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        medicine.prescriptionRequired 
                          ? 'bg-red-100 text-red-700 border border-red-200' 
                          : 'bg-green-100 text-green-700 border border-green-200'
                      }`}>
                        {medicine.prescriptionRequired ? 'Rx Required' : 'OTC'}
                      </span>
                    )}
                    {medicine.inStock !== undefined && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        medicine.inStock 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {medicine.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-slate-50 to-cyan-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                  {medicine.price && (
                    <div className="text-2xl font-bold text-cyan-600">
                      ₹{medicine.price}
                    </div>
                  )}
                  <div className="text-xs text-slate-500">
                    ID: {medicine.id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.4s ease-out forwards; }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}
