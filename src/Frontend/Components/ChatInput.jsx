import React, { useState } from "react";

const ChatInput = ({ onSendMessage, isLoading, messages }) => {
    const [inputText, setInputText] = useState("");

    const handleSend = () => {
        if (!inputText.trim() || isLoading) return;
        onSendMessage(inputText);
        setInputText("");
    };
    // const handleSend = async () => {
    //   if (!inputText.trim()) return;
      
    //   try {
    //     onSendMessage(inputText);
    //     setInputText("");
    //   } catch (error) {
    //     console.error("Error getting response:", error);
    //   } 
    // };
  
    return (
      <div className="absolute bottom-[1.25rem] max-md:bottom-[0.85rem] left-1/2 -translate-x-1/2 w-[min(100%,780px)] flex gap-[0.75rem] p-[0.85rem] box-border bg-[#141416]/86 border border-blue-400/18 rounded-[1.6rem] backdrop-blur-[18px] shadow-[0_18px_42px_rgba(0,0,0,0.3)] max-md:w-[calc(100%-1rem)] max-sm:flex-col max-sm:gap-[0.65rem] max-sm:rounded-[1.2rem] transition-all duration-500 ease-in-out">
        <input
          type="text"
          id="chat-input-field"
          name="message"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyUp={(e) => e.key === "Enter" && handleSend()}
          disabled={isLoading}
          className="flex-1 min-w-0 p-[1rem_1.05rem] rounded-[1.1rem] border border-white/12 bg-white/5 text-white outline-none text-base placeholder:text-white/40 focus:border-[#3f7cff]/80 focus:shadow-[0_0_0_3px_rgba(63,124,255,0.18)] disabled:opacity-70 disabled:cursor-not-allowed"
        />
        <button 
          onClick={handleSend} 
          disabled={isLoading}
          className="min-w-[96px] p-[0.95rem_1.3rem] border-0 rounded-2xl text-white bg-gradient-to-br from-[#4c87ff] to-[#2454d8] text-base font-bold cursor-pointer transition-all duration-180 ease-in hover:-translate-y-[1px] hover:shadow-[0_10px_22px_rgba(63,124,255,0.28)] disabled:opacity-70 disabled:cursor-not-allowed max-sm:w-full"
        >
          {isLoading ? "..." : "send"}
        </button>
      </div>
    );
  };
  
  export default ChatInput;

