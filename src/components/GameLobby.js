import React, { Component } from "react";
import Youtube from "react-youtube";

const songList = [
  {
    title: "So Eun Lee - Loving You",
    youtubeId: "F5cReku6iZg",
    bpm: 72
  },
  {
    title: " Audition Days - Canon Groove",
    youtubeId: "N1frS_LWy24",
    bpm: 105
  }
];

class GameLobby extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedSong: songList[0]
    };
  }

  handleSelectSong = song => {
    this.setState({ selectedSong: song });
  };

  render() {
    const selectedSong = this.state.selectedSong;

    return (
      <div>
        Game Lobby!
        <div>
          {songList.map(song => (
            <div>
              <button onClick={() => this.handleSelectSong(song)}>
                {song.title} ({song.bpm} bpm)
              </button>
            </div>
          ))}
        </div>
        <div>
          <button onClick={() => this.props.handleChangeSong(selectedSong)}>
            play!
          </button>
        </div>
        <Youtube
          videoId={selectedSong.youtubeId}
          opts={{
            height: "390",
            width: "640",
            playerVars: {
              autoplay: 1
            }
          }}
          //onReady={this.handleYoutubeReady}
          //onStateChange={this.handleYoutubeStateChange}
        />
      </div>
    );
  }
}

export default GameLobby;
