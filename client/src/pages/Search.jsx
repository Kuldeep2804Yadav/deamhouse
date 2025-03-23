import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ListingItem from '../components/ListingItem';

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    regularPrice: '',
    bedrooms: '',
    bathrooms: '',
    furnished: false,
    parking: false,
  });
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    setSearchTerm(urlParams.get('searchTerm') || '');
    setFilters({
      type: urlParams.get('type') || 'all',
      regularPrice: urlParams.get('regularPrice') || '',
      bedrooms: urlParams.get('bedrooms') || '',
      bathrooms: urlParams.get('bathrooms') || '',
      furnished: urlParams.get('furnished') === 'true',
      parking: urlParams.get('parking') === 'true',
    });
    fetchListings(urlParams);
  }, [location.search]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const urlParams = new URLSearchParams();
      urlParams.set('searchTerm', searchTerm);
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== '' && filters[key] !== 'all') {
          urlParams.set(key, filters[key]);
        }
      });
      navigate(`/search?${urlParams.toString()}`);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filters, navigate]);

  const fetchListings = async (queryParams) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/listing/get?${queryParams.toString()}`);
      const data = await res.json();
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔴 Reset Filters Function
  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      type: 'all',
      regularPrice: '',
      bedrooms: '',
      bathrooms: '',
      furnished: false,
      parking: false,
    });
    navigate('/search'); // Reset URL
  };

  return (
    <div className='flex flex-col md:flex-row bg-gray-50 min-h-screen p-6'>
      {/* Sidebar Filters */}
      <aside className='bg-white shadow-md rounded-xl p-6 w-full md:w-1/4'>
        <h2 className='text-xl font-semibold mb-4 text-gray-700 flex justify-between items-center'>
          Filters
          {/* Clear Filters Button */}
          <button
            onClick={resetFilters}
            className='text-sm text-red-600 border border-red-500 px-3 py-1 rounded-lg hover:bg-red-50 transition'
          >
            Clear Filters
          </button>
        </h2>
        <div className='space-y-4'>
          {/* Search Input */}
          <div>
            <label className='block font-medium text-gray-600'>Search</label>
            <input
              type='text'
              placeholder='Enter keyword...'
              className='border w-full p-3 rounded-lg shadow-sm focus:ring focus:ring-blue-300'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Property Type Dropdown */}
          <div>
            <label className='block font-medium text-gray-600'>Type</label>
            <select
              className='border w-full p-3 rounded-lg shadow-sm bg-white'
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value='all'>All</option>
              <option value='Studio'>Studio</option>
              <option value='Apartment'>Apartment</option>
              <option value='Villa'>Villa</option>
            </select>
          </div>

          {/* Max Price Input */}
          <div>
            <label className='block font-medium text-gray-600'>Max Price</label>
            <input
              type='number'
              className='border w-full p-3 rounded-lg shadow-sm'
              value={filters.regularPrice}
              onChange={(e) => setFilters({ ...filters, regularPrice: e.target.value })}
            />
          </div>

          {/* Bedrooms & Bathrooms */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block font-medium text-gray-600'>Bedrooms</label>
              <input
                type='number'
                className='border w-full p-3 rounded-lg shadow-sm'
                value={filters.bedrooms}
                onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
              />
            </div>
            <div>
              <label className='block font-medium text-gray-600'>Bathrooms</label>
              <input
                type='number'
                className='border w-full p-3 rounded-lg shadow-sm'
                value={filters.bathrooms}
                onChange={(e) => setFilters({ ...filters, bathrooms: e.target.value })}
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className='flex items-center justify-between gap-4'>
            <label className='flex items-center gap-2 text-gray-700'>
              <input
                type='checkbox'
                className='form-checkbox h-5 w-5 text-blue-500'
                checked={filters.furnished}
                onChange={(e) => setFilters({ ...filters, furnished: e.target.checked })}
              />
              Furnished
            </label>
            <label className='flex items-center gap-2 text-gray-700'>
              <input
                type='checkbox'
                className='form-checkbox h-5 w-5 text-blue-500'
                checked={filters.parking}
                onChange={(e) => setFilters({ ...filters, parking: e.target.checked })}
              />
              Parking
            </label>
          </div>
        </div>
      </aside>

      {/* Listings Section */}
      <main className='w-full md:w-3/4 p-6'>
        <h1 className='text-2xl font-bold mb-4 text-center text-gray-800'>Listings</h1>
        {loading ? (
          <p className='text-center text-gray-600'>Loading...</p>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {listings.length > 0 ? (
              listings.map((listing) => <ListingItem key={listing._id} listing={listing} />)
            ) : (
              <p className='text-center text-gray-500 col-span-full'>No listings found.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
