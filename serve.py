# 本地预览服务器：python3 serve.py  →  http://localhost:8811
import functools, http.server, socketserver, os
ROOT = os.path.dirname(os.path.abspath(__file__))
H = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", 8811), H) as s:
    print("serving", ROOT, "on http://localhost:8811")
    s.serve_forever()
