import React, { Component } from "react";
import Youtube from "react-youtube";

const songList = [
  {
    title: "So Eun Lee - Loving You",
    youtubeId: "F5cReku6iZg",
    bpm: 72,
    previewStartAt: 83,
    delay: 0,
    skipInterval: 8
  },
  {
    title: " Audition Days - Canon Groove",
    youtubeId: "N1frS_LWy24",
    bpm: 105,
    previewStartAt: 23,
    delay: 1410,
    skipInterval: 10
  }
];

class GameLobby extends Component {
  state = {
    selectedSong: songList[0]
  };

  handleSelectSong = selectedSong => {
    this.setState({ selectedSong });
  };

  render() {
    const { handleChangeSong } = this.props;
    const { selectedSong } = this.state;

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
          <button onClick={() => handleChangeSong(selectedSong)}>play!</button>
        </div>
        <Youtube
          videoId={selectedSong.youtubeId}
          opts={{
            height: "390",
            width: "640",
            playerVars: {
              autoplay: 1,
              start: selectedSong.previewStartAt
            }
          }}
        />
      </div>
    );
  }
}

export default GameLobby;
