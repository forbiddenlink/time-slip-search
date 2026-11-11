import { LangfuseSpanProcessor } from "@langfuse/otel";
import {
  LangfuseOtelSpanAttributes,
  setLangfuseTracerProvider,
  startObservation,
  type LangfuseGeneration as LangfuseGenerationObservation,
  type LangfuseSpan as LangfuseSpanObservation,
} from "@langfuse/tracing";
import { context, ROOT_CONTEXT } from "@opentelemetry/api";
import {
  AlwaysOnSampler,
  NodeTracerProvider,
} from "@opentelemetry/sdk-trace-node";

/**
 * Langfuse (SDK v6, OpenTelemetry-based) for LLM observability.
 * Traces historical search queries, timeline AI, and entity extraction.
 *
 * Uses an isolated tracer provider so Langfuse never touches a global OTEL
 * provider (for example one Sentry registers). The small trace/generation
 * facade below keeps the call shape of the v3 client that callers already use.
 */

let langfuseProcessor: LangfuseSpanProcessor | null = null;
let langfuseClient: LangfuseClient | null = null;

export interface LangfuseGeneration {
  end(args?: {
    output?: unknown;
    level?: "DEBUG" | "DEFAULT" | "WARNING" | "ERROR";
    statusMessage?: string;
    usage?: {
      promptTokens?: number;
      completionTokens?: number;
      totalTokens?: number;
    };
  }): void;
}

export interface LangfuseTrace {
  update(args: { input?: unknown; output?: unknown; metadata?: unknown }): void;
  generation(args: {
    name: string;
    model?: string;
    input?: unknown;
    metadata?: unknown;
  }): LangfuseGeneration;
}

export interface LangfuseClient {
  trace(args: {
    name: string;
    userId?: string;
    sessionId?: string;
    tags?: string[];
    input?: unknown;
    output?: unknown;
    metadata?: unknown;
  }): LangfuseTrace;
  flushAsync(): Promise<void>;
}

type OpenObservation = { ended: boolean; end: () => void };

function compactUsage(
  usage: NonNullable<Parameters<LangfuseGeneration["end"]>[0]>["usage"],
): Record<string, number> | undefined {
  if (!usage) return undefined;
  const details: Record<string, number> = {};
  if (usage.promptTokens !== undefined) details.input = usage.promptTokens;
  if (usage.completionTokens !== undefined) {
    details.output = usage.completionTokens;
  }
  if (usage.totalTokens !== undefined) details.total = usage.totalTokens;
  return details;
}

function createClient(processor: LangfuseSpanProcessor): LangfuseClient {
  // Observations that were started but not yet ended; flushAsync() ends them
  // so they export (v3 sent a trace or generation as soon as it was created).
  const open = new Set<OpenObservation>();

  return {
    trace(args) {
      // ROOT_CONTEXT makes each call its own trace instead of a child of any
      // ambient span.
      const root: LangfuseSpanObservation = context.with(ROOT_CONTEXT, () =>
        startObservation(args.name, {
          input: args.input,
          output: args.output,
          metadata: args.metadata as Record<string, unknown> | undefined,
        }),
      );
      // Trace-level fields are set on the span directly: propagateAttributes()
      // needs an active OTEL context manager that an isolated provider does
      // not guarantee.
      root.otelSpan.setAttributes({
        [LangfuseOtelSpanAttributes.TRACE_NAME]: args.name,
        ...(args.userId
          ? { [LangfuseOtelSpanAttributes.TRACE_USER_ID]: args.userId }
          : {}),
        ...(args.sessionId
          ? { [LangfuseOtelSpanAttributes.TRACE_SESSION_ID]: args.sessionId }
          : {}),
        ...(args.tags?.length
          ? { [LangfuseOtelSpanAttributes.TRACE_TAGS]: args.tags }
          : {}),
      });
      const rootState: OpenObservation = {
        ended: false,
        end: () => {
          rootState.ended = true;
          root.end();
        },
      };
      open.add(rootState);

      return {
        update(update) {
          if (rootState.ended) return;
          root.update({
            ...(update.input !== undefined ? { input: update.input } : {}),
            ...(update.output !== undefined ? { output: update.output } : {}),
            ...(update.metadata !== undefined
              ? { metadata: update.metadata as Record<string, unknown> }
              : {}),
          });
        },
        generation(genArgs) {
          const gen: LangfuseGenerationObservation = root.startObservation(
            genArgs.name,
            {
              model: genArgs.model,
              input: genArgs.input,
              metadata: genArgs.metadata as Record<string, unknown> | undefined,
            },
            { asType: "generation" },
          );
          const genState: OpenObservation = {
            ended: false,
            end: () => {
              genState.ended = true;
              gen.end();
            },
          };
          // Children must end before the root; Set keeps insertion order, so
          // re-add the root after its child.
          open.delete(rootState);
          open.add(genState);
          open.add(rootState);
          return {
            end(endArgs) {
              if (genState.ended) return;
              gen.update({
                ...(endArgs?.output !== undefined
                  ? { output: endArgs.output }
                  : {}),
                ...(endArgs?.level ? { level: endArgs.level } : {}),
                ...(endArgs?.statusMessage
                  ? { statusMessage: endArgs.statusMessage }
                  : {}),
                ...(endArgs?.usage
                  ? { usageDetails: compactUsage(endArgs.usage) }
                  : {}),
              });
              genState.end();
            },
          };
        },
      };
    },
    async flushAsync() {
      for (const observation of open) {
        if (!observation.ended) observation.end();
      }
      open.clear();
      try {
        await processor.forceFlush();
      } catch {
        // Never fail request handling due to observability flush errors.
      }
    },
  };
}

export function isLangfuseConfigured(): boolean {
  return !!(process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY);
}

export function getLangfuse(): LangfuseClient | null {
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  if (!publicKey || !secretKey) return null;

  if (!langfuseClient) {
    langfuseProcessor = new LangfuseSpanProcessor({
      publicKey,
      secretKey,
      baseUrl:
        process.env.LANGFUSE_BASE_URL ||
        process.env.LANGFUSE_HOST ||
        "https://cloud.langfuse.com",
      environment: process.env.NODE_ENV,
      release: process.env.VERCEL_GIT_COMMIT_SHA,
      // Serverless: export each span as it ends instead of batching.
      exportMode: "immediate",
    });
    setLangfuseTracerProvider(
      new NodeTracerProvider({
        sampler: new AlwaysOnSampler(),
        spanProcessors: [langfuseProcessor],
      }),
    );
    langfuseClient = createClient(langfuseProcessor);
  }
  return langfuseClient;
}

export async function flushLangfuse(): Promise<void> {
  const lf = getLangfuse();
  if (lf) await lf.flushAsync();
}
