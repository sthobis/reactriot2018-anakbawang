import produce from "immer";
import React, { Component } from "react";
import Youtube from "react-youtube";

class DanceFloor extends Component {
  static defaultProps = {
    song: {
      title: "Audition Days - Canon Groove",
      youtubeId: "N1frS_LWy24",
      bpm: 105
    }
  };

  // interval: https://github.com/Hackbit/reactriot2018-anakbawang/wiki
  state = {
    isSongReady: false,
    isSongFinished: false,
    interval: ((60 * 1000) / this.props.song.bpm) * 4
  };

  handleStateChange = (key, value, cb) => {
    this.setState(
      produce(draft => {
        draft[key] = value;
      }),
      cb
    );
  };

  handleYoutubeReady = event => {
    // as soon as the player ready
    // pause the video so it syncs better
    // with our timer
    event.target.pauseVideo();
    // save youtube object selector
    // for future access
    this.youtube = event.target;
    this.handleStateChange("isSongReady", true);
  };

  render() {
    const { song } = this.props;
    const { isSongReady } = this.state;

    return (
      <div>
        <Youtube
          videoId={song.youtubeId}
          opts={{
            height: "390",
            width: "640",
            playerVars: {
              autoplay: 1
            }
          }}
          onReady={this.handleYoutubeReady}
        />
        {!isSongReady ? "Loading..." : <div>Ready</div>}
      </div>
    );
  }
}

export default DanceFloor;
