import { useState } from 'react';
import { getHotelId, getHotelData, getAvailableHotels } from '../../services/api';
import Navbar from '../Navbar';

const ApiTestPage = () => {
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkInDate, setCheckInDate] = useState('2026-01-20');
  const [numNights, setNumNights] = useState('1');
  const [numGuests, setNumGuests] = useState('2');

  const runTest = async (testName, testFn) => {
    setLoading(true);
    const startTime = Date.now();
    let result = `\n${'='.repeat(60)}\n`;
    result += `🧪 TEST: ${testName}\n`;
    result += `⏰ Started at: ${new Date().toLocaleTimeString()}\n`;
    result += `${'='.repeat(60)}\n\n`;

    try {
      const data = await testFn();
      const elapsed = Date.now() - startTime;
      result += `✅ SUCCESS (${elapsed}ms)\n\n`;
      result += `📦 Response:\n${JSON.stringify(data, null, 2)}\n`;
    } catch (error) {
      const elapsed = Date.now() - startTime;
      result += `❌ FAILED (${elapsed}ms)\n\n`;
      result += `⚠️ Error: ${error.message}\n`;
      result += `📋 Stack: ${error.stack}\n`;
    }

    setResults(prev => prev + result);
    setLoading(false);
  };

  const testHotelId = () => {
    runTest('Get Hotel ID', async () => {
      return await getHotelId();
    });
  };

  const testHotelData = () => {
    const params = {
      checkInDate,
      numNights: parseInt(numNights),
      numGuests: parseInt(numGuests)
    };
    runTest(`Get Hotel Data (${JSON.stringify(params)})`, async () => {
      return await getHotelData(params);
    });
  };

  const testAvailableHotels = () => {
    const params = {
      checkInDate,
      numNights: parseInt(numNights),
      numGuests: parseInt(numGuests)
    };
    runTest(`Get Available Hotels (${JSON.stringify(params)})`, async () => {
      return await getAvailableHotels(params);
    });
  };

  const testDirectFetch = () => {
    runTest('Direct Fetch (No Params)', async () => {
      const response = await fetch('https://onlinebooking.cogwave.in/api/bookingengine/gethoteldata');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      return await response.json();
    });
  };

  const clearResults = () => {
    setResults('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-cogwave-blue mb-2">API Test Page</h1>
          <p className="text-gray-600 mb-6">Test the hotel booking API endpoints and see detailed responses</p>

          {/* Search Parameters */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Search Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cogwave-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Nights
                </label>
                <input
                  type="number"
                  value={numNights}
                  onChange={(e) => setNumNights(e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cogwave-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Guests
                </label>
                <input
                  type="number"
                  value={numGuests}
                  onChange={(e) => setNumGuests(e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cogwave-blue"
                />
              </div>
            </div>
          </div>

          {/* Test Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={testHotelId}
              disabled={loading}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Test Hotel ID
            </button>
            <button
              onClick={testHotelData}
              disabled={loading}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Test Hotel Data
            </button>
            <button
              onClick={testAvailableHotels}
              disabled={loading}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Test Available Hotels
            </button>
            <button
              onClick={testDirectFetch}
              disabled={loading}
              className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Direct Fetch
            </button>
          </div>

          {/* Clear Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Results
            </button>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cogwave-blue"></div>
              <span className="ml-3 text-gray-600">Running test...</span>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap">{results}</pre>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 How to Use</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Test Hotel ID</strong> - Tests the gethotelid endpoint</li>
              <li>• <strong>Test Hotel Data</strong> - Tests the gethoteldata endpoint with parameters</li>
              <li>• <strong>Test Available Hotels</strong> - Tests the complete flow with data transformation</li>
              <li>• <strong>Direct Fetch</strong> - Tests direct API call without our wrapper</li>
              <li>• Check browser console for additional logs</li>
              <li>• All responses are shown in detail below</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTestPage;
