import React, { Component } from "react";
import Youtube from "react-youtube";
import CONFIG from "../config";
import "../styles/GameLobby.css";

class GameLobby extends Component {
  state = {
    selectedSongIndex: 0
  };

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

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

  handleSelectSong = selectedSongIndex => {
    this.setState({ selectedSongIndex });
  };

  handleYoutubeReady = event => {
    // make sure to autoplay the video on ready
    event.target.playVideo();
  };

  handleYoutubeStateChange = event => {
    /*
      event.data :
      -1 (unstarted)
      0 (ended)
      1 (playing)
      2 (paused)
      3 (buffering)
      5 (video cued).
    */
    if (event.data === 0 || event.data === -1) {
      event.target.playVideo();
    }
  };

  render() {
    const { handleChangeSong } = this.props;
    const { selectedSongIndex } = this.state;

    return (
      <div className="lobby">
        <p className="help">
          Use Arrows to select song.
          <br />
          Press Enter to play.
        </p>
        <div className="selection">
          {CONFIG.SONG_LIST.map((song, index) => (
            <div
              key={CONFIG.SONG_LIST[index].youtubeId}
              className={`song${selectedSongIndex === index ? " active" : ""}`}
            >
              {selectedSongIndex === index && <span>{">"}</span>}
              <button
                onClick={() => handleChangeSong(CONFIG.SONG_LIST[index])}
                onMouseOver={() => this.setState({ selectedSongIndex: index })}
              >
                {song.title}
                <br />
                {song.bpm} bpm
              </button>
            </div>
          ))}
        </div>
        <div className="preview">
          <Youtube
            videoId={CONFIG.SONG_LIST[selectedSongIndex].youtubeId}
            containerClassName="youtube"
            opts={{
              height: "100%",
              width: "100%",
              playerVars: {
                autoplay: 1,
                start: CONFIG.SONG_LIST[selectedSongIndex].previewStartAt,
                loop: 1,
                playlist: CONFIG.SONG_LIST[selectedSongIndex].youtubeId,
                controls: 0,
                disablekb: 1,
                showinfo: 0
              }
            }}
            onReady={this.handleYoutubeReady}
            onStateChange={this.handleYoutubeStateChange}
          />
          <marquee>{`${CONFIG.SONG_LIST[selectedSongIndex].title} (${
            CONFIG.SONG_LIST[selectedSongIndex].bpm
          } BPM)`}</marquee>
        </div>
        <p className="credit">
          Made by <a href="https://github.com/sthobis">@sthobis</a> and{" "}
          <a href="https://github.com/ajiajikasmaji">@ajiajikasmaji</a>.
        </p>
      </div>
    );
  }
}

export default GameLobby;
