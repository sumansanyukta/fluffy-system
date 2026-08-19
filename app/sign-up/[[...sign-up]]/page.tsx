import { SignUp } from "@clerk/nextjs";

const features = [
  "Visual canvas for system design",
  "Real-time collaboration",
  "AI-assisted spec generation",
];

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen bg-bg-base">
      <div className="hidden flex-col justify-between p-10 lg:flex lg:w-1/2">
        <div className="flex items-center gap-2 text-text-primary">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-primary text-sm font-bold text-bg-base">
            E
          </div>
          <span className="text-lg font-semibold">Engineer</span>
        </div>

        <div>
          <h1 className="mb-3 text-2xl font-semibold text-text-primary">
            Build systems, visually.
          </h1>
          <p className="mb-8 text-sm leading-relaxed text-text-muted">
            Design, collaborate, and document software architecture on an
            infinite canvas.
          </p>
          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                <span className="h-1 w-1 shrink-0 rounded-full bg-accent-primary" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-text-faint">
          &copy; {new Date().getFullYear()} Engineer
        </p>
      </div>

      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <SignUp />
        </div>
      </div>
    </div>
  );
}
