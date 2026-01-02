import { useState } from 'react';
import { authService } from '../services/authService';

export function TestEncryption() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testLoginAPI = async () => {
    setIsLoading(true);
    addResult('🚀 Testing plain login API with backend credentials...');
    
    try {
      // Use the correct backend test credentials
      const result = await authService.login({
        nic: '199912345678',
        password: 'Admin@123'
      });
      
      addResult(`✅ Login successful: ${JSON.stringify(result)}`);
    } catch (error: any) {
      addResult(`❌ Login failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectAPI = async () => {
    setIsLoading(true);
    addResult('🎯 Testing direct plain API call with backend credentials...');
    
    try {
      // Test data - use backend credentials (no encryption)
      const testData = { nic: '199912345678', password: 'Admin@123' };
      
      addResult(`� Test data: ${JSON.stringify(testData)}`);
      
      // Prepare request (plain data, no encryption)
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/auth/login-plain`;
      
      addResult(`📤 API URL: ${apiUrl}`);
      addResult(`📤 Request body: ${JSON.stringify(testData, null, 2)}`);
      
      // Make direct fetch request
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });
      
      addResult(`📥 Response status: ${response.status}`);
      addResult(`📥 Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
      
      const result = await response.json();
      addResult(`📥 Response body: ${JSON.stringify(result, null, 2)}`);
      
      if (response.ok && result.success) {
        addResult(`✅ Plain API call successful!`);
        addResult(`🎫 Token received: ${result.data.token?.substring(0, 50)}...`);
        addResult(`👤 User role: ${result.data.role}`);
        addResult(`🆔 User NIC: ${result.data.nic}`);
      } else {
        addResult(`❌ Plain API call failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      addResult(`❌ Direct API error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🧪 Backend Integration Test (Plain Authentication)</h2>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={testLoginAPI}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Testing...' : 'Test Login API Service'}
        </button>
        
        <button
          onClick={testDirectAPI}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Testing...' : 'Test Direct API Call'}
        </button>
        
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Clear Results
        </button>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Test Results:</h3>
        <div className="max-h-96 overflow-y-auto space-y-1">
          {testResults.length === 0 ? (
            <p className="text-gray-500">No tests run yet. Click a button above to start testing.</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono bg-white p-2 rounded border">
                {result}
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Environment Info:</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <div>API Base URL: {import.meta.env.VITE_API_BASE_URL || 'Not set'}</div>
          <div>Authentication: Plain (no encryption)</div>
          <div>Mode: {import.meta.env.VITE_MODE || 'Not set'}</div>
          <div>Test Endpoint: /api/auth/login-plain</div>
          <div>Test Credentials: Admin (199912345678/Admin@123)</div>
        </div>
      </div>
    </div>
  );
}