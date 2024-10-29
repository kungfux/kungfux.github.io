// Icons provided by https://devicon.dev/
const tools = [
  // Languages and frameworks
  { icon: 'csharp', hint: 'C#' },
  { icon: 'dot-net', tag: 'dotnet', hint: 'DotNet' },
  { icon: 'dotnetcore', tag: 'dotnet-core', hint: 'DotNet Core' },
  { icon: 'blazor', iconType: 'original', isClickable: false },
  { icon: 'javascript' },
  { icon: 'typescript' },
  { icon: 'java' },
  { icon: 'cplusplus', tag: 'c', hint: 'C++' },
  { icon: 'python' },
  { icon: 'php' },
  // { icon: 'delphi' },
  // { icon: 'pascal' },
  // { icon: 'basic' },
  { icon: 'nodejs', hint: 'Node.js' },
  { icon: 'react' },
  { icon: 'electron', iconType: 'original' },
  { icon: 'angular' },
  { icon: 'android', isClickable: false },
  { icon: 'html5', tag: 'html', hint: 'HTML' },
  { icon: 'css3', tag: 'css', hint: 'CSS' },
  { icon: 'sass', isClickable: false },
  { icon: 'bootstrap' },
  { icon: 'fastify' },
  { icon: 'arduino' },

  // Host, deployment and CI/CD
  { icon: 'docker' },
  { icon: 'podman', isClickable: false },
  { icon: 'kubernetes', isClickable: false },
  { icon: 'helm', isClickable: false },
  { icon: 'azure', isClickable: false },
  { icon: 'tomcat', iconType: 'line' },
  { icon: 'apache' },
  { icon: 'github', hint: 'GitHub', isClickable: false },
  { icon: 'azuredevops', hint: 'Azure DevOps', isClickable: false },
  { icon: 'bitbucket', isClickable: false },
  { icon: 'gitlab', hint: 'GitLab', isClickable: false },
  { icon: 'jira', isClickable: false },
  { icon: 'confluence', isClickable: false },
  // { icon: 'teamcity', hint: 'TeamCity', isClickable: false },
  { icon: 'jenkins' },

  // IDEs, editors, and tools
  { icon: 'vscode', hint: 'Visual Studio Code' },
  { icon: 'rider' },
  { icon: 'visualstudio', tag: 'visual-studio', hint: 'Visual Studio' },
  // { icon: 'netbeans', hint: 'NetBeans' },
  { icon: 'eclipse', isClickable: false },
  { icon: 'git', isClickable: false },
  { icon: 'subversion', isClickable: false },
  // { icon: 'tfs', isClickable: false },
  { icon: 'nuget', iconType: 'original', isClickable: false },
  { icon: 'npm', iconType: 'original-wordmark', isClickable: false },
  { icon: 'webpack' },
  { icon: 'jekyll', isClickable: false },
  { icon: 'markdown', isClickable: false },
  { icon: 'materialui', tag: 'material-ui', hint: 'Material UI' },
  { icon: 'redux' },
  { icon: 'vite' },
  // { icon: 'virtualbox' },

  // Databases
  { icon: 'sqlite', hint: 'SQLite' },
  { icon: 'mysql', hint: 'MySQL' },
  { icon: 'microsoftsqlserver', hint: 'SQL Server', isClickable: false },
  { icon: 'postgresql', hint: 'PostgreSQL', isClickable: false },

  // Testing tools
  { icon: 'playwright' },
  { icon: 'selenium' },
  { icon: 'cucumber', isClickable: false },
  { icon: 'postman', isClickable: false },
  // { icon: 'jmeter', isClickable: false },

  // Others
  { icon: 'windows11', tag: 'windows', hint: 'Windows' },
  { icon: 'powershell', isClickable: false },
  { icon: 'linux' },
  { icon: 'bash' },
  { icon: 'vim', isClickable: false },
  { icon: 'raspberrypi', hint: 'Raspberry Pi' },
  { icon: 'chrome' },
  { icon: 'firefox' },
  { icon: 'opentelemetry', hint: 'OpenTelemetry', isClickable: false },
  { icon: 'json', hint: 'JSON', isClickable: false },
  { icon: 'yaml', hint: 'YAML', isClickable: false },
  { icon: 'figma', isClickable: false },
  { icon: 'msdos', hint: 'MS-DOS', isClickable: false },
];

const container = document.getElementById('tools');

tools.forEach((tool) => {
  const icon = tool.icon;
  const iconType = tool.iconType ?? 'plain';
  const tag = tool.tag ?? icon;
  const title = tool.hint ?? tool.icon;
  const isClickable = tool.isClickable ?? true;

  const anchor = document.createElement('a');
  const classes = isClickable ? ['tool'] : ['tool', 'disabled'];
  anchor.classList.add(...classes);
  if (isClickable) {
    anchor.href = `/tags/${tag}`;
  }
  anchor.title = title.charAt(0).toUpperCase() + title.slice(1);

  const content = document.createElement('i');
  content.className = `tool-icon devicon-${icon}-${iconType}`;

  anchor.appendChild(content);
  container.appendChild(anchor);
});

document.querySelectorAll('.tool-icon').forEach((ti) => {
  ['mouseenter', 'touchstart'].forEach((event) =>
    ti.addEventListener(
      event,
      () => {
        ti.classList.add('colored');
        ti.parentElement.classList.add('hovered');
      },
      { passive: true }
    )
  );
  ['mouseleave', 'touchend', 'touchcancel'].forEach((event) =>
    ti.addEventListener(
      event,
      () => {
        ti.classList.remove('colored');
        ti.parentElement.classList.remove('hovered');
      },
      { passive: true }
    )
  );
});
