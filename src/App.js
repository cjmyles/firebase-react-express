import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

class App extends Component {
  state = {
    timestamp: null
  };

  async componentDidMount() {
    const response = await fetch("/api/timestamp");
    const timestamp = await response.json();
    console.log(timestamp);
    this.setState({ timestamp });
  }

  render() {
    const { timestamp } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
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
        {timestamp && <p>Timestamp: {timestamp}</p>}
      </div>
    );
  }
}

export default App;
