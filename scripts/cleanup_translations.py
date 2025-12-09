
import os
import re

directory = r'e:\EXPO Training\taste-the-world\constants\translations'

def cleanup_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split by the specific comment that marks our new block
    # We look for the exact comment we added: "  // Premium Benefits"
    parts = content.split("  // Premium Benefits")

    if len(parts) > 2:
        print(f"Fixing duplicates in {os.path.basename(filepath)}")
        # Keep the first part (original content) and the second part (first premium block)
        # discard subsequent parts which are duplicates
        
        # We need to make sure the first premium block is properly closed
        # The split removes the separator, so we need to add it back to the second part (the first premium block)
        
        base_content = parts[0]
        # The first premium block text (which includes the keys)
        premium_block = "  // Premium Benefits" + parts[1]
        
        # Now we need to ensure the file ends correctly.
        # The premium block we added ended with "};" (newline)
        
        # Let's clean up the premium block to ensure it's just the keys and closing brace
        # We know exactly what we added.
        
        # simpler approach: just find the index of the second occurrence and slice
        first_occurrence = content.find("  // Premium Benefits")
        second_occurrence = content.find("  // Premium Benefits", first_occurrence + 1)
        
        if second_occurrence != -1:
             new_content = content[:second_occurrence].rstrip()
             # Verify it ends with }; or just }
             if not new_content.strip().endswith('};'):
                 # It probably ends with a comma if we just sliced it
                 if new_content.strip().endswith(','):
                      new_content = new_content.rstrip().rstrip(',') + "\n};"
                 elif new_content.strip().endswith('}'):
                      new_content = new_content.rstrip() + ";"
                 else:
                      new_content += "\n};"
             
             with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
             return True
    return False

for filename in os.listdir(directory):
    if filename.endswith(".ts") and filename != "en.ts":
        cleanup_file(os.path.join(directory, filename))
