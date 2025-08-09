import React from "react";

export function SignMessageTab() {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl p-6 mt-6 text-white">
      <h2 className="text-xl font-bold mb-4">Sign a Message</h2>
      <p className="mb-4">You can sign a message with your wallet's private key.</p>
      <textarea
        className="w-full h-32 border border-gray-300 rounded-md p-2 text-black placeholder-gray-500"
        placeholder="Enter your message here..."
      />
      <button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-all">
        Sign Message
      </button>
    </div>
  );
}

export default SignMessageTab;
