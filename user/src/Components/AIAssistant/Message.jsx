// File: src/Components/AIAssistant/Message.jsx
import React, { useEffect, useState } from "react";

export default function Message({ role, text }) {
  const isUser = role === "user";
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animation for message appearance
    setIsVisible(true);
  }, []);

  // Detect lines with image URLs
  const renderText = () =>
    text.split("\n").map((line, i) => {
      const imgMatch = line.match(/https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)/i);
      if (imgMatch) {
        return (
          <div key={i} className="message-line">
            <img src={imgMatch[0]} alt="attachment" className="message-image" />
          </div>
        );
      }
      return <div key={i} className="message-line">{line}</div>;
    });

  return (
    <div className={`message ${isUser ? "user" : "assistant"} ${isVisible ? "visible" : ""}`}>
      <style>{`
      /* Message Component Styles */
.message {
  display: flex;
  margin-bottom: 16px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.message.visible {
  opacity: 1;
  transform: translateY(0);
}

.message-content {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  max-width: 85%;
}

.message.user .message-content {
  margin-left: auto;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
  background: #e9ecef;
  color: #6c757d;
}

.message-avatar.user {
  background: #0d6efd;
  color: white;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
  max-width: 100%;
}

.message.assistant .message-bubble {
  background: white;
  color: #212529;
  border-bottom-left-radius: 6px;
}

.message.user .message-bubble {
  background: #0d6efd;
  color: white;
  border-bottom-right-radius: 6px;
}

.message-line {
  margin-bottom: 4px;
}

.message-line:last-child {
  margin-bottom: 0;
}

.message-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 12px;
  margin-top: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

/* Animation for message appearance */
.message.visible:nth-child(1) { transition-delay: 0.1s; }
.message.visible:nth-child(2) { transition-delay: 0.15s; }
.message.visible:nth-child(3) { transition-delay: 0.2s; }
.message.visible:nth-child(4) { transition-delay: 0.25s; }
.message.visible:nth-child(5) { transition-delay: 0.3s; }
.message.visible:nth-child(n+6) { transition-delay: 0.35s; }

/* Responsive adjustments */
@media (max-width: 480px) {
  .message-content {
    max-width: 90%;
  }
  
  .message-bubble {
    padding: 10px 14px;
    font-size: 14px;
  }
  
  .message-image {
    max-width: 160px;
    max-height: 160px;
  }
  
  .message-avatar {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}`}</style>
      <div className="message-content">
        {!isUser && (
          <div className="message-avatar">
            <i className="bi bi-robot"></i>
          </div>
        )}
        <div className="message-bubble">
          {renderText()}
        </div>
        {isUser && (
          <div className="message-avatar user">
            <i className="bi bi-person"></i>
          </div>
        )}
      </div>
    </div>
  );
}