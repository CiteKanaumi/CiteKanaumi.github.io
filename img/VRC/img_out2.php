<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>画像をある分だけ表示する</title>
  </head>
  <body>
    <?php
      $count = 0;
      $files = count(glob("*.jpg"));
      echo "<p>while文</p>";
      while ($count <= $files) {
        echo "<img src='$count.jpg' alt='' />";
        echo "<br>";
        $count++ ;
      }
    ?>
  </body>
</html>
