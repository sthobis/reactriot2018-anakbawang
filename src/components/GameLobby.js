import React, { Component } from "react";
import Youtube from "react-youtube";

const KEYS_CODE = {
  ENTER: 13,
  ESC: 27,
  SPACE: 32,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40
};

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
    selectedSongIndex: 0
  };

  handleKeyDown = e => {
    const { handleChangeSong } = this.props;
    const { selectedSongIndex } = this.state;

    switch (e.which) {
      case KEYS_CODE.UP:
        console.log("up");
        this.setState(state => ({
          selectedSongIndex:
            (state.selectedSongIndex + songList.length - 1) % songList.length
        }));
        break;
      case KEYS_CODE.DOWN:
        console.log("down");
        this.setState(state => ({
          selectedSongIndex: (state.selectedSongIndex + 1) % songList.length
        }));
        break;
      case KEYS_CODE.ENTER:
        console.log(songList[this.state.selectedSongIndex]);
        this.props.handleChangeSong(songList[this.state.selectedSongIndex]);
        break;
      default:
        break;
    }
  };

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  handleSelectSong = selectedSongIndex => {
    this.setState({ selectedSongIndex });
  };

  render() {
    const { handleChangeSong } = this.props;
    const { selectedSongIndex } = this.state;

    return (
      <div>
        Game Lobby!
        <div>
          {songList.map((song, index) => (
            <div key={songList[index].youtubeId}>
              <button onClick={() => handleChangeSong(songList[index])}>
                {song.title} ({song.bpm} bpm)
              </button>
            </div>
          ))}
        </div>
        <Youtube
          videoId={songList[selectedSongIndex].youtubeId}
          opts={{
            height: "390",
            width: "640",
            playerVars: {
              autoplay: 1,
              start: songList[selectedSongIndex].previewStartAt
            }
          }}
        />
      </div>
    );
  }
}

export default GameLobby;
