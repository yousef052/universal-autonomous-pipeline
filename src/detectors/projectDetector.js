import fs from 'node:fs';
import path from 'node:path';

export function detectProject(rootDir = process.cwd()) {
  const info = {
    name: path.basename(rootDir),
    type: 'Generic',
    language: 'Unknown',
    framework: 'None',
    commands: {
      dev: 'npm run dev',
      build: 'npm run build',
      test: 'npm test',
      lint: 'npm run lint'
    },
    sourceDirs: []
  };

  const pkgPath = path.join(rootDir, 'package.json');
  const pyPath1 = path.join(rootDir, 'requirements.txt');
  const pyPath2 = path.join(rootDir, 'pyproject.toml');
  const goPath = path.join(rootDir, 'go.mod');
  const rustPath = path.join(rootDir, 'Cargo.toml');

  let slnOrCsproj = null;
  try {
    const rootFiles = fs.readdirSync(rootDir);
    slnOrCsproj = rootFiles.find(f => f.endsWith('.sln') || f.endsWith('.csproj'));
  } catch {}

  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      info.name = pkg.name || info.name;
      info.type = 'Node.js Application';
      info.language = 'JavaScript / TypeScript';
      
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (allDeps.next) info.framework = 'Next.js';
      else if (allDeps.react) info.framework = 'React';
      else if (allDeps.vue) info.framework = 'Vue';
      else if (allDeps['@angular/core']) info.framework = 'Angular';
      else if (allDeps.express) info.framework = 'Express';

      if (pkg.scripts) {
        if (pkg.scripts.dev) info.commands.dev = 'npm run dev';
        if (pkg.scripts.build) info.commands.build = 'npm run build';
        if (pkg.scripts.test) info.commands.test = 'npm test';
        if (pkg.scripts.lint) info.commands.lint = 'npm run lint';
      }
    } catch {}
  } else if (fs.existsSync(pyPath1) || fs.existsSync(pyPath2)) {
    info.type = 'Python Application';
    info.language = 'Python';
    info.commands = {
      dev: 'python -m app',
      build: 'python -m compileall .',
      test: 'pytest',
      lint: 'flake8'
    };
  } else if (fs.existsSync(goPath)) {
    info.type = 'Go Service';
    info.language = 'Go';
    info.commands = {
      dev: 'go run .',
      build: 'go build -v ./...',
      test: 'go test ./...',
      lint: 'golangci-lint run'
    };
  } else if (rustPath && fs.existsSync(rustPath)) {
    info.type = 'Rust Application';
    info.language = 'Rust';
    info.commands = {
      dev: 'cargo run',
      build: 'cargo build --release',
      test: 'cargo test',
      lint: 'cargo clippy'
    };
  } else if (slnOrCsproj) {
    info.type = '.NET Application';
    info.language = 'C#';
    info.framework = '.NET';
    info.commands = {
      dev: 'dotnet watch run',
      build: 'dotnet build',
      test: 'dotnet test',
      lint: 'dotnet format --verify-no-changes'
    };

    try {
      let csprojPath = slnOrCsproj.endsWith('.csproj') ? path.join(rootDir, slnOrCsproj) : null;
      if (!csprojPath) {
        const found = fs.readdirSync(rootDir).find(f => f.endsWith('.csproj'));
        if (found) csprojPath = path.join(rootDir, found);
      }
      if (csprojPath && fs.existsSync(csprojPath)) {
        const content = fs.readFileSync(csprojPath, 'utf8');
        if (content.includes('Microsoft.NET.Sdk.Web')) {
          info.framework = 'ASP.NET Core';
          info.type = 'ASP.NET Core Web API / Service';
        }
      }
    } catch {}
  }

  const candidateDirs = [
    'src', 'lib', 'app', 'pages', 'components', 'scripts',
    'Controllers', 'Services', 'Models', 'Data', 'Repositories', 'Endpoints'
  ];
  for (const dir of candidateDirs) {
    if (fs.existsSync(path.join(rootDir, dir))) {
      info.sourceDirs.push(dir);
    }
  }

  return info;
}
