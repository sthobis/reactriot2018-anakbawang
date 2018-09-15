import produce from "immer";
import React, { Component } from "react";
import "./App.css";
import DanceFloor from "./components/DanceFloor";
import GameLobby from "./components/GameLobby";

class App extends Component {
  state = {
    readyToPlay: true,
    song: {
      title: "Audition Days - Canon Groove",
      youtubeId: "N1frS_LWy24",
      bpm: 105,
      delay: 1410
    }
  };

  handleStateChange = (key, value, cb) => {
    this.setState(
      produce(draft => {
        draft[key] = value;
      }),
      cb
    );
  };

  render() {
    const { readyToPlay, song } = this.state;
    return (
      <div>{!readyToPlay ? <GameLobby /> : <DanceFloor song={song} />}</div>
    );
  }
}

export default App;
