/**
 * Settings Field Mapper
 * Maps UI field names to their corresponding JSON paths in settings.json
 */

export interface FieldMapping {
    uiField: string
    jsonPath: string
    type: 'boolean' | 'number' | 'string' | 'time'
    category: string
    subcategory?: string
    min?: number
    max?: number
}

export const SETTINGS_FIELD_MAP: FieldMapping[] = [
    // General Settings - Basic Tab
    {
        uiField: 'Use RSS From Bag (Build, Research, etc)',
        jsonPath: 'miscSettings.useResourceFromBag',
        type: 'boolean',
        category: 'general',
        subcategory: 'basic',
    },
    {
        uiField: 'Use VIP Points',
        jsonPath: 'miscSettings.useVipPoints',
        type: 'boolean',
        category: 'general',
        subcategory: 'basic',
    },
    {
        uiField: 'Use Exp Items',
        jsonPath: 'miscSettings.useExpItems',
        type: 'boolean',
        category: 'general',
        subcategory: 'basic',
    },
    {
        uiField: 'Open All Chests',
        jsonPath: 'miscSettings.autoOpenChests',
        type: 'boolean',
        category: 'general',
        subcategory: 'basic',
    },
    {
        uiField: 'Use Star Scrolls',
        jsonPath: 'miscSettings.useStarScrolls',
        type: 'boolean',
        category: 'general',
        subcategory: 'basic',
    },
    {
        uiField: 'Put Gems In Treasure Trove (30 Days)',
        jsonPath: 'miscSettings.autoTreasureTrove',
        type: 'boolean',
        category: 'general',
        subcategory: 'basic',
    },
    {
        uiField: 'Other Login Reconnect Time (Seconds)',
        jsonPath: 'connectionSettings.otherLoginTime',
        type: 'number',
        category: 'general',
        subcategory: 'basic',
        min: 0,
        max: 72000,
    },

    // General Settings - Quests Tab
    {
        uiField: 'Mystery Box',
        jsonPath: 'questSettings.autoMysteryBox',
        type: 'boolean',
        category: 'general',
        subcategory: 'quests',
    },
    {
        uiField: 'Turf Quests',
        jsonPath: 'questSettings.autoTurfQuest',
        type: 'boolean',
        category: 'general',
        subcategory: 'quests',
    },
    {
        uiField: 'Admin Quests',
        jsonPath: 'questSettings.autoAdminQuest',
        type: 'boolean',
        category: 'general',
        subcategory: 'quests',
    },
    {
        uiField: 'Daily Login Gifts',
        jsonPath: 'questSettings.dailyLoginGift',
        type: 'boolean',
        category: 'general',
        subcategory: 'quests',
    },
    {
        uiField: 'VIP Quests',
        jsonPath: 'questSettings.autoVIPQuest',
        type: 'boolean',
        category: 'general',
        subcategory: 'quests',
    },
    {
        uiField: 'Guild Quests',
        jsonPath: 'questSettings.autoGuildQuest',
        type: 'boolean',
        category: 'general',
        subcategory: 'quests',
    },
    {
        uiField: 'Adventure Log',
        jsonPath: 'questSettings.adventureLog',
        type: 'boolean',
        category: 'general',
        subcategory: 'quests',
    },
    {
        uiField: 'Open All Guild Quests',
        jsonPath: 'questSettings.openAllGuildQuest',
        type: 'boolean',
        category: 'general',
        subcategory: 'quests',
    },
    {
        uiField: 'Open All Admin Quests',
        jsonPath: 'questSettings.openAllAdminQuest',
        type: 'boolean',
        category: 'general',
        subcategory: 'quests',
    },
    {
        uiField: 'Quest Reserve',
        jsonPath: 'questSettings.questReserve',
        type: 'number',
        category: 'general',
        subcategory: 'quests',
    },

    // General Settings - Speed-ups Tab
    {
        uiField: 'Use Speed-ups',
        jsonPath: 'speedUpSettings.useSpeedUps',
        type: 'boolean',
        category: 'general',
        subcategory: 'speedups',
    },
    {
        uiField: 'Use Normal Speeds Only for Building',
        jsonPath: 'speedUpSettings.generalForBuildOnly',
        type: 'boolean',
        category: 'general',
        subcategory: 'speedups',
    },
    {
        uiField: 'Wait for Help',
        jsonPath: 'speedUpSettings.waitForHelp',
        type: 'boolean',
        category: 'general',
        subcategory: 'speedups',
    },
    {
        uiField: 'Max Speed Excess',
        jsonPath: 'speedUpSettings.maxSpeedUpExcess',
        type: 'time',
        category: 'general',
        subcategory: 'speedups',
    },
    {
        uiField: 'Building',
        jsonPath: 'speedUpSettings.autoBuildingSpeedUp',
        type: 'boolean',
        category: 'general',
        subcategory: 'speedups',
    },
    {
        uiField: 'Research',
        jsonPath: 'speedUpSettings.autoResearchSpeedUp',
        type: 'boolean',
        category: 'general',
        subcategory: 'speedups',
    },
    {
        uiField: 'Training',
        jsonPath: 'speedUpSettings.autoTrainingSpeedUp',
        type: 'boolean',
        category: 'general',
        subcategory: 'speedups',
    },
    {
        uiField: 'Healing',
        jsonPath: 'speedUpSettings.autoHealingSpeedUp',
        type: 'boolean',
        category: 'general',
        subcategory: 'speedups',
    },
    {
        uiField: 'Traps',
        jsonPath: 'speedUpSettings.autoTrapSpeedUp',
        type: 'boolean',
        category: 'general',
        subcategory: 'speedups',
    },
    {
        uiField: 'Pact Merging',
        jsonPath: 'speedUpSettings.autoMergingSpeedUp',
        type: 'boolean',
        category: 'general',
        subcategory: 'speedups',
    },
    {
        uiField: 'Lunar Gear',
        jsonPath: 'speedUpSettings.autoLunarGearSpeedUp',
        type: 'boolean',
        category: 'general',
        subcategory: 'speedups',
    },
    {
        uiField: 'Wall Repair',
        jsonPath: 'speedUpSettings.autoWallSpeedUp',
        type: 'boolean',
        category: 'general',
        subcategory: 'speedups',
    },
    {
        uiField: 'Trap Repair',
        jsonPath: 'speedUpSettings.autoTrapRepairSpeedUp',
        type: 'boolean',
        category: 'general',
        subcategory: 'speedups',
    },
    {
        uiField: 'Gear',
        jsonPath: 'speedUpSettings.autoGearSpeedUp',
        type: 'boolean',
        category: 'general',
        subcategory: 'speedups',
    },

    // General Settings - Labyrinth Tab
    {
        uiField: 'Attack Labyrinth',
        jsonPath: 'turfQuests.attackLabyrinth',
        type: 'boolean',
        category: 'general',
        subcategory: 'labyrinth',
    },
    {
        uiField: 'Only Use Free Attempt?',
        jsonPath: 'turfQuests.labOnlyFree',
        type: 'boolean',
        category: 'general',
        subcategory: 'labyrinth',
    },
    {
        uiField: 'Use Holy Star Items',
        jsonPath: 'turfQuests.useHolyStars',
        type: 'boolean',
        category: 'general',
        subcategory: 'labyrinth',
    },

    // General Settings - Tycoon Tab
    {
        uiField: 'Attack Kingdom Tycoon',
        jsonPath: 'turfQuests.attackKingdomTycoon',
        type: 'boolean',
        category: 'general',
        subcategory: 'tycoon',
    },
    {
        uiField: 'Only Use Free Attempt?',
        jsonPath: 'turfQuests.ktOnlyFree',
        type: 'boolean',
        category: 'general',
        subcategory: 'tycoon',
    },
    {
        uiField: 'Use Luck Tokens',
        jsonPath: 'turfQuests.useLuckTokens',
        type: 'boolean',
        category: 'general',
        subcategory: 'tycoon',
    },

    // General Settings - Guild Tab
    {
        uiField: 'Send Help',
        jsonPath: 'guildSettings.sendGuildHelp',
        type: 'boolean',
        category: 'general',
        subcategory: 'guild',
    },
    {
        uiField: 'Request Help',
        jsonPath: 'guildSettings.requestGuildHelp',
        type: 'boolean',
        category: 'general',
        subcategory: 'guild',
    },
    {
        uiField: 'Collect Guild Gifts',
        jsonPath: 'guildSettings.autoGuildGifts',
        type: 'boolean',
        category: 'general',
        subcategory: 'guild',
    },
    {
        uiField: 'Collect Fortune Packets',
        jsonPath: 'guildSettings.autoFortunePackets',
        type: 'boolean',
        category: 'general',
        subcategory: 'guild',
    },
    {
        uiField: 'Slow Help Speed (When bar full)',
        jsonPath: 'guildSettings.autoSlowHelpSpeed',
        type: 'boolean',
        category: 'general',
        subcategory: 'guild',
    },
    {
        uiField: 'Join Guild Showdown',
        jsonPath: 'guildSettings.joinShowdown',
        type: 'boolean',
        category: 'general',
        subcategory: 'guild',
    },
    {
        uiField: 'Check Helps Every',
        jsonPath: 'guildSettings.helpCheckDelay',
        type: 'number',
        category: 'general',
        subcategory: 'guild',
    },
    {
        uiField: 'Check Gifts Every',
        jsonPath: 'guildSettings.guildCheckDelay',
        type: 'number',
        category: 'general',
        subcategory: 'guild',
    },

    // General Settings - Turf Boosts Tab
    {
        uiField: 'Food Boost',
        jsonPath: 'kingdomBoosts.useFoodBoost',
        type: 'boolean',
        category: 'general',
        subcategory: 'turf-boosts',
    },
    {
        uiField: 'Stone Boost',
        jsonPath: 'kingdomBoosts.useStoneBoost',
        type: 'boolean',
        category: 'general',
        subcategory: 'turf-boosts',
    },
    {
        uiField: 'Wood Boost',
        jsonPath: 'kingdomBoosts.useWoodBoost',
        type: 'boolean',
        category: 'general',
        subcategory: 'turf-boosts',
    },
    {
        uiField: 'Ore Boost',
        jsonPath: 'kingdomBoosts.useOreBoost',
        type: 'boolean',
        category: 'general',
        subcategory: 'turf-boosts',
    },
    {
        uiField: 'Gold Boost',
        jsonPath: 'kingdomBoosts.useGoldBoost',
        type: 'boolean',
        category: 'general',
        subcategory: 'turf-boosts',
    },
    {
        uiField: 'Gathering Boost',
        jsonPath: 'kingdomBoosts.useGatherBoost',
        type: 'boolean',
        category: 'general',
        subcategory: 'turf-boosts',
    },
    {
        uiField: 'Reduce Upkeep',
        jsonPath: 'kingdomBoosts.useReducedUpkeep',
        type: 'boolean',
        category: 'general',
        subcategory: 'turf-boosts',
    },

    // General Settings - Daily Missions Tab
    {
        uiField: 'Daily Missions',
        jsonPath: 'questSettings.collectDailyQuests',
        type: 'boolean',
        category: 'general',
        subcategory: 'daily-missions',
    },
    {
        uiField: 'Send Emojis',
        jsonPath: 'questSettings.sendEmoji',
        type: 'boolean',
        category: 'general',
        subcategory: 'daily-missions',
    },
    {
        uiField: 'Shelter',
        jsonPath: 'questSettings.shelterQuest',
        type: 'boolean',
        category: 'general',
        subcategory: 'daily-missions',
    },
    {
        uiField: 'Labyrinth',
        jsonPath: 'questSettings.attackLabQuest',
        type: 'boolean',
        category: 'general',
        subcategory: 'daily-missions',
    },
    {
        uiField: 'Kingdom Tycoon',
        jsonPath: 'questSettings.attackTycoonQuest',
        type: 'boolean',
        category: 'general',
        subcategory: 'daily-missions',
    },

    // Protection Settings - Shield
    {
        uiField: 'Always Shielded',
        jsonPath: 'protectionSettings.alwaysOpenShield',
        type: 'boolean',
        category: 'protection',
        subcategory: 'shield',
    },
    {
        uiField: 'Redeploy Randomize Time (Minutes)',
        jsonPath: 'protectionSettings.shieldRandomTime',
        type: 'number',
        category: 'protection',
        subcategory: 'shield',
    },
    {
        uiField: 'Redeploy shield when time left is around',
        jsonPath: 'protectionSettings.shieldRedeployTime',
        type: 'number',
        category: 'protection',
        subcategory: 'shield',
    },
    {
        uiField: 'Use Longer Shields First',
        jsonPath: 'protectionSettings.biggerSheildsFirst',
        type: 'boolean',
        category: 'protection',
        subcategory: 'shield',
    },
    {
        uiField: 'Shield When Rallied',
        jsonPath: 'protectionSettings.openShieldWhenRallied',
        type: 'boolean',
        category: 'protection',
        subcategory: 'shield',
    },
    {
        uiField: 'Shield When Scouted',
        jsonPath: 'protectionSettings.openShieldWhenScouted',
        type: 'boolean',
        category: 'protection',
        subcategory: 'shield',
    },
    {
        uiField: 'Shield When Under Attack',
        jsonPath: 'protectionSettings.openShieldWhenUnderAttack',
        type: 'boolean',
        category: 'protection',
        subcategory: 'shield',
    },

    // Protection Settings - Anti-Scout
    {
        uiField: 'Always Anti-Scout',
        jsonPath: 'protectionSettings.alwaysAntiScout',
        type: 'boolean',
        category: 'protection',
        subcategory: 'anti-scout',
    },
    {
        uiField: 'Anti-Scout When Scouted',
        jsonPath: 'protectionSettings.antiScoutWhenScout',
        type: 'boolean',
        category: 'protection',
        subcategory: 'anti-scout',
    },
    {
        uiField: 'Use Longer Anti-Scout First',
        jsonPath: 'protectionSettings.useLongerAnti',
        type: 'boolean',
        category: 'protection',
        subcategory: 'anti-scout',
    },
    {
        uiField: 'Redeploy Anti-Scout when time left is around',
        jsonPath: 'protectionSettings.antiRedeployTime',
        type: 'number',
        category: 'protection',
        subcategory: 'anti-scout',
    },

    // Protection Settings - Gathering
    {
        uiField: 'Recall Gathering Troops if Attacked',
        jsonPath: 'protectionSettings.recallGatherTroopsWhenUnderAttack',
        type: 'boolean',
        category: 'protection',
        subcategory: 'gathering',
    },
    {
        uiField: 'Time to Wait Before Regathering (In Minutes)',
        jsonPath: 'protectionSettings.regatherWaitTime',
        type: 'number',
        category: 'protection',
        subcategory: 'gathering',
    },
    {
        uiField: 'Recall Gathering Troops if Scouted',
        jsonPath: 'protectionSettings.recallGatherTroopsWhenScouted',
        type: 'boolean',
        category: 'protection',
        subcategory: 'gathering',
    },
    {
        uiField: 'Recall Gathering Troops on Conflict',
        jsonPath: 'protectionSettings.recallGatherTroopsOnConflict',
        type: 'boolean',
        category: 'protection',
        subcategory: 'gathering',
    },

    // Protection Settings - Shelter
    {
        uiField: 'Recall Sheltered Troops After Attack',
        jsonPath: 'protectionSettings.recallShelterTroopsAfterAttack',
        type: 'boolean',
        category: 'protection',
        subcategory: 'shelter',
    },
    {
        uiField: 'Dont Shelter Siege',
        jsonPath: 'protectionSettings.dontShelterSiege',
        type: 'boolean',
        category: 'protection',
        subcategory: 'shelter',
    },
]

/**
 * Get value from nested object using dot notation path
 */
export function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
}

/**
 * Set value in nested object using dot notation path
 */
export function setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    const lastKey = keys.pop()!
    const target = keys.reduce((current, key) => {
        if (!(key in current)) {
            current[key] = {}
        }
        return current[key]
    }, obj)
    target[lastKey] = value
}

/**
 * Find mapping by UI field name
 */
export function findMappingByUiField(uiField: string): FieldMapping | undefined {
    return SETTINGS_FIELD_MAP.find((m) => m.uiField === uiField)
}

/**
 * Find mapping by JSON path
 */
export function findMappingByJsonPath(jsonPath: string): FieldMapping | undefined {
    return SETTINGS_FIELD_MAP.find((m) => m.jsonPath === jsonPath)
}

/**
 * Get all mappings for a category
 */
export function getMappingsByCategory(category: string, subcategory?: string): FieldMapping[] {
    return SETTINGS_FIELD_MAP.filter(
        (m) => m.category === category && (!subcategory || m.subcategory === subcategory)
    )
}
