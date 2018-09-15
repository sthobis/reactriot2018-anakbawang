import produce from "immer";
import React, { Component } from "react";
import Youtube from "react-youtube";
import CONFIG from "../config";
import "../styles/DanceFloor.css";

const keyCodeToString = key => {
  if (key === 37) return "◀";
  else if (key === 38) return "▲";
  else if (key === 39) return "▶";
  else if (key === 40) return "▼";
  else return "⟳";
};

class DanceFloor extends Component {
  static defaultProps = {
    song: CONFIG.SONG_LIST[1]
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
    currentHitType: CONFIG.HIT_TYPE.MISS
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

    // everything is ready at this point
    // we can start the game
    this.startGame();
  };

  setTimingWindow = () => {
    const { interval } = this.state;

    // timing window for when player press space key
    // illustration: xxxxxxxbbccppccbbxx
    // where x = miss, b = bad, c = cool, p = perfect
    this.badWindow.duration =
      ((CONFIG.GUIDE_WIDTH * 2.5) / CONFIG.GUIDE_CONTAINER_WIDTH) * interval;
    this.badWindow.start = interval * 0.75 - this.badWindow.duration / 2;
    this.badWindow.end = this.badWindow.start + this.badWindow.duration;

    this.coolWindow.duration =
      ((CONFIG.GUIDE_WIDTH * 1.5) / CONFIG.GUIDE_CONTAINER_WIDTH) * interval;
    this.coolWindow.start = interval * 0.75 - this.coolWindow.duration / 2;
    this.coolWindow.end = this.coolWindow.start + this.coolWindow.duration;

    this.perfectWindow.duration =
      ((CONFIG.GUIDE_WIDTH * 0.5) / CONFIG.GUIDE_CONTAINER_WIDTH) * interval;
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

    // determine the total number of sequence that
    // need to completed by player
    // divide it by 2 because we have resting interval
    // in between input/sequence interval
    const numberOfSequenceNeeded =
      (Math.floor(duration / interval) - skippedInterval) / 2;
    // determine the number of sequence/solution per level
    // there are 5 levels which are level 6, 7, 8, 9, 10
    const numberOfSequencePerLevel = Math.floor(numberOfSequenceNeeded / 5);

    // create sequence using randomizer
    let currentLevel = 6;
    let numberOfSequenceOnCurrentLevel = 0;
    let sequenceInserted = 0;
    for (let i = 0; i < numberOfSequenceNeeded; i++) {
      if (numberOfSequenceOnCurrentLevel < numberOfSequencePerLevel) {
        numberOfSequenceOnCurrentLevel++;
      } else {
        numberOfSequenceOnCurrentLevel = 1;
        if (currentLevel < 10) {
          currentLevel++;
        }
      }
      let sequence = [];
      // create an array of arrow keys with length = currentLevel
      for (let j = 0; j < currentLevel; j++) {
        sequence.push(
          CONFIG.ARROW_KEYS[
            Math.floor(Math.random() * CONFIG.ARROW_KEYS.length)
          ]
        );
      }
      // put space key in the end of array
      sequence.push(CONFIG.KEYS_CODE.SPACE);
      // update solution with created sequence puzzle
      solutionSequence.splice(
        song.skipInterval + sequenceInserted,
        0,
        sequence,
        null
      );
      sequenceInserted += 2;
    }

    // define result sequence filled with
    // unassigned value (to be filled with user submission)
    const resultSequence = Array(solutionSequence.length).fill(null);
    this.setState({ solutionSequence, resultSequence });
  };

  startGame = () => {
    const { song } = this.props;

    this.startAnimation();
    // add some delay to match the song beat with our timing window
    setTimeout(() => this.youtubePlayer.playVideo(), song.delay);
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

    // show game results
    this.printResult();
  };

  updateAnimation = timestamp => {
    const {
      interval,
      solutionSequence,
      resultSequence,
      currentSequenceIndex
    } = this.state;

    // if this is the first frame, save the timestamp
    // as the time of when the song start
    // so we'll be able to know how long has the song been played
    if (!this.animationStart) {
      this.animationStart = timestamp;
    }

    // current timestamp of the song / game duration
    const timePassed = timestamp - this.animationStart;

    // update currentSequenceIndex every interval
    // to show players which solution they need to solve
    const newSequenceIndex = Math.floor(timePassed / interval);
    // go to next sequence
    if (newSequenceIndex > currentSequenceIndex) {
      // every interval passed, flush remaining pressedKeys
      this.setState({ pressedKeys: [] });

      if (
        solutionSequence[currentSequenceIndex] &&
        !resultSequence[currentSequenceIndex]
      ) {
        // sequence interval passed and player failed to submit any solution
        // marked as miss and move to next sequence
        this.setState(
          produce(draft => {
            draft.resultSequence[currentSequenceIndex] = CONFIG.HIT_TYPE.MISS;
            draft.currentSequenceIndex = newSequenceIndex;
          })
        );
      } else {
        // sequence interval passed and player did submit a solution
        // simply move to next sequence
        this.setState({ currentSequenceIndex: newSequenceIndex });
      }
    }

    // update guide (left) offset on DOM based on
    // time passed since the song started
    this.setGuideOffset(timePassed);

    // update what kind of hit does the player
    // will get if he press space right now
    // (miss, bad, cool, perfect)
    this.setCurrentHitType(timePassed, newSequenceIndex);

    // update continuously until stopped by youtube player (song ended)
    this.animationFrame = window.requestAnimationFrame(this.updateAnimation);
  };

  setGuideOffset = timePassed => {
    const { interval } = this.state;

    const guideOffset =
      ((timePassed % interval) / interval) * CONFIG.GUIDE_CONTAINER_WIDTH;
    this.setState({ guideOffset });
  };

  setCurrentHitType = (timePassed, currentSequenceIndex) => {
    const { interval, solutionSequence } = this.state;

    // timing window for space key press
    // illustration: xxxxxxxbbccppccbbxx
    // where x = miss, b = bad, c = cool, p = perfect, o = guide/cursor
    const guidePosition = timePassed % interval;

    if (!solutionSequence[currentSequenceIndex]) {
      this.setState({ currentHitType: CONFIG.HIT_TYPE.MISS });
    } else if (
      guidePosition > this.badWindow.start &&
      guidePosition < this.coolWindow.start
    ) {
      // illustration: xxxxxxxbbccppccbbxx
      //                      o
      this.setState({ currentHitType: CONFIG.HIT_TYPE.BAD });
    } else if (
      guidePosition > this.coolWindow.start &&
      guidePosition < this.perfectWindow.start
    ) {
      // illustration: xxxxxxxbbccppccbbxx
      //                        o
      this.setState({ currentHitType: CONFIG.HIT_TYPE.COOL });
    } else if (
      guidePosition > this.perfectWindow.start &&
      guidePosition < this.perfectWindow.end
    ) {
      // illustration: xxxxxxxbbccppccbbxx
      //                          o
      this.setState({ currentHitType: CONFIG.HIT_TYPE.PERFECT });
    } else if (
      guidePosition > this.perfectWindow.end &&
      guidePosition < this.coolWindow.end
    ) {
      // illustration: xxxxxxxbbccppccbbxx
      //                            o
      this.setState({ currentHitType: CONFIG.HIT_TYPE.COOL });
    } else if (
      guidePosition > this.coolWindow.end &&
      guidePosition < this.badWindow.end
    ) {
      // illustration: xxxxxxxbbccppccbbxx
      //                              o
      this.setState({ currentHitType: CONFIG.HIT_TYPE.BAD });
    } else if (
      guidePosition < this.badWindow.start ||
      guidePosition > this.badWindow.end
    ) {
      // illustration: xxxxxxxbbccppccbbxx
      //                   o
      // or
      // illustration: xxxxxxxbbccppccbbxx
      //                                o
      this.setState({ currentHitType: CONFIG.HIT_TYPE.MISS });
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
      case CONFIG.KEYS_CODE.UP:
      case CONFIG.KEYS_CODE.DOWN:
      case CONFIG.KEYS_CODE.LEFT:
      case CONFIG.KEYS_CODE.RIGHT:
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
      case CONFIG.KEYS_CODE.SPACE:
        newPressedKeys.push(CONFIG.KEYS_CODE.SPACE);
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
              draft.resultSequence[currentSequenceIndex] = CONFIG.HIT_TYPE.MISS;
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
      <div className="room">
        <Youtube
          videoId={song.youtubeId}
          containerClassName="youtube"
          opts={{
            height: "390",
            width: "640",
            playerVars: {
              autoplay: 1,
              controls: 0,
              disablekb: 1,
              showinfo: 0
            }
          }}
          onReady={this.handleYoutubeReady}
          onStateChange={this.handleYoutubeStateChange}
        />
        <div className="gameplay">
          <div
            className="guide"
            style={{
              width: `${CONFIG.GUIDE_CONTAINER_WIDTH + CONFIG.GUIDE_WIDTH}px`
            }}
          >
            <span
              style={{
                width: `${CONFIG.GUIDE_WIDTH}px`,
                height: `${CONFIG.GUIDE_WIDTH}px`,
                left: `${guideOffset}px`
              }}
            />
          </div>
          <div className="sequence">
            {solutionSequence[currentSequenceIndex] &&
              !resultSequence[currentSequenceIndex] &&
              solutionSequence[currentSequenceIndex].map((key, i) => (
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
              ))}
          </div>
        </div>
        <div className="hit-text">
          {solutionSequence[currentSequenceIndex]
            ? resultSequence[currentSequenceIndex]
            : resultSequence[currentSequenceIndex - 1]}
        </div>
        {!isSongReady && <div className="loading-screen">Loading...</div>}
      </div>
    );
  }
}

export default DanceFloor;
