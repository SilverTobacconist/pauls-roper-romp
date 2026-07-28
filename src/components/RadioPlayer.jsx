import {
  ChevronDown,
  ChevronUp,
  Music2,
  Radio,
  Volume2,
  VolumeX,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

const TRACKS = [
  {
    title: 'Apartment 201 After Dark',
    src: '/audio/apartment-201-after-dark.mp3',
  },
  {
    title: 'Pacific Breeze on the Balcony',
    src: '/audio/pacific-breeze-on-the-balcony.mp3',
  },
  {
    title: 'Helen’s House Special',
    src: '/audio/helens-house-special.mp3',
  },
  {
    title: 'The Landlord Is Coming Upstairs',
    src: '/audio/landlord-coming-upstairs.mp3',
  },
  {
    title: 'Last Call at 201',
    src: '/audio/last-call-at-201.mp3',
  },
]

const MUSIC_ENABLED_KEY = 'apartment_201_music_enabled'
const DEFAULT_VOLUME = 0.18
const FADE_STEP = 0.02
const FADE_INTERVAL = 35

function getRandomItem(items) {
  const randomIndex = Math.floor(Math.random() * items.length)

  return items[randomIndex]
}

function createNewTrackPool(excludedTrackIndex = null) {
  return TRACKS.map((_, index) => index).filter(
    (index) => index !== excludedTrackIndex,
  )
}

function createInitialTrackSelection() {
  const initialPool = createNewTrackPool()
  const selectedTrackIndex = getRandomItem(initialPool)

  return {
    selectedTrackIndex,
    remainingTrackIndexes: initialPool.filter(
      (index) => index !== selectedTrackIndex,
    ),
  }
}

function getSavedMusicPreference() {
  if (typeof window === 'undefined') {
    return false
  }

  return (
    window.localStorage.getItem(MUSIC_ENABLED_KEY) === 'true'
  )
}

function RadioPlayer() {
  const [initialTrackSelection] = useState(
    createInitialTrackSelection,
  )

  const [currentTrackIndex, setCurrentTrackIndex] = useState(
    initialTrackSelection.selectedTrackIndex,
  )

  const [isPlaying, setIsPlaying] = useState(
    getSavedMusicPreference,
  )

  const [hasStarted, setHasStarted] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const audioRef = useRef(null)
  const fadeTimerRef = useRef(null)

  const remainingTrackIndexesRef = useRef(
    initialTrackSelection.remainingTrackIndexes,
  )

  const lastTrackIndexRef = useRef(
    initialTrackSelection.selectedTrackIndex,
  )

  const currentTrack = TRACKS[currentTrackIndex]

  const fadeAudio = useCallback(
    (targetVolume, onComplete) => {
      const audio = audioRef.current

      if (!audio) {
        return
      }

      window.clearInterval(fadeTimerRef.current)

      fadeTimerRef.current = window.setInterval(() => {
        const difference = targetVolume - audio.volume

        if (Math.abs(difference) <= FADE_STEP) {
          audio.volume = targetVolume
          window.clearInterval(fadeTimerRef.current)

          if (onComplete) {
            onComplete()
          }

          return
        }

        const nextVolume =
          audio.volume +
          (difference > 0 ? FADE_STEP : -FADE_STEP)

        audio.volume = Math.min(
          1,
          Math.max(0, nextVolume),
        )
      }, FADE_INTERVAL)
    },
    [],
  )

  useEffect(() => {
    return () => {
      window.clearInterval(fadeTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current

    if (!audio) {
      return undefined
    }

    if (isPlaying) {
      audio.volume = 0

      audio
        .play()
        .then(() => {
          setHasStarted(true)
          fadeAudio(DEFAULT_VOLUME)
        })
        .catch(() => {
          setIsPlaying(false)

          window.localStorage.setItem(
            MUSIC_ENABLED_KEY,
            'false',
          )
        })

      return undefined
    }

    window.clearInterval(fadeTimerRef.current)

audio.pause()
audio.volume = 0

return undefined
  }, [currentTrackIndex, fadeAudio, isPlaying])

  function turnMusicOn() {
    setIsPlaying(true)

    window.localStorage.setItem(
      MUSIC_ENABLED_KEY,
      'true',
    )
  }

  function turnMusicOff() {
    setIsPlaying(false)

    window.localStorage.setItem(
      MUSIC_ENABLED_KEY,
      'false',
    )
  }

  function toggleMusic() {
    if (isPlaying) {
      turnMusicOff()
      return
    }

    turnMusicOn()
  }

  function selectNextTrack() {
    let remainingTrackIndexes =
      remainingTrackIndexesRef.current

    if (remainingTrackIndexes.length === 0) {
      remainingTrackIndexes = createNewTrackPool(
        lastTrackIndexRef.current,
      )
    }

    const selectedTrackIndex = getRandomItem(
      remainingTrackIndexes,
    )

    remainingTrackIndexesRef.current =
      remainingTrackIndexes.filter(
        (index) => index !== selectedTrackIndex,
      )

    lastTrackIndexRef.current = selectedTrackIndex
    setCurrentTrackIndex(selectedTrackIndex)
  }

  function handleTrackEnded() {
    if (!isPlaying) {
      return
    }

    selectNextTrack()
  }

  return (
    <aside
      className={`radio-player ${
        isPlaying ? 'radio-player--playing' : ''
      } ${
        isExpanded ? 'radio-player--expanded' : ''
      }`}
      aria-label="Apartment 201 radio"
    >
      <audio
        ref={audioRef}
        src={currentTrack.src}
        onEnded={handleTrackEnded}
        preload="metadata"
      />

      {!isExpanded && (
        <div className="radio-player__compact">
          <button
            className="radio-player__compact-toggle"
            type="button"
            aria-pressed={isPlaying}
            onClick={toggleMusic}
          >
            {isPlaying ? (
              <Volume2 aria-hidden="true" size={20} />
            ) : (
              <VolumeX aria-hidden="true" size={20} />
            )}

            <span>
              {isPlaying ? 'Music On' : 'Music Off'}
            </span>
          </button>

          <button
            className="radio-player__expand"
            type="button"
            aria-label="Show radio details"
            onClick={() => setIsExpanded(true)}
          >
            <ChevronUp aria-hidden="true" size={18} />
          </button>
        </div>
      )}

      {isExpanded && (
        <div className="radio-player__expanded-content">
          <div className="radio-player__top-row">
            <div
              className="radio-player__speaker"
              aria-hidden="true"
            >
              <div className="radio-player__speaker-grille" />
            </div>

            <div className="radio-player__display">
              <div className="radio-player__station">
                <Radio aria-hidden="true" size={15} />

                <span>
                  {isPlaying
                    ? 'Apartment 201 FM'
                    : 'Radio Off'}
                </span>
              </div>

              <p>{currentTrack.title}</p>

              <div
                className="radio-player__signal"
                aria-hidden="true"
              >
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>

          <button
            className="radio-player__toggle"
            type="button"
            aria-pressed={isPlaying}
            aria-label={
              isPlaying
                ? 'Turn Apartment 201 music off'
                : 'Turn Apartment 201 music on'
            }
            onClick={toggleMusic}
          >
            {isPlaying ? (
              <Volume2 aria-hidden="true" size={21} />
            ) : (
              <VolumeX aria-hidden="true" size={21} />
            )}

            <span>
              {isPlaying
                ? 'Turn Music Off'
                : 'Turn Music On'}
            </span>
          </button>

          <div className="radio-player__footer">
            <div
              className="radio-player__badge"
              aria-hidden="true"
            >
              <Music2 size={14} />

              <span>
                {hasStarted ? 'Now Playing' : 'Ready'}
              </span>
            </div>

            <button
              className="radio-player__collapse"
              type="button"
              aria-label="Hide radio details"
              onClick={() => setIsExpanded(false)}
            >
              <ChevronDown aria-hidden="true" size={18} />
              Hide
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}

export default RadioPlayer