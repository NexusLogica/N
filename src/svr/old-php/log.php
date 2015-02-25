<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" >

<head>
  <title>PlaySpace API Log</title>
  <script type="text/javascript">
    document.domain = "$DOMAIN";
  </script>
</head>
<body>
  <div style="margin-left:150px;" >
<?php
  require('config.php');
  require('utilities.php');

  $logText = "";

  if(file_exists($LOG_FILE_PATH)) {
    $handle = fopen($LOG_FILE_PATH, "r");
    if(filesize($LOG_FILE_PATH) > 0) {
      $logText = htmlentities(fread($handle, filesize($LOG_FILE_PATH)));
    }
    fclose($handle);
  }

  echo "<pre>$logText</pre>";
?>
  </div>
  <div style="position:absolute;top:10px;left:10px">
    <a href=<?php echo '"' . PsSetting('PSAPI_SERVER_BASE') . '/log.php"' ?> style="font-family:arial;font-size:12pt;color:black;">Refresh</a>
  </div>
  <div style="position:absolute;top:40px; left:10px;">
    <a href=<?php echo '"' . PsSetting('PSAPI_SERVER_BASE') . '/clearlog.php"' ?> style="font-family:arial;font-size:12pt;color:black;">Clear Log</a>
  </div>

</body>
</html>