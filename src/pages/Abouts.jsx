import React from "react";

export default function ListPropertyPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 w-full bg-gray-50">

      {/* HERO */}
      <div className="w-full px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl text-white py-12 px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">List Your Property</h1>
          <p className="text-xl md:text-2xl text-blue-100 text-center">
            Reach thousands of students looking for accommodation
          </p>
        </div>
      </div>

      {/* MAIN FORM */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-6">

          {/* PROGRESS BAR */}
          <div className="mb-8">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: "20%" }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2 text-right">Step 1 of 5</p>
          </div>

          {/* STEP 1 — BASIC INFO */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>

            {/* NAME */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Name *</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Sunshine Student Residences"
              />
            </div>

            {/* PROPERTY TYPES */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {["Apartment", "House", "Hostel", "Townhouse", "Other"].map((type, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-center p-4 border ${
                      i === 0 ? "border-2 border-blue-500 bg-blue-50" : "border-gray-300"
                    } rounded-lg cursor-pointer hover:bg-gray-50`}
                  >
                    <span className="text-sm font-medium">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Describe your property in detail..."
              />
            </div>
          </div>

          {/* NAV BUTTONS */}
          <div className="mt-8 flex justify-between border-t border-gray-200 pt-6">
            <div></div>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* STEPS PREVIEW */}
      <div className="w-full px-4 sm:px-6 lg:px-8 mt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Form Steps Preview</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

          {/* STEP 1 */}
          <div className="bg-white rounded-lg shadow p-4 border-2 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-600">STEP 1</span>
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">✓</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-1">Basic Info</h4>
            <p className="text-xs text-gray-600">Property name, type & description</p>
          </div>

          {/* STEP 2 */}
          {["Location", "Details", "Photos", "Contact"].map((label, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">
                  STEP {i + 2}
                </span>
                <span className="w-6 h-6 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs">
                  {i + 2}
                </span>
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{label}</h4>
              <p className="text-xs text-gray-600">
                {i === 0 && "University, campus & address"}
                {i === 1 && "Price, rooms & amenities"}
                {i === 2 && "Upload property images"}
                {i === 3 && "Your contact information"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 2 — LOCATION EXAMPLE */}
      <div className="w-full px-4 sm:px-6 lg:px-8 mt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Step 2 Example: Location Details</h3>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Location Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* UNIVERSITY */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">University *</label>
                <select className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500">
                  <option>Select University</option>
                  <option>University of Zimbabwe</option>
                  <option>Midlands State University</option>
                </select>
              </div>

              {/* CAMPUS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campus *</label>
                <select className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500">
                  <option>Select Campus</option>
                  <option>Main Campus</option>
                  <option>Medical Campus</option>
                </select>
              </div>
            </div>

            {/* ADDRESS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg border-gray-300 bg-white focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full address"
              />
            </div>
          </div>
        </div>
      </div>

      {/* STEP 3 — PROPERTY DETAILS */}
      <div className="w-full px-4 sm:px-6 lg:px-8 mt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Step 3 Example: Property Details</h3>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="space-y-6">

            <h2 className="text-2xl font-bold text-gray-900">Property Details</h2>

            {/* PRICE, ROOMS, TOTAL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD) *</label>
                <input type="number" className="w-full px-4 py-2 border rounded-lg border-gray-300" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rooms Available *</label>
                <input type="number" className="w-full px-4 py-2 border rounded-lg border-gray-300" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Rooms *</label>
                <input type="number" className="w-full px-4 py-2 border rounded-lg border-gray-300" />
              </div>
            </div>

            {/* AMENITIES */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Amenities</label>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  "WiFi",
                  "Meals Included",
                  "Study Room",
                  "24/7 Water",
                  "Gym",
                  "Laundry",
                  "Air Conditioning",
                  "TV Lounge",
                  "Parking",
                  "24/7 Security",
                ].map((amenity, i) => (
                  <label key={i} className="flex items-center space-x-2">
                    <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300" />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 4 — PHOTOS */}
      <div className="w-full px-4 sm:px-6 lg:px-8 mt-8 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Step 4 Example: Add Photos</h3>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="space-y-6">

            <h2 className="text-2xl font-bold text-gray-900">Add Photos</h2>

            <p className="text-sm text-gray-500">Upload at least 3 photos of your property.</p>

            {/* IMAGE GRID */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

              {/* Sample image */}
              <div className="relative group">
                <div className="w-full h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm">
                  Sample Photo
                </div>
                <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">Cover</div>
              </div>

              {/* Upload button */}
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <svg className="h-8 w-8 text-gray-400 mb-2" viewBox="0 0 24 24" fill="none">
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm text-gray-500">Upload Photo</span>
                <input type="file" className="hidden" accept="image/*" multiple />
              </label>

            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
