from PIL import Image, ImageDraw, ImageFont
import os

w,h=400,120
img=Image.new('RGBA',(w,h),(255,255,255,0))
d=ImageDraw.Draw(img)
try:
    f=ImageFont.truetype('arial.ttf',36)
except:
    f=ImageFont.load_default()
d.text((10,40),'ChikitsakAI',(0,0,0),font=f)
img.save('resized_logo.png')
print('created',os.path.getsize('resized_logo.png'))
