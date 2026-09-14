import zlib
import struct
import math
import os

def create_png(width, height, draw_pixel):
    # PNG signature
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # Filter type 0 (None)
        for x in range(width):
            r, g, b, a = draw_pixel(x, y, width, height)
            raw_data.extend([r, g, b, a])
    
    def chunk(chunk_type, data):
        c = chunk_type + data
        crc = zlib.crc32(c) & 0xffffffff
        return struct.pack('>I', len(data)) + c + struct.pack('>I', crc)

    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    idat_data = zlib.compress(bytes(raw_data), 9)
    
    png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr_data) + chunk(b'IDAT', idat_data) + chunk(b'IEND', b'')
    return png

def flag_pixel(x, y, w, h):
    # German flag colors with rounded corners
    # Black: #111827 (17, 24, 39)
    # Red:   #DC2626 (220, 38, 38)
    # Gold:  #FBBF24 (251, 191, 36)
    
    # Check rounded rectangle
    radius = w * 0.22
    # corner distances
    cx = radius if x < radius else (w - 1 - radius if x >= w - radius else x)
    cy = radius if y < radius else (h - 1 - radius if y >= h - radius else y)
    dx = x - cx
    dy = y - cy
    dist_sq = dx*dx + dy*dy
    if dist_sq > radius*radius:
        # Check antialiasing at boundary
        dist = math.sqrt(dist_sq)
        if dist > radius + 1.0:
            return 0, 0, 0, 0
        alpha = max(0.0, min(1.0, radius + 1.0 - dist))
    else:
        alpha = 1.0

    # Determine stripe
    stripe_height = h / 3.0
    if y < stripe_height:
        r, g, b = 17, 24, 39      # Black stripe
    elif y < stripe_height * 2:
        r, g, b = 220, 38, 38     # Red stripe
    else:
        r, g, b = 251, 191, 36    # Gold stripe

    # Subtle border shading around the edges
    if x == 0 or x == w - 1 or y == 0 or y == h - 1:
        r = int(r * 0.85)
        g = int(g * 0.85)
        b = int(b * 0.85)

    return r, g, b, int(alpha * 255)

def app_icon_pixel(x, y, w, h):
    # Full bleed opaque app icon for iOS Apple Touch Icon and Android PWA launcher
    stripe_height = h / 3.0
    if y < stripe_height:
        br, bg, bb = 17, 24, 39      # Black stripe
    elif y < stripe_height * 2:
        br, bg, bb = 220, 38, 38     # Red stripe
    else:
        br, bg, bb = 251, 191, 36    # Gold stripe

    nx = (x - w / 2.0) / (w / 2.0)
    ny = (y - h / 2.0) / (h / 2.0)
    dist = math.sqrt(nx*nx + ny*ny)
    
    radius = 0.52
    if dist < radius:
        edge_alpha = max(0.0, min(1.0, (radius - dist) * w * 0.5))
        cr, cg, cb = 15, 23, 42
        
        in_book = False
        if -0.32 <= nx <= -0.04 and -0.22 <= ny <= 0.22:
            curve = 0.05 * math.cos((nx + 0.18) * 10)
            if abs(ny - curve) < 0.20:
                in_book = True
        elif 0.04 <= nx <= 0.32 and -0.22 <= ny <= 0.22:
            curve = 0.05 * math.cos((nx - 0.18) * 10)
            if abs(ny - curve) < 0.20:
                in_book = True
                
        pr, pg, pb = (255, 255, 255) if in_book else (cr, cg, cb)
        r = int(br * (1 - edge_alpha) + pr * edge_alpha)
        g = int(bg * (1 - edge_alpha) + pg * edge_alpha)
        b = int(bb * (1 - edge_alpha) + pb * edge_alpha)
        return r, g, b, 255
        
    return br, bg, bb, 255

def create_ico(png_data, width, height):
    header = struct.pack('<HHH', 0, 1, 1)
    w_byte = width if width < 256 else 0
    h_byte = height if height < 256 else 0
    size = len(png_data)
    offset = 6 + 16
    entry = struct.pack('<BBBBHHII', w_byte, h_byte, 0, 0, 1, 32, size, offset)
    return header + entry + png_data

def main():
    public_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public')
    os.makedirs(public_dir, exist_ok=True)
    
    png_32 = create_png(32, 32, flag_pixel)
    with open(os.path.join(public_dir, 'favicon-32x32.png'), 'wb') as f:
        f.write(png_32)
        
    png_16 = create_png(16, 16, flag_pixel)
    with open(os.path.join(public_dir, 'favicon-16x16.png'), 'wb') as f:
        f.write(png_16)
        
    png_180 = create_png(180, 180, app_icon_pixel)
    with open(os.path.join(public_dir, 'apple-touch-icon.png'), 'wb') as f:
        f.write(png_180)
    with open(os.path.join(public_dir, 'apple-touch-icon-180x180.png'), 'wb') as f:
        f.write(png_180)
    with open(os.path.join(public_dir, 'apple-touch-icon-precomposed.png'), 'wb') as f:
        f.write(png_180)

    png_152 = create_png(152, 152, app_icon_pixel)
    with open(os.path.join(public_dir, 'apple-touch-icon-152x152.png'), 'wb') as f:
        f.write(png_152)

    png_120 = create_png(120, 120, app_icon_pixel)
    with open(os.path.join(public_dir, 'apple-touch-icon-120x120.png'), 'wb') as f:
        f.write(png_120)

    png_192 = create_png(192, 192, app_icon_pixel)
    with open(os.path.join(public_dir, 'icon-192.png'), 'wb') as f:
        f.write(png_192)

    png_512 = create_png(512, 512, app_icon_pixel)
    with open(os.path.join(public_dir, 'icon-512.png'), 'wb') as f:
        f.write(png_512)
        
    ico = create_ico(png_32, 32, 32)
    with open(os.path.join(public_dir, 'favicon.ico'), 'wb') as f:
        f.write(ico)

    print("Successfully generated all favicon and PWA assets in public/")

if __name__ == '__main__':
    main()
