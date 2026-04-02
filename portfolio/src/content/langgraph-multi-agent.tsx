import type { TocHeading } from "@/components/blog/toc-sidebar";

export const headings: TocHeading[] = [
  { id: "intro", text: "Introduction", level: 2 },
  { id: "why-langgraph", text: "Why LangGraph?", level: 2 },
  { id: "patterns", text: "Agent Patterns", level: 2 },
  { id: "single-agent", text: "Single ReAct Agent", level: 3 },
  { id: "supervisor", text: "Supervisor Pattern", level: 3 },
  { id: "state", text: "Shared State Management", level: 2 },
  { id: "production", text: "Production Considerations", level: 2 },
];

export default function LangGraphMultiAgent() {
  return (
    <>
      <h2 id="intro">Introduction</h2>
      <p>
        Building a single LLM-powered tool is straightforward. Orchestrating
        multiple agents that collaborate, share state, and recover from failures
        is a different challenge entirely. This post shares patterns I&apos;ve
        developed while building agentic systems at MAindTec.
      </p>

      <h2 id="why-langgraph">Why LangGraph?</h2>
      <p>
        LangGraph models agent workflows as state machines — directed graphs
        where nodes are computation steps and edges are conditional transitions.
        This gives you explicit control over the execution flow, unlike
        chain-based approaches where the LLM decides everything.
      </p>
      <blockquote>
        The mental model shift: stop thinking about &quot;prompting an agent&quot; and
        start thinking about &quot;designing a state machine that happens to use
        LLMs at certain nodes.&quot;
      </blockquote>

      <h2 id="patterns">Agent Patterns</h2>

      <h3 id="single-agent">Single ReAct Agent</h3>
      <p>
        The simplest pattern: one agent with access to a set of tools. The
        agent reasons about which tool to call, executes it, observes the
        result, and decides the next step. This is the <code>create_react_agent</code>{" "}
        helper in LangGraph.
      </p>
      <pre>
        <code>{`from langgraph.prebuilt import create_react_agent

agent = create_react_agent(
    model=ChatOpenAI(model="gpt-4o"),
    tools=[search_tool, calculator_tool],
    checkpointer=MemorySaver(),
)`}</code>
      </pre>

      <h3 id="supervisor">Supervisor Pattern</h3>
      <p>
        For complex workflows, a supervisor agent routes tasks to specialized
        sub-agents. The supervisor maintains the high-level plan while
        delegating execution. Each sub-agent has its own tool set and system
        prompt optimized for its domain.
      </p>

      <h2 id="state">Shared State Management</h2>
      <p>
        LangGraph&apos;s <code>StateGraph</code> provides typed, shared state that flows
        through the graph. Reducers handle concurrent updates — for example,
        using an &quot;append&quot; reducer for message history so multiple nodes can add
        messages without conflicts.
      </p>

      <h2 id="production">Production Considerations</h2>
      <ul>
        <li>
          <strong>Checkpointing:</strong> Use PostgreSQL-backed checkpointers
          for production. MemorySaver is fine for development but loses state
          on restart.
        </li>
        <li>
          <strong>Human-in-the-loop:</strong> Add interrupt nodes before
          sensitive operations. LangGraph&apos;s interrupt/resume model makes this
          trivial to implement.
        </li>
        <li>
          <strong>Streaming:</strong> Stream intermediate steps to the frontend
          via SSE. Users should see the agent thinking, not just the final
          answer.
        </li>
        <li>
          <strong>Evaluation:</strong> LangSmith traces every node execution.
          Build evaluation datasets from production traces to catch regressions.
        </li>
      </ul>
    </>
  );
}
