import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

/**
 * Detects operating system, shell, line endings, and path conventions.
 */
export function detectPlatform() {
  const platform = process.platform;
  const isWindows = platform === 'win32';
  const isMac = platform === 'darwin';
  const isLinux = platform === 'linux';

  let osName = 'Linux';
  if (isWindows) osName = 'Windows';
  else if (isMac) osName = 'macOS';

  let shell = 'bash';
  if (isWindows) {
    shell = process.env.PSModulePath ? 'powershell' : 'cmd';
  } else if (process.env.SHELL) {
    shell = path.basename(process.env.SHELL);
  }

  return {
    os: osName,
    platform,
    isWindows,
    isMac,
    isLinux,
    shell,
    eol: isWindows ? '\r\n' : '\n',
    pathSep: path.sep,
    normalizePath: (p) => p ? p.replace(/\\/g, '/') : ''
  };
}

/**
 * Detects continuous integration (CI), containerization (Docker), and runtime environment.
 */
export function detectEnvironment() {
  const isCI = Boolean(
    process.env.CI ||
    process.env.GITHUB_ACTIONS ||
    process.env.GITLAB_CI ||
    process.env.TF_BUILD ||
    process.env.CIRCLECI
  );

  let isDocker = false;
  try {
    isDocker = fs.existsSync('/.dockerenv') || Boolean(process.env.DOCKER_CONTAINER);
  } catch {}

  const runtimeEnv = (
    process.env.ASPNETCORE_ENVIRONMENT ||
    process.env.DOTNET_ENVIRONMENT ||
    process.env.NODE_ENV ||
    process.env.ENVIRONMENT ||
    'development'
  ).toLowerCase();

  const isProduction = runtimeEnv === 'production';
  const isDevelopment = runtimeEnv === 'development';
  const isStaging = runtimeEnv === 'staging' || runtimeEnv === 'qa';

  // Determine canonical global gitignore location
  const homeDir = os.homedir();
  let globalIgnorePath = path.join(homeDir, '.gitignore_global');
  if (!process.platform.startsWith('win')) {
    const xdgConfig = process.env.XDG_CONFIG_HOME || path.join(homeDir, '.config');
    const xdgIgnore = path.join(xdgConfig, 'git', 'ignore');
    if (fs.existsSync(xdgIgnore)) {
      globalIgnorePath = xdgIgnore;
    }
  }

  return {
    isCI,
    isDocker,
    runtimeEnv,
    isProduction,
    isDevelopment,
    isStaging,
    globalIgnorePath,
    homeDir
  };
}
