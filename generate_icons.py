#!/usr/bin/env python3
"""
Generate icons for WhatsApp Contact Exporter Chrome Extension
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
except ImportError:
    print("PIL (Pillow) is not installed.")
    print("Install it with: pip install Pillow")
    exit(1)

def create_icon(size, filename):
    """Create an icon with gradient background and WhatsApp-style design"""
    
    # Create image with transparent background
    img = Image.new('RGB', (size, size), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw gradient background (simplified as two-color)
    for y in range(size):
        # Interpolate between two colors
        ratio = y / size
        r = int(102 + (118 - 102) * ratio)
        g = int(126 + (75 - 126) * ratio)
        b = int(234 + (162 - 234) * ratio)
        draw.line([(0, y), (size, y)], fill=(r, g, b))
    
    # Draw circular background for icon
    circle_radius = int(size * 0.35)
    circle_center = (size // 2, size // 2)
    draw.ellipse(
        [circle_center[0] - circle_radius, circle_center[1] - circle_radius,
         circle_center[0] + circle_radius, circle_center[1] + circle_radius],
        fill=(118, 75, 162)
    )
    
    # Draw phone/contact icon elements
    icon_size = int(size * 0.25)
    center_x, center_y = size // 2, size // 2
    
    # Draw simple contact/phone representation
    # Head (circle)
    head_radius = int(icon_size * 0.3)
    draw.ellipse(
        [center_x - head_radius, center_y - icon_size // 2 - head_radius,
         center_x + head_radius, center_y - icon_size // 2 + head_radius],
        fill='white'
    )
    
    # Body (rounded rectangle)
    body_width = int(icon_size * 0.6)
    body_height = int(icon_size * 0.5)
    body_top = center_y - icon_size // 2 + head_radius + 2
    draw.ellipse(
        [center_x - body_width // 2, body_top,
         center_x + body_width // 2, body_top + body_height],
        fill='white'
    )
    
    # Add "WA" text for larger icons
    if size >= 48:
        try:
            font_size = int(size * 0.15)
            # Try different font paths
            font_paths = [
                "/System/Library/Fonts/Helvetica.ttc",
                "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
                "/System/Library/Fonts/Supplemental/Arial.ttf"
            ]
            font = None
            for font_path in font_paths:
                try:
                    if os.path.exists(font_path):
                        font = ImageFont.truetype(font_path, font_size)
                        break
                except:
                    continue
            
            if font:
                text = "WA"
                # Get text bounding box
                try:
                    bbox = draw.textbbox((0, 0), text, font=font)
                    text_width = bbox[2] - bbox[0]
                    text_height = bbox[3] - bbox[1]
                    text_x = (size - text_width) // 2
                    text_y = size - int(size * 0.22)
                    draw.text((text_x, text_y), text, fill='white', font=font)
                except:
                    pass
        except Exception as e:
            # Skip text if there's any font issue
            pass
    
    # Save the image
    img.save(filename, 'PNG')
    print(f"✓ Generated {filename} ({size}x{size})")

def main():
    # Create icons directory if it doesn't exist
    os.makedirs('icons', exist_ok=True)
    
    print("Generating WhatsApp Contact Exporter icons...\n")
    
    # Generate all three required sizes
    create_icon(16, 'icons/icon16.png')
    create_icon(48, 'icons/icon48.png')
    create_icon(128, 'icons/icon128.png')
    
    print("\n✓ All icons generated successfully!")
    print("\nIcons saved in the 'icons' folder:")
    print("  - icons/icon16.png")
    print("  - icons/icon48.png")
    print("  - icons/icon128.png")
    print("\nYou can now load the extension in Chrome!")

if __name__ == '__main__':
    main()
