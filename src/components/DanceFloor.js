import produce from "immer";
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
const KEYS_CODE = {
  ENTER: 13,
  ESC: 27,
  SPACE: 32,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40
};
const ARROW_KEYS = [
  KEYS_CODE.UP,
  KEYS_CODE.DOWN,
  KEYS_CODE.LEFT,
  KEYS_CODE.RIGHT
];

const keyCodeToString = key => {
  if (key === 37) return "◀";
  else if (key === 38) return "▲";
  else if (key === 39) return "▶";
  else if (key === 40) return "▼";
  else return "⟳";
};

class DanceFloor extends Component {
  static defaultProps = {
    song: {
      title: "So Eun Lee - Loving You",
      youtubeId: "F5cReku6iZg",
      bpm: 72,
      previewStartAt: 83,
      delay: 0,
      skipInterval: 8
    }
  };

  // interval: https://github.com/Hackbit/reactriot2018-anakbawang/wiki
  state = {
    isSongReady: false,
    isSongFinished: false,

    duration: 0,
    interval: ((60 * 1000) / this.props.song.bpm) * 4,

    guideOffset: 0,

    solutionSequence: [],
    currentSequenceIndex: 0,
    resultSequence: [],

    pressedKeys: [],
    currentHitType: HIT_TYPE.MISS
  };

  // timestamp when requestAnimationFrame
  // callback called for the first time
  animationStart = null;
  // reference to next requestAnimationFrame
  // callback incase we need to cancel it
  animationFrame = null;
  // timing window
  badWindow = {};
  coolWindow = {};
  perfectWindow = {};

  componentDidMount() {
    // CLASS

    // add keydown listener for gameplay
    // arrows + space
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    if (this.animationFrame) {
      window.cancelAnimationFrame(this.animationFrame);
    }
    // remove gameplay's keydown listener
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  handleYoutubeReady = event => {
    // as soon as the player ready
    // pause the video so it syncs better
    // with our timer
    event.target.pauseVideo();
    // save youtube object selector
    // for future access
    this.youtubePlayer = event.target;
    this.setState(
      { isSongReady: true, duration: this.youtubePlayer.getDuration() * 1000 },
      this.createGameSession
    );
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
      this.stopAnimation();
    }
  };

  createGameSession = () => {
    this.setTimingWindow();
    this.setSolutionSequence();
  };

  setTimingWindow = () => {
    const { interval } = this.state;

    // timing window for when player press space key
    // illustration: xxxxxxxbbccppccbbxx
    // where x = miss, b = bad, c = cool, p = perfect
    this.badWindow.duration =
      ((GUIDE_WIDTH * 2.5) / GUIDE_CONTAINER_WIDTH) * interval;
    this.badWindow.start = interval * 0.75 - this.badWindow.duration / 2;
    this.badWindow.end = this.badWindow.start + this.badWindow.duration;

    this.coolWindow.duration =
      ((GUIDE_WIDTH * 1.5) / GUIDE_CONTAINER_WIDTH) * interval;
    this.coolWindow.start = interval * 0.75 - this.coolWindow.duration / 2;
    this.coolWindow.end = this.coolWindow.start + this.coolWindow.duration;

    this.perfectWindow.duration =
      ((GUIDE_WIDTH * 0.5) / GUIDE_CONTAINER_WIDTH) * interval;
    this.perfectWindow.start =
      interval * 0.75 - this.perfectWindow.duration / 2;
    this.perfectWindow.end =
      this.perfectWindow.start + this.perfectWindow.duration;
  };

  setSolutionSequence = () => {
    const { song } = this.props;
    const { duration, interval } = this.state;

    // define skipped interval
    // an interval where no sequence is shown in the period
    // at the beginning, and the end of the song
    // beginning: custom per song
    // end: 4 interval
    const skippedInterval = song.skipInterval + 4;
    const solutionSequence = [];
    for (let i = 0; i < skippedInterval; i++) {
      solutionSequence.push(null);
    }

    // determine the number of sequence that
    // need to completed by player
    const numberOfSequenceNeeded =
      (Math.floor(duration / interval) - song.skipInterval - 4) / 2;
    // determine the number of sequence per level
    // there are 5 levels which are level 6, 7, 8, 9, 10
    const numberOfSequencePerLevel = Math.floor(numberOfSequenceNeeded / 5);

    // create sequence using randomizer
    let currentLevel = 6;
    let numberOfSequenceOnCurrentLevel = 0;
    let sequenceInserted = 0;
    for (let i = 0; i < numberOfSequenceNeeded; i++) {
      if (numberOfSequenceOnCurrentLevel < numberOfSequencePerLevel) {
        let sequence = [];
        for (let j = 0; j < currentLevel; j++) {
          sequence.push(
            ARROW_KEYS[Math.floor(Math.random() * ARROW_KEYS.length)]
          );
        }
        sequence.push(KEYS_CODE.SPACE);
        solutionSequence.splice(
          song.skipInterval + sequenceInserted,
          0,
          sequence,
          null
        );
        numberOfSequenceOnCurrentLevel++;
        sequenceInserted += 2;
      } else {
        if (currentLevel < 10) {
          currentLevel++;
        }
        let sequence = [];
        for (let j = 0; j < currentLevel; j++) {
          sequence.push(
            ARROW_KEYS[Math.floor(Math.random() * ARROW_KEYS.length)]
          );
        }
        sequence.push(KEYS_CODE.SPACE);
        solutionSequence.splice(
          song.skipInterval + sequenceInserted,
          0,
          sequence,
          null
        );
        numberOfSequenceOnCurrentLevel = 1;
        sequenceInserted += 2;
      }
    }

    const resultSequence = Array(solutionSequence.length).fill(null);
    this.setState({ solutionSequence, resultSequence });
  };

  startGame = () => {
    const { song } = this.props;

    this.startAnimation();
    setTimeout(() => this.youtubePlayer.playVideo(), song.delay);
    // add some delay to match the song beat with our timing window
  };

  stopGame = () => {
    this.youtubePlayer.pauseVideo();
    this.stopAnimation();
  };

  startAnimation = () => {
    this.animationFrame = window.requestAnimationFrame(this.updateAnimation);
  };

  stopAnimation = () => {
    window.cancelAnimationFrame(this.animationFrame);
    this.animationStart = null;
    this.animationFrame = null;

    this.printResult();
  };

  updateAnimation = timestamp => {
    const { interval } = this.state;

    // if this is the first frame, save the timestamp
    // as the time of when the song start
    // so we'll be able to know how long has the song been played
    if (!this.animationStart) {
      this.animationStart = timestamp;
    }

    const timePassed = timestamp - this.animationStart;

    // update currentSequenceIndex
    // to show players which solution they need to solve
    const currentSequenceIndex = Math.floor(timePassed / interval);
    this.setState({ currentSequenceIndex });

    // update guide (left) offset on DOM based on
    // time passed since the song started
    this.setGuideOffset(timePassed);

    // update what kind of hit does the player
    // will get if he press space right now
    // (miss, bad, cool, perfect)
    this.setCurrentHitType(timePassed, currentSequenceIndex);

    // update continuously until stopped by youtube player (song ended)
    this.animationFrame = window.requestAnimationFrame(this.updateAnimation);
  };

  setGuideOffset = timePassed => {
    const { interval } = this.state;

    const guideOffset =
      ((timePassed % interval) / interval) * GUIDE_CONTAINER_WIDTH;
    this.setState({ guideOffset });
  };

  setCurrentHitType = (timePassed, currentSequenceIndex) => {
    const { interval, solutionSequence } = this.state;

    // timing window for space key press
    // illustration: xxxxxxxbbccppccbbxx
    // where x = miss, b = bad, c = cool, p = perfect, o = guide/cursor
    const guidePosition = timePassed % interval;

    if (!solutionSequence[currentSequenceIndex]) {
      this.setState({ currentHitType: HIT_TYPE.MISS });
    } else if (
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
  };

  handleKeyDown = e => {
    const {
      solutionSequence,
      currentSequenceIndex,
      pressedKeys,
      currentHitType
    } = this.state;
    let newPressedKeys = pressedKeys.slice();

    switch (e.which) {
      case KEYS_CODE.UP:
      case KEYS_CODE.DOWN:
      case KEYS_CODE.LEFT:
      case KEYS_CODE.RIGHT:
        newPressedKeys.push(e.which);
        if (
          solutionSequence[currentSequenceIndex] &&
          solutionSequence[currentSequenceIndex]
            .toString()
            .startsWith(newPressedKeys.toString())
        ) {
          // player hit the correct keys,
          // update progress with the new key
          this.setState({ pressedKeys: newPressedKeys });
        } else {
          // player hit the wrong keys,
          // reset progress
          this.setState({ pressedKeys: [] });
        }
        break;
      case KEYS_CODE.SPACE:
        newPressedKeys.push(KEYS_CODE.SPACE);
        if (
          solutionSequence[currentSequenceIndex] &&
          solutionSequence[currentSequenceIndex]
            .toString()
            .startsWith(newPressedKeys.toString())
        ) {
          // player complete the correct solution
          // for current sequence
          this.setState(
            produce(draft => {
              draft.pressedKeys = [];
              draft.resultSequence[currentSequenceIndex] = currentHitType;
            })
          );
        } else {
          // player propose wrong solution
          // for current sequence
          this.setState(
            produce(draft => {
              draft.pressedKeys = [];
              draft.resultSequence[currentSequenceIndex] = HIT_TYPE.MISS;
            })
          );
        }
        break;
      default:
        break;
    }
  };

  printResult = () => {
    const { resultSequence } = this.state;
    console.log(resultSequence);
  };

  render() {
    const { song } = this.props;
    const {
      isSongReady,
      interval,
      guideOffset,
      currentHitType,
      solutionSequence,
      resultSequence,
      currentSequenceIndex,
      pressedKeys
    } = this.state;

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
          <button
            onClick={e => {
              e.target.blur();
              this.startGame();
            }}
          >
            Start Game
          </button>
          <button onClick={this.stopGame}>Stop Game</button>
        </div>
        <div>
          {solutionSequence[currentSequenceIndex]
            ? solutionSequence[currentSequenceIndex].map((key, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "24px",
                    margin: "10px",
                    color: key === pressedKeys[i] ? "red" : "black"
                  }}
                >
                  {keyCodeToString(key)}
                </span>
              ))
            : "skip"}
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
        <div>{resultSequence[currentSequenceIndex]}</div>
        {!isSongReady ? "Loading..." : <div>Ready</div>}
      </div>
    );
  }
}

export default DanceFloor;
