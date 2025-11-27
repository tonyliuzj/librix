export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const cron = await import('node-cron');
    const { scanAllDue } = await import('./utils/scanner');

    console.log('Starting background scanner...');
    
    // Initial check
    scanAllDue().catch(console.error);

    // Schedule check every minute
    cron.schedule('* * * * *', () => {
      scanAllDue().catch(console.error);
    });
  }
}
