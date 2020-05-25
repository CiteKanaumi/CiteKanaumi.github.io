from PIL import Image
import re
import glob

files = glob.glob("./img/*.png")
files = [re.sub(r'\\', '/', file) for file in files]

for file in files:
        input_im = Image.open(file)
        rgb_im = input_im.convert('RGB')
        rgb_im.save(re.sub('.png', '', file) + ".jpg",quality=90)
