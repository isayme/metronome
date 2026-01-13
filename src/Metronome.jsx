import { useCallback, useEffect, useRef, useState } from 'react';

const Metronome = () => {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [selectedSound, setSelectedSound] = useState('click');
  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);

  const sounds = {
    click: { name: 'Click', frequency: 1000 },
    wood: { name: 'Wood', frequency: 800 },
    low: { name: 'Low', frequency: 600 },
    beep: { name: 'Beep', frequency: 1200 }
  };

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [togglePlay]);

  const playSound = () => {
    if (!audioContextRef.current) return;
    
    const sound = sounds[selectedSound];
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    // isAccent: 第一拍声音频率x1.5
    // oscillator.frequency.value = isAccent ? sound.frequency * 1.5 : sound.frequency;
    oscillator.frequency.value = sound.frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.1);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + 0.1);
  };

  useEffect(() => {
    if (isPlaying) {
      const interval = 60000 / bpm;
      let beat = 0;
      
      intervalRef.current = setInterval(() => {
        playSound();
        setCurrentBeat(beat);
        beat = (beat + 1) % 4;
      }, interval);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setCurrentBeat(0);
    }
  }, [isPlaying, bpm, selectedSound]);



  const handleBpmChange = (e) => {
    const newBpm = parseInt(e.target.value);
    setBpm(newBpm);
  };

  const handleSoundChange = (sound) => {
    setSelectedSound(sound);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Metronome</h1>
        
        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-purple-600 mb-2">{bpm}</div>
          <div className="text-gray-500">BPM</div>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {[0, 1, 2, 3].map((beat) => (
              <div
                key={beat}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  currentBeat === beat && isPlaying
                    ? 'bg-purple-600 scale-125'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            BPM
          </label>
          <input
            type="range"
            min="40"
            max="200"
            value={bpm}
            onChange={handleBpmChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>40</span>
            <span>200</span>
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sound
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(sounds).map(([key, sound]) => (
              <button
                key={key}
                onClick={() => handleSoundChange(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedSound === key
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {sound.name}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={togglePlay}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            isPlaying
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {isPlaying ? 'Stop' : 'Start'}
        </button>
      </div>
    </div>
  );
};

export default Metronome;