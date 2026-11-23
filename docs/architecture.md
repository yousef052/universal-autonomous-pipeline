# Three-Tier Memory Architecture

The UAP Pipeline replaces massive monolithic conversation transcripts with a structured, three-tier memory model:

```mermaid
graph TD
    Tier1["Tier 1: Architectural Anchor<br/>PROJECT_STATE.md (Tech stack, file map, rules)"] --> Agent
    Tier2["Tier 2: Living Milestones<br/>Completed tasks & key decisions ledger"] --> Agent
    Tier3["Tier 3: Active Turn Window<br/>Last 5-10 turns full fidelity"] --> Agent
    
    subgraph PrunedNoise["Pruned Operational Noise"]
        N1["Raw terminal build outputs"]
        N2["Resolved linter warnings"]
        N3["Full unedited file dumps"]
    end
```

## Why This Eliminates Latency
1. **Zero Context Tax:** When starting a task, the agent ingests only ~2KB of structured state rather than 50MB of chat history.
2. **High-Speed Serialization:** Small prompts serialize and transfer in milliseconds.
3. **No Memory Loss:** Because key milestones are committed to disk (`PROJECT_STATE.md`), context survives across chat sessions permanently.
