import React, { Component } from "react";
import Youtube from "react-youtube";
import CONFIG from "../config";

class GameLobby extends Component {
  state = {
    selectedSongIndex: 0
  };

  handleKeyDown = e => {
    const { handleChangeSong } = this.props;
    const { selectedSongIndex } = this.state;

    switch (e.which) {
      case CONFIG.KEYS_CODE.UP:
        this.setState(state => ({
          selectedSongIndex:
            (state.selectedSongIndex + CONFIG.SONG_LIST.length - 1) %
            CONFIG.SONG_LIST.length
        }));
        break;
      case CONFIG.KEYS_CODE.DOWN:
        this.setState(state => ({
          selectedSongIndex:
            (state.selectedSongIndex + 1) % CONFIG.SONG_LIST.length
        }));
        break;
      case CONFIG.KEYS_CODE.ENTER:
        handleChangeSong(CONFIG.SONG_LIST[selectedSongIndex]);
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
          {CONFIG.SONG_LIST.map((song, index) => (
            <div key={CONFIG.SONG_LIST[index].youtubeId}>
              <button onClick={() => handleChangeSong(CONFIG.SONG_LIST[index])}>
                {song.title} ({song.bpm} bpm)
              </button>
            </div>
          ))}
        </div>
        <Youtube
          videoId={CONFIG.SONG_LIST[selectedSongIndex].youtubeId}
          opts={{
            height: "390",
            width: "640",
            playerVars: {
              autoplay: 1,
              start: CONFIG.SONG_LIST[selectedSongIndex].previewStartAt
            }
          }}
        />
      </div>
    );
  }
}

export default GameLobby;
