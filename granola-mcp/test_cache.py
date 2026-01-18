"""Test script to validate Granola cache file access."""

import json
import os
import sys
from pathlib import Path
import platform


def find_granola_cache():
    """Find the Granola cache file on the system."""
    system = platform.system()

    potential_paths = []

    if system == "Windows":
        # Windows paths
        appdata = os.getenv("APPDATA")
        localappdata = os.getenv("LOCALAPPDATA")

        if appdata:
            potential_paths.append(os.path.join(appdata, "Granola", "cache-v3.json"))
        if localappdata:
            potential_paths.append(os.path.join(localappdata, "Granola", "cache-v3.json"))

        # Fallback
        potential_paths.append(os.path.join(os.path.expanduser("~"), "AppData", "Roaming", "Granola", "cache-v3.json"))
        potential_paths.append(os.path.join(os.path.expanduser("~"), "AppData", "Local", "Granola", "cache-v3.json"))

    elif system == "Darwin":  # macOS
        potential_paths.append(os.path.expanduser("~/Library/Application Support/Granola/cache-v3.json"))

    else:  # Linux
        potential_paths.append(os.path.expanduser("~/.local/share/Granola/cache-v3.json"))
        potential_paths.append(os.path.expanduser("~/.config/Granola/cache-v3.json"))

    # Check which paths exist
    found_paths = [p for p in potential_paths if os.path.exists(p)]

    return found_paths


def test_cache_file(cache_path):
    """Test if a cache file can be loaded and parsed."""
    try:
        print(f"\n{'='*60}")
        print(f"Testing cache file: {cache_path}")
        print(f"{'='*60}\n")

        # Check if file exists
        if not os.path.exists(cache_path):
            print(f"❌ File not found: {cache_path}")
            return False

        print(f"✅ File exists")

        # Check file size
        file_size = os.path.getsize(cache_path)
        print(f"✅ File size: {file_size:,} bytes ({file_size / 1024 / 1024:.2f} MB)")

        # Try to read the file
        try:
            with open(cache_path, 'r', encoding='utf-8') as f:
                raw_data = json.load(f)
            print(f"✅ File is valid JSON")
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON: {e}")
            return False
        except Exception as e:
            print(f"❌ Error reading file: {e}")
            return False

        # Check for nested cache structure
        if 'cache' in raw_data and isinstance(raw_data['cache'], str):
            print(f"✅ Found nested cache structure")
            try:
                actual_data = json.loads(raw_data['cache'])
                if 'state' in actual_data:
                    raw_data = actual_data['state']
                else:
                    raw_data = actual_data
                print(f"✅ Parsed nested cache")
            except Exception as e:
                print(f"⚠️  Could not parse nested cache: {e}")

        # Analyze contents
        print(f"\n📊 Cache Contents:")

        # Check for documents (meetings)
        if "documents" in raw_data:
            num_meetings = len(raw_data["documents"])
            print(f"  ✅ Meetings (documents): {num_meetings}")

            if num_meetings > 0:
                # Show sample meeting
                sample_id = list(raw_data["documents"].keys())[0]
                sample_meeting = raw_data["documents"][sample_id]
                print(f"\n  📄 Sample Meeting:")
                print(f"     Title: {sample_meeting.get('title', 'N/A')}")
                print(f"     Type: {sample_meeting.get('type', 'N/A')}")
                print(f"     Created: {sample_meeting.get('created_at', 'N/A')}")

                if 'people' in sample_meeting:
                    people = [p.get('name', 'Unknown') for p in sample_meeting.get('people', [])]
                    print(f"     Participants: {', '.join(people) if people else 'None'}")
        else:
            print(f"  ⚠️  No meetings found")

        # Check for transcripts
        if "transcripts" in raw_data:
            num_transcripts = len(raw_data["transcripts"])
            print(f"  ✅ Transcripts: {num_transcripts}")

            if num_transcripts > 0:
                # Show sample transcript
                sample_id = list(raw_data["transcripts"].keys())[0]
                sample_transcript = raw_data["transcripts"][sample_id]
                if isinstance(sample_transcript, list) and len(sample_transcript) > 0:
                    print(f"\n  📝 Sample Transcript Segment:")
                    first_segment = sample_transcript[0]
                    if isinstance(first_segment, dict):
                        print(f"     Text: {first_segment.get('text', 'N/A')[:100]}...")
                        print(f"     Source: {first_segment.get('source', 'N/A')}")
        else:
            print(f"  ⚠️  No transcripts found")

        # Check for document panels
        if "documentPanels" in raw_data:
            num_panels = len(raw_data["documentPanels"])
            print(f"  ✅ Document Panels: {num_panels}")
        else:
            print(f"  ⚠️  No document panels found")

        print(f"\n{'='*60}")
        print(f"✅ Cache file is valid and can be parsed!")
        print(f"{'='*60}\n")

        return True

    except Exception as e:
        print(f"\n❌ Error testing cache file: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Main test function."""
    print("\n🔍 Granola Cache Finder and Validator")
    print(f"Platform: {platform.system()}")
    print(f"Python: {sys.version}")

    # Check for environment variable
    env_cache_path = os.getenv("GRANOLA_CACHE_PATH")
    if env_cache_path:
        print(f"\n📌 Found GRANOLA_CACHE_PATH environment variable: {env_cache_path}")
        test_cache_file(env_cache_path)
        return

    # Search for cache files
    print("\n🔎 Searching for Granola cache files...")
    found_paths = find_granola_cache()

    if not found_paths:
        print("\n❌ No Granola cache files found!")
        print("\nTried the following locations:")

        system = platform.system()
        if system == "Windows":
            print("  - %APPDATA%\\Granola\\cache-v3.json")
            print("  - %LOCALAPPDATA%\\Granola\\cache-v3.json")
        elif system == "Darwin":
            print("  - ~/Library/Application Support/Granola/cache-v3.json")
        else:
            print("  - ~/.local/share/Granola/cache-v3.json")
            print("  - ~/.config/Granola/cache-v3.json")

        print("\n💡 Tips:")
        print("  1. Make sure Granola.ai is installed")
        print("  2. Make sure you have recorded at least one meeting")
        print("  3. Search for 'cache-v3.json' on your system")
        print("  4. Set GRANOLA_CACHE_PATH environment variable if in a custom location")
        return

    # Test each found path
    print(f"\n✅ Found {len(found_paths)} cache file(s):\n")
    for i, path in enumerate(found_paths, 1):
        print(f"{i}. {path}")

    # Test the first (most likely) path
    test_cache_file(found_paths[0])

    # If multiple paths, test others too
    if len(found_paths) > 1:
        print("\n💡 Multiple cache files found. Testing others...\n")
        for path in found_paths[1:]:
            test_cache_file(path)


if __name__ == "__main__":
    main()
