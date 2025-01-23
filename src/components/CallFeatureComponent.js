// CallFeatureComponent.js (Frontend)
import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CallFeatureComponent = () => {
  const [recordingFile, setRecordingFile] = useState(null);
  const [textToSpeech, setTextToSpeech] = useState("");
  const [numberFile, setNumberFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Ensure only one action is active
  const resetOtherInputs = (type) => {
    if (type === "recording") {
      setTextToSpeech(""); // Clear text-to-speech input
    } else if (type === "text-to-speech") {
      setRecordingFile(null); // Clear recording file input
    }
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === "recording") {
      const validTypes = ["audio/ulaw", "audio/wav", "audio/alaw"];
      if (!validTypes.includes(file.type)) {
        alert("Please upload a valid audio file (ulaw, alaw, or WAV).");
        return;
      }
      setRecordingFile(file);
      resetOtherInputs(type);
    } else if (type === "numbers") {
      if (file.type !== "text/plain") {
        alert("Please upload a valid .txt file.");
        return;
      }
      setNumberFile(file);
    }
  };

  const handleTextToSpeech = async () => {
    if (!textToSpeech.trim()) {
      toast.error("Please enter text to convert to speech.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"
        }/recordings/text-to-speech`,
        { text: textToSpeech }
      );
      toast.success(response.data.message);
      resetOtherInputs("text-to-speech");
    } catch (error) {
      toast.error("Failed to convert text to speech.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (type) => {
    const file = type === "recording" ? recordingFile : numberFile;
    if (!file) {
      alert(`Please select a file to upload for ${type}.`);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const endpoint =
        type === "recording"
          ? `${
              process.env.NEXT_PUBLIC_API_BASE_URL ||
              "http://localhost:5000/api"
            }/recordings/upload-recording`
          : `${
              process.env.NEXT_PUBLIC_API_BASE_URL ||
              "http://localhost:5000/api"
            }/recordings/upload-numbers`;

      const response = await axios.post(endpoint, formData);
      toast.success(response.data.message);
      if (type === "recording") resetOtherInputs(type);
    } catch (error) {
      toast.error(`Failed to upload ${type} file.`);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCalls = async () => {
    if (!window.confirm("Are you sure you want to start the calls now?"))
      return;

    try {
      setLoading(true);
      const response = await axios.post(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"
        }/recordings/start-calls`
      );
      toast.success(response.data.message);
    } catch (error) {
      toast.error("Failed to start calls.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <ToastContainer />
      <h1 className="text-2xl font-bold">Call Features</h1>

      <div>
        <label className="block mb-2 font-medium">Upload Recording:</label>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => handleFileUpload(e, "recording")}
          disabled={!!textToSpeech}
        />
        <button
          onClick={() => handleUpload("recording")}
          className="ml-4 px-2 py-1 bg-blue-500 text-white rounded"
          disabled={loading}
        >
          Upload
        </button>
      </div>

      <div>
        <label className="block mb-2 font-medium">Text to Speech:</label>
        <textarea
          value={textToSpeech}
          onChange={(e) => {
            setTextToSpeech(e.target.value);
            resetOtherInputs("text-to-speech");
          }}
          // onChange={(e) => setTextToSpeech(e.target.value)}
          className="w-full border rounded p-2"
          rows={4}
          disabled={!!recordingFile}
        />
        <button
          onClick={handleTextToSpeech}
          className="mt-2 px-2 py-1 bg-green-500 text-white rounded"
          disabled={loading}
        >
          Convert
        </button>
      </div>

      <div>
        <label className="block mb-2 font-medium">Upload Numbers:</label>
        <input
          type="file"
          accept=".txt"
          onChange={(e) => handleFileUpload(e, "numbers")}
        />
        <button
          onClick={() => handleUpload("numbers")}
          className="ml-4 px-2 py-1 bg-blue-500 text-white rounded"
          disabled={loading}
        >
          Upload
        </button>
      </div>

      <div className="mt-4">
        <button
          onClick={handleStartCalls}
          className="px-4 py-2 bg-red-500 text-white rounded"
          disabled={loading}
        >
          Start Calls
        </button>
      </div>
    </div>
  );
};

export default CallFeatureComponent;
