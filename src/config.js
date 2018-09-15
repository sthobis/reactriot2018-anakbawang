const KEYS_CODE = {
  ENTER: 13,
  ESC: 27,
  SPACE: 32,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40
};

export default {
  GUIDE_CONTAINER_WIDTH: 300,
  GUIDE_WIDTH: 20,
  HIT_TYPE: {
    MISS: "MISS",
    BAD: "BAD",
    COOL: "COOL",
    PERFECT: "PERFECT"
  },
  COLOR: {
    MISS: "grey",
    BAD: "pink",
    COOL: "lightblue",
    PERFECT: "mediumpurple"
  },
  KEYS_CODE,
  ARROW_KEYS: [KEYS_CODE.UP, KEYS_CODE.DOWN, KEYS_CODE.LEFT, KEYS_CODE.RIGHT],
  SONG_LIST: [
    {
      title: "So Eun Lee - Loving You",
      youtubeId: "F5cReku6iZg",
      bpm: 72,
      previewStartAt: 83,
      delay: 0,
      skipInterval: 8
    },
    {
      title: "Audition Days - Canon Groove",
      youtubeId: "N1frS_LWy24",
      bpm: 105,
      previewStartAt: 23,
      delay: 1410,
      skipInterval: 10
    },
    {
      title: "Audition - Euro 2005",
      youtubeId: "e00_z9cvdEQ",
      bpm: 138,
      previewStartAt: 29,
      delay: 0,
      skipInterval: 2
    }
  ]
};
