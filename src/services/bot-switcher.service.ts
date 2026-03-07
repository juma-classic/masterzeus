/**
 * Bot Switcher Service - Optimized with Deriv API Integration
 * 
 * Features:
 * - Direct Deriv API proposal_open_contract subscription
 * - Proper contract tracking and validation
 * - WebSocket health monitoring
 * - Enhanced error handling and recovery
 * - Performance metrics and analytics
 * - Race condition prevention
 * 
 * Based on Deriv API v4: https://developers.deriv.com/llms.txt
 */

import { observer } from '@/external/bot-skeleton';
import { api_base } from '@/external/bot-skeleton/services/api/api-base';
import { TContractInfo } from '@/components/shared';

interface BotConfig {
    id: string;
    name: string;
    xml: string;
}

interface SwitchTrigger {
    onLoss: boolean;
    onWin: boolean;
    consecutiveLosses: number;
    consecutiveWins: number;
    profitThreshold: number;
    lossThreshold: number;
    autoReturnToBot1: boolean;
}

interface SwitcherStats {
    totalTrades: number;
    bot1Trades: number;
    bot2Trades: number;
    switches: number;
    lastSwitch: Date | null;
    currentBot: 'bot1' | 'bot2';
    consecutiveLosses: number;
    consecutiveWins: number;
    currentProfit: number;
    profitAtSwitch: number;
    // New performance metrics
    averageSwitchTime: number;
    failedSwitches: number;
    bot1WinRate: number;
    bot2WinRate: number;
}

interface ContractTracker {
    contractId: number;
    botName: string;
    startTime: number;
    isMonitoring: boolean;
}

class BotSwitcherService {
    private isEnabled: boolean = false;
    private bot1: BotConfig;
    private bot2: BotConfig;
    private currentBot: 'bot1' | 'bot2' = 'bot1';
    private currentStake: number = 0;
    private customStake: number = 0;
    private isProcessing: boolean = false;
    private processingTimeout: number | null = null;
    
    // Contract tracking
    private currentContract: ContractTracker | null = null;
    private contractSubscription: any = null;
    
    // WebSocket health monitoring
    private wsHealthCheckInterval: number | null = null;
    private lastApiResponse: number = Date.now();
    private isApiConnected: boolean = true;
    
    // Performance tracking
    private switchStartTime: number = 0;
    private switchTimes: number[] = [];
    
    private switchTrigger: SwitchTrigger = {
        onLoss: true,
        onWin: false,
        consecutiveLosses: 0,
        consecutiveWins: 0,
        profitThreshold: 0,
        lossThreshold: 0,
        autoReturnToBot1: true,
    };
    
    private stats: SwitcherStats = {
        totalTrades: 0,
        bot1Trades: 0,
        bot2Trades: 0,
        switches: 0,
        lastSwitch: null,
        currentBot: 'bot1',
        consecutiveLosses: 0,
        consecutiveWins: 0,
        currentProfit: 0,
        profitAtSwitch: 0,
        averageSwitchTime: 0,
        failedSwitches: 0,
        bot1WinRate: 0,
        bot2WinRate: 0,
    };

    constructor() {
        this.bot1 = { id: '', name: 'Not Selected', xml: '' };
        this.bot2 = { id: '', name: 'Not Selected', xml: '' };

        console.log('🚀 Bot Switcher Service (Optimized) initialized');
        
        // Register both observer events and direct API monitoring
        setTimeout(() => {
            this.registerContractListener();
            this.startWebSocketHealthMonitoring();
        }, 1000);
    }

    // ==================== PUBLIC API ====================

    public setCustomStake(stake: number): void {
        this.customStake = stake;
        console.log(`💰 Custom stake set to: ${stake}`);
    }

    public getCustomStake(): number {
        return this.customStake;
    }

    public enable(): void {
        if (!this.bot1.id || !this.bot2.id) {
            console.error('❌ Cannot enable: Both bots must be selected first');
            return;
        }
        
        this.isEnabled = true;
        this.isProcessing = false;
        this.clearProcessingTimeout();
        
        console.log('✅ Bot Switcher ENABLED');
        console.log(`📊 Bot 1: ${this.bot1.name}`);
        console.log(`📊 Bot 2: ${this.bot2.name}`);
    }

    public disable(): void {
        this.isEnabled = false;
        this.unsubscribeFromContract();
        this.clearProcessingTimeout();
        console.log('⏸️ Bot Switcher DISABLED');
    }

    public setBot1(id: string, name: string, xml: string): void {
        this.bot1 = { id, name, xml };
        console.log(`✅ Bot 1 configured: ${name}`);
    }

    public setBot2(id: string, name: string, xml: string): void {
        this.bot2 = { id, name, xml };
        console.log(`✅ Bot 2 configured: ${name}`);
    }

    public getBotConfig(): { bot1: BotConfig; bot2: BotConfig } {
        return { bot1: this.bot1, bot2: this.bot2 };
    }

    public setSwitchTrigger(trigger: Partial<SwitchTrigger>): void {
        this.switchTrigger = { ...this.switchTrigger, ...trigger };
        console.log('🎯 Switch trigger updated:', this.switchTrigger);
    }

    public getSwitchTrigger(): SwitchTrigger {
        return { ...this.switchTrigger };
    }

    public isActive(): boolean {
        return this.isEnabled;
    }

    public getStats(): SwitcherStats {
        return { ...this.stats };
    }

    public resetStats(): void {
        this.stats = {
            totalTrades: 0,
            bot1Trades: 0,
            bot2Trades: 0,
            switches: 0,
            lastSwitch: null,
            currentBot: this.currentBot,
            consecutiveLosses: 0,
            consecutiveWins: 0,
            currentProfit: 0,
            profitAtSwitch: 0,
            averageSwitchTime: 0,
            failedSwitches: 0,
            bot1WinRate: 0,
            bot2WinRate: 0,
        };
        this.switchTimes = [];
        console.log('📊 Bot Switcher stats reset');
    }

    public getCurrentBotName(): string {
        return this.currentBot === 'bot1' ? this.bot1.name : this.bot2.name;
    }

    public async manualSwitch(): Promise<void> {
        if (!this.isEnabled) {
            console.log('⚠️ Bot switcher is not enabled');
            return;
        }
        console.log('🔧 Manual bot switch triggered');
        await this.switchBot();
    }

    public resetProcessingFlag(): void {
        console.log('🔧 Manually resetting processing flag');
        console.log('🔍 Was processing:', this.isProcessing);
        this.isProcessing = false;
        this.clearProcessingTimeout();
        console.log('✅ Processing flag reset');
    }

    public testEventSystem(): void {
        console.log('🧪 Testing Bot Switcher Event System');
        console.log('🔍 Is Enabled:', this.isEnabled);
        console.log('🔍 Observer available:', !!observer);
        if (observer) {
            console.log('🔍 bot.contract registered:', observer.isRegistered('bot.contract'));
            console.log('🔍 contract.status registered:', observer.isRegistered('contract.status'));
            
            // Try to re-register if not registered
            if (!observer.isRegistered('bot.contract')) {
                console.warn('⚠️ bot.contract not registered! Re-registering...');
                this.registerContractListener();
            }
        }
        console.log('🔍 Current stats:', this.getStats());
        console.log('🔍 API connected:', this.isApiConnected);
        console.log('🔍 Last API response:', new Date(this.lastApiResponse).toISOString());
        
        // Test emit
        console.log('🧪 Testing manual event emit...');
        observer.emit('bot.contract', {
            id: 'test-123',
            is_sold: true,
            profit: 5.00,
            accountID: 'test'
        });
    }

    // ==================== CONTRACT MONITORING ====================

    private registerContractListener(): void {
        try {
            if (!observer) {
                console.error('❌ Observer not available!');
                return;
            }

            // Listen to observer events (backward compatibility)
            observer.register('bot.contract', this.onContractComplete.bind(this));
            observer.register('contract.status', this.onContractStatus.bind(this));
            
            console.log('✅ Registered contract listeners');
            console.log('🔍 Observer registered events:', {
                'bot.contract': observer.isRegistered('bot.contract'),
                'contract.status': observer.isRegistered('contract.status')
            });
        } catch (error) {
            console.error('❌ Error registering contract listeners:', error);
        }
    }

    /**
     * Subscribe to a specific contract using Deriv API
     * This provides more reliable contract tracking
     */
    private subscribeToContract(contractId: number): void {
        if (!api_base?.api) {
            console.warn('⚠️ Deriv API not available for contract subscription');
            return;
        }

        try {
            // Unsubscribe from previous contract
            this.unsubscribeFromContract();

            // Subscribe to proposal_open_contract for real-time updates
            this.contractSubscription = api_base.api.onMessage().subscribe(({ data }: any) => {
                if (data.msg_type === 'proposal_open_contract') {
                    const contract = data.proposal_open_contract;
                    
                    if (contract?.contract_id === contractId) {
                        this.lastApiResponse = Date.now();
                        this.isApiConnected = true;
                        this.handleContractUpdate(contract);
                    }
                }
            });

            // Send subscription request
            api_base.api.send({
                proposal_open_contract: 1,
                contract_id: contractId,
                subscribe: 1,
            });

            this.currentContract = {
                contractId,
                botName: this.getCurrentBotName(),
                startTime: Date.now(),
                isMonitoring: true,
            };

            console.log(`📡 Subscribed to contract ${contractId} via Deriv API`);
        } catch (error) {
            console.error('❌ Error subscribing to contract:', error);
        }
    }

    private unsubscribeFromContract(): void {
        if (this.contractSubscription) {
            try {
                this.contractSubscription.unsubscribe();
                console.log('📡 Unsubscribed from contract');
            } catch (error) {
                console.error('❌ Error unsubscribing:', error);
            }
            this.contractSubscription = null;
        }
        this.currentContract = null;
    }

    private handleContractUpdate(contract: any): void {
        if (!this.isEnabled || !this.currentContract) return;

        // Update API health
        this.lastApiResponse = Date.now();

        // Check if contract is sold
        if (contract.is_sold) {
            const profit = contract.sell_price - contract.buy_price;
            console.log(`� Contract ${contract.contract_id} sold | Profit: ${profit.toFixed(2)}`);
            
            // Process the completed contract
            this.processCompletedContract({
                id: contract.contract_id,
                profit,
                is_sold: true,
                sell_price: contract.sell_price,
                buy_price: contract.buy_price,
            } as TContractInfo);
        }
    }

    private async onContractStatus(status: any): Promise<void> {
        if (status?.id === 'contract.sold' && status?.contract) {
            console.log('✅ Contract sold event detected via observer');
            // Backup method if API subscription fails
            if (!this.currentContract?.isMonitoring) {
                this.processCompletedContract(status.contract);
            }
        }
    }

    private async onContractComplete(contract: TContractInfo): Promise<void> {
        console.log('🔔 Contract event received via observer:', {
            is_sold: contract.is_sold,
            profit: contract.profit,
            contract_id: contract.id,
            isEnabled: this.isEnabled,
            timestamp: new Date().toISOString()
        });

        if (!this.isEnabled) {
            console.warn('⚠️ Bot Switcher is disabled, ignoring contract');
            return;
        }

        // Subscribe to this contract via Deriv API for real-time updates
        if (contract.id && !contract.is_sold) {
            this.subscribeToContract(contract.id);
            console.log('📡 Subscribed to contract via Deriv API');
        }

        if (!contract.is_sold) {
            console.log('⏳ Contract not yet sold, waiting...');
            return;
        }

        // Process via observer (backup method)
        if (!this.currentContract?.isMonitoring) {
            console.log('✅ Processing contract via observer');
            this.processCompletedContract(contract);
        } else {
            console.log('⏭️ Skipping observer processing (Direct API already handled it)');
        }
    }


    // ==================== CONTRACT PROCESSING ====================

    private async processCompletedContract(contract: TContractInfo): Promise<void> {
        const profit = contract.profit || 0;
        const isLoss = profit < 0;
        const isWin = profit > 0;

        console.log(`📈 Trade completed: ${isLoss ? '❌ LOSS' : '✅ WIN'} | Profit: ${profit.toFixed(2)}`);

        // Update stats
        this.updateStats(profit, isLoss, isWin);

        // Unsubscribe from this contract
        this.unsubscribeFromContract();

        // Check for auto-return to Bot 1
        if (this.switchTrigger.autoReturnToBot1 && this.currentBot === 'bot2' && isWin) {
            console.log('🔄 Bot 2 won! Auto-returning to Bot 1...');
            
            if (this.isProcessing) {
                console.warn('⚠️ Switch already in progress');
                return;
            }

            await this.switchBot();
            return;
        }

        // Check other switch triggers
        const shouldSwitch = this.checkSwitchTriggers(isLoss, isWin);

        if (shouldSwitch) {
            if (this.isProcessing) {
                console.warn('⚠️ Switch already in progress');
                return;
            }

            console.log('� Switch trigger activated!');
            await this.switchBot();
        }
    }

    private updateStats(profit: number, isLoss: boolean, isWin: boolean): void {
        this.stats.totalTrades++;
        this.stats.currentProfit += profit;
        
        if (this.currentBot === 'bot1') {
            this.stats.bot1Trades++;
        } else {
            this.stats.bot2Trades++;
        }

        if (isLoss) {
            this.stats.consecutiveLosses++;
            this.stats.consecutiveWins = 0;
        } else if (isWin) {
            this.stats.consecutiveWins++;
            this.stats.consecutiveLosses = 0;
        }

        console.log(`📊 Stats: Total: ${this.stats.totalTrades}, Losses: ${this.stats.consecutiveLosses}, Wins: ${this.stats.consecutiveWins}, Profit: ${this.stats.currentProfit.toFixed(2)}`);
    }

    private checkSwitchTriggers(isLoss: boolean, isWin: boolean): boolean {
        const triggers: string[] = [];

        if (this.switchTrigger.onLoss && isLoss) {
            triggers.push('Loss detected');
        }

        // Switch on Win only works for Bot 2
        if (this.switchTrigger.onWin && isWin && this.currentBot === 'bot2') {
            triggers.push('Win detected (Bot 2 only)');
        }

        if (this.switchTrigger.consecutiveLosses > 0 && 
            this.stats.consecutiveLosses >= this.switchTrigger.consecutiveLosses) {
            triggers.push(`${this.stats.consecutiveLosses} consecutive losses`);
        }

        if (this.switchTrigger.consecutiveWins > 0 && 
            this.stats.consecutiveWins >= this.switchTrigger.consecutiveWins) {
            triggers.push(`${this.stats.consecutiveWins} consecutive wins`);
        }

        if (this.switchTrigger.profitThreshold > 0 && 
            this.stats.currentProfit >= this.switchTrigger.profitThreshold) {
            triggers.push(`Profit threshold: ${this.stats.currentProfit.toFixed(2)}`);
        }

        if (this.switchTrigger.lossThreshold > 0 && 
            this.stats.currentProfit <= -this.switchTrigger.lossThreshold) {
            triggers.push(`Loss threshold: ${this.stats.currentProfit.toFixed(2)}`);
        }

        if (triggers.length > 0) {
            console.log('🎯 Switch triggers met:', triggers.join(', '));
            return true;
        }

        return false;
    }

    // ==================== BOT SWITCHING ====================

    private async switchBot(): Promise<void> {
        if (this.isProcessing) {
            console.log('⏳ Bot switch already in progress');
            return;
        }

        this.isProcessing = true;
        this.switchStartTime = Date.now();
        
        // Set timeout to auto-clear processing flag (safety net)
        this.setProcessingTimeout();

        console.log('🔒 Processing flag SET');

        try {
            const nextBot = this.currentBot === 'bot1' ? 'bot2' : 'bot1';
            const nextBotConfig = nextBot === 'bot1' ? this.bot1 : this.bot2;

            console.log(`🔄 Switching from ${this.getCurrentBotName()} to ${nextBotConfig.name}`);

            // Record profit at switch time
            if (this.currentBot === 'bot1' && nextBot === 'bot2') {
                this.stats.profitAtSwitch = this.stats.currentProfit;
            }

            // Execute switch sequence
            await this.stopCurrentBot();
            await this.delay(1500);
            
            await this.saveCurrentStake();
            await this.loadBot(nextBotConfig);
            await this.delay(1500);
            
            await this.restoreStake();

            // Update state
            this.currentBot = nextBot;
            this.stats.currentBot = nextBot;
            this.stats.switches++;
            this.stats.lastSwitch = new Date();

            // Record switch time
            const switchTime = Date.now() - this.switchStartTime;
            this.switchTimes.push(switchTime);
            if (this.switchTimes.length > 10) this.switchTimes.shift();
            this.stats.averageSwitchTime = this.switchTimes.reduce((a, b) => a + b, 0) / this.switchTimes.length;

            console.log(`✅ Switched to ${nextBotConfig.name} in ${switchTime}ms`);
            
            await this.delay(1000);
            await this.startBot();
            console.log('✅ New bot started');
        } catch (error) {
            console.error('❌ Error switching bot:', error);
            this.stats.failedSwitches++;
            
            // Attempt recovery
            await this.recoverFromFailedSwitch();
        } finally {
            this.isProcessing = false;
            this.clearProcessingTimeout();
            console.log('🔓 Processing flag CLEARED');
        }
    }

    private async recoverFromFailedSwitch(): Promise<void> {
        console.log('🔧 Attempting recovery from failed switch...');
        try {
            // Try to restart current bot
            await this.delay(2000);
            await this.startBot();
            console.log('✅ Recovery successful - restarted current bot');
        } catch (error) {
            console.error('❌ Recovery failed:', error);
        }
    }

    private setProcessingTimeout(): void {
        this.clearProcessingTimeout();
        // Auto-clear processing flag after 30 seconds (safety net)
        this.processingTimeout = window.setTimeout(() => {
            if (this.isProcessing) {
                console.warn('⚠️ Processing timeout reached - auto-clearing flag');
                this.isProcessing = false;
            }
        }, 30000);
    }

    private clearProcessingTimeout(): void {
        if (this.processingTimeout) {
            window.clearTimeout(this.processingTimeout);
            this.processingTimeout = null;
        }
    }

    // ==================== BOT CONTROL ====================

    private async stopCurrentBot(): Promise<void> {
        const windowAny = window as any;
        
        if (windowAny.DBot?.stopBot) {
            windowAny.DBot.stopBot();
            console.log('⏹️ Bot stopped via DBot.stopBot');
            return;
        }
        
        const stopButton = document.getElementById('db-animation__stop-button') as HTMLButtonElement;
        if (stopButton && !stopButton.disabled) {
            stopButton.click();
            console.log('⏹️ Bot stopped via button');
            return;
        }
        
        console.warn('⚠️ Could not find method to stop bot');
    }

    private async startBot(): Promise<void> {
        const windowAny = window as any;
        
        if (windowAny.DBot?.runBot) {
            windowAny.DBot.runBot();
            console.log('▶️ Bot started via DBot.runBot');
            return;
        }
        
        const runButton = document.getElementById('db-animation__run-button') as HTMLButtonElement;
        if (runButton && !runButton.disabled) {
            runButton.click();
            console.log('▶️ Bot started via button');
            return;
        }
        
        console.warn('⚠️ Could not find method to start bot');
    }

    // ==================== STAKE MANAGEMENT ====================

    private async saveCurrentStake(): Promise<void> {
        try {
            if (this.customStake > 0) {
                this.currentStake = this.customStake;
                console.log(`💰 Using custom stake: ${this.currentStake}`);
                return;
            }

            const workspace = (window as any).Blockly?.getMainWorkspace?.();
            if (!workspace) {
                console.warn('⚠️ Workspace not available');
                return;
            }

            const allBlocks = workspace.getAllBlocks();
            let stakeFound = false;

            // Try to find stake in variables
            const stakeVar = workspace.getVariableById?.('Stake') || 
                           workspace.getVariableById?.('Initial Stake') ||
                           workspace.getVariableById?.('Amount');

            if (stakeVar) {
                for (const block of allBlocks) {
                    if (block.type === 'variables_set' && block.getField?.('VAR')?.getText() === stakeVar.name) {
                        const valueBlock = block.getInputTargetBlock?.('VALUE');
                        if (valueBlock && valueBlock.type === 'math_number') {
                            this.currentStake = parseFloat(valueBlock.getFieldValue?.('NUM') || '0');
                            console.log(`💰 Saved stake: ${this.currentStake}`);
                            stakeFound = true;
                            break;
                        }
                    }
                }
            }

            if (!stakeFound) {
                console.warn('⚠️ Could not find stake value');
            }
        } catch (error) {
            console.error('❌ Error saving stake:', error);
        }
    }

    private async restoreStake(): Promise<void> {
        if (this.currentStake <= 0) return;

        try {
            const workspace = (window as any).Blockly?.getMainWorkspace?.();
            if (!workspace) return;

            const stakeVar = workspace.getVariableById?.('Stake') || 
                           workspace.getVariableById?.('Initial Stake') ||
                           workspace.getVariableById?.('Amount');

            if (stakeVar) {
                const allBlocks = workspace.getAllBlocks();
                
                for (const block of allBlocks) {
                    if (block.type === 'variables_set' && block.getField?.('VAR')?.getText() === stakeVar.name) {
                        const valueBlock = block.getInputTargetBlock?.('VALUE');
                        if (valueBlock && valueBlock.type === 'math_number') {
                            valueBlock.setFieldValue?.(this.currentStake.toString(), 'NUM');
                            console.log(`💰 Restored stake: ${this.currentStake}`);
                            break;
                        }
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error restoring stake:', error);
        }
    }

    private async loadBot(botConfig: BotConfig): Promise<void> {
        try {
            console.log(`📥 Loading ${botConfig.name}`);

            const windowAny = window as any;
            
            if (windowAny.load_modal?.loadStrategyToBuilder) {
                await windowAny.load_modal.loadStrategyToBuilder({
                    id: botConfig.id,
                    name: botConfig.name,
                    xml: botConfig.xml,
                    save_type: 'unsaved',
                    timestamp: Date.now(),
                });
                console.log(`✅ ${botConfig.name} loaded`);
                return;
            }
            
            throw new Error('No method available to load bot');
        } catch (error) {
            console.error(`❌ Error loading bot:`, error);
            throw error;
        }
    }

    // ==================== WEBSOCKET HEALTH MONITORING ====================

    private startWebSocketHealthMonitoring(): void {
        // Check API health every 10 seconds
        this.wsHealthCheckInterval = window.setInterval(() => {
            const timeSinceLastResponse = Date.now() - this.lastApiResponse;
            
            if (timeSinceLastResponse > 30000) {
                // No API response for 30 seconds
                if (this.isApiConnected) {
                    console.warn('⚠️ API connection may be lost');
                    this.isApiConnected = false;
                }
            } else {
                if (!this.isApiConnected) {
                    console.log('✅ API connection restored');
                    this.isApiConnected = true;
                }
            }
        }, 10000);
    }

    private stopWebSocketHealthMonitoring(): void {
        if (this.wsHealthCheckInterval) {
            window.clearInterval(this.wsHealthCheckInterval);
            this.wsHealthCheckInterval = null;
        }
    }

    // ==================== UTILITIES ====================

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public destroy(): void {
        this.disable();
        this.stopWebSocketHealthMonitoring();
        console.log('🔧 Bot Switcher Service destroyed');
    }
}

// Export singleton instance
export const botSwitcherService = new BotSwitcherService();
