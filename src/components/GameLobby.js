import React, { Component } from "react";

class GameLobby extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    const song = {
      title: event.currentTarget.getAttribute("title"),
      youtubeId: event.currentTarget.getAttribute("youtubeid"),
      bpm: event.currentTarget.getAttribute("bpm")
    };
    this.props.onSongChange(song);
  }

  render() {
    return (
      <div>
        Game Lobby!
        <button
          title="So Eun Lee - Loving You"
          youtubeid="F5cReku6iZg"
          bpm="72"
          onClick={this.handleClick}
        >
          So Eun Lee- Loving You (72 bpm)
        </button>
        <button
          title="Audition Days - Canon Groove"
          youtubeid="N1frS_LWy24"
          bpm="105"
          onClick={this.handleClick}
        >
          Audition Days - Canon Groove (105 bpm)
        </button>
      </div>
    );
  }
}

export default GameLobby;
