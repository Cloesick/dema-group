from __future__ import annotations

from pathlib import Path

try:
    import markdown2
    import pdfkit

    LIBS_AVAILABLE = True
except ImportError:
    LIBS_AVAILABLE = False


WKHTMLTOPDF_EXE = Path(r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe")


HTML_TEMPLATE = """<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>{title}</title>
  <style>
    body {{
      font-family: Georgia, serif;
      font-size: 11pt;
      line-height: 1.6;
      max-width: 900px;
      margin: 40px auto;
      color: #333;
    }}
    h1 {{
      font-size: 24pt;
      border-bottom: 3px solid #667eea;
      padding-bottom: 10px;
      margin-top: 30px;
    }}
    h2 {{
      font-size: 18pt;
      margin-top: 25px;
      color: #2d3748;
    }}
    h3 {{
      font-size: 14pt;
      margin-top: 20px;
      color: #4a5568;
    }}
    code {{
      background: #f7fafc;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 10pt;
    }}
    pre {{
      background: #f7fafc;
      padding: 15px;
      border-left: 4px solid #667eea;
      overflow-x: auto;
      font-size: 9pt;
    }}
    pre code {{
      background: none;
      padding: 0;
    }}
    table {{
      border-collapse: collapse;
      width: 100%;
      margin: 15px 0;
    }}
    th {{
      background: #667eea;
      color: white;
      padding: 10px;
      text-align: left;
    }}
    td {{
      padding: 10px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }}
    tr:nth-child(even) {{
      background: #f7fafc;
    }}
    blockquote {{
      border-left: 4px solid #cbd5e0;
      padding-left: 15px;
      color: #4a5568;
      font-style: italic;
    }}
    a {{
      color: #2b6cb0;
      text-decoration: none;
    }}
  </style>
</head>
<body>
  {content}
</body>
</html>"""


def find_repo_root(start: Path) -> Path:
    p = start.resolve()
    while True:
        if (p / "pnpm-workspace.yaml").exists() or (p / "turbo.json").exists():
            return p
        if p.parent == p:
            raise RuntimeError("Could not find repo root (no README.md found in parent chain).")
        p = p.parent


def md_to_pdf(md_path: Path, pdf_path: Path) -> None:
    md_text = md_path.read_text(encoding="utf-8")

    html_content = markdown2.markdown(
        md_text,
        extras=[
            "tables",
            "fenced-code-blocks",
            "header-ids",
        ],
    )

    title = md_path.name
    full_html = HTML_TEMPLATE.format(title=title, content=html_content)

    options = {
        "page-size": "A4",
        "margin-top": "15mm",
        "margin-right": "15mm",
        "margin-bottom": "15mm",
        "margin-left": "15mm",
        "encoding": "UTF-8",
        "enable-local-file-access": None,
        "print-media-type": None,
    }

    config = None
    if WKHTMLTOPDF_EXE.exists():
        config = pdfkit.configuration(wkhtmltopdf=str(WKHTMLTOPDF_EXE))

    pdfkit.from_string(full_html, str(pdf_path), options=options, configuration=config)


def main() -> int:
    if not LIBS_AVAILABLE:
        print("Missing Python dependencies. Install: python -m pip install markdown2 pdfkit")
        return 2

    if not WKHTMLTOPDF_EXE.exists():
        print(f"wkhtmltopdf not found at: {WKHTMLTOPDF_EXE}")
        print("Install wkhtmltopdf and/or update WKHTMLTOPDF_EXE in this script.")
        return 4

    repo_root = find_repo_root(Path(__file__).parent)

    out_dir = repo_root / "generated-pdfs"
    out_dir.mkdir(parents=True, exist_ok=True)

    tasks = [
        (repo_root / "README.md", out_dir / "README.pdf"),
        (repo_root / "docs" / "README.md", out_dir / "docs-README.pdf"),
        (repo_root / "docs" / "COMPANY_QUESTIONNAIRE.md", out_dir / "COMPANY_QUESTIONNAIRE.pdf"),
    ]

    for md_path, pdf_path in tasks:
        if not md_path.exists():
            print(f"Missing input file: {md_path}")
            return 3

        print(f"Generating {pdf_path.name} from {md_path} ...")
        try:
            md_to_pdf(md_path, pdf_path)
        except OSError as e:
            print(str(e))
            print("wkhtmltopdf is likely missing. Install it and ensure it's on PATH.")
            return 4

    print(f"Done. PDFs written to: {out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
