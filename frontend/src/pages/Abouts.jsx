import React, { useEffect, useState } from "react";
import { useNavigation } from '../App';
//// Supabase client import removed as it's not needed without JWT

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export default function ListPropertyPage() {
  const { navigate } = useNavigation();
  
  // Override body flex layout for this page
  useEffect(() => {
    document.body.style.display = 'block';
    document.body.style.placeItems = 'unset';
    
    return () => {
      // Reset when component unmounts
      document.body.style.display = '';
      document.body.style.placeItems = '';
    };
  }, []);
  
  const [form, setForm] = useState({
    university_id: "",
    campus_id: "",
    title: "",
    description: "",
    address: "",
    city: "",
    postalCode: "",
    latitude: "",
    longitude: "",
    pricePerMonth: "",
    depositAmount: "",
    availableFrom: "",
    availableTo: "",
    peoplePerRoom: 1,
    propertyType: ""
  });
  const [amenities, setAmenities] = useState({
    wifi: false,
    furnished: false,
    parking: false,
    laundry: false,
    kitchen: false,
    heating: false,
    tv: false,
    petsAllowed: false,
    smokingAllowed: false,
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [universities, setUniversities] = useState([]);
  const [campuses, setCampuses] = useState([]);

  const token = localStorage.getItem('token');
  const role = token ? parseJwt(token)?.role : null;
  const isLandlord = role === 'landlord';

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const API_POST_URL = `${API_BASE_URL}/api/accommodations`;

  useEffect(() => {
    const loadUniversities = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/universities`);
        const payload = await res.json().catch(() => null);
        if (!res.ok) {
          console.error('Failed to load universities', payload);
          return;
        }
        setUniversities(Array.isArray(payload) ? payload : []);
      } catch (err) {
        console.error('Failed to load universities', err);
      }
    };

    loadUniversities();
  }, [API_BASE_URL]);

  useEffect(() => {
    const loadCampuses = async () => {
      if (!form.university_id) {
        setCampuses([]);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/campuses?university_id=${encodeURIComponent(form.university_id)}`);
        const payload = await res.json().catch(() => null);
        if (!res.ok) {
          console.error('Failed to load campuses', payload);
          setCampuses([]);
          return;
        }
        setCampuses(Array.isArray(payload) ? payload : []);
      } catch (err) {
        console.error('Failed to load campuses', err);
        setCampuses([]);
      }
    };

    loadCampuses();
  }, [API_BASE_URL, form.university_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => {
      if (name === 'university_id') {
        return { ...s, university_id: value, campus_id: '' };
      }
      return { ...s, [name]: value };
    });
  };

  const handleAmenityToggle = (name) => {
    setAmenities((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    setImageFiles(validFiles);
    
    // Create previews
    const previews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !isLandlord) {
      alert('Landlord access required. Please sign in as a landlord.');
      navigate('auth');
      return;
    }
    if (!form.title || !form.address || !form.city || !form.pricePerMonth || !form.university_id || !form.campus_id) {
      alert("Please fill required fields: title, address, city, price, university, campus");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      
      // Add form fields
      Object.keys(form).forEach(key => {
        if (key !== 'images') {
          formData.append(key, form[key]);
        }
      });
      
      // Add amenities as JSON string
      formData.append('amenities', JSON.stringify(amenities));
      
      // Add image files
      imageFiles.forEach((file, index) => {
        formData.append('images', file);
      });

      const res = await fetch(API_POST_URL, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        console.error("Upload failed", payload);
        alert(payload?.error || "Failed to create listing");
      } else {
        alert("Property listed successfully");
        setForm({
          university_id: "",
          campus_id: "",
          title: "",
          description: "",
          address: "",
          city: "",
          postalCode: "",
          latitude: "",
          longitude: "",
          pricePerMonth: "",
          depositAmount: "",
          availableFrom: "",
          availableTo: "",
          peoplePerRoom: 1,
          propertyType: ""
        });
        setAmenities({
          wifi: false,
          furnished: false,
          parking: false,
          laundry: false,
          kitchen: false,
          heating: false,
          tv: false,
          petsAllowed: false,
          smokingAllowed: false,
        });
        setImageFiles([]);
        setImagePreviews([]);
        setImagePreviews([]);
        setCurrentStep(1);
      }
    } catch (err) {
      console.error(err);
      alert("Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Name *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Sunshine Student Residences"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {["Apartment", "House", "Hostel", "Townhouse", "Other"].map((type, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-center p-4 border ${
                      form.propertyType === type
                        ? "border-2 border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    } rounded-lg cursor-pointer hover:bg-gray-50`}
                    onClick={() =>
                      setForm((s) => ({ ...s, propertyType: type }))
                    }
                  >
                    <span className="text-sm font-medium">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
                placeholder="Describe your property in detail..."
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Location Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Full address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City / Town *</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">University *</label>
                <select
                  name="university_id"
                  value={form.university_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select University</option>
                  {universities.map((u) => (
                    <option key={u.id} value={String(u.id)}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div> 

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campus *</label>
                <select
                  name="campus_id"
                  value={form.campus_id}
                  onChange={handleChange}
                  required
                  disabled={!form.university_id}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Campus</option>
                  {campuses.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>


           

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input
                  name="latitude"
                  type="number"
                  value={form.latitude}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., -17.8056"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input
                  name="longitude"
                  type="number"
                  value={form.longitude}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., 31.0335"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Pricing & Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per month (USD) *</label>
                <input
                  name="pricePerMonth"
                  type="number"
                  value={form.pricePerMonth}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., 500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">People per room</label>
                <input
                  name="peoplePerRoom"
                  type="number"
                  min="1"
                  value={form.peoplePerRoom}
                  onChange={(e) => setForm((s) => ({ ...s, peoplePerRoom: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deposit amount (USD)</label>
                <input
                  name="depositAmount"
                  type="number"
                  value={form.depositAmount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., 600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Available from</label>
                <input
                  name="availableFrom"
                  type="date"
                  value={form.availableFrom}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Available to</label>
                <input
                  name="availableTo"
                  type="date"
                  value={form.availableTo}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">Amenities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                {[
                  { key: 'wifi', label: 'WiFi' },
                  { key: 'furnished', label: 'Furnished' },
                  { key: 'parking', label: 'Parking' },
                  { key: 'laundry', label: 'Laundry' },
                  { key: 'kitchen', label: 'Kitchen' },
                  { key: 'heating', label: 'Heating' },
                  { key: 'tv', label: 'TV' },
                  { key: 'petsAllowed', label: 'Pets Allowed' },
                  { key: 'smokingAllowed', label: 'Smoking Allowed' },
                ].map((a) => (
                  <label
                    key={a.key}
                    className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(amenities[a.key])}
                      onChange={() => handleAmenityToggle(a.key)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-900">{a.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Photos</h2>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:border-0 file:text-gray-500"
                />
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                <p>• Accepted formats: JPG, PNG, GIF, WebP</p>
                <p>• Maximum file size: 5MB per image</p>
                <p>• Maximum 10 images</p>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Property Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-sm text-gray-500">Property Name</p>
                  <p className="font-medium">{form.title || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Property Type</p>
                  <p className="font-medium">{form.propertyType || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{form.address || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">City</p>
                  <p className="font-medium">{form.city || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">University</p>
                  <p className="font-medium">
                    {universities.find(u => String(u.id) === form.university_id)?.name || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Campus</p>
                  <p className="font-medium">
                    {campuses.find(c => String(c.id) === form.campus_id)?.name || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price per month</p>
                  <p className="font-medium">{form.pricePerMonth ? `$${form.pricePerMonth}` : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">People per room</p>
                  <p className="font-medium">{form.peoplePerRoom || '-'}</p>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-2">Description</p>
                <p className="text-gray-700">{form.description || 'No description provided'}</p>
              </div>

              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-2">Amenities</p>
                <p className="text-gray-700">
                  {Object.entries(amenities)
                    .filter(([, v]) => v)
                    .map(([k]) => k)
                    .join(', ') || 'None'}
                </p>
              </div>

              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-2">Images</p>
                <p className="text-gray-700 break-all">
                  {imageFiles.length > 0 ? imageFiles.map(file => file.name).join(', ') : 'None'}
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!token || !isLandlord) {
    return (
      <div className="min-h-screen pt-24 pb-16 w-full bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h1 className="text-2xl font-bold text-gray-900">Landlord Access Required</h1>
            <p className="mt-2 text-gray-600">
              You must be logged in as a landlord to list a property.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => navigate('auth')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Go to Sign In
              </button>
              <button
                type="button"
                onClick={() => navigate('home')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen pt-24 pb-16 bg-bg-page overflow-x-hidden" 
      style={{ width: '100vw', maxWidth: '100vw', margin: 0, padding: 0, left: 0, right: 0 }}
    >
      {/* Full-width header */}
      <div style={{ width: '100vw', maxWidth: '100vw', margin: 0, padding: 0, left: 0, right: 0 }}>
        <div 
          className="bg-gradient-to-r from-brand-primary to-brand-primary-dark text-text-inverse py-12 px-8 w-full" 
          style={{ width: '100vw', maxWidth: '100vw', margin: 0, padding: '3rem 2rem', left: 0, right: 0 }}
        >
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">List Your Property</h1>
            <p className="text-xl md:text-2xl text-brand-accent-soft text-center">
              Reach thousands of students looking for accommodation
            </p>
          </div>
        </div>
      </div>

      {/* Full-width content area */}
      <div style={{ width: '100vw', maxWidth: '100vw', margin: 0, padding: 0, left: 0, right: 0 }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-bg-surface border border-border rounded-2xl shadow-card p-6">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="w-full bg-bg-surface-alt rounded-full h-2.5">
                <div
                  className="bg-brand-primary h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 5) * 100}%` }}
                />
              </div>
              <p className="text-sm text-text-muted mt-2 text-right">Step {currentStep} of 5</p>
            </div>

            {/* Form Content */}
            <form onSubmit={currentStep === 5 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
              {renderStep()}

              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-between border-t border-border pt-6">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 border border-border text-text-secondary bg-bg-surface hover:bg-bg-surface-alt transition rounded-xl"
                    disabled={loading}
                  >
                    Back
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < 5 ? (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-brand-primary hover:bg-brand-primary-dark text-text-inverse transition rounded-xl"
                    disabled={loading}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-success hover:bg-green-600 text-text-inverse transition rounded-xl"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Property'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
