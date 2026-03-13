# CTOS — Chemical Shipment Transfer Module
## Product Requirements Document

| Field | Details |
|-------|---------|
| **Version** | 1.0 — Initial Release |
| **Status** | Draft — Ready for Engineering Review |
| **Module** | Chemical Shipment Transfer (CST) |
| **Parent System** | CTOS — Chemical Terminal Operating System |
| **Prepared by** | Product Team |
| **Date** | March 2026 |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Module Scope](#2-module-scope)
3. [Transfer Types](#3-transfer-types)
4. [Transfer Lifecycle](#4-transfer-lifecycle)
5. [Shipment Diagram Engine](#5-shipment-diagram-engine)
6. [Cross-Terminal Transfer](#6-cross-terminal-transfer)
7. [Transfer Templates](#7-transfer-templates)
8. [Data Model](#8-data-model)
9. [User Stories](#9-user-stories)
10. [Notifications & Alerts](#10-notifications--alerts)
11. [Technical Requirements](#11-technical-requirements)
12. [Security & Compliance](#12-security--compliance)
13. [Development Roadmap](#13-development-roadmap)
14. [Success Metrics](#14-success-metrics)
15. [Glossary](#15-glossary)
16. [Feature Register](#16-feature-register)

---

## 1. Executive Summary

The Chemical Shipment Transfer (CST) module is the operational core of CTOS. It manages the complete lifecycle of every chemical transfer event at a terminal — from vessel pre-arrival planning through live transfer execution, quantity reconciliation, documentation, and formal closure. The module replaces disconnected spreadsheets, radio communication, and paper checklists with a single real-time digital workflow that every role in the terminal interacts with simultaneously.

This PRD defines all features, data models, user stories, and technical requirements needed to build the CST module as a standalone, production-ready product. It incorporates ship-to-tank, tank-to-ship, tank-to-tank, tank-to-truck, and cross-terminal transfer types, with a visual Shipment Diagram Engine at its centre.

> **Design Principle:** Every transfer in CTOS must produce a complete, auditable digital record — from the first pre-arrival nomination to the final signed quantity certificate. No step in the transfer lifecycle should require paper or external spreadsheets.

---

## 2. Module Scope

### 2.1 In Scope

- Shipment Diagram Engine — visual real-time transfer flow diagrams
- All transfer types: Ship→Tank, Tank→Ship, Tank→Tank, Tank→Truck, Tank→IBC, Tank→Drum, Cross-Terminal
- Pre-arrival planning and nomination management
- Ship/Shore Safety Checklist (ISGOTT compliant)
- Shore connection and hose configuration recording
- Live transfer monitoring: flow rate, ullage, pressure, temperature
- Ship vs. shore quantity reconciliation in real time
- Vapour return line management
- Emergency stop and transfer pause workflows
- Multi-tank parcel splitting and mid-transfer re-routing
- Dynamic ETA and completion forecasting
- Structured sampling workflow
- Quantity Certificate auto-generation
- Transfer closure and loss accounting reconciliation
- Cross-terminal transfer coordination and pipeline hand-off
- Transfer templates for repeat operations
- Full audit log and event timeline per transfer

### 2.2 Out of Scope (Phase 1)

- Tank cleaning scheduling (separate module)
- Customer billing and invoicing engine
- Laboratory LIMS integration (stubbed API only in Phase 1)
- Predictive AI demand forecasting

---

## 3. Transfer Types

The CST module supports the following transfer types. Each type shares the same lifecycle framework but has type-specific configuration, validation rules, and diagram components.

| Transfer Type | Source | Destination | Key Considerations |
|---------------|--------|-------------|---------------------|
| **Ship → Tank** | Vessel cargo tank | Shore storage tank | ISGOTT checklist, ship/shore figures, vapour return |
| **Tank → Ship** | Shore storage tank | Vessel cargo tank | Reverse ISGOTT, backloading figures, ullage verification |
| **Tank → Tank** | Shore storage tank | Shore storage tank | Same-terminal pipeline routing, contamination check |
| **Tank → Truck** | Shore storage tank | Road tanker / weigh bridge | Driver check-in, loading arm, weight certificate |
| **Tank → IBC / Drum** | Shore storage tank | IBC or drum filling station | Fill count, batch tracking, label generation |
| **Cross-Terminal** | Tank at Terminal A | Tank at Terminal B | Inter-terminal pipeline or barge, dual-site coordination |
| **IBC → Truck** | IBC storage bay | Road tanker | Pick list, manifest, driver sign-off |

---

## 4. Transfer Lifecycle

All transfer types follow a **five-phase lifecycle**. Each phase has defined entry criteria, required actions, responsible roles, and system state transitions.

### Phase 1 — Pre-Arrival & Planning (T-48h to T-4h)

#### F-001: Vessel Nomination
> **Phase:** 1 · **Priority:** P0 · **Roles:** Planner, Terminal Manager

A single vessel may carry multiple chemical products for multiple customers (parcels). Each parcel is managed independently within a shared vessel call.

**Requirements:**
- Create a vessel call record with vessel name, IMO number, ETA, berth allocation, and agent details
- Attach voyage documents: Notice of Readiness, Bill of Lading, cargo manifest
- System validates ETA against berth availability and existing vessel schedule

**Acceptance Criteria:**
- [ ] A vessel call record can be created with all required fields
- [ ] Documents can be uploaded and linked to the vessel call
- [ ] System rejects vessel call if ETA conflicts with existing berth bookings
- [ ] Vessel call appears on terminal's vessel schedule dashboard

---

#### F-002: Parcel Management
> **Phase:** 1 · **Priority:** P0 · **Roles:** Planner

**Requirements:**
- Split a vessel call into 1–N parcels, each with: product, nominated volume, owner/customer, quality specification, temperature requirements
- Each parcel receives its own transfer record, tank allocation, and documentation chain
- Parcels from the same vessel can be transferred simultaneously or sequentially, each with independent status tracking

**Acceptance Criteria:**
- [ ] Planner can create multiple parcels under a single vessel call
- [ ] Each parcel generates an independent transfer record
- [ ] Parcels can run simultaneously with independent status tracking
- [ ] Editing one parcel does not affect sibling parcels

---

#### F-003: Tank Allocation
> **Phase:** 1 · **Priority:** P0 · **Roles:** Planner, Terminal Manager

**Requirements:**
- System recommends tanks based on: product compatibility, available capacity, cleaning status, temperature suitability
- Planner confirms or overrides recommendations
- System locks allocated tanks, preventing double-allocation
- For multi-parcel vessels: system checks aggregate volume against available terminal capacity before confirming

**Acceptance Criteria:**
- [ ] Tank recommendation engine returns sorted list of compatible tanks
- [ ] Allocated tank is locked and unavailable for other transfers
- [ ] Attempting to allocate an already-locked tank returns an error
- [ ] Aggregate capacity check prevents over-allocation across parcels

---

#### F-004: Pre-Transfer Checklist Builder
> **Phase:** 1 · **Priority:** P1 · **Roles:** Terminal Manager, Planner

**Requirements:**
- Configurable checklist templates per product class (e.g. flammable liquids, corrosives, cryogenic)
- Checklist items assigned to roles (terminal supervisor, field operator, shift manager)
- Checklist must be fully completed and signed before transfer can move to Phase 2
- Non-conformances on checklist trigger alert to Terminal Manager

**Acceptance Criteria:**
- [ ] Checklist templates can be created and edited per product class
- [ ] Transfer cannot advance to Phase 2 without a fully signed checklist
- [ ] Non-conformance items generate alerts to Terminal Manager

---

### Phase 2 — Berth Readiness (T-4h to Transfer Start)

#### F-005: Ship/Shore Safety Checklist (ISGOTT)
> **Phase:** 1 · **Priority:** P0 · **Roles:** Terminal Manager, Operations Manager

The International Safety Guide for Oil Tankers and Terminals (ISGOTT) checklist is a regulatory requirement. The system implements the full two-part checklist with digital co-signature.

**Requirements:**
- **Part A** — Completed jointly by ship officer and terminal supervisor
- **Part B** — Completed by terminal supervisor only
- Each item: checkbox + mandatory comment field if non-compliant
- Co-signature: ship officer signs via email link or in-app QR code; terminal supervisor signs in CTOS
- Checklist is timestamped and locked on completion — no post-signature edits
- Transfer status cannot advance to Phase 3 until checklist is fully co-signed
- System stores checklist version (ISGOTT 7th Edition baseline, configurable per terminal)

**Acceptance Criteria:**
- [ ] Two-part checklist renders with all items per ISGOTT 7th Edition
- [ ] Non-compliant items require mandatory comment
- [ ] Co-signature workflow works via email link and in-app QR
- [ ] Signed checklist is immutable — no edits post-signature
- [ ] Transfer is blocked from starting without completed checklist

---

#### F-006: Shore Connection Recording
> **Phase:** 2 · **Priority:** P1 · **Roles:** Field Operator

**Requirements:**
- Record hose serial numbers, nominal diameter, and max pressure rating per connection point
- Record pressure test result and test date for each hose
- Record flange configuration (manifold position, reducer used if any)
- Photo upload for physical connection confirmation
- Connection record linked to transfer and equipment maintenance history

**Acceptance Criteria:**
- [ ] All connection fields can be filled and saved from mobile
- [ ] Photos can be uploaded and linked to the connection record
- [ ] Connection history is visible in equipment maintenance view

---

#### F-007: Pipeline Route Confirmation
> **Phase:** 1 · **Priority:** P0 · **Roles:** Field Operator, Operations Manager

**Requirements:**
- System displays the auto-calculated pipeline route from berth to destination tank
- Field operator confirms all valves in the route are set correctly (valve lineup checklist)
- Any pipeline segment flagged as under maintenance is blocked from use — system proposes alternative route
- Route locked on confirmation — changes require supervisor override with reason

**Acceptance Criteria:**
- [ ] Pipeline route is auto-calculated based on infrastructure graph
- [ ] Valve lineup checklist is generated for the route
- [ ] Maintenance-blocked segments are excluded; alternatives proposed
- [ ] Locked route requires supervisor override to change

---

### Phase 3 — Live Transfer Execution

#### F-008: Flow Rate Management
> **Phase:** 1 · **Priority:** P0 · **Roles:** Field Operator, Operations Manager

**Requirements:**
- Field operator sets initial flow rate (m³/h) at transfer start
- System displays current flow rate from meter integration or manual entry
- Planned vs. actual flow rate tracked continuously
- Rate change events logged with timestamp, operator, and reason
- Maximum flow rate enforced per pipeline segment — system prevents entry above limit
- Slow-down alert: system notifies operator when approaching high-level alarm on destination tank

**Acceptance Criteria:**
- [ ] Initial flow rate can be set and is recorded
- [ ] Max flow rate enforcement prevents exceeding pipeline limits
- [ ] Rate changes are logged with full audit trail
- [ ] Slow-down alert fires when approaching HLA on destination tank

---

#### F-009: Dynamic ETA Calculator
> **Phase:** 2 · **Priority:** P1 · **Roles:** All

**Requirements:**
- Calculates estimated transfer completion time based on: current flow rate, remaining volume, tank capacity headroom
- Recalculates automatically when flow rate changes or operational pause occurs
- Displays countdown timer and absolute completion time side-by-side
- ETA visible to all roles — logistics team uses it to schedule the next vessel
- Deviation alert: if actual rate falls more than 15% below plan rate for >10 minutes, alert sent to Operations Manager

**Acceptance Criteria:**
- [ ] ETA recalculates within 5 seconds of flow rate change
- [ ] Both countdown and absolute time are displayed
- [ ] Deviation alert fires after 10+ minutes of >15% underperformance

---

#### F-010: Ullage & Tank Level Tracking
> **Phase:** 1 · **Priority:** P0 · **Roles:** Field Operator, Operations Manager

**Requirements:**
- Real-time display of destination tank: opening level, current level, closing level (projected)
- Visual fill indicator showing % capacity and safe operating level threshold
- High-level alarm (HLA) and high-high-level alarm (HHLA) limits displayed and enforced
- Source tank (vessel cargo) ullage tracked: ship figures reported by officer at defined intervals or continuously via integration
- Running delta between ship reported and shore metered displayed at all times

**Acceptance Criteria:**
- [ ] Tank fill indicator updates in real time
- [ ] HLA and HHLA thresholds trigger visible warnings
- [ ] Running delta between ship and shore is always visible

---

#### F-011: Ship vs. Shore Quantity Reconciliation
> **Phase:** 1 · **Priority:** P0 · **Roles:** Operations Manager, Terminal Manager

This is the most commercially critical monitoring feature. Discrepancies between the ship's flow meter and the terminal's shore meter must be detected in real time.

**Requirements:**
- Shore meter reading updated every minute (integration) or manually by operator
- Ship figure updated at operator-defined intervals (e.g. every 30 minutes via manual entry or AIS/ship integration)
- Running variance displayed: shore received minus ship discharged (in MT and %)
- Variance threshold configurable per terminal (default: alert at 0.3%, critical at 0.5%)
- On threshold breach: alert sent to Operations Manager and Terminal Manager
- Transfer cannot be closed with unresolved variance above tolerance — requires documented explanation

**Acceptance Criteria:**
- [ ] Running variance displayed in real time (MT and %)
- [ ] Configurable threshold triggers alerts at correct levels
- [ ] Transfer closure is blocked when variance exceeds tolerance without explanation

---

#### F-012: Pressure & Temperature Monitoring
> **Phase:** 2 · **Priority:** P1 · **Roles:** Field Operator, Operations Manager

**Requirements:**
- Pipeline pressure displayed per segment (if sensor integration active)
- Pressure threshold breach: immediate alert + transfer auto-pause option
- Product temperature monitored at source and destination
- Temperature deviation alert: if product temperature exceeds safe handling range for the chemical
- Manual override: operator can dismiss alert with mandatory reason entry

**Acceptance Criteria:**
- [ ] Pressure data displays per pipeline segment
- [ ] Threshold breach generates immediate alert
- [ ] Temperature deviation alert fires with mandatory override reason

---

#### F-013: Vapour Return Line Management
> **Phase:** 2 · **Priority:** P1 · **Roles:** Operations Manager, Field Operator

**Requirements:**
- Record which vapour return line is in service for each transfer
- Track vapour recovery unit (VRU) or vessel vapour manifold as vapour destination
- Vapour return pressure monitored — alert if outside acceptable range
- For products with VOC regulatory requirements (e.g. benzene, toluene): system flags if vapour return is not active
- Vapour return status included in transfer record for environmental reporting

**Acceptance Criteria:**
- [ ] Vapour return line selection is recorded per transfer
- [ ] VOC-regulated products flag absence of active vapour return
- [ ] Vapour return status appears in transfer record

---

#### F-014: Multi-Tank Parcel Splitting
> **Phase:** 2 · **Priority:** P1 · **Roles:** Operations Manager

**Requirements:**
- During an active transfer, operator can redirect product to an additional tank (e.g. primary tank reaches capacity)
- System calculates revised route to secondary tank
- Valve lineup change checklist generated automatically for the new route segment
- Volume split recorded per destination tank for quantity reconciliation purposes
- Each destination tank gets its own closing ullage measurement

**Acceptance Criteria:**
- [ ] Mid-transfer redirect generates new route with valve lineup checklist
- [ ] Volume is split and tracked per destination tank
- [ ] Each destination tank records independent closing ullage

---

#### F-015: Emergency Stop & Transfer Pause
> **Phase:** 1 · **Priority:** P0 · **Roles:** All operational roles

**Requirements:**
- Red STOP button always visible in transfer diagram — one-click activation
- Stop action requires mandatory reason selection: leak detected / equipment fault / safety concern / vessel request / other
- On stop: transfer status set to PAUSED, timestamp recorded, all connected roles notified immediately
- Resume requires supervisor authorisation with reason entry
- Full stop (abandon transfer): separate action — status set to TERMINATED, reason recorded, incident report auto-initiated
- All stop/resume events permanently logged — cannot be deleted or edited

**Acceptance Criteria:**
- [ ] Emergency stop button is always visible and works with one click
- [ ] Mandatory reason is required before stop is confirmed
- [ ] All roles are notified immediately upon stop
- [ ] Resume requires supervisor authorization
- [ ] Stop/resume events are immutable in the audit log

---

#### F-016: Automatic Event Log
> **Phase:** 1 · **Priority:** P0 · **Roles:** All

**Requirements:**
- Every state change, operator action, and system alert is auto-logged with timestamp and user
- Log entries cannot be edited or deleted — append only
- Events include: transfer start, flow rate changes, ullage readings, alarm triggers, pause/resume, valve changes, document uploads
- Event log exportable as PDF or CSV for incident investigation

**Acceptance Criteria:**
- [ ] All listed event types are captured automatically
- [ ] Log is append-only — no edit/delete operations
- [ ] Export to PDF and CSV works correctly

---

#### F-017: Ship-Shore Communication Log
> **Phase:** 1 · **Priority:** P1 · **Roles:** Operations Manager, Field Operator

**Requirements:**
- Free-text communication entries linked to the transfer record
- Each entry: timestamp, author, message content
- Supports: routine updates, instructions, discrepancy notes, officer/terminal coordination
- Communication log forms part of the transfer record and is included in post-transfer documentation

**Acceptance Criteria:**
- [ ] Communication entries can be added by authorized users
- [ ] Entries are timestamped and linked to the transfer
- [ ] Communication log is included in post-transfer document export

---

### Phase 4 — Transfer Completion & Sampling

#### F-018: Transfer Completion Workflow
> **Phase:** 1 · **Priority:** P0 · **Roles:** Operations Manager, Terminal Manager

**Requirements:**
- Operator marks transfer as complete — system prompts for closing meter reading
- Closing ullage recorded for all destination tanks
- Final shore received volume calculated: opening ullage minus closing ullage with temperature and trim corrections
- Final ship discharged volume confirmed with ship officer
- System calculates and displays closing variance

**Acceptance Criteria:**
- [ ] System prompts for closing meter reading on completion
- [ ] Temperature and trim corrections are applied to closing volume
- [ ] Closing variance is displayed immediately

---

#### F-019: Structured Sampling Workflow
> **Phase:** 3 · **Priority:** P2 · **Roles:** Field Operator, Terminal Manager

**Requirements:**
- Sample record created at transfer completion: product, tank, transfer ID, date/time
- Sample details: who drew the sample, at what stage (mid-transfer or closing), sample type (composite / spot / drip)
- Sample destination tracked: internal lab, third-party surveyor, or retained
- Lab result entry: density, flash point, water content, product-specific parameters per product specification
- Result linked back to transfer record — quality status set to: Passed / Failed / Pending
- Failed result triggers alert to Terminal Manager and customer (if configured)
- Retained sample location and seal number recorded for dispute purposes

**Acceptance Criteria:**
- [ ] Sample records capture all required fields
- [ ] Lab results are linked to transfer record with quality status
- [ ] Failed results trigger configurable alerts
- [ ] Retained sample tracking includes location and seal number

---

#### F-020: Quantity Certificate Builder
> **Phase:** 1 · **Priority:** P0 · **Roles:** Terminal Manager, Operations Manager

The shore quantity certificate is the legal document recording the volume received by the terminal. It must be generated from system data and co-signed by the terminal and ship.

**Requirements:**
- Auto-populated from transfer data: vessel name, berth, product, opening/closing ullage, observed temperature, trim
- Automatic volume correction: observed volume to 15°C reference temperature using product density table
- Trim and list correction applied using vessel's calibration tables (uploaded during vessel call setup)
- Certificate PDF generated and presented for digital signature
- Terminal supervisor signs in CTOS; ship officer signs via email link or in-app QR
- Signed certificate attached to transfer record and shipment documentation

**Acceptance Criteria:**
- [ ] Certificate auto-populates from transfer data without manual entry
- [ ] Volume correction to 15°C is accurate per density tables
- [ ] PDF is generated and supports digital co-signature
- [ ] Signed certificate is immutable and linked to transfer record

---

### Phase 5 — Post-Transfer Reconciliation & Closure

#### F-021: Transfer Closure Workflow
> **Phase:** 1 · **Priority:** P0 · **Roles:** Operations Manager, Terminal Manager

**Requirements:**
- Formal 3-way reconciliation: Bill of Lading quantity vs shore received vs ship discharged
- Variance explanation required if any comparison exceeds tolerance
- Explanation categories: meter fault, density difference, temperature correction, sampling discrepancy, vessel error
- Closure blocked until all variances are explained or within tolerance
- Once closed, transfer status is COMPLETED — no further edits allowed

**Acceptance Criteria:**
- [ ] 3-way reconciliation displays all three figures with variance
- [ ] Closure is blocked when unexplained variance exceeds tolerance
- [ ] Closed transfer is fully immutable

---

#### F-022: Loss Accounting
> **Phase:** 3 · **Priority:** P2 · **Roles:** Terminal Manager

**Requirements:**
- Transfer losses calculated per product per vessel call
- Losses categorised: measurement uncertainty / operational loss / unexplained loss
- Monthly loss account report per product: total received vs total allocated to customers
- Loss thresholds configurable — breaches trigger review workflow with Terminal Manager

**Acceptance Criteria:**
- [ ] Loss calculation runs automatically on transfer closure
- [ ] Monthly loss report is available per product
- [ ] Configurable thresholds trigger review workflows

---

## 5. Shipment Diagram Engine

The Shipment Diagram Engine is the defining visual feature of the CST module. It generates an interactive, real-time flow diagram for every active transfer, allowing all users to see the physical flow path, live metrics, and operational status on a single screen.

### F-023: Diagram Architecture
> **Phase:** 1 (static) / Phase 2 (animated) · **Priority:** P0

Diagrams are built dynamically from the terminal's infrastructure graph. Every diagram is unique to the transfer — it reflects the actual physical route selected, not a generic schematic.

| Component | Representation | Data Displayed |
|-----------|----------------|----------------|
| Vessel node | Ship icon with name and berth number | ETA, status, current cargo volume |
| Berth / manifold node | Connection point with hose indicator | Connection status, pressure |
| Pipeline edge | Animated flow line | Flow rate, direction, product colour coding |
| Pump node | Pump symbol with status indicator | Running / stopped / fault, flow rate |
| Tank node | Cylindrical tank with fill level | Current level, product, capacity %, temperature |
| Valve node | Valve symbol (open/closed state) | Open / closed / locked |
| Truck bay node | Loading arm icon | Truck ID, loading status, volume |
| Cross-terminal link | Dashed pipeline with terminal label | Source terminal, destination terminal, pipeline status |

---

### F-024: Diagram Interactions
> **Phase:** 2 · **Priority:** P0

**Requirements:**
- Click any node to open a detail panel with full metrics and available actions
- Click a pipeline edge to view segment details: diameter, length, current flow rate, last maintenance
- Drag diagram canvas to pan; scroll to zoom
- Pin specific nodes to always show their metrics inline (no click required)
- Toggle between: schematic view (simplified) and infrastructure view (full pipeline network)
- Real-time animated flow lines: direction arrows move along pipeline in the direction of flow
- Product-colour coding: each chemical product assigned a colour, pipeline edge matches the product in flow

---

### F-025: Live Metrics Overlay
> **Phase:** 2 · **Priority:** P0

**Requirements:**
- Flow rate badge on each active pipeline segment (m³/h)
- Tank fill percentage displayed inside tank node
- ETA to completion displayed at top of diagram
- Running ship/shore variance displayed in top-right corner
- Alert indicators: yellow = warning, red = alarm, pulsing = requires action

---

### F-026: Diagram States
> **Phase:** 1 · **Priority:** P0

| Status | Visual Indicator | User Action Available |
|--------|------------------|----------------------|
| Planned | Grey dashed lines, static nodes | Edit plan, confirm route, start transfer |
| Awaiting Checklist | Amber outline on source/destination | Complete ISGOTT checklist |
| Ready to Start | Green outline, animated on hover | Start transfer |
| In Progress | Animated blue flow lines | Monitor, pause, adjust rate, emergency stop |
| Paused | Amber static lines, pause icon | Resume or terminate |
| Completing | Green flow slowing animation | Confirm closing ullage |
| Pending Closure | Teal outline, checklist badge | Complete reconciliation and close |
| Completed | Grey, static, checkmark badge | View record, export documents |
| Terminated | Red outline, X badge | View record, initiate incident report |

---

### F-027: Multi-Transfer View
> **Phase:** 3 · **Priority:** P1

**Requirements:**
- Terminal-level diagram showing ALL active transfers simultaneously
- Each active transfer shown as a distinct animated flow path on the terminal's infrastructure map
- Conflict highlights: if two transfers share a pipeline segment, segment shown in amber with conflict warning
- Filter by: product type, transfer status, berth, user role
- Drill into any single transfer from the multi-transfer view

---

## 6. Cross-Terminal Transfer

Cross-terminal transfers occur when a product must be moved between two physically separate terminals — either through a shared inter-terminal pipeline, or via intermediate transport (barge or road tanker). This is a first-class transfer type in CTOS.

### 6.1 Cross-Terminal Transfer Types

| Method | Description | Use Case |
|--------|-------------|----------|
| **Direct pipeline** | Dedicated pipeline connecting two terminals owned by the same operator | High-volume, frequent transfers between adjacent terminals |
| **Barge shuttle** | Product loaded into a barge at Terminal A and discharged at Terminal B | Medium distance, product requiring maritime transport |
| **Road tanker relay** | Road tanker loaded at Terminal A and discharged at Terminal B | Short distance, small volumes, no shared pipeline |

### F-028: Cross-Terminal Planning
> **Phase:** 3 · **Priority:** P1

**Requirements:**
- Transfer initiated at source terminal by Terminal Manager or Planner
- Request sent to destination terminal's operations team for tank allocation confirmation
- Both terminals must confirm before transfer is scheduled
- System checks product compatibility at both source and destination tanks
- Cross-terminal transfer creates linked transfer records at both terminals — changes at one reflected at the other in real time

### F-029: Pipeline Hand-Off Coordination
> **Phase:** 3 · **Priority:** P1

**Requirements:**
- For direct pipeline transfers: source terminal opens the inter-terminal pipeline valve; destination confirms receipt
- Both terminals can monitor the same pipeline segment simultaneously
- Flow rate and pressure visible at both ends — alerts at either terminal notify both operations teams
- Valve status synchronised: a valve change at either terminal updates the diagram at both

### F-030: Dual-Site Shipment Diagram
> **Phase:** 3 · **Priority:** P1

**Requirements:**
- Cross-terminal transfer generates a split diagram: left panel = source terminal, right panel = destination
- Inter-terminal pipeline shown as a bridge element connecting both panels
- Live metrics visible at both ends: flow rate at source manifold and at destination manifold
- Each terminal's operations team works within their own panel but can read the other's data

### F-031: Cross-Terminal Quantity Reconciliation
> **Phase:** 3 · **Priority:** P1

**Requirements:**
- Source terminal records volume loaded into pipeline / barge / truck at source
- Destination terminal records volume received into destination tank
- System calculates pipeline line-fill volume (for direct pipeline) using stored pipeline capacity data
- Barge/truck transfers: load certificate at source vs. discharge certificate at destination
- Variance reconciliation: same 3-way closure workflow, with both Terminal Managers in the approval chain

### 6.4 Cross-Terminal Roles & Permissions

| Role | Source Terminal Access | Destination Terminal Access |
|------|----------------------|---------------------------|
| **Group Terminal Manager** | Full read/write | Full read/write |
| **Terminal Manager (A)** | Full read/write | Read only + approval actions |
| **Terminal Manager (B)** | Read only | Full read/write |
| **Operations Manager (A)** | Operations read/write | Read only (diagram) |
| **Operations Manager (B)** | Read only (diagram) | Operations read/write |
| **Field Operator (A)** | Own tasks only | No access |
| **Field Operator (B)** | No access | Own tasks only |

---

## 7. Transfer Templates

### F-032: Transfer Templates
> **Phase:** 3 · **Priority:** P2

For regular products and regular vessels (e.g. a weekly tanker call with the same product to the same tanks), operators can save a complete transfer configuration as a reusable template.

**Template Contents:**
- Transfer type and direction
- Default product and nominated volume
- Default source and destination assets (tank, berth, truck bay)
- Pipeline route and pump configuration
- Target flow rate
- Pre-transfer checklist template reference
- Vapour return configuration
- Sample plan (sample type, destination, frequency)

**Template Usage:**
- Create new transfer from template — all fields pre-populated
- Operator reviews and adjusts any field before confirming
- Validation re-runs on creation: tank availability, product compatibility, pipeline status
- Templates versioned — changes create new version, previous version retained
- Template usage tracked: last used, total uses, common deviations from template

---

## 8. Data Model

The following entities form the core data model for the CST module. All entities are linked to the parent terminal infrastructure model.

### 8.1 Core Entities

| Entity | Key Attributes | Relationships |
|--------|---------------|---------------|
| `vessel_call` | id, vessel_name, imo_number, eta, ata, atd, berth_id, agent, status | has many parcels, documents, communications |
| `parcel` | id, vessel_call_id, product_id, nominated_volume, owner, quality_spec, status | has many transfer_records, samples |
| `transfer_record` | id, parcel_id, type, source_asset, dest_asset, status, planned_volume, actual_volume, start_time, end_time | has one route, many events, many ullage_readings |
| `transfer_route` | id, transfer_id, pipeline_segments[], pump_ids[], valve_lineup | belongs to transfer_record |
| `transfer_event` | id, transfer_id, event_type, timestamp, user_id, value, notes | belongs to transfer_record (append-only) |
| `ullage_reading` | id, transfer_id, tank_id, reading_type, value, temperature, observed_by, timestamp | belongs to transfer_record |
| `ship_figure` | id, transfer_id, reported_by, timestamp, volume, method, notes | belongs to transfer_record |
| `flow_reading` | id, transfer_id, pipeline_segment_id, flow_rate, timestamp | belongs to transfer_record |
| `isgott_checklist` | id, transfer_id, template_version, items[], terminal_signatory, vessel_signatory, signed_at | belongs to transfer_record (1:1) |
| `shore_connection` | id, transfer_id, hose_serial, diameter, max_pressure, test_date, test_result, photo_url | belongs to transfer_record |
| `sample_record` | id, transfer_id, tank_id, drawn_by, drawn_at, sample_type, destination, lab_result, status | belongs to transfer_record |
| `quantity_certificate` | id, transfer_id, gross_volume, net_volume_15c, density, temperature, trim_correction, signed_at | belongs to transfer_record (1:1) |
| `cross_terminal_link` | id, source_terminal_id, dest_terminal_id, source_transfer_id, dest_transfer_id, method, status | links two transfer_records |
| `transfer_template` | id, name, terminal_id, type, product_id, source_asset, dest_asset, route_config, version | used by many transfer_records |
| `transfer_variance` | id, transfer_id, bol_volume, shore_volume, ship_volume, variance_pct, explanation, resolved_by | belongs to transfer_record (1:1) |

---

## 9. User Stories

### 9.1 Terminal Manager

- As a Terminal Manager, I want to **view all active transfers on a single terminal diagram** so that I can identify conflicts and operational bottlenecks without visiting each transfer individually.
- As a Terminal Manager, I want to **receive an alert when the ship/shore variance on any transfer exceeds tolerance** so that I can intervene before the transfer is closed with an unexplained loss.
- As a Terminal Manager, I want to **approve a transfer template before it is used by planners** so that standard operating configurations are controlled and auditable.
- As a Terminal Manager, I want to **initiate a cross-terminal transfer request** and track its status at both terminals from a single dashboard.

### 9.2 Planner / Logistics

- As a Planner, I want to **create a vessel call and split it into parcels** so that each product cargo is tracked independently from arrival through to closure.
- As a Planner, I want the system to **recommend tanks automatically** so that I can complete tank allocation in under five minutes for a standard vessel call.
- As a Planner, I want to **use a transfer template for repeat vessel calls** so that I do not need to reconfigure the same pipeline route and checklist settings each time.
- As a Planner, I want to **view the ETA calculator for all active transfers** so that I can schedule the next vessel arrival without risking berth or tank conflicts.

### 9.3 Operations Manager

- As an Operations Manager, I want to **monitor live flow rate, ullage, pressure, and temperature** for all active transfers from the operations dashboard so that I can respond to deviations without waiting for field reports.
- As an Operations Manager, I want to **pause a transfer and record the reason** so that the event is logged and the field team is notified immediately.
- As an Operations Manager, I want to **re-route a transfer to an alternative tank mid-operation** so that I can respond to an unexpected tank constraint without stopping the operation.

### 9.4 Field Operator

- As a Field Operator, I want to **complete the shore connection record on mobile** so that I can capture hose details at the manifold without returning to the control room.
- As a Field Operator, I want to **record ullage readings from my mobile device** so that the operations team sees updated levels in real time.
- As a Field Operator, I want to **view the valve lineup for my assigned transfer** so that I know exactly which valves to open and close before the transfer starts.
- As a Field Operator, I want to **trigger an emergency stop from the mobile app** so that I can pause a transfer immediately if I observe a problem at the manifold.

---

## 10. Notifications & Alerts

| Trigger | Severity | Recipients | Channel |
|---------|----------|------------|---------|
| Ship/shore variance > 0.3% | ⚠️ Warning | Operations Manager, Terminal Manager | In-app, email |
| Ship/shore variance > 0.5% | 🔴 Critical | Terminal Manager, Group Manager | In-app, email, push |
| Tank HLA (High Level Alarm) | 🔴 Critical | Field Operator, Operations Manager | In-app, push |
| Pipeline pressure threshold breach | 🔴 Critical | Field Operator, Operations Manager | In-app, push |
| Transfer paused (any reason) | ⚠️ Warning | Operations Manager, Terminal Manager | In-app, email |
| Emergency stop activated | 🔴 Critical | All terminal roles | In-app, push, email |
| ISGOTT checklist not completed T-1h | ⚠️ Warning | Planner, Terminal Manager | In-app, email |
| ETA deviation > 15% from plan | ⚠️ Warning | Operations Manager, Planner | In-app |
| Cross-terminal transfer awaiting confirmation | ℹ️ Info | Destination Terminal Manager | In-app, email |
| Sample result: Failed | ⚠️ Warning | Terminal Manager, Quality team | In-app, email |
| Transfer not closed within 24h of completion | ⚠️ Warning | Terminal Manager | In-app, email |
| Variance explanation required at closure | ⚠️ Warning | Operations Manager, Terminal Manager | In-app |

---

## 11. Technical Requirements

### 11.1 Performance

| Metric | Target |
|--------|--------|
| Diagram real-time update latency | < 2 seconds from data change to visual update |
| Transfer event log write latency | < 500ms |
| Dashboard load time | < 3 seconds for full terminal with 20 concurrent transfers |
| Mobile offline mode | Required for ullage readings and event log entries (sync on reconnect) |

### 11.2 Integrations

| System | Integration Type | Data Exchanged |
|--------|-----------------|----------------|
| Radar level gauges (Rosemount, Endress+Hauser) | OPC-UA / Modbus TCP | Tank level, temperature (real-time polling) |
| Flow meters (Emerson, Yokogawa) | OPC-UA / 4-20mA via gateway | Flow rate, totaliser (real-time) |
| Pressure transmitters | OPC-UA / 4-20mA via gateway | Pipeline pressure (real-time) |
| Vessel AIS | REST API (MarineTraffic / VT Explorer) | Vessel position, ETA updates |
| LIMS (Laboratory) | REST API (stub in Phase 1) | Sample results ingestion |
| ERP / SAP | REST API (stub in Phase 1) | Transfer completion events for invoicing |
| Weighbridge | Serial / TCP | Truck gross weight, tare weight |

### 11.3 Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React + TypeScript | SPA, component library TBD |
| Diagram Engine | React Flow + D3.js | Custom node renderers per asset type |
| Backend API | Node.js (Express) or Django | REST + WebSocket endpoints |
| Database | PostgreSQL | Time-series data for flow/ullage in TimescaleDB extension |
| Real-time | WebSockets (Socket.io) | Transfer events, meter readings, alerts |
| Caching | Redis | Session, real-time state, rate limiting |
| Mobile | React Native | Shared component library with web |
| Infrastructure | Docker + Kubernetes | On-premise and private cloud deployable |
| Auth | JWT + RBAC | Role-based access per terminal and per transfer type |

---

## 12. Security & Compliance

### 12.1 Role-Based Access Control

| Feature | Admin | Terminal Mgr | Ops Mgr | Planner | Field Operator | Viewer |
|---------|-------|-------------|---------|---------|----------------|--------|
| Create vessel call | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Allocate tanks | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Start / stop transfer | ✅ | ✅ | ✅ | ❌ | ✅ (own) | ❌ |
| Emergency stop | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Sign ISGOTT checklist | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Record ullage / flow | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Close transfer | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View all transfers | ✅ | ✅ | ✅ | ✅ | Own | ✅ |
| Configure templates | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Cross-terminal approval | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### 12.2 Audit & Data Integrity

- All transfer events are **append-only** — no record can be edited or deleted after creation
- All user actions logged with user ID, timestamp, IP address, and action detail
- Signed documents (ISGOTT, quantity certificates) are **cryptographically hashed** at signature time
- Database-level **row-level security** enforced per terminal
- Audit log accessible to Group Terminal Manager and Admin only

---

## 13. Development Roadmap

### Phase 1 — Core Transfer Engine (Months 1–3)

| # | Feature | Feature ID |
|---|---------|-----------|
| 1 | Vessel call and parcel management | F-001, F-002 |
| 2 | Tank allocation with compatibility engine | F-003 |
| 3 | Basic shipment diagram (static, plan view) | F-023, F-026 |
| 4 | ISGOTT checklist (digital, co-signature) | F-005 |
| 5 | Transfer start / stop / pause workflow | F-015 |
| 6 | Manual ullage and flow rate entry | F-008, F-010 |
| 7 | Transfer event log | F-016 |
| 8 | Quantity certificate generation (PDF) | F-020 |
| 9 | Basic transfer closure with variance entry | F-018, F-021 |

### Phase 2 — Live Monitoring & Diagram Engine (Months 4–6)

| # | Feature | Feature ID |
|---|---------|-----------|
| 1 | Animated real-time shipment diagram | F-023, F-024, F-025 |
| 2 | Sensor integration (OPC-UA, flow meters, level gauges) | — (integration) |
| 3 | Ship vs. shore reconciliation real-time display | F-011 (live) |
| 4 | Dynamic ETA calculator | F-009 |
| 5 | Pressure and temperature monitoring | F-012 |
| 6 | Vapour return management | F-013 |
| 7 | Multi-tank parcel splitting | F-014 |
| 8 | Emergency stop with notifications | F-015 (enhanced) |
| 9 | Shore connection recording module | F-006 |
| 10 | Mobile field app (iOS + Android) | — (platform) |

### Phase 3 — Cross-Terminal & Advanced Features (Months 7–9)

| # | Feature | Feature ID |
|---|---------|-----------|
| 1 | Cross-terminal transfer type (direct pipeline and barge) | F-028 |
| 2 | Dual-site split diagram | F-030 |
| 3 | Cross-terminal roles and approval workflow | F-029 |
| 4 | Transfer templates | F-032 |
| 5 | Structured sampling workflow | F-019 |
| 6 | Loss accounting dashboard | F-022 |
| 7 | Multi-transfer terminal overview diagram | F-027 |
| 8 | Full document management (BOL, SDS, CoA) | — |

### Phase 4 — Intelligence & Integration (Months 10–12)

| # | Feature | Feature ID |
|---|---------|-----------|
| 1 | AIS vessel ETA integration | — (integration) |
| 2 | LIMS sample result ingestion | — (integration) |
| 3 | ERP / SAP transfer event export | — (integration) |
| 4 | Performance analytics: transfer duration, loss rates, variance trends | — |
| 5 | Transfer anomaly detection (ML-assisted) | — |

---

## 14. Success Metrics

| Metric | Baseline (pre-CTOS) | Target (6 months post-launch) |
|--------|---------------------|-------------------------------|
| Time to complete transfer planning per vessel call | 45–90 minutes | < 15 minutes |
| Ship/shore variance disputes per month | Measured post-launch | Reduction of 40% |
| ISGOTT checklist completion rate | Tracked on paper | 100% digital, 100% co-signed |
| Transfer closure time (from completion to closed) | > 24 hours average | < 4 hours average |
| Quantity certificate generation time | 1–2 hours manual | < 5 minutes automated |
| Unplanned transfer pauses due to planning errors | Measured post-launch | Reduction of 30% |
| Field operator mobile adoption | N/A | > 80% of field tasks recorded via app |

---

## 15. Glossary

| Term | Definition |
|------|-----------|
| **ATA** | Actual Time of Arrival — the time the vessel physically arrives at berth |
| **ATD** | Actual Time of Departure — the time the vessel departs berth |
| **Bill of Lading (BOL)** | Legal document issued by the vessel stating the quantity loaded at the loading port |
| **ETA** | Estimated Time of Arrival |
| **HHLA** | High-High Level Alarm — the critical maximum level in a storage tank |
| **HLA** | High Level Alarm — the warning level before HHLA in a storage tank |
| **ISGOTT** | International Safety Guide for Oil Tankers and Terminals — the industry standard for ship/shore safety checklists |
| **Line fill** | The volume of product remaining in a pipeline after a transfer, not yet delivered to the destination |
| **Parcel** | A portion of a vessel's cargo belonging to a single product/customer combination |
| **Ullage** | The space between the liquid surface and the top of a tank or vessel cargo compartment |
| **VRU** | Vapour Recovery Unit — equipment that captures hydrocarbon vapours during transfer to prevent atmospheric release |
| **VOC** | Volatile Organic Compound — chemicals that evaporate easily at room temperature, subject to environmental regulations |
| **Shore figures** | The volume measured by the terminal's metering equipment during a transfer |
| **Ship figures** | The volume reported by the vessel's cargo measurement system during a transfer |
| **Quantity Certificate** | The legal document issued by the terminal recording the shore-measured volume received or dispatched |

---

## 16. Feature Register

A quick-reference index of all features by ID, phase, and priority for development tracking.

| Feature ID | Feature Name | Phase | Priority | Section |
|-----------|-------------|-------|----------|---------|
| F-001 | Vessel Nomination | 1 | P0 | §4.1 |
| F-002 | Parcel Management | 1 | P0 | §4.1 |
| F-003 | Tank Allocation | 1 | P0 | §4.1 |
| F-004 | Pre-Transfer Checklist Builder | 1 | P1 | §4.1 |
| F-005 | ISGOTT Checklist (Digital Co-Signature) | 1 | P0 | §4.2 |
| F-006 | Shore Connection Recording | 2 | P1 | §4.2 |
| F-007 | Pipeline Route Confirmation | 1 | P0 | §4.2 |
| F-008 | Flow Rate Management | 1 | P0 | §4.3 |
| F-009 | Dynamic ETA Calculator | 2 | P1 | §4.4 |
| F-010 | Ullage & Tank Level Tracking | 1 | P0 | §4.5 |
| F-011 | Ship vs. Shore Reconciliation | 1 | P0 | §4.6 |
| F-012 | Pressure & Temperature Monitoring | 2 | P1 | §4.7 |
| F-013 | Vapour Return Line Management | 2 | P1 | §4.8 |
| F-014 | Multi-Tank Parcel Splitting | 2 | P1 | §4.9 |
| F-015 | Emergency Stop & Transfer Pause | 1 | P0 | §4.10 |
| F-016 | Automatic Event Log | 1 | P0 | §4.11 |
| F-017 | Ship-Shore Communication Log | 1 | P1 | §4.12 |
| F-018 | Transfer Completion Workflow | 1 | P0 | §4.13 |
| F-019 | Structured Sampling Workflow | 3 | P2 | §4.14 |
| F-020 | Quantity Certificate Builder | 1 | P0 | §4.15 |
| F-021 | Transfer Closure Workflow | 1 | P0 | §4.16 |
| F-022 | Loss Accounting | 3 | P2 | §4.17 |
| F-023 | Diagram Architecture (Nodes + Rendering) | 1/2 | P0 | §5.1 |
| F-024 | Diagram Interactions | 2 | P0 | §5.2 |
| F-025 | Live Metrics Overlay | 2 | P0 | §5.3 |
| F-026 | Diagram States | 1 | P0 | §5.4 |
| F-027 | Multi-Transfer View | 3 | P1 | §5.5 |
| F-028 | Cross-Terminal Planning | 3 | P1 | §6.2 |
| F-029 | Pipeline Hand-Off Coordination | 3 | P1 | §6.2 |
| F-030 | Dual-Site Shipment Diagram | 3 | P1 | §6.2 |
| F-031 | Cross-Terminal Reconciliation | 3 | P1 | §6.3 |
| F-032 | Transfer Templates | 3 | P2 | §7 |

---

*CTOS — Chemical Shipment Transfer Module PRD  |  v1.0  |  March 2026*
