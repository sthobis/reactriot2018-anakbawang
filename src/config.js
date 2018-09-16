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
  HIT_MESSAGE: {
    MISS: [
      "okay.. you MISS",
      "MISS.. but keep trying!",
      "MISS, what a surprise"
    ],
    BAD: [
      "are you okay with being BAD?",
      "BAD, but it's okay..",
      "everyone has their BAD time"
    ],
    COOL: [
      "don't fool with the COOL",
      "you're too COOL for this game",
      "keep calm and stay COOL"
    ],
    PERFECT: [
      "that's a perfect 10 for you!",
      "how does it feel to be PERFECT?",
      "nobody's PERFECT, except you."
    ]
  },
  COLOR: {
    MISS: "grey",
    BAD: "pink",
    COOL: "lightblue",
    PERFECT: "mediumpurple"
  },
  KEYS_CODE,
  ARROW_KEYS: [KEYS_CODE.UP, KEYS_CODE.DOWN, KEYS_CODE.LEFT, KEYS_CODE.RIGHT],
  SFX:
    "https://freesound.org/people/kasa90/sounds/143487/download/143487__kasa90__kick2.wav",
  SONG_LIST: [
    {
      title: "Audition - U Know",
      youtubeId: "fvjY8-miFUc",
      bpm: 90,
      previewStartAt: 5,
      delay: 1000,
      skipInterval: 2
    },
    {
      title: "Audition - Beat City",
      youtubeId: "qv-aRs889T8",
      bpm: 120,
      previewStartAt: 36,
      delay: 1100,
      skipInterval: 2
    },
    {
      title: "Audition - Euro 2005",
      youtubeId: "e00_z9cvdEQ",
      bpm: 138,
      previewStartAt: 29,
      delay: 1600,
      skipInterval: 2
    },
    {
      title: "Audition - Can Can",
      youtubeId: "a0pKzHtb_Gc",
      bpm: 150,
      previewStartAt: 75,
      delay: 1100,
      skipInterval: 2
    },
    {
      title: "Audition - Love Mode",
      youtubeId: "38GoUyhx8zc",
      bpm: 190,
      previewStartAt: 45,
      delay: 1100,
      skipInterval: 2
    }
  ]
};
