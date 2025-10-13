import { useState } from 'react';
import { featureFlags } from '@/lib/featureFlags';
import { AlertTriangle } from 'lucide-react';

export default function DegradedBanner() {
  const [hidden, setHidden] = useState(false);
  if (!featureFlags.degraded_mode || hidden) return null;

  return (
    <div className="w-full bg-amber-50 border-b border-amber-200">
      <div className="max-w-screen-2xl mx-auto px-4 py-2 flex items-center gap-2 text-amber-900 text-sm">
        <AlertTriangle className="h-4 w-4" />
        Some features are temporarily limited. Co-Pay and Points may be unavailable.
        <button
          onClick={() => setHidden(true)}
          className="ml-auto underline underline-offset-2 hover:opacity-80"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
