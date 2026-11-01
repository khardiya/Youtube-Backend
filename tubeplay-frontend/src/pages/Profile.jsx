
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { endpoints, messageOf, payload } from "../lib/api";

export default function Profile() {
    const { user, setUser } = useAuth();

    const [fullName, setFullName] = useState(user?.fullName || "");
    const [email, setEmail] = useState(user?.email || "");

    const [avatar, setAvatar] = useState(null);
    const [coverImage, setCoverImage] = useState(null);

    const [avatarPreview, setAvatarPreview] = useState(
        user?.avatar || ""
    );

    const [coverPreview, setCoverPreview] = useState(
        user?.coverImage || ""
    );

    const [busy, setBusy] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Keep account fields synchronized with user context
    useEffect(() => {
        setFullName(user?.fullName || "");
        setEmail(user?.email || "");
        setAvatarPreview(user?.avatar || "");
        setCoverPreview(user?.coverImage || "");
    }, [user?.fullName, user?.email, user?.avatar, user?.coverImage]);

    // Avatar preview
    useEffect(() => {
        if (!avatar) return;

        const url = URL.createObjectURL(avatar);
        setAvatarPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [avatar]);

    // Cover preview
    useEffect(() => {
        if (!coverImage) return;

        const url = URL.createObjectURL(coverImage);
        setCoverPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [coverImage]);

    // Select image
    const handleImageChange = (file, setter) => {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5 MB.");
            return;
        }

        setError("");
        setSuccess("");
        setter(file);
    };

    // Update account details
    const save = async (e) => {
        e.preventDefault();

        setBusy(true);
        setError("");
        setSuccess("");

        try {
            const response = await endpoints.updateAccount({
                fullName,
                email,
            });

            const data = payload(response);
            const updatedUser = data?.user || data;

            setUser((previous) => ({
                ...previous,
                ...updatedUser,
                fullName,
                email,
            }));

            setSuccess("Account details updated.");
        } catch (err) {
            setError(messageOf(err));
        } finally {
            setBusy(false);
        }
    };

    // Upload avatar or cover image
    const uploadImage = async (type) => {
        const isAvatar = type === "avatar";
        const file = isAvatar ? avatar : coverImage;

        if (!file) {
            setError(
                `Please select a ${isAvatar ? "avatar" : "cover image"} first.`
            );
            return;
        }

        const setUploading = isAvatar
            ? setUploadingAvatar
            : setUploadingCover;

        setUploading(true);
        setError("");
        setSuccess("");

        try {
            const formData = new FormData();

            if (isAvatar) {
                formData.append("avatar", file);
            } else {
                formData.append("coverImage", file);
            }

            const response = isAvatar
                ? await endpoints.updateAvatar(formData)
                : await endpoints.updateCover(formData);

            const data = payload(response);
            const updatedUser = data?.user || data;

            setUser((previous) => ({
                ...previous,
                ...updatedUser,
            }));

            if (isAvatar) {
                setAvatar(null);
                setAvatarPreview(updatedUser?.avatar || avatarPreview);
                setSuccess("Avatar updated successfully.");
            } else {
                setCoverImage(null);
                setCoverPreview(
                    updatedUser?.coverImage || coverPreview
                );
                setSuccess("Cover image updated successfully.");
            }
        } catch (err) {
            setError(messageOf(err));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl">
            <span className="eyebrow">ACCOUNT SETTINGS</span>

            <h1 className="mt-2 text-3xl font-extrabold">
                Your profile
            </h1>

            <div className="panel mt-7 overflow-hidden p-6">

                {/* Cover image */}
                <div className="mb-6">
                    <h2 className="mb-3 font-bold">
                        Cover image
                    </h2>

                    <div className="relative h-40 w-full overflow-hidden rounded-xl bg-gradient-to-r from-brand-500/30 to-purple-500/30">
                        {coverPreview && (
                            <img
                                src={coverPreview}
                                alt="Profile cover"
                                className="h-full w-full object-cover"
                            />
                        )}
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        className="field mt-3"
                        onChange={(e) =>
                            handleImageChange(
                                e.target.files?.[0],
                                setCoverImage
                            )
                        }
                    />

                    <button
                        type="button"
                        disabled={!coverImage || uploadingCover}
                        onClick={() => uploadImage("cover")}
                        className="btn-primary mt-3"
                    >
                        {uploadingCover
                            ? "Uploading..."
                            : "Upload cover image"}
                    </button>
                </div>

                {/* Avatar */}
                <div className="mb-6">
                    <h2 className="mb-3 font-bold">
                        Profile picture
                    </h2>

                    <div className="flex items-center gap-4">
                        <img
                            src={
                                avatarPreview ||
                                "https://api.dicebear.com/7.x/initials/svg?seed=User"
                            }
                            alt="Profile avatar"
                            className="h-20 w-20 rounded-full border border-white/10 object-cover"
                        />

                        <div className="flex-1">
                            <input
                                type="file"
                                accept="image/*"
                                className="field"
                                onChange={(e) =>
                                    handleImageChange(
                                        e.target.files?.[0],
                                        setAvatar
                                    )
                                }
                            />

                            <button
                                type="button"
                                disabled={!avatar || uploadingAvatar}
                                onClick={() => uploadImage("avatar")}
                                className="btn-primary mt-3"
                            >
                                {uploadingAvatar
                                    ? "Uploading..."
                                    : "Update avatar"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="my-6 border-t border-white/10" />

                {/* Account details */}
                <h2 className="mb-4 font-bold">
                    Account details
                </h2>

                <form onSubmit={save} className="space-y-4">
                    <label className="block">
                        <span className="field-label">
                            Full name
                        </span>

                        <input
                            required
                            className="field"
                            value={fullName}
                            onChange={(e) =>
                                setFullName(e.target.value)
                            }
                        />
                    </label>

                    <label className="block">
                        <span className="field-label">
                            Email
                        </span>

                        <input
                            required
                            type="email"
                            className="field"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                        />
                    </label>

                    {error && (
                        <p className="text-sm text-brand-500">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p className="text-sm text-emerald-500">
                            {success}
                        </p>
                    )}

                    <button
                        disabled={busy}
                        className="btn-primary"
                    >
                        {busy ? "Saving..." : "Save changes"}
                    </button>
                </form>
            </div>
        </div>
    );
}
