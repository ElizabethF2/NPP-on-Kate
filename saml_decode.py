import sys, base64, zlib, xml.dom.minidom

try:
  import urllib.parse
  unquote = urllib.parse.unquote
except ImportError:
  import urllib
  unquote = urllib.unquote

saml = sys.stdin.read()
saml = unquote(saml)
saml = base64.b64decode(saml)
saml = zlib.decompress(saml, -15)
saml = xml.dom.minidom.parseString(saml)
saml = saml.toprettyxml()
sys.stdout.write(saml)
sys.stdout.flush()
