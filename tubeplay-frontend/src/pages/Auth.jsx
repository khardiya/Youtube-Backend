
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Video,
    ArrowRight,
    Eye,
    EyeOff,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { messageOf } from "../lib/api";

// ==================== LOGIN ====================

export function Login() {
    const [form, setForm] = useState({
        username: "",
        password: "",
    });

    const [show, setShow] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const submit = async (e) => {
        e.preventDefault();

        setBusy(true);
        setError("");

        try {
            await login(form);

            navigate(
                location.state?.from?.pathname || "/",
                { replace: true }
            );
        } catch (err) {
            setError(messageOf(err));
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthFrame
            title="Welcome back"
            subtitle="Sign in and pick up where you left off"
        >
            <form onSubmit={submit} className="space-y-4">

                <Field label="Username or email">
                    <input
                        required
                        value={form.username}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                username: e.target.value,
                            })
                        }
                        placeholder="you@example.com"
                        className="field"
                    />
                </Field>

                <Field label="Password">
                    <div className="relative">
                        <input
                            required
                            type={show ? "text" : "password"}
                            value={form.password}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    password: e.target.value,
                                })
                            }
                            placeholder="Enter your password"
                            className="field pr-12"
                        />

                        <button
                            type="button"
                            onClick={() => setShow(!show)}
                            className="absolute right-4 top-3.5 text-muted"
                        >
                            {show ? (
                                <EyeOff size={17} />
                            ) : (
                                <Eye size={17} />
                            )}
                        </button>
                    </div>
                </Field>

                {error && (
                    <p className="text-sm text-brand-500">
                        {error}
                    </p>
                )}

                <button
                    disabled={busy}
                    className="btn-primary w-full"
                >
                    {busy ? "Signing in…" : "Sign in"}
                    <ArrowRight size={16} />
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
                New to TubePlay?{" "}
                <Link
                    className="font-bold text-brand-500"
                    to="/register"
                >
                    Create an account
                </Link>
            </p>
        </AuthFrame>
    );
}

// ==================== REGISTER ====================

export function Register() {
    const [form, setForm] = useState({
        fullName: "",
        username: "",
        email: "",
        password: "",
    });

    const [avatar, setAvatar] = useState(null);
    const [coverImage, setCoverImage] = useState(null);

    const [avatarPreview, setAvatarPreview] = useState("");
    const [coverPreview, setCoverPreview] = useState("");

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const { register } = useAuth();
    const navigate = useNavigate();

    // Avatar preview
    useEffect(() => {
        if (!avatar) {
            setAvatarPreview("");
            return;
        }

        const url = URL.createObjectURL(avatar);
        setAvatarPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [avatar]);

    // Cover image preview
    useEffect(() => {
        if (!coverImage) {
            setCoverPreview("");
            return;
        }

        const url = URL.createObjectURL(coverImage);
        setCoverPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [coverImage]);

    // Validate selected image
    const handleImageChange = (file, setter) => {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file.");
            return;
        }

        setter(file);
        setError("");
    };

    // Registration
    const submit = async (e) => {
        e.preventDefault();

        if (!avatar) {
            setError("Avatar image is required.");
            return;
        }

        setBusy(true);
        setError("");

        const body = new FormData();

        Object.entries(form).forEach(([key, value]) => {
            body.append(key, value);
        });

        body.append("avatar", avatar);

        // Cover image is optional
        if (coverImage) {
            body.append("coverImage", coverImage);
        }

        try {
            await register(body);
            navigate("/login");
        } catch (err) {
            setError(messageOf(err));
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthFrame
            title="Create your account"
            subtitle="Join creators and viewers on TubePlay"
        >
            <form onSubmit={submit} className="space-y-3">

                {/* Full name */}
                <Field label="Full name">
                    <input
                        required
                        className="field"
                        value={form.fullName}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                fullName: e.target.value,
                            })
                        }
                        placeholder="Your name"
                    />
                </Field>

                {/* Username */}
                <Field label="Username">
                    <input
                        required
                        className="field"
                        value={form.username}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                username: e.target.value,
                            })
                        }
                        placeholder="yourhandle"
                    />
                </Field>

                {/* Email */}
                <Field label="Email">
                    <input
                        required
                        type="email"
                        className="field"
                        value={form.email}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                email: e.target.value,
                            })
                        }
                        placeholder="you@example.com"
                    />
                </Field>

                {/* Password */}
                <Field label="Password">
                    <input
                        required
                        minLength={8}
                        type="password"
                        className="field"
                        value={form.password}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                password: e.target.value,
                            })
                        }
                        placeholder="At least 8 characters"
                    />
                </Field>

                {/* Avatar upload */}
                <Field label="Avatar image (required)">
                    <input
                        required
                        type="file"
                        accept="image/*"
                        className="field file:mr-3 file:rounded-lg file:border-0 file:bg-brand-500/10 file:px-3 file:py-2 file:text-xs file:font-bold"
                        onChange={(e) =>
                            handleImageChange(
                                e.target.files?.[0],
                                setAvatar
                            )
                        }
                    />

                    {avatarPreview && (
                        <div className="mt-3">
                            <p className="mb-2 text-xs text-muted">
                                Avatar preview
                            </p>

                            <img
                                src={avatarPreview}
                                alt="Avatar preview"
                                className="h-20 w-20 rounded-full object-cover"
                            />
                        </div>
                    )}
                </Field>

                {/* Cover image upload */}
                <Field label="Cover image (optional)">
                    <input
                        type="file"
                        accept="image/*"
                        className="field file:mr-3 file:rounded-lg file:border-0 file:bg-brand-500/10 file:px-3 file:py-2 file:text-xs file:font-bold"
                        onChange={(e) =>
                            handleImageChange(
                                e.target.files?.[0],
                                setCoverImage
                            )
                        }
                    />

                    {coverPreview && (
                        <div className="mt-3">
                            <p className="mb-2 text-xs text-muted">
                                Cover image preview
                            </p>

                            <img
                                src={coverPreview}
                                alt="Cover image preview"
                                className="h-28 w-full rounded-xl object-cover"
                            />
                        </div>
                    )}
                </Field>

                {/* Error */}
                {error && (
                    <p className="text-sm text-brand-500">
                        {error}
                    </p>
                )}

                {/* Submit */}
                <button
                    disabled={busy}
                    className="btn-primary w-full"
                >
                    {busy ? "Creating account…" : "Create account"}
                    <ArrowRight size={16} />
                </button>
            </form>

            <p className="mt-5 text-center text-sm text-muted">
                Already have an account?{" "}
                <Link
                    className="font-bold text-brand-500"
                    to="/login"
                >
                    Sign in
                </Link>
            </p>
        </AuthFrame>
    );
}

// ==================== FIELD COMPONENT ====================

function Field({ label, children }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-muted">
                {label}
            </span>

            {children}
        </label>
    );
}

// ==================== AUTH LAYOUT ====================

function AuthFrame({ title, subtitle, children }) {
    return (
        <div className="grid min-h-screen bg-canvas lg:grid-cols-2">

            {/* Left branding section */}
            <div className="relative hidden overflow-hidden bg-[#111114] p-12 text-white lg:flex lg:flex-col lg:justify-between">

                <Link
                    to="/"
                    className="flex items-center gap-2 text-xl font-extrabold"
                >
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500">
                        <Video />
                    </span>

                    tubeplay
                </Link>

                <div className="relative z-10 max-w-lg">
                    <p className="eyebrow text-brand-400">
                        CREATE · WATCH · CONNECT
                    </p>

                    <h1 className="mt-5 text-5xl font-extrabold leading-tight">
                        Your next
                        <br />
                        favorite thing
                        <br />
                        <span className="text-brand-400">
                            starts here.
                        </span>
                    </h1>

                    <p className="mt-5 max-w-sm text-sm leading-6 text-white/55">
                        A home for original ideas, ambitious creators,
                        and the videos you’ll want to share.
                    </p>
                </div>

                <p className="text-xs text-white/35">
                    © 2026 TubePlay
                </p>

                <div className="absolute -bottom-24 -right-20 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
            </div>

            {/* Right form section */}
            <div className="flex items-center justify-center p-5">
                <div className="w-full max-w-md">

                    <Link
                        to="/"
                        className="mb-10 flex items-center gap-2 text-lg font-extrabold lg:hidden"
                    >
                        <Video className="text-brand-500" />
                        tubeplay
                    </Link>

                    <h2 className="text-3xl font-extrabold tracking-tight">
                        {title}
                    </h2>

                    <p className="mb-8 mt-2 text-sm text-muted">
                        {subtitle}
                    </p>

                    {children}
                </div>
            </div>
        </div>
    );
}
