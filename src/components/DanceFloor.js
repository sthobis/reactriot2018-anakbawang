import React, { Component } from "react";
import Youtube from "react-youtube";

const GUIDE_CONTAINER_WIDTH = 300;
const GUIDE_WIDTH = 30;
const HIT_TYPE = {
  MISS: "MISS",
  BAD: "BAD",
  COOL: "COOL",
  PERFECT: "PERFECT"
};
const COLOR = {
  MISS: "grey",
  BAD: "pink",
  COOL: "lightblue",
  PERFECT: "mediumpurple"
};

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
    guideOffset: 0,
    currentHitType: HIT_TYPE.MISS
  };

  componentDidMount() {
    const { interval } = this.state;

    // timestamp when requestAnimationFrame
    // callback called for the first time
    this.animationStart = null;
    // reference to next requestAnimationFrame
    // callback incase we need to cancel it
    this.animationFrame = null;

    // timing window for space key press
    // illustration: xxxxxxxbbccppccbbxx
    // where x = miss, b = bad, c = cool, p = perfect
    this.badWindow = {};
    this.badWindow.duration =
      ((GUIDE_WIDTH * 2.5) / GUIDE_CONTAINER_WIDTH) * interval;
    this.badWindow.start = interval * 1.75 - this.badWindow.duration / 2;
    this.badWindow.end = this.badWindow.start + this.badWindow.duration;

    this.coolWindow = {};
    this.coolWindow.duration =
      ((GUIDE_WIDTH * 1.5) / GUIDE_CONTAINER_WIDTH) * interval;
    this.coolWindow.start = interval * 1.75 - this.coolWindow.duration / 2;
    this.coolWindow.end = this.coolWindow.start + this.coolWindow.duration;

    this.perfectWindow = {};
    this.perfectWindow.duration =
      ((GUIDE_WIDTH * 0.5) / GUIDE_CONTAINER_WIDTH) * interval;
    this.perfectWindow.start =
      interval * 1.75 - this.perfectWindow.duration / 2;
    this.perfectWindow.end =
      this.perfectWindow.start + this.perfectWindow.duration;
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

    this.startGuide();
    setTimeout(() => this.youtubePlayer.playVideo(), song.delay);
    // add some delay to match the song beat with our timing window
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

    // update guide (left) offset on DOM based on interval
    const guideOffset =
      ((timePassed % interval) / interval) * GUIDE_CONTAINER_WIDTH;
    this.setState({ guideOffset });

    // timing window for space key press
    // illustration: xxxxxxxbbccppccbbxx
    // where x = miss, b = bad, c = cool, p = perfect, o = guide/cursor
    const guidePosition = timePassed % (interval * 2);
    if (
      guidePosition > this.badWindow.start &&
      guidePosition < this.coolWindow.start
    ) {
      // illustration: xxxxxxxbbccppccbbxx
      //                      o
      this.setState({ currentHitType: HIT_TYPE.BAD });
    } else if (
      guidePosition > this.coolWindow.start &&
      guidePosition < this.perfectWindow.start
    ) {
      // illustration: xxxxxxxbbccppccbbxx
      //                        o
      this.setState({ currentHitType: HIT_TYPE.COOL });
    } else if (
      guidePosition > this.perfectWindow.start &&
      guidePosition < this.perfectWindow.end
    ) {
      // illustration: xxxxxxxbbccppccbbxx
      //                          o
      this.setState({ currentHitType: HIT_TYPE.PERFECT });
    } else if (
      guidePosition > this.perfectWindow.end &&
      guidePosition < this.coolWindow.end
    ) {
      // illustration: xxxxxxxbbccppccbbxx
      //                            o
      this.setState({ currentHitType: HIT_TYPE.COOL });
    } else if (
      guidePosition > this.coolWindow.end &&
      guidePosition < this.badWindow.end
    ) {
      // illustration: xxxxxxxbbccppccbbxx
      //                              o
      this.setState({ currentHitType: HIT_TYPE.BAD });
    } else if (
      guidePosition < this.badWindow.start ||
      guidePosition > this.badWindow.end
    ) {
      // illustration: xxxxxxxbbccppccbbxx
      //                   o
      // or
      // illustration: xxxxxxxbbccppccbbxx
      //                                o
      this.setState({ currentHitType: HIT_TYPE.MISS });
    }

    // update continuously until stopped by youtube player (song ended)
    this.animationFrame = window.requestAnimationFrame(this.updateGuide);
  };

  render() {
    const { song } = this.props;
    const { isSongReady, interval, guideOffset, currentHitType } = this.state;

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
            width: `${GUIDE_CONTAINER_WIDTH + GUIDE_WIDTH}px`,
            height: "60px",
            position: "relative",
            backgroundColor: "silver"
          }}
        >
          <span
            style={{
              display: "block",
              width: `${GUIDE_WIDTH}px`,
              height: "30px",
              backgroundColor: COLOR[currentHitType],
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
