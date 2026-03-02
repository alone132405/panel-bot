const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'components', 'modals', 'SettingsModal.tsx');
let content = fs.readFileSync(file, 'utf8');

const target1 = `                                                            {setting.type === 'number' && (
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
                                                            )}`;

const replacement1 = `                                                            {setting.type === 'number' && (
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
                                                            )}`;

const target2 = `                                                            {setting.type === 'time' && (
                                                                <input
                                                                    type="text"
                                                                    value={setting.value || ''}
                                                                    disabled={isDisabled}
                                                                    onChange={(e) => handleSettingChange(setting.path, e.target.value)}
                                                                    className="w-24 md:w-40 px-2 md:px-3 py-1 md:py-2 bg-background-tertiary border border-white/10 rounded md:rounded-lg text-xs md:text-sm text-white focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50"
                                                                />
                                                            )}`;

const replacement2 = `                                                            {setting.type === 'time' && (
                                                                <input
                                                                    type="text"
                                                                    value={setting.value || ''}
                                                                    disabled={isDisabled}
                                                                    onChange={(e) => handleSettingChange(setting.path, e.target.value)}
                                                                    placeholder="HH:mm:ss"
                                                                    onBlur={(e) => {
                                                                        let val = e.target.value || ''
                                                                        if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(val)) {
                                                                            val = String(setting.min || '00:00:00')
                                                                        }
                                                                        if (setting.min !== undefined && val < String(setting.min)) val = String(setting.min)
                                                                        if (setting.max !== undefined && val > String(setting.max)) val = String(setting.max)
                                                                        if (val !== setting.value) handleSettingChange(setting.path, val)
                                                                    }}
                                                                    className="w-24 md:w-40 px-2 md:px-3 py-1 md:py-2 bg-background-tertiary border border-white/10 rounded md:rounded-lg text-xs md:text-sm text-white focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50"
                                                                />
                                                            )}`;

if (content.includes(target1)) {
    content = content.replace(target1, replacement1);
    console.log('Replaced number input successfully');
}
if (content.includes(target2)) {
    content = content.replace(target2, replacement2);
    console.log('Replaced time input successfully');
}

fs.writeFileSync(file, content);
