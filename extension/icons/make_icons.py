"""Generate extension icons (16/32/48/128 px) as PNGs.

Design: a rounded square in a LinkedIn-blue vertical gradient, with a white
chat bubble and a small spark/star above it, suggesting AI-generated messages.

Run: python extension/icons/make_icons.py
"""

from pathlib import Path

from PIL import Image, ImageDraw

OUT_DIR = Path(__file__).parent
SIZES = (16, 32, 48, 128)

TOP_COLOR = (10, 102, 194)
BOTTOM_COLOR = (4, 64, 128)
WHITE = (255, 255, 255, 255)


def gradient_background(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    for y in range(size):
        t = y / max(size - 1, 1)
        r = round(TOP_COLOR[0] * (1 - t) + BOTTOM_COLOR[0] * t)
        g = round(TOP_COLOR[1] * (1 - t) + BOTTOM_COLOR[1] * t)
        b = round(TOP_COLOR[2] * (1 - t) + BOTTOM_COLOR[2] * t)
        ImageDraw.Draw(img).line([(0, y), (size, y)], fill=(r, g, b, 255))
    return img


def rounded_mask(size: int, radius_ratio: float = 0.22) -> Image.Image:
    radius = max(2, int(size * radius_ratio))
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, size - 1, size - 1), radius=radius, fill=255
    )
    return mask


def draw_chat_and_spark(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    bubble_w = int(size * 0.62)
    bubble_h = int(size * 0.46)
    bubble_x = (size - bubble_w) // 2
    bubble_y = int(size * 0.42)
    bubble_r = max(2, int(bubble_h * 0.32))

    draw.rounded_rectangle(
        (bubble_x, bubble_y, bubble_x + bubble_w, bubble_y + bubble_h),
        radius=bubble_r,
        fill=WHITE,
    )

    tail_w = max(2, int(size * 0.10))
    tail_h = max(2, int(size * 0.10))
    tail_x = bubble_x + int(bubble_w * 0.22)
    tail_y = bubble_y + bubble_h - 1
    draw.polygon(
        [
            (tail_x, tail_y),
            (tail_x + tail_w, tail_y),
            (tail_x + int(tail_w * 0.2), tail_y + tail_h),
        ],
        fill=WHITE,
    )

    if size >= 24:
        dot_y = bubble_y + bubble_h // 2
        dot_r = max(1, int(size * 0.035))
        cx = bubble_x + bubble_w // 2
        gap = int(bubble_w * 0.18)
        for offset in (-gap, 0, gap):
            draw.ellipse(
                (cx + offset - dot_r, dot_y - dot_r, cx + offset + dot_r, dot_y + dot_r),
                fill=TOP_COLOR + (255,),
            )

    spark_cx = bubble_x + bubble_w - int(size * 0.04)
    spark_cy = int(size * 0.30)
    arm = max(2, int(size * 0.11))
    thick = max(1, int(size * 0.05))

    draw.rectangle(
        (spark_cx - thick // 2, spark_cy - arm, spark_cx + (thick - thick // 2), spark_cy + arm),
        fill=WHITE,
    )
    draw.rectangle(
        (spark_cx - arm, spark_cy - thick // 2, spark_cx + arm, spark_cy + (thick - thick // 2)),
        fill=WHITE,
    )
    diag = max(1, int(arm * 0.55))
    thin = max(1, int(thick * 0.7))
    draw.rectangle(
        (spark_cx - diag, spark_cy - diag, spark_cx - diag + thin, spark_cy + diag),
        fill=WHITE,
    )

    return img


def render(size: int) -> Image.Image:
    scale = 4 if size <= 48 else 2
    big = size * scale
    bg = gradient_background(big)
    mask = rounded_mask(big)
    bg.putalpha(mask)
    overlay = draw_chat_and_spark(big)
    bg.alpha_composite(overlay)
    return bg.resize((size, size), Image.LANCZOS)


def main() -> None:
    for s in SIZES:
        out = OUT_DIR / f"icon{s}.png"
        render(s).save(out, "PNG")
        print(f"wrote {out} ({s}x{s})")


if __name__ == "__main__":
    main()
