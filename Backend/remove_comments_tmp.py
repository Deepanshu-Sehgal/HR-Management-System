from pathlib import Path

root = Path(__file__).resolve().parent
js_files = list(root.glob('*.js')) + list((root / 'config').glob('*.js')) + list((root / 'controllers').glob('*.js')) + list((root / 'models').glob('*.js')) + list((root / 'routes').glob('*.js'))

print(f'Processing {len(js_files)} JS files')

for path in js_files:
    text = path.read_text(encoding='utf-8')
    out = []
    i = 0
    state = 'normal'
    while i < len(text):
        ch = text[i]
        if state == 'normal':
            if ch == '/' and i + 1 < len(text) and text[i+1] == '/':
                state = 'line'
                i += 2
                continue
            if ch == '/' and i + 1 < len(text) and text[i+1] == '*':
                state = 'block'
                i += 2
                continue
            if ch == '"':
                out.append(ch)
                state = 'dq'
                i += 1
                continue
            if ch == "'":
                out.append(ch)
                state = 'sq'
                i += 1
                continue
            if ch == '`':
                out.append(ch)
                state = 'bt'
                i += 1
                continue
            out.append(ch)
            i += 1
        elif state == 'line':
            if ch == '\n':
                out.append(ch)
                state = 'normal'
            i += 1
        elif state == 'block':
            if ch == '*' and i + 1 < len(text) and text[i+1] == '/':
                state = 'normal'
                i += 2
            else:
                i += 1
        elif state in ('dq', 'sq', 'bt'):
            out.append(ch)
            if ch == '\\':
                if i + 1 < len(text):
                    out.append(text[i+1])
                    i += 2
                    continue
            if (state == 'dq' and ch == '"') or (state == 'sq' and ch == "'") or (state == 'bt' and ch == '`'):
                state = 'normal'
            i += 1
    stripped = ''.join(out)
    if stripped != text:
        path.write_text(stripped, encoding='utf-8')
        print(f'Removed comments from {path.relative_to(root)}')
    else:
        print(f'No comments removed in {path.relative_to(root)}')
