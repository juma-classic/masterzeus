import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import AnalysisTool from '@/components/analysis-tool/AnalysisTool';
import ChunkLoader from '@/components/loader/chunk-loader';
import DesktopWrapper from '@/components/shared_ui/desktop-wrapper';
import Dialog from '@/components/shared_ui/dialog';
import MobileWrapper from '@/components/shared_ui/mobile-wrapper';
import Tabs from '@/components/shared_ui/tabs/tabs';
import { ProtectedSignalsCenter } from '@/components/signals/ProtectedSignalsCenter';
import { AutoBotLoaderPanel } from '@/components/signals/AutoBotLoaderPanel';
import TradingViewModal from '@/components/trading-view-chart/trading-view-modal';
import { DBOT_TABS } from '@/constants/bot-contents';
import { api_base, updateWorkspaceName } from '@/external/bot-skeleton';
import { CONNECTION_STATUS } from '@/external/bot-skeleton/services/api/observables/connection-status-stream';
import { useApiBase } from '@/hooks/useApiBase';
import { useStore } from '@/hooks/useStore';
import { Localize, localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import { BotLoadingErrorHandler, withBotLoadingErrorHandling } from '@/utils/bot-loading-error-handler';
import RunPanel from '../../components/run-panel';
import ChartModal from '../chart/chart-modal';
import Dashboard from '../dashboard';
import RunStrategy from '../dashboard/run-strategy';

const Chart = lazy(() => import('../chart'));
const Tutorial = lazy(() => import('../tutorials'));

// TrackTool Components
import SignalsScanner from '@/components/tracktool/SignalsScanner';
import MarketAnalyzer from '@/components/tracktool/MarketAnalyzer';
import TradingCalculator from '@/components/tracktool/TradingCalculator';

// DCircles Component
import { DCircles } from '@/components/dcircles/DCircles';

// DTrader Component
import DTraderIframe from '@/components/dtrader/DTraderIframe';

const DashboardIcon = () => (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path d='M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' fill='currentColor' />
        <path d='M4 4h6v8H4V4zm10 0h6v4h-6V4zM4 15h6v4H4v-4zm10-3h6v8h-6v-8z' fill='currentColor' opacity='0.6' />
        <circle cx='7' cy='8' r='1.5' fill='#ffd700' />
        <circle cx='17' cy='6' r='1.5' fill='#ffd700' />
        <circle cx='7' cy='17' r='1.5' fill='#ffd700' />
        <circle cx='17' cy='15' r='1.5' fill='#ffd700' />
    </svg>
);

const BotBuilderIcon = () => (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect x='7' y='4' width='10' height='7' rx='1' stroke='currentColor' strokeWidth='2' fill='none' />
        <rect x='7' y='13' width='10' height='7' rx='1' stroke='currentColor' strokeWidth='2' fill='none' />
        <circle cx='12' cy='7.5' r='1.5' fill='#ffd700' />
        <circle cx='12' cy='16.5' r='1.5' fill='#ffd700' />
        <path d='M12 11V13' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
        <path d='M9 7.5H7M17 7.5H15M9 16.5H7M17 16.5H15' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
        <circle cx='5' cy='7.5' r='1' fill='#ffd700' />
        <circle cx='19' cy='7.5' r='1' fill='#ffd700' />
        <circle cx='5' cy='16.5' r='1' fill='#ffd700' />
        <circle cx='19' cy='16.5' r='1' fill='#ffd700' />
    </svg>
);

const ChartsIcon = () => (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path d='M3 3v18h18' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
        <path
            d='M7 14l3-3 3 3 5-7'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
        />
        <circle cx='7' cy='14' r='1.5' fill='#ffd700' />
        <circle cx='10' cy='11' r='1.5' fill='#ffd700' />
        <circle cx='13' cy='14' r='1.5' fill='#ffd700' />
        <circle cx='18' cy='7' r='1.5' fill='#ffd700' />
        <path d='M18 7v3m0 0h-3m3 0l-5 7' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' opacity='0.5' />
    </svg>
);

const TutorialsIcon = () => (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect x='3' y='4' width='18' height='16' rx='2' stroke='currentColor' strokeWidth='2' fill='none' />
        <path d='M10 9l6 3-6 3V9z' fill='#ffd700' />
        <circle cx='10' cy='9' r='1' fill='currentColor' opacity='0.6' />
        <circle cx='16' cy='12' r='1' fill='currentColor' opacity='0.6' />
        <circle cx='10' cy='15' r='1' fill='currentColor' opacity='0.6' />
        <path d='M3 7h18M7 4v3M17 4v3' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' opacity='0.5' />
    </svg>
);

const AnalysisToolIcon = () => (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect x='5' y='7' width='4' height='10' rx='1' stroke='currentColor' strokeWidth='2' fill='none' />
        <rect x='11' y='4' width='4' height='13' rx='1' stroke='currentColor' strokeWidth='2' fill='none' />
        <rect x='17' y='9' width='4' height='8' rx='1' stroke='currentColor' strokeWidth='2' fill='none' />
        <path d='M7 3v4M13 2v2M19 7v2' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' opacity='0.5' />
        <path d='M7 17v2M13 17v2M19 17v2' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' opacity='0.5' />
        <circle cx='7' cy='12' r='1.5' fill='#ffd700' />
        <circle cx='13' cy='10' r='1.5' fill='#ffd700' />
        <circle cx='19' cy='13' r='1.5' fill='#ffd700' />
    </svg>
);

const SignalsIcon = () => (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path d='M4 4l4 4-4 4' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
        <path
            d='M4 16l4 4-4 4'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            opacity='0.5'
        />
        <rect x='10' y='5' width='10' height='3' rx='1' fill='#ffd700' />
        <rect x='10' y='11' width='7' height='3' rx='1' fill='currentColor' opacity='0.6' />
        <rect x='10' y='17' width='10' height='3' rx='1' fill='#ffd700' />
        <circle cx='20' cy='6.5' r='1.5' fill='currentColor' />
        <circle cx='20' cy='18.5' r='1.5' fill='currentColor' />
    </svg>
);

const FreeBotsIcon = () => (
    <svg
        fill='var(--text-general)'
        width='20px'
        height='20px'
        viewBox='0 0 24 24'
        xmlns='http://www.w3.org/2000/svg'
        data-name='Layer 1'
    >
        <path d='M10,13H4a1,1,0,0,0-1,1v6a1,1,0,0,0,1,1h6a1,1,0,0,0,1-1V14A1,1,0,0,0,10,13ZM9,19H5V15H9ZM20,3H14a1,1,0,0,0-1,1v6a1,1,0,0,0,1,1h6a1,1,0,0,0,1-1V4A1,1,0,0,0,20,3ZM19,9H15V5h4Zm1,7H18V14a1,1,0,0,0-2,0v2H14a1,1,0,0,0,0,2h2v2a1,1,0,0,0,2,0V18h2a1,1,0,0,0,0-2ZM10,3H4A1,1,0,0,0,3,4v6a1,1,0,0,0,1,1h6a1,1,0,0,0,1-1V4A1,1,0,0,0,10,3ZM9,9H5V5H9Z' />
    </svg>
);

const RichMotherIcon = () => (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        {/* Diamond shape */}
        <path d='M12 2L16 8H8L12 2Z' fill='#ffd700' stroke='currentColor' strokeWidth='1.5' strokeLinejoin='round' />
        <path
            d='M8 8L12 22L16 8H8Z'
            fill='#ffd700'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinejoin='round'
            opacity='0.8'
        />

        {/* Inner diamond facets */}
        <path d='M12 2L14 8L12 12L10 8L12 2Z' fill='#ffed4e' opacity='0.6' />
        <path d='M12 12L10 8L8 8L12 22L12 12Z' fill='#e6c200' opacity='0.4' />
        <path d='M12 12L14 8L16 8L12 22L12 12Z' fill='#e6c200' opacity='0.4' />

        {/* Sparkle effects */}
        <circle cx='6' cy='6' r='1' fill='#ffd700' opacity='0.8' />
        <circle cx='18' cy='6' r='1' fill='#ffd700' opacity='0.8' />
        <circle cx='4' cy='12' r='0.8' fill='#ffd700' opacity='0.6' />
        <circle cx='20' cy='12' r='0.8' fill='#ffd700' opacity='0.6' />

        {/* Crown elements */}
        <path d='M10 4L11 6L12 4L13 6L14 4' stroke='#ffd700' strokeWidth='1' strokeLinecap='round' opacity='0.7' />
    </svg>
);

const TrackSignalsIcon = () => (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        {/* Radar/Scanner circle */}
        <circle cx='12' cy='12' r='9' stroke='#00ff00' strokeWidth='1.5' fill='none' opacity='0.3' />
        <circle cx='12' cy='12' r='6' stroke='#00ff00' strokeWidth='1.5' fill='none' opacity='0.5' />
        <circle cx='12' cy='12' r='3' stroke='#00ff00' strokeWidth='2' fill='none' opacity='0.8' />

        {/* Scanning beam */}
        <path d='M12 12L20 8' stroke='#00ff00' strokeWidth='2' strokeLinecap='round' opacity='0.9' />

        {/* Signal dots */}
        <circle cx='16' cy='8' r='1.5' fill='#00ff00' />
        <circle cx='8' cy='16' r='1.5' fill='#ffff00' />
        <circle cx='16' cy='16' r='1.5' fill='#ff0000' />

        {/* Center core */}
        <circle cx='12' cy='12' r='1.5' fill='#00ff00' />

        {/* Corner indicators */}
        <path
            d='M4 4L6 6M20 4L18 6M4 20L6 18M20 20L18 18'
            stroke='#00ff00'
            strokeWidth='1.5'
            strokeLinecap='round'
            opacity='0.6'
        />
    </svg>
);

const TrackAnalyzerIcon = () => (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        {/* Chart bars */}
        <rect x='4' y='14' width='3' height='6' rx='0.5' fill='#3b82f6' opacity='0.8' />
        <rect x='9' y='10' width='3' height='10' rx='0.5' fill='#10b981' opacity='0.8' />
        <rect x='14' y='6' width='3' height='14' rx='0.5' fill='#f59e0b' opacity='0.8' />
        <rect x='19' y='12' width='3' height='8' rx='0.5' fill='#ef4444' opacity='0.8' />

        {/* Trend line */}
        <path
            d='M5.5 16L10.5 12L15.5 8L20.5 14'
            stroke='#00ffff'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            opacity='0.7'
        />

        {/* Data points */}
        <circle cx='5.5' cy='16' r='1.5' fill='#00ffff' />
        <circle cx='10.5' cy='12' r='1.5' fill='#00ffff' />
        <circle cx='15.5' cy='8' r='1.5' fill='#00ffff' />
        <circle cx='20.5' cy='14' r='1.5' fill='#00ffff' />

        {/* Grid lines */}
        <path d='M3 8H22M3 12H22M3 16H22' stroke='currentColor' strokeWidth='0.5' opacity='0.2' />
    </svg>
);

const TrackCalculatorIcon = () => (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        {/* Calculator body */}
        <rect x='5' y='3' width='14' height='18' rx='2' stroke='currentColor' strokeWidth='2' fill='none' />

        {/* Display screen */}
        <rect x='7' y='5' width='10' height='3' rx='0.5' fill='#10b981' opacity='0.8' />

        {/* Calculator buttons */}
        <circle cx='8.5' cy='11' r='1' fill='#3b82f6' opacity='0.7' />
        <circle cx='12' cy='11' r='1' fill='#3b82f6' opacity='0.7' />
        <circle cx='15.5' cy='11' r='1' fill='#3b82f6' opacity='0.7' />

        <circle cx='8.5' cy='14' r='1' fill='#3b82f6' opacity='0.7' />
        <circle cx='12' cy='14' r='1' fill='#3b82f6' opacity='0.7' />
        <circle cx='15.5' cy='14' r='1' fill='#3b82f6' opacity='0.7' />

        <circle cx='8.5' cy='17' r='1' fill='#3b82f6' opacity='0.7' />
        <circle cx='12' cy='17' r='1' fill='#3b82f6' opacity='0.7' />
        <circle cx='15.5' cy='17' r='1' fill='#f59e0b' opacity='0.9' />

        {/* Dollar sign on display */}
        <text x='12' y='7.5' fontSize='2' fill='#000' textAnchor='middle' fontWeight='bold'>
            $
        </text>

        {/* Sparkle effect */}
        <circle cx='17' cy='6' r='0.8' fill='#ffd700' opacity='0.8' />
        <circle cx='19' cy='8' r='0.6' fill='#ffd700' opacity='0.6' />
    </svg>
);

const DTraderIcon = () => (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        {/* Trading chart candlesticks */}
        <rect x='4' y='8' width='2' height='8' rx='0.5' fill='#10b981' opacity='0.8' />
        <rect x='9' y='6' width='2' height='10' rx='0.5' fill='#ef4444' opacity='0.8' />
        <rect x='14' y='10' width='2' height='6' rx='0.5' fill='#10b981' opacity='0.8' />
        <rect x='19' y='4' width='2' height='12' rx='0.5' fill='#10b981' opacity='0.8' />

        {/* Trend line */}
        <path
            d='M3 18L7 14L12 16L17 12L21 8'
            stroke='#FFD700'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            opacity='0.9'
        />

        {/* Data points on trend */}
        <circle cx='7' cy='14' r='1.5' fill='#FFD700' />
        <circle cx='12' cy='16' r='1.5' fill='#FFD700' />
        <circle cx='17' cy='12' r='1.5' fill='#FFD700' />
        <circle cx='21' cy='8' r='1.5' fill='#FFD700' />

        {/* Grid */}
        <path d='M2 20H22M2 15H22M2 10H22M2 5H22' stroke='currentColor' strokeWidth='0.5' opacity='0.2' />
    </svg>
);

const CopyTradingIcon = () => (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        {/* Two overlapping documents representing copy */}
        <rect
            x='6'
            y='4'
            width='12'
            height='14'
            rx='2'
            stroke='currentColor'
            strokeWidth='1.5'
            fill='none'
            opacity='0.4'
        />
        <rect x='8' y='6' width='12' height='14' rx='2' stroke='currentColor' strokeWidth='1.5' fill='none' />

        {/* Trading arrows */}
        <path d='M11 10L13 12L11 14' stroke='#10b981' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
        <path d='M17 10L15 12L17 14' stroke='#ef4444' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />

        {/* Connection dots */}
        <circle cx='13' cy='12' r='1.5' fill='#FFD700' />
        <circle cx='15' cy='12' r='1.5' fill='#FFD700' />

        {/* Copy indicator */}
        <path d='M10 16H16' stroke='#3b82f6' strokeWidth='1.5' strokeLinecap='round' opacity='0.7' />
    </svg>
);

const HacksAnalysisIcon = () => (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        {/* Terminal/Code background */}
        <rect
            x='2'
            y='3'
            width='20'
            height='18'
            rx='2'
            stroke='currentColor'
            strokeWidth='1.5'
            fill='none'
            opacity='0.3'
        />

        {/* Terminal prompt lines */}
        <path d='M5 7L8 10L5 13' stroke='#10b981' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
        <path d='M10 13H15' stroke='#10b981' strokeWidth='2' strokeLinecap='round' />

        {/* Binary code */}
        <text x='6' y='18' fontSize='3' fill='#3b82f6' fontFamily='monospace'>
            101
        </text>
        <text x='14' y='18' fontSize='3' fill='#3b82f6' fontFamily='monospace'>
            010
        </text>

        {/* Hacker symbol */}
        <circle cx='19' cy='6' r='2.5' fill='#ef4444' opacity='0.9' />
        <text x='19' y='7.5' fontSize='2.5' fill='#fff' textAnchor='middle' fontWeight='bold'>
            H
        </text>

        {/* Analysis dots */}
        <circle cx='5' cy='7' r='0.8' fill='#ffd700' />
        <circle cx='8' cy='10' r='0.8' fill='#ffd700' />
        <circle cx='5' cy='13' r='0.8' fill='#ffd700' />
    </svg>
);

const AppWrapper = observer(() => {
    const { connectionStatus } = useApiBase();
    const { dashboard, load_modal, run_panel, summary_card } = useStore();
    const { active_tab, setActiveTab } = dashboard;
    const { onEntered } = load_modal;
    const { is_dialog_open, dialog_options, onCancelButtonClick, onCloseDialog, onOkButtonClick, stopBot } = run_panel;
    const { cancel_button_text, ok_button_text, title, message } = dialog_options as { [key: string]: string };
    const { clear } = summary_card;
    const { is_drawer_open } = run_panel;
    const { is_chart_modal_visible } = dashboard;
    const { isDesktop } = useDevice();

    type BotType = {
        title: string;
        image: string;
        filePath: string;
        xmlContent: string;
    };
    const [bots, setBots] = useState<BotType[]>([]);
    const [analysisToolUrl, setAnalysisToolUrl] = useState('ai');

    useEffect(() => {
        if (connectionStatus !== CONNECTION_STATUS.OPENED) {
            const is_bot_running = document.getElementById('db-animation__stop-button') !== null;
            if (is_bot_running) {
                clear();
                stopBot();
                api_base.setIsRunning(false);
            }
        }
    }, [clear, connectionStatus, stopBot]);

    useEffect(() => {
        const fetchBots = async () => {
            const botFiles = [
                'States Digit Switcher.xml',
                'Profit Pilot.xml',
                'PATEL (with Entry).xml',
                'dollar_flipper.xml',
                'UnderoverAutoswitch.xml',
                '_Over 1 under 8 Recovery Even & Odd 2026 💵💯 (5).xml',
                '$Dollar printer .xml',
                'AUTO C4 VOLT 🇬🇧 2 🇬🇧 AI PREMIUM ROBOT  (2) (1).xml',
                'Auto Zeus Bot.xml',
                'Flipping-Tool-2026 - Elvis Trades (1).xml',
                'ZEUS AI PRO v1.xml',
                'Zeus Digit Switcher.xml',
                'Zeus Over.xml',
                'Over 3 Delirium by Elvis Trades.xml',
                'Over-Killer by Zeus.xml',
                'Over-Pro by Zeus.xml',
                'Random LDP Differ - Elvis Trades.xml',
                'Raziel Over Under.xml',
                'Speed Auto Bot🦷.xml',
                'Under 8 promax by Zeus.xml',
                'Under Killer 2026.xml',
            ];
            const botPromises = botFiles.map(async file => {
                try {
                    const response = await fetch(file);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch ${file}: ${response.statusText}`);
                    }
                    const text = await response.text();
                    const parser = new DOMParser();
                    const xml = parser.parseFromString(text, 'application/xml');
                    return {
                        title: file.split('/').pop(),
                        image: xml.getElementsByTagName('image')[0]?.textContent || 'default_image_path',
                        filePath: file,
                        xmlContent: text,
                    };
                } catch (error) {
                    console.error(error);
                    return null;
                }
            });
            const bots = (await Promise.all(botPromises)).filter(Boolean);
            setBots(bots);
        };
        fetchBots();
    }, []);

    const handleBotClick = useCallback(
        withBotLoadingErrorHandling(async bot => {
            // Validate bot object first
            const validation = BotLoadingErrorHandler.validateBotObject(bot);
            if (!validation.isValid) {
                const errorMessage = `Bot validation failed: ${validation.errors.join(', ')}`;
                console.error('❌', errorMessage);
                throw new Error(errorMessage);
            }

            console.log('🤖 Loading bot:', bot.title);

            setActiveTab(DBOT_TABS.BOT_BUILDER);

            // Validate load_modal exists and has the required method
            if (!load_modal) {
                throw new Error('load_modal is not available');
            }

            if (typeof load_modal.loadStrategyToBuilder !== 'function') {
                throw new Error('loadStrategyToBuilder is not defined on load_modal');
            }

            // Prepare strategy object with all required properties
            const strategyToLoad = {
                id: bot.filePath || `bot_${Date.now()}`, // Fallback ID if filePath is missing
                name: bot.title,
                xml: bot.xmlContent,
                save_type: 'LOCAL',
            };

            console.log('📋 Strategy to load:', {
                id: strategyToLoad.id,
                name: strategyToLoad.name,
                xmlLength: strategyToLoad.xml.length,
                save_type: strategyToLoad.save_type,
            });

            // Load the strategy with error handling
            await load_modal.loadStrategyToBuilder(strategyToLoad);

            console.log('✅ Bot loaded successfully');

            // Update workspace name if function exists
            if (typeof updateWorkspaceName === 'function') {
                updateWorkspaceName();
            } else {
                console.warn('⚠️ updateWorkspaceName function not available');
            }
        }, 'handleBotClick'),
        [setActiveTab, load_modal]
    );

    const handleOpen = useCallback(async () => {
        await load_modal.loadFileFromRecent();
        setActiveTab(DBOT_TABS.BOT_BUILDER);
    }, [load_modal, setActiveTab]);

    const toggleAnalysisTool = (url: string) => setAnalysisToolUrl(url);

    // Listen for CFX bot load events from signals
    useEffect(() => {
        const handleCFXBotLoad = async (event: Event) => {
            const customEvent = event as CustomEvent;
            const { botFile, signalType, market, prediction } = customEvent.detail;
            console.log('📥 Received CFX bot load request:', { botFile, signalType, market, prediction });

            // Find the bot in the bots array
            const bot = bots.find(b => b.filePath === botFile);
            if (bot) {
                console.log('✅ Found bot, configuring with signal parameters...');

                // Parse and configure the XML with signal parameters
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(bot.xmlContent, 'text/xml');

                // Update market (SYMBOL_LIST)
                const symbolFields = xmlDoc.querySelectorAll('field[name="SYMBOL_LIST"]');
                symbolFields.forEach(field => {
                    field.textContent = market;
                    console.log(`📊 Market set to: ${market}`);
                });

                // Update contract type based on signal type
                let contractType = '';
                if (signalType === 'EVEN') {
                    contractType = 'DIGITEVEN';
                } else if (signalType === 'ODD') {
                    contractType = 'DIGITODD';
                } else if (signalType === 'RISE') {
                    contractType = 'CALL';
                } else if (signalType === 'FALL') {
                    contractType = 'PUT';
                }

                const typeFields = xmlDoc.querySelectorAll('field[name="TYPE_LIST"]');
                typeFields.forEach(field => {
                    field.textContent = contractType;
                    console.log(`📝 Contract type set to: ${contractType}`);
                });

                // Also update PURCHASE_LIST fields (in purchase blocks)
                const purchaseFields = xmlDoc.querySelectorAll('field[name="PURCHASE_LIST"]');
                purchaseFields.forEach(field => {
                    field.textContent = contractType;
                    console.log(`💰 Purchase type set to: ${contractType}`);
                });

                // Update prediction digit for OVER/UNDER signals
                if (prediction !== undefined) {
                    const predictionFields = xmlDoc.querySelectorAll('field[name="NUM"]');
                    // Find the prediction field (it's in a math_number_positive block)
                    predictionFields.forEach(field => {
                        const parent = field.parentElement;
                        if (parent && parent.getAttribute('type') === 'math_number_positive') {
                            field.textContent = prediction.toString();
                            console.log(`🎯 Prediction digit set to: ${prediction}`);
                        }
                    });
                }

                // Update stake using StakeManager (overrides XML defaults)
                const { stakeManager } = await import('@/services/stake-manager.service');
                const currentStake = stakeManager.getStake();

                const stakeFields = xmlDoc.querySelectorAll('field[name="NUM"]');
                let stakeUpdatesCount = 0;

                stakeFields.forEach(field => {
                    // Look for stake-related NUM fields in CFX bots
                    const parentBlock = field.closest('block');
                    if (parentBlock && parentBlock.getAttribute('type') === 'math_number') {
                        // Check if this is the initial stake field by looking at the block ID
                        const blockId = parentBlock.getAttribute('id');
                        if (blockId === 'initial_stake_value') {
                            field.textContent = currentStake.toString();
                            stakeUpdatesCount++;
                            console.log(`💰 Updated initial stake to ${currentStake} (from StakeManager)`);
                        }
                    }
                });

                console.log(`💰 Total CFX stake fields updated: ${stakeUpdatesCount}`);

                // Auto-set entry point based on current market data
                // await setAutoEntryPoint(xmlDoc, market, signalType); // TODO: Implement this function

                // Serialize back to XML
                const serializer = new XMLSerializer();
                const configuredXml = serializer.serializeToString(xmlDoc);

                // Create a configured bot object
                const configuredBot = {
                    ...bot,
                    xmlContent: configuredXml,
                };

                console.log('✅ Bot configured, loading into workspace...');
                await handleBotClick(configuredBot);

                // Auto-run the bot after loading (with a small delay to ensure it's fully loaded)
                setTimeout(() => {
                    console.log('🚀 Auto-running bot after configuration...');
                    try {
                        // Trigger the run button click programmatically
                        const runButton = document.getElementById('db-animation__run-button');
                        if (runButton) {
                            runButton.click();
                            console.log('✅ Bot auto-started successfully');
                        } else {
                            console.warn('⚠️ Run button not found, trying alternative method...');
                            // Alternative method: dispatch run button event
                            const runEvent = new CustomEvent('bot.auto.run');
                            window.dispatchEvent(runEvent);
                        }
                    } catch (error) {
                        console.error('❌ Failed to auto-run bot:', error);
                    }
                }, 2000); // 2 second delay to ensure bot is fully loaded
            } else {
                console.error('❌ Bot not found:', botFile);
            }
        };

        window.addEventListener('load.cfx.bot', handleCFXBotLoad);
        return () => {
            window.removeEventListener('load.cfx.bot', handleCFXBotLoad);
        };
    }, [bots, handleBotClick]);

    // Listen for MatchesMaster bot auto-open events from Zeus Analysis
    useEffect(() => {
        const handleMatchesMasterOpen = async (event: Event) => {
            const customEvent = event as CustomEvent;
            const { predictedDigit, market } = customEvent.detail;
            console.log('📥 Received MatchesMaster auto-open request:', { predictedDigit, market });

            // Find the MatchesMaster bot in the bots array
            const matchesMasterBot = bots.find(b => b.filePath === 'MatchesMaster.xml');
            if (matchesMasterBot) {
                console.log('✅ Found MatchesMaster bot, configuring with Zeus prediction...');

                // Parse and configure the XML with Zeus parameters
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(matchesMasterBot.xmlContent, 'text/xml');

                // Update market (SYMBOL_LIST)
                const symbolFields = xmlDoc.querySelectorAll('field[name="SYMBOL_LIST"]');
                symbolFields.forEach(field => {
                    field.textContent = market;
                    console.log(`📊 Market set to: ${market}`);
                });

                // Update target digit in the Target Digit variable initialization
                const targetDigitFields = xmlDoc.querySelectorAll('block[type="variables_set"] field[name="VAR"]');
                targetDigitFields.forEach(field => {
                    if (field.textContent === 'Target Digit') {
                        // Find the NUM field in the same block
                        const block = field.closest('block[type="variables_set"]');
                        if (block) {
                            const numField = block.querySelector('block[type="math_number"] field[name="NUM"]');
                            if (numField) {
                                numField.textContent = predictedDigit.toString();
                                console.log(`🎯 Target digit set to: ${predictedDigit}`);
                            }
                        }
                    }
                });

                // Serialize back to XML
                const serializer = new XMLSerializer();
                const configuredXml = serializer.serializeToString(xmlDoc);

                // Create a configured bot object
                const configuredBot = {
                    ...matchesMasterBot,
                    xmlContent: configuredXml,
                    title: `MatchesMaster - Digit ${predictedDigit}`,
                };

                console.log('✅ MatchesMaster configured, loading into workspace...');
                await handleBotClick(configuredBot);
            } else {
                console.error('❌ MatchesMaster bot not found');
            }
        };

        window.addEventListener('open.matchesmaster.bot', handleMatchesMasterOpen);
        return () => {
            window.removeEventListener('open.matchesmaster.bot', handleMatchesMasterOpen);
        };
    }, [bots, handleBotClick]);

    // Listen for generic signal bot load events from Advanced Algo
    useEffect(() => {
        const handleSignalBotLoad = async (event: Event) => {
            const customEvent = event as CustomEvent;
            const { botFile, botName, market, contractType, stake, prediction, signalType, confidence } =
                customEvent.detail;
            console.log('📥 Received generic signal bot load request:', {
                botFile,
                botName,
                market,
                contractType,
                stake,
                prediction,
                signalType,
                confidence,
            });

            // Find the bot in the bots array
            const bot = bots.find(b => b.filePath === botFile);
            if (bot) {
                console.log('✅ Found bot, configuring with signal parameters...');

                // Parse and configure the XML with signal parameters
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(bot.xmlContent, 'text/xml');

                // Update market (SYMBOL_LIST)
                const symbolFields = xmlDoc.querySelectorAll('field[name="SYMBOL_LIST"]');
                symbolFields.forEach(field => {
                    field.textContent = market;
                    console.log(`📊 Market set to: ${market}`);
                });

                // Update contract type based on signal type
                const typeFields = xmlDoc.querySelectorAll('field[name="TYPE_LIST"]');
                typeFields.forEach(field => {
                    field.textContent = contractType;
                    console.log(`📝 Contract type set to: ${contractType}`);
                });

                // Also update PURCHASE_LIST fields (in purchase blocks)
                const purchaseFields = xmlDoc.querySelectorAll('field[name="PURCHASE_LIST"]');
                purchaseFields.forEach(field => {
                    field.textContent = contractType;
                    console.log(`💰 Purchase type set to: ${contractType}`);
                });

                // Update prediction digit for OVER/UNDER signals
                if (prediction !== undefined) {
                    const predictionFields = xmlDoc.querySelectorAll('field[name="NUM"]');
                    // Find the prediction field (it's in a math_number_positive block)
                    predictionFields.forEach(field => {
                        const parent = field.parentElement;
                        if (parent && parent.getAttribute('type') === 'math_number_positive') {
                            field.textContent = prediction.toString();
                            console.log(`🎯 Prediction digit set to: ${prediction}`);
                        }
                    });
                }

                // Update stake using StakeManager (overrides XML defaults)
                const { stakeManager } = await import('@/services/stake-manager.service');
                const currentStake = stakeManager.getStake();

                const stakeFields = xmlDoc.querySelectorAll('field[name="NUM"]');
                let stakeUpdatesCount = 0;

                stakeFields.forEach(field => {
                    // Look for stake-related NUM fields
                    const parentBlock = field.closest('block');
                    if (parentBlock && parentBlock.getAttribute('type') === 'math_number') {
                        // Check if this is the initial stake field by looking at the block ID
                        const blockId = parentBlock.getAttribute('id');
                        if (blockId === 'initial_stake_value' || blockId?.includes('stake')) {
                            field.textContent = currentStake.toString();
                            stakeUpdatesCount++;
                            console.log(`💰 Updated stake to ${currentStake} (from StakeManager)`);
                        }
                    }
                });

                console.log(`💰 Total stake fields updated: ${stakeUpdatesCount}`);

                // Serialize back to XML
                const serializer = new XMLSerializer();
                const configuredXml = serializer.serializeToString(xmlDoc);

                // Create a configured bot object
                const configuredBot = {
                    ...bot,
                    xmlContent: configuredXml,
                    title: `${botName} - ${signalType} (${confidence}%)`,
                };

                console.log('✅ Generic bot configured, loading into workspace...');
                await handleBotClick(configuredBot);
            } else {
                console.error('❌ Bot not found:', botFile);
            }
        };

        window.addEventListener('load.signal.bot', handleSignalBotLoad);
        return () => {
            window.removeEventListener('load.signal.bot', handleSignalBotLoad);
        };
    }, [bots, handleBotClick]);

    // Listen for enhanced CFX bot loading events from Advanced Algorithm
    useEffect(() => {
        const handleEnhancedCFXBotLoad = async (event: Event) => {
            const customEvent = event as CustomEvent;
            const { botFile, signal, autoLoaded } = customEvent.detail;
            console.log('🚀 Received enhanced CFX bot load request:', { botFile, signal, autoLoaded });

            // Find the bot in the bots array
            const bot = bots.find(b => b.filePath === botFile);
            if (bot) {
                console.log('✅ Found CFX bot, loading directly into Bot Builder...');

                // Switch to Bot Builder tab first
                setActiveTab(DBOT_TABS.BOT_BUILDER);

                // Load the bot directly
                await handleBotClick(bot);

                console.log('✅ Enhanced CFX bot loaded successfully');

                // Auto-run the bot if autoLoaded is true
                if (autoLoaded) {
                    setTimeout(() => {
                        console.log('🚀 Auto-running enhanced CFX bot...');
                        try {
                            const runButton = document.getElementById('db-animation__run-button');
                            if (runButton) {
                                runButton.click();
                                console.log('✅ Enhanced CFX bot auto-started successfully');
                            } else {
                                console.warn('⚠️ Run button not found for enhanced CFX bot');
                            }
                        } catch (error) {
                            console.error('❌ Failed to auto-run enhanced CFX bot:', error);
                        }
                    }, 2000);
                }
            } else {
                console.error('❌ CFX Bot not found:', botFile);
            }
        };

        window.addEventListener('load.cfx.bot.enhanced', handleEnhancedCFXBotLoad);
        return () => {
            window.removeEventListener('load.cfx.bot.enhanced', handleEnhancedCFXBotLoad);
        };
    }, [bots, handleBotClick, setActiveTab]);

    // Listen for enhanced Elvis bot loading events from Advanced Algorithm
    useEffect(() => {
        const handleEnhancedElvisBotLoad = async (event: Event) => {
            const customEvent = event as CustomEvent;
            const { botFile, signal, autoLoaded } = customEvent.detail;
            console.log('🚀 Received enhanced Elvis bot load request:', { botFile, signal, autoLoaded });

            // Find the bot in the bots array
            const bot = bots.find(b => b.filePath === botFile);
            if (bot) {
                console.log('✅ Found Elvis bot, loading directly into Bot Builder...');

                // Switch to Bot Builder tab first
                setActiveTab(DBOT_TABS.BOT_BUILDER);

                // Load the bot directly
                await handleBotClick(bot);

                console.log('✅ Enhanced Elvis bot loaded successfully');

                // Auto-run the Elvis bot if autoLoaded is true
                if (autoLoaded) {
                    setTimeout(() => {
                        console.log('🚀 Auto-running enhanced Elvis bot...');
                        try {
                            const runButton = document.getElementById('db-animation__run-button');
                            if (runButton) {
                                runButton.click();
                                console.log('✅ Enhanced Elvis bot auto-started successfully');
                            } else {
                                console.warn('⚠️ Run button not found for enhanced Elvis bot');
                            }
                        } catch (error) {
                            console.error('❌ Failed to auto-run enhanced Elvis bot:', error);
                        }
                    }, 2000);
                }
            } else {
                console.error('❌ Elvis Bot not found:', botFile);
            }
        };

        window.addEventListener('load.elvis.bot.enhanced', handleEnhancedElvisBotLoad);
        return () => {
            window.removeEventListener('load.elvis.bot.enhanced', handleEnhancedElvisBotLoad);
        };
    }, [bots, handleBotClick, setActiveTab]);

    // Listen for enhanced signal bot loading events from Advanced Algorithm
    useEffect(() => {
        const handleEnhancedSignalBotLoad = async (event: Event) => {
            const customEvent = event as CustomEvent;
            const { botFile, signal, autoLoaded } = customEvent.detail;
            console.log('🚀 Received enhanced signal bot load request:', { botFile, signal, autoLoaded });

            // Find the bot in the bots array
            const bot = bots.find(b => b.filePath === botFile);
            if (bot) {
                console.log('✅ Found signal bot, loading directly into Bot Builder...');

                // Switch to Bot Builder tab first
                setActiveTab(DBOT_TABS.BOT_BUILDER);

                // Load the bot directly
                await handleBotClick(bot);

                console.log('✅ Enhanced signal bot loaded successfully');

                // Auto-run the signal bot if autoLoaded is true
                if (autoLoaded) {
                    setTimeout(() => {
                        console.log('🚀 Auto-running enhanced signal bot...');
                        try {
                            const runButton = document.getElementById('db-animation__run-button');
                            if (runButton) {
                                runButton.click();
                                console.log('✅ Enhanced signal bot auto-started successfully');
                            } else {
                                console.warn('⚠️ Run button not found for enhanced signal bot');
                            }
                        } catch (error) {
                            console.error('❌ Failed to auto-run enhanced signal bot:', error);
                        }
                    }, 2000);
                }
            } else {
                console.error('❌ Signal Bot not found:', botFile);
            }
        };

        window.addEventListener('load.signal.bot.enhanced', handleEnhancedSignalBotLoad);
        return () => {
            window.removeEventListener('load.signal.bot.enhanced', handleEnhancedSignalBotLoad);
        };
    }, [bots, handleBotClick, setActiveTab]);

    // Listen for enhanced PATEL bot loading events from Advanced Algorithm
    useEffect(() => {
        const handleEnhancedPatelBotLoad = async (event: Event) => {
            const customEvent = event as CustomEvent;
            const { botFile, signal, autoLoaded, barrier, recoveryStrategy } = customEvent.detail;

            console.log('🎯 Received enhanced PATEL bot load request:', {
                botFile,
                signal: signal.prediction,
                barrier,
                recoveryStrategy: recoveryStrategy
                    ? {
                          predictionBeforeLoss: recoveryStrategy.predictionBeforeLoss,
                          predictionAfterLoss: recoveryStrategy.predictionAfterLoss,
                          strategy: recoveryStrategy.strategy,
                      }
                    : null,
                market: signal.market,
                confidence: signal.confidence,
                autoLoaded,
            });

            // Find the PATEL bot in the bots array
            const bot = bots.find(b => b.filePath === botFile);
            if (bot) {
                console.log('✅ Found PATEL bot, configuring with adaptive recovery logic...');

                // Parse and configure the XML with proper OVER/UNDER handling
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(bot.xmlContent, 'text/xml');

                // Update market (SYMBOL_LIST)
                const symbolFields = xmlDoc.querySelectorAll('field[name="SYMBOL_LIST"]');
                symbolFields.forEach(field => {
                    field.textContent = signal.market;
                    console.log(`📊 Market set to: ${signal.market}`);
                });

                // Update contract type based on signal type
                const contractType = signal.prediction.includes('OVER') ? 'DIGITOVER' : 'DIGITUNDER';
                const typeFields = xmlDoc.querySelectorAll('field[name="TYPE_LIST"]');
                typeFields.forEach(field => {
                    field.textContent = contractType;
                    console.log(`📝 Contract type set to: ${contractType}`);
                });

                // Also update PURCHASE_LIST fields (in purchase blocks)
                const purchaseFields = xmlDoc.querySelectorAll('field[name="PURCHASE_LIST"]');
                purchaseFields.forEach(field => {
                    field.textContent = contractType;
                    console.log(`💰 Purchase type set to: ${contractType}`);
                });

                // Set the barrier value
                if (barrier) {
                    const barrierFields = xmlDoc.querySelectorAll('field[name="BARRIER"]');
                    barrierFields.forEach(field => {
                        field.textContent = barrier.toString();
                        console.log(`🎯 Barrier set to: ${barrier}`);
                    });
                }

                // Configure Adaptive Recovery Strategy - Prediction Before/After Loss
                if (recoveryStrategy) {
                    console.log('🧠 Configuring Adaptive Recovery Strategy...');

                    // Find and update prediction before loss
                    const variableFields = xmlDoc.querySelectorAll('block[type="variables_set"] field[name="VAR"]');
                    variableFields.forEach(field => {
                        const varName = field.textContent;
                        const block = field.closest('block[type="variables_set"]');

                        if (block) {
                            const numField = block.querySelector('block[type="math_number"] field[name="NUM"]');

                            if (varName === 'Prediction Before Loss' || varName === 'Initial Prediction') {
                                if (numField) {
                                    numField.textContent = recoveryStrategy.predictionBeforeLoss.toString();
                                    console.log(
                                        `🎯 Prediction Before Loss set to: ${recoveryStrategy.predictionBeforeLoss}`
                                    );
                                }
                            } else if (varName === 'Prediction After Loss' || varName === 'Recovery Prediction') {
                                if (numField) {
                                    numField.textContent = recoveryStrategy.predictionAfterLoss.toString();
                                    console.log(
                                        `🔄 Prediction After Loss set to: ${recoveryStrategy.predictionAfterLoss}`
                                    );
                                }
                            }
                        }
                    });

                    // Also look for direct prediction fields in the bot logic
                    const predictionFields = xmlDoc.querySelectorAll('field[name="NUM"]');
                    predictionFields.forEach(field => {
                        const parentBlock = field.closest('block');
                        if (parentBlock) {
                            const blockType = parentBlock.getAttribute('type');
                            const blockId = parentBlock.getAttribute('id');

                            // Look for prediction-related blocks
                            if (blockId && (blockId.includes('prediction') || blockId.includes('digit'))) {
                                // This might be a prediction field - we'll set it to the before loss value
                                field.textContent = recoveryStrategy.predictionBeforeLoss.toString();
                                console.log(
                                    `🎯 Prediction field set to: ${recoveryStrategy.predictionBeforeLoss} (before loss)`
                                );
                            }
                        }
                    });

                    console.log(`✅ Adaptive Recovery configured:`, {
                        predictionBeforeLoss: recoveryStrategy.predictionBeforeLoss,
                        predictionAfterLoss: recoveryStrategy.predictionAfterLoss,
                        winProbBeforeLoss: `${recoveryStrategy.winProbabilities.beforeLoss}%`,
                        winProbAfterLoss: `${recoveryStrategy.winProbabilities.afterLoss}%`,
                        strategy: recoveryStrategy.strategy,
                    });
                }

                // For PATEL bot, we should NOT set hardcoded prediction digits
                // Instead, let the bot use its entry point detection logic
                console.log('ℹ️ PATEL bot will use entry point detection with adaptive recovery');

                // Update Search Number (entry point digit) if provided
                if (signal.entryDigit) {
                    const variableFields = xmlDoc.querySelectorAll('block[type="variables_set"] field[name="VAR"]');
                    variableFields.forEach(field => {
                        if (field.textContent === 'Search Number') {
                            const block = field.closest('block[type="variables_set"]');
                            if (block) {
                                const numField = block.querySelector('block[type="math_number"] field[name="NUM"]');
                                if (numField) {
                                    numField.textContent = signal.entryDigit.toString();
                                    console.log(`🔍 Search Number set to: ${signal.entryDigit}`);
                                }
                            }
                        }
                    });
                }

                // Serialize back to XML
                const serializer = new XMLSerializer();
                const configuredXml = serializer.serializeToString(xmlDoc);

                // Create a configured bot object
                const configuredBot = {
                    ...bot,
                    xmlContent: configuredXml,
                    title: `${bot.title} - ${signal.prediction} (${signal.confidence}%)`,
                };

                console.log('✅ PATEL bot configured with proper OVER/UNDER logic, loading into workspace...');

                // Switch to Bot Builder tab first
                setActiveTab(DBOT_TABS.BOT_BUILDER);

                // Small delay to ensure tab switch completes
                setTimeout(async () => {
                    try {
                        // Validate bot configuration before loading
                        if (!configuredBot) {
                            console.error('❌ Configured bot is undefined');
                            return;
                        }

                        if (!configuredBot.xmlContent) {
                            console.error('❌ Configured bot XML content is missing');
                            return;
                        }

                        console.log('🚀 Loading configured PATEL bot...');
                        await handleBotClick(configuredBot);
                        console.log('✅ Enhanced PATEL bot loaded successfully');
                    } catch (error) {
                        console.error('❌ Error loading enhanced PATEL bot:', error);

                        // Provide specific guidance for PATEL bot loading issues
                        console.error('💡 PATEL bot loading failed. Troubleshooting steps:');
                        console.error('   1. Check if Bot Builder tab is accessible');
                        console.error('   2. Verify PATEL bot XML file exists in public folder');
                        console.error('   3. Try loading a different bot first to test the system');
                        console.error('   4. Refresh the page and try again');

                        // Attempt recovery by switching to bot builder tab
                        try {
                            console.log('🔄 Attempting recovery by switching to Bot Builder...');
                            setActiveTab(DBOT_TABS.BOT_BUILDER);
                        } catch (recoveryError) {
                            console.error('❌ Recovery attempt failed:', recoveryError);
                        }
                    }
                }, 300);
            } else {
                console.error('❌ PATEL bot not found:', botFile);
            }
        };

        window.addEventListener('load.patel.bot.enhanced', handleEnhancedPatelBotLoad);
        return () => {
            window.removeEventListener('load.patel.bot.enhanced', handleEnhancedPatelBotLoad);
        };
    }, [bots, handleBotClick, setActiveTab]);

    // Listen for Raziel Over Under bot loading events from Zeus AI
    useEffect(() => {
        const handleRazielBotLoad = async (event: Event) => {
            let eventData;

            // Handle both CustomEvent and MessageEvent
            if (event instanceof MessageEvent) {
                // Handle postMessage from AI tool iframe
                if (event.data.type === 'LOAD_RAZIEL_BOT') {
                    eventData = event.data.data;
                } else {
                    return; // Not our message
                }
            } else {
                // Handle CustomEvent
                const customEvent = event as CustomEvent;
                eventData = customEvent.detail;
            }

            const {
                botFile,
                botName,
                market,
                contractType,
                predictionBeforeLoss,
                predictionAfterLoss,
                selectedDigit,
                entryPointDigit,
                strategy,
            } = eventData;

            console.log('🎯 Received Raziel Over Under bot load request:', {
                botFile,
                botName,
                market,
                contractType,
                predictionBeforeLoss,
                predictionAfterLoss,
                selectedDigit,
                entryPointDigit,
                strategy,
            });

            // Find the Raziel Over Under bot in the bots array
            const bot = bots.find(b => b.filePath === botFile);
            if (bot) {
                console.log('✅ Found Raziel Over Under bot, configuring with Zeus parameters...');

                // Parse and configure the XML with Zeus parameters
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(bot.xmlContent, 'text/xml');

                // Update market (SYMBOL_LIST)
                const symbolFields = xmlDoc.querySelectorAll('field[name="SYMBOL_LIST"]');
                symbolFields.forEach(field => {
                    field.textContent = market;
                    console.log(`📊 Market set to: ${market}`);
                });

                // Update contract type (TYPE_LIST and PURCHASE_LIST)
                const typeFields = xmlDoc.querySelectorAll('field[name="TYPE_LIST"]');
                typeFields.forEach(field => {
                    field.textContent = contractType;
                    console.log(`📝 Contract type set to: ${contractType}`);
                });

                const purchaseFields = xmlDoc.querySelectorAll('field[name="PURCHASE_LIST"]');
                purchaseFields.forEach(field => {
                    field.textContent = contractType;
                    console.log(`💰 Purchase type set to: ${contractType}`);
                });

                // Update prediction before loss
                const predictionBeforeLossFields = xmlDoc.querySelectorAll(
                    'block[type="variables_set"] field[name="VAR"]'
                );
                predictionBeforeLossFields.forEach(field => {
                    if (field.textContent === 'Prediction before loss') {
                        const block = field.closest('block[type="variables_set"]');
                        if (block) {
                            const numField = block.querySelector('block[type="math_number"] field[name="NUM"]');
                            if (numField) {
                                numField.textContent = predictionBeforeLoss.toString();
                                console.log(`🎯 Prediction before loss set to: ${predictionBeforeLoss}`);
                            }
                        }
                    }
                });

                // Update prediction after loss
                predictionBeforeLossFields.forEach(field => {
                    if (field.textContent === 'prediction after l oss') {
                        // Note: there's a space in the XML
                        const block = field.closest('block[type="variables_set"]');
                        if (block) {
                            const numField = block.querySelector('block[type="math_number"] field[name="NUM"]');
                            if (numField) {
                                numField.textContent = predictionAfterLoss.toString();
                                console.log(`🎯 Prediction after loss set to: ${predictionAfterLoss}`);
                            }
                        }
                    }
                });

                // Update entry point digit
                predictionBeforeLossFields.forEach(field => {
                    if (field.textContent === 'Entry Point Digit') {
                        const block = field.closest('block[type="variables_set"]');
                        if (block) {
                            const numField = block.querySelector('block[type="math_number"] field[name="NUM"]');
                            if (numField) {
                                numField.textContent = entryPointDigit.toString();
                                console.log(`🎯 Entry Point Digit set to: ${entryPointDigit}`);
                            }
                        }
                    }
                });

                // Update stake using StakeManager
                const { stakeManager } = await import('@/services/stake-manager.service');
                const currentStake = stakeManager.getStake();

                const stakeFields = xmlDoc.querySelectorAll('field[name="NUM"]');
                let stakeUpdatesCount = 0;

                stakeFields.forEach(field => {
                    const parentBlock = field.closest('block');
                    if (parentBlock && parentBlock.getAttribute('type') === 'math_number') {
                        // Look for stake-related fields
                        const prevSibling = field.parentElement?.previousElementSibling;
                        if (prevSibling && prevSibling.textContent === 'Stake') {
                            field.textContent = currentStake.toString();
                            stakeUpdatesCount++;
                            console.log(`💰 Updated stake to ${currentStake} (from StakeManager)`);
                        }
                        if (prevSibling && prevSibling.textContent === 'initalStake') {
                            field.textContent = currentStake.toString();
                            stakeUpdatesCount++;
                            console.log(`💰 Updated initial stake to ${currentStake} (from StakeManager)`);
                        }
                    }
                });

                console.log(`💰 Total Raziel stake fields updated: ${stakeUpdatesCount}`);

                // Serialize back to XML
                const serializer = new XMLSerializer();
                const configuredXml = serializer.serializeToString(xmlDoc);

                // Create a configured bot object
                const configuredBot = {
                    ...bot,
                    xmlContent: configuredXml,
                    title: `${botName} (${strategy} ${selectedDigit} | Entry: ${entryPointDigit})`,
                };

                console.log('✅ Raziel Over Under bot configured, loading into workspace...');

                // Switch to Bot Builder tab first
                setActiveTab(DBOT_TABS.BOT_BUILDER);

                // Load the bot
                await handleBotClick(configuredBot);

                // Auto-run the bot after loading (with a small delay to ensure it's fully loaded)
                setTimeout(() => {
                    console.log('🚀 Auto-running Raziel Over Under bot after configuration...');
                    try {
                        const runButton = document.getElementById('db-animation__run-button');
                        if (runButton) {
                            runButton.click();
                            console.log('✅ Raziel Over Under bot auto-started successfully');
                        } else {
                            console.warn('⚠️ Run button not found, trying alternative method...');
                        }
                    } catch (error) {
                        console.error('❌ Failed to auto-run Raziel Over Under bot:', error);
                    }
                }, 2000); // 2 second delay to ensure bot is fully loaded
            } else {
                console.error('❌ Raziel Over Under bot not found:', botFile);
            }
        };

        window.addEventListener('LOAD_RAZIEL_BOT', handleRazielBotLoad);
        window.addEventListener('message', handleRazielBotLoad);
        return () => {
            window.removeEventListener('LOAD_RAZIEL_BOT', handleRazielBotLoad);
            window.removeEventListener('message', handleRazielBotLoad);
        };
    }, [bots, handleBotClick, setActiveTab]);

    // Listen for PATEL bot loading events from Zeus AI
    useEffect(() => {
        const handlePatelBotLoad = async (event: Event) => {
            let eventData;

            // Handle both CustomEvent and MessageEvent
            if (event instanceof MessageEvent) {
                // Handle postMessage from AI tool iframe
                if (event.data.type === 'LOAD_PATEL_BOT') {
                    eventData = event.data.data;
                } else {
                    return; // Not our message
                }
            } else {
                // Handle CustomEvent
                const customEvent = event as CustomEvent;
                eventData = customEvent.detail;
            }

            const {
                botFile,
                botName,
                market,
                contractType,
                predictionBeforeLoss,
                predictionAfterLoss,
                selectedDigit,
                entryPointDigit,
                strategy,
            } = eventData;

            console.log('🎯 Received PATEL bot load request:', {
                botFile,
                botName,
                market,
                contractType,
                predictionBeforeLoss,
                predictionAfterLoss,
                selectedDigit,
                entryPointDigit,
                strategy,
            });

            // Find the PATEL bot in the bots array
            const bot = bots.find(b => b.filePath === botFile);
            if (bot) {
                console.log('✅ Found PATEL bot, configuring with digit parameters...');

                // Parse and configure the XML with digit parameters
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(bot.xmlContent, 'text/xml');

                // Update market (SYMBOL_LIST)
                const symbolFields = xmlDoc.querySelectorAll('field[name="SYMBOL_LIST"]');
                symbolFields.forEach(field => {
                    field.textContent = market;
                    console.log(`📊 Market set to: ${market}`);
                });

                // Update contract type (TYPE_LIST and PURCHASE_LIST)
                const typeFields = xmlDoc.querySelectorAll('field[name="TYPE_LIST"]');
                typeFields.forEach(field => {
                    field.textContent = contractType;
                    console.log(`📝 Contract type set to: ${contractType}`);
                });

                const purchaseFields = xmlDoc.querySelectorAll('field[name="PURCHASE_LIST"]');
                purchaseFields.forEach(field => {
                    field.textContent = contractType;
                    console.log(`💰 Purchase type set to: ${contractType}`);
                });

                // Update prediction before loss (exact variable name from PATEL bot)
                const variableFields = xmlDoc.querySelectorAll('block[type="variables_set"] field[name="VAR"]');
                variableFields.forEach(field => {
                    if (field.textContent === 'prediction before loss') {
                        const block = field.closest('block[type="variables_set"]');
                        if (block) {
                            const numField = block.querySelector('block[type="math_number"] field[name="NUM"]');
                            if (numField) {
                                numField.textContent = predictionBeforeLoss.toString();
                                console.log(`🎯 Prediction before loss set to: ${predictionBeforeLoss}`);
                            }
                        }
                    }
                });

                // Update prediction after loss (exact variable name from PATEL bot)
                variableFields.forEach(field => {
                    if (field.textContent === 'prediction after loss') {
                        const block = field.closest('block[type="variables_set"]');
                        if (block) {
                            const numField = block.querySelector('block[type="math_number"] field[name="NUM"]');
                            if (numField) {
                                numField.textContent = predictionAfterLoss.toString();
                                console.log(`🎯 Prediction after loss set to: ${predictionAfterLoss}`);
                            }
                        }
                    }
                });

                // Update Search Number (entry point digit - exact variable name from PATEL bot)
                variableFields.forEach(field => {
                    if (field.textContent === 'Search Number') {
                        const block = field.closest('block[type="variables_set"]');
                        if (block) {
                            const numField = block.querySelector('block[type="math_number"] field[name="NUM"]');
                            if (numField) {
                                numField.textContent = entryPointDigit.toString();
                                console.log(`🎯 Search Number (Entry Point) set to: ${entryPointDigit}`);
                            }
                        }
                    }
                });

                // Serialize the updated XML
                const serializer = new XMLSerializer();
                const updatedXmlContent = serializer.serializeToString(xmlDoc);

                // Update the bot object with new XML content
                const updatedBot = {
                    ...bot,
                    xmlContent: updatedXmlContent,
                    displayName: botName,
                };

                console.log('✅ PATEL bot configured, loading into workspace...');

                // Switch to Bot Builder tab first
                setActiveTab(1); // BOT_BUILDER is at index 1

                // Load the bot with a slight delay to ensure tab switch completes
                setTimeout(async () => {
                    try {
                        await handleBotClick(updatedBot);
                        console.log('✅ PATEL bot loaded successfully');
                    } catch (error) {
                        console.error('❌ Error loading PATEL bot:', error);
                    }
                }, 300);
            } else {
                console.error('❌ PATEL bot not found:', botFile);
            }
        };

        window.addEventListener('LOAD_PATEL_BOT', handlePatelBotLoad);
        window.addEventListener('message', handlePatelBotLoad);
        return () => {
            window.removeEventListener('LOAD_PATEL_BOT', handlePatelBotLoad);
            window.removeEventListener('message', handlePatelBotLoad);
        };
    }, [bots, handleBotClick, setActiveTab]);

    // Listen for MATCHES bot load events from AI Analysis Tool
    useEffect(() => {
        const handleMatchesBotLoad = async (event: Event) => {
            let eventData: any;

            // Handle both CustomEvent and MessageEvent
            if (event instanceof MessageEvent) {
                // Handle postMessage from AI tool iframe
                if (event.data.type === 'LOAD_MATCHES_BOT') {
                    eventData = event.data.data;
                } else {
                    return; // Not our message
                }
            } else {
                // Handle CustomEvent
                const customEvent = event as CustomEvent;
                eventData = customEvent.detail;
            }

            const {
                botFile,
                botName,
                market,
                contractType,
                tradeType,
                predictionBeforeLoss,
                predictionAfterLoss,
                selectedDigit,
                entryPointDigit,
                strategy,
                targetDigit,
            } = eventData;

            console.log('🎲 Received MATCHES bot load request:', {
                botFile,
                botName,
                market,
                contractType,
                tradeType,
                predictionBeforeLoss,
                predictionAfterLoss,
                selectedDigit,
                entryPointDigit,
                strategy,
                targetDigit,
            });

            // Find the MATCHES bot XML file (we'll use PATEL as template and modify it)
            const templateBot = bots.find(b => b.filePath === 'PATEL (with Entry).xml');
            if (templateBot) {
                console.log('✅ Found PATEL template, configuring for MATCHES mode...');

                // Parse and configure the XML for MATCHES mode
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(templateBot.xmlContent, 'text/xml');

                // Update market (SYMBOL_LIST)
                const symbolFields = xmlDoc.querySelectorAll('field[name="SYMBOL_LIST"]');
                symbolFields.forEach(field => {
                    field.textContent = market;
                    console.log(`📊 Market set to: ${market}`);
                });

                // Update trade type to "matches"
                const tradeTypeFields = xmlDoc.querySelectorAll('field[name="TRADETYPE_LIST"]');
                tradeTypeFields.forEach(field => {
                    field.textContent = 'matches';
                    console.log(`🎲 Trade type set to: matches`);
                });

                // Update contract type to DIGITMATCHES
                const typeFields = xmlDoc.querySelectorAll('field[name="TYPE_LIST"]');
                typeFields.forEach(field => {
                    field.textContent = 'DIGITMATCHES';
                    console.log(`📝 Contract type set to: DIGITMATCHES`);
                });

                const purchaseFields = xmlDoc.querySelectorAll('field[name="PURCHASE_LIST"]');
                purchaseFields.forEach(field => {
                    field.textContent = 'DIGITMATCHES';
                    console.log(`💰 Purchase type set to: DIGITMATCHES`);
                });

                // Update prediction before loss (should equal target digit)
                const variableFields = xmlDoc.querySelectorAll('block[type="variables_set"] field[name="VAR"]');
                variableFields.forEach(field => {
                    if (field.textContent === 'prediction before loss') {
                        const block = field.closest('block[type="variables_set"]');
                        if (block) {
                            const numField = block.querySelector('block[type="math_number"] field[name="NUM"]');
                            if (numField) {
                                numField.textContent = targetDigit.toString();
                                console.log(`🎯 Prediction before loss set to: ${targetDigit}`);
                            }
                        }
                    }
                });

                // Update prediction after loss (should equal target digit)
                variableFields.forEach(field => {
                    if (field.textContent === 'prediction after loss') {
                        const block = field.closest('block[type="variables_set"]');
                        if (block) {
                            const numField = block.querySelector('block[type="math_number"] field[name="NUM"]');
                            if (numField) {
                                numField.textContent = targetDigit.toString();
                                console.log(`🎯 Prediction after loss set to: ${targetDigit}`);
                            }
                        }
                    }
                });

                // Update search number (entry point digit - same as target for matches)
                variableFields.forEach(field => {
                    if (field.textContent === 'Search Number') {
                        const block = field.closest('block[type="variables_set"]');
                        if (block) {
                            const numField = block.querySelector('block[type="math_number"] field[name="NUM"]');
                            if (numField) {
                                numField.textContent = targetDigit.toString();
                                console.log(`🎯 Entry Point Digit set to: ${targetDigit}`);
                            }
                        }
                    }
                });

                // Serialize the updated XML
                const serializer = new XMLSerializer();
                const updatedXmlContent = serializer.serializeToString(xmlDoc);

                // Create a new bot object for MATCHES mode
                const matchesBot = {
                    ...templateBot,
                    xmlContent: updatedXmlContent,
                    displayName: botName,
                    filePath: 'MATCHES (with Entry).xml', // Use MATCHES file path
                };

                console.log('✅ MATCHES bot configured, loading into workspace...');

                // Switch to Bot Builder tab first
                setActiveTab(1); // BOT_BUILDER is at index 1

                // Load the bot with a slight delay to ensure tab switch completes
                setTimeout(async () => {
                    try {
                        await handleBotClick(matchesBot);
                        console.log('✅ MATCHES bot loaded successfully');
                    } catch (error) {
                        console.error('❌ Error loading MATCHES bot:', error);
                    }
                }, 300);
            } else {
                console.error('❌ PATEL template bot not found for MATCHES configuration');
            }
        };

        window.addEventListener('LOAD_MATCHES_BOT', handleMatchesBotLoad);
        window.addEventListener('message', handleMatchesBotLoad);
        return () => {
            window.removeEventListener('LOAD_MATCHES_BOT', handleMatchesBotLoad);
            window.removeEventListener('message', handleMatchesBotLoad);
        };
    }, [bots, handleBotClick, setActiveTab]);

    // Listen for EVEN/ODD bot loading events from Zeus AI
    useEffect(() => {
        const handleEvenOddBotLoad = async (event: Event) => {
            let eventData: any;

            // Handle both CustomEvent and MessageEvent
            if (event instanceof MessageEvent) {
                // Handle postMessage from AI tool iframe
                if (event.data.type === 'LOAD_EVEN_ODD_BOT') {
                    eventData = event.data.data;
                } else {
                    return; // Not our message
                }
            } else {
                // Handle CustomEvent
                const customEvent = event as CustomEvent;
                eventData = customEvent.detail;
            }

            const {
                botFile,
                botName,
                market,
                contractType,
                tradeType,
                selectedDigit,
                entryPointDigit,
                evenOddType,
                strategy,
                stake,
                martingale,
                maxMartingaleSteps,
            } = eventData;

            console.log('⚪⚫ Received EVEN/ODD bot load request:', {
                botFile,
                botName,
                market,
                contractType,
                tradeType,
                selectedDigit,
                entryPointDigit,
                evenOddType,
                strategy,
            });

            // Find the CFX-EvenOdd bot in the bots array
            const bot = bots.find(b => b.filePath === botFile);
            if (bot) {
                console.log('✅ Found CFX-EvenOdd bot, configuring with parameters...');

                // Parse and configure the XML with even/odd parameters
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(bot.xmlContent, 'text/xml');

                // Update market (SYMBOL_LIST)
                const symbolFields = xmlDoc.querySelectorAll('field[name="SYMBOL_LIST"]');
                symbolFields.forEach(field => {
                    field.textContent = market;
                    console.log(`📊 Market set to: ${market}`);
                });

                // Update trade type to "digits"
                const tradeTypeFields = xmlDoc.querySelectorAll('field[name="TRADETYPE_LIST"]');
                tradeTypeFields.forEach(field => {
                    field.textContent = 'digits';
                    console.log(`⚪⚫ Trade type set to: digits`);
                });

                // Update contract type (DIGITEVEN or DIGITODD)
                const typeFields = xmlDoc.querySelectorAll('field[name="TYPE_LIST"]');
                typeFields.forEach(field => {
                    field.textContent = contractType;
                    console.log(`📝 Contract type set to: ${contractType}`);
                });

                const purchaseFields = xmlDoc.querySelectorAll('field[name="PURCHASE_LIST"]');
                purchaseFields.forEach(field => {
                    field.textContent = contractType;
                    console.log(`💰 Purchase type set to: ${contractType}`);
                });

                // Update stake amount if available
                const stakeFields = xmlDoc.querySelectorAll('block[type="variables_set"] field[name="VAR"]');
                stakeFields.forEach(field => {
                    if (field.textContent === 'stake' || field.textContent === 'initial_stake') {
                        const block = field.closest('block[type="variables_set"]');
                        if (block) {
                            const numField = block.querySelector('block[type="math_number"] field[name="NUM"]');
                            if (numField && stake) {
                                numField.textContent = stake.toString();
                                console.log(`💰 Stake set to: ${stake}`);
                            }
                        }
                    }
                });

                // Serialize the updated XML
                const serializer = new XMLSerializer();
                const updatedXmlContent = serializer.serializeToString(xmlDoc);

                // Update the bot object with new XML content
                const updatedBot = {
                    ...bot,
                    xmlContent: updatedXmlContent,
                    displayName: botName,
                };

                console.log('✅ EVEN/ODD bot configured, loading into workspace...');

                // Switch to Bot Builder tab first
                setActiveTab(1); // BOT_BUILDER is at index 1

                // Load the bot with a slight delay to ensure tab switch completes
                setTimeout(async () => {
                    try {
                        await handleBotClick(updatedBot);
                        console.log('✅ EVEN/ODD bot loaded successfully');
                    } catch (error) {
                        console.error('❌ Error loading EVEN/ODD bot:', error);
                    }
                }, 300);
            } else {
                console.error('❌ CFX-EvenOdd bot not found:', botFile);
            }
        };

        window.addEventListener('LOAD_EVEN_ODD_BOT', handleEvenOddBotLoad);
        window.addEventListener('message', handleEvenOddBotLoad);
        return () => {
            window.removeEventListener('LOAD_EVEN_ODD_BOT', handleEvenOddBotLoad);
            window.removeEventListener('message', handleEvenOddBotLoad);
        };
    }, [bots, handleBotClick, setActiveTab]);

    // Listen for auto load bot events from Advanced Algorithm
    useEffect(() => {
        const handleAutoLoadBot = async (event: Event) => {
            const customEvent = event as CustomEvent;
            const { botFile, signal, autoLoaded } = customEvent.detail;
            console.log('🤖 Received auto load bot request:', { botFile, signal, autoLoaded });

            // Find the bot in the bots array
            const bot = bots.find(b => b.filePath === botFile);
            if (bot) {
                console.log('✅ Found auto-load bot, loading directly into Bot Builder...');

                // Switch to Bot Builder tab first
                setActiveTab(DBOT_TABS.BOT_BUILDER);

                // Small delay to ensure tab switch completes
                setTimeout(async () => {
                    await handleBotClick(bot);
                    console.log('✅ Auto-load bot loaded successfully');
                }, 100);
            } else {
                console.error('❌ Auto-load Bot not found:', botFile);
            }
        };

        window.addEventListener('auto.load.bot', handleAutoLoadBot);
        return () => {
            window.removeEventListener('auto.load.bot', handleAutoLoadBot);
        };
    }, [bots, handleBotClick, setActiveTab]);

    // Listen for Fibonacci bot loading events from Raziel Bot Loader
    useEffect(() => {
        const handleFibonacciBotLoad = async (event: Event) => {
            const customEvent = event as CustomEvent;
            const { xmlContent, botName, market, parameters } = customEvent.detail;
            console.log('🎯 Received Fibonacci bot load request:', { botName, market, parameters });

            try {
                // Create a bot object with the configured XML
                const fibonacciBot = {
                    id: 'raziel-over-under-fibonacci',
                    filePath: 'Raziel Over Under.xml',
                    title: botName || 'Raziel Over Under (Fibonacci Configured)',
                    xmlContent: xmlContent,
                    save_type: 'LOCAL',
                };

                console.log('✅ Loading Fibonacci-configured Raziel Over Under bot...');

                // Switch to Bot Builder tab first
                setActiveTab(DBOT_TABS.BOT_BUILDER);

                // Small delay to ensure tab switch completes
                setTimeout(async () => {
                    await handleBotClick(fibonacciBot);
                    console.log('✅ Fibonacci Raziel Over Under bot loaded successfully');
                }, 300);
            } catch (error) {
                console.error('❌ Failed to load Fibonacci bot:', error);
            }
        };

        // Listen for both events
        window.addEventListener('load.fibonacci.bot', handleFibonacciBotLoad);
        window.addEventListener('load.bot.from.freebots', handleFibonacciBotLoad);

        return () => {
            window.removeEventListener('load.fibonacci.bot', handleFibonacciBotLoad);
            window.removeEventListener('load.bot.from.freebots', handleFibonacciBotLoad);
        };
    }, [bots, handleBotClick, setActiveTab]);

    // Listen for tab switching events from components
    useEffect(() => {
        const handleTabSwitch = (event: Event) => {
            const customEvent = event as CustomEvent;
            const { tab } = customEvent.detail;
            console.log('📋 Received tab switch request to tab:', tab);

            if (typeof tab === 'number') {
                setActiveTab(tab);
            }
        };

        // Test the CFX bot loading functionality
        const testCFXBotLoading = () => {
            console.log('🧪 Testing CFX bot loading functionality...');

            const mockSignal = {
                market: '1HZ100V',
                marketName: 'Volatility 100 (1s) Index',
                currentPrice: 1234.56789,
                confidence: 85.2,
                recommendation: {
                    action: 'OVER',
                    barrier: 3,
                    reasoning: 'Strong Fibonacci support at 61.8% level with ranging market conditions.',
                },
                analysis: {
                    volatility: 0.65,
                    trendStrength: 0.25,
                    rangingScore: 0.82,
                    fibonacciAlignment: 0.91,
                },
                fibonacciLevels: [
                    { level: 0.236, price: 1230.12345, type: 'support' },
                    { level: 0.618, price: 1234.56789, type: 'resistance' },
                ],
            };

            // Simulate the CFX bot loading
            const loadEvent = new CustomEvent('load.fibonacci.bot', {
                detail: {
                    xmlContent: '<xml>test</xml>',
                    botName: 'CFX-025 Fibonacci Test',
                    market: mockSignal.market,
                    parameters: mockSignal,
                },
            });

            window.dispatchEvent(loadEvent);
            console.log('✅ CFX bot loading test event dispatched');
        };

        // Add test function to window for debugging
        if (typeof window !== 'undefined') {
            (window as any).testCFXBotLoading = testCFXBotLoading;
        }

        window.addEventListener('switch.tab', handleTabSwitch);
        return () => {
            window.removeEventListener('switch.tab', handleTabSwitch);
        };
    }, [setActiveTab]);

    // Listen for token requests from Copy Trading iframe
    useEffect(() => {
        const handleTokenRequest = (event: MessageEvent) => {
            // Security check - only respond to messages from same origin
            if (event.origin !== window.location.origin) return;

            if (event.data.type === 'REQUEST_TOKEN') {
                console.log('📤 Copy Trading iframe requesting token...');

                // Get token from localStorage (same as DTrader)
                const authToken = localStorage.getItem('authToken');
                const activeLoginId = localStorage.getItem('active_loginid');

                if (authToken && activeLoginId) {
                    console.log('✅ Sending token to Copy Trading iframe');

                    // Find the Copy Trading iframe
                    const copyTradingIframe = document.querySelector(
                        'iframe[src="/ai/copy-trading.html"]'
                    ) as HTMLIFrameElement;

                    if (copyTradingIframe && copyTradingIframe.contentWindow) {
                        copyTradingIframe.contentWindow.postMessage(
                            {
                                type: 'INJECT_TOKEN',
                                token: authToken,
                                loginId: activeLoginId,
                            },
                            window.location.origin
                        );
                    }
                } else {
                    console.warn('⚠️ No auth token found to send to Copy Trading iframe');
                }
            }
        };

        window.addEventListener('message', handleTokenRequest);
        return () => {
            window.removeEventListener('message', handleTokenRequest);
        };
    }, []);

    const showRunPanel = true; // Always show run panel on all tabs

    return (
        <>
            <div className='main'>
                <div className='main__container'>
                    <Tabs
                        active_index={active_tab}
                        className='main__tabs dc-tabs--enhanced'
                        onTabItemChange={onEntered}
                        onTabItemClick={setActiveTab}
                        top
                    >
                        {/* DASHBOARD TAB */}
                        <div
                            label={
                                <>
                                    <DashboardIcon />
                                    <Localize i18n_default_text='Dashboard' />
                                </>
                            }
                            id='id-dbot-dashboard'
                        >
                            <Dashboard handleTabChange={setActiveTab} />
                            <button onClick={handleOpen}>Load Bot</button>
                        </div>
                        {/* BOT BUILDER TAB */}
                        <div
                            label={
                                <>
                                    <BotBuilderIcon />
                                    <Localize i18n_default_text='Bot Builder' />
                                </>
                            }
                            id='id-bot-builder'
                        />
                        {/* DCIRCLES TAB */}
                        <div
                            label={
                                <>
                                    <span style={{ fontSize: '20px' }}>⭕</span>
                                    <Localize i18n_default_text='DCircles' />
                                </>
                            }
                            id='id-dcircles'
                        >
                            <DCircles />
                        </div>
                        {/* HACKS ANALYSIS TAB */}
                        <div
                            label={
                                <>
                                    <HacksAnalysisIcon />
                                    <Localize i18n_default_text='HacksAnalysis' />
                                </>
                            }
                            id='id-hacks-analysis'
                        >
                            <div
                                style={{
                                    width: '100%',
                                    height: 'calc(100vh - 120px)',
                                    minHeight: 'calc(100vh - 120px)',
                                    overflow: 'hidden',
                                    background: '#fff',
                                }}
                            >
                                <iframe
                                    src='/www.osamtradinghub.com/alltools-ten.vercel.app/index.html'
                                    title='HacksAnalysis - Advanced Trading Tools'
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                        display: 'block',
                                    }}
                                    allow='clipboard-write'
                                    sandbox='allow-same-origin allow-scripts allow-forms allow-popups allow-modals'
                                />
                            </div>
                        </div>
                        {/* CHARTS TAB */}
                        <div
                            label={
                                <>
                                    <ChartsIcon />
                                    <Localize i18n_default_text='Charts' />
                                </>
                            }
                            id='id-charts'
                        >
                            <Suspense fallback={<ChunkLoader message={localize('Please wait, loading chart...')} />}>
                                <Chart show_digits_stats={false} />
                            </Suspense>
                        </div>
                        {/* TUTORIALS TAB */}
                        <div
                            label={
                                <>
                                    <TutorialsIcon />
                                    <Localize i18n_default_text='Tutorials' />
                                </>
                            }
                            id='id-tutorials'
                        >
                            <Suspense
                                fallback={<ChunkLoader message={localize('Please wait, loading tutorials...')} />}
                            >
                                <Tutorial handleTabChange={setActiveTab} />
                            </Suspense>
                        </div>
                        {/* ANALYSIS TOOL TAB */}
                        <div
                            label={
                                <>
                                    <AnalysisToolIcon />
                                    <Localize i18n_default_text='Analysis Tool' />
                                </>
                            }
                            id='id-analysis-tool'
                        >
                            <div
                                className={classNames('dashboard__chart-wrapper', {
                                    'dashboard__chart-wrapper--expanded': is_drawer_open && isDesktop,
                                    'dashboard__chart-wrapper--modal': is_chart_modal_visible && isDesktop,
                                })}
                                style={{
                                    height: 'calc(100vh - 120px)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                    position: 'fixed',
                                    top: '120px',
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '4px',
                                        padding: '8px 16px',
                                        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
                                        backdropFilter: 'blur(20px)',
                                        borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
                                        boxShadow:
                                            '0 4px 32px rgba(0, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                    }}
                                >
                                    {/* Animated background grid */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundImage: `
                                                linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
                                                linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px)
                                            `,
                                            backgroundSize: '20px 20px',
                                            animation: 'gridMove 20s linear infinite',
                                            pointerEvents: 'none',
                                        }}
                                    />

                                    {/* Holographic scan line */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: '-100%',
                                            width: '100%',
                                            height: '100%',
                                            background:
                                                'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent)',
                                            animation: 'scanLine 3s ease-in-out infinite',
                                            pointerEvents: 'none',
                                        }}
                                    />

                                    <button
                                        onClick={() => toggleAnalysisTool('internal')}
                                        style={{
                                            flex: 1,
                                            position: 'relative',
                                            background:
                                                analysisToolUrl === 'internal'
                                                    ? 'linear-gradient(135deg, #00ffff 0%, #0080ff 50%, #8000ff 100%)'
                                                    : 'linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 128, 255, 0.05) 100%)',
                                            color: analysisToolUrl === 'internal' ? '#000000' : '#00ffff',
                                            padding: '8px 16px',
                                            border:
                                                analysisToolUrl === 'internal'
                                                    ? '1px solid #00ffff'
                                                    : '1px solid rgba(0, 255, 255, 0.3)',
                                            borderRadius: '0',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            fontSize: '11px',
                                            fontFamily: 'monospace',
                                            letterSpacing: '1px',
                                            textTransform: 'uppercase',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            boxShadow:
                                                analysisToolUrl === 'internal'
                                                    ? '0 0 20px rgba(0, 255, 255, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1)'
                                                    : '0 0 10px rgba(0, 255, 255, 0.2)',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                            clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)',
                                        }}
                                        onMouseEnter={e => {
                                            if (analysisToolUrl !== 'internal') {
                                                e.currentTarget.style.background =
                                                    'linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(0, 128, 255, 0.1) 100%)';
                                                e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.4)';
                                                e.currentTarget.style.color = '#ffffff';
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if (analysisToolUrl !== 'internal') {
                                                e.currentTarget.style.background =
                                                    'linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 128, 255, 0.05) 100%)';
                                                e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.2)';
                                                e.currentTarget.style.color = '#00ffff';
                                            }
                                        }}
                                    >
                                        {/* Button glow effect */}
                                        {analysisToolUrl === 'internal' && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    background:
                                                        'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)',
                                                    animation: 'shimmer 2s infinite',
                                                    pointerEvents: 'none',
                                                }}
                                            />
                                        )}
                                        <span style={{ position: 'relative', zIndex: 1 }}>◉ ADVANCED</span>
                                    </button>

                                    <button
                                        onClick={() => toggleAnalysisTool('ai')}
                                        style={{
                                            flex: 1,
                                            position: 'relative',
                                            background:
                                                analysisToolUrl === 'ai'
                                                    ? 'linear-gradient(135deg, #ff0080 0%, #ff8000 50%, #ffff00 100%)'
                                                    : 'linear-gradient(135deg, rgba(255, 0, 128, 0.1) 0%, rgba(255, 128, 0, 0.05) 100%)',
                                            color: analysisToolUrl === 'ai' ? '#000000' : '#ff0080',
                                            padding: '8px 16px',
                                            border:
                                                analysisToolUrl === 'ai'
                                                    ? '1px solid #ff0080'
                                                    : '1px solid rgba(255, 0, 128, 0.3)',
                                            borderRadius: '0',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            fontSize: '11px',
                                            fontFamily: 'monospace',
                                            letterSpacing: '1px',
                                            textTransform: 'uppercase',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            boxShadow:
                                                analysisToolUrl === 'ai'
                                                    ? '0 0 20px rgba(255, 0, 128, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1)'
                                                    : '0 0 10px rgba(255, 0, 128, 0.2)',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                            clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)',
                                        }}
                                        onMouseEnter={e => {
                                            if (analysisToolUrl !== 'ai') {
                                                e.currentTarget.style.background =
                                                    'linear-gradient(135deg, rgba(255, 0, 128, 0.2) 0%, rgba(255, 128, 0, 0.1) 100%)';
                                                e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 0, 128, 0.4)';
                                                e.currentTarget.style.color = '#ffffff';
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if (analysisToolUrl !== 'ai') {
                                                e.currentTarget.style.background =
                                                    'linear-gradient(135deg, rgba(255, 0, 128, 0.1) 0%, rgba(255, 128, 0, 0.05) 100%)';
                                                e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 0, 128, 0.2)';
                                                e.currentTarget.style.color = '#ff0080';
                                            }
                                        }}
                                    >
                                        {/* Button glow effect */}
                                        {analysisToolUrl === 'ai' && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    background:
                                                        'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)',
                                                    animation: 'shimmer 2s infinite',
                                                    pointerEvents: 'none',
                                                }}
                                            />
                                        )}
                                        <span style={{ position: 'relative', zIndex: 1 }}>⚡ ZEUS AI</span>
                                    </button>

                                    <button
                                        onClick={() => toggleAnalysisTool('ldpanalyzer')}
                                        style={{
                                            flex: 1,
                                            position: 'relative',
                                            background:
                                                analysisToolUrl === 'ldpanalyzer'
                                                    ? 'linear-gradient(135deg, #00ff00 0%, #80ff00 50%, #ffff00 100%)'
                                                    : 'linear-gradient(135deg, rgba(0, 255, 0, 0.1) 0%, rgba(128, 255, 0, 0.05) 100%)',
                                            color: analysisToolUrl === 'ldpanalyzer' ? '#000000' : '#00ff00',
                                            padding: '8px 16px',
                                            border:
                                                analysisToolUrl === 'ldpanalyzer'
                                                    ? '1px solid #00ff00'
                                                    : '1px solid rgba(0, 255, 0, 0.3)',
                                            borderRadius: '0',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            fontSize: '11px',
                                            fontFamily: 'monospace',
                                            letterSpacing: '1px',
                                            textTransform: 'uppercase',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            boxShadow:
                                                analysisToolUrl === 'ldpanalyzer'
                                                    ? '0 0 20px rgba(0, 255, 0, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1)'
                                                    : '0 0 10px rgba(0, 255, 0, 0.2)',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                            clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)',
                                        }}
                                        onMouseEnter={e => {
                                            if (analysisToolUrl !== 'ldpanalyzer') {
                                                e.currentTarget.style.background =
                                                    'linear-gradient(135deg, rgba(0, 255, 0, 0.2) 0%, rgba(128, 255, 0, 0.1) 100%)';
                                                e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 0, 0.4)';
                                                e.currentTarget.style.color = '#ffffff';
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if (analysisToolUrl !== 'ldpanalyzer') {
                                                e.currentTarget.style.background =
                                                    'linear-gradient(135deg, rgba(0, 255, 0, 0.1) 0%, rgba(128, 255, 0, 0.05) 100%)';
                                                e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.2)';
                                                e.currentTarget.style.color = '#00ff00';
                                            }
                                        }}
                                    >
                                        {/* Button glow effect */}
                                        {analysisToolUrl === 'ldpanalyzer' && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    background:
                                                        'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)',
                                                    animation: 'shimmer 2s infinite',
                                                    pointerEvents: 'none',
                                                }}
                                            />
                                        )}
                                        <span style={{ position: 'relative', zIndex: 1 }}>▲ LDP SCAN</span>
                                    </button>

                                    {/* Add CSS animations */}
                                    <style>
                                        {`
                                            @keyframes gridMove {
                                                0% { transform: translate(0, 0); }
                                                100% { transform: translate(20px, 20px); }
                                            }
                                            
                                            @keyframes scanLine {
                                                0% { left: -100%; }
                                                50% { left: 100%; }
                                                100% { left: -100%; }
                                            }
                                            
                                            @keyframes shimmer {
                                                0% { transform: translateX(-100%); }
                                                100% { transform: translateX(100%); }
                                            }
                                            
                                            @keyframes pulse {
                                                0%, 100% { opacity: 1; }
                                                50% { opacity: 0.7; }
                                            }
                                        `}
                                    </style>
                                </div>
                                <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                                    {analysisToolUrl === 'internal' ? (
                                        <div style={{ height: '100%', overflowY: 'auto', padding: '0' }}>
                                            <AnalysisTool />
                                        </div>
                                    ) : analysisToolUrl === 'ai' ? (
                                        <iframe
                                            src={analysisToolUrl}
                                            width='100%'
                                            style={{
                                                border: 'none',
                                                display: 'block',
                                                height: '100%',
                                                background: '#f8fafc',
                                            }}
                                            scrolling='yes'
                                        />
                                    ) : analysisToolUrl === 'ldpanalyzer' ? (
                                        <div
                                            style={{
                                                height: '100%',
                                                background:
                                                    'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#00ff00',
                                                fontFamily: 'monospace',
                                                position: 'relative',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {/* Animated background grid */}
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    backgroundImage: `
                                                        linear-gradient(rgba(0, 255, 0, 0.03) 1px, transparent 1px),
                                                        linear-gradient(90deg, rgba(0, 255, 0, 0.03) 1px, transparent 1px)
                                                    `,
                                                    backgroundSize: '30px 30px',
                                                    animation: 'gridMove 25s linear infinite',
                                                    pointerEvents: 'none',
                                                }}
                                            />

                                            {/* Scanning lines */}
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '20%',
                                                    left: 0,
                                                    right: 0,
                                                    height: '2px',
                                                    background:
                                                        'linear-gradient(90deg, transparent, #00ff00, transparent)',
                                                    animation: 'scanVertical 4s ease-in-out infinite',
                                                    boxShadow: '0 0 10px #00ff00',
                                                }}
                                            />
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '60%',
                                                    left: 0,
                                                    right: 0,
                                                    height: '2px',
                                                    background:
                                                        'linear-gradient(90deg, transparent, #00ff00, transparent)',
                                                    animation: 'scanVertical 4s ease-in-out infinite 2s',
                                                    boxShadow: '0 0 10px #00ff00',
                                                }}
                                            />

                                            {/* Central content */}
                                            <div
                                                style={{
                                                    textAlign: 'center',
                                                    zIndex: 10,
                                                    background: 'rgba(0, 0, 0, 0.8)',
                                                    padding: '40px',
                                                    borderRadius: '0',
                                                    border: '2px solid #00ff00',
                                                    clipPath:
                                                        'polygon(20px 0%, 100% 0%, calc(100% - 20px) 100%, 0% 100%)',
                                                    boxShadow:
                                                        '0 0 30px rgba(0, 255, 0, 0.3), inset 0 0 30px rgba(0, 255, 0, 0.1)',
                                                    animation: 'pulse 3s ease-in-out infinite',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: '48px',
                                                        marginBottom: '20px',
                                                        animation: 'rotate 10s linear infinite',
                                                    }}
                                                >
                                                    ▲
                                                </div>
                                                <h2
                                                    style={{
                                                        fontSize: '24px',
                                                        fontWeight: 'bold',
                                                        marginBottom: '16px',
                                                        letterSpacing: '3px',
                                                        textTransform: 'uppercase',
                                                        textShadow: '0 0 10px #00ff00',
                                                    }}
                                                >
                                                    LDP SCANNER
                                                </h2>
                                                <p
                                                    style={{
                                                        fontSize: '14px',
                                                        opacity: 0.8,
                                                        marginBottom: '24px',
                                                        letterSpacing: '1px',
                                                    }}
                                                >
                                                    LAST DIGIT PREDICTION ANALYSIS SYSTEM
                                                </p>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        gap: '20px',
                                                        marginBottom: '20px',
                                                    }}
                                                >
                                                    <div style={{ textAlign: 'center' }}>
                                                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                                            STATUS
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#00ff00' }}>ONLINE</div>
                                                    </div>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                                            ACCURACY
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#00ff00' }}>87.3%</div>
                                                    </div>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                                            SCANS
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#00ff00' }}>1,247</div>
                                                    </div>
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: '12px',
                                                        opacity: 0.6,
                                                        animation: 'blink 2s infinite',
                                                    }}
                                                >
                                                    [ INITIALIZING QUANTUM ANALYSIS ENGINE... ]
                                                </div>
                                            </div>

                                            {/* Corner decorations */}
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '20px',
                                                    left: '20px',
                                                    width: '40px',
                                                    height: '40px',
                                                    border: '2px solid #00ff00',
                                                    borderRight: 'none',
                                                    borderBottom: 'none',
                                                    animation: 'pulse 2s infinite',
                                                }}
                                            />
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '20px',
                                                    right: '20px',
                                                    width: '40px',
                                                    height: '40px',
                                                    border: '2px solid #00ff00',
                                                    borderLeft: 'none',
                                                    borderBottom: 'none',
                                                    animation: 'pulse 2s infinite 0.5s',
                                                }}
                                            />
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    bottom: '20px',
                                                    left: '20px',
                                                    width: '40px',
                                                    height: '40px',
                                                    border: '2px solid #00ff00',
                                                    borderRight: 'none',
                                                    borderTop: 'none',
                                                    animation: 'pulse 2s infinite 1s',
                                                }}
                                            />
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    bottom: '20px',
                                                    right: '20px',
                                                    width: '40px',
                                                    height: '40px',
                                                    border: '2px solid #00ff00',
                                                    borderLeft: 'none',
                                                    borderTop: 'none',
                                                    animation: 'pulse 2s infinite 1.5s',
                                                }}
                                            />

                                            {/* Additional CSS for LDP Scanner */}
                                            <style>
                                                {`
                                                    @keyframes scanVertical {
                                                        0% { top: 0%; opacity: 0; }
                                                        50% { opacity: 1; }
                                                        100% { top: 100%; opacity: 0; }
                                                    }
                                                    
                                                    @keyframes rotate {
                                                        0% { transform: rotate(0deg); }
                                                        100% { transform: rotate(360deg); }
                                                    }
                                                    
                                                    @keyframes blink {
                                                        0%, 50% { opacity: 0.6; }
                                                        51%, 100% { opacity: 0.2; }
                                                    }
                                                `}
                                            </style>
                                        </div>
                                    ) : (
                                        <iframe
                                            src={analysisToolUrl}
                                            width='100%'
                                            style={{
                                                border: 'none',
                                                display: 'block',
                                                height: '100%',
                                                background: '#f8fafc',
                                            }}
                                            scrolling='yes'
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* ZEUS ANALYSIS TAB - MOVED TO ANALYSIS TOOL */}
                        {/* SIGNALS TAB */}
                        <div
                            label={
                                <>
                                    <SignalsIcon />
                                    <Localize i18n_default_text='Signals' />
                                    <span className='tab-badge'>10</span>
                                </>
                            }
                            id='id-signals'
                        >
                            <ProtectedSignalsCenter />
                        </div>
                        {/* FREE BOTS TAB */}
                        <div
                            label={
                                <>
                                    <FreeBotsIcon />
                                    <Localize i18n_default_text='Free Bots' />
                                </>
                            }
                            id='id-free-bots'
                        >
                            <div
                                className='free-bots'
                                style={{
                                    background: '#ffffff',
                                    position: 'fixed',
                                    top: '120px',
                                    left: 0,
                                    right: 0,
                                    bottom: '100px',
                                    width: '100%',
                                    padding: '2rem',
                                    margin: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflowY: 'auto',
                                    overflowX: 'hidden',
                                    boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.05)',
                                }}
                            >
                                <h2
                                    style={{
                                        color: '#1a1a2e',
                                        fontSize: '2rem',
                                        fontWeight: '700',
                                        marginBottom: '1.5rem',
                                        textAlign: 'center',
                                        borderBottom: '3px solid #0d9488',
                                        paddingBottom: '1rem',
                                        flexShrink: 0,
                                    }}
                                >
                                    🤖 Free Trading Bots
                                </h2>
                                <ul
                                    className='free-bots__list'
                                    style={{
                                        listStyle: 'none',
                                        padding: 0,
                                        margin: 0,
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                                        gap: '1.5rem',
                                        width: '100%',
                                        gridAutoRows: 'min-content',
                                        flex: 1,
                                        overflowY: 'auto',
                                        paddingBottom: '8rem',
                                    }}
                                >
                                    {bots.length === 0 ? (
                                        <li
                                            style={{
                                                textAlign: 'center',
                                                padding: '3rem',
                                                color: '#6c757d',
                                                fontSize: '1.1rem',
                                                gridColumn: '1 / -1',
                                            }}
                                        >
                                            <Localize i18n_default_text='No free bots available.' />
                                        </li>
                                    ) : (
                                        bots.map((bot, index) => (
                                            <li
                                                key={index}
                                                className='free-bot-item'
                                                style={{
                                                    background: '#f8f9fa',
                                                    borderRadius: '16px',
                                                    padding: '1.5rem',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '1rem',
                                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                                                    transition: 'all 0.3s ease',
                                                    cursor: 'pointer',
                                                    border: '2px solid #e0e0e0',
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                                                    e.currentTarget.style.boxShadow =
                                                        '0 12px 24px rgba(13, 148, 136, 0.2)';
                                                    e.currentTarget.style.borderColor = '#0d9488';
                                                    e.currentTarget.style.background = '#ffffff';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                                                    e.currentTarget.style.borderColor = '#e0e0e0';
                                                    e.currentTarget.style.background = '#f8f9fa';
                                                }}
                                                onClick={() => handleBotClick(bot)}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '1rem',
                                                        width: '100%',
                                                        pointerEvents: 'none',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            borderRadius: '8px',
                                                            background:
                                                                'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '1.5rem',
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        🤖
                                                    </div>
                                                    <h3
                                                        style={{
                                                            margin: 0,
                                                            color: '#1a1a2e',
                                                            fontSize: '1.1rem',
                                                            fontWeight: '600',
                                                            flex: 1,
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                        }}
                                                    >
                                                        {bot.title || 'Untitled Bot'}
                                                    </h3>
                                                </div>
                                                <p
                                                    style={{
                                                        margin: 0,
                                                        color: '#6c757d',
                                                        fontSize: '0.9rem',
                                                        lineHeight: '1.5',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        pointerEvents: 'none',
                                                    }}
                                                >
                                                    Click to load this bot into your workspace
                                                </p>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginTop: 'auto',
                                                        paddingTop: '0.5rem',
                                                        borderTop: '1px solid #e0e0e0',
                                                        pointerEvents: 'none',
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontSize: '0.75rem',
                                                            color: '#0d9488',
                                                            fontWeight: '600',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                        }}
                                                    >
                                                        Free
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontSize: '0.85rem',
                                                            color: '#0d9488',
                                                            fontWeight: '500',
                                                        }}
                                                    >
                                                        Load →
                                                    </span>
                                                </div>
                                            </li>
                                        ))
                                    )}
                                </ul>
                                <style>
                                    {`
                                        /* Responsive adjustments */
                                        @media (max-width: 768px) {
                                            .free-bots__list {
                                                grid-template-columns: 1fr !important;
                                                padding: 1rem !important;
                                            }
                                            .free-bot-item h3 {
                                                font-size: 0.95rem !important;
                                                white-space: normal !important;
                                            }
                                            .free-bot-item p {
                                                font-size: 0.8rem !important;
                                            }
                                        }

                                        /* Extra small screens */
                                        @media (max-width: 480px) {
                                            .free-bots__list {
                                                padding: 0.75rem !important;
                                                gap: 0.5rem !important;
                                            }
                                            .free-bot-item {
                                                padding: 0.75rem !important;
                                            }
                                        }
                                    `}
                                </style>
                            </div>
                        </div>

                        {/* TRACK SCANNER TAB */}
                        <div
                            label={
                                <>
                                    <TrackSignalsIcon />
                                    <Localize i18n_default_text='Scanner' />
                                </>
                            }
                            id='id-track-signals'
                        >
                            <SignalsScanner />
                        </div>

                        {/* TRACK ANALYZER TAB */}
                        <div
                            label={
                                <>
                                    <TrackAnalyzerIcon />
                                    <Localize i18n_default_text='Analyzer' />
                                </>
                            }
                            id='id-track-analyzer'
                        >
                            <MarketAnalyzer />
                        </div>

                        {/* TRACK CALCULATOR TAB */}
                        <div
                            label={
                                <>
                                    <TrackCalculatorIcon />
                                    <Localize i18n_default_text='Calculator' />
                                </>
                            }
                            id='id-track-calculator'
                        >
                            <TradingCalculator />
                        </div>

                        {/* DTRADER TAB */}
                        <div
                            label={
                                <>
                                    <DTraderIcon />
                                    <Localize i18n_default_text='DTrader' />
                                </>
                            }
                            id='id-dtrader'
                        >
                            <DTraderIframe />
                        </div>

                        {/* COPY TRADING TAB */}
                        <div
                            label={
                                <>
                                    <CopyTradingIcon />
                                    <Localize i18n_default_text='Copy Trading' />
                                </>
                            }
                            id='id-copy-trading'
                        >
                            <div
                                style={{
                                    width: '100%',
                                    height: 'calc(100vh - 120px)',
                                    minHeight: 'calc(100vh - 120px)',
                                    overflow: 'hidden',
                                    background: '#fff',
                                }}
                            >
                                <iframe
                                    src='/ai/copy-trading.html'
                                    title='Copy Trading - Follow Expert Traders'
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                        display: 'block',
                                    }}
                                    allow='clipboard-write'
                                    sandbox='allow-same-origin allow-scripts allow-forms allow-popups allow-modals'
                                />
                            </div>
                        </div>

                        {/* RICH MOTHER TAB */}
                        <div
                            label={
                                <>
                                    <RichMotherIcon />
                                </>
                            }
                            id='id-rich-mother'
                            className='rich-mother-tab-content'
                        >
                            <div
                                className='rich-mother-container'
                                style={{
                                    width: '100%',
                                    height: 'calc(100vh - 120px)',
                                    minHeight: 'calc(100vh - 120px)',
                                    overflow: 'hidden',
                                    background: '#fff',
                                }}
                            >
                                <iframe
                                    src='/RichMother/index.html'
                                    title='💎 Advanced Trading Tool'
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                        display: 'block',
                                    }}
                                    allow='clipboard-write'
                                    sandbox='allow-same-origin allow-scripts allow-forms allow-popups allow-modals'
                                />
                            </div>
                        </div>

                        {/* ELVIS ZONE TAB - MOVED TO ANALYSIS TOOL */}

                        {/* TICKSHARK TAB - MOVED TO ANALYSIS TOOL */}
                    </Tabs>
                </div>
            </div>
            <DesktopWrapper>
                <div className='main__run-strategy-wrapper'>
                    <RunStrategy />
                    {showRunPanel && <RunPanel />}
                </div>
                <ChartModal />
                <TradingViewModal />
            </DesktopWrapper>
            <MobileWrapper>
                <RunPanel />
            </MobileWrapper>
            <Dialog
                cancel_button_text={cancel_button_text || localize('Cancel')}
                confirm_button_text={ok_button_text || localize('Ok')}
                has_close_icon
                is_visible={is_dialog_open}
                onCancel={onCancelButtonClick}
                onClose={onCloseDialog}
                onConfirm={onOkButtonClick || onCloseDialog}
                title={title}
            >
                {message}
            </Dialog>
        </>
    );
});

export default AppWrapper;
