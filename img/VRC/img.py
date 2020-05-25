import glob

files = glob.glob("*.jpg")

newfiles = ['<img src="../img/VRC/'+file+'">' for file in files]

with open('img.txt', 'w') as f:
	for d in newfiles:
		f.write("%s\n" % d)