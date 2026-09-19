"use client";

import { useEffect, useRef } from "react";

type UseFloreaVideoOptions = {
  paused: boolean;
  showVideo: boolean;
};

export function useFloreaVideo({ paused, showVideo }: UseFloreaVideoOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const boundVideoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!showVideo) return;

    const onEnded = () => {
      const video = boundVideoRef.current;
      if (!video || paused || document.hidden) return;
      video.currentTime = 0;
      video.play().catch(() => {});
    };

    const onError = () => {
      const video = boundVideoRef.current;
      if (video) video.style.opacity = "0";
    };

    const bindVideo = (video: HTMLVideoElement) => {
      if (boundVideoRef.current === video) return;
      if (boundVideoRef.current) {
        boundVideoRef.current.removeEventListener("ended", onEnded);
        boundVideoRef.current.removeEventListener("error", onError);
      }
      boundVideoRef.current = video;
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.loop = false;
      video.addEventListener("ended", onEnded);
      video.addEventListener("error", onError);
      if (!paused) video.play().catch(() => {});
    };

    const tick = () => {
      const video = videoRef.current;
      if (video) {
        bindVideo(video);
        if (!video.muted) video.muted = true;

        const duration = video.duration;
        const time = video.currentTime;
        if (duration && Number.isFinite(duration)) {
          const opacity = Math.min(1, time / 0.5, Math.max(0, (duration - time) / 0.5));
          video.style.opacity = String(Math.max(0, opacity));
          if (time >= duration - 0.06) {
            video.currentTime = 0;
            if (!paused && !document.hidden && video.paused) {
              video.play().catch(() => {});
            }
          }
        }

        if (video.paused && !paused && !document.hidden && video.readyState >= 2 && !video.ended) {
          video.play().catch(() => {});
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const onVisibilityChange = () => {
      const video = videoRef.current;
      if (!video) return;
      if (document.hidden) {
        video.pause();
      } else if (!paused) {
        video.play().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      cancelAnimationFrame(rafRef.current);
      const video = boundVideoRef.current;
      if (video) {
        video.removeEventListener("ended", onEnded);
        video.removeEventListener("error", onError);
      }
      boundVideoRef.current = null;
    };
  }, [paused, showVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !showVideo) return;
    if (paused) {
      video.pause();
    } else if (!document.hidden) {
      video.play().catch(() => {});
    }
  }, [paused, showVideo]);

  return videoRef;
}
