import React, { useState } from "react";
import axios from "axios";
import { toast , ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CallFeatureComponent = () => {
  const [recordingFile, setRecordingFile] = useState(null);
  const [textToSpeech, setTextToSpeech] = useState("");
  const [numberFile, setNumberFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === "recording") {
      const validTypes = ["audio/mpeg", "audio/wav"]; // Add allowed MIME types
      if (!validTypes.includes(file.type)) {
        alert("Please upload a valid audio file (MP3 or WAV).");
        return;
      }
      setRecordingFile(file);
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"}/recordings/text-to-speech`,
        { text: textToSpeech }
      );
      toast.success(response.data.message || "Text converted to speech successfully.");
    } catch (error) {
      console.error("Error during text-to-speech conversion:", error);
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

      const response = await axios.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(response.data.message || `${type} file uploaded successfully.`);
    } catch (error) {
      console.error(`Error uploading ${type} file:`, error);
      alert(`Failed to upload ${type} file.`);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCalls = async () => {
    if (!window.confirm("Are you sure you want to start the calls now?")) {
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"}/recordings/start-calls`
      );
      alert(response.data.message || "Calls started successfully.");
    } catch (error) {
      console.error("Error starting calls:", error);
      const errorMessage = error.response?.data?.message || "Failed to start calls.";
      alert(errorMessage);
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
        />
        <button
          onClick={() => handleUpload("recording")}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload Recording"}
        </button>
      </div>

      <div>
        <label className="block mb-2 font-medium">Text to Speech:</label>
        <textarea
          className="w-full p-2 border rounded"
          rows="4"
          value={textToSpeech}
          onChange={(e) => setTextToSpeech(e.target.value)}
        ></textarea>
        <button
          onClick={handleTextToSpeech}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={loading}
        >
          Convert to Speech
        </button>
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Upload List of Numbers:
        </label>
        <input
          type="file"
          accept=".txt"
          onChange={(e) => handleFileUpload(e, "numbers")}
        />
        <button
          onClick={() => handleUpload("numbers")}
          className="ml-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          disabled={loading}
        >
          Upload Numbers
        </button>
      </div>

      <button
        onClick={handleStartCalls}
        className="mt-6 px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600"
        disabled={loading}
      >
        Start Calls Now
      </button>

      {loading && <p className="text-gray-600">Processing...</p>}
    </div>
  );
};

export default CallFeatureComponent;
