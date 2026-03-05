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

            // Step 1: Stop current bot
            await this.stopCurrentBot();
            console.log('⏹️ Current bot stopped');

            // Step 2: Wait for bot to fully stop
            await this.delay(1000);

            // Step 3: Save current stake before switching
            await this.saveCurrentStake();

            // Step 4: Load the new bot XML into workspace
            await this.loadBot(nextBotConfig);

            // Step 5: Wait for bot to load
            await this.delay(1000);

            // Step 6: Restore stake to the new bot
            await this.restoreStake();

            // Update current bot
            this.currentBot = nextBot;
            this.stats.currentBot = nextBot;
            this.stats.switches++;
            this.stats.lastSwitch = new Date();

            console.log(`✅ Successfully switched to ${nextBotConfig.name}`);
            console.log(`📊 Total switches: ${this.stats.switches}`);
            console.log('⏸️ Bot is ready - Click RUN to start trading with the new bot');
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
        
        // Method 1: Try DBot.stopBot
        if (windowAny.DBot?.stopBot) {
            windowAny.DBot.stopBot();
            console.log('⏹️ Bot stopped via DBot.stopBot');
            return;
        }
        
        // Method 2: Try clicking stop button
        const stopButton = document.querySelector('[data-testid="stop-button"]') as HTMLButtonElement;
        if (stopButton && !stopButton.disabled) {
            stopButton.click();
            console.log('⏹️ Bot stopped via stop button click');
            return;
        }
        
        // Method 3: Try finding stop button by class
        const stopButtonByClass = document.querySelector('.run-panel__button--stop') as HTMLButtonElement;
        if (stopButtonByClass && !stopButtonByClass.disabled) {
            stopButtonByClass.click();
            console.log('⏹️ Bot stopped via stop button class');
            return;
        }
        
        console.warn('⚠️ Could not find method to stop bot');
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

            const windowAny = window as any;
            
            // Method 1: Try using load_modal (preferred)
            if (windowAny.load_modal?.loadStrategyToBuilder) {
                await windowAny.load_modal.loadStrategyToBuilder({
                    id: `bot-switcher-${Date.now()}`,
                    name: botConfig.name,
                    xml: xmlContent,
                    save_type: 'unsaved',
                    timestamp: Date.now(),
                });
                console.log(`✅ ${botConfig.name} loaded via load_modal`);
                return;
            }
            
            // Method 2: Try direct Blockly workspace loading
            if (window.Blockly) {
                const workspace = window.Blockly.getMainWorkspace();
                if (workspace) {
                    // Clear existing workspace
                    workspace.clear();
                    console.log('🧹 Workspace cleared');
                    
                    // Load new XML
                    const xml = window.Blockly.Xml.textToDom(xmlContent);
                    window.Blockly.Xml.domToWorkspace(xml, workspace);
                    console.log(`✅ ${botConfig.name} loaded via Blockly workspace`);
                    return;
                }
            }
            
            // Method 3: Try using updateWorkspaceName
            if (windowAny.updateWorkspaceName) {
                windowAny.updateWorkspaceName(xmlContent);
                console.log(`✅ ${botConfig.name} loaded via updateWorkspaceName`);
                return;
            }
            
            throw new Error('No method available to load bot into workspace');
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
        
        // Method 1: Try DBot.runBot
        if (windowAny.DBot?.runBot) {
            windowAny.DBot.runBot();
            console.log('▶️ Bot started via DBot.runBot');
            return;
        }
        
        // Method 2: Try clicking the run button programmatically
        const runButton = document.querySelector('[data-testid="run-button"]') as HTMLButtonElement;
        if (runButton && !runButton.disabled) {
            runButton.click();
            console.log('▶️ Bot started via run button click');
            return;
        }
        
        // Method 3: Try finding run button by class
        const runButtonByClass = document.querySelector('.run-panel__button--run') as HTMLButtonElement;
        if (runButtonByClass && !runButtonByClass.disabled) {
            runButtonByClass.click();
            console.log('▶️ Bot started via run button class');
            return;
        }
        
        console.warn('⚠️ Could not find method to start bot');
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
