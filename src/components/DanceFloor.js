import React, { Component } from "react";
import Youtube from "react-youtube";

const guideContainerWidth = 300;
const guideWidth = 30;

let press = false;

class DanceFloor extends Component {
  static defaultProps = {
    song: {
      title: "Audition Days - Canon Groove",
      youtubeId: "N1frS_LWy24",
      bpm: 105,
      delay: 1410
    }
  };

  // interval: https://github.com/Hackbit/reactriot2018-anakbawang/wiki
  state = {
    isSongReady: false,
    isSongFinished: false,
    interval: ((60 * 1000) / this.props.song.bpm) * 4,
    guideOffset: 0
  };

  componentDidmount() {
    this.animationStart = null;
    this.animationFrame = null;
  }

  componentWillUnmount() {
    if (this.animationFrame) {
      window.cancelAnimationFrame(this.animationFrame);
    }
  }

  handleYoutubeReady = event => {
    // as soon as the player ready
    // pause the video so it syncs better
    // with our timer
    event.target.pauseVideo();
    // save youtube object selector
    // for future access
    this.youtubePlayer = event.target;
    this.setState({ isSongReady: true });
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
    if (event.data === 0) {
      this.stopGuide();
    }
  };

  startGame = () => {
    const { song } = this.props;

    setTimeout(() => this.youtubePlayer.playVideo(), song.delay);
    this.startGuide();
  };

  stopGame = () => {
    this.youtubePlayer.pauseVideo();
    this.stopGuide();
  };

  startGuide = () => {
    this.animationFrame = window.requestAnimationFrame(this.updateGuide);
  };

  stopGuide = () => {
    window.cancelAnimationFrame(this.animationFrame);
    this.animationStart = null;
    this.animationFrame = null;
  };

  updateGuide = timestamp => {
    const { interval } = this.state;

    // if this is the first frame, save the timestamp
    // as the time of when the song start
    // so we'll be able to know how long has the song been played
    if (!this.animationStart) {
      this.animationStart = timestamp;
    }
    const timePassed = timestamp - this.animationStart;
    // position the guide based on interval
    const guideOffset =
      ((timePassed % interval) / interval) * guideContainerWidth;
    this.setState({ guideOffset });

    // update continuously until stopped by youtube player (song ended)
    this.animationFrame = window.requestAnimationFrame(this.updateGuide);
  };

  render() {
    const { song } = this.props;
    const { isSongReady, interval, guideOffset } = this.state;

    return (
      <div>
        {interval}
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
          onStateChange={this.handleYoutubeStateChange}
        />
        <div>
          <button onClick={this.startGame}>Start Game</button>
          <button onClick={this.stopGame}>Stop Game</button>
        </div>
        <div
          style={{
            width: `${guideContainerWidth + guideWidth}px`,
            height: "60px",
            position: "relative",
            backgroundColor: "red"
          }}
        >
          <span
            style={{
              display: "block",
              width: `${guideWidth}px`,
              height: "30px",
              backgroundColor: "blue",
              borderRadius: "50%",
              position: "absolute",
              top: "15px",
              left: `${guideOffset}px`
            }}
          />
        </div>
        {!isSongReady ? "Loading..." : <div>Ready</div>}
      </div>
    );
  }
}

export default DanceFloor;
