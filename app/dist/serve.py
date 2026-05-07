"""Minimal static file server with correct MIME types for the Anexo C app."""
import http.server, mimetypes, sys

mimetypes.add_type('application/wasm',  '.wasm')
mimetypes.add_type('text/javascript',   '.js')
mimetypes.add_type('text/xml',          '.xsd')
mimetypes.add_type('text/xml',          '.xml')

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
handler = http.server.SimpleHTTPRequestHandler
httpd = http.server.HTTPServer(('', port), handler)
print(f'Anexo C Editor — http://localhost:{port}')
print('Prima Ctrl+C para parar.')
try:
    httpd.serve_forever()
except KeyboardInterrupt:
    pass
