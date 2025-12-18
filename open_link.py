OVERRIDE_LINK_MATCH_ON_SELECT = False

import sys, re, webbrowser

URL_PATTERN = r'[a-zA-Z0-9\-]+\:\/\/[^\s]+\.[^\s]+'
# This pattern will match many non-legal URLs.
# This is by design to ensure non-punycode encoded URLs,
# string escaped URLs and other encoded URLs are captured correctly.

lines = sys.stdin.read().splitlines()

# Handle selected URLs
if OVERRIDE_LINK_MATCH_ON_SELECT and len(sys.argv) == 7:
  start_row, start_column, end_row, end_column = map(int, sys.argv[-4:])
  if start_row != end_row:
    sys.exit()
  line = lines[start_row]
  url = line[min(start_column, end_column) : max(start_column, end_column)].strip()
  if re.match(URL_PATTERN, url):
    webbrowser.open(url)

# Handle unselected URLs
else:
  row, column = map(int, sys.argv[1:3])
  line = lines[row]
  for match in re.finditer(URL_PATTERN, line):
    start, end = match.span()
    if column >= start and column <= end:
      url = match.group(0)

      if start > 0:
        char_before = line[start-1]
        bracket_pairs = {'>':'<', '<':'>', ']':'[', '[':']'}

        # Remove trailing parenthesis from URLs in parenthesis
        if char_before == '(':
          depth = 0
          for i, c in enumerate(url):
            if c == '(':
              depth += 1
            elif c == ')':
              if depth == 0:
                url = url[:i]
                break
              else:
                depth -= 1

        # Remove trailing quote from quoted URLs and unescape the URL if it's string escaped
        elif char_before in ("'", '"'):
          for i, c in enumerate(url):
            if c == char_before and url[i-2:i] != '\\\\':
              url =  (url[:i] if hasattr(url, 'decode') else bytes(url[:i], 'utf8')).decode('unicode_escape')
              break

        # Remove the trailing bracket from URLs enclosed in one of the bracket pairs
        elif char_before in bracket_pairs.keys():
          try:
            url = url[:url.index(bracket_pairs[char_before])]
          except IndexError:
            pass

      webbrowser.open(url)
      break
