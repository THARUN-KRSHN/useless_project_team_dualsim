'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { uploadLeaf, analyzeLeaf } from '@/lib/api';
import { LeafAnalysis } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { Score } from '@/components/ui/Score';
import { Progress } from '@/components/ui/Progress';
import { LoadingLeaf } from '@/components/ui/LoadingLeaf';
import {
  Upload,
  Camera,
  Leaf,
  Volume2,
  Sparkles,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

type FlowState = 'empty' | 'preview' | 'uploading' | 'analyzing' | 'complete' | 'error';

const formatDisplayValue = (value?: string | null) => {
  if (!value) return 'Unknown';
  return value.toString().replace(/_/g, ' ');
};

export default function LeafAnalyzerPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [flowState, setFlowState] = useState<FlowState>('empty');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzedLeafId, setAnalyzedLeafId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<LeafAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setFlowState('preview');
    setErrorMessage(null);
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;

    try {
      setFlowState('uploading');
      const uploadRes = await uploadLeaf(selectedFile, token);
      const leafId = uploadRes.leaf_id;
      setAnalyzedLeafId(leafId);

      setFlowState('analyzing');
      const analyzeRes = await analyzeLeaf(leafId, token);
      setAnalysis(analyzeRes.analysis);

      setFlowState('complete');
    } catch (err: any) {
      setErrorMessage(err.message || 'Analysis failed. Please try another leaf photo.');
      setFlowState('error');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setAnalyzedLeafId(null);
    setErrorMessage(null);
    setFlowState('empty');
  };

  return (
    <AppShell
      category="Phase 1"
      title="AI Leaf Analyzer"
      description="Capture or upload a leaf photo. Our neural models analyze vein density, moisture content, and crack potential."
    >
      {/* State: EMPTY / SELECTING */}
      {(flowState === 'empty' || flowState === 'preview') && (
        <div className="max-w-2xl mx-auto">
          <Card className="text-center p-8 sm:p-12 border-2 border-dashed border-primary-200/80 bg-white">
            {previewUrl ? (
              <div className="mb-6">
                <div className="relative w-48 h-48 sm:w-60 sm:h-60 mx-auto rounded-3xl overflow-hidden border border-border shadow-soft-md">
                  <img
                    src={previewUrl}
                    alt="Selected leaf"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs font-bold text-forest mt-3 truncate max-w-xs mx-auto">
                  {selectedFile?.name}
                </p>
              </div>
            ) : (
              <div className="mb-6">
                <div className="w-20 h-20 rounded-full bg-primary-50 border border-primary-200/60 flex items-center justify-center mx-auto mb-4 text-4xl">
                  🍃
                </div>
                <h2 className="text-2xl font-black text-forest tracking-tight">
                  Show us your leaf.
                </h2>
                <p className="text-forest-muted text-sm max-w-md mx-auto mt-1.5">
                  Upload a clear, focused photo and our model will calculate its acoustic crack potential.
                </p>
              </div>
            )}

            {/* Hidden native inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            />

            {/* Action Buttons */}
            {flowState === 'preview' ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  size="lg"
                  variant="primary"
                  onClick={handleUploadAndAnalyze}
                  icon={<Sparkles size={18} />}
                  className="w-full sm:w-auto"
                >
                  Analyze This Leaf
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleReset}
                  icon={<RotateCcw size={16} />}
                  className="w-full sm:w-auto"
                >
                  Choose Another
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  size="lg"
                  variant="primary"
                  onClick={() => fileInputRef.current?.click()}
                  icon={<Upload size={18} />}
                  className="w-full sm:w-auto"
                >
                  Upload Leaf Photo
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => cameraInputRef.current?.click()}
                  icon={<Camera size={18} />}
                  className="w-full sm:w-auto"
                >
                  Take Photo
                </Button>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-border/60 text-xs text-forest-subtle flex items-center justify-center gap-4">
              <span>JPG, PNG, WEBP</span>
              <span>•</span>
              <span>Max 10 MB</span>
              <span>•</span>
              <span>Privacy Verified</span>
            </div>
          </Card>
        </div>
      )}

      {/* State: UPLOADING & ANALYZING */}
      {(flowState === 'uploading' || flowState === 'analyzing') && (
        <div className="max-w-md mx-auto">
          <Card className="shadow-soft-lg">
            <LoadingLeaf
              messages={
                flowState === 'uploading'
                  ? ['Preparing your leaf...', 'Transmitting bytes to crack lab...', 'Securing image stream...']
                  : [
                      'Inspecting leaf geometry...',
                      'Reading texture & hydration...',
                      'Tracing structural vein density...',
                      'Simulating physical acoustic burst...',
                      'Finalizing pop forecast...',
                    ]
              }
              subtext="Neural leaf analysis running on FastAPI backend"
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
            <h2 className="text-xl font-bold text-forest mb-2">
              Analysis Interrupted
            </h2>
            <p className="text-sm text-forest-muted mb-6">
              {errorMessage || "Couldn't upload or evaluate that leaf. Try another photo."}
            </p>
            <Button size="md" variant="primary" onClick={handleReset} icon={<RotateCcw size={16} />}>
              Try Another Leaf
            </Button>
          </Card>
        </div>
      )}

      {/* State: COMPLETE (Leaf Pop Report) */}
      {flowState === 'complete' && analysis && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header Badge */}
          <div className="flex items-center justify-between">
            <Pill variant="green" size="md" icon={<CheckCircle2 size={14} className="text-primary-600" />}>
              LEAF POP REPORT
            </Pill>
            <span className="text-xs font-mono text-forest-subtle">
              ID: {analyzedLeafId?.slice(0, 8)}...
            </span>
          </div>

          {/* Main Hero Score Card */}
          <Card className="bg-gradient-to-br from-white via-primary-50/30 to-lime-50/30 border-primary-200 text-center p-8 sm:p-10 shadow-soft-md">
            <Score
              value={analysis.pop_potential}
              label="Predicted Pop Potential"
              size="hero"
            />
            <p className="text-sm font-semibold text-primary-700 mt-2">
              Confidence: {Math.round(analysis.confidence * 100)}%
            </p>
          </Card>

          {/* Biomechanical Feature Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-border rounded-3xl p-5 shadow-soft">
              <span className="text-xs font-bold text-forest-subtle block mb-1">Leaf Type</span>
              <span className="text-base sm:text-lg font-bold text-forest capitalize">
                {formatDisplayValue(analysis.leaf_type)}
              </span>
            </div>

            <div className="bg-white border border-border rounded-3xl p-5 shadow-soft">
              <span className="text-xs font-bold text-forest-subtle block mb-1">Condition</span>
              <span className="text-base sm:text-lg font-bold text-forest capitalize">
                {formatDisplayValue(analysis.health_condition)}
              </span>
            </div>

            <div className="bg-white border border-border rounded-3xl p-5 shadow-soft">
              <span className="text-xs font-bold text-forest-subtle block mb-1">Difficulty</span>
              <span className="text-base sm:text-lg font-bold text-forest capitalize">
                {formatDisplayValue(analysis.difficulty)}
              </span>
            </div>

            <div className="bg-white border border-border rounded-3xl p-5 shadow-soft">
              <span className="text-xs font-bold text-forest-subtle block mb-1">Duration</span>
              <span className="text-base sm:text-lg font-bold text-forest font-mono">
                {Math.round(analysis.predicted_duration * 1000)} ms
              </span>
            </div>
          </div>

          {/* Physics & Acoustics Progress Card */}
          <Card className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-forest-subtle">
              Acoustic Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Progress
                label="Predicted Loudness"
                value={analysis.predicted_loudness}
                displayValue={`${analysis.predicted_loudness}/100`}
                variant="green"
              />
              <Progress
                label="Predicted Sharpness"
                value={analysis.predicted_sharpness}
                displayValue={`${analysis.predicted_sharpness}/100`}
                variant="lime"
              />
              <Progress
                label="Vein Density"
                value={analysis.vein_density}
                displayValue={`${analysis.vein_density}%`}
                variant="sky"
              />
              <Progress
                label="Dryness Score"
                value={analysis.dryness_score}
                displayValue={`${analysis.dryness_score}%`}
                variant="amber"
              />
            </div>
          </Card>

          {/* Recommendation Banner */}
          <div className="bg-primary-50/80 border border-primary-200/80 rounded-3xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-primary-600 text-white flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary-800 block">
                Recommended Popping Technique
              </span>
              <p className="text-sm font-semibold text-forest mt-0.5">
                {analysis.recommendation}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleReset}
              icon={<RotateCcw size={16} />}
              className="w-full sm:w-auto"
            >
              Analyze Another Leaf
            </Button>

            <Link
              href={`/app/real-pop?leaf_id=${analyzedLeafId}`}
              className="w-full sm:w-auto"
            >
              <Button
                variant="primary"
                size="lg"
                icon={<Volume2 size={18} />}
                className="w-full"
              >
                Pop This Leaf Now
              </Button>
            </Link>
          </div>
        </div>
      )}
    </AppShell>
  );
}
