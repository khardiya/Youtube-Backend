
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, FileVideo, ImagePlus } from "lucide-react";

import { endpoints, messageOf } from "../lib/api";

export default function Upload() {
  // Store form data
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Store selected files
  const [video, setVideo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  // Store upload status and error
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Handle video upload
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if both files are selected
    if (!video || !thumbnail) {
      setError("Both the video file and thumbnail are required by your backend.");
      return;
    }

    // Create FormData to send text and files
    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("videoFile", video);
    formData.append("thumbnail", thumbnail);

    setBusy(true);
    setError("");

    try {
      // Send data to backend
      await endpoints.upload(formData);

      // Go to Creator Studio after successful upload
      navigate("/studio");
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">

      {/* Page Heading */}
      <span className="eyebrow">
        <UploadCloud size={13} />
        CREATOR STUDIO
      </span>

      <h1 className="mt-2 text-3xl font-extrabold">
        Upload a video
      </h1>

      <p className="mt-2 text-sm text-muted">
        Share something worth watching. Add a title, description,
        video and thumbnail.
      </p>

      {/* Upload Form */}
      <form
        onSubmit={handleSubmit}
        className="panel mt-7 space-y-5 p-5 md:p-7"
      >

        {/* Video Title */}
        <label className="block">
          <span className="field-label">Video title</span>

          <input
            required
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="field"
            placeholder="Give your video a clear title"
          />
        </label>

        {/* Video Description */}
        <label className="block">
          <span className="field-label">Description</span>

          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="field resize-y"
            placeholder="What is this video about?"
          />
        </label>

        {/* Video and Thumbnail Selection */}
        <div className="grid gap-4 md:grid-cols-2">

          {/* Video File */}
          <label className="upload-drop">
            <FileVideo size={26} className="text-brand-500" />

            <b>Video file</b>

            <span className="text-xs text-muted">
              {video ? video.name : "Choose a video to upload"}
            </span>

            <input
              required
              type="file"
              accept="video/*"
              onChange={(e) => setVideo(e.target.files?.[0] || null)}
              className="mt-3 block w-full text-xs"
            />
          </label>

          {/* Thumbnail File */}
          <label className="upload-drop">
            <ImagePlus size={26} className="text-brand-500" />

            <b>Thumbnail</b>

            <span className="text-xs text-muted">
              {thumbnail ? thumbnail.name : "Choose a cover image"}
            </span>

            <input
              required
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
              className="mt-3 block w-full text-xs"
            />
          </label>

        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-brand-500">
            {error}
          </p>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={busy}
            className="btn-primary"
          >
            {busy ? "Uploading…" : "Publish video"}
            <UploadCloud size={16} />
          </button>
        </div>

      </form>
    </div>
  );
}
