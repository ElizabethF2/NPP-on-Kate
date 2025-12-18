# Mark a sync as due if a syncable path is modified in Kate
# Set as an external tool in Kate with these settings:
#
# Name: Mark Sync Due on Save
# Arguments: "/home/Liz/OneDrive/Projects/NPP on Kate/save_hook.py" "%{Document:FilePath}"
# Mime types: see script below
# Trigger: After Save
# Output: Display in Pane

# Generated mime types via:
#   python -c "import glob;print(';'.join((i[16:-4] for i in glob.glob('/usr/share/mime/*/*.xml'))))"

import sys, subprocess
file_that_was_just_saved = sys.argv[1]
subprocess.check_call(('prbsync', 'mark', file_that_was_just_saved))
