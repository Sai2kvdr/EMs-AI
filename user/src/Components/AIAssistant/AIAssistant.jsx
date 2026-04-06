// File: src/Components/AIAssistant/AIAssistant.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext";
import Message from "./Message";
import "./AIAssistant.css";


const API_BASE = import.meta.env.VITE_API_URL;

export default function AIAssistant({ isOpen, onClose }) {
  useAuth();
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: `Hi! I'm your AI Assistant 🤖
• Click the paperclip (📎) icon in the chat, upload a picture of a person's face, and click send to find it.
• Ask me anything about employees, salaries, leaves, or events.
• Use /help for available commands.`
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  // const [uploading, setUploading] = useState(false);
  const [attachedImage, setAttachedImage] = useState(null);

  const endRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // ✅ Token headers
  const authHeaders = localStorage.getItem("token")
    ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
    : {};

  // ✅ Auto-scroll on new message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ✅ Auto-focus textarea when cleared
  useEffect(() => {
    if (input === "" && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [input]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedImage({ file });
      setInput("find employee by this image");
    }
  };

  if (!isOpen) return null;

  // ✅ Helpers for chat
  const append = (entry) =>
    setMessages((m) => [...m, { id: crypto.randomUUID(), ...entry }]);
  const appendUser = (text) => append({ role: "user", text });
  const appendAI = (text) => append({ role: "assistant", text });

  const safeAxios = async (fn, fallback = "⚠️ Server error") => {
    try {
      return await fn();
    } catch (err) {
      console.error(err);
      appendAI(err?.response?.data?.message || fallback);
      return null;
    }
  };



  // ✅ Command Dispatcher
  const runCommand = async (raw) => {
    const text = raw.trim().toLowerCase();
    setIsTyping(true);

    const parts = raw.trim().split(/\s+/);
    const sub = parts[1]?.toLowerCase();

    // --- /help ---
    if (text === "/help") {
      appendAI(`🧭 Available Commands:
• /employee list
• /employee get <employeeId|name>
• /employee delete <employeeId>
• /salary lastmonth
• /leave pending
• /leave all
• /event list
• Natural queries:
   - salary of <name>
   - leaves taken by <name>
   - department of <name>
• /help`);
      setIsTyping(false);
      return;
    }

    // --- Employee Commands ---
    if (text.startsWith("/employee")) {
      if (sub === "list") {
        const res = await safeAxios(() =>
          axios.get(`${API_BASE}/api/ai/fetch?collection=employees`, { headers: authHeaders })
        );
        if (res) {
          const lines = (res.data || []).map((e, i) => {
            const name = e.userId?.name || e.name || "N/A";
            const empId = e.employeeId || e._id || "—";
            const designation = e.designation || "—";
            return `${i + 1}. ${name} (ID: ${empId}) — ${designation}`;
          });
          appendAI(lines.length ? `👥 Employees:\n${lines.join("\n")}` : "No employees found.");
        }
        setIsTyping(false);
        return;
      }

     if (sub === "get" && parts[2]) {
  const query = parts[2];
  const res = await safeAxios(() =>
    axios.get(`${API_BASE}/api/ai/fetch?collection=employees&id=${query}`, { headers: authHeaders })
  );
  if (res?.data) {
    const emp = res.data;
    appendAI(`🧾 Employee Profile:
• Profile Image: ${emp.imageUrl ? `<img src="${emp.imageUrl}" alt="Employee" width="100"/>` : "N/A"}
• Name: ${emp.userId?.name || emp.name || "—"}
• Email: ${emp.userId?.email || "N/A"}
• ID: ${emp.employeeId || emp._id || "—"}
• Department: ${emp.department?.dep_name || "—"}
• Designation: ${emp.designation || "—"}
• Salary: ${emp.salary ?? "—"}`);
  } else {
    appendAI(`❌ No employee found with ID/name "${query}"`);
  }
  setIsTyping(false);
  return;
}


     if (sub === "delete" && parts[2]) {
  const id = parts[2];

  try {
    const res = await safeAxios(() =>
      axios.post(
        `${API_BASE}/api/ai/delete`,
        { id },
        { headers: authHeaders }
      )
    );

    appendAI(`🗑️ ${res.data.message}`);

  } catch (err) {
    console.error(err);
    appendAI("❌ Delete failed. Invalid ID or employee not found.");
  }

  setIsTyping(false);
  return;
}
    }

    // --- Salary Last Month ---
    if (text === "/salary lastmonth") {
      const res = await safeAxios(() =>
        axios.get(`${API_BASE}/api/ai/filter?type=lastMonthSalary`, { headers: authHeaders })
      );
      if (res?.data?.length) {
        const lines = res.data.map((s, i) => `${i + 1}. ${s.employeeId?.userId?.name || "Unknown"} — ${s.netSalary || s.amount}`);
        appendAI(`💰 Salaries last month:\n${lines.join("\n")}`);
      } else appendAI("💰 No salaries found last month.");
      setIsTyping(false);
      return;
    }

    // --- Leave Pending ---
    if (text === "/leave pending") {
      const res = await safeAxios(() =>
        axios.get(`${API_BASE}/api/ai/filter?type=pendingLeaves`, { headers: authHeaders })
      );
      if (res?.data?.length) {
        const lines = res.data.map((l, i) =>
          `${i + 1}. ${l.employeeId?.userId?.name || "Unknown"} — ${l.leaveType} (${l.fromDate} → ${l.toDate})`
        );
        appendAI(`📝 Pending Leaves:\n${lines.join("\n")}`);
      } else appendAI("📝 No pending leaves.");
      setIsTyping(false);
      return;
    }

    // --- Event List ---
    if (text === "/event list") {
      const res = await safeAxios(() =>
        axios.get(`${API_BASE}/api/ai/fetch?collection=events`, { headers: authHeaders })
      );
      if (res?.data?.length) {
        const lines = res.data.map((e, i) => `${i + 1}. ${e.title} (📅 ${new Date(e.date).toLocaleDateString()})`);
        appendAI(`📅 Events:\n${lines.join("\n")}`);
      } else appendAI("No events available.");
      setIsTyping(false);
      return;
    }

    // --- Natural Queries ---
    if (/salary of (\w+)/.test(text)) {
      const empName = text.match(/salary of (\w+)/)[1];
      const resList = await safeAxios(() =>
        axios.get(`${API_BASE}/api/ai/fetch?collection=employees`, { headers: authHeaders })
      );
      const emp = resList?.data?.find((e) => (e.userId?.name || e.name || "").toLowerCase() === empName.toLowerCase());
      appendAI(emp ? `💰 Salary of ${empName}: ${emp.salary ?? "N/A"}` : `❌ Employee "${empName}" not found.`);
      setIsTyping(false);
      return;
    }

    if (/leaves? taken by (\w+)/.test(text)) {
      const empName = text.match(/leaves? taken by (\w+)/)[1];
      const resLeaves = await safeAxios(() =>
        axios.get(`${API_BASE}/api/ai/fetch?collection=leaves`, { headers: authHeaders })
      );
      const filtered = resLeaves?.data?.filter((l) => (l.employeeId?.userId?.name || "").toLowerCase() === empName.toLowerCase());
      if (filtered?.length) {
        const lines = filtered.map((l) => `• ${l.leaveType} (${new Date(l.fromDate).toLocaleDateString()} → ${new Date(l.toDate).toLocaleDateString()})`);
        appendAI(`📝 Leaves taken by ${empName}:\n${lines.join("\n")}`);
      } else appendAI(`❌ No leaves found for ${empName}.`);
      setIsTyping(false);
      return;
    }

    if (/department of (\w+)/.test(text)) {
      const empName = text.match(/department of (\w+)/)[1];
      const resList = await safeAxios(() =>
        axios.get(`${API_BASE}/api/ai/fetch?collection=employees`, { headers: authHeaders })
      );
      const emp = resList?.data?.find((e) => (e.userId?.name || e.name || "").toLowerCase() === empName.toLowerCase());
      appendAI(emp ? `🏢 ${empName} works in "${emp.department?.dep_name || "N/A"}" department.` : `❌ Employee "${empName}" not found.`);
      setIsTyping(false);
      return;
    }

    // --- Natural Queries ---
    if (/find employee by this image/i.test(text) && attachedImage) {
      const formData = new FormData();
      formData.append("message", raw);
      formData.append("file", attachedImage.file);

      const res = await safeAxios(() =>
        axios.post(`${API_BASE}/api/ai/chat`, formData, {
          headers: {
            ...authHeaders,
            "Content-Type": "multipart/form-data",
          },
        })
      );

      if (res?.data?.reply) {
        appendAI(res.data.reply);
      } else {
        appendAI("❌ No employee matched with this image.");
      }

      setAttachedImage(null);
      setIsTyping(false);
      return;
    }

    // --- Fallback Chat ---
    const res = await safeAxios(() =>
      axios.post(`${API_BASE}/api/ai/chat`, { message: raw }, { headers: authHeaders })
    );
    if (res) appendAI(res.data?.reply || "I'm not sure yet, but I'm learning!");
    setAttachedImage(null);
    setIsTyping(false);
  };

  // ✅ Input Handlers
  const onSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");
    appendUser(trimmed);
    await runCommand(trimmed);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

 

  return (
    <div className="ai-shell">
      {/* Header */}
      <div className="ai-header">
        <div className="ai-header-content">
          <div className="ai-bot-icon">
            <i className="bi bi-robot"></i>
          </div>
          <div className="ai-title">
            <strong>AI Assistant</strong>
            <span className="ai-status">Online</span>
          </div>
        </div>
        <button className="ai-close-btn" onClick={onClose}>
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      {/* Messages */}
      <div className="ai-messages">
        {messages.map((m) => (
          <Message key={m.id} role={m.role} text={m.text} />
        ))}
        {isTyping && (
          <div className="typing-indicator">
            <span>AI Assistant is typing</span>
            <div className="typing-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Toolbar */}
      <div className="ai-toolbar">
        <label className="ai-upload-btn" title="Upload Image">
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageChange}
            ref={fileInputRef}
          />
          <i className="bi bi-paperclip"></i>
        </label>
        
        {attachedImage && (
          <div className="attached-file">
            <i className="bi bi-image"></i>
            <span>{attachedImage.file.name.substring(0, 20)}</span>
            <button onClick={() => setAttachedImage(null)} title="Remove attachment">
              <i className="bi bi-x"></i>
            </button>
          </div>
        )}
      </div>

      <div className="ai-input-container">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Ask anything, or try /employee list"
          className="ai-textarea"
        />
        <button className="ai-send-btn" onClick={onSend} disabled={!input.trim()}>
          <i className="bi bi-send"></i>
        </button>
      </div>
    </div>
  );
}