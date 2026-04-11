---
title: "Inside Claude Code: How Anthropic's AI Coding Agent Actually Works"
excerpt: "An accidental source map leak revealed the architecture behind Claude Code — an agent loop with tool middleware, memory compaction, and sub-agent orchestration."
tags:
  - "LLMs"
  - "AI Architecture"
  - "System Design"
date: "2026-04-08"
readTime: "12 min read"
---

# Inside Claude Code: How Anthropic's AI Agent Actually Works

*An accidental source map leak gave engineers a rare, unfiltered look at the architecture behind one of the most sophisticated AI coding agents in production. Here's what they found.*

---

When Anthropic shipped a routine update to Claude Code, their internal AI coding agent, they made a mistake that most companies dread: they accidentally bundled **source maps** with the deployment. Source maps are debugging artifacts that map compiled JavaScript back to the original TypeScript source, and they were never meant to leave the building.

Within hours, engineers around the world were reading the full, unobfuscated source code of Claude Code. Within 24 hours, a clean room rewrite existed in Python. Shortly after that, it was ported to Rust. The genie was out of the bottle, and what it revealed is genuinely fascinating for anyone building or thinking about AI agents.

---

## Not a Chatbot: An Agent Loop

The most important thing to understand about Claude Code is that it is **not** a single call-and-response system. It's an agent that operates in a continuous loop, making decisions, executing actions, observing results, and deciding what to do next, over and over until the task is done.

This is the fundamental architectural insight. A traditional LLM integration sends a prompt and gets a response. Claude Code sends a prompt, gets a *decision about what to do next*, executes that action, feeds the result back in, and repeats. The loop looks roughly like this:

1. **Receive** the task from the user
2. **Decide** which tool to call (the AI model's reasoning step)
3. **Execute** the tool through a validated middleware layer
4. **Process** the result and update internal state
5. **Update memory**, compacting older history if the context is getting long
6. **Check**: is the task done? If not, go back to step 2

![Core Agent Loop](/blog/claude-code-architecture/claude-code-agent-loop.svg)

This loop is what turns a language model into something that can actually *do work*. It can read a file, realize it needs more context, search for related files, make an edit, run the tests, see a failure, read the error, fix it, and run the tests again. Each of those steps is a separate iteration of the loop.

---

## Separation of Thinking and Doing

One of the cleanest design decisions in Claude Code is the hard boundary between the AI model (which *thinks*) and the tools (which *act*). The model never directly touches the filesystem, never runs a shell command, never makes a network request. Instead, it requests that a tool do these things, and a separate system executes that request.

This separation buys you three things. **Modularity**: you can add, remove, or modify tools without touching the reasoning engine. **Security**: you can inspect and gate every action before it happens. **Observability**: every action flows through a single, well-defined interface that you can log, audit, and replay.

The tool registry contains over 20 tools, covering file operations, shell commands, web search, pattern matching, code navigation, and more. Each tool has a simple description that tells the model when and how to use it. The model picks the tool; the system runs it.

![System Architecture](/blog/claude-code-architecture/claude-code-architecture.svg)

---

## Hooks: Middleware for AI Actions

Perhaps the most underappreciated component in the architecture is the **hooks system**. If you've worked with middleware in web frameworks like Express or Django, hooks will feel immediately familiar.

Every tool call passes through hooks both before and after execution. Pre-execution hooks can inspect the request, modify parameters, or block the call entirely. Post-execution hooks can log results, trigger side effects, or transform the output before it reaches the model.

This is where safety enforcement lives. A hook can prevent the agent from running `rm -rf /`. It can redact secrets from shell output before they enter the model's context. It can rate-limit expensive operations. It can emit structured logs for every action the agent takes. The hook layer turns a powerful but potentially dangerous tool-calling system into something you can actually trust in production.

---

## Memory That Doesn't Forget (Much)

AI models have finite context windows. A long coding session can easily exceed that limit. Claude Code handles this with a **memory compaction** system that summarizes older conversational history when the context grows too large.

Think of it like a human taking notes during a long meeting. Early in the meeting, you have perfect recall. As the meeting drags on, your earlier notes become summaries while recent events stay in full detail. Claude Code does the same thing programmatically: it keeps recent tool calls and results in full fidelity while compressing older history into summaries that preserve the essential context.

This is what allows the agent to work on tasks that span dozens or hundreds of individual steps without losing track of what it's doing or why.

---

## Context Loading: Claude MD and Skills

Before the agent loop even starts, Claude Code loads two types of context that shape how it operates.

**Claude MD** files are project-level configuration documents, essentially onboarding guides for the AI. They describe coding conventions, preferred libraries, testing strategies, directory structure, and anything else a new developer would need to know about the project. When Claude Code starts a session, it reads these files first so that its decisions align with the project's norms.

**Skills** are reusable instruction sets for specific task types. A skill might describe how to write a React component, how to set up a database migration, or how to structure a pull request description. Skills are modular and composable: the agent can load multiple skills for a single task, combining their guidance.

Together, Claude MD and Skills mean that Claude Code doesn't start from zero on every task. It starts with project knowledge and task-specific expertise already loaded.

---

## Sub-Agents: Distributed Task Execution

When a task is too complex or too broad for a single agent loop to handle efficiently, Claude Code can **spawn sub-agents**. Each sub-agent is a fully independent agent with its own loop, its own tool access, and its own memory. The main agent acts as an orchestrator, breaking the task into subtasks, dispatching them to sub-agents, and collecting their results.

![Sub-Agent Orchestration](/blog/claude-code-architecture/claude-code-subagents.svg)

The key insight here is that spawning a sub-agent is just another tool call. The system doesn't need a separate orchestration layer or a different execution model. The main agent calls the "spawn sub-agent" tool, passes it a task description, and waits for the result. This keeps the architecture uniform: everything is a tool, everything goes through hooks, everything is logged.

In practice, sub-agents handle tasks like code review, test generation, security scanning, and documentation. They run in parallel when possible, which means the agent can review code, generate tests, and scan for vulnerabilities simultaneously rather than sequentially.

---

## What This Means for AI Engineering

The Claude Code architecture isn't revolutionary in any single component. Loops, middleware, memory management, task delegation: these are all well-established patterns from distributed systems and web engineering. What's notable is how cleanly they've been applied to AI agent design.

A few takeaways for anyone building in this space:

**The loop is the product.** The difference between a toy demo and a production agent is the quality of the decision loop. Getting the agent to reliably pick the right next action, handle errors gracefully, and know when to stop is the core engineering challenge.

**Middleware patterns transfer directly.** If you know how to build middleware for HTTP servers, you know how to build safety and observability layers for AI agents. The concepts are identical; only the domain is different.

**Memory is a first-class concern.** Any agent that operates over more than a handful of steps needs a memory strategy. Naive approaches (stuff everything in the context) break fast. Compaction and summarization aren't nice-to-haves; they're requirements.

**Modularity enables velocity.** By keeping tools, hooks, memory, and the reasoning engine as separate components, you can iterate on each independently. A new tool doesn't require changes to the loop. A new safety rule is just a new hook.

---

## The Accidental Transparency

The irony of the Claude Code leak is that the architecture it revealed is probably something Anthropic would have been happy to talk about publicly. There are no dark secrets here, just solid engineering applied to a novel domain. The source maps were an accident, but the knowledge they spread may end up raising the bar for the entire industry.

For engineers looking to build their own AI agents, the lesson is clear: start with the loop, separate thinking from doing, add middleware for safety, plan for memory from day one, and design for distributed execution from the start. These aren't just Claude Code patterns. They're emerging best practices for the age of AI agents.

---

*If you want to go deeper, try building a minimal agent loop from scratch. Start with a single tool (file read), add one hook (logging), and implement the decision loop. You'll learn more from that exercise than from any amount of reading.*
