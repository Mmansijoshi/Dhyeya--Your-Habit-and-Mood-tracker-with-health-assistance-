<?php
$conn = new mysqli('localhost', 'root', '', 'diary');
if ($conn->connect_error) die("Connection failed");

$day = $_GET['day'];
$stmt = $conn->prepare("SELECT content FROM entries WHERE day = ?");
$stmt->bind_param("s", $day);
$stmt->execute();
$stmt->bind_result($content);
$stmt->fetch();
echo $content;
$stmt->close();
$conn->close();
?>
