import React, { useState } from 'react';
import { useFeeding } from '../context/FeedingContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const Debug: React.FC = () => {
  const { state } = useFeeding();
  const { user } = useAuth();
  const [debugResults, setDebugResults] = useState<string[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const addLog = (message: string) => {
    setDebugResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runDebugTests = async () => {
    setIsRunningTests(true);
    setDebugResults([]);
    addLog('🚀 Starting Supabase Debug Tests...');

    try {
      // Test 1: Basic connection with timeout
      addLog('🔗 Test 1: Testing basic Supabase connection...');

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
      );

      // Test with timeout
      const connectionTestPromise = supabase
        .from('feeding_sessions')
        .select('count')
        .limit(1);

      try {
        const { error: connectionError } = await Promise.race([
          connectionTestPromise,
          timeoutPromise
        ]) as any;

        if (connectionError) {
          addLog(`❌ Connection test failed: ${connectionError.message}`);
          addLog(`   Error code: ${connectionError.code}`);
          if (connectionError.code === '42P01') {
            addLog('   💡 SOLUTION: Run the database setup script from supabase-setup.sql');
          } else if (connectionError.code === 'PGRST301') {
            addLog('   💡 SOLUTION: Check Row Level Security policies or database permissions');
          } else if (connectionError.message?.includes('JWT')) {
            addLog('   💡 SOLUTION: Try signing out and signing back in');
          }
        } else {
          addLog('✅ Basic connection successful');
        }
      } catch (timeoutError) {
        addLog(`❌ Connection test timed out: ${timeoutError}`);
        addLog('   💡 POSSIBLE CAUSES:');
        addLog('   - Supabase project is paused (check dashboard)');
        addLog('   - Network connectivity issues');
        addLog('   - Database connection limits exceeded');
        addLog('   - Firewall blocking requests');
      }

      // Test 1.5: Simple connection test (without table access)
      addLog('🔗 Test 1.5: Testing basic client connection...');
      try {
        // Test if we can at least create a client connection
        await supabase.auth.getUser();
        addLog('✅ Supabase client initialized successfully');
      } catch (clientError) {
        addLog(`❌ Supabase client initialization failed: ${clientError}`);
      }

      // Test 2: Authentication status
      addLog('👤 Test 2: Checking authentication status...');
      if (user) {
        addLog(`✅ User authenticated: ${user.email} (ID: ${user.id})`);
        addLog(`   🔑 User metadata: ${JSON.stringify(user.user_metadata)}`);
      } else {
        addLog('❌ No user authenticated');
      }

      // Test 3: Environment variables
      addLog('🔧 Test 3: Checking environment variables...');
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

      if (supabaseUrl) {
        addLog(`✅ REACT_APP_SUPABASE_URL is set (${supabaseUrl.substring(0, 30)}...)`);
      } else {
        addLog('❌ REACT_APP_SUPABASE_URL is not set');
      }

      if (supabaseKey) {
        addLog(`✅ REACT_APP_SUPABASE_ANON_KEY is set (${supabaseKey.substring(0, 20)}...)`);
      } else {
        addLog('❌ REACT_APP_SUPABASE_ANON_KEY is not set');
      }

      // Test 4: Table existence with timeout
      addLog('📊 Test 4: Checking database tables...');
      const tables = ['feeding_sessions', 'user_profiles'];
      for (const table of tables) {
        try {
          addLog(`   Checking table '${table}'...`);
          const tableTest = supabase.from(table).select('count').limit(1);
          const tableTimeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Table '${table}' check timeout`)), 10000)
          );

          const { error } = await Promise.race([tableTest, tableTimeout]) as any;

          if (error && error.code === '42P01') {
            addLog(`   ❌ Table '${table}' does not exist`);
            addLog('   💡 SOLUTION: Run the SQL setup script in Supabase dashboard');
          } else if (error) {
            addLog(`   ❌ Error accessing table '${table}': ${error.message}`);
            if (error.code === '42501') {
              addLog('   💡 SOLUTION: Check Row Level Security policies');
            }
          } else {
            addLog(`   ✅ Table '${table}' exists and is accessible`);
          }
        } catch (timeoutErr) {
          addLog(`   ❌ Table '${table}' check timed out: ${timeoutErr}`);
        }
      }

      // Test 5: Row Level Security
      if (user) {
        addLog('🔒 Test 5: Testing Row Level Security...');
        try {
          const { error } = await supabase
            .from('feeding_sessions')
            .select('*')
            .eq('user_id', user.id)
            .limit(1);

          if (error) {
            addLog(`❌ RLS test failed: ${error.message}`);
            if (error.code === '42501') {
              addLog('   💡 SOLUTION: Check Row Level Security policies in Supabase dashboard');
            }
          } else {
            addLog('✅ RLS policies working correctly');
          }
        } catch (err) {
          addLog(`❌ RLS test error: ${err}`);
        }
      }

      // Test 6: Try to insert a test record
      if (user) {
        addLog('📝 Test 6: Testing data insertion...');
        try {
          const testSession = {
            id: `test-${Date.now()}`,
            user_id: user.id,
            start_time: new Date().toISOString(),
            end_time: null,
            duration: 5,
            breast_type: 'left' as const,
            bottle_volume: null,
            notes: 'Test session from debug tool',
            is_active: false
          };

          const { data, error } = await supabase
            .from('feeding_sessions')
            .insert(testSession)
            .select();

          if (error) {
            addLog(`❌ Insert test failed: ${error.message}`);
            addLog(`   Error code: ${error.code}`);
            if (error.code === '42501') {
              addLog('   💡 SOLUTION: Check Row Level Security policies');
            } else if (error.code === '23505') {
              addLog('   💡 SOLUTION: Test record already exists (this is ok)');
            }
          } else {
            addLog('✅ Insert test successful');
            addLog(`   📊 Inserted record ID: ${data?.[0]?.id}`);

            // Clean up test record
            if (data?.[0]?.id) {
              await supabase
                .from('feeding_sessions')
                .delete()
                .eq('id', data[0].id);
              addLog('   🗑️ Cleaned up test record');
            }
          }
        } catch (insertError) {
          addLog(`❌ Insert test error: ${insertError}`);
        }
      }

      // Test 7: Current app state
      addLog('📱 Test 7: Checking app state...');
      addLog(`   Sessions in state: ${state.sessions.length}`);
      addLog(`   Live session: ${state.liveSession ? 'Active' : 'None'}`);
      addLog(`   Is loading: ${state.isLoading}`);

    } catch (error) {
      addLog(`💥 Unexpected error during tests: ${error}`);
    } finally {
      addLog('🏁 Debug tests completed');
      setIsRunningTests(false);
    }
  };

  const clearLogs = () => {
    setDebugResults([]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#f5f5f5' }}>
      <h1>🔧 Supabase Debug Tool</h1>
      <p>Use this tool to diagnose Supabase connection and database issues.</p>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={runDebugTests}
          disabled={isRunningTests}
          style={{
            padding: '10px 20px',
            backgroundColor: isRunningTests ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isRunningTests ? 'not-allowed' : 'pointer'
          }}
        >
          {isRunningTests ? '🔄 Running Tests...' : '🚀 Run Full Debug Tests'}
        </button>

        <button
          onClick={async () => {
            addLog('🌐 Testing basic connectivity...');
            try {
              const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/`, {
                method: 'HEAD',
                headers: {
                  'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY || ''
                }
              });
              if (response.ok) {
                addLog('✅ Supabase endpoint is reachable');
              } else {
                addLog(`❌ Supabase endpoint returned status: ${response.status}`);
              }
            } catch (error) {
              addLog(`❌ Network error: ${error}`);
              addLog('   💡 Check your internet connection or if Supabase is paused');
            }
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            marginLeft: '10px',
            cursor: 'pointer'
          }}
        >
          🌐 Quick Connectivity Test
        </button>

        <button
          onClick={async () => {
            if (!user) {
              addLog('❌ No user authenticated - please sign in first');
              return;
            }

            addLog('🍼 Testing feeding session insertion...');
            try {
              const testSession = {
                id: `debug-test-${Date.now()}`,
                user_id: user.id,
                start_time: new Date().toISOString(),
                end_time: new Date(Date.now() + 60000).toISOString(), // 1 minute later
                duration: 1,
                breast_type: 'left' as const,
                bottle_volume: null,
                notes: 'Debug test session',
                is_active: false
              };

              addLog('📤 Attempting to insert test session...');
              const insertPromise = supabase
                .from('feeding_sessions')
                .insert(testSession)
                .select();

              const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Insert timeout after 15 seconds')), 15000)
              );

              const { data, error } = await Promise.race([insertPromise, timeoutPromise]) as any;

              if (error) {
                addLog(`❌ Insert failed: ${error.message}`);
                addLog(`   Error code: ${error.code}`);
                if (error.code === '42P01') {
                  addLog('   💡 SOLUTION: Database tables not created - run SQL setup script');
                } else if (error.code === '42501') {
                  addLog('   💡 SOLUTION: Row Level Security blocking access');
                }
              } else {
                addLog('✅ Insert successful!');
                addLog(`   📊 Session ID: ${data?.[0]?.id}`);

                // Clean up test record
                if (data?.[0]?.id) {
                  await supabase.from('feeding_sessions').delete().eq('id', data[0].id);
                  addLog('   🗑️ Cleaned up test record');
                }
              }
            } catch (error) {
              addLog(`❌ Insert test error: ${error}`);
            }
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            marginLeft: '10px',
            cursor: 'pointer'
          }}
        >
          🍼 Test Feeding Session Insert
        </button>

        <button
          onClick={clearLogs}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            marginLeft: '10px',
            cursor: 'pointer'
          }}
        >
          🗑️ Clear Logs
        </button>
      </div>

      <div style={{
        backgroundColor: '#000',
        color: '#00ff00',
        padding: '15px',
        borderRadius: '5px',
        fontSize: '12px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {debugResults.length === 0 ? (
          <div style={{ color: '#888' }}>Click "Run Debug Tests" to start diagnostics...</div>
        ) : (
          debugResults.map((log, index) => (
            <div key={index} style={{ marginBottom: '5px' }}>
              {log}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '5px' }}>
        <h3>📋 Common Solutions:</h3>
        <ul>
          <li><strong>Missing tables:</strong> Run the SQL script from <code>supabase-setup.sql</code> in your Supabase dashboard</li>
          <li><strong>Environment variables:</strong> Check that <code>.env.local</code> contains correct Supabase credentials</li>
          <li><strong>Authentication:</strong> Make sure you're logged in to the app</li>
          <li><strong>RLS policies:</strong> Verify Row Level Security is properly configured</li>
        </ul>
      </div>
    </div>
  );
};

export default Debug;
