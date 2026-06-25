"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@once-ui-system/core";

interface RotatingBadgeProps {
  titleString: string;
  href: string;
}

export default function RotatingBadge({ titleString, href }: RotatingBadgeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  // Split messages by semicolon (;)
  const messages = titleString
    ? titleString.split(";").map((m) => m.trim()).filter((m) => m.length > 0)
    : [];

  useEffect(() => {
    if (messages.length <= 1) return;

    const interval = setInterval(() => {
      // Start fade out
      setVisible(false);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
        // Start fade in
        setVisible(true);
      }, 500); // Wait for fade out to complete (500ms)
      
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [messages.length]);

  if (messages.length === 0) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shinePulse {
          0% {
            box-shadow: 0 0 6px rgba(79, 70, 229, 0.1), inset 0 0 1px rgba(255, 255, 255, 0.2);
            border-color: rgba(79, 70, 229, 0.15);
            background: rgba(243, 244, 246, 0.55);
          }
          50% {
            box-shadow: 0 0 16px rgba(79, 70, 229, 0.25), inset 0 0 6px rgba(255, 255, 255, 0.85);
            border-color: rgba(79, 70, 229, 0.4);
            background: rgba(243, 244, 246, 0.7);
          }
          100% {
            box-shadow: 0 0 6px rgba(79, 70, 229, 0.1), inset 0 0 1px rgba(255, 255, 255, 0.2);
            border-color: rgba(79, 70, 229, 0.15);
            background: rgba(243, 244, 246, 0.55);
          }
        }
        .shining-badge {
          animation: shinePulse 3.5s infinite ease-in-out;
          backdrop-filter: blur(8px);
          transition: all 0.3s ease;
        }
        .shining-badge:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 20px rgba(79, 70, 229, 0.35) !important;
          border-color: rgba(79, 70, 229, 0.5) !important;
        }
      `}} />
      <Badge
        className="shining-badge"
        background="brand-alpha-weak"
        icon="sparkles"
        href={href}
        style={{
          border: "1px solid rgba(79, 70, 229, 0.15)",
          padding: "6px 12px"
        }}
      >
        <span 
          style={{ 
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(-4px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
            display: "inline-block"
          }}
        >
          {messages[currentIndex]}
        </span>
      </Badge>
    </>
  );
}
