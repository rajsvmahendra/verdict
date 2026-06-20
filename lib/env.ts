/**
 * Typed environment variable loader for Verdict.
 *
 * Throws at boot if any required variable is missing.
 * Never returns undefined — callers can trust the returned value.
 */

function requireEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(
            `[Verdict] Missing required environment variable: ${name}. ` +
            `Ensure it is defined in .env.local before starting the server.`
        );
    }
    return value;
}

export const env = {
    GOOGLE_AI_API_KEY: requireEnvVar("GOOGLE_AI_API_KEY"),
} as const;