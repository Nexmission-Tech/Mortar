# Graph Report - Mortar  (2026-10-11)

## Corpus Check
- 396 files · ~340,121 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 8, .css 3, .example 1)

## Summary
- 4715 nodes · 13203 edges · 220 communities (172 shown, 48 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 983 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1cd82044`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- nextStep.ts
- api.ts
- ChasePage.tsx
- cn
- BookingsTable.tsx
- Deployment Workflow
- jev_answers Table (Model Answer History)
- Industry Practitioner Survey (n=8)
- mockSnapshot.ts
- Approved Glyph List
- CaseQuickView.tsx
- package.json
- db/index.ts
- Financing-Risk Method
- FakeDb
- generate.ts
- Environment Configuration
- A Company Brain For Booking-To-SPA Conversion
- BookingsPage.tsx
- brain.test.ts
- TourProvider.tsx
- frontend/index.html (Vite SPA Entry Document)
- Ask MortarAI (Gemini assistant)
- check Job
- questions.ts
- GET /api/snapshot
- src/projectSettings.ts
- lucide-react
- SalesChartPage.tsx
- Mortar Brief
- better-accessibility Skill: reduced motion, zoom, autoplay
- persona.tsx
- Industry Practitioner Survey Findings, n = 8
- About The Project section
- MessagesPanel.tsx
- Five named demo profiles behind the four personas
- Desk Colours
- RecordUpdateForm.tsx
- Live Walkthrough
- Capture Beat Sequence
- ref_vitest
- Persona: Legal Admin (home /legal)
- core/src/index.ts
- RecordUpdateForm.test.tsx
- Backtest Validation
- banks.test.ts
- User Stories Per Screen
- json
- Mortar Demo Recorder
- PersonaProvider
- Sources
- FR-2 Case Summarization And Stall Detection
- Data Retention
- forecast() projects forward
- PersonaRoute.tsx (route guard)
- better-ui Skill: surfaces, icons, motion values
- proxyClient.ts
- tools.ts
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
- SalesChartBuilding.tsx
- devDependencies
- speak.py
- LandingPage.tsx
- App Shell
- lib/projectSettings.ts
- POST /api/assistant
- units.ts
- narrate.sh (Voice + Schedule + Subtitles)
- Preserved Technical Cautions
- Mortar Workspace Engine (Bookings Ledger, Today Queue, Forecast Engine)
- react-router-dom
- Status Language
- packages_core_src_index_booking
- Non-Functional Requirements
- generate() Stage-Transition Monte Carlo
- How It Works section
- CaseEvent
- SalesChartGrid.tsx
- patch_docs.py
- Typeface
- Landing Page
- Markdown Style Guide
- Technical Requirements Document: Mortar
- Design Research: Layerhand Landing Page
- chase.ts
- frontend/tsconfig.json
- Pull Request Template
- core/package.json
- import.ts
- case/ball.ts
- Synthetic Data Guarantee
- record.mjs
- WaitingOn.tsx
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
- useTheme.tsx
- closedExport.ts
- Bug Report Issue Form
- Button
- Jev (Reading Engine)
- test_assemble.py
- Sales Chart: Design
- Perch Landing Teardown
- Checklist
- Gotcha: named profiles define data access
- Import area
- Acceptance Criteria (14)
- This Week. What We Need.
- Keep It Current
- BatchSpeechTests
- schema.sql
- Design: Mortar (Visual Specification)
- scripts
- booking-template.mjs
- ChaseCard.test.tsx
- core/src/jev.ts
- File Map
- Gotchas
- RTK Commands By Workflow
- Mortar (product)
- Today Rail
- FR-8 Statistical Conversion Forecasting
- canUseWebGL
- Project Structure tree
- assemble.sh Mux Phase
- notificationStore.ts
- Documents Index
- Assistant area (server/src/assistant/)
- Five Named Demo Profiles
- jev/tsconfig.json
- NarrateTests
- Personas
- app.ts
- Plain Language
- Mortar (Product Requirements)
- Meet MortarAI. One Reads, One Answers.
- Jakub Krehel's Interface Skills
- Slide Talk Track
- server/tsconfig.json
- subtitles.py
- Functional Requirements
- Andrej Karpathy Skills
- Ask The Graph First
- FR-7 Next Action, Playbook Fit And Buyer Signals
- The Business — A Booking Is A Promise. A Signed SPA Is A Sale.
- askBrain (scripted fallback)
- .prettierrc.json
- Agent Rules
- formatters.ts
- 11. This Week — All, 1:45
- core/tsconfig.json
- Jakub Antalik Portfolio Study
- SubtitleLayoutTests
- The One Rule: a booking is never counted as cash at face value
- Booking
- MotionSites: cinematic landing page prompts
- assemble.sh
- vite.config.ts
- schedule.py
- frontend/package.json
- narrate.sh
- types.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 170 edges
2. `Button` - 99 edges
3. `react` - 93 edges
4. `lucide-react` - 61 edges
5. `@testing-library/react` - 60 edges
6. `usePersona()` - 58 edges
7. `Booking` - 58 edges
8. `react-router-dom` - 57 edges
9. `CaseEvent` - 56 edges
10. `CaseSummary` - 56 edges

## Surprising Connections (you probably didn't know these)
- `Acceptance` --references--> `CaseQuickView()`  [INFERRED]
  docs/research/sales-chart/README.md → frontend/src/components/bookings/CaseQuickView.tsx
- `What It Shows` --references--> `CaseQuickView()`  [INFERRED]
  docs/research/sales-chart/README.md → frontend/src/components/bookings/CaseQuickView.tsx
- `Task 7: Docs, Verification And The Pull Request` --references--> `scopeSnapshot()`  [INFERRED]
  docs/research/sales-chart/plan-1-core.md → packages/core/src/profiles.ts
- `Global Constraints` --references--> `generateDataset()`  [INFERRED]
  docs/research/sales-chart/plan-1-core.md → packages/core/src/sim/generate.ts
- `Run bun run check Then bun run format` --semantically_similar_to--> `Run The Checks Locally Before Pushing`  [INFERRED] [semantically similar]
  AGENTS.md → .github/CONTRIBUTING.md

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

## Communities (220 total, 48 thin omitted)

### Community 0 - "nextStep.ts"
Cohesion: 0.17
Nodes (14): MOVE_OWNER, CaseNextStep, CreateTaskPayload, defaultOwnerRole(), jevStep(), nextStepFor(), stepFor(), stepToTask() (+6 more)

### Community 1 - "api.ts"
Cohesion: 0.08
Nodes (26): EXTRACTION, MESSAGE, PROPOSAL, EXTRACTION, MESSAGE, PROPOSAL, renderPanel(), ApiError (+18 more)

### Community 2 - "ChasePage.tsx"
Cohesion: 0.08
Nodes (69): Task 3: The Page, Route, Navigation And Tour, App(), HomeRedirect(), ApplicationsCard(), formatRmCompact(), assignedTasksFor(), defaultOwnerFilter(), dueTodayCount() (+61 more)

### Community 3 - "cn"
Cohesion: 0.08
Nodes (44): BookingFilters(), DateField(), monthOf(), toDate(), toIso(), ProfileMenu(), who(), ProfileAvatar() (+36 more)

### Community 4 - "BookingsTable.tsx"
Cohesion: 0.08
Nodes (62): BookingsTable(), PILL_STAGES, WIDTHS, EvidenceLog(), SOURCE_LABELS, TRACK_LABELS, WaitingOnCell(), formatPercent() (+54 more)

### Community 5 - "Deployment Workflow"
Cohesion: 0.13
Nodes (25): Build And Start Step, bun run check (ESLint + tsc + Vitest), bun run format (Prettier, 80-Column Markdown), CI Gate Before Render Deploys, CI Postgres 17 Service Container, Continuous Integration, DATABASE_URL / TEST_DATABASE_URL / GEMINI_API_KEY / TYPESAFE_API_KEY, Deploy And CI (+17 more)

### Community 6 - "jev_answers Table (Model Answer History)"
Cohesion: 0.13
Nodes (36): packages/core/src/jev.ts MiniSearch Playbook Helpers, Fallback And Caching Ladder, Fallback Ladder Flow Diagram, GET /api/bookings/:id/playbooks, Input Hash: SHA-256 Of Canonical {kind, state, questionVersion}, jev_answers Table (Model Answer History), server/fixtures/jev-cache.json Precomputed Answers, Jev Fan-Out Pipeline Diagram (+28 more)

### Community 7 - "Industry Practitioner Survey (n=8)"
Cohesion: 0.36
Nodes (8): Booking Leakage, Evidence From Research And Industry, Inventory Lock, Ranked Causes Of Booking Leakage, Official And Industry Benchmarks, PJD Regency Sdn Bhd v Tribunal Tuntutan Pembeli Rumah (2021), Industry Practitioner Survey (n=8), The Problem And Its Cost

### Community 8 - "mockSnapshot.ts"
Cohesion: 0.08
Nodes (22): LocationProbe(), mocks, renderMenu(), row(), waiting(), defaultData(), mocks, provisionalEvent() (+14 more)

### Community 9 - "Approved Glyph List"
Cohesion: 0.12
Nodes (25): ArrowUpRight Glyph, Calendar Replacement For Native Date Input, ChevronsUpDown Glyph, Date Format (19 Sep 2026), Day Cell And Date Picker, Dialog Component, Drop Zone, Elevation: Card Hover (+17 more)

### Community 10 - "CaseQuickView.tsx"
Cohesion: 0.13
Nodes (26): CaseHeader(), CaseQuickView(), CaseJourney(), WaitingOnPanel(), formatDate(), formatDays(), formatDaysLong(), formatRm() (+18 more)

### Community 11 - "package.json"
Cohesion: 0.05
Nodes (45): isOff(), typescriptFiles, warnings(), description, devDependencies, concurrently, eslint, eslint-config-prettier (+37 more)

### Community 12 - "db/index.ts"
Cohesion: 0.04
Nodes (65): normalizeProjectSettings(), CaseData, Playbook, SimulationMeta, BookingMovedOnError, cached(), createDatabase(), ImportMovedOnError (+57 more)

### Community 13 - "Financing-Risk Method"
Cohesion: 0.17
Nodes (30): TenureYears = min(35, 70 - age), Approval Probability 0.62 Bridging REHDA And Benchmarks, Bank Application Chains (1-3 Per Booking), BNM Margin Rules (Nov 2010), BNM 35-Year Tenure Cap (Jul 2013), Debt Service Ratio Formula, DEFAULT_ASSUMPTIONS Parameter Table, financingRisk() Advisory Credit Flag (+22 more)

### Community 15 - "generate.ts"
Cohesion: 0.10
Nodes (37): Task 2: Unique Demo Units, stamp(), clamp01(), DISPUTABLE, DOCUMENT_POOL, drawPrice(), drawUnit(), generateDataset() (+29 more)

### Community 16 - "Environment Configuration"
Cohesion: 0.08
Nodes (31): Base (Impractically Slow Without GPU), Nano as CPU Default, chatterbox-requirements.txt, Chatterbox TTS Install (Optional Cloned Voice), Turbo (Larger Model), CHATTERBOX_CACHE ($CHATTERBOX_HOME/cache), Content-addressed cache of synthesized lines, CHATTERBOX_HOME (~/.local/share/mortar-demo/chatterbox) (+23 more)

### Community 17 - "A Company Brain For Booking-To-SPA Conversion"
Cohesion: 0.11
Nodes (19): 10. A Short Learning Path, 11. Questions To Resolve With The Company, 1. What A Central Company Brain Should Mean Here, 2. Open-Source Projects Worth Learning From, 3. Overall Platform Concept, 4. How The Parts Connect, 5. Turning Staff Experience Into Reusable Knowledge, 6. Does A Knowledge Graph Help? (+11 more)

### Community 18 - "BookingsPage.tsx"
Cohesion: 0.08
Nodes (32): BookingFilter, BookingFiltersProps, RISKS, View, BookingPipelineFlow(), BookingPipelineFlowProps, PipelineCounts, PipelineSelection (+24 more)

### Community 19 - "brain.test.ts"
Cohesion: 0.13
Nodes (19): ctx, askBrain(), buildAskContext(), contentWords(), coverage(), matchQuestion(), questionIndex(), STOPWORDS (+11 more)

### Community 20 - "TourProvider.tsx"
Cohesion: 0.15
Nodes (16): AppLayout(), AppLayoutProps, AppShell(), Rect, Spotlight(), resolveRoute(), Harness(), mocks (+8 more)

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
Cohesion: 0.10
Nodes (26): count(), days(), isLive(), isOpen(), joinList(), percent(), ringgit, rm() (+18 more)

### Community 25 - "GET /api/snapshot"
Cohesion: 0.14
Nodes (32): POST /api/bookings/import, GET /api/snapshot, bookings.created_at Entry Time Semantics, bookings Table, Event Status: confirmed, packages/core/src/types.ts Domain Contract, currentCaseAssignee Responsibility Resolution, Data Model And Schema (+24 more)

### Community 26 - "src/projectSettings.ts"
Cohesion: 0.14
Nodes (12): Global Constraints, Review Focus, Sales Chart Plan 1: Core And Server, Task 1: Numbering And Layout, Task 4: Scoped Units In The Snapshot, Task 7: Docs, Verification And The Pull Request, ReadSheetOptions, DEFAULT_UNIT_MODELS (+4 more)

### Community 27 - "lucide-react"
Cohesion: 0.08
Nodes (42): blockerQuery(), FIT_PRESENTATION, PlaybooksPanel(), Ranked, STATUS_BADGES, HeadingNote(), SignalsPanel(), progressFromKinds() (+34 more)

### Community 28 - "SalesChartPage.tsx"
Cohesion: 0.09
Nodes (28): quickViewRow(), BuildingBoundary, activeUnsigned(), bookedAndSigned(), CHART_FILTERS, ChartFilter, legendCounts(), litUnits() (+20 more)

### Community 29 - "Mortar Brief"
Cohesion: 0.06
Nodes (31): A Day In Mortar, Competition Rounds, Constraints, How Do You Know It Worked?, How Mortar Answers The Brief, Interview Ground Rules, Interview Questions, Mortar Brief (+23 more)

### Community 30 - "better-accessibility Skill: reduced motion, zoom, autoplay"
Cohesion: 0.29
Nodes (5): better-accessibility Skill: reduced motion, zoom, autoplay, WCAG 2.2.2 Autoplay Pause Requirement, Gemini Videos Composer at gemini.google.com/videos, HeroFilm Two-Element Crossfade, reels.json Manifest and GCS Base URL

### Community 31 - "persona.tsx"
Cohesion: 0.11
Nodes (27): AppSidebar(), AppSidebarProps, NavGroup(), NavLink(), PAGE_ICONS, SectionHeading(), PersonaRoute(), renderSidebar() (+19 more)

### Community 32 - "Industry Practitioner Survey Findings, n = 8"
Cohesion: 0.11
Nodes (19): Feature Ideas: written up but not built, 48-Hour Clean Exit, Early Financing Eligibility Check, LAD Burn Clock, Learned Durations and On-Time Follow-Ups, Mortgage Rescue Engine, PJD Regency 2021 Late-Delivery Damages Ruling, REHDA Rejection and Fall-Through Figures, unsourced (+11 more)

### Community 33 - "About The Project section"
Cohesion: 0.13
Nodes (25): About The Project section, Acknowledgements: YEI 3.0/Kabel, Chin Hin Group, shadcn/ui, Radix UI, Lucide, Booking conversion challenge, Chin Hin Group, Design Spec (DESIGN.md), Hero banner, Illustrative RM24M of phantom reported sales, Interview (source/interview.md) (+17 more)

### Community 34 - "MessagesPanel.tsx"
Cohesion: 0.07
Nodes (40): STATUS_TONES, APPLICATION_STATUS_LABELS, DOCUMENT_LABELS, EVENT_KIND_LABELS, EXTRACTED_EVENT_LABELS, formatDateTime(), NEXT_ACTION_LABELS, SENDER_ROLE_LABELS (+32 more)

### Community 35 - "Five named demo profiles behind the four personas"
Cohesion: 0.13
Nodes (25): @mortar/core domain rules: stage tracking, risk flags, Today queue, risk-weighted forecast, 15 API routes, 4 personas (measured count), 5 demo profiles (measured count), Decisions For You: the Manager's overdue cases, then escalation, Features section, Five named demo profiles behind the four personas, Four personas switched in the header (+17 more)

### Community 36 - "Desk Colours"
Cohesion: 0.25
Nodes (11): BriefcaseBusiness Glyph, Desk Colour: Legal Admin, Desk Colour: Loan Admin, Desk Colour: Manager, Desk Colour: Sales Admin, Desk Colours, Handshake Glyph, Landmark Glyph (+3 more)

### Community 37 - "RecordUpdateForm.tsx"
Cohesion: 0.07
Nodes (49): AFTER_SPA, BANK_OPTIONAL, BANK_REQUIRED, CONFIRM, DECIDED, DECISIONS, DOCUMENTS, GROUPS (+41 more)

### Community 38 - "Live Walkthrough"
Cohesion: 0.14
Nodes (26): 7. Live Walkthrough — C, 7 Minutes, Before You Present, BK-9001 (Demo Booking), Contingency: The App Will Not Load → Walk Slide 7 From Screenshot, Contingency: Ask MortarAI Says Counted From Your Bookings, Contingency: Jev Is Slow Or Wrong → Use Record An Update, Contingency: Receipt Already Confirmed → Reset Shared Data, mortar-pitch-deck.html (Slide Deck, Speaker Notes On N) (+18 more)

### Community 39 - "Capture Beat Sequence"
Cohesion: 0.07
Nodes (29): banker_message Beat, Banker's mixed Malay/English message; payslip missing, buyer_reply Beat, Pasted Malay buyer reply; Jev answers Documents Received, case_cleared Beat, Outstanding-document pill leaves the case header, case_risk Beat, Financing-risk chip tooltip naming the flag driver (+21 more)

### Community 40 - "ref_vitest"
Cohesion: 0.07
Nodes (10): EVENTS, SIGNALS, task, mocks, SwitchProfile(), RISK, LocationEcho(), renderTasks() (+2 more)

### Community 41 - "Persona: Legal Admin (home /legal)"
Cohesion: 0.28
Nodes (9): Legal queue section: Appointment Set, Not Signed, Funnel stage 4: SPA signed (buyer pays 10%), Legal queue section: No Appointment Yet, Persona: Legal Admin (home /legal), Demo profile: Legal Admin, Route /legal: SPA execution queue, Screenshot: the legal queue awaiting SPA execution, Sale & Purchase Agreement (SPA) (+1 more)

### Community 42 - "core/src/index.ts"
Cohesion: 0.04
Nodes (55): RANKING, renderPanel(), SNAPSHOT, EXTRACTION_9001, EXTRACTION_9001_3, EXTRACTION_9002, PROPOSAL_9001, RANKING_9001 (+47 more)

### Community 43 - "RecordUpdateForm.test.tsx"
Cohesion: 0.12
Nodes (6): PopoverState, BOOKING, CREST, MALAYAN, renderForm(), summary()

### Community 44 - "Backtest Validation"
Cohesion: 0.12
Nodes (26): Backtest Cutoff At 2026-08-19, Strict Temporal Data Isolation, Backtest Validation, Brown, Cai & DasGupta (2001), Cohort -> Stage Aggregate -> Global Baseline, packages/core/src/sim.ts Generator + Forecasting, packages/core/src/__tests__/, Forecast And Backtest Method (+18 more)

### Community 45 - "banks.test.ts"
Cohesion: 0.19
Nodes (11): A, approved(), b, booked, ev(), received(), rejected(), requested() (+3 more)

### Community 47 - "User Stories Per Screen"
Cohesion: 0.16
Nodes (23): Admin Today Leads With Assigned Tasks, CaseQuickView Side Sheet, Atomic Demo Data Add/Delete, FR-11 Database Persistence And Demo Data, FR-17 Waiting On Party, Quick View, Next Move, FR-5 Today Desk And Task Management, nextStep.ts Rule-Based Next Step, NFR-5 Database Reconnection (+15 more)

### Community 48 - "json"
Cohesion: 0.15
Nodes (3): NarrationManifestTests, NarrationScheduleTests, write_silence()

### Community 49 - "Mortar Demo Recorder"
Cohesion: 0.12
Nodes (17): @capture Token, TolongLabs/codenection-dev scripts/demo, DEMO_SLIDES name:seconds Token, Deployed Mortar Site (mortar-d18f.onrender.com), Eight-Step Live Walkthrough, DEMO_FIT_TAIL_MS (250), Picture kept after a segment's last narrated line, Layak scripts/demo (+9 more)

### Community 50 - "PersonaProvider"
Cohesion: 0.08
Nodes (24): buildSnapshot(), renderCard(), SnapshotProvider(), PersonaProvider(), activeProfile, pending, readProfile(), selectProfile() (+16 more)

### Community 51 - "Sources"
Cohesion: 0.14
Nodes (27): Association of Banks in Malaysia (2017) Press Release, Annuity Monthly Instalment, Bank Negara Malaysia (2010) Property Market Measures, Bank Negara Malaysia Monthly Statistical Bulletin, Bank Negara Malaysia (2013) 35-Year Tenure Circular, Debt Service Ratio (DSR), DEFAULT_ASSUMPTIONS Panel, DSR Cap Of 40% Gross Income (+19 more)

### Community 52 - "FR-2 Case Summarization And Stall Detection"
Cohesion: 0.07
Nodes (38): Case Event Schema, Event Statuses (confirmed/provisional/disputed/superseded), FR-15 SPA Execution Desk, FR-19 Record An Update, FR-2 Case Summarization And Stall Detection, FR-4 Evidence Log And Multi-Party Verification, FR-6 TypeSafe Jev Structured Message Extraction, Goals And Non-Goals (+30 more)

### Community 53 - "Data Retention"
Cohesion: 0.20
Nodes (14): AMLA 2001 s17 (6 Years, Not Applicable To Developers), booking_removals Minimal Deletion Audit, Companies Act 2016 (Act 777) s245(3), Data Retention, DELETE /api/bookings/:id, Housing Development (Control and Licensing) Act 1966, ImportMovedOnError (409), imports Table (Undoable Spreadsheet Import) (+6 more)

### Community 54 - "forecast() projects forward"
Cohesion: 0.29
Nodes (5): forecast() projects forward, Forecast document card (Open Document, Ask MortarAI), Forecast document stack (#54/#61, chips, above headline figures), leakage() counts backward, Manager Suggestions view

### Community 55 - "PersonaRoute.tsx (route guard)"
Cohesion: 0.12
Nodes (18): AppErrorBoundary, App shell area, canPersonaOpen, frontend/src/App.tsx (routes), frontend/src/main.tsx (providers), frontend/src/components/layout/, LINK_COLUMNS in AppFooter.tsx, NAV_ITEMS in AppSidebar.tsx (+10 more)

### Community 56 - "better-ui Skill: surfaces, icons, motion values"
Cohesion: 0.14
Nodes (11): Canvas UI shadcn Registry Install, Hugeicons by Halal Lab, Hugeicons Agent Skill (npx skills add), Hugeicons CDN Icon Font (use.hugeicons.com), Hugeicons MCP Server, Hugeicons Stroke Rounded Free Style, Iconsax, from the Vuesax team, Iconsax Free Set: 7,140 icons in six styles (+3 more)

### Community 57 - "proxyClient.ts"
Cohesion: 0.16
Nodes (23): AnthropicContentBlock, AnthropicMessageResponse, argmax(), assertNever(), buildAnswer(), buildAnswers(), buildChoiceAnswer(), buildNoulAnswer() (+15 more)

### Community 58 - "tools.ts"
Cohesion: 0.04
Nodes (64): banks.test.ts (reversal, ledger, bank clocks), sim/order.test.ts (same-day event ordering), sim/stage.test.ts (SPA-gated progression), Tests area, ballInCourt, searchPlaybooks(), Persona, StaffProfile (+56 more)

### Community 59 - "Front-End Simulation"
Cohesion: 0.12
Nodes (17): First Build, Forecast And Backtest, Front-End Simulation, Generator, How The Simulation Works, Legal And Domain Notes, Messages And Proposed Updates, Open Questions (+9 more)

### Community 60 - "API Reference"
Cohesion: 0.10
Nodes (37): API Reference, Application State Derivation, Second Undecided Application To Same Bank (409), Case Derivation Rules, CaseSummary, Event Status: disputed, Event Model And Evidence Lifecycle, event_reviews Append-Only Review Log (+29 more)

### Community 61 - "Gotcha: manager workflows"
Cohesion: 0.17
Nodes (18): canManageTaskStatus (exact owner name and department, Manager override, booking must be accessible), currentCaseAssignee recipient resolution, Decisions For You (Manager's queue of overdue cases not yet followed up), Flagged department tasks (persist, notification bell, 30 s refresh), Follow-Ups You Sent, Manager's home is Today (/chase), Trigger at 150% of expected duration, Manager Today rail (Overdue Cases, Value At Risk, Follow-Ups You Sent, Busiest Desk) (+10 more)

### Community 62 - "Questions To Expect"
Cohesion: 0.11
Nodes (30): 4. Evidence And Assumptions — B, 1:30, Do Not Say, Do Not Say: We Increased Conversion, Saved Inventory Days Or Brought Cash Forward, Do Not Say: Receiving A Document Approves A Loan Or Recovers A Sale, Do Not Say: The Forecast Is AI, Do Not Say: IFCA Is Chin Hin's System, Do Not Say: Completing A Task Verifies A Milestone, Evidence And Assumptions (+22 more)

### Community 63 - "precompute.ts"
Cohesion: 0.04
Nodes (47): JevCache, JevCacheEntry, JevKind, JevMeta, ScoreAnswer, cache, caseData, client (+39 more)

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
Cohesion: 0.07
Nodes (28): dependencies, class-variance-authority, clsx, date-fns, framer-motion, lucide-react, @mortar/core, radix-ui (+20 more)

### Community 68 - "Know The Company"
Cohesion: 0.18
Nodes (18): 2. The Business — A, 1:30, Chang Tze Yoong (Group CEO, Property Division), CHGP Developments: Dawn, Avantro, Crown, Aricia, Ayanna, Botanica Hills, Chin Hin Group Berhad (Wider Group), Chin Hin Group Property Berhad (CHGP), Claim: RM2.2 Billion Unbilled Sales, 30 June 2026, Avoid: RM5.41 Billion Group Order Pipeline (Not Property Bookings), Know The Company (+10 more)

### Community 69 - "SalesChartBuilding.tsx"
Cohesion: 0.10
Nodes (31): buildingLayout, FLOOR_HEIGHT, layoutKey(), PODIUM_HEIGHT, TOWER_GAP, TowerFrame, UNIT_SIZE, Vec3 (+23 more)

### Community 70 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, jsdom, tailwindcss, @tailwindcss/vite, @testing-library/react, @types/react, @types/react-dom, @types/three (+4 more)

### Community 71 - "speak.py"
Cohesion: 0.16
Nodes (9): chatterbox_cache_path(), chatterbox_runtime(), ChatterboxRenderer, in_chatterbox_venv(), KokoroRenderer, main(), render_batch(), renderer_factory() (+1 more)

### Community 72 - "LandingPage.tsx"
Cohesion: 0.14
Nodes (16): BackToTop(), HowItWorks(), Moment, MOMENTS, JointSketch(), LandingFaq(), QUESTIONS, LedgerPlate() (+8 more)

### Community 73 - "App Shell"
Cohesion: 0.16
Nodes (21): App Shell, Authentication Theatre, Brand Mark (Kigumi Joint), Canvas Dot Grid, Footer Specification, Footer Bottom Bar, Footer Brand Column, Footer Link Columns (+13 more)

### Community 74 - "lib/projectSettings.ts"
Cohesion: 0.17
Nodes (15): Task 3: Unit States And Release Review, Task 6: Shared Inventory In Add Bookings, formatUnitRangeDescription(), generateProjectInventoryUnits(), isUnitInRange(), projectInventorySize(), plain, layoutUnit() (+7 more)

### Community 75 - "POST /api/assistant"
Cohesion: 0.21
Nodes (18): assistant/tools.ts (five read-only tools), find_bookings tool, get_case tool, get_forecast_summary tool, get_my_queue tool, search_playbooks tool, POST /api/assistant, Scripted askBrain Answers (+10 more)

### Community 76 - "units.ts"
Cohesion: 0.14
Nodes (26): Review Focus, Rulings Carried From The Spec, Sales Chart Plan 2: The Page And The Grid, Task 1: Chart Helpers, Task 2: The Grid, Task 4: Numbering In Settings, Task 5: Docs, Verification And The Pull Request, Data Flow (+18 more)

### Community 77 - "narrate.sh (Voice + Schedule + Subtitles)"
Cohesion: 0.09
Nodes (22): Narration Beat Anchoring, A Beat Marks When a Moment Appears, $DEMO_DIR/beats.json, beats.json Rewrite so Slide Names Are Narratable Beats, Deck Foot-Lines Would Sit Under Burned Captions, DEMO_MUTE_SEG_MS (900), Max picture kept for a beat with no narration, DEMO_SEGMENTS (synthesize) (+14 more)

### Community 78 - "Preserved Technical Cautions"
Cohesion: 0.11
Nodes (15): case_overview Beat, /bookings/BK-9001 loan and legal tracks, evidence provenance, Clean-Seed Check, Delete Demo Data Intentionally Keeps Filming Edits, Disable MKL-DNN Before Chatterbox Import, DEMO_WEB (required), Disposable deployment to film, Force SDPBackend.MATH (+7 more)

### Community 79 - "Mortar Workspace Engine (Bookings Ledger, Today Queue, Forecast Engine)"
Cohesion: 0.14
Nodes (24): Beneficiaries Who Do Not Log In (Finance, Sales Director), Centralized Case Workspace, What The Daily Users Have In Common, Four Daily Users, Decisions For You, Deliberately Not Users (buyers, agents, bankers, solicitors), Desk Health, High-Density Ledger Design (+16 more)

### Community 80 - "react-router-dom"
Cohesion: 0.16
Nodes (14): MortarMark(), MortarMarkProps, AppFooter(), FooterLink, FooterLinkItem(), LINK_COLUMNS, ScrollToTop(), SiteShell() (+6 more)

### Community 81 - "Status Language"
Cohesion: 0.22
Nodes (14): Booking Row And Table Header, Chase Card, Do And Do Not, Landing Sample Ledger, Manager Card, Stage Tracker, Status Tone: danger / At risk, Status Tone: info / With bank (+6 more)

### Community 82 - "packages_core_src_index_booking"
Cohesion: 0.12
Nodes (5): booking, BOOKING, RISK, SUMMARY, TASK

### Community 83 - "Non-Functional Requirements"
Cohesion: 0.09
Nodes (35): Booking Fee Prohibition (Reg 11(2) 1989), ClosedExport Excel Export, Scripted askBrain Fallback, Demo Script As Acceptance, Design Standards Compliance, Direct Core ERP Integration (Out Of Scope), FR-12 High-Availability Offline Jev Fallback, FR-18 Jev Through A Local Model Proxy (+27 more)

### Community 84 - "generate() Stage-Transition Monte Carlo"
Cohesion: 0.13
Nodes (26): Baseline Bookings BK-0001..BK-0140, Canonical 140 Generated Bookings Demo Seed, Four Demo `meta` Keys, demo_seed Provenance Flag, Synthetic Names, NRIC And Phone Numbers, Document Deficit Loop (~35%), generate() Stage-Transition Monte Carlo, Generator Pipeline Diagram (+18 more)

### Community 85 - "How It Works section"
Cohesion: 0.09
Nodes (33): Funnel: booking fee to bank disbursement, 6 funnel stages tracked, Settings: demo dataset controls (seed, reference date, record counts), Closed Excel export from /bookings, Funnel stage 6: Bank disburses progressively, Funnel stage 3: Letter of Offer, Funnel stage 5: Loan agreement (panel solicitor), Funnel stage 2: Loan application(s), several banks at once (+25 more)

### Community 86 - "CaseEvent"
Cohesion: 0.04
Nodes (12): BookingDraft, at(), ev(), CaseEvent, EvidenceStatus, IsoDateTime, LoanApplication, Message (+4 more)

### Community 87 - "SalesChartGrid.tsx"
Cohesion: 0.21
Nodes (10): BlockGrid, SalesChartGrid, SalesChartGridProps, STEPS, toBlocks(), settings, setup(), units (+2 more)

### Community 88 - "patch_docs.py"
Cohesion: 0.14
Nodes (15): Agy Worker Doc Patching, New Document Or Large Rewrite Extraction, patch_docs check, patch_docs finish, patch_docs prepare, Patch Workflow For Small Doc Edits, cmd_check(), cmd_finish() (+7 more)

### Community 89 - "Typeface"
Cohesion: 0.22
Nodes (10): font-display: Swap, Geist, Geist Mono, Body/Default, Display/Page, Eyebrow, Heading/Section, Mono/Data (+2 more)

### Community 90 - "Landing Page"
Cohesion: 0.22
Nodes (12): Landing Page, Landing Card Elevation, Landing Chromatic Panel (.land-panel), Landing Claim, Landing Copy Specification, Landing Feature Cards (.land-desk), Landing Header Row, Landing Panel Tokens (+4 more)

### Community 91 - "Markdown Style Guide"
Cohesion: 0.05
Nodes (40): Add Spacing To Headings, ATX-Style Headings, Avoid Relative Paths Unless Within The Same Directory, Better Is Better Than Best, Break Up Dense Text, Capitalization, Capitalization Of Titles And Headers, Character Line Limit (+32 more)

### Community 92 - "Technical Requirements Document: Mortar"
Cohesion: 0.07
Nodes (40): Data Retention section (docs/TRD.md#data-retention), Technical Requirements Document (docs/TRD.md), Architecture And Components, Architecture Topology Diagram, Docker Builder Stage (bun install + frontend build), Bun Multi-Package Monorepo, bun run test (Vitest), Bun HTTP Server On Render (+32 more)

### Community 93 - "Design Research: Layerhand Landing Page"
Cohesion: 0.20
Nodes (10): Design Research Index, Canvas UI: 35 WebGL/WebGPU effects over live HTML, David Haz, author of Canvas UI and React Bits, Glass Object (Three.js effect), html-in-canvas API, Peel Effect, Its Hover layers-icon Component Pattern, Design Research: Layerhand Landing Page (+2 more)

### Community 94 - "chase.ts"
Cohesion: 0.23
Nodes (8): addDays(), DOCUMENT_LABELS, documentStepLabel(), dueOnForUrgency(), NEXT_ACTION_ICONS, NEXT_ACTION_LABELS, Urgency, urgencyFor()

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
Cohesion: 0.07
Nodes (40): DropZone(), accept(), clear(), readableSize(), readSheetFile(), sheetKind(), SheetReadError, DEFAULTS (+32 more)

### Community 99 - "case/ball.ts"
Cohesion: 0.22
Nodes (5): BALL_HOLDER_ICONS, BALL_HOLDER_LABELS, BALL_HOLDERS, BallHolder, OwnerRole

### Community 100 - "Synthetic Data Guarantee"
Cohesion: 0.23
Nodes (8): PDPC Automated Decision Guidelines (May 2026), 72-Hour Breach Notification Groundwork, Demo Hygiene On /import, research/company-brain/simulation.md Seed Table, Security, Secrets And Privacy, MortarBench (Columbia University, 2026) arXiv:2606.19416, PDPA 2010 / Amendment 2024 / PDPC Guidelines, Methodology And Technical Foundations Sources

### Community 101 - "record.mjs"
Cohesion: 0.05
Nodes (31): css, auditCapture(), REQUIRED_BEATS, scrollDuration(), scrollTarget(), smoothScrollTo(), BK_MESSAGES, verifyCleanSeed() (+23 more)

### Community 102 - "WaitingOn.tsx"
Cohesion: 0.23
Nodes (6): AWAITING_DOCUMENTS, BOOKING, RISK, WITH_BANK, waitingOnTask(), NextActionSuggestion

### Community 103 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 104 - "Step 1: Capture"
Cohesion: 0.13
Nodes (14): legal_persona Beat, Legal Admin persona; /legal signing queue, Capture Viewport 1440x900, $DEMO_DIR/capture.webm, $DEMO_DIR/demo.mp4, DEMO_DIR ($TMPDIR/mortar-demo), Scratch directory for captures, segments, slides and the MP4, DEMO_OUT ($DEMO_DIR/demo.mp4) (+6 more)

### Community 105 - "Case-free forecast aggregate (built from full resolved history before profile scoping)"
Cohesion: 0.18
Nodes (11): .github/workflows/ci.yml, createDatabase (shared snapshot), demo_seed provenance, DEMO_WEB disposable recording env, Case-free forecast aggregate (built from full resolved history before profile scoping), meta key forecast_model_v1 (refreshed on next read after seven days), db.forgetSnapshot(), mortar-test Neon project (team test DB) (+3 more)

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
Cohesion: 0.22
Nodes (17): @mortar/core package, Where AI Helps And Where People Decide, Aster Heights Fictional Project, Booking BK-9001 Lifecycle, Ask MortarAI, Division Of Operational Responsibility, Gemini (Google) - Ask MortarAI's Answer Engine, The Jev Boundary And Resilience (+9 more)

### Community 110 - "Mortar Notes For Agents"
Cohesion: 0.15
Nodes (16): Project Notes (docs/agents/notes.md), bun run --filter <name-or-glob> <script>, bun run format, Bun workspaces (frontend + packages/*), Conventions, docs/README.md (human quickstart), bun run --filter '*' fans root scripts out, @mortar/core shared package (no build step) (+8 more)

### Community 111 - "Getting Started"
Cohesion: 0.15
Nodes (18): Env var DATABASE_URL, .env.example copied to .env at repo root, Env var TEST_DATABASE_URL (dedicated test Postgres), Getting Started, Installation steps, Local Postgres 17 via docker run (mortar-pg), Prerequisites: Bun 1.3.14, Postgres 17, desktop browser, Schema applied and canonical dataset seeded on first boot (+10 more)

### Community 112 - "UI Triage: The Signed-In App"
Cohesion: 0.21
Nodes (3): transitions.dev: UI transitions for AI agents, UI Triage: The Signed-In App, Four-Phase Implementation Plan

### Community 113 - "useTheme.tsx"
Cohesion: 0.21
Nodes (12): frontend/index.html (fonts, FOUC theme script), ThemeToggle, renderNav(), getSystemTheme(), resolveTheme(), Theme, ThemeContext, ThemeContextValue (+4 more)

### Community 114 - "closedExport.ts"
Cohesion: 0.16
Nodes (11): buildClosedExportRows (pure, no DOM/network), buildClosedExportRows(), ClosedExportRow, closedOnDate(), CLOSING_KIND, downloadClosedExport(), exportBank(), header() (+3 more)

### Community 115 - "Bug Report Issue Form"
Cohesion: 0.15
Nodes (11): Area, Bug Report Issue Form, What You Expected, What Happened, Where: Live Site / Running Locally / Both, Area, Done When, Feature Or Change Issue Form (+3 more)

### Community 116 - "Button"
Cohesion: 0.08
Nodes (60): AddMessageForm(), defaultName(), normalTime(), ROLES, timeNow(), RecordUpdateForm(), DirectTableImport(), Entry (+52 more)

### Community 117 - "Jev (Reading Engine)"
Cohesion: 0.15
Nodes (27): MortarAI (AI layer), 10. Technology Second — B, 1 Minute, Slide 6: How Jev Works, 6. Meet MortarAI — B, 1 Minute, Slide 6: Why It Helps, Archify (Diagramming Tool), ChatGPT (Free-Text Chatbot), Do Not Say: Jev And Ask MortarAI Are Two Separate AIs (+19 more)

### Community 118 - "test_assemble.py"
Cohesion: 0.24
Nodes (7): AssembleMuxTests, AssemblePictureTests, color_video(), ff(), probe_duration(), slide_png(), write_wav()

### Community 119 - "Sales Chart: Design"
Cohesion: 0.12
Nodes (15): Acceptance, Access And Peer Visibility, Building, Delivery, Design System Exception, Figures And Filters, Grid, Out Of Scope (+7 more)

### Community 120 - "Perch Landing Teardown"
Cohesion: 0.14
Nodes (11): better-layout Skill, explain-interface Skill, Perch Sign-In Teardown, isJoiner Entry-Path Check, Perch Storage Keys: perch.trip.v1, perch.theme.v1, perch.voter.v1, Perch Footer And Chrome Teardown, --foot-h Custom Property, Perch Shell Component (+3 more)

### Community 121 - "Checklist"
Cohesion: 0.10
Nodes (6): Never Do These, Pre-Commit Hook Formats Staged Files, Working With AI Coding Agents, Screenshots Or Recording, Checklist, Screenshots

### Community 123 - "Import area"
Cohesion: 0.25
Nodes (10): booking-sheet-template.xlsx/.csv, checkBookingDraft, DropZone / readSheetFile, Import area, parseCsv, readBookingSheet, FR-13 Add Bookings Intake And Validation, Type Them In As Default Add Bookings Tab (+2 more)

### Community 124 - "Acceptance Criteria (14)"
Cohesion: 0.12
Nodes (17): Acceptance Criteria (14), Button Component, Checkbox Component, Colour, Elevation: Card, Field Component, Focus Ring, Primitives: ink Ramp (+9 more)

### Community 125 - "This Week. What We Need."
Cohesion: 0.08
Nodes (43): A1 — Chin Hin's Leaks Follow The Same Order (test: rebuild loss reasons from closed files), A2 — Follow-Up Lifts Stalled Bookings From 20% To 40% Signed (test: assisted cohort vs ordinary follow-up), A3 — Staff Will Paste Banker Messages In Daily (test: one admin, two weeks), A4 — Bookings Can Start From A Spreadsheet Export (test: first upload, week one), BK-9001 (booking), BK-9006 (booking), Forecast (expected signings with a range — page rebuilt since 20 Sep), Live Demo — mortar-d18f.onrender.com (+35 more)

### Community 126 - "Keep It Current"
Cohesion: 0.20
Nodes (10): Graphify, .graphifyignore, Install Line: uv tool install graphifyy[sql]==0.9.71, graphify install --platform claude, Installing Graphify, .graphify_labels.json.sig, patch_docs merge, graphifyy [sql] Extra (Reads server/db/schema.sql) (+2 more)

### Community 129 - "schema.sql"
Cohesion: 0.16
Nodes (20): booking_removals, bookings, event_reviews, event_reviews_event_idx, events, events_application_idx, events_booking_idx, events_message_idx (+12 more)

### Community 130 - "Design: Mortar (Visual Specification)"
Cohesion: 0.21
Nodes (9): docs/agents/notes.md, Mortar Agent Notes, Mortar Project Guidelines (AGENTS.md), Design: Mortar (Visual Specification), Mortar Design System In Figma, Icons, Landing Video Pipeline (superseded), Lucide (lucide-react) Icon System (+1 more)

### Community 131 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, preview, template:bookings, test, typecheck

### Community 132 - "booking-template.mjs"
Cohesion: 0.18
Nodes (6): bookings, COLUMNS, howTo, merged(), OUT, SAMPLES

### Community 134 - "ChaseCard.test.tsx"
Cohesion: 0.22
Nodes (5): NextStep, booking(), jevMove(), renderCard(), NextAction

### Community 136 - "core/src/jev.ts"
Cohesion: 0.22
Nodes (5): EVENT_MAP, JEV_REVIEW_THRESHOLD, STATUS_RANK, PLAYBOOKS, Extraction

### Community 137 - "File Map"
Cohesion: 0.09
Nodes (27): AppLayout (mounts the tour), ballInCourt (who holds a case), Busiest Desk shortcut, components/case/ball.ts (labels, icons, owners), CaseQuickView.tsx (side sheet), ChartTooltipContent.tsx (recharts shell), createJevService / systemOne surface, createProxySystemOne (Jev proxy client) (+19 more)

### Community 138 - "Gotchas"
Cohesion: 0.15
Nodes (10): blockPrefix legacy read alongside blocks, BK-nnnn ids stop before BK-9001, Gotchas, inlinePopover.tsx test double, Inventory API (held project/unit pairs, no buyer names), Project settings (server-held, Manager-only), bunx shadcn add <component>, simNow(REFERENCE_DATE) (+2 more)

### Community 139 - "RTK Commands By Workflow"
Cohesion: 0.14
Nodes (14): Analysis & Debug (70-90% Savings), Build & Compile (80-90% Savings), Files & Search (60-75% Savings), Git (59-80% Savings), GitHub (26-87% Savings), Golden Rule, Infrastructure (85% Savings), JavaScript/TypeScript Tooling (70-90% Savings) (+6 more)

### Community 140 - "Mortar (product)"
Cohesion: 0.16
Nodes (16): Chin Hin Group Property (CHGP), Kabel DXP, Mortar (product), Cover — Booked Is Not Sold. Signed Is., Team NexTechnologies, YEI 3.0 (Property Booking Conversion cohort), 1. Cover — A, 45 Seconds, BK-9006 (Demo Booking) (+8 more)

### Community 141 - "Today Rail"
Cohesion: 0.25
Nodes (9): Content Canvas, Data Formats, Duration Formats, Money Formats, Screen Density, Stat Tile, Display/Figure, Today Rail (+1 more)

### Community 142 - "FR-8 Statistical Conversion Forecasting"
Cohesion: 0.13
Nodes (18): Brown, Cai & DasGupta (2001) Wilson Interval, Forecast Document Stack (#54), Forecast Documents Panel Removed, FR-16 Leakage Analysis And Recovery Sizing, FR-8 Statistical Conversion Forecasting, FR-9 Historical Forecast Backtesting, Live And Resolved Booking Definitions, Funnel Pipeline Stages (+10 more)

### Community 143 - "canUseWebGL"
Cohesion: 0.22
Nodes (7): Global Constraints, Review Focus, Sales Chart Plan 3: The Building View, Task 1: Dependencies And Layout, Task 2: The Scene, The Switch And The Fallback, Task 3: The Design Exception, Docs And The Pull Request, canUseWebGL()

### Community 144 - "Project Structure tree"
Cohesion: 0.09
Nodes (42): Archify architecture diagram: staff-to-service flow and tech stack, Architecture: staff personas, web app, API, shared core, AI, database, hosting, Bun API reading Postgres, Bun API and static file serving process, Case Messages And Documents From External Parties, CI checks gate the Render deploy, 1 backend service, 2 shared packages (+34 more)

### Community 145 - "assemble.sh Mux Phase"
Cohesion: 0.11
Nodes (16): Burned Subtitles, DEMO_FFPROBE (ffprobe on PATH), ffprobe executable, DEMO_MAX_DURATION (300), Reject a deliverable longer than this many seconds, DEMO_MAX_GAP_MS (1000), Max allowed gap between consecutive spoken lines (dead-air rule), DEMO_MIN_DURATION (240) (+8 more)

### Community 146 - "notificationStore.ts"
Cohesion: 0.17
Nodes (14): Notification, NotificationPopover(), useNotifications(), emit(), Listener, listeners, loadNotifications(), notifications (+6 more)

### Community 148 - "Documents Index"
Cohesion: 0.11
Nodes (17): Contributing (.github/CONTRIBUTING.md), Design (docs/DESIGN.md), Documents Index, Feature Ideas (docs/research/feature-ideas/README.md), Markdown Style Guide (docs/markdown-style.md), Product Requirements Document (docs/PRD.md), Product Overview (docs/PRODUCT.md), Skills (docs/agents/skills.md) (+9 more)

### Community 149 - "Assistant area (server/src/assistant/)"
Cohesion: 0.24
Nodes (9): frontend/public/ai-mascot*.png, AskPanel (Dialog), AskTrigger (in AppNav), Assistant area (server/src/assistant/), 30-second budget, max 4 rounds, buildAskContext, GEMINI_API_KEY, GEMINI_MODEL (default gemini-3.5-flash-lite) (+1 more)

### Community 150 - "Five Named Demo Profiles"
Cohesion: 0.44
Nodes (9): System Prompt Reflects Persona Desk, Five Named Demo Profiles, frontend/src/lib/persona.tsx Persona Definitions, Manager Persona (Cross-Department Access), /manager Redirect To /team, Persona Home Routes, PERSONA_PAGES Route Permission Map, PersonaRoute Route Guard (+1 more)

### Community 151 - "jev/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, types, extends, include, ../../tsconfig.json

### Community 153 - "Personas"
Cohesion: 0.24
Nodes (12): Frontend Stack (React 19 + Vite + Tailwind 4 + shadcn/ui), Manager Persona (Home Route /chase), mortar.persona localStorage key, mortar.profile localStorage key, Personas, Mortar Product Definition, Route Map, Stack (Bun workspaces) (+4 more)

### Community 154 - "app.ts"
Cohesion: 0.06
Nodes (44): JevService, Language, SenderRole, TaskAssignmentChangedError, AppOptions, caseRuleProblem(), cleanDraft(), confirmProblem() (+36 more)

### Community 155 - "Plain Language"
Cohesion: 0.31
Nodes (3): Ask Panel, Jev (Assistant), Top Bar

### Community 156 - "Mortar (Product Requirements)"
Cohesion: 0.15
Nodes (20): docs/DESIGN.md, Docs, frontend/src/globals.css (@theme tokens from DESIGN.md), docs/PRD.md, docs/PRODUCT.md, docs/TRD.md, Mortar (Product Requirements), Illustrative Impact, Not A Finding (+12 more)

### Community 157 - "Meet MortarAI. One Reads, One Answers."
Cohesion: 0.13
Nodes (22): Apex Bank, Ask MortarAI (feature), By Hand (staff record the update), Cached Answer (asked before, reused), Live Answer (typed, with a confidence), Stale, Marked (shown with a stale tag), Gemini (Google — answers staff questions), Gemini Used For — Staff Questions, Even About A Photo Of A Bank Letter (+14 more)

### Community 158 - "Jakub Krehel's Interface Skills"
Cohesion: 0.21
Nodes (10): Jakub Krehel's Interface Skills, better-colors Skill, better-interface Skill: orchestrated review, better-typography Skill, better-writing Skill, break Skill, interface-review Skill, Interfaces Magazine by Jakub Krehel (+2 more)

### Community 159 - "Slide Talk Track"
Cohesion: 0.16
Nodes (15): 3. The Workflow Today — A, 1:30, 5. Solution Logic — B, 1:30, 8. Before And After — C, 1 Minute, 9. Adoption — A, 1:30, Q: Do Buyers, Bankers Or Lawyers Need To Adopt Anything?, Loan Admin Desk, Sales Admin Desk, Slide Talk Track (+7 more)

### Community 160 - "server/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, types, extends, include, ../tsconfig.json

### Community 161 - "subtitles.py"
Cohesion: 0.25
Nodes (7): build(), cards(), ts(), wav_ms(), wrap(), pack(), walk()

### Community 162 - "Functional Requirements"
Cohesion: 0.20
Nodes (22): Manager (persona), Ask Mortar Renamed To Ask MortarAI, Decisions For You (Manager Today Queue), FR-14 Persona Navigation And Page Routing, FR-22 Add Bookings Intake, FR-24 Guided Walkthrough, Functional Requirements, Header Profile Menu (+14 more)

### Community 163 - "Andrej Karpathy Skills"
Cohesion: 0.29
Nodes (6): Andrej Karpathy Skills (docs/agents/andrej-karpathy-skills.md), 1. Think Before Coding, 2. Simplicity First, 3. Surgical Changes, 4. Goal-Driven Execution, Andrej Karpathy Skills

### Community 164 - "Ask The Graph First"
Cohesion: 0.29
Nodes (6): graphify affected, graphify explain, graphify god-nodes, GRAPH_REPORT.md, graphify path, graphify query

### Community 170 - "FR-7 Next Action, Playbook Fit And Buyer Signals"
Cohesion: 0.36
Nodes (8): Buyer Signals (responsiveness/hesitation), Assistant Read-Only Tool Set, FR-20 Message Timing And Buyer Response, FR-7 Next Action, Playbook Fit And Buyer Signals, JTBD: Guidance Retrieval, MiniSearch Playbook Index, sentAt Validation And Clock Skew, US-12 Playbook Knowledge Retrieval

### Community 172 - "The Business — A Booking Is A Promise. A Signed SPA Is A Sale."
Cohesion: 0.60
Nodes (5): 6–12 Weeks — A Stalled Booking Can Hold A Unit Off The Market, RM2.2bn Unbilled Sales, The Business — A Booking Is A Promise. A Signed SPA Is A Sale., CHGP 2Q 2026 Results, Chin Hin Challenge Brief

### Community 173 - "askBrain (scripted fallback)"
Cohesion: 0.29
Nodes (7): askBrain (scripted fallback), brain/helpers.ts isOpen filter, brain.test.ts pins Ask's stalled set, deriveCase (computes open and live), HORIZON_DAYS (30), MIN_COVERAGE, stallReasons (derived from open)

### Community 174 - ".prettierrc.json"
Cohesion: 0.29
Nodes (6): overrides, printWidth, $schema, semi, singleQuote, trailingComma

### Community 175 - "Agent Rules"
Cohesion: 0.19
Nodes (7): GitHub Issues And Pull Requests (docs/agents/github.md), Graphify (docs/agents/graphify.md), RTK (docs/agents/rtk.md), Agent Rules, Before Opening A Pull Request, Before Opening An Issue, GitHub Issues And Pull Requests

### Community 177 - "formatters.ts"
Cohesion: 0.40
Nodes (4): currencyFormatter, formatCurrency(), formatTooltipCurrency(), numberFormatter

### Community 178 - "11. This Week — All, 1:45"
Cohesion: 1.00
Nodes (4): 11. This Week — All, 1:45, Manager Desk, Shipped Since 20 September (Manager Desk, Profiles, Ask MortarAI, Render...), Team View (Which Desk Every Booking Waits On)

### Community 179 - "core/tsconfig.json"
Cohesion: 0.50
Nodes (3): extends, include, ../../tsconfig.json

### Community 180 - "Jakub Antalik Portfolio Study"
Cohesion: 0.33
Nodes (3): Jakub Antalik Portfolio Study, libraries.dev: UI libraries for AI agents, Thinking Orbs

### Community 183 - "The One Rule: a booking is never counted as cash at face value"
Cohesion: 0.31
Nodes (7): 48-hour screening of every booking, Forecast accuracy score sentence, Forecast supporting document stack, Route /forecast, Screenshot: the forecast of projected signings, Stage conversion rate forecast, Forecast view: where bookings died

### Community 184 - "Booking"
Cohesion: 0.08
Nodes (28): Task 5: Server Settings And Demo Reset, BookingRow, LegalRow, notifications, WaitingSuggestion, AssignmentAccessContext, canAccessBooking(), canManageTaskStatus() (+20 more)

### Community 189 - "MotionSites: cinematic landing page prompts"
Cohesion: 0.17
Nodes (7): Scroll-Driven Effects: Laser, Particle Scroll, Bend, MotionSites: cinematic landing page prompts, MotionSites Academy Lessons, MotionSites MCP Server, Landing Video Pipeline, The Agent's Video Checklist, gemini-watermark-remover by GargantuaX

### Community 194 - "vite.config.ts"
Cohesion: 0.40
Nodes (3): @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 205 - "schedule.py"
Cohesion: 0.47
Nodes (3): deconflict(), duration_ms(), main()

### Community 207 - "frontend/package.json"
Cohesion: 0.09
Nodes (21): @mortar/core, typescript, vitest, license, name, private, type, clsx (+13 more)

### Community 232 - "types.ts"
Cohesion: 0.05
Nodes (91): Global Constraints, Unit States, appointment(), listOf(), managerSuggestions(), assumptionValue(), DEFAULT_ASSUMPTIONS, backtest() (+83 more)

## Ambiguous Edges - Review These
- `GET /api/settings` → `meta Key-Value Table`  [AMBIGUOUS]
  docs/TRD.md · relation: references
- `meta Key-Value Table` → `PUT /api/settings (Manager Only)`  [AMBIGUOUS]
  docs/TRD.md · relation: references
- `Kabel DXP Weekly Check-In, 29 September 2026` → `Chin Hin Group Property Berhad (CHGP)`  [AMBIGUOUS]
  docs/demo/pitch-script.md · relation: conceptually_related_to
- `Do Not Say: IFCA Is Chin Hin's System` → `Claim: 7 Of 8 Name Loan Rejection The Biggest Cause`  [AMBIGUOUS]
  docs/demo/pitch-script.md · relation: conceptually_related_to

## Knowledge Gaps
- **941 isolated node(s):** `$schema`, `printWidth`, `singleQuote`, `semi`, `trailingComma` (+936 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1316 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **48 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `GET /api/settings` and `meta Key-Value Table`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `meta Key-Value Table` and `PUT /api/settings (Manager Only)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `Kabel DXP Weekly Check-In, 29 September 2026` and `Chin Hin Group Property Berhad (CHGP)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Do Not Say: IFCA Is Chin Hin's System` and `Claim: 7 Of 8 Name Loan Rejection The Biggest Cause`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `AGENTS.md` connect `Personas` to `Project Structure tree`, `About The Project section`, `Documents Index`, `Agent Rules`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `Mortar (Product Requirements)` connect `Mortar (Product Requirements)` to `Industry Practitioner Survey Findings, n = 8`, `Functional Requirements`, `User Stories Per Screen`, `Sources`, `Non-Functional Requirements`, `Documents Index`, `FR-2 Case Summarization And Stall Detection`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `Manager (persona)` connect `Functional Requirements` to `This Week. What We Need.`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._