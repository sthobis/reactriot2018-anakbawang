import React, { Component } from "react";
import DanceFloor from "./components/DanceFloor";
import GameLobby from "./components/GameLobby";

class App extends Component {
  state = {
    readyToPlay: false,
    song: undefined
  };

  handleChangeSong = song => {
    this.setState({ readyToPlay: true, song });
  };

  goToLobby = () => {
    this.setState({ readyToPlay: false });
  };

  render() {
    const { readyToPlay, song } = this.state;
    return (
      <div>
        {!readyToPlay ? (
          <GameLobby handleChangeSong={this.handleChangeSong} />
        ) : (
          <DanceFloor song={song} goToLobby={this.goToLobby} />
        )}
      </div>
    );
  }
}

export default App;
