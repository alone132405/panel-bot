import os
import re

file_path = os.path.join(os.getcwd(), 'components', 'modals', 'SettingsModal.tsx')
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target1 = """                                                            {setting.type === 'number' && (
                                                                <input
                                                                    type="number"
                                                                    value={setting.value ?? ''}
                                                                    min={setting.min}
                                                                    max={setting.max}
                                                                    disabled={isDisabled}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value === '' ? 0 : Number(e.target.value)
                                                                        handleSettingChange(setting.path, val)
                                                                    }}
                                                                    className="w-20 md:w-24 px-2 md:px-3 py-1 md:py-2 bg-background-tertiary border border-white/10 rounded md:rounded-lg text-xs md:text-sm text-white text-center focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50"
                                                                />
                                                            )}"""

replacement1 = """                                                            {setting.type === 'number' && (
                                                                <input
                                                                    type="number"
                                                                    value={setting.value ?? ''}
                                                                    min={setting.min}
                                                                    max={setting.max}
                                                                    disabled={isDisabled}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value === '' ? 0 : Number(e.target.value)
                                                                        handleSettingChange(setting.path, val)
                                                                    }}
                                                                    onBlur={(e) => {
                                                                        let val = e.target.value === '' ? 0 : Number(e.target.value)
                                                                        if (setting.min !== undefined && val < Number(setting.min)) val = Number(setting.min)
                                                                        if (setting.max !== undefined && val > Number(setting.max)) val = Number(setting.max)
                                                                        if (val !== setting.value) handleSettingChange(setting.path, val)
                                                                    }}
                                                                    className="w-20 md:w-24 px-2 md:px-3 py-1 md:py-2 bg-background-tertiary border border-white/10 rounded md:rounded-lg text-xs md:text-sm text-white text-center focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50"
                                                                />
                                                            )}"""

target2 = """                                                            {setting.type === 'time' && (
                                                                <input
                                                                    type="text"
                                                                    value={setting.value || ''}
                                                                    disabled={isDisabled}
                                                                    onChange={(e) => handleSettingChange(setting.path, e.target.value)}
                                                                    className="w-24 md:w-40 px-2 md:px-3 py-1 md:py-2 bg-background-tertiary border border-white/10 rounded md:rounded-lg text-xs md:text-sm text-white focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50"
                                                                />
                                                            )}"""
                                                            
replacement2 = """                                                            {setting.type === 'time' && (
                                                                <input
                                                                    type="text"
                                                                    value={setting.value || ''}
                                                                    disabled={isDisabled}
                                                                    onChange={(e) => handleSettingChange(setting.path, e.target.value)}
                                                                    placeholder="HH:mm:ss"
                                                                    onBlur={(e) => {
                                                                        let val = e.target.value || ''
                                                                        if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(val)) {
                                                                            val = str(setting.min or '00:00:00')
                                                                        }
                                                                        if (setting.min !== undefined and val < str(setting.min)): val = str(setting.min)
                                                                        if (setting.max !== undefined and val > str(setting.max)): val = str(setting.max)
                                                                        if (val !== setting.value): handleSettingChange(setting.path, val)
                                                                    }}
                                                                    className="w-24 md:w-40 px-2 md:px-3 py-1 md:py-2 bg-background-tertiary border border-white/10 rounded md:rounded-lg text-xs md:text-sm text-white focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50"
                                                                />
                                                            )}"""

# Normalize all line endings to \n for both target and content, then replace
content = content.replace('\r\n', '\n')
target1 = target1.replace('\r\n', '\n')
replacement1 = replacement1.replace('\r\n', '\n')

target2 = target2.replace('\r\n', '\n')
replacement2 = replacement2.replace('\r\n', '\n')

# Use regex to allow for flexible whitespace mapping
content = re.sub(re.escape(target1), replacement1.replace('\\', '\\\\'), content, count=1)
content = re.sub(re.escape(target2), replacement2.replace('\\', '\\\\'), content, count=1)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
