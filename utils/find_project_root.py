from pathlib import Path

# 找根目錄
def find_project_root(current_path, marker=".git"):
    current_path = Path(current_path).resolve()
    for parent in current_path.parents:
        if (parent / marker).exists():
            return parent
    return None