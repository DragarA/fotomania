// Passenger compatibility
if (typeof PhusionPassenger !== 'undefined') {
    PhusionPassenger.configure({ autoInstall: false });
}

// Start the NestJS application
require('./dist/main.js');
