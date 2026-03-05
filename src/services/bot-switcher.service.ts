/**
 * Bot Switcher Service
 * Automatically switches between two bots when a loss occurs
 * Maintains the same stake settings across both bots
 */

import { observer } from '@/external/bot-skeleton';
import { TContractInfo } from '@/components/shared';

interface BotConfig {
    id: string;
    name: string;
    xml: string;
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
    private lastProcessingTime: number = 0;
    
    private stats: SwitcherStats = {
        totalTrades: 0,
        bot1Trades: 0,
        bot2Trades: 0,
        switches: 0,
        lastSwitch: null,
        currentBot: 'bot1',
    };

    constructor() {
        // Default bot configuration (empty until user selects)
        this.bot1 = {
            id: '',
            name: 'Not Selected',
            xml: '',
        };

        this.bot2 = {
            id: '',
            name: 'Not Selected',
            xml: '',
        };

        console.log('🔧 Bot Switcher Service initialized');
        console.log('🔍 Observer available:', !!observer);
        console.log('🔍 Observer type:', typeof observer);
        
        // Delay registration to ensure bot system is ready
        setTimeout(() => {
            this.registerContractListener();
        }, 1000);
    }

    /**
     * Enable bot switching
     */
    public enable(): void {
        if (!this.bot1.id || !this.bot2.id) {
            console.error('❌ Cannot enable: Both bots must be selected first');
            return;
        }
        
        this.isEnabled = true;
        // Reset processing flag when enabling
        this.isProcessing = false;
        this.lastProcessingTime = 0;
        console.log('🔄 Bot Switcher ENABLED');
        console.log(`📊 Bot 1: ${this.bot1.name}`);
        console.log(`📊 Bot 2: ${this.bot2.name}`);
        console.log('💡 Will switch to alternate bot on every loss');
    }

    /**
     * Set Bot 1 configuration
     */
    public setBot1(id: string, name: string, xml: string): void {
        this.bot1 = { id, name, xml };
        console.log(`✅ Bot 1 configured: ${name}`);
    }

    /**
     * Set Bot 2 configuration
     */
    public setBot2(id: string, name: string, xml: string): void {
        this.bot2 = { id, name, xml };
        console.log(`✅ Bot 2 configured: ${name}`);
    }

    /**
     * Get current bot configuration
     */
    public getBotConfig(): { bot1: BotConfig; bot2: BotConfig } {
        return {
            bot1: this.bot1,
            bot2: this.bot2,
        };
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
        try {
            // Check if observer is available
            if (!observer) {
                console.error('❌ Observer not available! Bot Switcher cannot listen to events.');
                return;
            }

            console.log('🔍 Observer object:', observer);
            console.log('🔍 Observer.register type:', typeof observer.register);
            console.log('🔍 Observer.isRegistered:', typeof observer.isRegistered);

            // Test if observer is working by registering a test event
            observer.register('bot-switcher.test', (data: any) => {
                console.log('✅ Test event received:', data);
            });
            
            // Emit test event
            observer.emit('bot-switcher.test', { test: 'working' });

            // Listen to bot.contract event (emitted when contract updates)
            observer.register('bot.contract', this.onContractComplete.bind(this));
            console.log('✅ Registered bot.contract listener');
            console.log('🔍 Is bot.contract registered?', observer.isRegistered('bot.contract'));
            
            // Also listen to contract.status for sold contracts
            observer.register('contract.status', this.onContractStatus.bind(this));
            console.log('✅ Registered contract.status listener');
            console.log('🔍 Is contract.status registered?', observer.isRegistered('contract.status'));
            
            // Listen to ALL events for debugging
            observer.register('bot.running', (data: any) => {
                console.log('🔔 bot.running event:', data);
            });
            
            observer.register('bot.stop', (data: any) => {
                console.log('🔔 bot.stop event:', data);
            });
            
            console.log('👂 Bot Switcher listening to contract events');
        } catch (error) {
            console.error('❌ Error registering contract listeners:', error);
        }
    }

    /**
     * Handle contract status events (more reliable for detecting sold contracts)
     */
    private async onContractStatus(status: any): Promise<void> {
        console.log('📡 Contract status event:', status);
        
        // Only care about sold contracts
        if (status?.id === 'contract.sold') {
            console.log('✅ Contract sold event detected');
        }
    }

    /**
     * Handle contract completion
     */
    private async onContractComplete(contract: TContractInfo): Promise<void> {
            // Log every contract event for debugging
            console.log('🔔 Contract event received:', {
                is_sold: contract.is_sold,
                profit: contract.profit,
                contract_id: contract.id,
                isEnabled: this.isEnabled,
                isProcessing: this.isProcessing,
                currentBot: this.currentBot,
                timestamp: new Date().toISOString()
            });

            if (!this.isEnabled) {
                console.log('⏸️ Switcher is disabled, ignoring contract');
                return;
            }

            // Check if contract is settled FIRST before checking isProcessing
            if (!contract.is_sold) {
                console.log('⏳ Contract not yet sold, waiting...');
                return;
            }

            const profit = contract.profit || 0;
            const isLoss = profit < 0;

            console.log(`📈 Trade completed: ${isLoss ? '❌ LOSS' : '✅ WIN'} | Profit: ${profit.toFixed(2)}`);

            // Only increment stats for sold contracts
            this.stats.totalTrades++;
            if (this.currentBot === 'bot1') {
                this.stats.bot1Trades++;
            } else {
                this.stats.bot2Trades++;
            }
            console.log(`📊 Stats updated: Total: ${this.stats.totalTrades}, Bot1: ${this.stats.bot1Trades}, Bot2: ${this.stats.bot2Trades}`);

            // Switch bot on loss
            if (isLoss) {
                if (this.isProcessing) {
                    console.warn('⚠️ Switch already in progress, skipping this loss');
                    return;
                }

                console.log('🔄 Loss detected! Triggering bot switch...');
                console.log(`🔄 Will switch from ${this.currentBot === 'bot1' ? 'Bot 1' : 'Bot 2'} to ${this.currentBot === 'bot1' ? 'Bot 2' : 'Bot 1'}`);

                // Don't await - let it run in background to avoid blocking
                this.switchBot().catch(error => {
                    console.error('❌ Error in switchBot:', error);
                    this.isProcessing = false; // Reset flag on error
                });
            } else {
                console.log('✅ Win detected, no switch needed');
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
        this.lastProcessingTime = Date.now();
        console.log('🔒 Processing flag SET at', new Date().toISOString());

        try {
            // Determine which bot to switch to
            const nextBot = this.currentBot === 'bot1' ? 'bot2' : 'bot1';
            const nextBotConfig = nextBot === 'bot1' ? this.bot1 : this.bot2;

            console.log(`🔄 Switching from ${this.currentBot === 'bot1' ? this.bot1.name : this.bot2.name} to ${nextBotConfig.name}`);

            // Step 1: Stop current bot
            await this.stopCurrentBot();
            console.log('⏹️ Current bot stopped');

            // Step 2: Wait for bot to fully stop
            await this.delay(1500);

            // Step 3: Save current stake before switching
            await this.saveCurrentStake();

            // Step 4: Load the new bot XML into workspace
            await this.loadBot(nextBotConfig);

            // Step 5: Wait for bot to load
            await this.delay(1500);

            // Step 6: Restore stake to the new bot
            await this.restoreStake();

            // Update current bot
            this.currentBot = nextBot;
            this.stats.currentBot = nextBot;
            this.stats.switches++;
            this.stats.lastSwitch = new Date();

            console.log(`✅ Successfully switched to ${nextBotConfig.name}`);
            console.log(`📊 Total switches: ${this.stats.switches}`);
            
            // Step 7: Wait a bit more then auto-start the new bot
            await this.delay(1000);
            console.log('▶️ Auto-starting the new bot...');
            await this.startBot();
            console.log('✅ New bot started automatically');
        } catch (error) {
            console.error('❌ Error switching bot:', error);
            console.error('❌ Error details:', error);
        } finally {
            this.isProcessing = false;
            this.lastProcessingTime = 0;
            console.log('🔓 Processing flag CLEARED at', new Date().toISOString());
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
        
        // Method 2: Try the specific Stop button ID
        const stopButtonById = document.getElementById('db-animation__stop-button') as HTMLButtonElement;
        if (stopButtonById && !stopButtonById.disabled) {
            stopButtonById.click();
            console.log('⏹️ Bot stopped via db-animation__stop-button');
            return;
        }
        
        // Method 3: Try clicking stop button by test-id
        const stopButton = document.querySelector('[data-testid="stop-button"]') as HTMLButtonElement;
        if (stopButton && !stopButton.disabled) {
            stopButton.click();
            console.log('⏹️ Bot stopped via stop button click');
            return;
        }
        
        // Method 4: Try finding stop button by class
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
            const xmlContent = botConfig.xml;
            console.log(`📥 Loading ${botConfig.name}`);

            const windowAny = window as any;
            
            // Method 1: Try using load_modal (preferred)
            if (windowAny.load_modal?.loadStrategyToBuilder) {
                await windowAny.load_modal.loadStrategyToBuilder({
                    id: botConfig.id,
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
        
        // Method 2: Try the specific Run button ID
        const runButtonById = document.getElementById('db-animation__run-button') as HTMLButtonElement;
        if (runButtonById && !runButtonById.disabled) {
            runButtonById.click();
            console.log('▶️ Bot started via db-animation__run-button');
            return;
        }
        
        // Method 3: Try clicking the run button by test-id
        const runButton = document.querySelector('[data-testid="run-button"]') as HTMLButtonElement;
        if (runButton && !runButton.disabled) {
            runButton.click();
            console.log('▶️ Bot started via run button click');
            return;
        }
        
        // Method 4: Try finding run button by class
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

    /**
     * Test event system (for debugging)
     */
    public testEventSystem(): void {
        console.log('🧪 Testing event system...');
        console.log('🔍 Observer:', observer);
        console.log('🔍 Is bot.contract registered?', observer.isRegistered('bot.contract'));
        console.log('🔍 Is contract.status registered?', observer.isRegistered('contract.status'));
        
        // Try emitting a test contract event
        console.log('🧪 Emitting test bot.contract event...');
        observer.emit('bot.contract', {
            is_sold: true,
            profit: -1.5,
            id: 'test-123',
            accountID: 'test'
        });
        
        console.log('🧪 Emitting test contract.status event...');
        observer.emit('contract.status', {
            id: 'contract.sold',
            data: 123
        });
    }

    /**
     * Reset processing flag (for debugging stuck state)
     */
    public resetProcessingFlag(): void {
        console.log('🔧 Manually resetting processing flag');
        console.log('🔍 Was processing:', this.isProcessing);
        console.log('🔍 Last processing time:', this.lastProcessingTime ? new Date(this.lastProcessingTime).toISOString() : 'never');
        this.isProcessing = false;
        this.lastProcessingTime = 0;
        console.log('✅ Processing flag reset');
    }
}

// Export singleton instance
export const botSwitcherService = new BotSwitcherService();
