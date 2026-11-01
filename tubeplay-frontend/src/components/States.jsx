
import {
    AlertCircle,
    LoaderCircle,
    PlayCircle
} from "lucide-react";

// Loading Component
export function Loading({ label = "Loading" }) {
    return (
        <div className="flex min-h-[220px] items-center justify-center gap-3 text-sm text-muted">
            <LoaderCircle className="animate-spin" size={19} />
            {label}...
        </div>
    );
}

// Error Component
export function ErrorState({ message, onRetry }) {
    return (
        <div className="panel mx-auto max-w-lg p-8 text-center">
            <AlertCircle
                className="mx-auto mb-3 text-brand-500"
                size={28}
            />

            <h3 className="font-bold">
                Couldn't load this
            </h3>

            <p className="mt-2 text-sm text-muted">
                {message}
            </p>

            {onRetry && (
                <button
                    onClick={onRetry}
                    className="btn-primary mt-5"
                >
                    Try again
                </button>
            )}
        </div>
    );
}

// Empty State Component
export function Empty({
    title = "Nothing here yet",
    description = "When there's something to show, it'll appear here."
}) {
    return (
        <div className="py-20 text-center">
            <PlayCircle
                className="mx-auto mb-4 text-muted"
                size={38}
            />

            <h3 className="font-bold">
                {title}
            </h3>

            <p className="mt-2 text-sm text-muted">
                {description}
            </p>
        </div>
    );
}
