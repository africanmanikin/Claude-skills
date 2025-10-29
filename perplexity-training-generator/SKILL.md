---
name: "Perplexity Enterprise Pro Training Guide Generator"
description: "Create customized Perplexity Enterprise Pro training guides for specific users. Use when someone needs a personalized onboarding guide for Perplexity Spaces based on their role, company, and workflows. Proactively researches the person via LinkedIn/web, then asks targeted questions to fill gaps, and generates a complete HTML training guide with Mali Insights and Move 78 branding."
version: 1.1.0
---

# Perplexity Enterprise Pro Training Guide Generator

## Overview

This Skill generates fully customized Perplexity Enterprise Pro training guides for individual users. It focuses on **Perplexity Spaces** as the core capability and tailors all content (use cases, prompts, Space recommendations) to the specific person's role, industry, and workflows.

The output is a complete HTML page with:
- Mali Insights branding (MI logo, color palette: teal #136670, coral #E5856B, blue #0F3A64, canvas #F2E8D5)
- Move 78 "Human-in-the-Loop" badge with custom icon
- 3-4 use case tabs specific to their role
- Copy-paste ready prompts for their actual work
- Recommended Spaces to create (4-5 specific ones)
- First week implementation plan
- Role-specific "Power Moves"

## Instructions

### Step 0: Research First
Before asking questions, attempt to gather context proactively:

1. **Ask for basic info:**
   - "Who is this guide for? (Name and LinkedIn URL, or name and company)"

2. **Research their profile:**
   - Use WebSearch or WebFetch to find their LinkedIn profile
   - Extract: current role, company, industry, past roles, skills, recent posts/activity
   - Look for: competitors they mention, tools they discuss, pain points they share

3. **Summarize findings:**
   - Present what you learned: "Based on [Name]'s LinkedIn, I can see they're a [Role] at [Company] working in [Industry]. They focus on [Responsibilities]. Their company competes with [Competitors]."
   - State: **"I have sufficient info to proceed"** if you can answer most questions below
   - OR ask only the remaining questions you couldn't answer from research

### Step 1: Fill Gaps with Targeted Questions
Only ask about what you couldn't find through research:

1. **Who is this guide for?** (if not found)
   - Full name
   - Job title/role
   - Company name

2. **What does this person do?** (if unclear from LinkedIn)
   - Main responsibilities in their role
   - What industry/vertical do they serve?
   - What teams do they work with?

3. **What are their 3-4 biggest use cases for Perplexity?** (always ask - can't infer)
   - Competitive intelligence?
   - Customer/prospect research?
   - Market analysis/benchmarking?
   - Content research?
   - Partnership intelligence?
   - Sales enablement?
   - Other specific workflows?

4. **What's their biggest time sink right now?** (always ask - can't infer)
   - What manual research tasks eat up their time?
   - What questions do they ask repeatedly?

5. **Do they have any specific competitors, tools, or data sources they track?** (supplement what you found)
   - Named competitors they monitor
   - Industry benchmarks they reference
   - Tools/platforms they currently use

### Step 2: Generate the Training Guide

Create a complete HTML artifact with this structure:

#### Header Section
- Mali Insights logo (MI icon + text) on left
- Move 78 "Human-in-the-Loop" badge on right
  - Use a creative icon showing person + robot emoji overlay
  - Text: "Move 78 | Human-in-the-Loop"

#### Hero Section
- Large headline: "Your Perplexity Enterprise Pro Training Guide"
- Subtitle with their name, role, company
- 2-3 paragraphs explaining:
  - They have Perplexity Enterprise Pro access
  - This guide shows how to use **Spaces** for their specific workflows
  - Spaces are context-aware workspaces that build institutional knowledge
- Signature area with "Prepared by Mali Insights | Frontier AI Capability Facilitator" + Move 78 badge

#### Main Content: 3-4 Use Case Tabs
For each use case (based on Step 1 answers):

**Tab Structure:**
- H3: Use case title specific to their role
- **Insight Box**: "Why Spaces Transform [This Workflow]" - explain the compound value for this specific use case
- **3 Feature Cards**: How Spaces capabilities solve this use case
- **Real Workflow**: Step-by-step scenario with 3 copy-paste prompts
  - Prompts must be hyper-specific to their actual work
  - Include real company names, competitor names, tools they mentioned
  - Make prompts copy-paste ready

**Use Case Categories to Draw From:**
- Competitive Intelligence (tracking competitors, pricing, features, funding)
- Customer Research (ICP profiling, account research, vertical analysis)
- Metrics & Benchmarking (industry standards, KPI comparisons, board prep)
- Sales Intelligence (vertical research, objection handling, win/loss)
- Content Strategy (SEO research, competitor content, topic trends)
- Partnership Research (integration partners, ecosystem plays)
- Market Analysis (TAM/SAM sizing, trend identification)

#### Recommended Spaces Section
Suggest 4-5 specific Spaces they should create:
- Space name tailored to their role
- **Upload:** List exact file types and documents (be specific)
- **Use for:** 2-3 example queries

Include "Pro Tip" about Spaces templates

#### First Week Plan
5 days of specific actions:
- Day 1: Create first Space with specific uploads
- Day 2: Build second Space type
- Day 3: Test benchmarking/research workflow
- Day 4: Share a Space with team
- Day 5: Build deliverable using Labs

#### Copy-Paste Prompts
5-7 categories of prompts specific to their role:
- Each category has 1 ready-to-use prompt
- Prompts reference their actual competitors, tools, industry
- Include placeholders like [Company Name] where needed

#### Power Moves
5 advanced Space patterns for their role:
- Each power move explains a sophisticated Space architecture
- Shows how to compound intelligence over time
- Includes example prompt demonstrating the pattern

#### CTA Section
- Dark gradient background
- Headline: "Questions? Need Custom Training?"
- 5 bullet points of custom support offerings
- 3 buttons:
  1. Browse Spaces Templates → https://www.perplexity.ai/spaces/templates?category=sales_marketing
  2. Connect on LinkedIn → https://www.linkedin.com/in/siyamali/
  3. Schedule Support Call → https://calendar.app.google/vQD7uGRGCnwNbAqk9

### Step 3: Styling Requirements

Use Mali Insights color palette:
- Teal: #136670 (primary actions, accents)
- Coral: #E5856B (highlights, CTAs)
- Blue: #0F3A64 (headings, text)
- Canvas: #F2E8D5 (backgrounds, cards)
- Foundation: #262626 (body text)

Design elements:
- Gradient background: `linear-gradient(135deg, #136670 0%, #0F3A64 100%)`
- Cards: white bg, rounded-xl, shadow, 5px left border in teal
- Feature cards: gradient bg (teal to blue), white text, coral top border
- Prompt boxes: canvas background, teal left border, monospace font
- Tabs: active state with teal bg, coral bottom border
- Workflow steps: canvas bg, coral left border
- Insight boxes: gradient bg, coral heading color

### Step 4: Quality Checks

Before generating, ensure:
- ✓ All prompts are specific to their actual role/industry/competitors
- ✓ Space recommendations include exact upload suggestions
- ✓ Use cases reflect what they actually do
- ✓ Examples use real scenarios from their work
- ✓ First week plan is actionable and specific
- ✓ No generic placeholder text remains
- ✓ Branding is prominent (Mali Insights + Move 78)

## Examples

**Example 1: RevOps Manager at SaaS Company**
- Use Cases: Competitive Intel, Customer Research, Metrics Benchmarking, Sales Intelligence
- Spaces: Competitive Intelligence Hub, ICP Research by Vertical, SaaS Metrics Benchmarks, Win/Loss Intelligence
- Prompts reference: actual competitors (Runway, Causal), SaaS benchmarks (SaaS Capital, OpenView), specific metrics (CAC, LTV, ARR)

**Example 2: University Program Director**
- Use Cases: Program Leadership, Faculty Support, Student Success, Partnership Development
- Spaces: Competitive Programs, Faculty Resources, Industry Partners, Accreditation Docs
- Prompts reference: peer universities, accreditation standards, corporate partners, program metrics

**Example 3: Marketing Manager**
- Use Cases: Competitive Content, SEO Research, Campaign Intelligence, Industry Trends
- Spaces: Competitor Content Library, Keyword Research, Campaign Performance, Industry Reports
- Prompts reference: competitors' content, ranking keywords, campaign types, industry publications

## Guidelines

- **Research first**: Always attempt to find their LinkedIn or public profile before asking questions
- **State when ready**: Say "I have sufficient info to proceed" when you've gathered enough context
- **Be conversational**: Ask questions naturally, don't interrogate
- **Probe for specifics**: If they say "competitive research," ask which competitors by name
- **Validate understanding**: Summarize what you learned (from research + questions) before generating
- **Make it actionable**: Every prompt should be copy-paste ready for real work
- **Show compound value**: Emphasize how Spaces build institutional knowledge over time
- **Highlight collaboration**: Show how shared Spaces help teams
- **Be role-specific**: A RevOps Manager gets different content than a Professor

## When to Use This Skill

Use this Skill when:
- Someone needs to onboard to Perplexity Enterprise Pro
- A user asks for training materials for Perplexity Spaces
- Someone wants a customized guide for a specific person/role
- You're asked to create Perplexity training documentation

Do NOT use for:
- General Perplexity help (use standard responses)
- Technical troubleshooting
- Pricing or account questions
