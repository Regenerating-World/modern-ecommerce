"use client";

import { useEffect, useRef } from "react";
import { useEventTracking } from "@/lib/client/event-tracking";

interface IntersectionObserverComponentProps {
  children: React.ReactNode;
  productData?: {
    nomeDoProduto: string;
    IDdoProduto: string;
  };
  threshold?: number;
}

export default function IntersectionObserverComponent({
  children,
  productData,
  threshold = 0.5,
}: IntersectionObserverComponentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { trackView, isSignedIn } = useEventTracking();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!isSignedIn || !ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTracked.current) {
            hasTracked.current = true;
            trackView(productData);
          }
        });
      },
      {
        threshold,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [isSignedIn, trackView, productData, threshold]);

  return <div ref={ref}>{children}</div>;
}
