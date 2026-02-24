from PIL import Image
import os

# Chart info
CHART_PATH = 'assets/dog_breed_chart.png'
OUTPUT_DIR = 'assets/breeds'
COLUMNS = 6
ROWS = 5
BREED_ORDER = [
    'labrador', 'golden', 'german', 'beagle', 'pug', 'yorkie',
    'corgi', 'dachshund', 'shihtzu', 'pomeranian', 'frenchie', 'husky',
    'chihuahua', 'collie', 'boxer', 'dalmatian', 'aussie', 'maltese',
    'shiba', 'cavalier', 'rottweiler', 'schnauzer', 'bichon', 'boston',
    'sheltie', 'doberman', 'cocker', 'pitbull', 'dane', 'poodle',
    'chow', 'bernese', 'jack'
]

os.makedirs(OUTPUT_DIR, exist_ok=True)

im = Image.open(CHART_PATH)
width, height = im.size
cell_w = width // COLUMNS
cell_h = height // ROWS

for idx, breed in enumerate(BREED_ORDER):
    row = idx // COLUMNS
    col = idx % COLUMNS
    left = col * cell_w
    upper = row * cell_h
    right = left + cell_w
    lower = upper + cell_h
    crop = im.crop((left, upper, right, lower))
    crop.save(os.path.join(OUTPUT_DIR, f'{breed}.png'))
print('Done cropping!')
