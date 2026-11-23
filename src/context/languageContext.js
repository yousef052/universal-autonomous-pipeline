export function getLanguageProfile(projectInfo = {}) {
  const lang = (projectInfo.language || '').toLowerCase();
  const type = (projectInfo.type || '').toLowerCase();
  const framework = (projectInfo.framework || '').toLowerCase();

  // 1. .NET / C#
  if (lang.includes('c#') || type.includes('.net') || framework.includes('.net') || framework.includes('asp.net')) {
    return {
      key: 'dotnet',
      name: 'C# / .NET',
      framework: projectInfo.framework || 'ASP.NET Core',
      commands: {
        dev: 'dotnet watch run',
        build: 'dotnet build',
        test: 'dotnet test',
        lint: 'dotnet format --verify-no-changes'
      },
      ignoreArtifacts: [
        '[Bb]in/',
        '[Oo]bj/',
        '.vs/',
        'TestResults/',
        '*.user',
        '*.suo'
      ],
      dangerousPitfalls: [
        'Sync-over-async: Blocking async tasks using .Result or .Wait() causes thread pool starvation.',
        'Missing CancellationToken: Not propagating CancellationToken leads to runaway background execution.',
        'Untracked EF queries: Loading full entity graphs without AsNoTracking() in read-only endpoints exhausts memory.',
        'Sensitive Connection Strings: Hardcoded credentials in appsettings.json instead of User Secrets or Environment Variables.'
      ],
      safetyRecommendations: [
        'Use Primary Constructors and File-scoped namespaces for clean, readable code.',
        'Keep Domain entities isolated from infrastructure and use MediatR or typed Service interfaces.',
        'Always validate input DTOs using FluentValidation before passing to business services.'
      ]
    };
  }

  // 2. TypeScript / JavaScript
  if (lang.includes('javascript') || lang.includes('typescript') || type.includes('node')) {
    return {
      key: 'node',
      name: 'JavaScript / TypeScript',
      framework: projectInfo.framework || 'Node.js',
      commands: {
        dev: 'npm run dev',
        build: 'npm run build',
        test: 'npm test',
        lint: 'npm run lint'
      },
      ignoreArtifacts: [
        'node_modules/',
        'dist/',
        'build/',
        '.next/',
        'coverage/',
        '*.log'
      ],
      dangerousPitfalls: [
        'Prototype pollution via unvalidated object merges.',
        'Blocking the Node.js event loop with heavy synchronous CPU computation.',
        'Unsanitized user input passed to child_process.exec() or eval().'
      ],
      safetyRecommendations: [
        'Always use TypeScript strict mode.',
        'Use parameterized database queries and escape HTML outputs.',
        'Avoid committing .env files with live API secrets.'
      ]
    };
  }

  // 3. Python
  if (lang.includes('python')) {
    return {
      key: 'python',
      name: 'Python',
      framework: projectInfo.framework || 'Standard Python',
      commands: {
        dev: 'python -m app',
        build: 'python -m compileall .',
        test: 'pytest',
        lint: 'flake8'
      },
      ignoreArtifacts: [
        '.venv/',
        '__pycache__/',
        '*.pyc',
        '.pytest_cache/',
        'htmlcov/'
      ],
      dangerousPitfalls: [
        'Insecure deserialization using pickle.loads() on untrusted data.',
        'Mutable default arguments in functions creating shared state bugs.',
        'Shell injection via os.system() instead of subprocess.run(shell=False).'
      ],
      safetyRecommendations: [
        'Use virtual environments (.venv) strictly isolated from system Python.',
        'Pin dependency versions in requirements.txt or pyproject.toml.'
      ]
    };
  }

  // 4. Go
  if (lang.includes('go')) {
    return {
      key: 'go',
      name: 'Go',
      framework: projectInfo.framework || 'Standard Go',
      commands: {
        dev: 'go run .',
        build: 'go build -v ./...',
        test: 'go test ./...',
        lint: 'golangci-lint run'
      },
      ignoreArtifacts: ['vendor/', '*.exe', '*.test'],
      dangerousPitfalls: [
        'Goroutine leaks when channels are never closed or read.',
        'Ignoring returned error values instead of explicit handling.'
      ],
      safetyRecommendations: [
        'Always check err != nil explicitly.',
        'Use sync.WaitGroup and context.Context for lifecycle management.'
      ]
    };
  }

  // Default Generic
  return {
    key: 'generic',
    name: projectInfo.language || 'Generic',
    framework: projectInfo.framework || 'None',
    commands: projectInfo.commands || {
      dev: 'npm run dev',
      build: 'npm run build',
      test: 'npm test',
      lint: 'npm run lint'
    },
    ignoreArtifacts: ['node_modules/', 'dist/', 'build/'],
    dangerousPitfalls: ['Executing untrusted commands directly in shell.'],
    safetyRecommendations: ['Enforce strict path isolation and automated testing.']
  };
}
