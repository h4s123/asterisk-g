// CallFeatureComponent.js (Frontend)
import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import style from './Newuse.module.css';

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
      console.log("Sending text to backend for TTS conversion...");
  
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"}/recordings/text-to-speech`,
        { text: textToSpeech }
      );
  
      console.log("TTS conversion successful:", response.data);
  
      toast.success(response.data.message);
      resetOtherInputs("text-to-speech");
    } catch (error) {
      console.error("Error in TTS conversion:", error);
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
          // accept="audio/*"
          accept=".ulaw,.alaw,.wav"
          onChange={(e) => handleFileUpload(e, "recording")}
          disabled={!!textToSpeech}
        />
        <button
          onClick={() => handleUpload("recording")}
          className={style.button}
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
          className={style.button}
          disabled={loading}
        >
          Convert Text to Speech
        </button>
      </div>

      <div>
        <label className="block mb-2 font-medium">Upload Numbers:</label>
        <input
          type="file"
          accept=".txt"
          onChange={(e) => handleFileUpload(e, "numbers")}
        />
         <span className={style.change}>
        <button
          onClick={() => handleUpload("numbers")}
          className={style.button}
          disabled={loading}
        >
          Upload numbers
        </button>
        </span>
      </div>

      <span className={style.change}>

      {/* <div className="mt-4"> */}
        <button
          onClick={handleStartCalls}
          className="px-4 py-2 bg-red-500 text-white rounded"
          disabled={loading}
        >
          Start Calls
        </button>
        </span>
      {/* </div> */}
    </div>
  );
};

export default CallFeatureComponent;
