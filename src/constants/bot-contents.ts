type TTabsTitle = {
    [key: string]: string | number;
};

type TDashboardTabIndex = {
    [key: string]: number;
};

export const tabs_title: TTabsTitle = Object.freeze({
    WORKSPACE: 'Workspace',
    CHART: 'Chart',
});

export const DBOT_TABS: TDashboardTabIndex = Object.freeze({
    DASHBOARD: 0,
    BOT_BUILDER: 1,
    DCIRCLES: 2,
    CHART: 3,
    TUTORIAL: 4,
    PATEL_SIGNALS: 5,
    PATEL_SIGNAL_CENTER: 6,
    ANALYSIS_TOOL: 7,
    SIGNALS: 8,
    ADVANCED_ALGO: 9,
    FREE_BOTS: 10,
    SIGNAL_SAVVY: 11,
    FAST_LANE: 12,
    ELVIS_ZONE: 13,
    TICKSHARK: 14,
    COPY_TRADING: 15,
    ACCUMULATOR: 16,
    DIGIT_HACKER: 17,
    X_SIGNALS: 18,
    TRACK_SIGNALS: 19,
    TRACK_ANALYZER: 20,
    TRACK_CALCULATOR: 21,
    DIGIT_ANALYSIS: 22,
    HACKS_ANALYSIS: 23,
    DTRADER: 24,
});

export const MAX_STRATEGIES = 10;

export const TAB_IDS = [
    'id-dbot-dashboard',
    'id-bot-builder',
    'id-dcircles',
    'id-charts',
    'id-tutorials',
    'id-patel-signals',
    'id-patel-signal-center',
    'id-analysis-tool',
    'id-signals',
    'id-advanced-algo',
    'id-free-bots',
    'id-signal-savvy',
    'id-fast-lane',
    'id-elvis-zone',
    'id-tickshark',
    'id-copy-trading',
    'id-accumulator',
    'id-digit-hacker',
    'id-track-signals',
    'id-track-analyzer',
    'id-track-calculator',
    'id-digit-analysis',
    'id-hacks-analysis',
    'id-dtrader',
];

export const DEBOUNCE_INTERVAL_TIME = 500;
