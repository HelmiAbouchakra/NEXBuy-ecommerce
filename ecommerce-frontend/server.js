const { exec } = require('child_process');

// Force IPv4 for Node.js
process.env.NODE_OPTIONS = '--dns-result-order=ipv4first';

// Start Angular dev server with IPv4 preference
exec('ng serve --host 127.0.0.1', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
}); 