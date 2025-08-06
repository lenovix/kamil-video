import { useRef, useState, useEffect } from "react";

interface Props {
  src: string;
  poster?: string;
}

export default function CustomVideoPlayer({ src, poster }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleFullscreen = () => {
    const videoContainer = videoRef.current?.parentElement;
    if (!videoContainer) return;

    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const setMeta = () => setDuration(video.duration);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", setMeta);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", setMeta);
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          video.currentTime += 5;
          break;
        case "ArrowLeft":
          video.currentTime -= 5;
          break;
        case "ArrowUp":
          setVolume((v) => {
            const newVol = Math.min(v + 0.1, 1);
            video.volume = newVol;
            return newVol;
          });
          break;
        case "ArrowDown":
          setVolume((v) => {
            const newVol = Math.max(v - 0.1, 0);
            video.volume = newVol;
            return newVol;
          });
          break;
        case "f":
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="relative rounded overflow-hidden shadow max-h-[500px] bg-black group">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full"
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Custom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white px-4 py-3 flex flex-col gap-2 text-sm transition-opacity duration-300 group-hover:opacity-100 opacity-0">
        {/* Progress Bar */}
        <input
          type="range"
          min={0}
          max={duration}
          step="0.1"
          value={currentTime}
          onChange={handleProgressChange}
          className="w-full accent-blue-500"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="hover:scale-110 transition-transform"
            >
              {isPlaying ? "⏸" : "▶️"}
            </button>

            <div className="flex items-center gap-2">
              <label htmlFor="volume" className="text-xs">
                🔊
              </label>
              <input
                id="volume"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 accent-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <button
              onClick={toggleFullscreen}
              className="hover:scale-110 transition-transform"
            >
              {isFullscreen ? "🗕" : "⛶"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
