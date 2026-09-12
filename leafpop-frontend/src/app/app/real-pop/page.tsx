'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { uploadPopAudio, getLeafReport } from '@/lib/api';
import { createSyntheticPopWav, convertBlobToWav } from '@/lib/audio';
import { PopUploadResponse, LeafReportResponse } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { Score } from '@/components/ui/Score';
import { Progress } from '@/components/ui/Progress';
import { LoadingLeaf } from '@/components/ui/LoadingLeaf';
import {
  Mic,
  Square,
  Upload,
  Play,
  RotateCcw,
  Volume2,
  Zap,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  TrendingUp,
} from 'lucide-react';

type AudioFlowState = 'ready' | 'recording' | 'recorded' | 'analyzing' | 'result' | 'error';

export default function RealPopPage() {
  const searchParams = useSearchParams();
  const linkedLeafId = searchParams.get('leaf_id');
  const { token } = useAuth();

  const [flowState, setFlowState] = useState<AudioFlowState>('ready');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [popResult, setPopResult] = useState<PopUploadResponse | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTechnical, setShowTechnical] = useState(false);
  const [linkedLeaf, setLinkedLeaf] = useState<LeafReportResponse | null>(null);

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch linked leaf if available
  useEffect(() => {
    if (linkedLeafId) {
      getLeafReport(linkedLeafId)
        .then((res) => setLinkedLeaf(res))
        .catch(() => {});
    }
  }, [linkedLeafId]);

  // Handle Recording Start
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';
      const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const file = await convertBlobToWav(audioBlob);
        setSelectedFile(file);
        setAudioPreviewUrl(URL.createObjectURL(file));
        setFlowState('recorded');
      };

      mediaRecorder.start();
      setFlowState('recording');
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setErrorMessage(
        err.message?.includes('denied')
          ? 'Microphone permission denied. Please allow microphone access or upload an audio file.'
          : 'Could not access microphone on this device. Upload an audio file instead.'
      );
      setFlowState('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && flowState === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const wavFile = await convertBlobToWav(file);
      setSelectedFile(wavFile);
      setAudioPreviewUrl(URL.createObjectURL(wavFile));
      setFlowState('recorded');
      setErrorMessage(null);
    } catch (_) {
      setSelectedFile(file);
      setAudioPreviewUrl(URL.createObjectURL(file));
      setFlowState('recorded');
      setErrorMessage(null);
    }
  };

  const handleSyntheticPop = (type: 'loud' | 'medium' | 'soft') => {
    const file = createSyntheticPopWav(type);
    setSelectedFile(file);
    setAudioPreviewUrl(URL.createObjectURL(file));
    setFlowState('recorded');
    setErrorMessage(null);
  };

  const handleAnalyzeAudio = async () => {
    if (!selectedFile) return;

    setFlowState('analyzing');
    setErrorMessage(null);

    try {
      const res = await uploadPopAudio(selectedFile, linkedLeafId, token, 'recorded');
      setPopResult(res);
      setFlowState('result');
    } catch (err: any) {
      setErrorMessage(err.message || "We couldn't find a clean pop in that recording. Try again with more volume.");
      setFlowState('error');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setAudioPreviewUrl(null);
    setPopResult(null);
    setErrorMessage(null);
    setFlowState('ready');
  };

  const getScoreTagline = (score: number) => {
    if (score >= 96) return 'LEAF POP GOD. Absolutely ridiculous crack.';
    if (score >= 86) return 'CRACK! Excellent acoustic pop.';
    if (score >= 71) return 'Now THAT is a real pop.';
    if (score >= 51) return "That's a good one. Satisfying burst.";
    if (score >= 31) return 'Respectable attempt.';
    return 'That was barely a pop. Push harder next time!';
  };

  return (
    <AppShell
      category="Phase 2"
      title="Make it crack."
      description="Pop your physical leaf next to your microphone. We'll measure the acoustic transients, sharpness, and crack strength."
    >
      {/* Linked Leaf Banner (if arriving from Analyzer) */}
      {linkedLeaf && (
        <div className="mb-6 bg-primary-50/80 border border-primary-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-primary-900 font-bold">
            {(linkedLeaf.leaf?.image_url || (linkedLeaf as any).image_url) && (
              <img
                src={linkedLeaf.leaf?.image_url || (linkedLeaf as any).image_url}
                alt="Linked leaf"
                className="w-10 h-10 rounded-xl object-cover border border-primary-300/80 shadow-sm shrink-0"
              />
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <LinkIcon size={14} className="text-primary-600" />
                <span>
                  LINKED TO LEAF {(linkedLeaf.leaf?.id || linkedLeaf.id || '').slice(0, 8)}...
                </span>
              </div>
              <span className="text-forest-muted font-normal block mt-0.5">
                AI Predicted Score:{' '}
                {linkedLeaf.prediction?.pop_potential || linkedLeaf.analysis?.pop_potential || '--'}
                /100
              </span>
            </div>
          </div>
          <Pill variant="green" size="sm">
            AI vs Reality Active
          </Pill>
        </div>
      )}

      {/* State: READY / RECORDING */}
      {(flowState === 'ready' || flowState === 'recording') && (
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="text-center p-8 sm:p-12 shadow-soft">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-subtle block mb-6">
              Option A: Live Microphone
            </span>

            {flowState === 'recording' ? (
              <div className="space-y-6">
                <div className="w-28 h-28 rounded-full bg-rose-500/15 border-2 border-rose-500 flex flex-col items-center justify-center mx-auto text-rose-600 animate-pulse">
                  <span className="text-xs font-black uppercase tracking-widest">
                    POP IT!
                  </span>
                  <span className="text-xl font-mono font-bold mt-1">
                    0:0{recordingSeconds}
                  </span>
                </div>

                <p className="text-sm font-bold text-forest">
                  Microphone is listening... crack your leaf now!
                </p>

                <Button
                  size="lg"
                  variant="danger"
                  onClick={stopRecording}
                  icon={<Square size={16} className="fill-current" />}
                >
                  Stop Recording
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-28 h-28 rounded-full bg-primary-50 border-2 border-primary-300 flex items-center justify-center mx-auto text-primary-600 hover:scale-105 transition-transform">
                  <Mic size={40} />
                </div>

                <div>
                  <h3 className="text-xl font-black text-forest">Ready?</h3>
                  <p className="text-xs sm:text-sm text-forest-muted max-w-sm mx-auto mt-1">
                    Click below, position the leaf close to your microphone, and press until it snaps.
                  </p>
                </div>

                <Button
                  size="xl"
                  variant="primary"
                  onClick={startRecording}
                  icon={<Mic size={20} />}
                  className="w-full sm:w-auto"
                >
                  Start Recording Pop
                </Button>
              </div>
            )}
          </Card>

          {/* Option B & C: Upload file or Synthetic Sample */}
          {flowState === 'ready' && (
            <Card className="p-6 bg-surface-muted/60">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-forest block">
                    Option B: Upload Audio File or 1-Click Test
                  </span>
                  <span className="text-xs text-forest-muted">
                    Supports .wav, .mp3, .m4a or synthetic acoustics
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    icon={<Upload size={14} />}
                  >
                    Upload File
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSyntheticPop('loud')}
                    icon={<Zap size={14} />}
                  >
                    Synthetic Test
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* State: RECORDED / PREVIEW */}
      {flowState === 'recorded' && selectedFile && (
        <div className="max-w-md mx-auto">
          <Card className="text-center p-8 shadow-soft-lg space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mx-auto text-2xl">
              🔊
            </div>

            <div>
              <h3 className="text-xl font-black text-forest">Pop Audio Captured</h3>
              <p className="text-xs text-forest-muted mt-1 truncate">
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            </div>

            {audioPreviewUrl && (
              <div className="bg-surface-muted p-3 rounded-2xl">
                <audio controls src={audioPreviewUrl} className="w-full h-9" />
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button
                size="lg"
                variant="primary"
                onClick={handleAnalyzeAudio}
                icon={<Zap size={18} />}
                className="w-full"
              >
                Analyze Pop Sound
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleReset}
                icon={<RotateCcw size={16} />}
                className="w-full sm:w-auto"
              >
                Re-record
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* State: ANALYZING */}
      {flowState === 'analyzing' && (
        <div className="max-w-md mx-auto">
          <Card className="shadow-soft-lg">
            <LoadingLeaf
              messages={[
                'Listening to acoustic frequencies...',
                'Finding the pop transient snap...',
                'Measuring sharpness & attack rate...',
                'Calculating crack energy and score...',
              ]}
              subtext="FastAPI backend spectral Fourier acoustic analysis"
            />
          </Card>
        </div>
      )}

      {/* State: ERROR */}
      {flowState === 'error' && (
        <div className="max-w-md mx-auto text-center">
          <Card className="p-8 border border-rose-200">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-forest mb-2">No Pop Detected</h2>
            <p className="text-sm text-forest-muted mb-6">
              {errorMessage || "We couldn't detect a clean snap. Make sure to press firmly until you hear an audible click."}
            </p>
            <Button size="md" variant="primary" onClick={handleReset} icon={<RotateCcw size={16} />}>
              Try Again
            </Button>
          </Card>
        </div>
      )}

      {/* State: RESULT */}
      {flowState === 'result' && popResult && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Main Score Radial Card */}
          <Card className="bg-gradient-to-br from-white via-primary-50/40 to-lime-50/40 border-primary-200 text-center p-8 sm:p-12 shadow-soft-md">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-700 block mb-1">
              Server Verified Pop Score
            </span>
            <Score
              value={popResult.final_score || popResult.result?.final_score || popResult.score?.final_score || 0}
              size="hero"
            />

            <div className="mt-3">
              <p className="text-base sm:text-lg font-bold text-forest">
                "{popResult.message || getScoreTagline(popResult.final_score)}"
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="text-xs font-bold text-primary-800 bg-primary-100 px-3 py-1 rounded-full">
                  ✅ Pop Verified
                </span>
                <span className="text-xs font-mono text-forest-subtle">
                  ID: {popResult.pop_id?.slice(0, 8)}...
                </span>
              </div>
            </div>
          </Card>

          {/* AI vs Actual Comparison (If present) */}
          {popResult.prediction_comparison && (
            <Card className="border-primary-300 bg-primary-50/50 p-6">
              <div className="flex items-center gap-2 text-xs font-bold text-primary-800 uppercase tracking-wider mb-4">
                <TrendingUp size={16} /> AI Prediction vs. Physical Reality
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white rounded-2xl p-4 border border-border">
                  <span className="text-xs text-forest-subtle block">Predicted</span>
                  <div className="text-2xl font-black text-forest">
                    {popResult.prediction_comparison.predicted}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-border">
                  <span className="text-xs text-forest-subtle block">Actual Crack</span>
                  <div className="text-2xl font-black text-primary-700">
                    {popResult.prediction_comparison.actual}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-border">
                  <span className="text-xs text-forest-subtle block">Difference</span>
                  <div className="text-2xl font-black text-lime-accent">
                    {popResult.prediction_comparison.diff > 0
                      ? `+${popResult.prediction_comparison.diff}`
                      : popResult.prediction_comparison.diff}
                  </div>
                </div>
              </div>
              <p className="text-xs text-forest-muted text-center mt-3 font-medium">
                {popResult.prediction_comparison.diff >= 0
                  ? `AI underestimated your leaf by ${popResult.prediction_comparison.diff} points!`
                  : `Actual pop was ${Math.abs(popResult.prediction_comparison.diff)} points under prediction.`}
              </p>
            </Card>
          )}

          {/* Acoustic Breakdown Metrics */}
          <Card className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-forest-subtle">
              Score Component Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Progress
                label="Loudness"
                value={popResult.score?.loudness || popResult.result?.loudness || 0}
                displayValue={`${popResult.score?.loudness || popResult.result?.loudness || 0}/100`}
                variant="green"
              />
              <Progress
                label="Sharpness"
                value={popResult.score?.sharpness || popResult.result?.sharpness || 0}
                displayValue={`${popResult.score?.sharpness || popResult.result?.sharpness || 0}/100`}
                variant="lime"
              />
              <Progress
                label="Clarity"
                value={popResult.score?.clarity || popResult.result?.clarity || 0}
                displayValue={`${popResult.score?.clarity || popResult.result?.clarity || 0}/100`}
                variant="sky"
              />
              <Progress
                label="Impact"
                value={popResult.score?.impact || popResult.result?.impact || 0}
                displayValue={`${popResult.score?.impact || popResult.result?.impact || 0}/100`}
                variant="amber"
              />
            </div>

            {/* Collapsible Technical Details */}
            {popResult.audio_features && (
              <div className="pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowTechnical(!showTechnical)}
                  className="flex items-center justify-between w-full text-xs font-bold text-forest-muted hover:text-forest transition-colors"
                >
                  <span>Technical Acoustic Engineering Data</span>
                  {showTechnical ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showTechnical && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 text-xs bg-surface-muted/60 p-4 rounded-2xl">
                    <div>
                      <span className="text-forest-subtle block">Peak Amp:</span>
                      <strong className="font-mono text-forest">
                        {popResult.audio_features.peak_amplitude?.toFixed(3)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-forest-subtle block">Peak Freq:</span>
                      <strong className="font-mono text-forest">
                        {Math.round(popResult.audio_features.peak_frequency || 0)} Hz
                      </strong>
                    </div>
                    <div>
                      <span className="text-forest-subtle block">Attack Time:</span>
                      <strong className="font-mono text-forest">
                        {Math.round((popResult.audio_features.attack_time || 0) * 1000)} ms
                      </strong>
                    </div>
                    <div>
                      <span className="text-forest-subtle block">Pop Duration:</span>
                      <strong className="font-mono text-forest">
                        {Math.round((popResult.audio_features.pop_duration || 0) * 1000)} ms
                      </strong>
                    </div>
                    <div>
                      <span className="text-forest-subtle block">SNR Ratio:</span>
                      <strong className="font-mono text-forest">
                        {popResult.audio_features.signal_to_noise?.toFixed(1)} dB
                      </strong>
                    </div>
                    <div>
                      <span className="text-forest-subtle block">RMS Energy:</span>
                      <strong className="font-mono text-forest">
                        {popResult.audio_features.rms_energy?.toFixed(4)}
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" variant="primary" onClick={handleReset} icon={<RotateCcw size={16} />}>
              Pop Another Leaf
            </Button>
            <a href="/app/leaderboard">
              <Button size="lg" variant="outline">
                View On Leaderboard
              </Button>
            </a>
          </div>
        </div>
      )}
    </AppShell>
  );
}
