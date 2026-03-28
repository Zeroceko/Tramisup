# Tiramisup Repo Setup & Sprint Workflow Guide

This guide is for you.
It explains what to put in the repo, what to tell the code model, and how to get it to plan and execute the work in sprints without rewriting prompts every time.

## 1. Put these files in the repo

Create a `docs/` folder and place these files there:

- `docs/ai-agent-system-playbook.md`
- `docs/product-intake-question-playbook.md`

Optional but recommended later:
- `docs/ai-coder-playbook.md`
- `docs/recommendation-mapping-spec.md`

## 2. First message to the code model

After the files are in the repo, send this first:

```text
Before making any product or implementation decisions, read these documents and treat them as source of truth:

- docs/ai-agent-system-playbook.md
- docs/product-intake-question-playbook.md

Working rules:
1. Do not invent behavior that conflicts with these documents.
2. If the current codebase conflicts with the documents, point out the mismatch first.
3. If a requirement is ambiguous, follow the playbooks and state your assumption explicitly.
4. Do not jump straight into code before explaining product logic, state logic, and implementation approach.
5. Do not generate generic startup behavior or placeholder recommendation logic.

For every task, first return:
- what you understood
- relevant rules from the docs
- mismatches in the current implementation
- proposed implementation plan

Only then proceed to code.
```

## 3. Run an audit first

Send this next:

```text
Read and follow:
- docs/ai-agent-system-playbook.md
- docs/product-intake-question-playbook.md

Task:
Audit the current Tiramisup codebase against these documents and produce a gap analysis before any implementation starts.

Return:
- what is already aligned
- what is missing
- what conflicts with the docs
- what should be implemented first
- what should wait until later

Do not code yet.
```

## 4. Then make it create a sprint plan

Send this after the audit:

```text
Read and follow:
- docs/ai-agent-system-playbook.md
- docs/product-intake-question-playbook.md

Task:
Turn the required work into an implementation roadmap and sprint plan.

I want:
1. a recommended implementation order
2. Sprint 1, Sprint 2, Sprint 3, and Sprint 4
3. clear goals for each sprint
4. tasks grouped by frontend, backend, state logic, data model, and AI/recommendation logic
5. dependencies between tasks
6. which tasks are P0, P1, and P2
7. what can be implemented with rules first and what should remain model-driven later
8. the smallest credible first release

For each sprint, return:
- sprint goal
- included tasks
- why these tasks belong together
- blockers / dependencies
- definition of done

After the sprint plan, recommend which sprint to start with immediately and why.
Do not start coding yet.
```

## 5. After that, work sprint by sprint

Once it gives you the sprint plan, do not ask for the whole app at once.
Take the active sprint and send a focused implementation prompt.

Use this template:

```text
Read and follow:
- docs/ai-agent-system-playbook.md
- docs/product-intake-question-playbook.md

Active sprint:
[insert sprint name]

Task:
Implement the tasks in this sprint.

Non-negotiable rules:
- do not hallucinate missing product context
- do not generate generic startup recommendations
- use normalized context as the input to recommendation logic
- use insufficient-data fallback when evidence is weak
- surface ambiguities explicitly
- keep implementation aligned with the docs

Before coding:
1. summarize the sprint goal
2. identify the relevant requirements from the docs
3. identify any codebase mismatches or missing pieces
4. propose the implementation order inside this sprint

Then implement.
```

## 6. Suggested implementation order

Best order:
1. Audit the current codebase
2. Sprint planning
3. Product intake flow
4. Normalized context model
5. Evidence map layer
6. Recommendation engine v1
7. Critic / fallback layer
8. UI rendering and states
9. Polish

## 7. If the model drifts, send this correction prompt

```text
Stop and realign with the source-of-truth docs.

You are drifting away from:
- docs/ai-agent-system-playbook.md
- docs/product-intake-question-playbook.md

Do not invent behavior beyond those documents.
Do not use free-text product descriptions as the sole source of recommendation logic.
Do not generate generic startup guidance.
Re-state the requirements from the docs, identify where your current approach drifted, and correct the implementation plan before writing more code.
```

## 8. If you want it to take ownership of sprint planning

Use this stronger version:

```text
Read and follow:
- docs/ai-agent-system-playbook.md
- docs/product-intake-question-playbook.md

I want you to act as the implementation planner for this repo.

Your job is to:
- audit the existing system
- break the work into the right sprint sequence
- identify dependencies and risks
- choose the smallest credible implementation path
- keep future implementation aligned with the docs
- avoid requiring me to rewrite planning prompts every time

Working mode:
1. first produce a gap analysis
2. then produce a sprint roadmap
3. then recommend the immediate sprint to execute
4. then, for each new request, map it to the correct sprint and explain whether it should be built now or later

Non-negotiable rules:
- the docs are source of truth
- do not hallucinate recommendation behavior
- do not skip normalized context and evidence layers
- do not generate generic startup recommendation systems
- prefer explicit assumptions over silent guessing

Do not code yet.
Start with the audit and sprint roadmap.
```

## 9. Practical working rhythm

Your loop should be:

1. keep the docs in `docs/`
2. give the code model the first instruction
3. make it audit
4. make it create the sprint plan
5. start Sprint 1 only
6. review output
7. continue sprint by sprint

Do not:
- ask for the whole app in one shot
- skip the audit
- skip the sprint plan
- let it invent recommendation logic without normalized context and evidence layers

## 10. What to do right now

Right now, do this in order:

1. put the two docs in `docs/`
2. send the “first message to the code model”
3. send the audit prompt
4. send the sprint-planning prompt
5. start with the first recommended sprint

That is the cleanest low-friction path.
