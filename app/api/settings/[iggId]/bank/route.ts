export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import {
    mergeBankSettingsWithManageGuild,
    readBankSettingsFile,
    readManageGuildSettingsFile,
    writeBankSettingsFile,
    writeManageGuildSettingsFile,
} from '@/lib/fileSync'
import { DEFAULT_GUILD_COMMANDS } from '@/lib/defaultGuildCommands'

const DEFAULT_BANK_SETTINGS = {
    enableBank: false,
    clearOutgoingData: true,
    clearOutgoingDataTime: 7,
    lastClearCheckTime: 0,
    ignoreBalance: false,
    allowAdminBalance: false,
    allowAdminSkipLimit: true,
    useBagRss: false,
    saveLogToFile: false,
    allowChatCommands: true,
    allowMailCommands: true,
    autoDeleteCmdMail: false,
    disableMailResponse: false,
    disableErrorResponse: false,
    cmdPrefix: '!',
    adminRssLimit: [0, 0, 0, 0, 0],
    maxSendLimit: 40000000,
    maxSendDistance: 50,
    BuildspamMinimum: 3,
    allowExternalCommands: false,
    guildCommands: DEFAULT_GUILD_COMMANDS,
    accountData: [],
    outgoingData: [],
}

const DEFAULT_MANAGE_GUILD_SETTINGS = {
    enableAutoAccept: false,
    enableAutoRank: false,
    enableBlackList: false,
    accountData: [],
}

function normalizeBankSettings(settings: Record<string, unknown> | null | undefined) {
    return {
        ...DEFAULT_BANK_SETTINGS,
        ...settings,
        guildCommands: Array.isArray(settings?.guildCommands) && settings.guildCommands.length > 0 ? settings.guildCommands : DEFAULT_GUILD_COMMANDS,
        accountData: Array.isArray(settings?.accountData) ? settings.accountData : [],
        outgoingData: Array.isArray(settings?.outgoingData) ? settings.outgoingData : [],
    }
}

export async function GET(
    req: Request,
    { params }: { params: { iggId: string } }
) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        let bankSettings = normalizeBankSettings(null)
        let manageGuildSettings = DEFAULT_MANAGE_GUILD_SETTINGS

        try {
            bankSettings = normalizeBankSettings(await readBankSettingsFile(params.iggId))
        } catch {
            // Return default bank settings if banksettings.json does not exist.
        }

        try {
            manageGuildSettings = await readManageGuildSettingsFile(params.iggId)
        } catch {
            // Return disabled whitelist/blacklist defaults if manageGuild.json does not exist.
        }

        return NextResponse.json(mergeBankSettingsWithManageGuild(bankSettings, manageGuildSettings))
    } catch (error) {
        console.error('Error reading bank settings:', error)
        return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { iggId: string } }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Verify ownership and subscription
        const iggIdRecord = await prisma.iggId.findFirst({
            where: {
                iggId: params.iggId,
                userId: session.user.id,
            },
            include: {
                subscription: true,
            },
        })

        if (!iggIdRecord) {
            return NextResponse.json({ error: 'IGG ID not found or unauthorized' }, { status: 404 })
        }

        if (iggIdRecord.subscription?.expiresAt && new Date(iggIdRecord.subscription.expiresAt) < new Date()) {
            return NextResponse.json({
                error: 'Subscription expired. Please renew to make changes.'
            }, { status: 403 })
        }

        const settings = await req.json()
        const {
            enableWhiteList,
            enableBlackList,
            ...bankSettings
        } = settings

        if (iggIdRecord.subscription?.plan === 'FARM_BOT') {
            if (bankSettings.accountData && Array.isArray(bankSettings.accountData) && bankSettings.accountData.length > 2) {
                bankSettings.accountData = bankSettings.accountData.slice(0, 2)
            }

            const allowedCommands = [
                'adminfood', 'adminwood', 'adminore', 'adminstone', 'adminrss', 'admingold', 'shield', 'relocate', 'migrate', 'setgather',
                'pos', 'bal', 'food', 'stone', 'wood', 'ore', 'gold', 'rss', 'stop', 'guild', 'abort', 'relocatekvk',
                'joingvg', 'leavegvg', 'joinda', 'leaveda', 'gryphon', 'recall'
            ]
            if (bankSettings.guildCommands && Array.isArray(bankSettings.guildCommands)) {
                bankSettings.guildCommands = bankSettings.guildCommands.map((cmd: any) => ({
                    ...cmd,
                    enableCommand: cmd.commadReference && allowedCommands.includes(cmd.commadReference.toLowerCase()) ? Boolean(cmd.enableCommand) : false
                }))
            }
        }



        const bankSync = await writeBankSettingsFile(params.iggId, normalizeBankSettings(bankSettings), false)

        let manageGuildSettings = DEFAULT_MANAGE_GUILD_SETTINGS
        try {
            manageGuildSettings = await readManageGuildSettingsFile(params.iggId)
        } catch {
            // Create manageGuild.json with defaults when saving these controls for the first time.
        }

        const manageGuildSync = await writeManageGuildSettingsFile(params.iggId, {
            ...manageGuildSettings,
            enableAutoAccept: typeof enableWhiteList === 'boolean' ? enableWhiteList : Boolean(manageGuildSettings.enableAutoAccept),
            enableAutoRank: typeof enableWhiteList === 'boolean' ? enableWhiteList : Boolean(manageGuildSettings.enableAutoRank),
            enableBlackList: typeof enableBlackList === 'boolean' ? enableBlackList : Boolean(manageGuildSettings.enableBlackList),
        })

        await prisma.iggId.update({
            where: { id: iggIdRecord.id },
            data: { lastSync: new Date() },
        })

        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: 'SAVE_BANK_SETTINGS',
                iggId: params.iggId,
                category: 'bank',
                details: {
                    files: {
                        banksettings: bankSync.filePath,
                        manageGuild: manageGuildSync.filePath,
                    },
                    mtime: {
                        banksettings: bankSync.mtime,
                        manageGuild: manageGuildSync.mtime,
                    },
                },
            },
        })

        return NextResponse.json({
            success: true,
            synced: true,
            files: {
                banksettings: bankSync,
                manageGuild: manageGuildSync,
            },
        })
    } catch (error) {
        console.error('Error saving bank settings:', error)
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
    }
}
