import React from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import DocumentWorkspace from './components/DocumentWorkspace';
import awsconfig from './aws-exports';
import './App.css';
import '@aws-amplify/ui-react/styles.css';

// Configure Amplify
Amplify.configure(awsconfig);

function App() {
  return (
    <Authenticator
      components={{
        Header() {
          return (
            <div className="auth-header">
              <div className="auth-logo">
                <div className="ph-seal">🇵🇭</div>
                <div className="auth-title">
                  <h1>Republic of the Philippines</h1>
                  <h2>Bureau of Treasury</h2>
                  <p>Document Management System with AI Assistant</p>
                </div>
              </div>
            </div>
          );
        },
        Footer() {
          return (
            <div className="auth-footer">
              <p>Secure • Regional Access • AI-Powered</p>
            </div>
          );
        }
      }}
      formFields={{
        signIn: {
          username: {
            placeholder: 'Enter your email address',
            label: 'Email Address',
            inputProps: { required: true }
          },
          password: {
            placeholder: 'Enter your password',
            label: 'Password',
            inputProps: { required: true }
          }
        }
      }}
    >
      {({ signOut, user }) => (
        <div className="App">
          <header className="app-header">
            <div className="header-content">
              <div className="header-logo">
                <div className="ph-seal">🇵🇭</div>
                <div className="header-title">
                  <h1>Bureau of Treasury</h1>
                  <p>Document Management System</p>
                </div>
              </div>
              
              <div className="header-actions">
                <div className="user-info">
                  <span className="user-name">
                    {user?.attributes?.email || 'User'}
                  </span>
                  <span className="user-region">
                    {user?.attributes?.['custom:role'] === 'super-admin' 
                      ? '👑 Super Admin' 
                      : `📍 ${user?.attributes?.['custom:region'] || 'Region'}`
                    }
                  </span>
                </div>
                <button 
                  onClick={signOut}
                  className="sign-out-button"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </header>

          <main className="main-content">
            <DocumentWorkspace user={user} />
          </main>

          <footer className="app-footer">
            <div className="footer-content">
              <div className="footer-info">
                <p>&copy; 2025 Bureau of Treasury, Republic of the Philippines</p>
                <p>Powered by AWS • Secured by Cognito • Enhanced by AI</p>
              </div>
              <div className="footer-links">
                <span>Version 1.0.0</span>
                <span>•</span>
                <span>Support: IT Department</span>
              </div>
            </div>
          </footer>
        </div>
      )}
    </Authenticator>
  );
}

export default App;
