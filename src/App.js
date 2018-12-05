import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

const apiUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://us-central1-node-test-f2063.cloudfunctions.net/app/api'
    : 'http://localhost:5001/node-test-f2063/us-central1/app/api';

const facebookLoginURL = apiUrl + '/facebook';
const facebookLogoutURL = apiUrl + '/logout';

class App extends Component {
  state = {
    message: 'null',
    profile: null,
  };

  async testAPI() {
    const response = await fetch('/api/message');
    try {
      const { message } = await response.json();
      this.setState({ message });
    } catch (error) {}
  }

  async facebookProfile() {
    const response = await fetch('/api/profile', { credentials: 'include' });
    try {
      const profile = await response.json();
      this.setState({ profile });
    } catch (error) {}
  }

  async componentDidMount() {
    this.testAPI();
    this.facebookProfile();
  }

  render() {
    const { message, profile } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <ul className="App-status">
            <li>API Response: {message}</li>
            <li>Authenticated: {profile ? 'true' : 'false'}</li>
            {profile && (
              <li>
                Facebook Profile:{' '}
                <div>
                  <pre>{JSON.stringify(profile, null, 2)}</pre>
                </div>
              </li>
            )}
          </ul>
          {profile ? (
            <a className="App-link" href={facebookLogoutURL}>
              Logout
            </a>
          ) : (
            <a className="App-link" href={facebookLoginURL}>
              Facebook Login
            </a>
          )}
        </header>
      </div>
    );
  }
}

export default App;
