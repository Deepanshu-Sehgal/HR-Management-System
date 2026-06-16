from pathlib import Path
import re

root = Path(__file__).resolve().parent
js_files = list(root.glob('*.js')) + list((root / 'config').glob('*.js')) + list((root / 'controllers').glob('*.js')) + list((root / 'models').glob('*.js')) + list((root / 'routes').glob('*.js'))
pattern = re.compile(r'//|/\*')
found = False
for path in js_files:
    text = path.read_text(encoding='utf-8')
    if pattern.search(text):
        print(f'COMMENTS in {path.relative_to(root)}')
        found = True
if not found:
    print('No comment markers found in backend JS files.')
