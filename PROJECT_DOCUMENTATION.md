# Vault Systems UI – Architecture & Technical Documentation

## 1. Project Overview
Vault Systems is a high-end, modern dashboard designed to manage configurations for an automated Lords Mobile bot system. The interface allows administrators to easily configure, tweak, and command individual bot accounts by translating human-readable UI interactions into exact JSON structures that the backend bot engine directly consumes.

The UI is built using a modern **"Tactical Dark"** aesthetic, featuring deep `#080A0F` / `#161B25` backgrounds, glassmorphic inputs, neon `#00FFB2` (success/complete) and `#FF4D6D` (danger/delete) accents, and smooth GSAP/Framer Motion animations.

### Tech Stack
* **Framework:** Next.js (App Router), React
* **Styling:** Tailwind CSS v4, Framer Motion
* **Backend:** Node.js (Local API Routes)
* **Storage:** Direct JSON File System read/writes

---

## 2. How the Panel Links with Config JSON Files
The core responsibility of the panel is to act as a visual editor for local `.json` configuration files associated with each individual bot account (identified by `iggId`). 

### File Structure Context
The bot expects its configurations to be placed in a `config/` directory. Each account has a dedicated sub-directory named after its `iggId` (e.g., `config/987303841/`).
Within this directory, there are multiple configuration files:
* `settings.json` - Controls in-game automated logic (Gathering, Research, Guild Fest, etc.)
* `banksettings.json` - Controls banking automation, resource transfers, and admin whitelisting.
* `manageGuild.json` - Guild management rules.

### The API Bridge
When a user opens a modal (e.g., Guild Fest or Research) in the UI, the frontend makes a `GET` request to `/api/settings/[iggId]`. 
1. The API reads the JSON files directly from the disk using `fs.promises.readFile`.
2. The UI maps the deep, complex JSON tree to localized React states (`useState`).
3. As the user toggles switches or changes inputs, the local state mutates.
4. When the user clicks **Save Changes**, a `PUT` request is dispatched to `/api/settings/[iggId]` with the fully reconstructed JSON payload.
5. The API writes the payload directly back into `settings.json` or `banksettings.json`, ensuring the bot engine picks up the changes in real-time.

---

## 3. The Name and ID System

The bot engine does not natively read English strings like "Complete Admin Quests" or "Upgrade Military". Instead, it relies on strict **Integer ID** assignments to identify tasks and research trees. The panel bridges this gap by mapping human-readable names to these internal IDs.

### 3.1 Research Task IDs
The Research system uses an array-based toggle logic. In the UI, research trees are mapped to specific integer IDs ranging from 1 to 17. 

**Research ID Map (`RESEARCH_TREE_KEYS`):**
* `1` - Economy
* `2` - Defense
* `3` - Military
* `5` - Monster Hunt
* `7` - Upgrade Defenses
* `8` - Upgrade Military
* `9` - Army Leadership
* `10` - Military Command
* `11` - Familiars
* `12` - Sigils
* `13` - Wonder Battles
* `14` - Familiar Battles
* `15` - Gear
* `16` - Advanced Wonder Battles
* `17` - Mana Awakening

**How it saves in JSON (`settings.json`):**
If a user selects "Economy" and "Military", the UI converts these names to `1` and `3`, and saves them to the `researchTarget` array in the JSON:
```json
"researchSettings": {
    "researchTarget": [1, 3]
}
```

### 3.2 Guild Fest Task IDs
Guild Fest is significantly more complex. It relies on a dictionary structure where the `key` is the **Mission ID** and the `value` is an object defining the completion/deletion parameters for that specific mission.

**Guild Fest ID Map (`MISSION_MAP` excerpt):**
* `1` - Complete Admin Quests
* `2` - Complete Guild Quests
* `5` - Hit monsters
* `10` - Cargo Ship Trades
* `19` - Increase total Might
* `98` - Spend Gems
* `0` - Get a random quest!
*(See `MISSION_MAP` in the UI codebase for the full list of ~40 tracked quests)*

**How it maps to UI sub-states:**
In the Guild Fest Modal, the UI offers **Complete Mode** and **Delete Mode**, each split into three sub-tiers: `Guild Task`, `120%`, and `200%`.

When the UI generates the final JSON payload, it nests these configurations under the exact internal Mission ID. 

**Example output in `settings.json`:**
If the user configures "Complete Admin Quests" (ID: `1`) with specific defaults and a 200% solo configuration:

```json
"gfMissionComplete": {
    "missionsToComplete_": {
        "1": {
            "ToComplete": true,
            "TakeIfHigherThanPoints": 175,
            "MaxPoints": 355,
            "IsAutomated": 0,
            "ToCompleteSolo120": false,
            "TakeIfHigherThanPointsSolo120": 0,
            "MaxPointsSolo120": 400,
            "ToCompleteSolo200": true,
            "TakeIfHigherThanPointsSolo200": 300,
            "MaxPointsSolo200": 650
        }
    }
}
```
If the user configures deletion parameters for the same task in the **✕ Delete** tab:
```json
"gfMissionRemove": {
    "missionsToRemove_": {
        "1": {
            "ToRemove": true,
            "RemoveIfLowerThanPoints": 100,
            "MaxPoints": 355,
            "ToRemoveSolo120": false,
            "RemoveIfLowerThanPointsSolo120": 0,
            "MaxPointsSolo120": 400,
            "ToRemoveSolo200": false,
            "RemoveIfLowerThanPointsSolo200": 0,
            "MaxPointsSolo200": 650
        }
    }
}
```

### 4. Sub-Tab Max Point Limits
To prevent configuration errors, the UI enforces max-point clamping based on the selected tier in the Guild Fest modal:
* **Guild Task (Default):** Hard cap at `355` points.
* **120% Tier:** Hard cap at `400` points.
* **200% Tier:** Hard cap at `650` points.
All manual numeric inputs are prevented from exceeding these limits when pushed to the configuration file.
