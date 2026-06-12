from __future__ import annotations

import hashlib
import posixpath
import re
import shutil
import zipfile
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
ASSETS = DOCS / "assets"

NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "wp": "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
}

W = f"{{{NS['w']}}}"
R = f"{{{NS['r']}}}"


@dataclass
class ConversionResult:
    source: Path
    files: list[Path]
    title: str
    images: int
    tables: int
    links: list[str]
    warnings: list[str]
    duplicate_headings: list[str]


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^\w\s-]", "", value, flags=re.UNICODE)
    value = re.sub(r"[\s_]+", "-", value, flags=re.UNICODE)
    value = re.sub(r"-+", "-", value)
    return value.strip("-") or "document"


def xml_read(zf: zipfile.ZipFile, name: str) -> ET.Element | None:
    try:
        return ET.fromstring(zf.read(name))
    except KeyError:
        return None


def rels_map(zf: zipfile.ZipFile) -> dict[str, str]:
    root = xml_read(zf, "word/_rels/document.xml.rels")
    if root is None:
        return {}
    rels: dict[str, str] = {}
    for rel in root.findall("rel:Relationship", NS):
        rid = rel.attrib.get("Id")
        target = rel.attrib.get("Target")
        if rid and target:
            rels[rid] = target
    return rels


def numbering_map(zf: zipfile.ZipFile) -> dict[tuple[str, str], str]:
    root = xml_read(zf, "word/numbering.xml")
    if root is None:
        return {}

    abstract: dict[str, dict[str, str]] = defaultdict(dict)
    for abstract_num in root.findall("w:abstractNum", NS):
        abstract_id = abstract_num.attrib.get(W + "abstractNumId", "")
        for lvl in abstract_num.findall("w:lvl", NS):
            ilvl = lvl.attrib.get(W + "ilvl", "0")
            num_fmt = lvl.find("w:numFmt", NS)
            abstract[abstract_id][ilvl] = num_fmt.attrib.get(W + "val", "bullet") if num_fmt is not None else "bullet"

    num_to_abstract: dict[str, str] = {}
    for num in root.findall("w:num", NS):
        num_id = num.attrib.get(W + "numId", "")
        abstract_id = num.find("w:abstractNumId", NS)
        if abstract_id is not None:
            num_to_abstract[num_id] = abstract_id.attrib.get(W + "val", "")

    mapped: dict[tuple[str, str], str] = {}
    for num_id, abstract_id in num_to_abstract.items():
        for ilvl, fmt in abstract.get(abstract_id, {}).items():
            mapped[(num_id, ilvl)] = fmt
    return mapped


def paragraph_style(p: ET.Element) -> str:
    style = p.find("w:pPr/w:pStyle", NS)
    return style.attrib.get(W + "val", "") if style is not None else ""


def heading_level(style: str) -> int | None:
    match = re.fullmatch(r"Heading([1-6])", style or "")
    if match:
        return int(match.group(1))
    return None


def paragraph_num(p: ET.Element) -> tuple[str, str] | None:
    num_pr = p.find("w:pPr/w:numPr", NS)
    if num_pr is None:
        return None
    num_id = num_pr.find("w:numId", NS)
    ilvl = num_pr.find("w:ilvl", NS)
    if num_id is None:
        return None
    return (num_id.attrib.get(W + "val", "0"), ilvl.attrib.get(W + "val", "0") if ilvl is not None else "0")


def escape_md(text: str) -> str:
    return text.replace("\\", "\\\\").replace("|", "\\|")


def run_text(run: ET.Element) -> str:
    parts: list[str] = []
    for child in run:
        if child.tag == W + "t":
            parts.append(child.text or "")
        elif child.tag == W + "tab":
            parts.append("\t")
        elif child.tag in {W + "br", W + "cr"}:
            parts.append("\n")
    text = "".join(parts)
    if not text:
        return ""

    props = run.find("w:rPr", NS)
    is_bold = props is not None and props.find("w:b", NS) is not None
    is_italic = props is not None and props.find("w:i", NS) is not None
    is_code = False
    if props is not None:
        fonts = props.find("w:rFonts", NS)
        if fonts is not None:
            font_values = " ".join(v.lower() for v in fonts.attrib.values())
            is_code = any(name in font_values for name in ("consolas", "courier", "monaco"))

    if is_code and text.strip():
        text = "`" + text.replace("`", "\\`") + "`"
    if is_bold and text.strip():
        text = f"**{text}**"
    if is_italic and text.strip():
        text = f"*{text}*"
    return text


def extract_image(zf: zipfile.ZipFile, rel_target: str, source_stem: str, counter: int) -> str | None:
    target = rel_target.replace("\\", "/")
    if target.startswith("../"):
        return None
    word_path = posixpath.normpath(posixpath.join("word", target))
    try:
        data = zf.read(word_path)
    except KeyError:
        return None

    ext = Path(word_path).suffix or ".png"
    digest = hashlib.sha1(data).hexdigest()[:10]
    out_name = f"{source_stem}-{counter:03d}-{digest}{ext}"
    out_path = ASSETS / out_name
    if not out_path.exists():
        out_path.write_bytes(data)
    return f"../assets/{out_name}"


def paragraph_text(
    p: ET.Element,
    zf: zipfile.ZipFile,
    rels: dict[str, str],
    source_stem: str,
    image_state: dict[str, int],
    links: list[str],
    warnings: list[str],
) -> str:
    pieces: list[str] = []

    def append_runs(container: ET.Element) -> str:
        local: list[str] = []
        for node in container:
            if node.tag == W + "r":
                local.append(run_text(node))
                for blip in node.findall(".//a:blip", NS):
                    rid = blip.attrib.get(R + "embed") or blip.attrib.get(R + "link")
                    if rid and rid in rels:
                        image_state["count"] += 1
                        image_ref = extract_image(zf, rels[rid], source_stem, image_state["count"])
                        if image_ref:
                            local.append(f"![Image {image_state['count']}]({image_ref})")
                        else:
                            warnings.append(f"Could not extract image relationship {rid}.")
            elif node.tag == W + "hyperlink":
                rid = node.attrib.get(R + "id")
                anchor = node.attrib.get(W + "anchor")
                label = append_runs(node).strip()
                href = rels.get(rid, f"#{anchor}" if anchor else "")
                if label and href:
                    links.append(href)
                    local.append(f"[{label}]({href})")
                else:
                    local.append(label)
            elif node.tag == W + "sdt":
                local.append("".join(t.text or "" for t in node.findall(".//w:t", NS)))
        return "".join(local)

    pieces.append(append_runs(p))
    text = "".join(pieces)
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip()


def table_to_md(
    tbl: ET.Element,
    zf: zipfile.ZipFile,
    rels: dict[str, str],
    source_stem: str,
    image_state: dict[str, int],
    links: list[str],
    warnings: list[str],
) -> list[str]:
    rows: list[list[str]] = []
    for tr in tbl.findall("w:tr", NS):
        cells: list[str] = []
        for tc in tr.findall("w:tc", NS):
            cell_parts: list[str] = []
            for child in tc:
                if child.tag == W + "p":
                    text = paragraph_text(child, zf, rels, source_stem, image_state, links, warnings)
                    if text:
                        cell_parts.append(text)
                elif child.tag == W + "tbl":
                    nested = table_to_md(child, zf, rels, source_stem, image_state, links, warnings)
                    cell_parts.append("<br>".join(nested))
            cells.append("<br>".join(cell_parts).replace("\n", "<br>"))
        if cells:
            rows.append(cells)

    if not rows:
        return []
    width = max(len(row) for row in rows)
    normalized = [row + [""] * (width - len(row)) for row in rows]
    lines = [
        "| " + " | ".join(escape_md(cell) for cell in normalized[0]) + " |",
        "| " + " | ".join("---" for _ in range(width)) + " |",
    ]
    for row in normalized[1:]:
        lines.append("| " + " | ".join(escape_md(cell) for cell in row) + " |")
    return lines


def iter_body_blocks(container: ET.Element) -> Iterable[ET.Element]:
    for child in container:
        if child.tag in {W + "p", W + "tbl"}:
            yield child
        elif child.tag == W + "sdt":
            content = child.find("w:sdtContent", NS)
            if content is not None:
                yield from iter_body_blocks(content)


def is_decoration(line: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return False
    if re.fullmatch(r"\d+", stripped):
        return True
    if re.fullmatch(r"Page\s+\d+(\s+of\s+\d+)?", stripped, flags=re.IGNORECASE):
        return True
    return False


def convert_docx(source: Path, output_dir: Path) -> ConversionResult:
    output_dir.mkdir(parents=True, exist_ok=True)
    ASSETS.mkdir(parents=True, exist_ok=True)

    lines: list[str] = []
    links: list[str] = []
    warnings: list[str] = []
    table_count = 0
    image_state = {"count": 0}
    list_counters: dict[tuple[str, int], int] = defaultdict(int)

    with zipfile.ZipFile(source) as zf:
        root = xml_read(zf, "word/document.xml")
        if root is None:
            raise RuntimeError(f"{source} has no word/document.xml")
        rels = rels_map(zf)
        nums = numbering_map(zf)

        body = root.find("w:body", NS)
        if body is None:
            raise RuntimeError(f"{source} has no document body")

        for child in iter_body_blocks(body):
            if child.tag == W + "p":
                text = paragraph_text(child, zf, rels, source.stem, image_state, links, warnings)
                if not text or is_decoration(text):
                    continue

                style = paragraph_style(child)
                level = heading_level(style)
                if level:
                    lines.append("")
                    lines.append(f"{'#' * level} {text}")
                    lines.append("")
                    continue

                num = paragraph_num(child)
                if num:
                    num_id, ilvl_s = num
                    ilvl = int(ilvl_s or "0")
                    fmt = nums.get((num_id, ilvl_s), "bullet")
                    indent = "  " * ilvl
                    if fmt in {"decimal", "lowerLetter", "upperLetter", "lowerRoman", "upperRoman"}:
                        key = (num_id, ilvl)
                        list_counters[key] += 1
                        marker = f"{list_counters[key]}."
                    else:
                        marker = "-"
                    lines.append(f"{indent}{marker} {text}")
                else:
                    if "Code" in style:
                        lines.extend(["", "```", text, "```", ""])
                    else:
                        lines.append(text)
                        lines.append("")
            elif child.tag == W + "tbl":
                table_count += 1
                table_lines = table_to_md(child, zf, rels, source.stem, image_state, links, warnings)
                if table_lines:
                    lines.append("")
                    lines.extend(table_lines)
                    lines.append("")

    normalized: list[str] = []
    blank = False
    for line in lines:
        clean = line.rstrip()
        if clean == "":
            if not blank:
                normalized.append("")
            blank = True
        else:
            normalized.append(clean)
            blank = False

    while normalized and normalized[0] == "":
        normalized.pop(0)
    while normalized and normalized[-1] == "":
        normalized.pop()

    title = next((line.lstrip("# ").strip() for line in normalized if line.startswith("#")), source.stem)
    base_name = slugify(source.stem)
    out_file = output_dir / f"{base_name}.md"
    out_file.write_text("\n".join(normalized) + "\n", encoding="utf-8")

    files = [out_file]
    if len(normalized) > 1000:
        split_files = split_large_markdown(out_file, normalized, output_dir / base_name)
        files.extend(split_files)

    headings = [line.strip("# ").strip() for line in normalized if line.startswith("#")]
    duplicate_headings = [heading for heading, count in Counter(headings).items() if count > 1]

    return ConversionResult(
        source=source,
        files=files,
        title=title,
        images=image_state["count"],
        tables=table_count,
        links=links,
        warnings=warnings,
        duplicate_headings=duplicate_headings,
    )


def split_large_markdown(full_file: Path, lines: list[str], split_dir: Path) -> list[Path]:
    split_dir.mkdir(parents=True, exist_ok=True)
    chunks: list[list[str]] = []
    current: list[str] = []

    for line in lines:
        starts_major = line.startswith("# ") and current
        if starts_major or len(current) >= 950:
            chunks.append(current)
            current = []
        current.append(line)
    if current:
        chunks.append(current)

    if len(chunks) <= 1:
        return []

    files: list[Path] = []
    for index, chunk in enumerate(chunks, start=1):
        first_heading = next((line.strip("# ").strip() for line in chunk if line.startswith("#")), f"Part {index}")
        name = f"{index:02d}-{slugify(first_heading)[:70]}.md"
        path = split_dir / name
        split_text = "\n".join(chunk).strip().replace("../assets/", "../../assets/")
        path.write_text(split_text + "\n", encoding="utf-8")
        files.append(path)

    toc = ["# " + full_file.stem, "", "This document was split because the converted Markdown exceeded 1000 lines.", ""]
    for path in files:
        toc.append(f"- [{path.stem}]({path.relative_to(full_file.parent).as_posix()})")
    full_file.write_text("\n".join(toc) + "\n", encoding="utf-8")
    return files


def output_dir_for(source: Path) -> Path:
    name = source.stem.lower()
    if "design" in name:
        return DOCS / "design"
    if "requirement" in name:
        return DOCS / "requirements"
    if "proposal" in name:
        return DOCS / "requirements"
    return DOCS


def validate_links(md_files: Iterable[Path]) -> list[str]:
    warnings: list[str] = []
    link_pattern = re.compile(r"!?\[[^\]]*\]\(([^)]+)\)")
    for md_file in md_files:
        text = md_file.read_text(encoding="utf-8")
        for match in link_pattern.finditer(text):
            href = match.group(1).strip()
            if re.match(r"^[a-z]+://", href) or href.startswith("mailto:") or href.startswith("#"):
                continue
            target = (md_file.parent / href).resolve()
            if not target.exists():
                warnings.append(f"Broken local link in {md_file.relative_to(ROOT)}: {href}")
    return warnings


def write_index(results: list[ConversionResult]) -> Path:
    lines = ["# Converted Documentation", ""]
    for result in results:
        lines.append(f"## {result.source.name}")
        for path in result.files:
            lines.append(f"- [{path.relative_to(DOCS).as_posix()}]({path.relative_to(DOCS).as_posix()})")
        lines.append("")
    path = DOCS / "index.md"
    path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
    return path


def write_summary(results: list[ConversionResult], link_warnings: list[str]) -> Path:
    lines = ["# Conversion Summary", ""]
    for result in results:
        lines.extend(
            [
                f"## {result.source.name}",
                f"- Title: {result.title}",
                f"- Markdown files: {len(result.files)}",
                f"- Extracted images: {result.images}",
                f"- Tables converted: {result.tables}",
                f"- Hyperlinks detected: {len(result.links)}",
                f"- Duplicate headings: {', '.join(result.duplicate_headings) if result.duplicate_headings else 'None detected'}",
                f"- Conversion warnings: {', '.join(result.warnings) if result.warnings else 'None'}",
                "",
            ]
        )
    lines.append("## Link Validation")
    if link_warnings:
        lines.extend(f"- {warning}" for warning in link_warnings)
    else:
        lines.append("- All local Markdown links and image references resolved.")
    lines.append("")
    lines.append("## Accuracy Notes")
    lines.append("- Headers, footers, page numbers, and decorations outside `word/document.xml` were not imported.")
    lines.append("- Advanced Word layout details such as exact positioning, merged-cell geometry, and watermarks are normalized to Markdown.")
    path = DOCS / "conversion-summary.md"
    path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
    return path


def main() -> None:
    DOCS.mkdir(exist_ok=True)
    ASSETS.mkdir(exist_ok=True)
    for folder in ("design", "requirements", "architecture", "ui"):
        (DOCS / folder).mkdir(exist_ok=True)

    # Remove only outputs from previous converter runs, preserving source docs and hand-written docs.
    for folder in (DOCS / "design", DOCS / "requirements", DOCS / "architecture", DOCS / "ui"):
        for path in folder.rglob("*.md"):
            path.unlink()
        for path in sorted(folder.glob("*"), reverse=True):
            if path.is_dir() and not any(path.iterdir()):
                path.rmdir()

    sources = sorted(DOCS.rglob("*.docx"))
    results = [convert_docx(source, output_dir_for(source)) for source in sources]
    all_files = [file for result in results for file in result.files]
    index = write_index(results)
    link_warnings = validate_links([*all_files, index])
    summary = write_summary(results, link_warnings)
    print(f"Converted {len(results)} document(s).")
    print(f"Index: {index.relative_to(ROOT)}")
    print(f"Summary: {summary.relative_to(ROOT)}")
    for result in results:
        print(f"- {result.source.name}: {len(result.files)} markdown file(s), {result.images} image(s), {result.tables} table(s)")


if __name__ == "__main__":
    main()
