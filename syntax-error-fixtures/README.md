# Syntax Error Fixtures (INTENTIONAL)

⚠️ The files in this folder contain **deliberate syntax errors**. They exist only
to test a syntax-error-detection agent/tool. They are **not** part of the
application build (the MERN app never imports them), so they do not affect the
frontend or backend.

Do not "fix" these — the errors are the point. Delete the whole folder when the
test is done.

| File | Language | Intended error |
|------|----------|----------------|
| `broken_python.py` | Python | Missing colon on `def`; unclosed string |
| `BrokenJava.java` | Java | Missing semicolon; missing closing brace |
| `broken_cpp.cpp` | C++ | Missing closing parenthesis / semicolon |
| `broken_javascript.js` | JavaScript | Missing `)` in params/loop; unclosed array |
| `broken_go.go` | Go | Missing `)` on call; malformed for-loop |
| `broken_ruby.rb` | Ruby | Missing `end`; unclosed array |
| `BrokenCSharp.cs` | C# | Missing semicolons; missing closing brace |
| `broken_dart1.dart` | Dart | Missing semicolon; unclosed list; missing brace |
| `broken_dart2.dart` | Dart | Missing semicolon; malformed method params |
