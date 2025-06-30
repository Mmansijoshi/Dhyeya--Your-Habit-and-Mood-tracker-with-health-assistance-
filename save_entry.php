<?php
$conn = new mysqli('localhost', 'root', '', 'diary');
if ($conn->connect_error) die("Connection failed");

$day = $_POST['day'];
$content = $_POST['content'];

$stmt = $conn->prepare("REPLACE INTO entries (day, content) VALUES (?, ?)");
$stmt->bind_param("ss", $day, $content);
$stmt->execute();
$stmt->close();
$conn->close();
?>
