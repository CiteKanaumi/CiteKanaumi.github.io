<?php 

if ($handle = opendir('')) { 

   /* This is the correct way to loop over the directory. */ 

   while (false !== ($entry = readdir($handle))) { 

      if ($entry != '.' && $entry != '..'){ 

         if(strchr($entry, ".jpg") == true){ //$entry변수에 .jpg라는 문자가 있는지 확인 

            echo "<br /><div>파일명 : $entry</div><br />"; 

            echo "<div><img src='./$entry' /></div>"; 

         } 

      } 

   } 

   closedir($handle); 

} 

?> 

