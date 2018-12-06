import React, { Component } from 'react';
import FacebookLogin from 'react-facebook-login';
import logo from './logo.svg';
import './App.css';

const APP_ID = '243883486171883';

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

  async getFacebookProfile() {
    const response = await fetch('/api/profile');
    try {
      const profile = await response.json();
      this.setState({ profile });
    } catch (error) {}
  }

  async debug() {
    const response = await fetch('/api/debug');
    try {
      const debug = await response.json();
      console.log(debug);
    } catch (error) {}
  }

  async setCookie() {
    const response = await fetch('/api/cookie', { method: 'POST' });
    try {
      const json = await response.json();
      console.log('Cookie set:', json.status);
    } catch (error) {}
  }

  async getCookie() {
    const response = await fetch('/api/cookie');
    try {
      const cookie = await response.json();
      console.log('Cookie get:', cookie);
    } catch (error) {}
  }

  async componentDidMount() {
    this.testAPI();
    this.getFacebookProfile();
    // await this.setCookie();
    // this.getCookie();
    this.debug();
  }

  handleLoginClick = event => {
    console.log(event);
  };

  handleFacebookCallback = async fbResponse => {
    try {
      await fetch('/api/facebook', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken: fbResponse.accessToken }),
      });
      this.getFacebookProfile();
    } catch (error) {
      console.error(error);
    }
  };

  handleLogout = async () => {
    try {
      await fetch('/api/logout');
      this.setState({ profile: null });
      console.log('Logged out!');
    } catch (error) {
      console.error(error);
    }
  };

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
                <pre style={{ fontSize: 11 }}>
                  {JSON.stringify(profile, null, 2)}
                </pre>
              </li>
            )}
          </ul>
          {profile ? (
            <div className="App-facebook">
              <button onClick={this.handleLogout}>Logout</button>
            </div>
          ) : (
            <div className="App-facebook">
              <FacebookLogin
                appId={APP_ID}
                autoLoad={false}
                fields="name,email,picture"
                //onClick={this.handleLoginClick}
                callback={this.handleFacebookCallback}
              />
            </div>
          )}
        </header>
      </div>
    );
  }
}

export default App;
