import React, { useState, useRef, useEffect } from "react";
import ChatInput from "./ChatInput";
import { processTextQuery } from "./api";

const Chatbot = ({ messages, setMessages }) => {
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Toast fallback for reminders
  function showToast(message) {
    const toast = document.createElement("div");
    toast.innerText = message;
    toast.style.position = "fixed";
    toast.style.bottom = "30px";
    toast.style.right = "30px";
    toast.style.background = "#333";
    toast.style.color = "#fff";
    toast.style.padding = "12px 24px";
    toast.style.borderRadius = "8px";
    toast.style.zIndex = 9999;
    toast.style.fontSize = "1.1em";
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 5000);
  }

  const handleSendMessage = async (messageText, languageCode = null) => {
    const userMessage = { text: messageText, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Frontend-only hardcoded replies for launch/demo mode.
    const normalizedMessage = (messageText || "").trim().toLowerCase();
    if (normalizedMessage === "hi") {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "hi I am Indian AI, Of the People, By the people, for the people !",
          sender: "bot",
          structured: false,
        },
      ]);
      setIsLoading(false);
      return;
    }

    if (normalizedMessage === "how many indian ais are available") {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "1. Indian-AI 🤓",
          sender: "bot",
          structured: false,
        },
      ]);
      setIsLoading(false);
      return;
    }
    

    
    const startTime = Date.now();
  
    try {
      const response = await processTextQuery(messageText, languageCode);
      
      let data = response.data.data || response.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch (e) {
          console.error("Failed to parse stringified data:", data);
        }
      }
      const botReply = data.response;
      const voiceMessage = data.voice_message;
      const langCode = data.language_code;
      const isStructured = typeof data.type === "string" && data.type === "structured" && typeof botReply === "object" && botReply !== null;

      if (isStructured) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: botReply, sender: "bot", structured: true },
        ]);
        return;
      }

      console.warn("Unexpected response format:", { data, botReply, voiceMessage, langCode });
      const fallbackMessage = "I couldn't format the response. Please try again.";
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: fallbackMessage, sender: "bot", structured: false },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Sorry, I'm having trouble responding.", sender: "bot" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-full flex flex-col items-center pt-[5.5rem] px-0 pb-[6.5rem] box-border max-md:pt-0 max-sm:pb-[7rem]">
      {messages.length === 0 && (
        <div className="absolute top-[42%] max-md:top-[36%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(100%,720px)] text-center pointer-events-none">
          <div className="inline-flex items-center justify-center mb-3 [perspective:900px]">
            <div className="w-[78px] h-[78px] inline-flex items-center justify-center rounded-full overflow-hidden bg-white/5 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
              <img
                src="/indianai.png"
                alt="AI Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="m-0 text-[clamp(2.1rem,4vw,3.55rem)] max-sm:text-[2rem] font-extrabold leading-[1.05] text-[#3f7cff]">Hey There! I am I₹uhh!</div>
          <div className="mt-[0.6rem] text-[clamp(1rem,1.55vw,1.3rem)] text-[#f2f4f8]/80">What's holding you back today?</div>
        </div>
      )}
    
      <div className="w-[min(100%,780px)] flex-1 flex flex-col gap-[0.85rem] overflow-y-auto overflow-x-hidden px-[0.25rem] pb-2 box-border [scrollbar-width:none] [-ms-overflow-style:none] chat-messages">
        {messages.map((msg, index) => {
          let baseClasses = "w-fit max-w-[min(78%,680px)] p-[1rem_1.1rem] rounded-[1.15rem] leading-[1.5] box-border break-words max-[1100px]:max-w-[86%] max-sm:max-w-[92%]";
          let senderClasses = msg.sender === "user" ? "self-end bg-gradient-to-br from-[#3f7cff] to-[#2454d8] shadow-[0_10px_30px_rgba(37,99,235,0.28)]" : "self-start bg-white/5 border border-white/10 backdrop-blur-[16px]";
          let structuredClasses = msg.structured ? "!w-full !max-w-full !p-[0.9rem]" : "";
          
          return (
            <div
              key={`${msg.sender}-${index}`}
              className={`${baseClasses} ${senderClasses} ${structuredClasses}`}
            >
              {msg.structured ? (
                <div className="grid grid-cols-[repeat(2,minmax(260px,1fr))] gap-[0.9rem] w-full max-[760px]:grid-cols-1">
                  {["health", "family", "dream", "society"].map((key) => {
                    const content = msg.text[key];
                    if (!content) return null;
                    const sections = { health: { title: "Health", color: "#4a90e2" }, family: { title: "Family", color: "#50c878" }, dream: { title: "Dreams", color: "#e67e22" }, society: { title: "Society", color: "#9b59b6" } };
                    const section = sections[key];
                    return (
                      <div key={key} className="min-w-0 w-full p-[0.9rem] border border-white/20 rounded-[0.95rem] bg-white/5 backdrop-blur-[10px]" style={{ borderColor: section.color }}>
                        <h3 className="m-[0_0_0.4rem] text-[0.98rem]" style={{ color: section.color }}>{section.title}</h3>
                        <p className="text-[0.9rem] leading-[1.45] m-0">{content.analysis || content.perspective || content.story || content.framework}</p>
                        {content.key_points && content.key_points.length > 0 && (
                          <ul className="m-[0.55rem_0_0] pl-4 text-[0.9rem] leading-[1.45]">
                            {content.key_points.map((point, idx) => (
                              <li key={idx}>{point}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                msg.text
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="w-fit max-w-[min(78%,680px)] p-[1rem_1.1rem] rounded-[1.15rem] leading-[1.5] box-border break-words self-start bg-white/5 border border-white/10 backdrop-blur-[16px]">
            <span className="tracking-[0.25em]">•••</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} messages={messages} />
    </div>
  );
};

export default Chatbot;
