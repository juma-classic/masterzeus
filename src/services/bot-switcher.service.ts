/**
 * Bot Switcher Service
 * Automatically switches between two bots when a loss occurs
 * Maintains the same stake settings across both bots
 */

import { observer } from '@/external/bot-skeleton';
import { TContractInfo } from '@/components/shared';

interface BotConfig {
    name: string;
    xmlFile: string;
}

interface SwitcherStats {
    totalTrades: number;
    bot1Trades: number;
    bot2Trades: number;
    switches: number;
    lastSwitch: Date | null;
    currentBot: 'bot1' | 'bot2';
}

class BotSwitcherService {
    private isEnabled: boolean = false;
    private bot1: BotConfig;
    private bot2: BotConfig;
    private currentBot: 'bot1' | 'bot2' = 'bot1';
    private currentStake: number = 0;
    private isProcessing: boolean = false;
    
    private stats: SwitcherStats = {
        totalTrades: 0,
        bot1Trades: 0,
        bot2Trades: 0,
        switches: 0,
        lastSwitch: null,
        currentBot: 'bot1',
    };

    constructor() {
        // Default bot configuration
        this.bot1 = {
            name: 'Random LDP Differ - Elvis Trades',
            xmlFile: 'Random LDP Differ - Elvis Trades.xml',
        };

        this.bot2 = {
            name: 'States Digit Switcher',
            xmlFile: 'States Digit Switcher.xml',
        };

        this.registerContractListener();
    }

    /**
     * Enable bot switching
     */
    public enable(): void {
        this.isEnabled = true;
        console.log('🔄 Bot Switcher ENABLED');
        console.log(`📊 Bot 1: ${this.bot1.name}`);
        console.log(`📊 Bot 2: ${this.bot2.name}`);
        console.log('💡 Will switch to alternate bot on every loss');
    }

    /**
     * Disable bot switching
     */
    public disable(): void {
        this.isEnabled = false;
        console.log('⏸️ Bot Switcher DISABLED');
    }

    /**
     * Check if switcher is enabled
     */
    public isActive(): boolean {
        return this.isEnabled;
    }

    /**
     * Get current statistics
     */
    public getStats(): SwitcherStats {
        return { ...this.stats };
    }

    /**
     * Reset statistics
     */
    public resetStats(): void {
        this.stats = {
            totalTrades: 0,
            bot1Trades: 0,
            bot2Trades: 0,
            switches: 0,
            lastSwitch: null,
            currentBot: this.currentBot,
        };
        console.log('📊 Bot Switcher stats reset');
    }

    /**
     * Register listener for contract events
     */
    private registerContractListener(): void {
        observer.register('bot.contract', this.onContractComplete.bind(this));
    }

    /**
     * Handle contract completion
     */
    private async onContractComplete(contract: TContractInfo): Promise<void> {
        if (!this.isEnabled || this.isProcessing) return;

        // Check if contract is settled
        if (!contract.is_sold) return;

        const profit = contract.profit || 0;
        const isLoss = profit < 0;

        this.stats.totalTrades++;
        if (this.currentBot === 'bot1') {
            this.stats.bot1Trades++;
        } else {
            this.stats.bot2Trades++;
        }

        console.log(`📈 Trade completed: ${isLoss ? '❌ LOSS' : '✅ WIN'} | Profit: $${profit.toFixed(2)}`);

        // Switch bot on loss
        if (isLoss) {
            await this.switchBot();
        }
    }

    /**
     * Switch to the alternate bot
     */
    private async switchBot(): Promise<void> {
        if (this.isProcessing) {
            console.log('⏳ Bot switch already in progress, skipping...');
            return;
        }

        this.isProcessing = true;

        try {
            // Determine which bot to switch to
            const nextBot = this.currentBot === 'bot1' ? 'bot2' : 'bot1';
            const nextBotConfig = nextBot === 'bot1' ? this.bot1 : this.bot2;

            console.log(`🔄 Switching from ${this.currentBot === 'bot1' ? this.bot1.name : this.bot2.name} to ${nextBotConfig.name}`);

            // Stop current bot
            await this.stopCurrentBot();

            // Small delay to ensure clean stop
            await this.delay(500);

            // Save current stake before switching
            await this.saveCurrentStake();

            // Load the new bot
            await this.loadBot(nextBotConfig);

            // Restore stake to the new bot
            await this.restoreStake();

            // Small delay before starting
            await this.delay(500);

            // Start the new bot
            await this.startBot();

            // Update current bot
            this.currentBot = nextBot;
            this.stats.currentBot = nextBot;
            this.stats.switches++;
            this.stats.lastSwitch = new Date();

            console.log(`✅ Successfully switched to ${nextBotConfig.name}`);
            console.log(`📊 Total switches: ${this.stats.switches}`);
        } catch (error) {
            console.error('❌ Error switching bot:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Stop the currently running bot
     */
    private async stopCurrentBot(): Promise<void> {
        const windowAny = window as any;
        
        if (windowAny.DBot?.stopBot) {
            windowAny.DBot.stopBot();
            console.log('⏹️ Current bot stopped');
        }
    }

    /**
     * Save current stake from the workspace
     */
    private async saveCurrentStake(): Promise<void> {
        try {
            const workspace = window.Blockly?.getMainWorkspace();
            if (!workspace) return;

            // Find stake variable in workspace
            const stakeVar = workspace.getVariableById('Stake') || 
                           workspace.getVariableById('Initial Stake') ||
                           workspace.getVariableById('Amount');

            if (stakeVar) {
                // Get all blocks
                const allBlocks = workspace.getAllBlocks();
                
                // Find the block that sets the stake
                for (const block of allBlocks) {
                    if (block.type === 'variables_set' && block.getField('VAR')?.getText() === stakeVar.name) {
                        const valueBlock = block.getInputTargetBlock('VALUE');
                        if (valueBlock && valueBlock.type === 'math_number') {
                            this.currentStake = parseFloat(valueBlock.getFieldValue('NUM') || '0');
                            console.log(`💰 Saved stake: $${this.currentStake}`);
                            break;
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error saving stake:', error);
        }
    }

    /**
     * Load a bot into the builder
     */
    private async loadBot(botConfig: BotConfig): Promise<void> {
        try {
            // Fetch bot XML
            const response = await fetch(`/${botConfig.xmlFile}`);
            if (!response.ok) {
                throw new Error(`Failed to load bot: ${response.statusText}`);
            }

            const xmlContent = await response.text();
            console.log(`📥 Loaded ${botConfig.name} XML`);

            // Load into builder using load_modal
            const windowAny = window as any;
            
            if (windowAny.load_modal?.loadStrategyToBuilder) {
                await windowAny.load_modal.loadStrategyToBuilder({
                    id: `bot-switcher-${Date.now()}`,
                    name: botConfig.name,
                    xml: xmlContent,
                    save_type: 'unsaved',
                    timestamp: Date.now(),
                });
                console.log(`✅ ${botConfig.name} loaded into builder`);
            } else {
                throw new Error('load_modal.loadStrategyToBuilder not available');
            }
        } catch (error) {
            console.error(`Error loading bot ${botConfig.name}:`, error);
            throw error;
        }
    }

    /**
     * Restore stake to the newly loaded bot
     */
    private async restoreStake(): Promise<void> {
        if (this.currentStake <= 0) return;

        try {
            const workspace = window.Blockly?.getMainWorkspace();
            if (!workspace) return;

            // Find stake variable in the new workspace
            const stakeVar = workspace.getVariableById('Stake') || 
                           workspace.getVariableById('Initial Stake') ||
                           workspace.getVariableById('Amount');

            if (stakeVar) {
                const allBlocks = workspace.getAllBlocks();
                
                // Find and update the stake block
                for (const block of allBlocks) {
                    if (block.type === 'variables_set' && block.getField('VAR')?.getText() === stakeVar.name) {
                        const valueBlock = block.getInputTargetBlock('VALUE');
                        if (valueBlock && valueBlock.type === 'math_number') {
                            valueBlock.setFieldValue(this.currentStake.toString(), 'NUM');
                            console.log(`💰 Restored stake: $${this.currentStake}`);
                            break;
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error restoring stake:', error);
        }
    }

    /**
     * Start the bot
     */
    private async startBot(): Promise<void> {
        const windowAny = window as any;
        
        if (windowAny.DBot?.runBot) {
            windowAny.DBot.runBot();
            console.log('▶️ New bot started');
        }
    }

    /**
     * Utility delay function
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get current bot name
     */
    public getCurrentBotName(): string {
        return this.currentBot === 'bot1' ? this.bot1.name : this.bot2.name;
    }

    /**
     * Manually trigger a bot switch (for testing)
     */
    public async manualSwitch(): Promise<void> {
        if (!this.isEnabled) {
            console.log('⚠️ Bot switcher is not enabled');
            return;
        }
        
        console.log('🔧 Manual bot switch triggered');
        await this.switchBot();
    }
}

// Export singleton instance
export const botSwitcherService = new BotSwitcherService();
