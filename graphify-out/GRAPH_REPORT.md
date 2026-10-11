# Graph Report - Mortar  (2026-10-11)

## Corpus Check
- 379 files · ~328,025 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 8, .css 3, .example 1)

## Summary
- 4603 nodes · 12849 edges · 219 communities (173 shown, 46 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 978 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `861d31fd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- nextStep.ts
- api.ts
- BookingsPage.tsx
- cn
- Card
- Deployment Workflow
- usePersona
- Industry Practitioner Survey (n=8)
- PersonaProvider
- Native Controls Ban
- Database
- package.json
- GET /api/snapshot
- Financing-Risk Method
- app.ts
- generate.ts
- Environment Configuration
- A Company Brain For Booking-To-SPA Conversion
- core/src/index.ts
- types.ts
- generate() Stage-Transition Monte Carlo
- frontend/index.html (Vite SPA Entry Document)
- Ask MortarAI (Gemini assistant)
- check Job
- questions.ts
- Profile Sessions And Shared Configuration
- Snapshot
- AskTrigger.tsx
- db/index.ts
- Mortar Brief
- better-accessibility Skill: reduced motion, zoom, autoplay
- persona.tsx
- Mortar (Product Requirements)
- About The Project section
- utils.ts
- Five named demo profiles behind the four personas
- Approved Glyph List
- ChasePage.tsx
- Live Walkthrough
- Capture Beat Sequence
- ref_node_fs
- Persona: Legal Admin (home /legal)
- BookingsPage.test.tsx
- LegalPage.test.tsx
- packages/core/src/sim.ts Generator + Forecasting
- Booking
- User Stories Per Screen
- json
- Mortar Demo Recorder
- tools.ts
- Sources
- FR-2 Case Summarization And Stall Detection
- Data Retention
- forecast() projects forward
- PersonaRoute.tsx (route guard)
- Hugeicons by Halal Lab
- proxyClient.ts
- assistant/index.ts
- Front-End Simulation
- API Reference
- Gotcha: manager workflows
- Questions To Expect
- precompute.ts
- jev/package.json
- slides/render.mjs (Slide PNG Renderer)
- server/package.json
- dependencies
- Know The Company
- ProfileMenu.tsx
- devDependencies
- speak.py
- MotionSites: cinematic landing page prompts
- Profile Menu
- LegalQueueTable.tsx
- POST /api/assistant
- CaseSummary
- narrate.sh (Voice + Schedule + Subtitles)
- Preserved Technical Cautions
- Mortar Workspace Engine (Bookings Ledger, Today Queue, Forecast Engine)
- assistant.test.ts
- Desk Colours
- readSheetFile.test.ts
- Non-Functional Requirements
- askBrain (scripted fallback)
- How It Works section
- CaseEvent
- record.mjs
- patch_docs.py
- Typeface
- Acceptance Criteria (14)
- Markdown Style Guide
- Technical Requirements Document: Mortar
- Design Research: Layerhand Landing Page
- frontend/ Workspace
- frontend/tsconfig.json
- Pull Request Template
- core/package.json
- import.ts
- cases.ts
- mappers.ts
- react-router-dom
- tourAnchors.test.tsx
- components.json
- Step 1: Capture
- Case-free forecast aggregate (built from full resolved history before profile scoping)
- compilerOptions
- Harness Structure
- Music Bed
- The Jev Boundary And Resilience
- Mortar Notes For Agents
- Getting Started
- UI Triage: The Signed-In App
- AppNav.tsx
- packages_core_src_index_casesummary
- Bug Report Issue Form
- Button
- Jev (Reading Engine)
- test_assemble.py
- Sales Chart: Design
- Perch Landing Teardown
- Checklist
- Gotcha: named profiles define data access
- Import area
- Evidence And Assumptions
- This Week. What We Need.
- Keep It Current
- BatchSpeechTests
- schema.sql
- ImportPage.tsx
- scripts
- booking-template.mjs
- reset.ts
- Design: Mortar (Visual Specification)
- File Map
- Gotchas
- RTK Commands By Workflow
- Step 6: Request Follow-Up From Tan Mei Ling
- Today Rail
- FR-8 Statistical Conversion Forecasting
- packages_core_src_index_booking
- Project Structure tree
- assemble.sh Mux Phase
- notificationStore.ts
- Documents Index
- Assistant area (server/src/assistant/)
- managerQueue.ts
- jev/tsconfig.json
- NarrateTests
- Personas
- Legal Admin (persona)
- walk.mjs
- See Also
- Meet MortarAI. One Reads, One Answers.
- Jakub Krehel's Interface Skills
- Run Of Show
- server/tsconfig.json
- subtitles.py
- Functional Requirements
- Andrej Karpathy Skills
- Ask The Graph First
- ChaseCard.test.tsx
- Jev (packages/jev/, classifies and proposes)
- The One Rule: a booking is never counted as cash at face value
- .prettierrc.json
- Agent Rules
- ChartTooltipContent.tsx
- packages_core_src_index_task
- core/tsconfig.json
- FR-7 Next Action, Playbook Fit And Buyer Signals
- SubtitleLayoutTests
- Mortar Pitch Script
- AppErrorBoundary
- ref_vitest
- better-ui Skill: surfaces, icons, motion values
- assemble.sh
- Gotcha: shared settings and inventory
- vite.config.ts
- schedule.py
- frontend/package.json
- narrate.sh
- sim.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 161 edges
2. `Button` - 97 edges
3. `react` - 88 edges
4. `lucide-react` - 60 edges
5. `@testing-library/react` - 58 edges
6. `Booking` - 58 edges
7. `usePersona()` - 56 edges
8. `CaseEvent` - 56 edges
9. `react-router-dom` - 55 edges
10. `CaseSummary` - 53 edges

## Surprising Connections (you probably didn't know these)
- `Acceptance` --references--> `CaseQuickView()`  [INFERRED]
  docs/research/sales-chart/README.md → frontend/src/components/bookings/CaseQuickView.tsx
- `What It Shows` --references--> `CaseQuickView()`  [INFERRED]
  docs/research/sales-chart/README.md → frontend/src/components/bookings/CaseQuickView.tsx
- `Global Constraints` --references--> `generateDataset()`  [INFERRED]
  docs/research/sales-chart/plan-1-core.md → packages/core/src/sim/generate.ts
- `Run bun run check Then bun run format` --semantically_similar_to--> `Run The Checks Locally Before Pushing`  [INFERRED] [semantically similar]
  AGENTS.md → .github/CONTRIBUTING.md
- `App()` --implements--> `Route Map`  [INFERRED]
  frontend/src/App.tsx → AGENTS.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **MortarAI Two-Engine Architecture (Jev + Gemini)** — docs_prd_mortarai_ai_layer, docs_prd_typesafe_jev, docs_prd_gemini_assistant, docs_prd_ask_mortarai_renamed [EXTRACTED 1.00]
- **Redesign Supersedes #60 Points (Suggestions Tabs, Forecast Documents Removal)** — docs_prd_intake_60, docs_prd_manager_suggestions_first, docs_prd_forecast_documents_removed, docs_prd_decisions_for_you, docs_prd_team_page, docs_prd_forecast_document_stack [EXTRACTED 1.00]
- **Cross-Desk Booking Handoff In The Live Walkthrough** — docs_demo_mortar_pitch_deck_persona_sales_admin, docs_demo_mortar_pitch_deck_persona_loan_admin, docs_demo_mortar_pitch_deck_persona_legal_admin, docs_demo_mortar_pitch_deck_persona_manager [EXTRACTED 1.00]
- **Seven-Step Live Walkthrough Sequence** — docs_demo_pitch_script_walkthrough_step1_queue_cards, docs_demo_pitch_script_walkthrough_step2_waiting_on_view, docs_demo_pitch_script_walkthrough_step3_confirm_jev_suggestion, docs_demo_pitch_script_walkthrough_step4_paste_message_confirm, docs_demo_pitch_script_walkthrough_step5_record_appointment, docs_demo_pitch_script_walkthrough_step6_request_followup, docs_demo_pitch_script_walkthrough_step7_forecast_numbers [EXTRACTED 1.00]
- **MortarAI's Two-Engine System (Jev Reads, Gemini Answers)** — docs_demo_mortar_pitch_deck_mortarai, docs_demo_mortar_pitch_deck_jev, docs_demo_mortar_pitch_deck_gemini_engine, docs_demo_mortar_pitch_deck_ask_mortarai [EXTRACTED 1.00]
- **The Desk Never Waits On AI: Budgets And Fallbacks** — docs_demo_pitch_script_graceful_degradation, docs_demo_pitch_script_jev_three_second_budget, docs_demo_pitch_script_contingency_jev_slow_or_wrong, docs_demo_pitch_script_contingency_gemini_fallback_counted, docs_demo_pitch_script_q_ai_wrong_or_down, docs_demo_pitch_script_10_technology_second_b_1_minute [INFERRED 0.85]
- **Manager Oversight Flow (Decisions For You, Follow-Up, Team View)** — docs_demo_mortar_pitch_deck_persona_manager, docs_prd_jtbd_decisions_waiting_on_me, docs_prd_decisions_for_you, docs_prd_manager_flagging, docs_prd_jtbd_reading_the_desks, docs_prd_team_page [INFERRED 0.85]
- **Jev Picks, Scores Its Confidence, A Person Confirms** — docs_demo_pitch_script_jev, docs_demo_pitch_script_jev_fixed_answers_calibrated_confidence, docs_demo_pitch_script_needs_review_threshold, docs_demo_pitch_script_jev_picks_never_writes, docs_demo_pitch_script_ai_proposes_people_confirm, docs_demo_pitch_script_walkthrough_step3_confirm_jev_suggestion [INFERRED 0.85]
- **Evidence Base Cited Across The Pitch Deck** — docs_demo_mortar_pitch_deck_source_practitioner_survey, docs_demo_mortar_pitch_deck_source_rehda_industry_survey, docs_demo_mortar_pitch_deck_source_chgp_2q_2026_results, docs_demo_mortar_pitch_deck_source_chin_hin_challenge_brief [INFERRED 0.85]
- **Booking-To-SPA Evidence Chain From Interview to Feature Proposal** — docs_source_interview, docs_research_practitioner_survey_readme, docs_source_problem_statement_booking_to_spa_gap, docs_research_feature_ideas_readme_early_financing_eligibility [EXTRACTED 1.00]
- **Demo Capture Lane (walk, record, contract, warmup, proof)** — scripts_demo_readme_walk_mjs, scripts_demo_readme_record_mjs, scripts_demo_readme_contract_mjs, scripts_demo_readme_warmup_mjs, scripts_demo_readme_proof_mjs, scripts_demo_readme_beats_json, scripts_demo_readme_capture_webm, scripts_demo_readme_mark [EXTRACTED 1.00]
- **Demo Voice Synthesis Lane** — scripts_demo_readme_speak_py, scripts_demo_readme_schedule_py, scripts_demo_readme_subtitles_py, scripts_demo_readme_narrate_sh, scripts_demo_readme_lines_json, scripts_demo_readme_manifest_py [EXTRACTED 1.00]
- **Document Patching Pipeline (prepare, edit, check, merge, finish)** — docs_agents_graphify_patch_workflow, scripts_graph_patch_docs, docs_agents_graphify_patch_prepare, docs_agents_graphify_patch_check, docs_agents_graphify_patch_merge, docs_agents_graphify_patch_finish [EXTRACTED 1.00]
- **Manager Works From Today With Team Desk Health** — docs_product_project_management, docs_product_robert_khoo, docs_product_decisions_for_you, docs_product_desk_health, docs_product_team_view, docs_product_mortar_workspace_engine [EXTRACTED 1.00]
- **Architecture: case intake, staff review, web app, API, and backend services** — docs_readme_case_messages, docs_readme_staff_personas, docs_readme_bun_serve_index, docs_readme_mortar_core_shared, docs_readme_neon_postgres, docs_readme_jev_client, docs_readme_google_gemini, docs_readme_render_autodeploy [EXTRACTED 1.00]
- **Jev Four-Tier Fallback Ladder (Live, Exact Cache, Stale, Unavailable)** — docs_trd_jev_service, docs_trd_ladder_live_call, docs_trd_ladder_exact_cache, docs_trd_ladder_stale_cache, docs_trd_ladder_unavailable, docs_trd_jev_answers_table [EXTRACTED 1.00]
- **MortarAI's Two Engines (Jev Classification + Gemini Answers)** — docs_trd_mortar_ai, docs_trd_mortar_jev_package, docs_trd_gemini_model, docs_trd_ask_mortar_ai [EXTRACTED 1.00]
- **Persona Route Guarding (Profiles, Page Map, Home Routes, Guard, /team)** — docs_trd_frontend_persona_tsx, docs_trd_five_named_demo_profiles, docs_trd_persona_pages, docs_trd_persona_home_routes, docs_trd_persona_route_component, docs_trd_team_page, docs_trd_manager_redirect [EXTRACTED 1.00]
- **Dark Mode Boot Path (stored preference, OS media query, class toggle, browser chrome color)** — frontend_index_html_fouc_guard_script, frontend_index_html_theme_localstorage_key, frontend_index_html_prefers_color_scheme_media_query, frontend_index_html_dark_class_toggle, frontend_index_html_theme_color_dark, frontend_index_html_theme_color_light [EXTRACTED 1.00]
- **Social Share Card (Open Graph + Twitter Card metadata pointing at the Render deployment)** — frontend_index_html_social_preview_metadata_group, frontend_index_html_og_title, frontend_index_html_og_description, frontend_index_html_og_url, frontend_index_html_og_image, frontend_index_html_twitter_card, frontend_index_html_twitter_image, frontend_index_html_brand_tagline [EXTRACTED 1.00]
- **The Seven Stages Of The Journey Of A Change** — github_contributing_start_with_an_issue, github_contributing_branch_naming, github_contributing_commit_message_format, github_contributing_fill_in_the_template, github_contributing_review_and_merging, github_contributing_check_the_live_site [EXTRACTED 1.00]
- **check Job Step Sequence** — github_workflows_ci_step_checkout, github_workflows_ci_step_setup_bun, github_workflows_ci_step_install_frozen_lockfile, github_workflows_ci_step_run_check, github_workflows_ci_step_run_build [EXTRACTED 1.00]
- **Landing Page Design Synthesis Across Eight Sources** — docs_research_design_readme, docs_research_design_hugeicons_stroke_rounded, docs_research_design_isocons, docs_research_design_motionsites_scroll_scrubbed_video, docs_research_design_jakub_antalik_drawer, docs_research_design_canvas_ui_peel, docs_research_design_jakubkrehel_skills_better_ui [EXTRACTED 1.00]
- **Public Page Chrome (Landing, Footer, Sign-In)** — docs_design_public_pages, docs_design_landing, docs_design_public_footer, docs_design_sign_in, docs_design_landing_panel_tokens [EXTRACTED 1.00]
- **Status Visual Language (tone + word + pill)** — docs_design_status_tones, docs_design_status_language, docs_design_status_pill, docs_design_signed_pill_inversion, docs_design_urgency_words [EXTRACTED 1.00]
- **MortarAI AI layer: Jev and Gemini engines** — docs_readme_mortarai, docs_readme_jev_client, docs_readme_typesafe, docs_readme_ask_mortarai, docs_readme_google_gemini [EXTRACTED 1.00]
- **Reduction of Visual Noise Across Product and Marketing Surfaces** — docs_research_perch_landing_single_cta, docs_research_ui_triage_readme_density_budget, docs_research_ui_triage_readme_uniform_volume, docs_research_design_jakub_antalik_restraint [INFERRED 0.75]
- **Persona Switching And Profile Persistence** — agents_personas, docs_product_profile_menu, agents_mortar_profile_key, agents_mortar_persona_key, agents_routes [INFERRED 0.85]
- **Pacing and Duration Guardrails** — scripts_demo_readme_target_runtime, scripts_demo_readme_picture_fits_voice, scripts_demo_readme_no_dead_air, scripts_demo_readme_disable_mkl_dnn, scripts_demo_readme_env_demo_max_gap_ms, scripts_demo_readme_env_demo_fit_tail_ms, scripts_demo_readme_env_demo_mute_seg_ms, scripts_demo_readme_env_demo_min_duration, scripts_demo_readme_env_demo_max_duration [INFERRED 0.85]
- **Safeguards Against Graph Churn And Node Loss** — docs_agents_graphify_pinned_version, docs_agents_graphify_install_line, docs_agents_graphify_sql_extra, docs_agents_graphify_force_flag, docs_agents_graphify_semantic_origin_marker, docs_agents_graphify_labels_sig [INFERRED 0.85]
- **Manager Follow-Up Flow (Decisions For You to flagged task to recipient)** — docs_agents_notes_decisions_for_you, docs_agents_notes_request_follow_up, docs_agents_notes_flagged_department_tasks, docs_agents_notes_current_case_assignee, docs_agents_notes_follow_up_responsibility_rule, docs_agents_notes_follow_ups_you_sent [INFERRED 0.85]
- **Named-Profile Access Boundary (server session scopes APIs, tools and forecasts)** — docs_agents_notes_server_session, docs_agents_notes_profile_id_header, docs_agents_notes_gotcha_named_profiles, docs_agents_notes_assistant_tools, docs_agents_notes_brain_askbrain, docs_agents_notes_forecast, docs_agents_notes_import_role_gate, docs_agents_notes_can_manage_task_status [INFERRED 0.85]
- **Forecast Aggregate And Its Consumers (#79)** — docs_agents_notes_forecast_model_aggregate, docs_agents_notes_forecast_model_v1, docs_agents_notes_scoped_snapshot_aggregate, docs_agents_notes_forecast, docs_agents_notes_manager_home_today, docs_agents_notes_assistant_area, docs_agents_notes_brain_askbrain [INFERRED 0.85]
- **First-Paint Critical Path (fonts, favicon, theme guard, mount div, module entry)** — frontend_index_html_fonts_preconnect, frontend_index_html_geist_font_stylesheet, frontend_index_html_favicon_svg, frontend_index_html_fouc_guard_script, frontend_index_html_root_mount_div, frontend_index_html_main_tsx_module_entry [INFERRED 0.85]
- **No Staging Step Protects Every Rule** — github_contributing_deploys_to_live, github_contributing_never_merge_your_own_pull_request, github_contributing_green_checks_only, github_contributing_run_the_checks_locally, github_contributing_check_the_live_site, github_contributing_live_site_incident [INFERRED 0.85]
- **Rules Encoded As Required Form Fields** — github_issue_template_bug_duplicate_and_conflict_check, github_issue_template_bug_data_check, github_issue_template_feature_duplicate_and_conflict_check, github_issue_template_feature_done_when, github_issue_template_config_blank_issues_disabled, github_pull_request_template_checklist [INFERRED 0.85]
- **Main Branch Deploy Gate Chain** — github_workflows_ci_trigger_push_main, github_workflows_ci_check, github_workflows_ci_render_deploy_gate [INFERRED 0.85]
- **Flat Ledger Surface System** — docs_design_flat_ledger, docs_design_elevation_card, docs_design_radius_tokens, docs_design_no_row_tinting, docs_design_semantic_colour, docs_design_canvas_dot_grid [INFERRED 0.85]
- **Test Database Wiring for the Check Step** — github_workflows_ci_service_postgres, github_workflows_ci_test_database_url, github_workflows_ci_env_postgres_user_mortar, github_workflows_ci_env_postgres_password_mortar, github_workflows_ci_env_postgres_db_mortar_test, github_workflows_ci_port_mapping_5432, github_workflows_ci_step_run_check [INFERRED 0.95]

## Communities (219 total, 46 thin omitted)

### Community 0 - "nextStep.ts"
Cohesion: 0.11
Nodes (23): BALL_HOLDERS, MOVE_OWNER, CaseNextStep, CreateTaskPayload, stepToTask(), BOOKING, RISK, WITH_BANK (+15 more)

### Community 1 - "api.ts"
Cohesion: 0.05
Nodes (58): STATUS_TONES, APPLICATION_STATUS_LABELS, DOCUMENT_LABELS, EVENT_KIND_LABELS, EXTRACTED_EVENT_LABELS, formatDateTime(), NEXT_ACTION_LABELS, SENDER_ROLE_LABELS (+50 more)

### Community 2 - "BookingsPage.tsx"
Cohesion: 0.05
Nodes (69): Task 3: The Page, Route, Navigation And Tour, BookingPipelineFlow(), BookingPipelineFlowProps, PipelineCounts, PipelineSelection, PipelineStageCounts, PipelineStageId, StepConfig (+61 more)

### Community 3 - "cn"
Cohesion: 0.06
Nodes (51): BookingFilters(), DateField(), monthOf(), toDate(), toIso(), BackToTop(), HowItWorks(), Moment (+43 more)

### Community 4 - "Card"
Cohesion: 0.13
Nodes (46): BookingsTable(), EvidenceLog(), SOURCE_LABELS, TRACK_LABELS, formatDays(), formatPercent(), formatRm(), formatRmCompact() (+38 more)

### Community 5 - "Deployment Workflow"
Cohesion: 0.12
Nodes (27): Build And Start Step, Docker Builder Stage (bun install + frontend build), bun run check (ESLint + tsc + Vitest), bun run format (Prettier, 80-Column Markdown), CI Gate Before Render Deploys, CI Postgres 17 Service Container, Legacy Cloud Run Service (No Longer Receiving Deploys), Continuous Integration (+19 more)

### Community 6 - "usePersona"
Cohesion: 0.16
Nodes (18): AppLayout(), AppLayoutProps, AppSidebar(), usePersona(), Rect, Spotlight(), resolveRoute(), Harness() (+10 more)

### Community 7 - "Industry Practitioner Survey (n=8)"
Cohesion: 0.36
Nodes (8): Booking Leakage, Evidence From Research And Industry, Inventory Lock, Ranked Causes Of Booking Leakage, Official And Industry Benchmarks, PJD Regency Sdn Bhd v Tribunal Tuntutan Pembeli Rumah (2021), Industry Practitioner Survey (n=8), The Problem And Its Cost

### Community 8 - "PersonaProvider"
Cohesion: 0.10
Nodes (22): appointment(), row(), waiting(), renderCard(), PersonaProvider(), ChasePage(), defaultData(), mocks (+14 more)

### Community 9 - "Native Controls Ban"
Cohesion: 0.17
Nodes (12): Calendar Replacement For Native Date Input, Day Cell And Date Picker, Drop Zone, Elevation: Card Hover, Elevation: Overlay, Guided Tour Chrome, Menu And Menu Item, Motion (+4 more)

### Community 10 - "Database"
Cohesion: 0.07
Nodes (4): Message, Database, JevAnswerRow, DbJevCache

### Community 11 - "package.json"
Cohesion: 0.05
Nodes (45): isOff(), typescriptFiles, warnings(), description, devDependencies, concurrently, eslint, eslint-config-prettier (+37 more)

### Community 12 - "GET /api/snapshot"
Cohesion: 0.11
Nodes (46): POST /api/bookings/import, GET /api/snapshot, bookings Table, Event Status: confirmed, currentCaseAssignee Responsibility Resolution, Data Model And Schema, db.insertApplication, PostgreSQL Entity-Relationship Diagram (+38 more)

### Community 13 - "Financing-Risk Method"
Cohesion: 0.14
Nodes (34): TenureYears = min(35, 70 - age), Approval Probability 0.62 Bridging REHDA And Benchmarks, BNM Margin Rules (Nov 2010), BNM 35-Year Tenure Cap (Jul 2013), Debt Service Ratio Formula, DEFAULT_ASSUMPTIONS Parameter Table, Document Deficit Loop (~35%), financingRisk() Advisory Credit Flag (+26 more)

### Community 14 - "app.ts"
Cohesion: 0.08
Nodes (35): normalizeProjectSettings(), Language, cacheBodies(), cacheSnapshot(), forgetOnWrite(), caseRuleProblem(), cleanDraft(), confirmProblem() (+27 more)

### Community 15 - "generate.ts"
Cohesion: 0.11
Nodes (34): Task 2: Unique Demo Units, stamp(), clamp01(), DISPUTABLE, DOCUMENT_POOL, drawPrice(), drawUnit(), generateDataset() (+26 more)

### Community 16 - "Environment Configuration"
Cohesion: 0.08
Nodes (31): Base (Impractically Slow Without GPU), Nano as CPU Default, chatterbox-requirements.txt, Chatterbox TTS Install (Optional Cloned Voice), Turbo (Larger Model), CHATTERBOX_CACHE ($CHATTERBOX_HOME/cache), Content-addressed cache of synthesized lines, CHATTERBOX_HOME (~/.local/share/mortar-demo/chatterbox) (+23 more)

### Community 17 - "A Company Brain For Booking-To-SPA Conversion"
Cohesion: 0.11
Nodes (19): 10. A Short Learning Path, 11. Questions To Resolve With The Company, 1. What A Central Company Brain Should Mean Here, 2. Open-Source Projects Worth Learning From, 3. Overall Platform Concept, 4. How The Parts Connect, 5. Turning Staff Experience Into Reusable Knowledge, 6. Does A Knowledge Graph Help? (+11 more)

### Community 18 - "core/src/index.ts"
Cohesion: 0.09
Nodes (40): ApplicationsCard(), BookingFilter, BookingFiltersProps, RISKS, View, PILL_STAGES, Sort, SortKey (+32 more)

### Community 19 - "types.ts"
Cohesion: 0.07
Nodes (24): BookingRow, SOURCE_TAG_LABELS, SOURCE_TAG_TONES, listOf(), STORIES, EVENT_MAP, STATUS_RANK, byOccurred() (+16 more)

### Community 20 - "generate() Stage-Transition Monte Carlo"
Cohesion: 0.10
Nodes (31): Bank Application Chains (1-3 Per Booking), Baseline Bookings BK-0001..BK-0140, bookings.created_at Entry Time Semantics, Canonical 140 Generated Bookings Demo Seed, Four Demo `meta` Keys, demo_seed Provenance Flag, Synthetic Names, NRIC And Phone Numbers, generate() Stage-Transition Monte Carlo (+23 more)

### Community 21 - "frontend/index.html (Vite SPA Entry Document)"
Cohesion: 0.08
Nodes (32): meta charset UTF-8, crossorigin Attribute on fonts.gstatic.com Preconnect, Dark Class Toggle on documentElement, SEO Description Meta (internal sales administration for SPA signing), HTML5 Doctype, frontend/index.html (Vite SPA Entry Document), Document Title: Mortar, Favicon /favicon.svg (+24 more)

### Community 22 - "Ask MortarAI (Gemini assistant)"
Cohesion: 0.16
Nodes (19): Ask MortarAI (Gemini assistant), Without a key, /api/assistant returns 503 and UI falls back to scripted answers, Five read-only tools grounded in the live snapshot, Case data sent as a prompt to the proxy model, Env var GEMINI_API_KEY, Env var GEMINI_MODEL (default gemini-3.5-flash-lite), Env var JEV_PROXY_KEY (proxy x-api-key), Env var JEV_PROXY_MODEL (default gemini-3.5-flash-lite) (+11 more)

### Community 23 - "check Job"
Cohesion: 0.08
Nodes (34): package.json build Script, package.json check Script, bun-version-file: package.json, Cancel In Progress, check Job, Lint, typecheck, unit tests, build, CI Workflow, Concurrency Group ci-${{ github.ref }} (+26 more)

### Community 24 - "questions.ts"
Cohesion: 0.07
Nodes (38): ctx, count(), days(), isLive(), isOpen(), joinList(), percent(), ringgit (+30 more)

### Community 25 - "Profile Sessions And Shared Configuration"
Cohesion: 0.19
Nodes (11): PDPC Automated Decision Guidelines (May 2026), 72-Hour Breach Notification Groundwork, DELETE /api/session (Clear Cookie), Demo Hygiene On /import, Missing Sessions Fail Closed, GET /api/session (Read Cookie), POST /api/session (Issue Cookie), Profile Sessions And Shared Configuration (+3 more)

### Community 26 - "Snapshot"
Cohesion: 0.09
Nodes (30): Global Constraints, Review Focus, Sales Chart Plan 1: Core And Server, Task 1: Numbering And Layout, Task 4: Scoped Units In The Snapshot, Task 5: Server Settings And Demo Reset, Task 7: Docs, Verification And The Pull Request, LocationEcho() (+22 more)

### Community 27 - "AskTrigger.tsx"
Cohesion: 0.22
Nodes (11): ASK_EVENT, askMortarAI(), AskRequest, AskTrigger(), mocks, renderAt(), SwitchProfile(), usePersonaSafe() (+3 more)

### Community 28 - "db/index.ts"
Cohesion: 0.06
Nodes (28): BookingDraft, REFERENCE_DATE, data, model, ForecastModel, FORECAST_MODEL_KEY, FORECAST_MODEL_STAGES, FORECAST_MODEL_TTL_MS (+20 more)

### Community 29 - "Mortar Brief"
Cohesion: 0.06
Nodes (31): A Day In Mortar, Competition Rounds, Constraints, How Do You Know It Worked?, How Mortar Answers The Brief, Interview Ground Rules, Interview Questions, Mortar Brief (+23 more)

### Community 30 - "better-accessibility Skill: reduced motion, zoom, autoplay"
Cohesion: 0.29
Nodes (5): better-accessibility Skill: reduced motion, zoom, autoplay, WCAG 2.2.2 Autoplay Pause Requirement, Gemini Videos Composer at gemini.google.com/videos, HeroFilm Two-Element Crossfade, reels.json Manifest and GCS Base URL

### Community 31 - "persona.tsx"
Cohesion: 0.11
Nodes (26): AppSidebarProps, NavGroup(), NavLink(), PAGE_ICONS, SectionHeading(), PersonaRoute(), renderSidebar(), LocationEcho() (+18 more)

### Community 32 - "Mortar (Product Requirements)"
Cohesion: 0.11
Nodes (26): BK-nnnn ids stop before BK-9001, simNow(REFERENCE_DATE), Mortar (Product Requirements), Mortar Product Overview, See Also (Related Documents), Feature Ideas: written up but not built, 48-Hour Clean Exit, Early Financing Eligibility Check (+18 more)

### Community 33 - "About The Project section"
Cohesion: 0.13
Nodes (25): About The Project section, Acknowledgements: YEI 3.0/Kabel, Chin Hin Group, shadcn/ui, Radix UI, Lucide, Booking conversion challenge, Chin Hin Group, Design Spec (DESIGN.md), Hero banner, Illustrative RM24M of phantom reported sales, Interview (source/interview.md) (+17 more)

### Community 34 - "utils.ts"
Cohesion: 0.07
Nodes (45): ProposalBlock(), HeadingNote(), SignalsPanel(), TaskCell(), SIGNALS, EVIDENCE_LABELS, EVIDENCE_TONES, EvidencePill() (+37 more)

### Community 35 - "Five named demo profiles behind the four personas"
Cohesion: 0.13
Nodes (25): @mortar/core domain rules: stage tracking, risk flags, Today queue, risk-weighted forecast, 15 API routes, 4 personas (measured count), 5 demo profiles (measured count), Decisions For You: the Manager's overdue cases, then escalation, Features section, Five named demo profiles behind the four personas, Four personas switched in the header (+17 more)

### Community 36 - "Approved Glyph List"
Cohesion: 0.12
Nodes (24): ArrowUpRight Glyph, Ask Panel, BriefcaseBusiness Glyph, Chase Card, Desk Colour: Legal Admin, Desk Colour: Loan Admin, Desk Colour: Manager, Desk Colour: Sales Admin (+16 more)

### Community 37 - "ChasePage.tsx"
Cohesion: 0.17
Nodes (22): assignedTasksFor(), defaultOwnerFilter(), dueTodayCount(), dueTodayPhrase(), headlineFor(), stalledFor(), TodayFigure, useTodayFigures() (+14 more)

### Community 38 - "Live Walkthrough"
Cohesion: 0.13
Nodes (28): 7. Live Walkthrough — C, 7 Minutes, 8. Before And After — C, 1 Minute, Before You Present, BK-9001 (Demo Booking), Contingency: The App Will Not Load → Walk Slide 7 From Screenshot, Contingency: Ask MortarAI Says Counted From Your Bookings, Contingency: Jev Is Slow Or Wrong → Use Record An Update, Contingency: Receipt Already Confirmed → Reset Shared Data (+20 more)

### Community 39 - "Capture Beat Sequence"
Cohesion: 0.07
Nodes (29): banker_message Beat, Banker's mixed Malay/English message; payslip missing, buyer_reply Beat, Pasted Malay buyer reply; Jev answers Documents Received, case_cleared Beat, Outstanding-document pill leaves the case header, case_risk Beat, Financing-risk chip tooltip naming the flag driver (+21 more)

### Community 40 - "ref_node_fs"
Cohesion: 0.13
Nodes (6): BK_MESSAGES, verifyCleanSeed(), openDemoSession(), cleanEvents, SEEDED_MESSAGES, WALK_BEATS

### Community 41 - "Persona: Legal Admin (home /legal)"
Cohesion: 0.28
Nodes (9): Legal queue section: Appointment Set, Not Signed, Funnel stage 4: SPA signed (buyer pays 10%), Legal queue section: No Appointment Yet, Persona: Legal Admin (home /legal), Demo profile: Legal Admin, Route /legal: SPA execution queue, Screenshot: the legal queue awaiting SPA execution, Sale & Purchase Agreement (SPA) (+1 more)

### Community 42 - "BookingsPage.test.tsx"
Cohesion: 0.05
Nodes (29): EXTRACTION, MESSAGE, PROPOSAL, EXTRACTION, MESSAGE, PROPOSAL, renderPanel(), RANKING (+21 more)

### Community 43 - "LegalPage.test.tsx"
Cohesion: 0.08
Nodes (9): PopoverState, BOOKING, CREST, MALAYAN, renderForm(), summary(), CASES, renderPage() (+1 more)

### Community 44 - "packages/core/src/sim.ts Generator + Forecasting"
Cohesion: 0.21
Nodes (16): Brown, Cai & DasGupta (2001), Cohort -> Stage Aggregate -> Global Baseline, packages/core/src/sim.ts Generator + Forecasting, Forecast And Backtest Method, forecast() Fallback Ladder Guarantee, Live Bookings Filter, Parameter: Conversion Horizon 30 Days, Live / Resolved Population Filtering (+8 more)

### Community 45 - "Booking"
Cohesion: 0.11
Nodes (15): LegalRow, A, approved(), b, booked, ev(), received(), rejected() (+7 more)

### Community 47 - "User Stories Per Screen"
Cohesion: 0.18
Nodes (22): Admin Today Leads With Assigned Tasks, CaseQuickView Side Sheet, Atomic Demo Data Add/Delete, FR-11 Database Persistence And Demo Data, FR-17 Waiting On Party, Quick View, Next Move, FR-5 Today Desk And Task Management, nextStep.ts Rule-Based Next Step, NFR-5 Database Reconnection (+14 more)

### Community 48 - "json"
Cohesion: 0.15
Nodes (3): NarrationManifestTests, NarrationScheduleTests, write_silence()

### Community 49 - "Mortar Demo Recorder"
Cohesion: 0.12
Nodes (17): @capture Token, TolongLabs/codenection-dev scripts/demo, DEMO_SLIDES name:seconds Token, Deployed Mortar Site (mortar-d18f.onrender.com), Eight-Step Live Walkthrough, DEMO_FIT_TAIL_MS (250), Picture kept after a segment's last narrated line, Layak scripts/demo (+9 more)

### Community 50 - "tools.ts"
Cohesion: 0.09
Nodes (26): searchPlaybooks(), PLAYBOOKS, bookingLine(), cap(), caseDetail(), casesFor(), day(), DESK_OF_OWNER_ROLE (+18 more)

### Community 51 - "Sources"
Cohesion: 0.14
Nodes (27): Association of Banks in Malaysia (2017) Press Release, Annuity Monthly Instalment, Bank Negara Malaysia (2010) Property Market Measures, Bank Negara Malaysia Monthly Statistical Bulletin, Bank Negara Malaysia (2013) 35-Year Tenure Circular, Debt Service Ratio (DSR), DEFAULT_ASSUMPTIONS Panel, DSR Cap Of 40% Gross Income (+19 more)

### Community 52 - "FR-2 Case Summarization And Stall Detection"
Cohesion: 0.09
Nodes (29): Case Event Schema, Event Statuses (confirmed/provisional/disputed/superseded), FR-2 Case Summarization And Stall Detection, FR-4 Evidence Log And Multi-Party Verification, FR-6 TypeSafe Jev Structured Message Extraction, Goals And Non-Goals, JevMeta (source/stale/latencyMs), Jev Choice / Score / Noul Primitives (+21 more)

### Community 53 - "Data Retention"
Cohesion: 0.20
Nodes (14): AMLA 2001 s17 (6 Years, Not Applicable To Developers), booking_removals Minimal Deletion Audit, Companies Act 2016 (Act 777) s245(3), Data Retention, DELETE /api/bookings/:id, Housing Development (Control and Licensing) Act 1966, ImportMovedOnError (409), imports Table (Undoable Spreadsheet Import) (+6 more)

### Community 54 - "forecast() projects forward"
Cohesion: 0.29
Nodes (5): forecast() projects forward, Forecast document card (Open Document, Ask MortarAI), Forecast document stack (#54/#61, chips, above headline figures), leakage() counts backward, Manager Suggestions view

### Community 55 - "PersonaRoute.tsx (route guard)"
Cohesion: 0.11
Nodes (20): AppErrorBoundary, App shell area, canPersonaOpen, frontend/src/App.tsx (routes), frontend/src/main.tsx (providers), frontend/index.html (fonts, FOUC theme script), frontend/src/components/layout/, LINK_COLUMNS in AppFooter.tsx (+12 more)

### Community 56 - "Hugeicons by Halal Lab"
Cohesion: 0.18
Nodes (10): Canvas UI shadcn Registry Install, Hugeicons by Halal Lab, Hugeicons Agent Skill (npx skills add), Hugeicons CDN Icon Font (use.hugeicons.com), Hugeicons MCP Server, Hugeicons Stroke Rounded Free Style, Iconsax, from the Vuesax team, Iconsax Free Set: 7,140 icons in six styles (+2 more)

### Community 57 - "proxyClient.ts"
Cohesion: 0.16
Nodes (23): AnthropicContentBlock, AnthropicMessageResponse, argmax(), assertNever(), buildAnswer(), buildAnswers(), buildChoiceAnswer(), buildNoulAnswer() (+15 more)

### Community 58 - "assistant/index.ts"
Cohesion: 0.07
Nodes (41): ASSISTANT_TIMEOUT_MS, callGemini(), GeminiContent, GeminiFunctionCall, GeminiOptions, GeminiPart, GeminiResponse, isAbort() (+33 more)

### Community 59 - "Front-End Simulation"
Cohesion: 0.12
Nodes (17): First Build, Forecast And Backtest, Front-End Simulation, Generator, How The Simulation Works, Legal And Domain Notes, Messages And Proposed Updates, Open Questions (+9 more)

### Community 60 - "API Reference"
Cohesion: 0.08
Nodes (44): API Reference, Application State Derivation, Second Undecided Application To Same Bank (409), Case Derivation Rules, frontend/src/components/case/CaseQuickView.tsx, CaseSummary, Event Status: disputed, Event Model And Evidence Lifecycle (+36 more)

### Community 61 - "Gotcha: manager workflows"
Cohesion: 0.16
Nodes (19): canManageTaskStatus (exact owner name and department, Manager override, booking must be accessible), CaseQuickView.tsx (side sheet), currentCaseAssignee recipient resolution, Decisions For You (Manager's queue of overdue cases not yet followed up), Flagged department tasks (persist, notification bell, 30 s refresh), Follow-Ups You Sent, Manager's home is Today (/chase), Trigger at 150% of expected duration (+11 more)

### Community 62 - "Questions To Expect"
Cohesion: 0.14
Nodes (17): 9. Adoption — A, 1:30, Do Not Say, Do Not Say: We Increased Conversion, Saved Inventory Days Or Brought Cash Forward, Do Not Say: Receiving A Document Approves A Loan Or Recovers A Sale, Do Not Say: The Forecast Is AI, Do Not Say: IFCA Is Chin Hin's System, Do Not Say: Completing A Task Verifies A Milestone, Claim: 21 Expected Signings, Range 17–25 (+9 more)

### Community 63 - "precompute.ts"
Cohesion: 0.05
Nodes (44): JevCache, JevCacheEntry, JevKind, ScoreAnswer, cache, caseData, client, CollectingCache (+36 more)

### Community 64 - "jev/package.json"
Cohesion: 0.10
Nodes (20): dependencies, @mortar/core, @typesafe-ai/sdk, devDependencies, @types/node, typescript, vitest, exports (+12 more)

### Community 65 - "slides/render.mjs (Slide PNG Renderer)"
Cohesion: 0.12
Nodes (16): Scale 1440x900 to 1728x1080, Capture Normalization to 1920x1080, DEMO_DECK (docs/demo/mortar-pitch-deck.html), Pitch-deck HTML for slides/render.mjs, DEMO_SLIDES (""), name:seconds tokens; @capture marks the capture position, Execution Commands, docs/demo/mortar-pitch-deck.html (+8 more)

### Community 66 - "server/package.json"
Cohesion: 0.10
Nodes (20): bun-types, @mortar/jev, dependencies, @mortar/core, @mortar/jev, devDependencies, bun-types, typescript (+12 more)

### Community 67 - "dependencies"
Cohesion: 0.08
Nodes (25): dependencies, class-variance-authority, clsx, date-fns, framer-motion, lucide-react, @mortar/core, radix-ui (+17 more)

### Community 68 - "Know The Company"
Cohesion: 0.18
Nodes (19): Mortar (product), 2. The Business — A, 1:30, Chang Tze Yoong (Group CEO, Property Division), CHGP Developments: Dawn, Avantro, Crown, Aricia, Ayanna, Botanica Hills, Chin Hin Group Berhad (Wider Group), Chin Hin Group Property Berhad (CHGP), Claim: RM2.2 Billion Unbilled Sales, 30 June 2026, Avoid: RM5.41 Billion Group Order Pipeline (Not Property Bookings) (+11 more)

### Community 69 - "ProfileMenu.tsx"
Cohesion: 0.14
Nodes (13): ProfileMenu(), who(), LocationProbe(), mocks, renderMenu(), DESK_LABELS, DropdownMenu(), DropdownMenuContent (+5 more)

### Community 70 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, jsdom, tailwindcss, @tailwindcss/vite, @testing-library/react, @types/react, @types/react-dom, typescript (+3 more)

### Community 71 - "speak.py"
Cohesion: 0.16
Nodes (9): chatterbox_cache_path(), chatterbox_runtime(), ChatterboxRenderer, in_chatterbox_venv(), KokoroRenderer, main(), render_batch(), renderer_factory() (+1 more)

### Community 72 - "MotionSites: cinematic landing page prompts"
Cohesion: 0.21
Nodes (7): Glass Object (Three.js effect), MotionSites: cinematic landing page prompts, MotionSites Academy Lessons, MotionSites MCP Server, Landing Video Pipeline, The Agent's Video Checklist, gemini-watermark-remover by GargantuaX

### Community 73 - "Profile Menu"
Cohesion: 0.14
Nodes (24): App Shell, Authentication Theatre, Brand Mark (Kigumi Joint), ChevronsUpDown Glyph, Footer Specification, Footer Bottom Bar, Footer Brand Column, Footer Link Columns (+16 more)

### Community 74 - "LegalQueueTable.tsx"
Cohesion: 0.16
Nodes (16): appointmentDate(), firmLoad, LEGAL_FIRST_DIR, LegalSortKey, median(), sortLegalRows(), sortValue(), appointmentDate() (+8 more)

### Community 75 - "POST /api/assistant"
Cohesion: 0.21
Nodes (17): assistant/tools.ts (five read-only tools), find_bookings tool, get_case tool, get_forecast_summary tool, get_my_queue tool, POST /api/assistant, Scripted askBrain Answers, Grounded Operational Assistant (Ask MortarAI) (+9 more)

### Community 76 - "CaseSummary"
Cohesion: 0.07
Nodes (48): Task 3: Unit States And Release Review, Task 6: Shared Inventory In Add Bookings, Review Focus, Rulings Carried From The Spec, Sales Chart Plan 2: The Page And The Grid, Task 1: Chart Helpers, Task 2: The Grid, Task 4: Numbering In Settings (+40 more)

### Community 77 - "narrate.sh (Voice + Schedule + Subtitles)"
Cohesion: 0.09
Nodes (22): Narration Beat Anchoring, A Beat Marks When a Moment Appears, $DEMO_DIR/beats.json, beats.json Rewrite so Slide Names Are Narratable Beats, Deck Foot-Lines Would Sit Under Burned Captions, DEMO_MUTE_SEG_MS (900), Max picture kept for a beat with no narration, DEMO_SEGMENTS (synthesize) (+14 more)

### Community 78 - "Preserved Technical Cautions"
Cohesion: 0.11
Nodes (15): case_overview Beat, /bookings/BK-9001 loan and legal tracks, evidence provenance, Clean-Seed Check, Delete Demo Data Intentionally Keeps Filming Edits, Disable MKL-DNN Before Chatterbox Import, DEMO_WEB (required), Disposable deployment to film, Force SDPBackend.MATH (+7 more)

### Community 79 - "Mortar Workspace Engine (Bookings Ledger, Today Queue, Forecast Engine)"
Cohesion: 0.17
Nodes (20): Beneficiaries Who Do Not Log In (Finance, Sales Director), Centralized Case Workspace, What The Daily Users Have In Common, Four Daily Users, Decisions For You, Deliberately Not Users (buyers, agents, bankers, solicitors), Desk Health, Legal Operations (Arvind Raj, /legal) (+12 more)

### Community 80 - "assistant.test.ts"
Cohesion: 0.11
Nodes (18): App, APPLICATIONS, ask(), BOOKING, chipsFor(), event(), EVENTS, fakeJev() (+10 more)

### Community 81 - "Desk Colours"
Cohesion: 0.19
Nodes (15): Booking Row And Table Header, Colour, Desk Colours, Do And Do Not, Landing Sample Ledger, Primitives: paper Ramp, Stage Tracker, Status Tone: danger / At risk (+7 more)

### Community 82 - "readSheetFile.test.ts"
Cohesion: 0.14
Nodes (13): DropZone(), accept(), clear(), readableSize(), readSheetFile(), sheetKind(), SheetReadError, DEFAULTS (+5 more)

### Community 83 - "Non-Functional Requirements"
Cohesion: 0.11
Nodes (28): Scripted askBrain Fallback, Demo Script As Acceptance, Design Standards Compliance, Direct Core ERP Integration (Out Of Scope), FR-12 High-Availability Offline Jev Fallback, FR-18 Jev Through A Local Model Proxy, FR-23 Ask MortarAI Grounded Assistant, Gemini-Powered Assistant Service (+20 more)

### Community 84 - "askBrain (scripted fallback)"
Cohesion: 0.29
Nodes (7): askBrain (scripted fallback), brain/helpers.ts isOpen filter, brain.test.ts pins Ask's stalled set, deriveCase (computes open and live), HORIZON_DAYS (30), MIN_COVERAGE, stallReasons (derived from open)

### Community 85 - "How It Works section"
Cohesion: 0.09
Nodes (33): Funnel: booking fee to bank disbursement, 6 funnel stages tracked, Settings: demo dataset controls (seed, reference date, record counts), Closed Excel export from /bookings, Funnel stage 6: Bank disburses progressively, Funnel stage 3: Letter of Offer, Funnel stage 5: Loan agreement (panel solicitor), Funnel stage 2: Loan application(s), several banks at once (+25 more)

### Community 86 - "CaseEvent"
Cohesion: 0.04
Nodes (8): AssignmentAccessContext, CaseEvent, EvidenceStatus, IsoDateTime, LoanApplication, Task, FakeDb, FakeDb

### Community 87 - "record.mjs"
Cohesion: 0.10
Nodes (15): css, auditCapture(), REQUIRED_BEATS, beats, errors, filmed, OUT, require (+7 more)

### Community 88 - "patch_docs.py"
Cohesion: 0.14
Nodes (15): Agy Worker Doc Patching, New Document Or Large Rewrite Extraction, patch_docs check, patch_docs finish, patch_docs prepare, Patch Workflow For Small Doc Edits, cmd_check(), cmd_finish() (+7 more)

### Community 89 - "Typeface"
Cohesion: 0.12
Nodes (19): Button Component, Checkbox Component, Field Component, Focus Ring, font-display: Swap, Geist, Geist Mono, Public-Page Radius Steps (2xl/3xl) (+11 more)

### Community 90 - "Acceptance Criteria (14)"
Cohesion: 0.14
Nodes (18): Acceptance Criteria (14), Canvas Dot Grid, Elevation: Card, Bookings Bulk-Action Glass Island, Landing Page, Landing Card Elevation, Landing Chromatic Panel (.land-panel), Landing Claim (+10 more)

### Community 91 - "Markdown Style Guide"
Cohesion: 0.05
Nodes (40): Add Spacing To Headings, ATX-Style Headings, Avoid Relative Paths Unless Within The Same Directory, Better Is Better Than Best, Break Up Dense Text, Capitalization, Capitalization Of Titles And Headers, Character Line Limit (+32 more)

### Community 92 - "Technical Requirements Document: Mortar"
Cohesion: 0.07
Nodes (46): Data Retention section (docs/TRD.md#data-retention), Technical Requirements Document (docs/TRD.md), Architecture And Components, Architecture Topology Diagram, Bun Multi-Package Monorepo, bun run test (Vitest), Bun HTTP Server On Render, packages/core/src/jev.ts MiniSearch Playbook Helpers (+38 more)

### Community 93 - "Design Research: Layerhand Landing Page"
Cohesion: 0.18
Nodes (12): Design Research Index, Canvas UI: 35 WebGL/WebGPU effects over live HTML, David Haz, author of Canvas UI and React Bits, html-in-canvas API, Peel Effect, Its Hover layers-icon Component Pattern, Jakub Antalik Portfolio Study, libraries.dev: UI libraries for AI agents (+4 more)

### Community 94 - "frontend/ Workspace"
Cohesion: 0.47
Nodes (9): Five Named Demo Profiles, frontend/src/lib/persona.tsx Persona Definitions, frontend/ Workspace, Manager Persona (Cross-Department Access), /manager Redirect To /team, Persona Home Routes, PERSONA_PAGES Route Permission Map, PersonaRoute Route Guard (+1 more)

### Community 95 - "frontend/tsconfig.json"
Cohesion: 0.20
Nodes (9): compilerOptions, jsx, lib, paths, types, exclude, extends, include (+1 more)

### Community 96 - "Pull Request Template"
Cohesion: 0.13
Nodes (12): Branch Naming Convention <type>/<short-topic>, Commit Message Format type(scope): what changed, The Journey Of A Change, When Something Breaks On The Live Site, Reviews And Merging, Steps To Reproduce, Contact Link: How We Ship Changes, How To Check It (+4 more)

### Community 97 - "core/package.json"
Cohesion: 0.12
Nodes (16): dependencies, minisearch, devDependencies, typescript, vitest, exports, typescript, vitest (+8 more)

### Community 98 - "import.ts"
Cohesion: 0.13
Nodes (27): ageOn(), checkBookingDraft(), DateOrder, detectDateOrder(), EXCEL_EPOCH, findHeader(), HEADER_NAMES, headerCandidates() (+19 more)

### Community 99 - "cases.ts"
Cohesion: 0.08
Nodes (47): managerSuggestions(), assumptions, booking, event(), snapshot(), assumptionValue(), DEFAULT_ASSUMPTIONS, ApplicationFacts (+39 more)

### Community 100 - "mappers.ts"
Cohesion: 0.11
Nodes (27): CaseData, SimulationMeta, cached(), createDatabase(), isoDate(), isoDateTime(), jsonb(), maskDigits() (+19 more)

### Community 101 - "react-router-dom"
Cohesion: 0.17
Nodes (15): App(), HomeRedirect(), MortarMark(), MortarMarkProps, AppFooter(), FooterLink, FooterLinkItem(), LINK_COLUMNS (+7 more)

### Community 102 - "tourAnchors.test.tsx"
Cohesion: 0.11
Nodes (13): buildSnapshot(), SnapshotProvider(), selectProfile(), ProfileWorkspace(), renderDetail(), renderImport(), SHEET, BASE (+5 more)

### Community 103 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 104 - "Step 1: Capture"
Cohesion: 0.13
Nodes (14): legal_persona Beat, Legal Admin persona; /legal signing queue, Capture Viewport 1440x900, $DEMO_DIR/capture.webm, $DEMO_DIR/demo.mp4, DEMO_DIR ($TMPDIR/mortar-demo), Scratch directory for captures, segments, slides and the MP4, DEMO_OUT ($DEMO_DIR/demo.mp4) (+6 more)

### Community 105 - "Case-free forecast aggregate (built from full resolved history before profile scoping)"
Cohesion: 0.24
Nodes (9): createDatabase (shared snapshot), demo_seed provenance, DEMO_WEB disposable recording env, Case-free forecast aggregate (built from full resolved history before profile scoping), meta key forecast_model_v1 (refreshed on next read after seven days), db.forgetSnapshot(), Scoped snapshot carries aggregate counts and refresh dates, not other profiles' cases, server/db/reset.ts (demo data actions) (+1 more)

### Community 106 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, lib, module, moduleResolution, noEmit (+5 more)

### Community 107 - "Harness Structure"
Cohesion: 0.18
Nodes (16): /api/snapshot, assemble.sh (Picture Timeline + Mux), Capture-Completeness Audit, contract.mjs (Beat Contract & Audit), DEMO_WARMUP (1), Set 0 to skip the clean-seed check and off-camera warm-up, Harness Structure, mark() Beat Marker (+8 more)

### Community 108 - "Music Bed"
Cohesion: 0.12
Nodes (16): Music Bed Processing (loop, fade, duck), Bundled Chromium (or DEMO_CHANNEL=chrome), Ducked Music Bed, DEMO_BGM (""), Music file; looped, faded, ducked under the voice when set, DEMO_BGM_GAIN_DB (-20), Music gain before speech-triggered ducking, DEMO_CHANNEL (unset (bundled Chromium)) (+8 more)

### Community 109 - "The Jev Boundary And Resilience"
Cohesion: 0.20
Nodes (17): Where AI Helps And Where People Decide, Aster Heights Fictional Project, Booking BK-9001 Lifecycle, Ask MortarAI, Division Of Operational Responsibility, Gemini (Google) - Ask MortarAI's Answer Engine, Illustrative Impact, Not A Finding, The Jev Boundary And Resilience (+9 more)

### Community 110 - "Mortar Notes For Agents"
Cohesion: 0.15
Nodes (16): Project Notes (docs/agents/notes.md), bun run --filter <name-or-glob> <script>, bun run format, Bun workspaces (frontend + packages/*), Conventions, docs/README.md (human quickstart), bun run --filter '*' fans root scripts out, @mortar/core shared package (no build step) (+8 more)

### Community 111 - "Getting Started"
Cohesion: 0.15
Nodes (18): Env var DATABASE_URL, .env.example copied to .env at repo root, Env var TEST_DATABASE_URL (dedicated test Postgres), Getting Started, Installation steps, Local Postgres 17 via docker run (mortar-pg), Prerequisites: Bun 1.3.14, Postgres 17, desktop browser, Schema applied and canonical dataset seeded on first boot (+10 more)

### Community 112 - "UI Triage: The Signed-In App"
Cohesion: 0.18
Nodes (4): transitions.dev: UI transitions for AI agents, R7, the Dissenting Expert, UI Triage: The Signed-In App, Four-Phase Implementation Plan

### Community 113 - "AppNav.tsx"
Cohesion: 0.18
Nodes (14): AppNav(), Crumb, ROUTE_LABELS, useBreadcrumbs(), renderNav(), getSystemTheme(), resolveTheme(), Theme (+6 more)

### Community 114 - "packages_core_src_index_casesummary"
Cohesion: 0.16
Nodes (11): buildClosedExportRows (pure, no DOM/network), buildClosedExportRows(), ClosedExportRow, closedOnDate(), CLOSING_KIND, downloadClosedExport(), exportBank(), header() (+3 more)

### Community 115 - "Bug Report Issue Form"
Cohesion: 0.15
Nodes (11): Area, Bug Report Issue Form, What You Expected, What Happened, Where: Live Site / Running Locally / Both, Area, Done When, Feature Or Change Issue Form (+3 more)

### Community 116 - "Button"
Cohesion: 0.07
Nodes (70): AddMessageForm(), defaultName(), normalTime(), ROLES, timeNow(), AFTER_SPA, BANK_OPTIONAL, BANK_REQUIRED (+62 more)

### Community 117 - "Jev (Reading Engine)"
Cohesion: 0.14
Nodes (28): MortarAI (AI layer), 10. Technology Second — B, 1 Minute, 5. Solution Logic — B, 1:30, Slide 6: How Jev Works, 6. Meet MortarAI — B, 1 Minute, Slide 6: Why It Helps, Archify (Diagramming Tool), ChatGPT (Free-Text Chatbot) (+20 more)

### Community 118 - "test_assemble.py"
Cohesion: 0.24
Nodes (7): AssembleMuxTests, AssemblePictureTests, color_video(), ff(), probe_duration(), slide_png(), write_wav()

### Community 119 - "Sales Chart: Design"
Cohesion: 0.12
Nodes (15): Acceptance, Access And Peer Visibility, Building, Delivery, Design System Exception, Figures And Filters, Grid, Out Of Scope (+7 more)

### Community 120 - "Perch Landing Teardown"
Cohesion: 0.13
Nodes (10): better-layout Skill, Perch Sign-In Teardown, isJoiner Entry-Path Check, Perch Storage Keys: perch.trip.v1, perch.theme.v1, perch.voter.v1, Perch Footer And Chrome Teardown, --foot-h Custom Property, Perch Shell Component, Mortar SiteShell Port (+2 more)

### Community 121 - "Checklist"
Cohesion: 0.10
Nodes (6): Never Do These, Pre-Commit Hook Formats Staged Files, Working With AI Coding Agents, Screenshots Or Recording, Checklist, Screenshots

### Community 123 - "Import area"
Cohesion: 0.14
Nodes (18): booking-sheet-template.xlsx/.csv, checkBookingDraft, DropZone / readSheetFile, Import area, parseCsv, readBookingSheet, Booking Fee Prohibition (Reg 11(2) 1989), ClosedExport Excel Export (+10 more)

### Community 124 - "Evidence And Assumptions"
Cohesion: 0.25
Nodes (14): 4. Evidence And Assumptions — B, 1:30, Evidence And Assumptions, Assumption: Follow-Up Lifts Stalled Bookings 20% To 40%, Assumption: Chin Hin's Leaks Follow The Survey's Order, Claim: 38% Loan Rejections, RM500k–700k Homes, 2H2025, Claim: Six To Twelve Weeks A Booking Can Hold A Unit, Claim: 5 Of 8 Say Bookings Stall At Credit Assessment, Claim: 7 Of 8 Name Loan Rejection The Biggest Cause (+6 more)

### Community 125 - "This Week. What We Need."
Cohesion: 0.07
Nodes (44): A1 — Chin Hin's Leaks Follow The Same Order (test: rebuild loss reasons from closed files), A2 — Follow-Up Lifts Stalled Bookings From 20% To 40% Signed (test: assisted cohort vs ordinary follow-up), A3 — Staff Will Paste Banker Messages In Daily (test: one admin, two weeks), A4 — Bookings Can Start From A Spreadsheet Export (test: first upload, week one), BK-9001 (booking), Forecast (expected signings with a range — page rebuilt since 20 Sep), Live Demo — mortar-d18f.onrender.com, Decisions For You (Manager's Today — follow-up when a case runs past its expected time) (+36 more)

### Community 126 - "Keep It Current"
Cohesion: 0.20
Nodes (10): Graphify, .graphifyignore, Install Line: uv tool install graphifyy[sql]==0.9.71, graphify install --platform claude, Installing Graphify, .graphify_labels.json.sig, patch_docs merge, graphifyy [sql] Extra (Reads server/db/schema.sql) (+2 more)

### Community 129 - "schema.sql"
Cohesion: 0.16
Nodes (20): booking_removals, bookings, event_reviews, event_reviews_event_idx, events, events_application_idx, events_booking_idx, events_message_idx (+12 more)

### Community 130 - "ImportPage.tsx"
Cohesion: 0.16
Nodes (19): DirectTableImport(), Entry, fakeBuyer(), newEntry(), rowId(), salesProfiles, renderAsNamedSalesProfile(), renderImport() (+11 more)

### Community 131 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, preview, template:bookings, test, typecheck

### Community 132 - "booking-template.mjs"
Cohesion: 0.17
Nodes (6): bookings, COLUMNS, howTo, merged(), OUT, SAMPLES

### Community 134 - "reset.ts"
Cohesion: 0.08
Nodes (23): proposalFromExtraction(), simNow(), JevMeta, JevService, sql, addDemoData(), applySchema(), deleteDemoData() (+15 more)

### Community 136 - "Design: Mortar (Visual Specification)"
Cohesion: 0.21
Nodes (10): docs/agents/notes.md, Mortar Agent Notes, Mortar Project Guidelines (AGENTS.md), Design: Mortar (Visual Specification), Mortar Design System In Figma, Icons, Landing Video Pipeline (superseded), Lucide (lucide-react) Icon System (+2 more)

### Community 137 - "File Map"
Cohesion: 0.09
Nodes (24): AppLayout (mounts the tour), ballInCourt (who holds a case), banks.test.ts (reversal, ledger, bank clocks), Busiest Desk shortcut, components/case/ball.ts (labels, icons, owners), ChartTooltipContent.tsx (recharts shell), .github/workflows/ci.yml, File Map (+16 more)

### Community 138 - "Gotchas"
Cohesion: 0.29
Nodes (6): DateField.tsx (shared Mortar date field), Gotchas, inlinePopover.tsx test double, bunx shadcn add <component>, SortHeader (shared sortable column header), frontend/src/components/ui/ (shadcn set)

### Community 139 - "RTK Commands By Workflow"
Cohesion: 0.14
Nodes (14): Analysis & Debug (70-90% Savings), Build & Compile (80-90% Savings), Files & Search (60-75% Savings), Git (59-80% Savings), GitHub (26-87% Savings), Golden Rule, Infrastructure (85% Savings), JavaScript/TypeScript Tooling (70-90% Savings) (+6 more)

### Community 140 - "Step 6: Request Follow-Up From Tan Mei Ling"
Cohesion: 0.31
Nodes (10): BK-9006 (Demo Booking), Decisions For You (Manager's Today), Do Not Say: Mortar Sends WhatsApp Messages, Precondition: Legal Has A No-Appointment Row; Manager Has A Suggestion, Q: What Happens When Someone Clicks Create Task?, Legal Admin Desk, Step 5: Record Appointment On BK-9006, Step 6: Request Follow-Up From Tan Mei Ling (+2 more)

### Community 141 - "Today Rail"
Cohesion: 0.18
Nodes (10): Content Canvas, Data Formats, Date Format (19 Sep 2026), Duration Formats, Money Formats, Screen Density, Stat Tile, Display/Figure (+2 more)

### Community 142 - "FR-8 Statistical Conversion Forecasting"
Cohesion: 0.11
Nodes (22): Brown, Cai & DasGupta (2001) Wilson Interval, FR-16 Leakage Analysis And Recovery Sizing, FR-8 Statistical Conversion Forecasting, FR-9 Historical Forecast Backtesting, Live And Resolved Booking Definitions, Monte Carlo 10th-90th Percentile Range, Funnel Pipeline Stages, Recoverable Share Estimate (+14 more)

### Community 143 - "packages_core_src_index_booking"
Cohesion: 0.13
Nodes (5): booking, AWAITING_DOCUMENTS, BOOKING, RISK, WITH_BANK

### Community 144 - "Project Structure tree"
Cohesion: 0.09
Nodes (42): Archify architecture diagram: staff-to-service flow and tech stack, Architecture: staff personas, web app, API, shared core, AI, database, hosting, Bun API reading Postgres, Bun API and static file serving process, Case Messages And Documents From External Parties, CI checks gate the Render deploy, 1 backend service, 2 shared packages (+34 more)

### Community 145 - "assemble.sh Mux Phase"
Cohesion: 0.11
Nodes (16): Burned Subtitles, DEMO_FFPROBE (ffprobe on PATH), ffprobe executable, DEMO_MAX_DURATION (300), Reject a deliverable longer than this many seconds, DEMO_MAX_GAP_MS (1000), Max allowed gap between consecutive spoken lines (dead-air rule), DEMO_MIN_DURATION (240) (+8 more)

### Community 146 - "notificationStore.ts"
Cohesion: 0.18
Nodes (13): Notification, NotificationPopover(), useNotifications(), emit(), Listener, listeners, loadNotifications(), notifications (+5 more)

### Community 148 - "Documents Index"
Cohesion: 0.11
Nodes (17): Contributing (.github/CONTRIBUTING.md), Design (docs/DESIGN.md), Documents Index, Feature Ideas (docs/research/feature-ideas/README.md), Markdown Style Guide (docs/markdown-style.md), Product Requirements Document (docs/PRD.md), Product Overview (docs/PRODUCT.md), Skills (docs/agents/skills.md) (+9 more)

### Community 149 - "Assistant area (server/src/assistant/)"
Cohesion: 0.24
Nodes (9): frontend/public/ai-mascot*.png, AskPanel (Dialog), AskTrigger (in AppNav), Assistant area (server/src/assistant/), 30-second budget, max 4 rounds, buildAskContext, GEMINI_API_KEY, GEMINI_MODEL (default gemini-3.5-flash-lite) (+1 more)

### Community 150 - "managerQueue.ts"
Cohesion: 0.19
Nodes (10): defaultOwnerRole(), jevStep(), nextStepFor(), stepFor(), next(), managerQueue(), recipientRole(), standingFollowUp() (+2 more)

### Community 151 - "jev/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, types, extends, include, ../../tsconfig.json

### Community 153 - "Personas"
Cohesion: 0.19
Nodes (15): Frontend Stack (React 19 + Vite + Tailwind 4 + shadcn/ui), Manager Persona (Home Route /chase), @mortar/core package, mortar.persona localStorage key, mortar.profile localStorage key, Personas, Mortar Product Definition, Route Map (+7 more)

### Community 154 - "Legal Admin (persona)"
Cohesion: 0.22
Nodes (12): BK-9006 (booking), Legal Admin (persona), SPA Drafted (workflow stage — Legal Admin · Law Firm), FR-15 SPA Execution Desk, FR-19 Record An Update, JTBD: Closing Out Appointments, JTBD: Seeing What Has Stopped, Appointment On YYYY-MM-DD Note Format (+4 more)

### Community 155 - "walk.mjs"
Cohesion: 0.27
Nodes (10): scrollDuration(), scrollTarget(), smoothScrollTo(), BUYER_REPLY, film(), MIN_BEAT_INTERVAL_MS, remainingBeatDelay(), sidebarLink() (+2 more)

### Community 156 - "See Also"
Cohesion: 0.23
Nodes (12): docs/DESIGN.md, Docs, frontend/src/globals.css (@theme tokens from DESIGN.md), docs/PRD.md, docs/PRODUCT.md, docs/TRD.md, docs/ (Non-Package), research/company-brain/simulation.md Seed Table (+4 more)

### Community 157 - "Meet MortarAI. One Reads, One Answers."
Cohesion: 0.13
Nodes (22): Apex Bank, Ask MortarAI (feature), By Hand (staff record the update), Cached Answer (asked before, reused), Live Answer (typed, with a confidence), Stale, Marked (shown with a stale tag), Gemini (Google — answers staff questions), Gemini Used For — Staff Questions, Even About A Photo Of A Bank Letter (+14 more)

### Community 158 - "Jakub Krehel's Interface Skills"
Cohesion: 0.19
Nodes (11): Jakub Krehel's Interface Skills, better-colors Skill, better-interface Skill: orchestrated review, better-typography Skill, better-writing Skill, break Skill, explain-interface Skill, interface-review Skill (+3 more)

### Community 159 - "Run Of Show"
Cohesion: 0.15
Nodes (15): Chin Hin Group Property (CHGP), Kabel DXP, Cover — Booked Is Not Sold. Signed Is., Team NexTechnologies, YEI 3.0 (Property Booking Conversion cohort), 11. This Week — All, 1:45, 1. Cover — A, 45 Seconds, 3. The Workflow Today — A, 1:30 (+7 more)

### Community 160 - "server/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, types, extends, include, ../tsconfig.json

### Community 161 - "subtitles.py"
Cohesion: 0.25
Nodes (7): build(), cards(), ts(), wav_ms(), wrap(), pack(), walk()

### Community 162 - "Functional Requirements"
Cohesion: 0.21
Nodes (22): Manager (persona), Ask Mortar Renamed To Ask MortarAI, Decisions For You (Manager Today Queue), Forecast Document Stack (#54), Forecast Documents Panel Removed, FR-14 Persona Navigation And Page Routing, FR-24 Guided Walkthrough, Functional Requirements (+14 more)

### Community 163 - "Andrej Karpathy Skills"
Cohesion: 0.29
Nodes (6): Andrej Karpathy Skills (docs/agents/andrej-karpathy-skills.md), 1. Think Before Coding, 2. Simplicity First, 3. Surgical Changes, 4. Goal-Driven Execution, Andrej Karpathy Skills

### Community 164 - "Ask The Graph First"
Cohesion: 0.29
Nodes (6): graphify affected, graphify explain, graphify god-nodes, GRAPH_REPORT.md, graphify path, graphify query

### Community 170 - "ChaseCard.test.tsx"
Cohesion: 0.24
Nodes (4): NextStep, booking(), jevMove(), renderCard()

### Community 172 - "Jev (packages/jev/, classifies and proposes)"
Cohesion: 0.28
Nodes (8): createJevService / systemOne surface, createProxySystemOne (Jev proxy client), .env.example (empty-not-commented convention), Jev (packages/jev/, classifies and proposes), Jev Suggests: <Step> Instead, nextStep.ts (one next step per case), search_playbooks tool, stepToTask

### Community 173 - "The One Rule: a booking is never counted as cash at face value"
Cohesion: 0.31
Nodes (7): 48-hour screening of every booking, Forecast accuracy score sentence, Forecast supporting document stack, Route /forecast, Screenshot: the forecast of projected signings, Stage conversion rate forecast, Forecast view: where bookings died

### Community 174 - ".prettierrc.json"
Cohesion: 0.29
Nodes (6): overrides, printWidth, $schema, semi, singleQuote, trailingComma

### Community 175 - "Agent Rules"
Cohesion: 0.19
Nodes (7): GitHub Issues And Pull Requests (docs/agents/github.md), Graphify (docs/agents/graphify.md), RTK (docs/agents/rtk.md), Agent Rules, Before Opening A Pull Request, Before Opening An Issue, GitHub Issues And Pull Requests

### Community 177 - "ChartTooltipContent.tsx"
Cohesion: 0.28
Nodes (6): ChartTooltipContentProps, TooltipEntry, currencyFormatter, formatCurrency(), formatTooltipCurrency(), numberFormatter

### Community 178 - "packages_core_src_index_task"
Cohesion: 0.22
Nodes (4): BOOKING, RISK, SUMMARY, TASK

### Community 179 - "core/tsconfig.json"
Cohesion: 0.50
Nodes (3): extends, include, ../../tsconfig.json

### Community 180 - "FR-7 Next Action, Playbook Fit And Buyer Signals"
Cohesion: 0.36
Nodes (8): Buyer Signals (responsiveness/hesitation), Assistant Read-Only Tool Set, FR-20 Message Timing And Buyer Response, FR-7 Next Action, Playbook Fit And Buyer Signals, JTBD: Guidance Retrieval, MiniSearch Playbook Index, sentAt Validation And Clock Skew, US-12 Playbook Knowledge Retrieval

### Community 182 - "Mortar Pitch Script"
Cohesion: 0.43
Nodes (6): mortar-pitch-deck.html (Slide Deck, Speaker Notes On N), mortar-pitch-deck.pdf (Backup Deck), Kabel DXP Weekly Check-In, 29 September 2026, Mortar Pitch Script, Prep: Ten Minutes Before — Deck Full Screen, PDF And App Tab As Fallback, Speakers

### Community 184 - "ref_vitest"
Cohesion: 0.09
Nodes (6): MOCK_COUNTS, task, RISK, LEAKAGE, renderLanding(), @testing-library/react

### Community 192 - "Gotcha: shared settings and inventory"
Cohesion: 0.50
Nodes (3): blockPrefix legacy read alongside blocks, Inventory API (held project/unit pairs, no buyer names), Project settings (server-held, Manager-only)

### Community 193 - "vite.config.ts"
Cohesion: 0.40
Nodes (3): @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 205 - "schedule.py"
Cohesion: 0.47
Nodes (3): deconflict(), duration_ms(), main()

### Community 207 - "frontend/package.json"
Cohesion: 0.08
Nodes (23): @mortar/core, typescript, vitest, license, name, private, type, clsx (+15 more)

### Community 232 - "sim.ts"
Cohesion: 0.08
Nodes (42): Global Constraints, Unit States, canonicalSnapshot(), addFarahOverdueExample(), addSalesTodayOverdueExamples(), backtest(), FUNNEL_STAGES, groupBy() (+34 more)

## Ambiguous Edges - Review These
- `Kabel DXP Weekly Check-In, 29 September 2026` → `Chin Hin Group Property Berhad (CHGP)`  [AMBIGUOUS]
  docs/demo/pitch-script.md · relation: conceptually_related_to
- `GET /api/settings` → `meta Key-Value Table`  [AMBIGUOUS]
  docs/TRD.md · relation: references
- `meta Key-Value Table` → `PUT /api/settings (Manager Only)`  [AMBIGUOUS]
  docs/TRD.md · relation: references
- `Do Not Say: IFCA Is Chin Hin's System` → `Claim: 7 Of 8 Name Loan Rejection The Biggest Cause`  [AMBIGUOUS]
  docs/demo/pitch-script.md · relation: conceptually_related_to

## Knowledge Gaps
- **914 isolated node(s):** `$schema`, `printWidth`, `singleQuote`, `semi`, `trailingComma` (+909 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1277 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **46 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Kabel DXP Weekly Check-In, 29 September 2026` and `Chin Hin Group Property Berhad (CHGP)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `GET /api/settings` and `meta Key-Value Table`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `meta Key-Value Table` and `PUT /api/settings (Manager Only)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `Do Not Say: IFCA Is Chin Hin's System` and `Claim: 7 Of 8 Name Loan Rejection The Biggest Cause`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `AGENTS.md` connect `Personas` to `Project Structure tree`, `About The Project section`, `Documents Index`, `Agent Rules`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Why does `Documents Index` connect `Documents Index` to `Andrej Karpathy Skills`, `Mortar Notes For Agents`, `Agent Rules`, `Personas`, `Technical Requirements Document: Mortar`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Why does `Graphify (docs/agents/graphify.md)` connect `Agent Rules` to `Documents Index`, `Keep It Current`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._