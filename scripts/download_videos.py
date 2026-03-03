"""
ClimaTales AR - YouTube Video Downloader
=========================================
Downloads all project YouTube videos with:
  - 480p resolution
  - H.265 (HEVC) compression
  - Hardcoded English closed captions
  - Audio included

Requirements:
  pip install yt-dlp
  ffmpeg must be installed and in PATH
    -> Windows: https://www.gyan.dev/ffmpeg/builds/ (get ffmpeg-release-essentials.zip)
    -> Or: winget install Gyan.FFmpeg

Usage:
  python scripts/download_videos.py
  python scripts/download_videos.py --dry-run        # preview without downloading
  python scripts/download_videos.py --skip-encode     # download only, no H.265 re-encode
  python scripts/download_videos.py --only <video_id> # download a single video
"""

import subprocess
import sys
import os
import re
import json
import shutil
import argparse
import time
from pathlib import Path

# ============================================
# CONFIG
# ============================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent
CONTENT_DIR = PROJECT_ROOT / "static" / "content" / "videos"
OUTPUT_DIR = PROJECT_ROOT / "static" / "youtube-videos"
TEMP_DIR = OUTPUT_DIR / "_temp"

VIDEO_CATEGORIES = ["carbon-cycle", "human-actions", "climate-change", "solutions"]

# ============================================
# VIDEO MANIFEST (extracted from project docs)
# Maps video_id -> metadata for naming & organization
# ============================================

VIDEO_MANIFEST = {
    # Page 2 - Carbon Cycle
    "rCBb0U74K8Q": {"page": 2, "category": "carbon-cycle", "slug": "chemistry-for-kids-carbon"},
    "mN4IorWygwk": {"page": 2, "category": "carbon-cycle", "slug": "what-is-carbon-dioxide"},
    # Page 3 - Carbon Cycle
    "p3R-dB9K4ss": {"page": 3, "category": "carbon-cycle", "slug": "carbon-cycle-for-kids"},
    # Page 4 - Human Actions
    "GsZClyoBrSo": {"page": 4, "category": "human-actions", "slug": "carbon-emissions-deforestation"},
    "Yksmlt88Ds0": {"page": 4, "category": "human-actions", "slug": "environmental-impact-fossil-fuels"},
    "oe4N7tu-VMQ": {"page": 4, "category": "human-actions", "slug": "open-pit-vs-underground-mining"},
    # Page 5 - Human Actions
    "glo6VnAHFvg": {"page": 5, "category": "human-actions", "slug": "human-activity-carbon-cycle"},
    "OIr3BF6qMRs": {"page": 5, "category": "human-actions", "slug": "landfill-methane-climate-change"},
    # Page 6 - Climate Change
    "YJrKgBUDGYc": {"page": 6, "category": "climate-change", "slug": "what-is-global-warming"},
    "DLg2NMjzh2o": {"page": 6, "category": "climate-change", "slug": "ocean-acidification"},
    # Page 7 - Climate Change
    "ztWHqUFJRTs": {"page": 7, "category": "climate-change", "slug": "climate-change-tetris"},
    "ccYvlbcBlTY": {"page": 7, "category": "climate-change", "slug": "ocean-acidification-coral-reefs"},
    "C8BhxvhUyiw": {"page": 7, "category": "climate-change", "slug": "glaciers-in-peril"},
    # Page 8 - Solutions
    "Dzvi2tgaEs4": {"page": 8, "category": "solutions", "slug": "forest-conservation"},
    "T9j42-V5cr0": {"page": 8, "category": "solutions", "slug": "sustainable-transport"},
    # Page 9 - Solutions
    "T4xKThjcKaE": {"page": 9, "category": "solutions", "slug": "renewable-energy-101"},
    "xpAnLXc_bIU": {"page": 9, "category": "solutions", "slug": "importance-of-recycling"},
    "oFlsjRXbnSk": {"page": 9, "category": "solutions", "slug": "composting-for-environment"},
    # Page 10 - Solutions
    "iloAQmroRK0": {"page": 10, "category": "solutions", "slug": "sustainable-agriculture"},
    "ydrqnAqAusQ": {"page": 10, "category": "solutions", "slug": "environmental-education"},
}

# ============================================
# HELPERS
# ============================================

# Resolved command paths (set by check_dependencies)
YTDLP_CMD: list[str] = []
FFMPEG_CMD: str = "ffmpeg"


def find_ffmpeg() -> str | None:
    """Find ffmpeg, checking common Windows install locations."""
    # Check PATH first
    found = shutil.which("ffmpeg")
    if found:
        return found

    # Common Windows locations after winget / manual install
    local_appdata = Path(os.environ.get("LOCALAPPDATA", os.path.expanduser("~/AppData/Local")))
    candidates = [
        local_appdata / "Microsoft" / "WinGet" / "Links" / "ffmpeg.exe",
        Path("C:/ffmpeg/bin/ffmpeg.exe"),
        Path("C:/Program Files/ffmpeg/bin/ffmpeg.exe"),
        Path(os.environ.get("ProgramFiles", "C:/Program Files")) / "ffmpeg" / "bin" / "ffmpeg.exe",
    ]
    for c in candidates:
        if c.exists():
            return str(c)

    # Search winget packages directory (winget installs here with version-specific paths)
    winget_packages = local_appdata / "Microsoft" / "WinGet" / "Packages"
    if winget_packages.exists():
        for ffmpeg_exe in winget_packages.rglob("ffmpeg.exe"):
            if "bin" in str(ffmpeg_exe):
                return str(ffmpeg_exe)

    # Search for ffmpeg in PATH-adjacent dirs (winget aliases might not show in git bash)
    for p in os.environ.get("PATH", "").split(os.pathsep):
        candidate = Path(p) / "ffmpeg.exe"
        if candidate.exists():
            return str(candidate)

    return None


def check_dependencies():
    """Verify yt-dlp and ffmpeg are available."""
    global YTDLP_CMD, FFMPEG_CMD
    errors = []

    # Check yt-dlp: try direct command first, then python -m fallback
    try:
        result = subprocess.run(
            ["yt-dlp", "--version"],
            capture_output=True, text=True, timeout=10
        )
        YTDLP_CMD = ["yt-dlp"]
        print(f"  yt-dlp version: {result.stdout.strip()}")
    except FileNotFoundError:
        # Fallback: python -m yt_dlp
        try:
            result = subprocess.run(
                [sys.executable, "-m", "yt_dlp", "--version"],
                capture_output=True, text=True, timeout=10
            )
            YTDLP_CMD = [sys.executable, "-m", "yt_dlp"]
            print(f"  yt-dlp version: {result.stdout.strip()} (via python -m)")
        except (FileNotFoundError, subprocess.TimeoutExpired):
            errors.append("yt-dlp not found. Install with: pip install yt-dlp")

    # Check for Node.js (needed by yt-dlp for YouTube JS challenge solving)
    node_path = shutil.which("node")
    if node_path:
        print(f"  node: {node_path}")
    else:
        errors.append("Node.js not found. Required by yt-dlp for YouTube downloads.")

    # Check ffmpeg
    ffmpeg_path = find_ffmpeg()
    if ffmpeg_path:
        FFMPEG_CMD = ffmpeg_path
        try:
            result = subprocess.run(
                [FFMPEG_CMD, "-version"],
                capture_output=True, text=True, timeout=10
            )
            version_line = result.stdout.split("\n")[0]
            print(f"  ffmpeg: {version_line}")
        except (FileNotFoundError, subprocess.TimeoutExpired):
            errors.append(
                "ffmpeg found but not working. Reinstall from https://www.gyan.dev/ffmpeg/builds/"
            )
    else:
        errors.append(
            "ffmpeg not found. Install from https://www.gyan.dev/ffmpeg/builds/\n"
            "  Or run: winget install Gyan.FFmpeg\n"
            "  Then restart your terminal."
        )

    if errors:
        print("\n[ERROR] Missing dependencies:")
        for e in errors:
            print(f"  - {e}")
        sys.exit(1)


def parse_urls_from_markdown(filepath: Path) -> list[dict]:
    """Extract YouTube URLs and titles from a video markdown file."""
    if not filepath.exists():
        print(f"  [WARN] File not found: {filepath}")
        return []

    content = filepath.read_text(encoding="utf-8")
    videos = []

    # Split by ## headers
    blocks = re.split(r"(?=^## )", content, flags=re.MULTILINE)
    for block in blocks:
        block = block.strip()
        if not block.startswith("## "):
            continue

        lines = block.split("\n")
        title = lines[0].replace("## ", "").strip()

        url = None
        for line in lines[1:]:
            line = line.strip()
            # Match youtu.be or youtube.com URLs
            if "youtu.be/" in line or "youtube.com/watch" in line:
                url = line
                break

        if url:
            # Extract video ID
            video_id = extract_video_id(url)
            if video_id:
                videos.append({
                    "title": title,
                    "url": url,
                    "video_id": video_id,
                })

    return videos


def extract_video_id(url: str) -> str | None:
    """Extract YouTube video ID from various URL formats."""
    # youtu.be/VIDEO_ID
    match = re.search(r"youtu\.be/([a-zA-Z0-9_-]+)", url)
    if match:
        return match.group(1)

    # youtube.com/watch?v=VIDEO_ID
    match = re.search(r"[?&]v=([a-zA-Z0-9_-]+)", url)
    if match:
        return match.group(1)

    return None


def get_all_videos() -> list[dict]:
    """Collect all videos from all category markdown files."""
    all_videos = []
    seen_ids = set()

    for category in VIDEO_CATEGORIES:
        filepath = CONTENT_DIR / f"{category}.md"
        videos = parse_urls_from_markdown(filepath)
        for v in videos:
            if v["video_id"] not in seen_ids:
                seen_ids.add(v["video_id"])
                # Enrich with manifest data
                meta = VIDEO_MANIFEST.get(v["video_id"], {})
                v["category"] = meta.get("category", category)
                v["page"] = meta.get("page", 0)
                v["slug"] = meta.get("slug", slugify(v["title"]))
                all_videos.append(v)

    return all_videos


def slugify(text: str) -> str:
    """Convert title to kebab-case slug."""
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")[:60]


def download_video(video: dict, temp_dir: Path, skip_encode: bool = False) -> Path | None:
    """
    Download a single video with yt-dlp, then re-encode with ffmpeg.
    Returns the final output path or None on failure.
    """
    video_id = video["video_id"]
    slug = video["slug"]
    category = video["category"]
    url = f"https://www.youtube.com/watch?v={video_id}"

    # Output paths
    category_dir = OUTPUT_DIR / category
    category_dir.mkdir(parents=True, exist_ok=True)
    final_path = category_dir / f"{slug}.mp4"

    if final_path.exists():
        print(f"    [SKIP] Already exists: {final_path.name}")
        return final_path

    # Temp paths
    temp_video = temp_dir / f"{video_id}_raw.mp4"
    temp_subs = temp_dir / f"{video_id}_raw.en.srt"
    # yt-dlp may also produce .en.vtt
    temp_subs_vtt = temp_dir / f"{video_id}_raw.en.vtt"

    # ----------------------------------------------------------
    # Step 1: Download with yt-dlp (480p max, with English subs)
    # ----------------------------------------------------------
    print(f"    [1/2] Downloading from YouTube...")

    # Build ffmpeg location for yt-dlp (it needs ffmpeg for merging formats)
    ffmpeg_dir = str(Path(FFMPEG_CMD).parent) if os.sep in FFMPEG_CMD or "/" in FFMPEG_CMD else ""

    # Find node path for JS challenge solving
    node_path = shutil.which("node") or "node"

    ytdlp_cmd = [
        *YTDLP_CMD,
        # JS runtime with explicit path for YouTube extraction
        "--js-runtimes", f"node:{node_path}",
        # Remote EJS component for YouTube signature solving
        "--remote-components", "ejs:github",
        # Video: best mp4 up to 480p with audio, or best available under 480p
        "-f", "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best[height<=480]",
        # Merge to mp4
        "--merge-output-format", "mp4",
        # Subtitles: grab English auto-generated if no manual subs
        "--write-subs",
        "--write-auto-subs",
        "--sub-langs", "en",
        "--convert-subs", "srt",
        # Output template
        "-o", str(temp_dir / f"{video_id}_raw.%(ext)s"),
        # No playlist
        "--no-playlist",
        # Retry on failure
        "--retries", "3",
        "--fragment-retries", "3",
        url,
    ]

    # Point yt-dlp to ffmpeg if it's not in PATH
    if ffmpeg_dir:
        ytdlp_cmd.insert(len(YTDLP_CMD), "--ffmpeg-location")
        ytdlp_cmd.insert(len(YTDLP_CMD) + 1, ffmpeg_dir)

    try:
        result = subprocess.run(
            ytdlp_cmd,
            capture_output=True, text=True, timeout=300
        )
        if result.returncode != 0:
            print(f"    [ERROR] yt-dlp failed:\n{result.stderr[-500:]}")
            return None
    except subprocess.TimeoutExpired:
        print(f"    [ERROR] yt-dlp timed out after 5 minutes")
        return None

    # Find the downloaded video file
    if not temp_video.exists():
        # yt-dlp might have used a different name
        candidates = list(temp_dir.glob(f"{video_id}_raw.*"))
        video_candidates = [c for c in candidates if c.suffix in (".mp4", ".mkv", ".webm")]
        if video_candidates:
            temp_video = video_candidates[0]
        else:
            print(f"    [ERROR] Downloaded file not found. Files in temp: {[c.name for c in candidates]}")
            return None

    # Find subtitle file (could be .srt or .vtt)
    sub_file = None
    for ext in [".srt", ".vtt"]:
        for pattern in [f"{video_id}_raw.en{ext}", f"{video_id}_raw.en.*{ext}"]:
            matches = list(temp_dir.glob(pattern))
            if matches:
                sub_file = matches[0]
                break
        if sub_file:
            break

    has_subs = sub_file is not None and sub_file.exists()

    if skip_encode:
        # Just move the raw file
        shutil.move(str(temp_video), str(final_path))
        print(f"    [DONE] Saved (no re-encode): {final_path.name}")
        return final_path

    # ----------------------------------------------------------
    # Step 2: Re-encode with ffmpeg (H.265 + hardcoded subs)
    # ----------------------------------------------------------
    print(f"    [2/2] Encoding H.265{' + burning subtitles' if has_subs else ' (no subs available)'}...")

    ffmpeg_cmd = [
        FFMPEG_CMD,
        "-y",                         # Overwrite
        "-i", str(temp_video),        # Input video
    ]

    # Build video filter chain
    vf_filters = []

    if has_subs:
        # Escape backslashes and colons in the subtitle path for ffmpeg on Windows
        sub_path_escaped = str(sub_file).replace("\\", "/").replace(":", "\\:")
        vf_filters.append(
            f"subtitles='{sub_path_escaped}':force_style='FontSize=16,FontName=Arial,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2,Shadow=1'"
        )

    # Scale to 480p if source is larger (maintain aspect ratio)
    vf_filters.append("scale=-2:480:flags=lanczos")

    ffmpeg_cmd += [
        "-vf", ",".join(vf_filters),
        # H.265 encoding
        "-c:v", "libx265",
        "-preset", "medium",
        "-crf", "28",                 # Good quality/size balance for 480p
        "-tag:v", "hvc1",             # Compatibility tag for Apple devices
        # Audio: AAC 128k
        "-c:a", "aac",
        "-b:a", "128k",
        # Faststart for web streaming
        "-movflags", "+faststart",
        # No subtitle stream (they're burned in)
        "-sn",
        str(final_path),
    ]

    try:
        result = subprocess.run(
            ffmpeg_cmd,
            capture_output=True, text=True, timeout=600
        )
        if result.returncode != 0:
            # Show last part of stderr for debugging
            print(f"    [ERROR] ffmpeg failed:\n{result.stderr[-500:]}")
            # Fallback: try without subtitles
            if has_subs:
                print(f"    [RETRY] Retrying without subtitle burn-in...")
                return _encode_without_subs(temp_video, final_path)
            return None
    except subprocess.TimeoutExpired:
        print(f"    [ERROR] ffmpeg timed out after 10 minutes")
        return None

    # Cleanup temp files for this video
    for f in temp_dir.glob(f"{video_id}_raw*"):
        f.unlink(missing_ok=True)

    if final_path.exists():
        size_mb = final_path.stat().st_size / (1024 * 1024)
        print(f"    [DONE] {final_path.name} ({size_mb:.1f} MB)")
        return final_path
    else:
        print(f"    [ERROR] Output file not created")
        return None


def _encode_without_subs(temp_video: Path, final_path: Path) -> Path | None:
    """Fallback encoding without subtitle burn-in."""
    ffmpeg_cmd = [
        FFMPEG_CMD, "-y",
        "-i", str(temp_video),
        "-vf", "scale=-2:480:flags=lanczos",
        "-c:v", "libx265", "-preset", "medium", "-crf", "28",
        "-tag:v", "hvc1",
        "-c:a", "aac", "-b:a", "128k",
        "-movflags", "+faststart",
        "-sn",
        str(final_path),
    ]
    try:
        result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True, timeout=600)
        if result.returncode == 0 and final_path.exists():
            size_mb = final_path.stat().st_size / (1024 * 1024)
            print(f"    [DONE] {final_path.name} ({size_mb:.1f} MB) (no subs)")
            return final_path
    except Exception:
        pass
    return None


# ============================================
# MAIN
# ============================================

def main():
    parser = argparse.ArgumentParser(description="Download ClimaTales YouTube videos")
    parser.add_argument("--dry-run", action="store_true", help="List videos without downloading")
    parser.add_argument("--skip-encode", action="store_true", help="Download only, skip H.265 re-encode")
    parser.add_argument("--only", type=str, help="Download a single video by ID")
    parser.add_argument("--category", type=str, choices=VIDEO_CATEGORIES, help="Download only one category")
    args = parser.parse_args()

    print("=" * 60)
    print("  ClimaTales AR - YouTube Video Downloader")
    print("=" * 60)

    # Check deps
    print("\nChecking dependencies...")
    if not args.dry_run:
        check_dependencies()
    else:
        print("  (dry run - skipping dependency check)")

    # Collect videos
    print(f"\nScanning markdown files in {CONTENT_DIR}...")
    all_videos = get_all_videos()

    if not all_videos:
        print("[ERROR] No videos found in markdown files!")
        sys.exit(1)

    # Filter if requested
    if args.only:
        all_videos = [v for v in all_videos if v["video_id"] == args.only]
        if not all_videos:
            print(f"[ERROR] Video ID '{args.only}' not found in content files")
            sys.exit(1)

    if args.category:
        all_videos = [v for v in all_videos if v["category"] == args.category]

    # Print summary
    print(f"\nFound {len(all_videos)} videos:\n")
    for i, v in enumerate(all_videos, 1):
        status = "EXISTS" if (OUTPUT_DIR / v["category"] / f"{v['slug']}.mp4").exists() else "PENDING"
        print(f"  {i:2d}. [{v['category']:15s}] {v['title'][:45]:45s} [{status}]")

    if args.dry_run:
        print("\n[DRY RUN] No downloads performed.")
        return

    # Create directories
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    TEMP_DIR.mkdir(parents=True, exist_ok=True)

    # Download each video
    print(f"\nOutput directory: {OUTPUT_DIR}")
    print(f"Temp directory:   {TEMP_DIR}\n")

    success = 0
    failed = 0
    skipped = 0

    for i, video in enumerate(all_videos, 1):
        print(f"\n[{i}/{len(all_videos)}] {video['title']}")
        print(f"    URL: https://youtu.be/{video['video_id']}")
        print(f"    -> {video['category']}/{video['slug']}.mp4")

        result = download_video(video, TEMP_DIR, skip_encode=args.skip_encode)

        if result:
            if "SKIP" not in str(result):
                success += 1
            else:
                skipped += 1
        else:
            failed += 1

        # Small delay between downloads to be polite
        if i < len(all_videos):
            time.sleep(1)

    # Cleanup temp directory
    if TEMP_DIR.exists():
        shutil.rmtree(TEMP_DIR, ignore_errors=True)

    # Summary
    print("\n" + "=" * 60)
    print(f"  COMPLETE: {success} downloaded, {skipped} skipped, {failed} failed")
    print(f"  Output: {OUTPUT_DIR}")
    print("=" * 60)

    # Generate a manifest of downloaded videos
    manifest = []
    for v in all_videos:
        path = OUTPUT_DIR / v["category"] / f"{v['slug']}.mp4"
        if path.exists():
            manifest.append({
                "video_id": v["video_id"],
                "title": v["title"],
                "category": v["category"],
                "page": v["page"],
                "file": f"{v['category']}/{v['slug']}.mp4",
                "size_mb": round(path.stat().st_size / (1024 * 1024), 1),
            })

    if manifest:
        manifest_path = OUTPUT_DIR / "manifest.json"
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump({"videos": manifest, "total": len(manifest)}, f, indent=2)
        print(f"\n  Manifest written: {manifest_path}")


if __name__ == "__main__":
    main()
