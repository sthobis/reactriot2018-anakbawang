import React, { Component } from "react";
import "./App.css";
import DanceFloor from "./components/DanceFloor";
import GameLobby from "./components/GameLobby";

class App extends Component {
  state = {
    readyToPlay: false,
    song: null
  };

  handleSongChange = song => {
    this.setState({ readyToPlay: true, song });
  };

  render() {
    const { readyToPlay, song } = this.state;
    return (
      <div>
        {!readyToPlay ? (
          <GameLobby handleChangeSong={this.handleChangeSong} />
        ) : (
          <DanceFloor song={song} />
        )}
      </div>
    );
  }
}

export default App;
