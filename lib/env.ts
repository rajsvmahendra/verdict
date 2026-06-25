/**
 * Typed environment variable loader for Verdict.
 * Throws at boot if any required variable is missing.
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
    GROQ_API_KEY: requireEnvVar("GROQ_API_KEY"),
} as const;