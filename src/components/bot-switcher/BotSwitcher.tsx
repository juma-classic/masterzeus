import React, { useState, useEffect } from 'react';
import { botSwitcherService } from '@/services/bot-switcher.service';
import { getSavedWorkspaces } from '@/external/bot-skeleton';
import { TStrategy } from '@/types';
import './BotSwitcher.scss';

export const BotSwitcher: React.FC = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [stats, setStats] = useState(botSwitcherService.getStats());
    const [currentBot, setCurrentBot] = useState(botSwitcherService.getCurrentBotName());
    const [availableBots, setAvailableBots] = useState<TStrategy[]>([]);
    const [selectedBot1, setSelectedBot1] = useState<string>('');
    const [selectedBot2, setSelectedBot2] = useState<string>('');
    const [switchTrigger, setSwitchTrigger] = useState(botSwitcherService.getSwitchTrigger());

    useEffect(() => {
        console.log('🎨 Bot Switcher UI component mounted');
        console.log('📊 Service status:', {
            isActive: botSwitcherService.isActive(),
            currentBot: botSwitcherService.getCurrentBotName(),
            stats: botSwitcherService.getStats()
        });

        // Load available bots from saved workspaces
        loadAvailableBots();

        // Update stats every second
        const interval = setInterval(() => {
            setStats(botSwitcherService.getStats());
            setCurrentBot(botSwitcherService.getCurrentBotName());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const loadAvailableBots = async () => {
        try {
            const workspaces = await getSavedWorkspaces();
            console.log('📦 Loaded available bots:', workspaces);
            setAvailableBots(workspaces || []);
            
            // Get current bot configuration
            const currentConfig = botSwitcherService.getBotConfig();
            setSelectedBot1(currentConfig.bot1.id || '');
            setSelectedBot2(currentConfig.bot2.id || '');
        } catch (error) {
            console.error('Error loading available bots:', error);
        }
    };

    const handleToggle = () => {
        if (isEnabled) {
            botSwitcherService.disable();
            setIsEnabled(false);
        } else {
            botSwitcherService.enable();
            setIsEnabled(true);
        }
    };

    const handleReset = () => {
        botSwitcherService.resetStats();
        setStats(botSwitcherService.getStats());
    };

    const handleManualSwitch = async () => {
        await botSwitcherService.manualSwitch();
    };

    const handleTestEvents = () => {
        console.log('🧪 Testing event system from UI...');
        botSwitcherService.testEventSystem();
    };

    const handleResetFlag = () => {
        console.log('🔧 Resetting processing flag from UI...');
        botSwitcherService.resetProcessingFlag();
    };

    const handleBot1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const botId = e.target.value;
        setSelectedBot1(botId);
        const bot = availableBots.find(b => b.id === botId);
        if (bot) {
            botSwitcherService.setBot1(bot.id, bot.name, bot.xml);
            console.log('✅ Bot 1 set to:', bot.name);
        }
    };

    const handleBot2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const botId = e.target.value;
        setSelectedBot2(botId);
        const bot = availableBots.find(b => b.id === botId);
        if (bot) {
            botSwitcherService.setBot2(bot.id, bot.name, bot.xml);
            console.log('✅ Bot 2 set to:', bot.name);
        }
    };

    const handleTriggerChange = (key: string, value: boolean | number) => {
        const newTrigger = { ...switchTrigger, [key]: value };
        setSwitchTrigger(newTrigger);
        botSwitcherService.setSwitchTrigger(newTrigger);
    };

    const bot1Name = availableBots.find(b => b.id === selectedBot1)?.name || 'Select Bot 1';
    const bot2Name = availableBots.find(b => b.id === selectedBot2)?.name || 'Select Bot 2';

    return (
        <div className='bot-switcher'>
            <div className='bot-switcher__header'>
                <h3 className='bot-switcher__title'>
                    <span className='bot-switcher__icon'>🔄</span>
                    Auto Bot Switcher
                </h3>
                <div className='bot-switcher__status'>
                    <span className={`bot-switcher__status-indicator ${isEnabled ? 'active' : 'inactive'}`} />
                    <span className='bot-switcher__status-text'>
                        {isEnabled ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                </div>
            </div>

            <div className='bot-switcher__description'>
                Automatically switches between two bots when a loss occurs. Bot stops, switches, and automatically restarts with the new bot.
            </div>

            <div className='bot-switcher__selectors'>
                <div className='bot-switcher__selector'>
                    <label className='bot-switcher__selector-label'>Bot 1:</label>
                    <select 
                        className='bot-switcher__selector-dropdown'
                        value={selectedBot1}
                        onChange={handleBot1Change}
                        disabled={isEnabled}
                    >
                        <option value=''>Select Bot 1</option>
                        {availableBots.map(bot => (
                            <option key={bot.id} value={bot.id}>
                                {bot.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className='bot-switcher__selector'>
                    <label className='bot-switcher__selector-label'>Bot 2:</label>
                    <select 
                        className='bot-switcher__selector-dropdown'
                        value={selectedBot2}
                        onChange={handleBot2Change}
                        disabled={isEnabled}
                    >
                        <option value=''>Select Bot 2</option>
                        {availableBots.map(bot => (
                            <option key={bot.id} value={bot.id}>
                                {bot.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className='bot-switcher__triggers'>
                <h4 className='bot-switcher__triggers-title'>Switch Triggers</h4>
                <div className='bot-switcher__triggers-grid'>
                    <div className='bot-switcher__trigger'>
                        <label className='bot-switcher__trigger-label'>
                            <input
                                type='checkbox'
                                checked={switchTrigger.onLoss}
                                onChange={(e) => handleTriggerChange('onLoss', e.target.checked)}
                                disabled={isEnabled}
                            />
                            <span>Switch on Loss</span>
                        </label>
                    </div>

                    <div className='bot-switcher__trigger'>
                        <label className='bot-switcher__trigger-label'>
                            <input
                                type='checkbox'
                                checked={switchTrigger.onWin}
                                onChange={(e) => handleTriggerChange('onWin', e.target.checked)}
                                disabled={isEnabled}
                            />
                            <span>Switch on Win</span>
                        </label>
                    </div>

                    <div className='bot-switcher__trigger'>
                        <label className='bot-switcher__trigger-label'>
                            <span>After</span>
                            <input
                                type='number'
                                min='0'
                                value={switchTrigger.consecutiveLosses}
                                onChange={(e) => handleTriggerChange('consecutiveLosses', parseInt(e.target.value) || 0)}
                                disabled={isEnabled}
                                className='bot-switcher__trigger-input'
                            />
                            <span>consecutive losses</span>
                        </label>
                    </div>

                    <div className='bot-switcher__trigger'>
                        <label className='bot-switcher__trigger-label'>
                            <span>After</span>
                            <input
                                type='number'
                                min='0'
                                value={switchTrigger.consecutiveWins}
                                onChange={(e) => handleTriggerChange('consecutiveWins', parseInt(e.target.value) || 0)}
                                disabled={isEnabled}
                                className='bot-switcher__trigger-input'
                            />
                            <span>consecutive wins</span>
                        </label>
                    </div>

                    <div className='bot-switcher__trigger'>
                        <label className='bot-switcher__trigger-label'>
                            <span>Profit reaches $</span>
                            <input
                                type='number'
                                min='0'
                                step='0.01'
                                value={switchTrigger.profitThreshold}
                                onChange={(e) => handleTriggerChange('profitThreshold', parseFloat(e.target.value) || 0)}
                                disabled={isEnabled}
                                className='bot-switcher__trigger-input'
                            />
                        </label>
                    </div>

                    <div className='bot-switcher__trigger'>
                        <label className='bot-switcher__trigger-label'>
                            <span>Loss reaches $</span>
                            <input
                                type='number'
                                min='0'
                                step='0.01'
                                value={switchTrigger.lossThreshold}
                                onChange={(e) => handleTriggerChange('lossThreshold', parseFloat(e.target.value) || 0)}
                                disabled={isEnabled}
                                className='bot-switcher__trigger-input'
                            />
                        </label>
                    </div>

                    <div className='bot-switcher__trigger bot-switcher__trigger--full'>
                        <label className='bot-switcher__trigger-label'>
                            <input
                                type='checkbox'
                                checked={switchTrigger.autoReturnToBot1}
                                onChange={(e) => handleTriggerChange('autoReturnToBot1', e.target.checked)}
                                disabled={isEnabled}
                            />
                            <span>Auto-return to Bot 1 after Bot 2 recovers loss</span>
                        </label>
                        <div className='bot-switcher__trigger-hint'>
                            When enabled, automatically switches back to Bot 1 after Bot 2 wins and recovers the loss
                        </div>
                    </div>
                </div>
            </div>

            <div className='bot-switcher__bots'>
                <div className={`bot-switcher__bot ${stats.currentBot === 'bot1' ? 'active' : ''}`}>
                    <div className='bot-switcher__bot-label'>Bot 1</div>
                    <div className='bot-switcher__bot-name'>{bot1Name}</div>
                    <div className='bot-switcher__bot-stats'>
                        <span className='bot-switcher__bot-trades'>{stats.bot1Trades} trades</span>
                    </div>
                </div>

                <div className='bot-switcher__arrow'>
                    <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                        <path
                            d='M13 7l5 5-5 5M6 12h12'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                    </svg>
                </div>

                <div className={`bot-switcher__bot ${stats.currentBot === 'bot2' ? 'active' : ''}`}>
                    <div className='bot-switcher__bot-label'>Bot 2</div>
                    <div className='bot-switcher__bot-name'>{bot2Name}</div>
                    <div className='bot-switcher__bot-stats'>
                        <span className='bot-switcher__bot-trades'>{stats.bot2Trades} trades</span>
                    </div>
                </div>
            </div>

            <div className='bot-switcher__current'>
                <div className='bot-switcher__current-label'>Currently Active:</div>
                <div className='bot-switcher__current-name'>{currentBot}</div>
            </div>

            <div className='bot-switcher__stats'>
                <div className='bot-switcher__stat'>
                    <div className='bot-switcher__stat-label'>Total Trades</div>
                    <div className='bot-switcher__stat-value'>{stats.totalTrades}</div>
                </div>
                <div className='bot-switcher__stat'>
                    <div className='bot-switcher__stat-label'>Switches</div>
                    <div className='bot-switcher__stat-value'>{stats.switches}</div>
                </div>
                <div className='bot-switcher__stat'>
                    <div className='bot-switcher__stat-label'>Consecutive Losses</div>
                    <div className='bot-switcher__stat-value'>{stats.consecutiveLosses}</div>
                </div>
                <div className='bot-switcher__stat'>
                    <div className='bot-switcher__stat-label'>Consecutive Wins</div>
                    <div className='bot-switcher__stat-value'>{stats.consecutiveWins}</div>
                </div>
                <div className='bot-switcher__stat'>
                    <div className='bot-switcher__stat-label'>Current Profit</div>
                    <div className={`bot-switcher__stat-value ${stats.currentProfit >= 0 ? 'profit' : 'loss'}`}>
                        ${stats.currentProfit.toFixed(2)}
                    </div>
                </div>
                <div className='bot-switcher__stat'>
                    <div className='bot-switcher__stat-label'>Last Switch</div>
                    <div className='bot-switcher__stat-value'>
                        {stats.lastSwitch ? new Date(stats.lastSwitch).toLocaleTimeString() : 'Never'}
                    </div>
                </div>
            </div>

            <div className='bot-switcher__controls'>
                <button
                    className={`bot-switcher__button bot-switcher__button--toggle ${isEnabled ? 'active' : ''}`}
                    onClick={handleToggle}
                    disabled={!selectedBot1 || !selectedBot2}
                >
                    {isEnabled ? '⏸️ Disable Switcher' : '▶️ Enable Switcher'}
                </button>

                <button
                    className='bot-switcher__button bot-switcher__button--reset'
                    onClick={handleReset}
                    disabled={stats.totalTrades === 0}
                >
                    🔄 Reset Stats
                </button>

                <button
                    className='bot-switcher__button bot-switcher__button--manual'
                    onClick={handleManualSwitch}
                    disabled={!isEnabled}
                >
                    🔧 Manual Switch
                </button>

                <button
                    className='bot-switcher__button bot-switcher__button--test'
                    onClick={handleTestEvents}
                >
                    🧪 Test Events
                </button>

                <button
                    className='bot-switcher__button bot-switcher__button--reset-flag'
                    onClick={handleResetFlag}
                >
                    🔧 Reset Flag
                </button>
            </div>

            <div className='bot-switcher__info'>
                <div className='bot-switcher__info-icon'>💡</div>
                <div className='bot-switcher__info-text'>
                    <strong>How it works:</strong> Select two bots from your saved strategies. When enabled, the system monitors every trade. On a loss, it
                    automatically stops the current bot, loads the alternate bot with the same stake, and automatically clicks RUN to continue trading seamlessly.
                </div>
            </div>
        </div>
    );
};
