"use client";

import { useEffect, useState } from "react";
import { useEventTracking } from "@/lib/client/event-tracking";

export default function BatchStatsComponent() {
  const { getStats } = useEventTracking();
  const [stats, setStats] = useState({
    batchable: 0,
    nonBatchable: 0,
    isProcessing: false,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, [getStats]);

  if (
    stats.batchable === 0 &&
    stats.nonBatchable === 0 &&
    !stats.isProcessing
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">
        📊 Batch Manager Stats
      </h3>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Batchable:</span>
          <span
            className={`font-mono ${
              stats.batchable > 0 ? "text-blue-600" : "text-gray-400"
            }`}
          >
            {stats.batchable}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Non-batchable:</span>
          <span
            className={`font-mono ${
              stats.nonBatchable > 0 ? "text-orange-600" : "text-gray-400"
            }`}
          >
            {stats.nonBatchable}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Processing:</span>
          <span
            className={`font-mono ${
              stats.isProcessing ? "text-green-600" : "text-gray-400"
            }`}
          >
            {stats.isProcessing ? "Yes" : "No"}
          </span>
        </div>
      </div>
    </div>
  );
}
