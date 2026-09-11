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

def create_ico(png_data, width, height):
    # Standard ICO containing embedded PNG (supported by all modern browsers/OS)
    header = struct.pack('<HHH', 0, 1, 1) # reserved, type (1=ico), count (1)
    w_byte = width if width < 256 else 0
    h_byte = height if height < 256 else 0
    size = len(png_data)
    offset = 6 + 16 # header(6) + 1 directory entry(16) = 22
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
        
    png_180 = create_png(180, 180, flag_pixel)
    with open(os.path.join(public_dir, 'apple-touch-icon.png'), 'wb') as f:
        f.write(png_180)
        
    ico = create_ico(png_32, 32, 32)
    with open(os.path.join(public_dir, 'favicon.ico'), 'wb') as f:
        f.write(ico)

    print("Successfully generated all favicon assets in public/")

if __name__ == '__main__':
    main()
