const { spawn } = require('node:child_process');

const args = [
  require.resolve('next/dist/bin/next'),
  'dev',
  '--experimental-https',
  '--experimental-https-key', '.certs/localhost-key.pem',
  '--experimental-https-cert', '.certs/localhost-cert.pem',
];

const child = spawn(process.execPath, args, {
  stdio: ['inherit', 'pipe', 'pipe'],
  env: process.env,
});

const ignored = /Self-signed certificates are currently an experimental feature, use with caution\./;

function forward(stream, output) {
  let buffer = '';
  stream.setEncoding('utf8');
  stream.on('data', (chunk) => {
    buffer += chunk;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop();
    for (const line of lines) {
      if (!ignored.test(line)) output.write(`${line}\n`);
    }
  });
  stream.on('end', () => {
    if (buffer && !ignored.test(buffer)) output.write(buffer);
  });
}

forward(child.stdout, process.stdout);
forward(child.stderr, process.stderr);

child.on('close', (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
