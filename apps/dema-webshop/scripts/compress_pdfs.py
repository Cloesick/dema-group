"""Compress PDFs for web deployment using pikepdf."""
import shutil
from pathlib import Path
import pikepdf

INPUT_DIR = Path("documents/Product_pdfs")
OUTPUT_DIR = Path("public/documents/Product_pdfs")

def compress_pdf(input_path: Path, output_path: Path) -> tuple[float, float]:
    """Compress PDF by rewriting with optimization."""
    original_size = input_path.stat().st_size / (1024 * 1024)
    
    with pikepdf.open(input_path) as pdf:
        pdf.save(output_path, 
                 compress_streams=True,
                 object_stream_mode=pikepdf.ObjectStreamMode.generate,
                 recompress_flate=True)
    
    compressed_size = output_path.stat().st_size / (1024 * 1024)
    return original_size, compressed_size

def main():
    print("=" * 60)
    print("COMPRESSING PDFs FOR WEB DEPLOYMENT")
    print("=" * 60)
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    pdf_files = list(INPUT_DIR.glob("*.pdf"))
    print(f"Found {len(pdf_files)} PDFs to compress\n")
    
    total_original = 0
    total_compressed = 0
    
    for pdf_path in sorted(pdf_files):
        output_path = OUTPUT_DIR / pdf_path.name
        try:
            orig, comp = compress_pdf(pdf_path, output_path)
            total_original += orig
            total_compressed += comp
            reduction = ((orig - comp) / orig * 100) if orig > 0 else 0
            status = f"({reduction:>5.1f}% smaller)" if reduction > 0 else "(no change)"
            print(f"  {pdf_path.name[:40]:<40} {orig:>6.2f} -> {comp:>6.2f} MB {status}")
        except Exception as e:
            print(f"  {pdf_path.name[:40]:<40} ERROR: {e}")
            shutil.copy(pdf_path, output_path)
            size = pdf_path.stat().st_size / (1024 * 1024)
            total_original += size
            total_compressed += size
    
    print("\n" + "=" * 60)
    saved = total_original - total_compressed
    pct = (saved / total_original * 100) if total_original > 0 else 0
    print(f"ORIGINAL: {total_original:.2f} MB")
    print(f"COMPRESSED: {total_compressed:.2f} MB")
    print(f"SAVED: {saved:.2f} MB ({pct:.1f}% reduction)")
    print(f"OUTPUT: {OUTPUT_DIR}")
    print("=" * 60)

if __name__ == "__main__":
    main()
