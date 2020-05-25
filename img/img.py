import glob
import re

files = glob.glob("./img/vrc/*.jpg")


h_f = """

---\n
layout: default
---\n
<div class="well">
    {% if page.subtitle %}
    <h4 class="home-subtitle">{{ page.subtitle }}</h4>
    {% endif %}
    <div>
    	{{ content }}
        
        
        
  <head>
    <link rel="stylesheet" href="../css/grid-gallery.min.css">
  </head>

  <body>

    <div class="content">
      <div class="gg-container">
        <div class="gg-box dark" id="square">



"""

h_b = """

        </div>
      </div>
    </div>

    <script src="../js/grid-gallery.min.js"></script>
    <script>
    gridGallery({
      selector: "#square",
      layout: "square"
    });
    </script>

  </body>

        
        
        
        
        
        
        
        
        
        
        
    </div>
</div>

"""




newfiles2 = ['<img src=".'+file+'">' for file in files]

newfiles = [re.sub(r'\\', '/', file) for file in newfiles2]


with open('./_layouts/vrchat.html', 'w') as f:


	f.write(h_f)


	for d in newfiles:
		f.write("%s\n" % d)


	f.write(h_b)
