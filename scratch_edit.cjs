const fs = require('fs');

function processFile(filePath, isClientJs) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Replace G object
  content = content.replace(/const G = \{[\s\S]*?\};\n/, `const G = {
  bg: 'var(--bg)',
  surface: 'var(--surface)',
  card: 'var(--card)',
  border: 'var(--border)',
  accent: 'var(--accent)',
  accentHover: 'var(--accent-hover)',
  gold: 'var(--gold)',
  text: 'var(--text)',
  muted: 'var(--muted)',
  soft: 'var(--soft)',
  font: 'var(--font-bebas), Oswald, sans-serif',
  body: 'var(--font-dm), DM Sans, sans-serif',
  radius: '12px',
};\n`);

  // 2. Remove CSS string
  content = content.replace(/const CSS = \`[\s\S]*?\`;\n/, 'const CSS = ``;\n');

  // 3. Import SocialShare
  if (!content.includes('import SocialShare')) {
    const importPath = isClientJs ? '../../../components/SocialShare' : './components/SocialShare';
    content = content.replace(/import \{ useState[^\n]*\n/, match => match + `import SocialShare from "${importPath}";\n`);
  }

  // 4. Add SocialShare to DetailPage
  if (!content.includes('<SocialShare')) {
    content = content.replace(/(<WatchlistBtn movie=\{data\} type=\{type\} \/>)/, `$1\n                <SocialShare title={data.title || data.name} url={\`https://cine-max.live/\${type}/\${data.id}\`} />`);
  }

  // 5. Remove <style>{CSS}</style>
  content = content.replace(/<style>\{CSS\}<\/style>/g, '');

  fs.writeFileSync(filePath, content);
  console.log(`${filePath} updated successfully!`);
}

try {
  processFile('app/page.js', false);
  processFile('app/movie/[id]/client.js', true);
  processFile('app/tv/[id]/client.js', true);
} catch (e) {
  console.error(e);
}
