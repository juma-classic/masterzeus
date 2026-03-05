import React, { useState, useEffect } from 'react';
import { botSwitcherService } from '@/services/bot-switcher.service';
import './BotSwitcher.scss';

export const BotSwitcher: React.FC = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [stats, setStats] = useState(botSwitcherService.getStats());
    const [currentBot, setCurrentBot] = useState(botSwitcherService.getCurrentBotName());

    useEffect(() => {
        // Update stats every second
        const interval = setInterval(() => {
            setStats(botSwitcherService.getStats());
            setCurrentBot(botSwitcherService.getCurrentBotName());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

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
                Automatically switches between two bots when a loss occurs. Bot stops after switching - click RUN to continue with the new bot.
            </div>

            <div className='bot-switcher__bots'>
                <div className={`bot-switcher__bot ${stats.currentBot === 'bot1' ? 'active' : ''}`}>
                    <div className='bot-switcher__bot-label'>Bot 1</div>
                    <div className='bot-switcher__bot-name'>Random LDP Differ</div>
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
                    <div className='bot-switcher__bot-name'>States Digit Switcher</div>
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
            </div>

            <div className='bot-switcher__info'>
                <div className='bot-switcher__info-icon'>💡</div>
                <div className='bot-switcher__info-text'>
                    <strong>How it works:</strong> When enabled, the system monitors every trade. On a loss, it
                    automatically stops the current bot, loads the alternate bot with the same stake, and waits for you to click RUN to continue trading.
                </div>
            </div>
        </div>
    );
};
