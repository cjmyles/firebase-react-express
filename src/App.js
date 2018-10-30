import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  state = {
    create: false,
    read: false,
    update: false,
    remove: false,
    login: false,
    user: null,
  };

  async create() {
    const response = await fetch('/api/basic', { method: 'POST' });
    const create = await response.json();
    this.setState({ create: create && create.success });
  }

  async read() {
    const response = await fetch('/api/basic');
    const read = await response.json();
    this.setState({ read: read && read.success });
  }

  async update() {
    const response = await fetch('/api/basic', { method: 'PUT' });
    const update = await response.json();
    this.setState({ update: update && update.success });
  }

  async remove() {
    const response = await fetch('/api/basic', { method: 'DELETE' });
    const remove = await response.json();
    this.setState({ remove: remove && remove.success });
  }

  async login() {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: '36nil',
        password: '123',
      }),
    });
    const login = await response.json();
    this.setState({ login: login && login.success });
  }

  async profile() {
    try {
      const response = await fetch('/api/profile', {
        // credentials: 'include',
      });
      const user = await response.json();
      this.setState({ user });
    } catch (error) {
      console.error(error);
    }
  }

  async debug() {
    const response = await fetch('/api/debug', {
      // credentials: 'include',
    });
    const debug = await response.json();
    console.log(debug);
  }

  async componentDidMount() {
    this.create();
    this.read();
    this.update();
    this.remove();

    await this.login();
    this.profile();
    this.debug();
  }

  render() {
    const { create, read, update, remove, login, user } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <ul className="App-status">
            <li>Create: {create ? 'true' : 'false'}</li>
            <li>Read: {read ? 'true' : 'false'}</li>
            <li>Update: {update ? 'true' : 'false'}</li>
            <li>Delete: {remove ? 'true' : 'false'}</li>
            <li>Login: {login ? 'true' : 'false'}</li>
            <li>
              User: <code>{user && JSON.stringify(user)}</code>
            </li>
          </ul>
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default App;
